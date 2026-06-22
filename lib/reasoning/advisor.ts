import { type Requirements, derive, compact, type Derived } from "./requirements";
import { scoreArchitecture } from "./scoring";
import type { AxisScores } from "./axes";

/**
 * The Architecture Advisor — a deterministic, rule-based recommender.
 *
 * It reads the `Requirements`, derives a few high-level flags, then applies an
 * ordered set of rules. Each rule justifies a component *in terms of the
 * constraints that triggered it*, so the output reads like an architect's
 * reasoning, not a parts list. Fully extensible: add a `COMPONENT_META` entry
 * and an `add(...)` call.
 */

export interface Alternative {
  name: string;
  note: string;
}

export interface Recommendation {
  id: string;
  conceptId?: string; // links to the Atlas lesson for a deep dive
  label: string;
  tier: number;
  crossCutting?: boolean;
  reason: string; // contextual — why, given THESE constraints
  solves: string;
  alternatives: Alternative[];
  tradeoff: string;
}

type Meta = Omit<Recommendation, "reason">;

const COMPONENT_META: Record<string, Meta> = {
  client: { id: "client", conceptId: "client", label: "Client", tier: 0, solves: "The origin of every request.", alternatives: [], tradeoff: "Untrusted — never enforce security here alone." },
  dns: { id: "dns", conceptId: "dns", label: "DNS (geo-routing)", tier: 1, solves: "Routes each user to the nearest healthy region.", alternatives: [{ name: "mDNS", note: "Local network discovery" }, { name: "Service discovery", note: "Consul/etcd for internal routing" }], tradeoff: "Changes are TTL-bound, not instant." },
  cdn: { id: "cdn", conceptId: "cdn", label: "CDN", tier: 2, solves: "Serves static & cacheable content from the edge.", alternatives: [{ name: "Edge compute", note: "Run logic at the edge" }, { name: "Origin-only", note: "Simpler but slow & fragile" }], tradeoff: "Cache invalidation is genuinely hard." },
  "load-balancer": { id: "load-balancer", conceptId: "load-balancer", label: "Load Balancer", tier: 3, solves: "Spreads traffic across a horizontal pool of app servers.", alternatives: [{ name: "DNS round-robin", note: "Crude, no health checks" }, { name: "Service mesh", note: "Sidecar east-west balancing" }], tradeoff: "Must itself be run redundantly." },
  "api-gateway": { id: "api-gateway", conceptId: "api-gateway", label: "API Gateway", tier: 4, solves: "Centralises auth, rate limiting & routing for the services.", alternatives: [{ name: "BFF", note: "A gateway per client type" }, { name: "Direct-to-service", note: "Duplicates concerns" }], tradeoff: "Can become a bottleneck or god-object." },
  services: { id: "services", conceptId: "services", label: "Application (Monolith)", tier: 5, solves: "Runs business logic as one simple deployable.", alternatives: [{ name: "Microservices", note: "Independent deploy/scale" }, { name: "Serverless", note: "Scale to zero per request" }], tradeoff: "Scales as a single unit." },
  microservices: { id: "microservices", conceptId: "services", label: "Microservices", tier: 5, solves: "Lets teams deploy & scale their slice independently.", alternatives: [{ name: "Modular monolith", note: "Clean modules, one deploy" }, { name: "Serverless", note: "Per-function scaling" }], tradeoff: "Full distributed-systems complexity." },
  cache: { id: "cache", conceptId: "cache", label: "Redis Cache", tier: 6, solves: "Absorbs hot reads in memory before they hit the DB.", alternatives: [{ name: "Memcached", note: "Simpler pure cache" }, { name: "Read replicas", note: "Scale reads with consistency" }], tradeoff: "Cache invalidation & stale reads." },
  database: { id: "database", conceptId: "database", label: "Database", tier: 7, solves: "The durable, consistent source of truth.", alternatives: [{ name: "NoSQL", note: "Horizontal writes, eventual" }, { name: "NewSQL", note: "SQL that shards (Spanner)" }], tradeoff: "The hardest tier to scale." },
  "read-replica": { id: "read-replica", conceptId: "read-replica", label: "Read Replicas", tier: 8, solves: "Multiplies read capacity & isolates heavy reads.", alternatives: [{ name: "Caching", note: "Cheaper for hot reads" }, { name: "CQRS", note: "Purpose-built read models" }], tradeoff: "Replication lag → stale reads." },
  sharding: { id: "sharding", conceptId: "sharding", label: "Sharding", tier: 9, solves: "Scales writes & storage past a single machine.", alternatives: [{ name: "NewSQL", note: "Shards for you" }, { name: "Vertical scaling", note: "Bigger box, for a while" }], tradeoff: "Cross-shard queries & brutal resharding." },
  "message-queue": { id: "message-queue", conceptId: "message-queue", label: "Message Queue", tier: 10, solves: "Decouples services & absorbs write/spike load async.", alternatives: [{ name: "Synchronous calls", note: "Direct coupling, simpler but tight" }, { name: "Database polling", note: "Simple but latent" }], tradeoff: "Eventual consistency & ordering to reason about." },
  analytics: { id: "analytics", conceptId: "analytics", label: "Analytics / Warehouse", tier: 11, solves: "Keeps heavy analytical scans off the transactional path.", alternatives: [{ name: "OLAP DB", note: "ClickHouse/Druid for near-real-time" }, { name: "Data lake", note: "S3 + query engine" }], tradeoff: "Data is seconds-to-hours stale depending on pipeline." },

  // cross-cutting reliability & ops layer
  "rate-limiter": { id: "rate-limiter", conceptId: "rate-limiter", label: "Rate Limiting", tier: 20, crossCutting: true, solves: "Protects capacity from abuse & retry storms.", alternatives: [{ name: "Token bucket", note: "Allows bursts" }, { name: "Load shedding", note: "Drop work when overloaded" }], tradeoff: "Too strict blocks legitimate users." },
  "circuit-breaker": { id: "circuit-breaker", conceptId: "circuit-breaker", label: "Circuit Breaker", tier: 21, crossCutting: true, solves: "Stops a slow dependency cascading into a fleet-wide outage.", alternatives: [{ name: "Retries + backoff", note: "Transient blips only" }, { name: "Bulkheads", note: "Isolate failure" }], tradeoff: "Needs a sensible fallback." },
  failover: { id: "failover", conceptId: "failover", label: "Failover", tier: 22, crossCutting: true, solves: "Promotes a standby automatically when the primary dies.", alternatives: [{ name: "Active-active", note: "All nodes serve" }, { name: "Accept downtime", note: "Sometimes fine" }], tradeoff: "Standby cost & split-brain risk." },
  "multi-region": { id: "multi-region", conceptId: "failover", label: "Multi-Region", tier: 23, crossCutting: true, solves: "Survives a whole-region outage and serves users locally.", alternatives: [{ name: "Single region + CDN", note: "Cheaper, weaker DR" }, { name: "Active-passive DR", note: "Standby region" }], tradeoff: "Cross-region consistency is hard & costly." },
  kubernetes: { id: "kubernetes", conceptId: "kubernetes", label: "Kubernetes", tier: 24, crossCutting: true, solves: "Schedules, scales & heals the service fleet.", alternatives: [{ name: "ECS / Nomad", note: "Simpler orchestrators" }, { name: "Serverless", note: "No orchestration" }], tradeoff: "Real operational weight." },
  observability: { id: "observability", conceptId: "observability", label: "Observability", tier: 25, crossCutting: true, solves: "Logs, metrics & traces to debug a distributed system.", alternatives: [{ name: "APM suite", note: "Datadog/New Relic" }, { name: "Logs only", note: "Cheap but blind" }], tradeoff: "Telemetry cost & alert noise." },
};

