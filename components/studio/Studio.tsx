"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { Package, X, BarChart3 } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { kindForConcept, KIND_META, EDGE_META, EDGE_KIND_ORDER, type NodeKind, type EdgeKind } from "@/lib/studioTypes";
import { reviewDesign, DEFAULT_TARGET, type ReviewNode, type ReviewEdge } from "@/lib/studioReview";
import type { Requirements } from "@/lib/reasoning/requirements";
import { StudioPalette } from "./StudioPalette";
import { StudioCanvas } from "./StudioCanvas";
import { StudioAnalysis } from "./StudioAnalysis";

const accentForConcept = (id?: string): string => {
  const c = id ? getConcept(id) : undefined;
  return c ? CATEGORIES[c.category].accent : "#818cf8";
};
const dataOf = (n?: Node) => (n?.data ?? {}) as { conceptId?: string; kind?: NodeKind; label?: string };

function reviewNodeOf(n: Node): ReviewNode {
  const d = dataOf(n);
  const concept = d.conceptId ? getConcept(d.conceptId) : undefined;
  const kind = d.kind ?? (d.conceptId ? kindForConcept(d.conceptId) : "other");
  return { id: n.id, kind, label: d.label ?? concept?.name ?? KIND_META[kind].label, conceptId: d.conceptId };
}

/** A deliberately decent reference design users can load and then critique. */
function makeExample(): { nodes: Node[]; edges: Edge[] } {
  const layout: [string, number, number][] = [
    ["cdn", 60, 30],
    ["client", 330, 10],
    ["load-balancer", 330, 165],
    ["api-gateway", 330, 320],
    ["services", 330, 475],
    ["cache", 60, 475],
    ["database", 330, 630],
    ["read-replica", 60, 630],
    ["observability", 600, 320],
  ];
  const nodes: Node[] = layout.map(([cid, x, y]) => ({
    id: `${cid}-ex`,
    type: "concept",
    position: { x, y },
    data: { conceptId: cid, kind: kindForConcept(cid), label: getConcept(cid)?.name ?? cid },
  }));

  const wires: [string, string, string, string, EdgeKind?][] = [
    ["client", "load-balancer", "sb", "tt", "sync"],
    ["cdn", "load-balancer", "sr", "tl", "sync"],
    ["load-balancer", "api-gateway", "sb", "tt", "sync"],
    ["api-gateway", "services", "sb", "tt", "sync"],
    ["services", "cache", "sl", "tr", "cache-aside"],
    ["services", "database", "sb", "tt", "sync"],
    ["database", "read-replica", "sl", "tr", "replication"],
    ["observability", "services", "sl", "tr", "async"],
  ];
  const edges: Edge[] = wires.map(([s, t, sh, th, kind = "sync"]) => ({
    id: `${s}-${t}-ex`,
    source: `${s}-ex`,
    target: `${t}-ex`,
    sourceHandle: sh,
    targetHandle: th,
    type: "flow",
    data: { accent: accentForConcept(s), animated: true, dashed: EDGE_META[kind].dashed, edgeKind: kind, label: EDGE_META[kind].label },
  }));
  return { nodes, edges };
}

/** Which simulator solutions a design implies, for the Build→Simulate bridge. */
function solutionsFor(rnodes: ReviewNode[], redges: ReviewEdge[]): string[] {
  const kinds = new Set(rnodes.map((n) => n.kind));
  const stores = rnodes.filter((n) => n.kind === "datastore").length;
  const replication = redges.some((e) => e.kind === "replication");
  const sols: string[] = [];
  if (kinds.has("proxy")) sols.push("loadbalancer");
  if (kinds.has("edge")) sols.push("cdn");
  if (kinds.has("cache")) sols.push("cache");
  if (stores >= 2 || replication) sols.push("replicas");
  if (kinds.has("queue")) sols.push("queue");
  if (rnodes.some((n) => n.conceptId === "sharding") || stores >= 3) sols.push("sharding");
  return sols;
}

