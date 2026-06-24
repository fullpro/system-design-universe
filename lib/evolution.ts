import type { MapEdgeDef } from "./types";

/**
 * Architecture Evolution — watch a system grow from one box to a multi-region
 * platform. Node positions are fixed for the whole journey so each stage's new
 * pieces animate into a stable layout rather than reshuffling everything.
 */

export interface EvolutionOption {
  label: string;
  correct: boolean;
  note: string;
}

/** A "what would you do?" gate shown before a stage's change is revealed. */
export interface EvolutionQuestion {
  prompt: string;
  options: EvolutionOption[];
}

export interface EvolutionStage {
  title: string;
  trigger: string;
  narrative: string;
  /** What new operational/design problems this stage introduces. */
  complexity?: string;
  addNodes: string[];
  addEdges: MapEdgeDef[];
  removeEdges?: string[];
  /** Per-concept label overrides that take effect from this stage onward. */
  labels?: Record<string, string>;
  /** Problem-first gate: posed before this stage is revealed. */
  question?: EvolutionQuestion;
}

/** Fixed canvas position for every concept that can appear during evolution.
 *  Tuned for 240px-wide nodes with ~180px vertical rhythm. */
export const EVOLUTION_POSITIONS: Record<string, { x: number; y: number }> = {
  client: { x: 350, y: 0 },
  dns: { x: 350, y: 180 },
  cdn: { x: 50, y: 370 },
  "load-balancer": { x: 350, y: 370 },
  observability: { x: 50, y: 570 },
  "api-gateway": { x: 350, y: 560 },
  kubernetes: { x: 660, y: 560 },
  services: { x: 350, y: 760 },
  cache: { x: 50, y: 780 },
  "message-queue": { x: 660, y: 760 },
  database: { x: 350, y: 980 },
  "read-replica": { x: 50, y: 980 },
  analytics: { x: 660, y: 980 },
};

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    title: "Single Server",
    trigger: "Launch · ~100 users",
    narrative:
      "One server runs the app and talks to one database. Simple, cheap, and perfectly adequate. Most systems should stay here far longer than ego allows.",
    complexity: "One machine is a single point of failure — if it dies, the whole system is down. No horizontal headroom, and deployments require downtime. But at this scale those are acceptable tradeoffs for simplicity.",
    addNodes: ["client", "services", "database"],
    addEdges: [
      { id: "e-cl-svc", source: "client", target: "services" },
      { id: "e-svc-db", source: "services", target: "database" },
    ],
    labels: { services: "App Server" },
  },
  {
    title: "Add a Load Balancer",
    trigger: "One server maxes out",
    question: {
      prompt: "Your single app server is pinned at 100% CPU and requests are queuing. What do you reach for?",
      options: [
        { label: "Load balancer + more app servers", correct: true, note: "Right — spread requests across many servers and survive one dying. Horizontal scale for the stateless tier." },
        { label: "A bigger cache", correct: false, note: "A cache helps repeated reads, but the bottleneck here is compute — you need more servers, not fewer DB hits." },
        { label: "Another database", correct: false, note: "The database isn't the problem yet; the app tier is out of CPU." },
      ],
    },
    narrative:
      "A single server has a hard ceiling. Put a load balancer in front and run several identical app servers behind it — now you scale horizontally and survive a server dying.",
    complexity: "App servers must now be stateless — no local session storage, no local file writes. Health checks, rolling deploys, and session affinity become new concerns. The load balancer itself needs to be highly available (often a managed service).",
    addNodes: ["load-balancer"],
    removeEdges: ["e-cl-svc"],
    addEdges: [
      { id: "e-cl-lb", source: "client", target: "load-balancer" },
      { id: "e-lb-svc", source: "load-balancer", target: "services" },
    ],
    labels: { services: "App Servers ×N" },
  },
  {
    title: "Add a Cache",
    trigger: "Database reads repeat",
    question: {
      prompt: "The same product rows are read thousands of times a second, and the database is the bottleneck. Cheapest effective fix?",
      options: [
        { label: "A Redis cache in front of the DB", correct: true, note: "Right — serve hot reads from memory and shield the primary. Reads are the problem, and they repeat." },
        { label: "Shard the database", correct: false, note: "Sharding is for write scale and is far more complex — premature when reads (not writes) are hot." },
        { label: "Add more app servers", correct: false, note: "More app servers just send more queries to the same overloaded database." },
      ],
    },
    narrative:
      "The same hot rows are read over and over. A Redis cache in front of the database serves them from memory, collapsing read latency and shielding the primary.",
    complexity: "Cache invalidation is now your problem — stale data, thundering herds on expiry, and cold-start stampedes when the cache restarts. You need an eviction policy (LRU), TTL tuning, and a plan for what happens when Redis goes down (does the DB survive the sudden read storm?).",
    addNodes: ["cache"],
    addEdges: [
      { id: "e-svc-cache", source: "services", target: "cache", sourceHandle: "sl", targetHandle: "tr" },
      { id: "e-cache-db", source: "cache", target: "database", dashed: true, label: "on miss", sourceHandle: "sb", targetHandle: "tl" },
    ],
  },
  {
    title: "Add Read Replicas",
    trigger: "Read load swamps the primary",
    question: {
      prompt: "The cache absorbs hot reads, but long-tail queries and reporting still saturate the primary's connection pool. What scales reads further?",
      options: [
        { label: "Read replicas off the primary", correct: true, note: "Right — replicas serve read traffic from copies of the data, and double as failover candidates." },
        { label: "A second write database", correct: false, note: "Two writable primaries create consistency nightmares (split-brain). Replicas are read-only copies." },
        { label: "More app servers", correct: false, note: "More app servers just send more queries to the same overwhelmed primary." },
      ],
    },
    narrative:
      "The cache handles hot reads, but cold queries and analytics still pound the primary. Read replicas absorb that remaining read load and provide a warm standby for failover.",
    complexity: "Replication lag means replicas may serve slightly stale data. Read-your-writes consistency requires routing some reads back to the primary. Monitoring lag and managing replica promotion on failure become new concerns.",
    addNodes: ["read-replica"],
    addEdges: [
      { id: "e-db-rr", source: "database", target: "read-replica", dashed: true, label: "replication", sourceHandle: "sl", targetHandle: "tr" },
    ],
  },
  {
    title: "Add a CDN",
    trigger: "Global users, heavy assets",
    question: {
      prompt: "Users in Sydney wait ~300ms for images served from your Virginia origin. What helps most?",
      options: [
        { label: "A CDN caching assets at the edge", correct: true, note: "Right — serve content from a PoP near each user, cutting latency and offloading the origin." },
        { label: "A faster database", correct: false, note: "The delay is network distance to static assets, not database time." },
        { label: "More app servers", correct: false, note: "More origin compute doesn't shorten the 15,000km round-trip." },
      ],
    },
    narrative:
      "Users far from your data centre wait on every asset. A CDN caches static content at the edge, cutting latency and absorbing a huge share of traffic before it reaches you.",
    complexity: "Cache-busting and purge propagation across dozens of PoPs become real concerns. Stale HTML served from the edge can break deployments. You now manage two caching layers (CDN + Redis) with different invalidation models.",
    addNodes: ["cdn"],
    removeEdges: ["e-cl-lb"],
    addEdges: [
      { id: "e-cl-cdn", source: "client", target: "cdn", sourceHandle: "sl", targetHandle: "tt" },
      { id: "e-cdn-lb", source: "cdn", target: "load-balancer", sourceHandle: "sr", targetHandle: "tl" },
    ],
  },
  {
    title: "Add a Message Queue",
    trigger: "Slow, spiky background work",
    question: {
      prompt: "Sending confirmation emails inline makes checkout slow and spiky under load. What decouples it?",
      options: [
        { label: "A message queue + background workers", correct: true, note: "Right — accept the work instantly, process it asynchronously, and absorb spikes." },
        { label: "A read replica", correct: false, note: "Replicas scale reads; they don't move slow side-effects off the request path." },
        { label: "A bigger app server", correct: false, note: "A bigger box still does the slow work inline — it just delays the ceiling." },
      ],
    },
    narrative:
      "Not everything must happen during the request. A queue lets you accept work instantly and process it asynchronously — and the same events feed an analytics pipeline.",
    complexity: "You now have eventual consistency between the API response ('accepted') and actual completion. Dead-letter queues, poison messages, idempotent consumers, and monitoring queue depth are new operational concerns. Workers that crash mid-processing can duplicate or lose work without careful design.",
    addNodes: ["message-queue", "analytics"],
    addEdges: [
      { id: "e-svc-mq", source: "services", target: "message-queue", sourceHandle: "sr", targetHandle: "tl" },
      { id: "e-mq-an", source: "message-queue", target: "analytics" },
    ],
  },
  {
    title: "Split Read/Write Paths",
    trigger: "Reads and writes fight for the same resources",
    question: {
      prompt: "Reads and writes share one API and compete for the same database connections. Reads want caching and denormalization; writes need strict validation. What separates them?",
      options: [
        { label: "Separate read and write API paths (CQRS)", correct: true, note: "Right — let each path scale, cache, and optimize independently. Reads tolerate staleness; writes need consistency." },
        { label: "A bigger database", correct: false, note: "A bigger box doesn't separate concerns — reads and writes still contend for the same connections." },
        { label: "More caches", correct: false, note: "More caches help reads but don't address the write path competing for the same resources." },
      ],
    },
    narrative:
      "Reads and writes pull schemas in opposite directions. Splitting them lets reads cache aggressively and denormalize freely, while writes stay strict and consistent — each scaling on its own terms.",
    complexity: "You now maintain two code paths and must keep them in sync. The read model lags the write model (eventual consistency). Read-your-own-write scenarios need explicit handling. Two paths means two things to deploy and monitor.",
    addNodes: [],
    addEdges: [],
    labels: { services: "Read + Write Services" },
  },
  {
    title: "Shard the Database",
    trigger: "Write volume exceeds one primary",
    question: {
      prompt: "The single primary's row-level locks and WAL throughput are the ceiling. Replicas don't help — they only scale reads. What scales writes?",
      options: [
        { label: "Shard the database by a partition key", correct: true, note: "Right — split the data itself across multiple primaries so writes parallelize instead of contending on one machine." },
        { label: "More read replicas", correct: false, note: "Replicas only scale reads. Every write still funnels through the one primary." },
        { label: "A bigger cache", correct: false, note: "The cache handles reads. The bottleneck is write throughput on a single primary." },
      ],
    },
    narrative:
      "When even a beefy primary can't absorb the write volume, you must split the data itself. Sharding partitions rows across multiple independent primaries so writes parallelize — the last resort and the hardest operational decision.",
    complexity: "Cross-shard queries and joins become application-level scatter-gathers. Resharding (changing the number of shards) is operationally brutal. A poorly chosen shard key creates hotspots that simply adding more shards won't fix. Distributed transactions across shards require sagas or two-phase commit.",
    addNodes: [],
    addEdges: [],
    labels: { database: "Sharded DB" },
  },
  {
    title: "Split into Microservices",
    trigger: "Teams step on each other",
    question: {
      prompt: "Ten teams deploy one monolith and constantly block each other's releases. What unblocks them?",
      options: [
        { label: "Split into microservices behind a gateway", correct: true, note: "Right — independent deploy and scale per team. But brace for real distributed-systems complexity." },
        { label: "Add more app servers", correct: false, note: "More instances of the same codebase don't let teams deploy independently." },
        { label: "A second database", correct: false, note: "The bottleneck is the shared deploy pipeline, not storage." },
      ],
    },
    narrative:
      "One codebase becomes a bottleneck for many teams. Split it into services behind an API Gateway, so each can deploy and scale independently — at the cost of real distributed complexity.",
    complexity: "Every function call is now a network call — with latency, failure modes, and serialisation cost. Distributed transactions (sagas), service discovery, API versioning, and cascading failures (circuit breakers) are new realities. A cross-service query that was a simple JOIN is now an API call or event-driven join.",
    addNodes: ["api-gateway"],
    removeEdges: ["e-lb-svc"],
    addEdges: [
      { id: "e-lb-gw", source: "load-balancer", target: "api-gateway" },
      { id: "e-gw-svc", source: "api-gateway", target: "services" },
    ],
    labels: { services: "Microservices" },
  },
  {
    title: "Add Rate Limiting",
    trigger: "Abusive traffic and retry storms",
    question: {
      prompt: "A buggy client retries every failed request immediately, 1000 times. It's not malicious — but it's taking down your service for everyone. What protects you?",
      options: [
        { label: "Rate limiting at the gateway", correct: true, note: "Right — cap requests per client per window. The buggy client gets 429s; everyone else stays healthy." },
        { label: "More app servers", correct: false, note: "More servers absorb more load but don't stop the retry storm — it just takes longer to overwhelm them." },
        { label: "A circuit breaker", correct: false, note: "Circuit breakers protect you from slow dependencies, not from clients sending you too much traffic." },
      ],
    },
    narrative:
      "Rate limiting is the immune system at the front door. It protects shared capacity from abuse, retry storms, and buggy clients — enforcing fairness so one noisy actor can't degrade the service for everyone.",
    complexity: "Distributed rate limiting needs shared state (usually Redis) across gateway instances. Setting limits too tight blocks legitimate users; too loose and it doesn't protect. Per-client, per-endpoint, and global limits each serve different purposes.",
    addNodes: [],
    addEdges: [],
  },
  {
    title: "Orchestrate with Kubernetes",
    trigger: "Dozens of services to run",
    question: {
      prompt: "You now run dozens of services across many machines, deployed and restarted by hand. What manages them?",
      options: [
        { label: "Kubernetes (declarative orchestration)", correct: true, note: "Right — you declare the desired state; it schedules, heals and scales containers to match." },
        { label: "A bigger load balancer", correct: false, note: "A load balancer routes traffic; it doesn't schedule, restart or scale your containers." },
        { label: "More caches", correct: false, note: "Caching is unrelated to the operational problem of running many services." },
      ],
    },
    narrative:
      "Running many services across many machines by hand is hopeless. Kubernetes schedules, heals and scales containers from a declarative spec — you describe the goal, it maintains it.",
    complexity: "YAML sprawl, networking policies, RBAC, persistent volume management, and cluster upgrades are now ongoing work. Debugging a pod crash loop across namespace boundaries is harder than tailing a single process. The abstraction is powerful but leaks under pressure (storage, DNS, node affinity).",
    addNodes: ["kubernetes"],
    addEdges: [
      { id: "e-k8s-svc", source: "kubernetes", target: "services", dashed: true, label: "orchestrates", sourceHandle: "sl", targetHandle: "tr" },
    ],
  },
  {
    title: "Add Observability",
    trigger: "Failures you can't explain",
    question: {
      prompt: "Latency spikes 'somewhere' across your services and nobody can tell where. What do you add?",
      options: [
        { label: "Observability — logs, metrics, traces", correct: true, note: "Right — distributed tracing follows one request across services to pinpoint where time and errors actually go." },
        { label: "Another read replica", correct: false, note: "You don't yet know the database is the problem — that's exactly what you can't see." },
        { label: "A CDN", correct: false, note: "A CDN helps asset latency, not diagnosing where internal time is spent." },
      ],
    },
    narrative:
      "At this complexity, incidents are inevitable and opaque. Logs, metrics and traces let you ask new questions of a live system — turning 'it's slow somewhere' into a precise answer.",
    complexity: "Telemetry volume grows with traffic and service count — storage costs climb, dashboards proliferate, and alert fatigue is a real risk. Sampling strategies, retention policies, and correlating logs↔traces↔metrics across services are non-trivial ongoing work.",
    addNodes: ["observability"],
    addEdges: [
      { id: "e-obs-svc", source: "observability", target: "services", dashed: true, label: "traces", sourceHandle: "sr", targetHandle: "tl" },
      { id: "e-obs-db", source: "observability", target: "database", dashed: true, sourceHandle: "sb", targetHandle: "tl" },
    ],
  },
  {
    title: "Go Multi-Region",
    trigger: "Global scale & resilience",
    question: {
      prompt: "One region is both a single point of failure and a latency floor for half your users. What's the move?",
      options: [
        { label: "Go multi-region with geo-routing DNS", correct: true, note: "Right — each region is a full replica; DNS sends users to their nearest one and you survive a whole-region outage." },
        { label: "Add more servers in the same region", correct: false, note: "More capacity in one region doesn't survive that region failing, nor shorten distance for far-away users." },
        { label: "A bigger database", correct: false, note: "Vertical scale can't address geographic latency or single-region risk." },
      ],
    },
    narrative:
      "One region is a single point of failure and a latency floor for distant users. Geo-routing DNS sends users to their nearest region, each a full replica with its own read replicas. You've arrived.",
    complexity: "Cross-region replication lag makes strong consistency across regions extremely expensive. You must choose: route writes to one primary (latency penalty for far users) or accept eventual consistency with conflict resolution. DNS failover, data sovereignty, and region-aware deployments add operational dimensions that didn't exist before.",
    addNodes: ["dns"],
    removeEdges: ["e-cl-lb"],
    addEdges: [
      { id: "e-cl-dns", source: "client", target: "dns" },
      { id: "e-dns-lb", source: "dns", target: "load-balancer", label: "geo-routed" },
    ],
  },
];

export interface EvolutionState {
  nodes: Array<{ id: string; label?: string }>;
  edges: MapEdgeDef[];
  stage: EvolutionStage;
}

/** Build the cumulative architecture visible at a given stage. */
export function buildEvolution(stageIndex: number): EvolutionState {
  const nodeIds = new Set<string>();
  const labels: Record<string, string> = {};
  let edges: MapEdgeDef[] = [];

  for (let i = 0; i <= stageIndex; i++) {
    const stage = EVOLUTION_STAGES[i];
    stage.addNodes.forEach((n) => nodeIds.add(n));
    if (stage.removeEdges) {
      edges = edges.filter((e) => !stage.removeEdges!.includes(e.id));
    }
    edges = edges.concat(stage.addEdges);
    if (stage.labels) Object.assign(labels, stage.labels);
  }

  return {
    nodes: Array.from(nodeIds).map((id) => ({ id, label: labels[id] })),
    edges,
    stage: EVOLUTION_STAGES[stageIndex],
  };
}
