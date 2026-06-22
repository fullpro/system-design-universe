import type { MapEdgeDef, MapNodeDef } from "./types";

/**
 * The World Map: the canonical request lifecycle laid out as a vertical spine
 * with the cache branching left and analytics branching right off the queue.
 * Positions are tuned for 240px-wide concept nodes with 180px vertical rhythm.
 */
export const MAP_NODES: MapNodeDef[] = [
  { id: "client", x: 360, y: 0 },
  { id: "dns", x: 360, y: 180 },
  { id: "cdn", x: 360, y: 360 },
  { id: "load-balancer", x: 360, y: 540 },
  { id: "api-gateway", x: 360, y: 720 },
  { id: "services", x: 360, y: 900 },
  { id: "cache", x: 40, y: 900 },
  { id: "database", x: 360, y: 1080 },
  { id: "message-queue", x: 360, y: 1260 },
  { id: "analytics", x: 700, y: 1260 },
];

export const MAP_EDGES: MapEdgeDef[] = [
  { id: "client-dns", source: "client", target: "dns" },
  { id: "dns-cdn", source: "dns", target: "cdn" },
  { id: "cdn-lb", source: "cdn", target: "load-balancer" },
  { id: "lb-gw", source: "load-balancer", target: "api-gateway" },
  { id: "gw-svc", source: "api-gateway", target: "services" },
  {
    id: "svc-cache",
    source: "services",
    target: "cache",
    label: "cache-aside",
    sourceHandle: "sl",
    targetHandle: "tr",
  },
  { id: "svc-db", source: "services", target: "database", label: "query" },
  {
    id: "cache-db",
    source: "cache",
    target: "database",
    label: "on miss",
    dashed: true,
    sourceHandle: "sb",
    targetHandle: "tl",
  },
  { id: "db-mq", source: "database", target: "message-queue", label: "change events" },
  {
    id: "mq-analytics",
    source: "message-queue",
    target: "analytics",
    label: "stream",
    sourceHandle: "sr",
    targetHandle: "tl",
  },
];
