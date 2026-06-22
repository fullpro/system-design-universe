import type { HandleId, InternalFlow, InternalNode } from "./types";

/**
 * Auto-layout for a concept's internal "zoom-in" flow.
 *
 * Rather than hand-placing every sub-node, we assign each node a rank (its
 * shortest distance from a start node) and lay ranks out top-to-bottom, spread
 * horizontally and centred on x=0. Back-edges (cycles, e.g. a circuit breaker's
 * state machine) loop on the right so they stay readable.
 */

const ROW_GAP = 150;
const COL_GAP = 250;

export interface PositionedInternalNode extends InternalNode {
  x: number;
  y: number;
}

export interface LayoutInternalEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceHandle: HandleId;
  targetHandle: HandleId;
}

export interface InternalLayout {
  nodes: PositionedInternalNode[];
  edges: LayoutInternalEdge[];
}

export function layoutInternal(flow: InternalFlow): InternalLayout {
  const { nodes, edges } = flow;

  // Adjacency + in-degree.
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  nodes.forEach((n) => {
    adj.set(n.id, []);
    indeg.set(n.id, 0);
  });
  edges.forEach((e) => {
    adj.get(e.source)?.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  });

  // Seed ranks at start nodes (explicit "start" kind or zero in-degree).
  const rank = new Map<string, number>();
  const queue: string[] = [];
  nodes.forEach((n) => {
    if (n.kind === "start" || (indeg.get(n.id) ?? 0) === 0) {
      rank.set(n.id, 0);
      queue.push(n.id);
    }
  });
  // Fallback: if nothing seeded (pure cycle), start at the first node.
  if (queue.length === 0 && nodes.length > 0) {
    rank.set(nodes[0].id, 0);
    queue.push(nodes[0].id);
  }

  // BFS shortest-path levels; first assignment wins so cycles terminate.
  while (queue.length > 0) {
    const id = queue.shift()!;
    const r = rank.get(id)!;
    for (const next of adj.get(id) ?? []) {
      if (!rank.has(next)) {
        rank.set(next, r + 1);
        queue.push(next);
      }
    }
  }
  // Any unreached nodes get parked below everything.
  const maxRank = Math.max(0, ...Array.from(rank.values()));
  nodes.forEach((n) => {
    if (!rank.has(n.id)) rank.set(n.id, maxRank + 1);
  });

  // Group by rank, preserving declaration order within a rank.
  const byRank = new Map<number, InternalNode[]>();
  nodes.forEach((n) => {
    const r = rank.get(n.id)!;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r)!.push(n);
  });

  const positioned: PositionedInternalNode[] = [];
  for (const [r, group] of byRank) {
    const count = group.length;
    group.forEach((n, i) => {
      const x = i * COL_GAP - ((count - 1) * COL_GAP) / 2;
      const y = r * ROW_GAP;
      positioned.push({ ...n, x, y });
    });
  }

  const layoutEdges: LayoutInternalEdge[] = edges.map((e) => {
    const sourceRank = rank.get(e.source) ?? 0;
    const targetRank = rank.get(e.target) ?? 0;
    const forward = targetRank > sourceRank;
    return {
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: e.label,
      sourceHandle: forward ? "sb" : "sr",
      targetHandle: forward ? "tt" : "tr",
    };
  });

  return { nodes: positioned, edges: layoutEdges };
}
