import type { MapEdgeDef, MapGroupDef, MapNodeDef } from "./types";

/**
 * The World Map — mirrors the classic scaling reference architecture.
 *
 * The API Gateway is a visual group containing three child API nodes
 * (Write API Async, Write API, Read API). Children use `parentId` and
 * are positioned relative to the group's top-left.
 *
 * Positions use a four-column grid (x: 0 / 450 / 900 / 1350) with 280px
 * vertical rhythm to prevent edges from overlapping nodes.
 */

export const MAP_GROUPS: MapGroupDef[] = [
  {
    id: "api-gateway-group",
    conceptId: "api-gateway",
    label: "API Gateway",
    x: 135,
    y: 700,
    width: 900,
    height: 190,
  },
];

export const MAP_NODES: MapNodeDef[] = [
  // Row 0 — entry
  { id: "client", x: 450, y: 0 },
  { id: "dns", x: 900, y: 0 },
  // Row 1 — edge
  { id: "cdn", x: 900, y: 280 },
  { id: "load-balancer", x: 450, y: 280 },
  // Row 2 — web tier
  { id: "web-server", x: 450, y: 560 },
  // Row 3 — API tier (children of API Gateway group)
  { id: "write-api-async", x: 15, y: 50, parentId: "api-gateway-group" },
  { id: "write-api", x: 315, y: 50, parentId: "api-gateway-group" },
  { id: "read-api", x: 615, y: 50, parentId: "api-gateway-group" },
  // Row 4 — queue + cache
  { id: "message-queue", x: 0, y: 1120, label: "Queue" },
  { id: "cache", x: 450, y: 1120, label: "Memory Cache" },
  // Row 5 — workers + data
  { id: "worker-service", x: 0, y: 1400 },
  { id: "database", x: 450, y: 1400, label: "SQL Write Master" },
  { id: "read-replica", x: 900, y: 1400, label: "SQL Read Replicas" },
  { id: "nosql", x: 0, y: 1680, label: "NoSQL" },
  { id: "object-store", x: 900, y: 1680 },
  // Row 6 — scaling patterns
  { id: "sharding", x: 0, y: 1960 },
  { id: "federation", x: 450, y: 1960 },
];

export const MAP_EDGES: MapEdgeDef[] = [
  // ── Client → DNS → CDN/LB
  { id: "client-dns", source: "client", target: "dns", sourceHandle: "sr", targetHandle: "tl" },
  { id: "dns-cdn", source: "dns", target: "cdn", sourceHandle: "sb", targetHandle: "tt" },
  { id: "dns-lb", source: "dns", target: "load-balancer", label: "resolves to", sourceHandle: "sl", targetHandle: "tr" },

  // ── CDN: origin pull on miss — horizontal same-row
  { id: "cdn-lb", source: "cdn", target: "load-balancer", dashed: true, label: "origin pull", sourceHandle: "sl", targetHandle: "tr" },

  // ── Load balancer → web server — straight down
  { id: "lb-web", source: "load-balancer", target: "web-server", sourceHandle: "sb", targetHandle: "tt" },

  // ── Web server fans out to three API tiers
  { id: "web-async", source: "web-server", target: "write-api-async", label: "async jobs", sourceHandle: "sl", targetHandle: "tt" },
  { id: "web-write", source: "web-server", target: "write-api", label: "POST/PUT", sourceHandle: "sb", targetHandle: "tt" },
  { id: "web-read", source: "web-server", target: "read-api", label: "GET", sourceHandle: "sr", targetHandle: "tt" },

  // ── Async write path — straight down col 0
  { id: "async-queue", source: "write-api-async", target: "message-queue", sourceHandle: "sb", targetHandle: "tt" },
  { id: "queue-worker", source: "message-queue", target: "worker-service", sourceHandle: "sb", targetHandle: "tt" },

  // ── Write API → DB straight down, invalidate cache left-to-left
  { id: "write-db", source: "write-api", target: "database", label: "write", sourceHandle: "sb", targetHandle: "tt" },
  { id: "write-cache", source: "write-api", target: "cache", label: "invalidate", sourceHandle: "sb", targetHandle: "tt" },

  // ── Read API → Cache: arc left from read-api to cache
  { id: "read-cache", source: "read-api", target: "cache", label: "cache-aside", sourceHandle: "sl", targetHandle: "tr" },
  // ── Cache miss → Read Replica: arc right
  { id: "cache-sqlr", source: "cache", target: "read-replica", label: "on miss", sourceHandle: "sr", targetHandle: "tl" },

  // ── Worker connections — careful routing to avoid crossing
  { id: "worker-nosql", source: "worker-service", target: "nosql", sourceHandle: "sb", targetHandle: "tt" },
  { id: "worker-db", source: "worker-service", target: "database", label: "update", sourceHandle: "sr", targetHandle: "tl" },
  { id: "worker-cache", source: "worker-service", target: "cache", label: "warm", sourceHandle: "st", targetHandle: "tb" },
  { id: "worker-objstore", source: "worker-service", target: "object-store", label: "blobs", sourceHandle: "sb", targetHandle: "tb" },

  // ── CDN → Object Store: arc right to avoid crossing everything in between
  { id: "cdn-objstore", source: "cdn", target: "object-store", dashed: true, label: "static assets", sourceHandle: "sr", targetHandle: "tr" },

  // ── SQL replication — horizontal same-row
  { id: "sqlw-sqlr", source: "database", target: "read-replica", dashed: true, label: "replication", sourceHandle: "sr", targetHandle: "tl" },

  // ── Scaling patterns — straight up
  { id: "shard-sqlw", source: "sharding", target: "database", dashed: true, label: "by key", sourceHandle: "st", targetHandle: "tb" },
  { id: "fed-sqlw", source: "federation", target: "database", dashed: true, label: "by feature", sourceHandle: "st", targetHandle: "tb" },
];
