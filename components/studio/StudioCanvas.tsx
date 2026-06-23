"use client";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ConnectionMode,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type EdgeMouseHandler,
} from "@xyflow/react";

import { ConceptNode } from "../nodes/ConceptNode";
import { CustomNode } from "../nodes/CustomNode";
import { FlowEdge } from "../edges/FlowEdge";

const nodeTypes = { concept: ConceptNode, custom: CustomNode };
const edgeTypes = { flow: FlowEdge };

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onEdgeClick?: EdgeMouseHandler;
}

export function StudioCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onEdgeClick }: Props) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode={ConnectionMode.Loose}
      defaultEdgeOptions={{ type: "flow" }}
      fitView
      fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
      minZoom={0.3}
      maxZoom={1.8}
      nodesDraggable
      nodesConnectable
      elementsSelectable
      deleteKeyCode={["Backspace", "Delete"]}
      proOptions={{ hideAttribution: true }}
      className="studio-flow"
    >
      <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="rgba(255,255,255,0.05)" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
}
