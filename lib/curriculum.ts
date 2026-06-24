/**
 * Learning Curriculum — a structured path through the concept library.
 *
 * The platform has dozens of concepts, but a beginner shouldn't see them all at
 * once. This module defines prerequisite relationships, difficulty tiers, and
 * a suggested learning order so the UI can guide learners through a natural
 * progression instead of dumping everything on the first screen.
 */

export type DifficultyTier = "beginner" | "intermediate" | "advanced";

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  tier: DifficultyTier;
  /** Ordered list of concept ids to study in this module. */
  concepts: string[];
  /** Module ids that should be completed first. */
  prerequisites: string[];
}

/**
 * The full curriculum, ordered from foundational to advanced.
 * Each module groups related concepts that should be learned together.
 */
export const CURRICULUM: CurriculumModule[] = [
  // ── Beginner ──────────────────────────────────────────────────────
  {
    id: "how-the-web-works",
    title: "How the Web Works",
    description: "The request lifecycle: what happens when you type a URL and hit enter.",
    tier: "beginner",
    concepts: ["client", "dns", "tcp", "http"],
    prerequisites: [],
  },
  {
    id: "single-server",
    title: "The Single Server",
    description: "One server, one database — where every system starts.",
    tier: "beginner",
    concepts: ["database", "services", "rest"],
    prerequisites: ["how-the-web-works"],
  },
  {
    id: "first-scaling",
    title: "Your First Scaling Problem",
    description: "What happens when one server isn't enough, and the first tools to fix it.",
    tier: "beginner",
    concepts: ["load-balancer", "reverse-proxy", "scaling-types"],
    prerequisites: ["single-server"],
  },
  {
    id: "caching-basics",
    title: "Caching Basics",
    description: "Why the same data shouldn't be fetched from disk a thousand times a second.",
    tier: "beginner",
    concepts: ["cache", "cdn", "latency-vs-throughput"],
    prerequisites: ["first-scaling"],
  },

  // ── Intermediate ──────────────────────────────────────────────────
  {
    id: "database-scaling",
    title: "Scaling the Database",
    description: "Read replicas, indexing, and the read/write split.",
    tier: "intermediate",
    concepts: ["read-replica", "indexing", "read-api", "write-api", "cqrs"],
    prerequisites: ["caching-basics"],
  },
  {
    id: "async-processing",
    title: "Asynchronous Processing",
    description: "Queues, workers, and decoupling producers from consumers.",
    tier: "intermediate",
    concepts: ["message-queue", "task-queue", "worker-service", "write-api-async"],
    prerequisites: ["database-scaling"],
  },
  {
    id: "api-design",
    title: "API Design & Communication",
    description: "REST vs RPC, API gateways, and how services talk to each other.",
    tier: "intermediate",
    concepts: ["api-gateway", "rpc", "web-server", "udp"],
    prerequisites: ["first-scaling"],
  },
  {
    id: "reliability-fundamentals",
    title: "Reliability Fundamentals",
    description: "What happens when things fail, and how to survive it.",
    tier: "intermediate",
    concepts: ["circuit-breaker", "retry", "rate-limiter", "failover", "availability-nines"],
    prerequisites: ["async-processing"],
  },
  {
    id: "data-foundations",
    title: "Data Foundations",
    description: "The theoretical bedrock: CAP, ACID, BASE, and consistency models.",
    tier: "intermediate",
    concepts: ["cap-theorem", "acid", "base", "consistency-models"],
    prerequisites: ["database-scaling"],
  },

  // ── Advanced ──────────────────────────────────────────────────────
  {
    id: "write-scaling",
    title: "Scaling Writes",
    description: "When one database primary can't keep up: sharding, federation, and the costs.",
    tier: "advanced",
    concepts: ["sharding", "consistent-hashing", "federation", "nosql"],
    prerequisites: ["data-foundations", "reliability-fundamentals"],
  },
  {
    id: "data-modeling",
    title: "Data Modeling at Scale",
    description: "Denormalization, event sourcing, and choosing the right store.",
    tier: "advanced",
    concepts: ["denormalization", "object-store", "event-sourcing"],
    prerequisites: ["write-scaling"],
  },
  {
    id: "distributed-systems",
    title: "Distributed Systems",
    description: "Consensus, distributed locks, sagas, and the hardest problems in computing.",
    tier: "advanced",
    concepts: ["consensus", "distributed-lock", "sagas", "idempotency"],
    prerequisites: ["data-foundations", "reliability-fundamentals"],
  },
  {
    id: "microservices-infra",
    title: "Microservices Infrastructure",
    description: "Service mesh, discovery, orchestration, and observability.",
    tier: "advanced",
    concepts: ["service-discovery", "service-mesh", "kubernetes", "observability"],
    prerequisites: ["reliability-fundamentals", "api-design"],
  },
  {
    id: "operational-excellence",
    title: "Operational Excellence",
    description: "Deployment strategies, load shedding, backpressure, and production readiness.",
    tier: "advanced",
    concepts: ["deployments", "load-shedding", "back-pressure", "feature-flags", "tls"],
    prerequisites: ["microservices-infra"],
  },
  {
    id: "analytics-pipeline",
    title: "Analytics & Beyond",
    description: "Data warehouses, bloom filters, CRDTs, and the edges of the map.",
    tier: "advanced",
    concepts: ["analytics", "bloom-filter", "crdt", "connection-pool"],
    prerequisites: ["async-processing"],
  },
];

