"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import { motion } from "framer-motion";
import { useUniverse } from "@/lib/store";
import { buildKnowledgeGraph, getCompany, getTechOrigin } from "@/lib/atlas";
import { rgba } from "@/lib/color";
import type { KnowledgeGraphNode as KGNode } from "@/lib/types";

const KIND_SHAPE: Record<KGNode["kind"], { radius: string; size: number }> = {
  company: { radius: "16px", size: 130 },
  technology: { radius: "12px", size: 120 },
  concept: { radius: "50%", size: 90 },
  pattern: { radius: "8px", size: 100 },
};

function KGNodeComponent({ data }: NodeProps) {
  const d = data as unknown as KGNode;
  const shape = KIND_SHAPE[d.kind];

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        className="flex items-center justify-center px-2 py-1.5 text-center font-semibold shadow-lg transition-transform hover:scale-105"
        style={{
          background: rgba(d.accent, 0.14),
          border: `1.5px solid ${rgba(d.accent, 0.45)}`,
          borderRadius: shape.radius,
          color: d.accent,
          fontSize: d.kind === "company" ? 12 : 11,
          minWidth: shape.size * 0.6,
          maxWidth: shape.size,
          boxShadow: `0 0 20px ${rgba(d.accent, 0.15)}`,
        }}
      >
        {d.label}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
}

const nodeTypes = { kg: KGNodeComponent };

function GraphInner() {
  const selectCompany = useUniverse((s) => s.selectAtlasCompany);
  const selectTech = useUniverse((s) => s.selectAtlasTech);
  const setAtlasTab = useUniverse((s) => s.setAtlasTab);

  const { rfNodes, rfEdges } = useMemo(() => {
    const { nodes, edges } = buildKnowledgeGraph();

    const byKind: Record<string, typeof nodes> = {};
    for (const n of nodes) {
      if (!byKind[n.kind]) byKind[n.kind] = [];
      byKind[n.kind].push(n);
    }

    const rfNodes: Node[] = [];
    let yOffset = 0;
    const kindOrder: KGNode["kind"][] = ["company", "technology", "concept"];
    for (const kind of kindOrder) {
      const group = byKind[kind] ?? [];
      const cols = kind === "company" ? 4 : kind === "technology" ? 4 : 5;
      group.forEach((n, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        rfNodes.push({
          id: n.id,
          type: "kg",
          position: { x: col * 200 + (kind === "concept" ? 40 : 0), y: yOffset + row * 80 },
          data: { ...n },
        });
      });
      yOffset += (Math.ceil(group.length / cols)) * 80 + 100;
    }

    const rfEdges: Edge[] = edges.map((e, i) => ({
      id: `kg-edge-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      type: "default",
      animated: e.label === "created",
      style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 },
      labelStyle: { fill: "var(--text-faint)", fontSize: 9 },
      labelBgStyle: { fill: "var(--panel-solid)", opacity: 0.8 },
    }));

    return { rfNodes, rfEdges };
  }, []);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const id = node.id;
      if (id.startsWith("company-")) {
        const companyId = id.replace("company-", "");
        if (getCompany(companyId)) {
          setAtlasTab("companies");
          selectCompany(companyId);
        }
      } else if (id.startsWith("tech-")) {
        const techId = id.replace("tech-", "");
        if (getTechOrigin(techId)) {
          setAtlasTab("technologies");
          selectTech(techId);
        }
      }
    },
    [selectCompany, selectTech, setAtlasTab],
  );

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      fitView
      minZoom={0.3}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.04)" />
      <Controls
        showInteractive={false}
        position="bottom-left"
        style={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}
      />
    </ReactFlow>
  );
}

export function KnowledgeGraphView() {
  return (
    <div className="flex h-full flex-col">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <h2 className="text-lg font-bold tracking-tight sm:text-xl" style={{ color: "var(--text)" }}>
          Knowledge Graph
        </h2>
        <p className="mt-1 text-[12px]" style={{ color: "var(--text-dim)" }}>
          How companies, technologies, and concepts connect. Click any node to explore.
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded" style={{ background: "rgba(99,102,241,0.5)" }} />
            <span style={{ color: "var(--text-faint)" }}>Company</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "rgba(52,211,153,0.5)" }} />
            <span style={{ color: "var(--text-faint)" }}>Technology</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(129,140,248,0.5)" }} />
            <span style={{ color: "var(--text-faint)" }}>Concept</span>
          </span>
        </div>
      </motion.div>
      <div className="flex-1" style={{ minHeight: 400 }}>
        <ReactFlowProvider>
          <GraphInner />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
