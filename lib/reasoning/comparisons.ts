import type { AxisScores } from "./axes";

/**
 * Architecture Comparison — visual, side-by-side. Each comparison overlays two
 * options on one radar and lines up their characteristics. Hand-authored scores
 * keep the radar meaningful for conceptual (non-architecture) comparisons.
 */

export interface CompareSide {
  name: string;
  conceptId?: string;
  tagline: string;
  scores: AxisScores;
  bestFor: string;
}

export interface CompareRow {
  label: string;
  a: string;
  b: string;
}

export interface Comparison {
  id: string;
  title: string;
  a: CompareSide;
  b: CompareSide;
  rows: CompareRow[];
}

const s = (scalability: number, reliability: number, latency: number, cost: number, simplicity: number, operability: number): AxisScores => ({
  scalability, reliability, latency, cost, simplicity, operability,
});

export const COMPARISONS: Comparison[] = [
  {
    id: "mono-micro",
    title: "Monolith vs Microservices",
    a: { name: "Monolith", conceptId: "services", tagline: "One deployable, in-process.", scores: s(40, 55, 72, 82, 90, 85), bestFor: "Small teams, early products, a single clear domain." },
    b: { name: "Microservices", conceptId: "services", tagline: "Many services, independently deployed.", scores: s(85, 75, 58, 45, 30, 35), bestFor: "Many teams needing independent deploy & scale at large scale." },
    rows: [
      { label: "Performance", a: "In-process calls — no network hops", b: "Network hops between services add latency" },
      { label: "Scaling", a: "Scale the whole app as one unit", b: "Scale hot services independently" },
      { label: "Failure behavior", a: "One bug can take the whole app down", b: "Failure isolated to a service (if boundaries are clean)" },
      { label: "Consistency", a: "Easy ACID transactions", b: "Distributed — needs sagas / eventual consistency" },
      { label: "Ops complexity", a: "One deploy, one log stream", b: "Many deploys, tracing, service mesh, orchestration" },
    ],
  },
  {
    id: "pg-cassandra",
    title: "PostgreSQL vs Cassandra",
    a: { name: "PostgreSQL", conceptId: "database", tagline: "Relational, ACID, joins.", scores: s(45, 78, 70, 72, 78, 70), bestFor: "Relational data, transactions and complex queries." },
    b: { name: "Cassandra", conceptId: "nosql", tagline: "Wide-column, AP, horizontal writes.", scores: s(95, 85, 65, 55, 35, 42), bestFor: "Massive write scale, always-on, simple access patterns." },
    rows: [
      { label: "Data model", a: "Relational with joins", b: "Wide-column, denormalized, no joins" },
      { label: "Consistency", a: "Strong (ACID)", b: "Tunable, eventual (AP)" },
      { label: "Scaling", a: "Vertical + read replicas; sharding is manual", b: "Horizontal writes out of the box" },
      { label: "Failure behavior", a: "Primary failover (brief write outage)", b: "No single primary — survives node loss" },
      { label: "Query power", a: "Rich SQL, ad-hoc queries", b: "Query only by your partition key" },
    ],
  },
  {
    id: "kafka-rabbit",
    title: "Kafka vs RabbitMQ",
    a: { name: "Kafka", conceptId: "message-queue", tagline: "Distributed, replayable log.", scores: s(95, 85, 60, 60, 40, 45), bestFor: "High-throughput streaming, event sourcing, replay." },
    b: { name: "RabbitMQ", conceptId: "message-queue", tagline: "Flexible broker with rich routing.", scores: s(65, 75, 76, 70, 62, 60), bestFor: "Complex routing and task queues at lower volume." },
    rows: [
      { label: "Model", a: "Log — messages retained & replayable", b: "Broker — messages consumed and gone" },
      { label: "Throughput", a: "Very high (partitioned)", b: "Moderate" },
      { label: "Routing", a: "Simple topic / partition", b: "Rich (exchanges, bindings, priorities)" },
      { label: "Ordering & replay", a: "Ordered per partition, replayable", b: "No native replay" },
      { label: "Best for", a: "Streams & analytics pipelines", b: "Background jobs & RPC-style work" },
    ],
  },
  {
    id: "rest-grpc",
    title: "REST vs gRPC",
    a: { name: "REST", conceptId: "rest", tagline: "JSON over HTTP, cacheable.", scores: s(70, 70, 60, 72, 82, 75), bestFor: "Public APIs, browser clients, cacheable reads." },
    b: { name: "gRPC", conceptId: "rpc", tagline: "Protobuf over HTTP/2, typed.", scores: s(80, 75, 88, 65, 50, 55), bestFor: "Internal service-to-service, low latency, typed contracts." },
    rows: [
      { label: "Encoding", a: "JSON over HTTP (typically 1.1 or 2) — human-readable", b: "Protobuf binary over HTTP/2" },
      { label: "Performance", a: "Larger payloads, more overhead", b: "Compact, multiplexed, fast" },
      { label: "Caching", a: "HTTP caching works out of the box", b: "Not cacheable by default" },
      { label: "Contract", a: "Loose (OpenAPI optional)", b: "Strong, code-generated stubs" },
      { label: "Browser support", a: "Native", b: "Needs a grpc-web proxy" },
    ],
  },
  {
    id: "sync-async",
    title: "Synchronous vs Asynchronous",
    a: { name: "Synchronous", conceptId: "rpc", tagline: "Caller waits for the result.", scores: s(55, 55, 82, 75, 80, 75), bestFor: "Request/response where the caller needs the answer now." },
    b: { name: "Asynchronous", conceptId: "message-queue", tagline: "Fire-and-forget via a queue.", scores: s(85, 85, 50, 65, 45, 50), bestFor: "Decoupled, spiky or long-running work." },
    rows: [
      { label: "Coupling", a: "Temporal — caller blocks on callee", b: "Decoupled in time via a queue" },
      { label: "Failure behavior", a: "Downstream down → the caller fails", b: "Downstream down → work buffered & retried" },
      { label: "Latency", a: "Lower for the single call", b: "Higher end-to-end (eventual)" },
      { label: "Traffic spikes", a: "Backpressure propagates immediately", b: "The queue absorbs the spike" },
      { label: "Complexity", a: "Simple to reason about", b: "Eventual consistency & idempotency to handle" },
    ],
  },
];