/** Prerequisite map for individual concepts (concept id → prerequisite concept ids). */
export const CONCEPT_PREREQUISITES: Record<string, string[]> = {
  // Beginner — networking & entry
  client: [],
  dns: ["client"],
  tcp: [],
  udp: ["tcp"],
  http: ["tcp"],
  rest: ["http"],
  rpc: ["http"],
  tls: ["tcp", "http"],

  // Beginner — first architecture
  database: [],
  services: [],
  "web-server": ["load-balancer"],
  "load-balancer": ["dns"],
  "reverse-proxy": ["load-balancer"],
  cdn: ["dns"],
  cache: ["database"],

  // Intermediate — scaling & separation
  "read-replica": ["database"],
  indexing: ["database"],
  "read-api": ["services", "cache"],
  "write-api": ["services", "database"],
  "write-api-async": ["write-api", "message-queue"],
  cqrs: ["read-api", "write-api"],
  "api-gateway": ["load-balancer", "services"],

  // Intermediate — async
  "message-queue": ["services"],
  "task-queue": ["message-queue"],
  "worker-service": ["message-queue"],

  // Intermediate — reliability
  "circuit-breaker": ["services", "rpc"],
  retry: ["rpc"],
  "rate-limiter": ["api-gateway"],
  failover: ["database", "read-replica"],
  "back-pressure": ["message-queue"],

  // Intermediate — data theory
  "cap-theorem": [],
  "consistency-models": ["cap-theorem"],
  acid: [],
  base: ["acid", "cap-theorem"],
  "scaling-types": [],
  "latency-vs-throughput": [],
  "availability-nines": [],

  // Advanced — write scaling
  sharding: ["database", "read-replica"],
  "consistent-hashing": ["sharding"],
  federation: ["database", "services"],
  nosql: ["database", "cap-theorem"],
  denormalization: ["database", "cache"],
  "object-store": ["database"],

  // Advanced — distributed systems
  consensus: ["cap-theorem", "failover"],
  "distributed-lock": ["cache", "consensus"],
  sagas: ["services", "message-queue", "acid"],
  idempotency: ["retry", "write-api"],
  "event-sourcing": ["database", "cqrs", "message-queue"],

  // Advanced — infrastructure
  kubernetes: ["services", "load-balancer"],
  observability: ["services"],
  "service-discovery": ["dns", "load-balancer", "services"],
  "service-mesh": ["services", "load-balancer", "circuit-breaker"],
  deployments: ["load-balancer", "observability"],
  "load-shedding": ["rate-limiter", "back-pressure"],
  "feature-flags": ["deployments", "services"],

  // Advanced — data & analytics
  analytics: ["database", "message-queue"],
  "bloom-filter": ["cache", "database"],
  crdt: ["consistency-models", "base"],
  "connection-pool": ["database", "tcp"],
};

/** Count of concepts per tier. */
export function tierCounts(): Record<DifficultyTier, number> {
  const counts: Record<DifficultyTier, number> = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const m of CURRICULUM) {
    counts[m.tier] += m.concepts.length;
  }
  return counts;
}

/** Flat ordered list of all concept ids in curriculum order. */
export function curriculumOrder(): string[] {
  return CURRICULUM.flatMap((m) => m.concepts);
}

/** Which module a concept belongs to, if any. */
export function moduleForConcept(conceptId: string): CurriculumModule | undefined {
  return CURRICULUM.find((m) => m.concepts.includes(conceptId));
}