export interface AdvisorResult {
  recommendations: Recommendation[];
  scores: AxisScores;
  summary: string;
}

export function runAdvisor(r: Requirements): AdvisorResult {
  const d = derive(r);
  const picked = new Map<string, Recommendation>();
  const add = (id: string, reason: string) => {
    if (picked.has(id)) return;
    const meta = COMPONENT_META[id];
    if (meta) picked.set(id, { ...meta, reason });
  };

  add("client", "Every request originates here — the experience downstream is optimised for it.");

  const useMicro = d.highScale && !d.lean;
  if (useMicro) add("microservices", `At ${compact(r.rps)} rps the win from independent deploy & scaling outweighs the added complexity.`);
  else add("services", d.lean ? "A monolith keeps it simple and cheap — the right call until scale forces a split." : "One deployable is plenty here; don't split prematurely.");

  add(
    "database",
    r.consistency === "strong"
      ? "A relational primary (PostgreSQL) gives the ACID transactions your strong-consistency requirement needs."
      : r.consistency === "either" && d.highScale
        ? "Either SQL or NoSQL works here — SQL if you need joins, NoSQL if writes dominate."
        : d.hyperScale
          ? "At this write volume a wide-column store (Cassandra) trades strict consistency for horizontal writes."
          : "A relational primary remains the durable source of truth.",
  );

  if (d.highScale) add("load-balancer", `${compact(r.rps)} rps exceeds a single server — a load balancer spreads it across a horizontal pool.`);

  if (d.global) {
    add("dns", "Global users need geo-routing DNS to reach their nearest region.");
  }
  if (d.global || d.readHeavy) add("cdn", "A CDN serves static & cacheable content from the edge, cutting latency and offloading the origin.");
  if (d.tightLatency && !picked.has("cdn")) add("cdn", `A <${r.latencyMs}ms target means serving cacheable responses from the edge, close to users.`);

  if (d.readHeavy) {
    add("cache", `Reads are ${r.readPct}% of traffic — a cache absorbs the hot ones before they reach the database.`);
    if (d.highScale) add("read-replica", "Read replicas add capacity for the reads the cache misses.");
  } else if (d.tightLatency) {
    add("cache", "A cache trims database round-trips off the hot path to hit the latency target.");
  }

  if (useMicro) {
    add("api-gateway", "An API Gateway fronts the services with shared auth, rate limiting and routing.");
    add("kubernetes", "Kubernetes schedules, scales and heals the growing service fleet.");
  }

  if (d.writeHeavy && d.highScale) add("message-queue", `Writes are ${100 - r.readPct}% of a heavy load — a queue absorbs spikes and decouples ingestion from processing.`);
  if (d.hyperScale && (d.writeHeavy || r.users >= 10_000_000)) add("sharding", "Write volume exceeds a single primary; sharding partitions the data across machines.");
  if (d.hyperScale && !picked.has("message-queue")) add("message-queue", "At hyperscale, asynchronous messaging decouples services and smooths load.");
  if (picked.has("message-queue")) add("analytics", "The event stream doubles as a feed into an analytics warehouse, off the transactional path.");

  if (!picked.has("rate-limiter")) {
    const reason = d.highScale ? "At this scale you must throttle runaway or abusive clients to protect shared capacity." : "Rate limiting protects from abuse and retry storms.";
    add("rate-limiter", reason);
  }
  if (d.highScale) {
    add("circuit-breaker", "With many dependencies, circuit breakers keep one slow service from taking down the rest.");
  }
  if (d.highAvailability) {
    add("failover", `${r.availabilityNines}% availability needs automatic failover, not manual recovery.`);
    if (!picked.has("read-replica")) add("read-replica", "A replica can be promoted on primary failure, backing the availability target.");
  }
  if (d.highAvailability && d.global) add("multi-region", `${r.availabilityNines}% for global users means more than one region — survive a regional outage and serve locally.`);
  if (d.highScale || useMicro) add("observability", "At this complexity, logs/metrics/traces are essential to find where failures actually live.");

  const recommendations = [...picked.values()].sort((a, b) => a.tier - b.tier);
  const scores = scoreArchitecture(recommendations.map((x) => x.id));
  return { recommendations, scores, summary: buildSummary(r, d) };
}

function buildSummary(r: Requirements, d: Derived): string {
  const parts: string[] = [];
  parts.push(`For ${compact(r.users)} users at ~${compact(r.rps)} rps (${r.readPct}% reads, ${d.global ? "global" : "regional"})`);
  const levers: string[] = [];
  if (d.tightLatency) levers.push(`a <${r.latencyMs}ms latency target (CDN + cache + proximity)`);
  if (d.highAvailability) levers.push(`${r.availabilityNines}% availability (failover${d.global ? " + multi-region" : " + replicas"})`);
  if (d.readHeavy) levers.push("read-heavy scaling (cache + replicas)");
  if (d.writeHeavy && d.highScale) levers.push("write-heavy load (queue + sharding)");
  if (levers.length) parts.push(`the dominant constraints are ${levers.join(", ")}`);
  parts.push(r.consistency === "strong" ? "with strong consistency kept on a relational primary" : "trading strict consistency for scale where reads dominate");
  if (d.lean) parts.push("— deliberately kept lean to control cost");
  return parts.join(", ") + ".";
}
