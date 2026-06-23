/**
 * The semantic type system for the Design Studio.
 *
 * The Studio is a *typed-but-freeform* canvas: a node can carry any label the
 * user types ("Pinecone", "Stripe", "My Ranker") but is anchored to one of a
 * small set of **kinds**. The reviewer reasons over kinds + topology — never
 * product names — so you can draw anything and still get meaningful feedback.
 */

export type NodeKind =
  | "client"
  | "edge" // CDN / DNS — content & entry at the edge
  | "proxy" // load balancer / reverse proxy
  | "gateway" // API gateway / BFF
  | "compute" // app servers, services, workers, functions
  | "cache"
  | "datastore" // SQL/NoSQL/object store/replica/shard
  | "queue" // message queue / stream
  | "external" // third-party / upstream system you don't run
  | "observability"
  | "boundary" // a region / VPC / trust boundary (visual zone)
  | "note" // free annotation
  | "other"; // intentionally opaque — drawn, not scored

export interface KindMeta {
  kind: NodeKind;
  label: string;
  /** lucide-react icon name. */
  icon: string;
  accent: string;
  /** Whether this kind participates in scoring (note/other/boundary do not). */
  scored: boolean;
  /** One-line hint shown in the palette. */
  hint: string;
}

export const KIND_META: Record<NodeKind, KindMeta> = {
  client: { kind: "client", label: "Client", icon: "MonitorSmartphone", accent: "#7dd3fc", scored: true, hint: "Browser, app or device that makes requests" },
  edge: { kind: "edge", label: "Edge / CDN", icon: "Network", accent: "#22d3ee", scored: true, hint: "CDN, DNS — content & entry at the edge" },
  proxy: { kind: "proxy", label: "Load Balancer", icon: "Split", accent: "#a78bfa", scored: true, hint: "Load balancer / reverse proxy" },
  gateway: { kind: "gateway", label: "API Gateway", icon: "DoorOpen", accent: "#a78bfa", scored: true, hint: "Gateway / BFF — auth, routing, limits" },
  compute: { kind: "compute", label: "Service", icon: "Boxes", accent: "#34d399", scored: true, hint: "App server, microservice, worker, function" },
  cache: { kind: "cache", label: "Cache", icon: "Zap", accent: "#fb7185", scored: true, hint: "In-memory cache in front of a store" },
  datastore: { kind: "datastore", label: "Datastore", icon: "Database", accent: "#fbbf24", scored: true, hint: "SQL, NoSQL, object store, replica, shard" },
  queue: { kind: "queue", label: "Queue / Stream", icon: "ListOrdered", accent: "#ec4899", scored: true, hint: "Message queue or event stream" },
  external: { kind: "external", label: "External", icon: "Cloud", accent: "#94a3b8", scored: true, hint: "Third-party / upstream you don't operate" },
  observability: { kind: "observability", label: "Observability", icon: "Activity", accent: "#14b8a6", scored: true, hint: "Logs, metrics, traces" },
  boundary: { kind: "boundary", label: "Zone / Boundary", icon: "SquareDashed", accent: "#818cf8", scored: false, hint: "Region, VPC or trust boundary (visual)" },
  note: { kind: "note", label: "Note", icon: "StickyNote", accent: "#cbd5e1", scored: false, hint: "Free annotation — not reviewed" },
  other: { kind: "other", label: "Other", icon: "Shapes", accent: "#94a3b8", scored: false, hint: "Anything else — drawn, not scored" },
};

/** The kinds offered as quick "custom" components in the palette. */
export const CUSTOM_KINDS: NodeKind[] = [
  "compute", "datastore", "cache", "queue", "gateway", "proxy",
  "edge", "external", "observability", "client", "boundary", "note", "other",
];

/** Map a known concept id to its semantic kind. */
export function kindForConcept(conceptId: string): NodeKind {
  if (conceptId in CONCEPT_KIND) return CONCEPT_KIND[conceptId];
  return "other";
}

const CONCEPT_KIND: Record<string, NodeKind> = {
  client: "client",
  dns: "edge",
  cdn: "edge",
  "reverse-proxy": "proxy",
  "load-balancer": "proxy",
  "web-server": "compute",
  "api-gateway": "gateway",
  services: "compute",
  "read-api": "compute",
  "write-api": "compute",
  "write-api-async": "compute",
  "worker-service": "compute",
  kubernetes: "compute",
  cache: "cache",
  database: "datastore",
  nosql: "datastore",
  "object-store": "datastore",
  "read-replica": "datastore",
  sharding: "datastore",
  "message-queue": "queue",
  "task-queue": "queue",
  analytics: "datastore",
  "rate-limiter": "gateway",
  "circuit-breaker": "compute",
  observability: "observability",
};

// ── Edges ────────────────────────────────────────────────────────────────────

export type EdgeKind = "sync" | "async" | "replication" | "cache-aside" | "data";

export interface EdgeMeta {
  kind: EdgeKind;
  label: string;
  /** Stroke style for the edge. */
  dashed: boolean;
  hint: string;
}

export const EDGE_META: Record<EdgeKind, EdgeMeta> = {
  sync: { kind: "sync", label: "Sync call", dashed: false, hint: "Blocking request/response" },
  async: { kind: "async", label: "Async / event", dashed: true, hint: "Fire-and-forget over a queue/stream" },
  replication: { kind: "replication", label: "Replication", dashed: true, hint: "Data copied between stores" },
  "cache-aside": { kind: "cache-aside", label: "Cache-aside", dashed: true, hint: "Read-through / lazy population" },
  data: { kind: "data", label: "Data flow", dashed: false, hint: "Bulk / pipeline data movement" },
};

export const EDGE_KIND_ORDER: EdgeKind[] = ["sync", "async", "replication", "cache-aside", "data"];
