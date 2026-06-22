/**
 * Tradeoff Simulator. The user expresses what they *prioritise* on six sliders;
 * the engine matches that priority shape against a small set of architecture
 * archetypes and surfaces the closest fit — with its real component stack, score
 * radar, and the costs it imposes. The point: you cannot maximise everything.
 */

export type PriorityId = "consistency" | "availability" | "latency" | "throughput" | "cost" | "simplicity";

export interface Priority {
  id: PriorityId;
  label: string;
  hint: string;
}

export const PRIORITIES: Priority[] = [
  { id: "consistency", label: "Consistency", hint: "Reads must reflect the latest write" },
  { id: "availability", label: "Availability", hint: "Stay up through failures" },
  { id: "latency", label: "Low latency", hint: "Fast p99 responses" },
  { id: "throughput", label: "Throughput", hint: "Handle huge write/scale volume" },
  { id: "cost", label: "Low cost", hint: "Cheap to run" },
  { id: "simplicity", label: "Simplicity", hint: "Few moving parts" },
];

export type PriorityVector = Record<PriorityId, number>;

export interface Archetype {
  id: string;
  name: string;
  blurb: string;
  /** What this archetype delivers on each priority (0–100). */
  profile: PriorityVector;
  /** Component ids (for the score radar + display), maps to the Atlas. */
  components: string[];
  pros: string[];
  cons: string[];
  ops: string;
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "lean-monolith",
    name: "Lean Monolith",
    blurb: "One app, one relational DB, one region. The cheapest correct thing.",
    profile: { consistency: 90, availability: 60, latency: 50, throughput: 25, cost: 95, simplicity: 95 },
    components: ["client", "services", "database"],
    pros: ["Trivial to build, deploy and reason about", "Strong consistency for free (ACID)", "Cheapest possible footprint"],
    cons: ["Single points of failure everywhere", "Scales only by buying a bigger box", "No global latency story"],
    ops: "One service, one DB — a single on-call can hold it all in their head.",
  },
  {
    id: "relational-replicas",
    name: "Relational + Replicas",
    blurb: "PostgreSQL with a cache and read replicas behind a load balancer.",
    profile: { consistency: 85, availability: 70, latency: 70, throughput: 55, cost: 60, simplicity: 60 },
    components: ["client", "load-balancer", "services", "cache", "database", "read-replica"],
    pros: ["Keeps strong consistency on the primary", "Scales reads well via cache + replicas", "A replica can be promoted on failure"],
    cons: ["Writes still bottleneck on one primary", "Replication lag → stale reads", "More moving parts than a monolith"],
    ops: "Familiar relational ops plus replica lag and cache invalidation to watch.",
  },
  {
    id: "ap-distributed",
    name: "AP Distributed (Cassandra)",
    blurb: "A horizontally-sharded, always-available store with eventual consistency.",
    profile: { consistency: 25, availability: 95, latency: 75, throughput: 95, cost: 55, simplicity: 30 },
    components: ["client", "load-balancer", "services", "database", "sharding", "message-queue"],
    pros: ["Stays available through partitions (AP)", "Scales writes horizontally, near-limitless", "No single primary to bottleneck"],
    cons: ["Eventual consistency — conflicts to resolve", "Model data per query, not per entity", "No ad-hoc joins"],
    ops: "Tune consistency levels & compaction; data modelling is the hard part.",
  },
  {
    id: "global-multiregion",
    name: "Global Multi-Region",
    blurb: "CDN + multi-region microservices with failover. The five-nines stack.",
    profile: { consistency: 55, availability: 98, latency: 90, throughput: 80, cost: 20, simplicity: 15 },
    components: ["client", "dns", "cdn", "load-balancer", "api-gateway", "microservices", "cache", "database", "read-replica", "multi-region", "failover", "observability"],
    pros: ["Survives a whole-region outage", "Low latency for users everywhere", "Independent scaling of every tier"],
    cons: ["Expensive — many regions and components", "Cross-region consistency is genuinely hard", "Heavy operational surface area"],
    ops: "A platform team's full-time job: orchestration, multi-region data, deep observability.",
  },
  {
    id: "event-cqrs",
    name: "Event-Driven (CQRS + Kafka)",
    blurb: "Writes flow through a log; read models are projected and denormalised.",
    profile: { consistency: 45, availability: 85, latency: 80, throughput: 95, cost: 50, simplicity: 30 },
    components: ["client", "load-balancer", "api-gateway", "microservices", "cache", "database", "message-queue", "cqrs", "analytics"],
    pros: ["Massive write throughput, decoupled in time", "Read models tailored to each query", "Replayable event history"],
    cons: ["Eventual consistency between write & read sides", "Many moving parts and async debugging", "Overkill for simple CRUD"],
    ops: "Operate Kafka, consumers and projections; watch consumer lag closely.",
  },
  {
    id: "serverless",
    name: "Serverless",
    blurb: "Functions + managed DB + CDN. The platform scales for you.",
    profile: { consistency: 60, availability: 85, latency: 55, throughput: 70, cost: 80, simplicity: 80 },
    components: ["client", "cdn", "api-gateway", "services", "cache", "database"],
    pros: ["Scales to zero — pay per request", "No servers to operate", "Fast to ship"],
    cons: ["Cold starts hurt tail latency", "Vendor lock-in & limits", "Hard to do long-running / stateful work"],
    ops: "Almost no infra ops — but observability and cost control still matter.",
  },
];

export const BALANCED_PRIORITIES: PriorityVector = {
  consistency: 60,
  availability: 70,
  latency: 70,
  throughput: 60,
  cost: 50,
  simplicity: 50,
};

export interface ArchetypeMatch {
  archetype: Archetype;
  fit: number; // 0–100, higher is a closer match
}

/** Rank archetypes by how closely their profile matches the desired priorities. */
export function matchArchetypes(desired: PriorityVector): ArchetypeMatch[] {
  const keys = PRIORITIES.map((p) => p.id);
  return ARCHETYPES.map((archetype) => {
    const sse = keys.reduce((acc, k) => {
      const diff = desired[k] - archetype.profile[k];
      return acc + diff * diff;
    }, 0);
    const rmse = Math.sqrt(sse / keys.length);
    return { archetype, fit: Math.round(Math.max(0, 100 - rmse)) };
  }).sort((a, b) => b.fit - a.fit);
}
