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
    addNodes: ["cache"],
    addEdges: [
      { id: "e-svc-cache", source: "services", target: "cache", sourceHandle: "sl", targetHandle: "tr" },
      { id: "e-cache-db", source: "cache", target: "database", dashed: true, label: "on miss", sourceHandle: "sb", targetHandle: "tl" },
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
    addNodes: ["message-queue", "analytics"],
    addEdges: [
      { id: "e-svc-mq", source: "services", target: "message-queue", sourceHandle: "sr", targetHandle: "tl" },
      { id: "e-mq-an", source: "message-queue", target: "analytics" },
    ],
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
    addNodes: ["api-gateway"],
    removeEdges: ["e-lb-svc"],
    addEdges: [
      { id: "e-lb-gw", source: "load-balancer", target: "api-gateway" },
      { id: "e-gw-svc", source: "api-gateway", target: "services" },
    ],
    labels: { services: "Microservices" },
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
    addNodes: ["dns", "read-replica"],
    removeEdges: ["e-cl-lb"],
    addEdges: [
      { id: "e-cl-dns", source: "client", target: "dns" },
      { id: "e-dns-lb", source: "dns", target: "load-balancer", label: "geo-routed" },
      { id: "e-db-rr", source: "database", target: "read-replica", sourceHandle: "sl", targetHandle: "tr" },
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
