"use client";

import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";

import { useUniverse } from "@/lib/store";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { MAP_NODES, MAP_EDGES, MAP_GROUPS } from "@/lib/map";
import { layoutInternal } from "@/lib/internals";
import { computeSimulation } from "@/lib/simulator";
import { buildEvolution, EVOLUTION_POSITIONS } from "@/lib/evolution";
import { JOURNEYS } from "@/lib/journey";

import { ConceptNode } from "./nodes/ConceptNode";
import { InternalNode } from "./nodes/InternalNode";
import { SimNode } from "./nodes/SimNode";
import { GroupNode } from "./nodes/GroupNode";
import { FlowEdge } from "./edges/FlowEdge";

const nodeTypes = { concept: ConceptNode, internal: InternalNode, sim: SimNode, group: GroupNode };
const edgeTypes = { flow: FlowEdge };

function accentOf(conceptId: string): string {
  const c = getConcept(conceptId);
  return c ? CATEGORIES[c.category].accent : "#6366f1";
}

interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export function Canvas() {
  const mode = useUniverse((s) => s.mode);
  const zoomedConceptId = useUniverse((s) => s.zoomedConceptId);
  const trafficTier = useUniverse((s) => s.trafficTier);
  const enabledSolutions = useUniverse((s) => s.enabledSolutions);
  const evolutionStage = useUniverse((s) => s.evolutionStage);
  const journeyStep = useUniverse((s) => s.journeyStep);
  const journeyId = useUniverse((s) => s.journeyId);
  const layerFilter = useUniverse((s) => s.layerFilter);
  const internalsStep = useUniverse((s) => s.internalsStep);
  const internalsFailure = useUniverse((s) => s.internalsFailure);
  const panelOpen = useUniverse((s) => Boolean(s.selectedConceptId) && s.mode !== "internals");
  const selectConcept = useUniverse((s) => s.selectConcept);
  const { fitView } = useReactFlow();

  const graph: Graph = useMemo(() => {
    // ── World Map ────────────────────────────────────────────────
    if (mode === "map") {
      // When a request journey is running, derive which node is active, which
      // have been visited, and which edge the packet is currently traversing.
      const journey = JOURNEYS.find((j) => j.id === journeyId) ?? JOURNEYS[0];
      const hops = journey.hops;
      const onJourney = journeyStep !== null;
      const activeNode = onJourney ? hops[journeyStep].node : null;
      const activeVia = onJourney ? hops[journeyStep].via : null;
      const visited = new Set<string>();
      const traversed = new Set<string>();
      if (onJourney) {
        for (let i = 0; i <= journeyStep; i++) {
          visited.add(hops[i].node);
          if (hops[i].via) traversed.add(hops[i].via as string);
        }
      }

      // Layer focus (only when no journey is running) recedes off-layer nodes.
      const layerActive = !onJourney && layerFilter !== null;

      // Group nodes must appear before their children in the array.
      const groupNodes: Node[] = MAP_GROUPS.map((g) => ({
        id: g.id,
        type: "group",
        position: { x: g.x, y: g.y },
        data: { conceptId: g.conceptId, labelOverride: g.label, width: g.width, height: g.height },
        draggable: false,
        selectable: false,
        style: { width: g.width, height: g.height },
      }));

      const conceptNodes: Node[] = MAP_NODES.map((n) => {
        const concept = getConcept(n.id);
        const offLayer = layerActive && concept?.category !== layerFilter;
        return {
          id: n.id,
          type: "concept",
          position: { x: n.x, y: n.y },
          ...(n.parentId ? { parentId: n.parentId, extent: "parent" as const } : {}),
          data: {
            conceptId: n.id,
            labelOverride: n.label,
            journeyState: !onJourney
              ? undefined
              : n.id === activeNode
                ? "active"
                : visited.has(n.id)
                  ? "visited"
                  : "upcoming",
            faded: offLayer,
          },
          draggable: false,
        };
      });

      const nodes: Node[] = [...groupNodes, ...conceptNodes];
      const edges: Edge[] = MAP_EDGES.map((e) => {
        const isActiveVia = onJourney && e.id === activeVia;
        const isTraversed = onJourney && traversed.has(e.id) && !isActiveVia;
        // During a layer focus, only edges fully inside the layer stay lit.
        const offLayerEdge =
          layerActive &&
          (getConcept(e.source)?.category !== layerFilter || getConcept(e.target)?.category !== layerFilter);
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? "sb",
          targetHandle: e.targetHandle ?? "tt",
          type: "flow",
          data: {
            accent: accentOf(e.source),
            // Off-journey the whole map breathes; on-journey only the active hop animates.
            animated: onJourney ? isActiveVia : !offLayerEdge,
            dashed: e.dashed,
            label: e.label,
            dim: (onJourney && !isActiveVia && !isTraversed) || offLayerEdge,
            traversed: isTraversed,
          },
        };
      });
      return { nodes, edges };
    }

    // ── Concept Internals ────────────────────────────────────────
    if (mode === "internals" && zoomedConceptId) {
      const concept = getConcept(zoomedConceptId);
      if (concept?.internal) {
        const accent = CATEGORIES[concept.category].accent;
        const layout = layoutInternal(concept.internal);
        // Reveal order = layout order (BFS rank). Map each node id to its index.
        const order = new Map(layout.nodes.map((n, i) => [n.id, i]));
        const stepping = internalsStep !== null;
        const failing = internalsFailure !== null;

        const nodes: Node[] = layout.nodes.map((n, i) => {
          let playState: "active" | "visited" | "upcoming" | undefined;
          if (stepping) playState = i === internalsStep ? "active" : i < internalsStep! ? "visited" : "upcoming";
          const failed = failing && n.id === internalsFailure;
          const dimmedByFailure = failing && !failed;
          return {
            id: `int-${n.id}`,
            type: "internal",
            position: { x: n.x, y: n.y },
            data: {
              label: n.label,
              sublabel: n.sublabel,
              kind: n.kind,
              accent,
              playState,
              failed,
              faded: dimmedByFailure,
            },
            draggable: false,
          };
        });
        const edges: Edge[] = layout.edges.map((e) => {
          const si = order.get(e.source) ?? 0;
          const ti = order.get(e.target) ?? 0;
          const revealed = stepping ? si <= internalsStep! && ti <= internalsStep! : true;
          const isActiveEdge = stepping && ti === internalsStep;
          return {
            id: `int-${e.id}`,
            source: `int-${e.source}`,
            target: `int-${e.target}`,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            type: "flow",
            data: {
              accent,
              animated: failing ? false : stepping ? isActiveEdge : true,
              label: e.label,
              dim: failing ? true : stepping ? !revealed : false,
              traversed: stepping ? revealed && !isActiveEdge : false,
            },
          };
        });
        return { nodes, edges };
      }
      return { nodes: [], edges: [] };
    }

    // ── Scale Simulator ──────────────────────────────────────────
    if (mode === "simulator") {
      const sim = computeSimulation(trafficTier, new Set(enabledSolutions));
      const nodes: Node[] = sim.nodes.map((n) => ({
        id: `sim-${n.id}`,
        type: "sim",
        position: { x: n.x, y: n.y },
        data: {
          label: n.label,
          sublabel: n.sublabel,
          status: n.status,
          heat: n.heat,
          conceptId: n.conceptId,
          isBottleneck: n.id === sim.bottleneck,
        },
        draggable: false,
      }));
      const edges: Edge[] = sim.edges.map((e) => ({
        id: `sim-${e.id}`,
        source: `sim-${e.source}`,
        target: `sim-${e.target}`,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: "flow",
        data: {
          accent: "#818cf8",
          animated: true,
          dashed: e.dashed,
          label: e.label,
          danger: e.target === sim.bottleneck,
        },
      }));
      return { nodes, edges };
    }

    // ── Architecture Evolution ───────────────────────────────────
    if (mode === "evolution") {
      const evo = buildEvolution(evolutionStage);
      const nodes: Node[] = evo.nodes.map(({ id, label }) => ({
        id: `evo-${id}`,
        type: "concept",
        position: EVOLUTION_POSITIONS[id] ?? { x: 0, y: 0 },
        data: { conceptId: id, labelOverride: label },
        draggable: false,
      }));
      const edges: Edge[] = evo.edges.map((e) => ({
        id: `evo-${e.id}`,
        source: `evo-${e.source}`,
        target: `evo-${e.target}`,
        sourceHandle: e.sourceHandle ?? "sb",
        targetHandle: e.targetHandle ?? "tt",
        type: "flow",
        data: { accent: accentOf(e.source), animated: true, dashed: e.dashed, label: e.label },
      }));
      return { nodes, edges };
    }

    return { nodes: [], edges: [] };
  }, [mode, zoomedConceptId, trafficTier, enabledSolutions, evolutionStage, journeyStep, journeyId, layerFilter, internalsStep, internalsFailure]);

  // Re-frame the camera when the structure or available canvas area changes.
  // The journey deliberately stays out of this key so the camera holds steady
  // while the packet advances hop to hop.
  const refitKey = `${mode}:${zoomedConceptId}:${evolutionStage}:${enabledSolutions.length}:${panelOpen}:${journeyStep === null ? "off" : "on"}`;
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Custom nodes are measured asynchronously, so a single early fit can frame a
    // degenerate (zero-height) bounding box and clip the graph. Fit twice: once on
    // the next frame, once after measurement settles.
    let raf = 0;
    const fit = (duration: number) =>
      fitView({ duration, padding: 0.2, minZoom: 0.2, maxZoom: 1.2 });
    raf = requestAnimationFrame(() => fit(0));
    const t = setTimeout(() => fit(reduce ? 0 : 650), 160);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [refitKey, fitView]);

  // Keep the whole graph framed when the viewport (or panel inset) resizes.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => fitView({ duration: 0, padding: 0.2, minZoom: 0.2, maxZoom: 1.2 }), 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [fitView]);

  return (
    <ReactFlow
      nodes={graph.nodes}
      edges={graph.edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={(_, node) => {
        const conceptId = (node.data as { conceptId?: string })?.conceptId;
        if (conceptId) selectConcept(conceptId);
      }}
      fitView
      fitViewOptions={{ padding: 0.24 }}
      minZoom={0.2}
      maxZoom={1.8}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
      className="universe-flow"
    >
      <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="rgba(255,255,255,0.05)" />
      {(mode === "map" || mode === "internals") && journeyStep === null && (
        <Controls showInteractive={false} position="bottom-right" />
      )}
      {mode === "map" && journeyStep === null && (
        <MiniMap
          pannable
          zoomable
          position="bottom-left"
          nodeColor={(n) => {
            const id = (n.data as { conceptId?: string })?.conceptId ?? n.id;
            return accentOf(id);
          }}
          nodeStrokeColor={(n) => {
            const id = (n.data as { conceptId?: string })?.conceptId ?? n.id;
            return accentOf(id);
          }}
          nodeStrokeWidth={3}
          nodeBorderRadius={6}
          maskColor="rgba(6,7,12,0.55)"
        />
      )}
    </ReactFlow>
  );
}
