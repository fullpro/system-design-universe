/**
 * Failure Simulator model — break a running system on purpose and watch the
 * blast radius. A fixed reference architecture, a set of failure actions, and a
 * deterministic impact engine that recomputes node health, request flow,
 * availability/latency/error/throughput, cascades and failover. Fully
 * explainable: every effect comes with the sentence that justifies it.
 */

export type NodeStatus = "healthy" | "degraded" | "down" | "failover";

export interface FailNode {
  id: string;
  label: string;
  conceptId?: string;
  x: number;
  y: number;
}

export interface FailEdge {
  id: string;
  source: string;
  target: string;
}

/** The reference system everyone breaks (single-region, with a DB replica). */
export const FAIL_NODES: FailNode[] = [
  { id: "client", label: "Users", x: 280, y: 24 },
  { id: "cdn", label: "CDN", conceptId: "cdn", x: 470, y: 110 },
  { id: "lb", label: "Load Balancer", conceptId: "load-balancer", x: 280, y: 120 },
  { id: "app", label: "App Servers", conceptId: "services", x: 280, y: 236 },
  { id: "cache", label: "Redis", conceptId: "cache", x: 70, y: 236 },
  { id: "queue", label: "Kafka", conceptId: "message-queue", x: 490, y: 236 },
  { id: "worker", label: "Workers", conceptId: "task-queue", x: 490, y: 348 },
  { id: "db", label: "DB Primary", conceptId: "database", x: 280, y: 372 },
  { id: "replica", label: "DB Replica", conceptId: "read-replica", x: 90, y: 372 },
];

export const FAIL_EDGES: FailEdge[] = [
  { id: "client-cdn", source: "client", target: "cdn" },
  { id: "client-lb", source: "client", target: "lb" },
  { id: "cdn-app", source: "cdn", target: "app" },
  { id: "lb-app", source: "lb", target: "app" },
  { id: "app-cache", source: "app", target: "cache" },
  { id: "app-db", source: "app", target: "db" },
  { id: "app-queue", source: "app", target: "queue" },
  { id: "queue-worker", source: "queue", target: "worker" },
  { id: "worker-db", source: "worker", target: "db" },
  { id: "db-replica", source: "db", target: "replica" },
];

export interface FailureAction {
  id: string;
  label: string;
  icon: string;
  blurb: string;
}

export const FAILURE_ACTIONS: FailureAction[] = [
  { id: "kill-cache", label: "Kill Redis", icon: "ZapOff", blurb: "Take the cache offline." },
  { id: "kill-queue", label: "Kill Kafka", icon: "Workflow", blurb: "Take the message queue offline." },
  { id: "kill-db", label: "Kill DB Primary", icon: "Database", blurb: "Crash the primary database." },
  { id: "kill-region", label: "Kill Region", icon: "CloudOff", blurb: "Lose the entire region." },
  { id: "disable-cdn", label: "Disable CDN", icon: "Network", blurb: "Bypass the edge cache." },
  { id: "partition", label: "Network Partition", icon: "Unplug", blurb: "Split app from database." },
  { id: "latency", label: "Inject Latency", icon: "Clock", blurb: "Slow a dependency to a crawl." },
  { id: "spike", label: "Traffic Spike", icon: "TrendingUp", blurb: "10× sudden load." },
];

export interface FailureMetrics {
  availability: number; // 0–1
  p99: number; // ms
  errorRate: number; // 0–1
  throughput: number; // 0–1 relative to nominal
}