export function Studio() {
  const nodes = useUniverse((s) => s.studioNodes);
  const edges = useUniverse((s) => s.studioEdges);
  const setNodes = useUniverse((s) => s.setStudioNodes);
  const setEdges = useUniverse((s) => s.setStudioEdges);
  const clear = useUniverse((s) => s.clearStudio);
  const stressTestDesign = useUniverse((s) => s.stressTestDesign);

  const [target, setTarget] = useState<Requirements>(DEFAULT_TARGET);

  const onNodesChange = useCallback((c: NodeChange[]) => setNodes((ns) => applyNodeChanges(c, ns)), [setNodes]);
  const onEdgesChange = useCallback((c: EdgeChange[]) => setEdges((es) => applyEdgeChanges(c, es)), [setEdges]);
  const onConnect = useCallback(
    (conn: Connection) =>
      setEdges((es) =>
        addEdge(
          { ...conn, type: "flow", data: { accent: accentForConcept(dataOf(nodes.find((n) => n.id === conn.source)).conceptId), animated: true, edgeKind: "sync", dashed: false, label: "" } },
          es,
        ),
      ),
    [setEdges, nodes],
  );

  // Click an edge to cycle its semantic type (sync → async → replication → …).
  const onEdgeClick = useCallback(
    (_e: React.MouseEvent, edge: Edge) =>
      setEdges((es) =>
        es.map((x) => {
          if (x.id !== edge.id) return x;
          const cur = ((x.data as { edgeKind?: EdgeKind })?.edgeKind) ?? "sync";
          const next = EDGE_KIND_ORDER[(EDGE_KIND_ORDER.indexOf(cur) + 1) % EDGE_KIND_ORDER.length];
          return { ...x, data: { ...x.data, edgeKind: next, dashed: EDGE_META[next].dashed, label: EDGE_META[next].label } };
        }),
      ),
    [setEdges],
  );

  const addComponent = useCallback(
    (conceptId: string) =>
      setNodes((ns) => {
        const i = ns.length;
        const id = `${conceptId}-${Math.random().toString(36).slice(2, 7)}`;
        return [...ns, { id, type: "concept", position: { x: 90 + (i % 3) * 215, y: 70 + Math.floor(i / 3) * 155 }, data: { conceptId, kind: kindForConcept(conceptId), label: getConcept(conceptId)?.name ?? conceptId } }];
      }),
    [setNodes],
  );

  const addCustom = useCallback(
    (kind: NodeKind) =>
      setNodes((ns) => {
        const i = ns.length;
        const id = `${kind}-${Math.random().toString(36).slice(2, 7)}`;
        const base: Node = { id, type: "custom", position: { x: 110 + (i % 3) * 200, y: 80 + Math.floor(i / 3) * 150 }, data: { kind, label: KIND_META[kind].label } };
        if (kind === "boundary") {
          base.position = { x: 40, y: 40 };
          base.style = { width: 360, height: 240 };
          base.zIndex = 0;
        }
        return [...ns, base];
      }),
    [setNodes],
  );

  const loadExample = useCallback(() => {
    const { nodes: n, edges: e } = makeExample();
    setNodes(n);
    setEdges(e);
  }, [setNodes, setEdges]);

  const reviewNodes = useMemo<ReviewNode[]>(() => nodes.map(reviewNodeOf), [nodes]);
  const reviewEdges = useMemo<ReviewEdge[]>(
    () => edges.map((e) => ({ source: e.source, target: e.target, kind: ((e.data as { edgeKind?: EdgeKind })?.edgeKind) ?? "sync" })),
    [edges],
  );
  const review = useMemo(() => reviewDesign(reviewNodes, reviewEdges, target), [reviewNodes, reviewEdges, target]);

  const onStressTest = useCallback(() => {
    stressTestDesign(solutionsFor(reviewNodes, reviewEdges));
  }, [stressTestDesign, reviewNodes, reviewEdges]);

  const [mobilePanel, setMobilePanel] = useState<"palette" | "analysis" | null>(null);

  return (
    <div className="absolute inset-x-2 bottom-2 top-[56px] z-10 flex flex-col gap-2 sm:inset-x-3 sm:bottom-3 sm:top-[64px] lg:flex-row lg:gap-3">
      {/* Side palette — wide widths only (canvas-first on tablet/mobile). */}
      <div className="hidden lg:block">
        <StudioPalette count={nodes.length} onAdd={addComponent} onAddCustom={addCustom} onClear={clear} onExample={loadExample} />
      </div>

      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl" style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.015)" }}>
        <ReactFlowProvider>
          <StudioCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onEdgeClick={onEdgeClick} />
        </ReactFlowProvider>
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-none text-center">
              <div className="text-[14px] font-semibold sm:text-[15px]" style={{ color: "var(--text-dim)" }}>Design your own system</div>
              <div className="mt-1 text-[11.5px] sm:text-[12.5px]" style={{ color: "var(--text-faint)" }}>
                <span className="lg:hidden">Tap Components below · drag to arrange · wire a request path</span>
                <span className="hidden lg:inline">Add components from the left · drag to arrange · wire a request path · click an edge to set its type</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating toolbar (mobile + tablet) */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 lg:hidden">
          <button
            onClick={() => setMobilePanel(mobilePanel === "palette" ? null : "palette")}
            className="glass sheen flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold"
            style={{ color: mobilePanel === "palette" ? "#c7d2fe" : "var(--text-dim)", background: mobilePanel === "palette" ? "rgba(99,102,241,0.3)" : undefined }}
          >
            <Package size={14} /> Components
          </button>
          {nodes.length > 0 && (
            <button
              onClick={() => setMobilePanel(mobilePanel === "analysis" ? null : "analysis")}
              className="glass sheen flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold"
              style={{ color: mobilePanel === "analysis" ? "#c7d2fe" : "var(--text-dim)", background: mobilePanel === "analysis" ? "rgba(99,102,241,0.3)" : undefined }}
            >
              <BarChart3 size={14} /> Review
            </button>
          )}
        </div>
      </div>

      {/* Side review — wide widths only. */}
      <div className="hidden lg:block">
        <StudioAnalysis review={review} target={target} onTarget={setTarget} onStressTest={onStressTest} />
      </div>

      {/* Bottom sheet for palette / review (mobile + tablet) */}
      <AnimatePresence>
        {mobilePanel && (
          <motion.div
            key={mobilePanel}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="glass sheen absolute inset-x-2 bottom-2 z-30 mx-auto max-h-[55vh] max-w-[460px] overflow-hidden rounded-2xl lg:hidden"
          >
            <div className="flex items-center justify-between px-3.5 pb-1 pt-3">
              <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                {mobilePanel === "palette" ? "Components" : "Live Review"}
              </span>
              <button onClick={() => setMobilePanel(null)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10" style={{ color: "var(--text-faint)" }}>
                <X size={15} />
              </button>
            </div>
            <div className="scroll-fade max-h-[calc(55vh-44px)] overflow-y-auto">
              {mobilePanel === "palette" ? (
                <StudioPalette count={nodes.length} onAdd={addComponent} onAddCustom={addCustom} onClear={clear} onExample={() => { loadExample(); setMobilePanel(null); }} />
              ) : (
                <StudioAnalysis review={review} target={target} onTarget={setTarget} onStressTest={onStressTest} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
