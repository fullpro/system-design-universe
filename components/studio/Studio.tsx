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
import { analyzeDesign, type DesignEdge } from "@/lib/studio";
import { StudioPalette } from "./StudioPalette";
import { StudioCanvas } from "./StudioCanvas";
import { StudioAnalysis } from "./StudioAnalysis";

const accentForConcept = (id?: string): string => {
  const c = id ? getConcept(id) : undefined;
  return c ? CATEGORIES[c.category].accent : "#818cf8";
};
const conceptOf = (n?: Node): string | undefined => (n?.data as { conceptId?: string })?.conceptId;

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
    data: { conceptId: cid },
  }));

  const wires: [string, string, string, string, boolean?][] = [
    ["client", "load-balancer", "sb", "tt"],
    ["cdn", "load-balancer", "sr", "tl"],
    ["load-balancer", "api-gateway", "sb", "tt"],
    ["api-gateway", "services", "sb", "tt"],
    ["services", "cache", "sl", "tr"],
    ["services", "database", "sb", "tt"],
    ["database", "read-replica", "sl", "tr"],
    ["observability", "services", "sl", "tr", true],
  ];
  const edges: Edge[] = wires.map(([s, t, sh, th, dashed]) => ({
    id: `${s}-${t}-ex`,
    source: `${s}-ex`,
    target: `${t}-ex`,
    sourceHandle: sh,
    targetHandle: th,
    type: "flow",
    data: { accent: accentForConcept(s), animated: true, dashed },
  }));
  return { nodes, edges };
}

export function Studio() {
  const nodes = useUniverse((s) => s.studioNodes);
  const edges = useUniverse((s) => s.studioEdges);
  const setNodes = useUniverse((s) => s.setStudioNodes);
  const setEdges = useUniverse((s) => s.setStudioEdges);
  const clear = useUniverse((s) => s.clearStudio);

  const onNodesChange = useCallback((c: NodeChange[]) => setNodes((ns) => applyNodeChanges(c, ns)), [setNodes]);
  const onEdgesChange = useCallback((c: EdgeChange[]) => setEdges((es) => applyEdgeChanges(c, es)), [setEdges]);
  const onConnect = useCallback(
    (conn: Connection) =>
      setEdges((es) =>
        addEdge({ ...conn, type: "flow", data: { accent: accentForConcept(conceptOf(nodes.find((n) => n.id === conn.source))), animated: true } }, es),
      ),
    [setEdges, nodes],
  );

  const addComponent = useCallback(
    (conceptId: string) =>
      setNodes((ns) => {
        const i = ns.length;
        const id = `${conceptId}-${Math.random().toString(36).slice(2, 7)}`;
        return [...ns, { id, type: "concept", position: { x: 90 + (i % 3) * 215, y: 70 + Math.floor(i / 3) * 155 }, data: { conceptId } }];
      }),
    [setNodes],
  );

  const loadExample = useCallback(() => {
    const { nodes: n, edges: e } = makeExample();
    setNodes(n);
    setEdges(e);
  }, [setNodes, setEdges]);

  const ids = useMemo(() => nodes.map((n) => conceptOf(n)!).filter(Boolean), [nodes]);
  const present = useMemo(() => new Set(ids), [ids]);
  const conceptEdges: DesignEdge[] = useMemo(
    () =>
      edges
        .map((e) => ({ source: conceptOf(nodes.find((n) => n.id === e.source)), target: conceptOf(nodes.find((n) => n.id === e.target)) }))
        .filter((e): e is DesignEdge => Boolean(e.source && e.target)),
    [edges, nodes],
  );
  const analysis = useMemo(() => analyzeDesign(ids, conceptEdges), [ids, conceptEdges]);

  const [mobilePanel, setMobilePanel] = useState<"palette" | "analysis" | null>(null);

  return (
    <div className="absolute inset-x-2 bottom-2 top-[56px] z-10 flex flex-col gap-2 sm:inset-x-3 sm:bottom-3 sm:top-[64px] sm:flex-row sm:gap-3">
      {/* Desktop palette */}
      <div className="hidden sm:block">
        <StudioPalette present={present} count={nodes.length} onAdd={addComponent} onClear={clear} onExample={loadExample} />
      </div>

      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl" style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.015)" }}>
        <ReactFlowProvider>
          <StudioCanvas nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} />
        </ReactFlowProvider>
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-none text-center">
              <div className="text-[14px] font-semibold sm:text-[15px]" style={{ color: "var(--text-dim)" }}>Design your own system</div>
              <div className="mt-1 text-[11.5px] sm:text-[12.5px]" style={{ color: "var(--text-faint)" }}>
                <span className="sm:hidden">Add components or load an example below</span>
                <span className="hidden sm:inline">Add components from the left · drag to arrange · wire them together · get a live review</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile floating toolbar */}
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:hidden">
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

      {/* Desktop analysis */}
      <div className="hidden sm:block">
        <StudioAnalysis analysis={analysis} />
      </div>

      {/* Mobile bottom sheet for palette / analysis */}
      <AnimatePresence>
        {mobilePanel && (
          <motion.div
            key={mobilePanel}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="glass sheen absolute inset-x-2 bottom-2 z-30 max-h-[55vh] overflow-hidden rounded-2xl sm:hidden"
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
                <StudioPalette present={present} count={nodes.length} onAdd={(id) => { addComponent(id); }} onClear={clear} onExample={() => { loadExample(); setMobilePanel(null); }} />
              ) : (
                <StudioAnalysis analysis={analysis} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