export interface FailureState {
  status: Record<string, NodeStatus>;
  brokenEdges: Set<string>;
  /** Failover edges that appear (e.g. app → promoted replica). */
  rerouted: { source: string; target: string }[];
  metrics: FailureMetrics;
  cascades: string[];
  recovery: string[];
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function computeFailureState(active: Set<string>): FailureState {
  const status: Record<string, NodeStatus> = {};
  FAIL_NODES.forEach((n) => (status[n.id] = "healthy"));
  const brokenEdges = new Set<string>();
  const rerouted: { source: string; target: string }[] = [];
  const cascades: string[] = [];
  const recovery: string[] = [];
  let m: FailureMetrics = { availability: 0.9999, p99: 130, errorRate: 0.001, throughput: 1 };

  const has = (id: string) => active.has(id);

  if (has("disable-cdn")) {
    status.cdn = "down";
    status.app = status.app === "down" ? "down" : "degraded";
    brokenEdges.add("client-cdn");
    brokenEdges.add("cdn-app");
    m.p99 += 250;
    m.throughput *= 0.8;
    m.availability *= 0.999;
    cascades.push("CDN disabled → all static & cacheable traffic now hits the origin. App load and global latency rise; no outage, but everyone is slower.");
  }

  if (has("kill-cache")) {
    status.cache = "down";
    status.db = status.db === "down" ? "down" : "degraded";
    brokenEdges.add("app-cache");
    m.p99 += 450;
    m.throughput *= 0.65;
    m.availability *= 0.998;
    m.errorRate += 0.02;
    cascades.push("Redis down → every read bypasses the cache and hits the database directly. DB load surges, p99 latency climbs. If the DB can absorb the load, availability holds — but most systems are sized assuming the cache absorbs 80%+ of reads.");
  }

  if (has("kill-queue")) {
    status.queue = "down";
    status.worker = "down";
    brokenEdges.add("app-queue");
    brokenEdges.add("queue-worker");
    brokenEdges.add("worker-db");
    m.throughput *= 0.85;
    m.errorRate += 0.05;
    m.availability *= 0.998;
    cascades.push("Kafka down → if any service is publishing synchronously (fire-and-wait), those requests fail. Background work (emails, fulfilment, analytics) stalls. APIs that depend on the queue for correctness see errors.");
    recovery.push("On restart, consumers replay from the last committed offset — no events are lost, but there's a backlog to drain.");
  }

  if (has("kill-db")) {
    status.db = "down";
    status.replica = "failover";
    brokenEdges.add("app-db");
    brokenEdges.add("db-replica");
    rerouted.push({ source: "app", target: "replica" });
    m.errorRate += 0.30;
    m.availability *= 0.99;
    m.p99 += 200;
    cascades.push("Primary database down → during the failover window (~10–30s), write requests fail with errors (40-60% error rate is realistic). Reads can still be served by the replica. The window is brutal: all write traffic returns 500s until the replica is promoted.");
    recovery.push("Failover: the read replica is promoted to primary and traffic re-routes to it. Once promoted, writes resume; a new replica is then provisioned.");
  }

  if (has("disable-cdn") || has("kill-cache") || has("kill-db") || has("kill-queue")) {
    // (effects already applied above)
  }

  if (has("partition")) {
    status.db = status.db === "down" ? "down" : "degraded";
    brokenEdges.add("app-db");
    m.errorRate += 0.12;
    m.availability *= 0.98;
    m.p99 += 300;
    cascades.push("Network partition between app and database → CAP forces a choice: reject writes to stay consistent (errors), or serve stale data from cache to stay available. You can't have both.");
  }

  if (has("latency")) {
    status.app = status.app === "down" ? "down" : "degraded";
    m.p99 += 1800;
    m.errorRate += 0.18;
    m.throughput *= 0.6;
    cascades.push("Injected latency on a downstream dependency → synchronous calls pile up and exhaust the app's thread pool. Even unrelated requests start failing — a classic cascade. A circuit breaker would have contained it.");
  }

  if (has("spike")) {
    const appDead = status.app === "down";
    if (!appDead) status.app = "degraded";
    status.db = status.db === "down" ? "down" : "degraded";
    m.p99 += 700;
    m.errorRate += 0.25;
    m.throughput = Math.min(m.throughput, 0.75);
    cascades.push("10× traffic spike → app and database saturate. With no autoscaling or rate limiting in this design, the excess is dropped: latency and error rate climb together.");
    recovery.push("A rate limiter would shed the overflow (some 429s) while keeping the system up; autoscaling would add capacity to absorb the spike.");
  }

  // Catastrophic: region loss overrides everything.
  if (has("kill-region")) {
    FAIL_NODES.forEach((n) => (status[n.id] = "down"));
    FAIL_EDGES.forEach((e) => brokenEdges.add(e.id));
    rerouted.length = 0;
    m = { availability: 0, p99: 0, errorRate: 1, throughput: 0 };
    cascades.length = 0;
    cascades.push("Entire region offline → this is a single-region deployment, so there is nowhere to fail over to. 100% of requests fail. Total outage.");
    recovery.length = 0;
    recovery.push("Recovery requires multi-region (active-active or active-passive DR) — which this architecture lacks. The advertised nines can never exceed the region's.");
  }

  m.availability = clamp01(m.availability);
  m.errorRate = clamp01(m.errorRate);
  m.throughput = clamp01(m.throughput);
  m.p99 = Math.round(m.p99);

  if (active.size === 0) {
    cascades.push("All systems nominal. Pick a failure on the left and watch the blast radius propagate.");
  }

  return { status, brokenEdges, rerouted, metrics: m, cascades, recovery };
}
