/**
 * Bottleneck Diagnosis scenarios. Each is a realistic incident: a context, a set
 * of runtime metrics, a multiple-choice "what's the bottleneck?", and — once
 * answered — the root cause, the evidence that points to it, fixes, and the
 * transferable lesson. Add cases by appending to SCENARIOS.
 */

export type MetricStatus = "good" | "warn" | "bad";
export interface Metric {
  label: string;
  value: string;
  status: MetricStatus;
}
export interface DiagOption {
  id: string;
  label: string;
}
export interface Scenario {
  id: string;
  title: string;
  context: string;
  metrics: Metric[];
  question: string;
  options: DiagOption[];
  correctId: string;
  rootCause: string;
  evidence: string;
  solutions: { label: string; note: string }[];
  lesson: string;
  conceptId?: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "db-overload",
    title: "Database Overload",
    context: "A read-heavy web app. Traffic doubled this week and pages are crawling.",
    metrics: [
      { label: "Database CPU", value: "96%", status: "bad" },
      { label: "p99 latency", value: "1,200 ms", status: "bad" },
      { label: "Cache hit rate", value: "12%", status: "bad" },
      { label: "App server CPU", value: "40%", status: "good" },
    ],
    question: "What is the primary bottleneck?",
    options: [
      { id: "db", label: "Database, overwhelmed by uncached reads" },
      { id: "app", label: "App servers are underpowered" },
      { id: "net", label: "Network saturation" },
      { id: "client", label: "Slow client-side rendering" },
    ],
    correctId: "db",
    rootCause: "The cache hit rate has collapsed to 12%, so almost every read falls through to the database, pinning its CPU and spiking latency.",
    evidence: "DB CPU 96% + cache hit 12%, while app CPU sits at 40% — the database is the wall, not the app tier.",
    solutions: [
      { label: "Fix / warm the cache", note: "Raise the hit rate so reads stop hitting the DB" },
      { label: "Add read replicas", note: "Spread the surviving read load" },
      { label: "Add indexes", note: "Make the hot queries cheaper" },
    ],
    lesson: "Database latency almost always traces back to reads that should have been served from memory. Fix the cache before you scale the DB.",
    conceptId: "cache",
  },
  {
    id: "hot-partition",
    title: "Hot Partition",
    context: "A sharded database. A celebrity user's data all lives on shard 3.",
    metrics: [
      { label: "Shard 3 CPU", value: "98%", status: "bad" },
      { label: "Shard 1 & 2 CPU", value: "25%", status: "good" },
      { label: "p99 latency", value: "1,500 ms", status: "bad" },
      { label: "Cluster avg load", value: "normal", status: "good" },
    ],
    question: "Why is latency spiking when average load looks fine?",
    options: [
      { id: "hot", label: "Hot partition — a skewed shard key concentrates load" },
      { id: "few", label: "Simply too few shards overall" },
      { id: "disk", label: "Disk failure on shard 3" },
      { id: "cold", label: "Cache is cold" },
    ],
    correctId: "hot",
    rootCause: "The shard key concentrates one hot key's traffic onto a single shard. Aggregate load looks healthy while that one shard melts.",
    evidence: "Shard 3 at 98% while peers sit at 25% — that's skew, not aggregate overload.",
    solutions: [
      { label: "Higher-cardinality shard key", note: "Spread keys evenly" },
      { label: "Split / replicate the hot key", note: "Give it dedicated capacity" },
      { label: "Cache the hot key", note: "Absorb its reads before the shard" },
    ],
    lesson: "Averages hide hotspots. A poor shard key creates a hot partition that simply adding more shards won't fix.",
    conceptId: "sharding",
  },
  {
    id: "cache-stampede",
    title: "Cache Miss Storm",
    context: "A very popular cached item's TTL expired during peak traffic.",
    metrics: [
      { label: "DB QPS", value: "20× spike", status: "bad" },
      { label: "Identical queries", value: "thousands/s", status: "bad" },
      { label: "p99 latency", value: "800 ms", status: "warn" },
      { label: "Spike timing", value: "exactly at TTL expiry", status: "bad" },
    ],
    question: "What caused the sudden database spike?",
    options: [
      { id: "stampede", label: "Cache stampede — many requests recompute the same expired key" },
      { id: "ddos", label: "External DDoS attack" },
      { id: "failover", label: "Database failover event" },
      { id: "leak", label: "Application memory leak" },
    ],
    correctId: "stampede",
    rootCause: "When a hot key expires, thousands of concurrent requests all miss simultaneously and hammer the database for the very same value.",
    evidence: "A 20× spike of identical queries landing exactly at the key's TTL expiry — a thundering herd.",
    solutions: [
      { label: "Request coalescing", note: "Single-flight: one recompute, others wait" },
      { label: "Jittered TTLs", note: "Stop keys expiring in lockstep" },
      { label: "Stale-while-revalidate", note: "Serve stale, refresh in background" },
    ],
    lesson: "A single expiring hot key can DDoS your own database. Coalesce recomputation and jitter your TTLs.",
    conceptId: "cache",
  },
  {
    id: "kafka-backlog",
    title: "Kafka Backlog",
    context: "An order pipeline: producers → Kafka → a consumer service that writes to the DB.",
    metrics: [
      { label: "Consumer lag", value: "4M msgs", status: "bad" },
      { label: "Producer rate", value: "high", status: "warn" },
      { label: "Consumer throughput", value: "flat", status: "bad" },
      { label: "Orders delay", value: "~8 min", status: "bad" },
    ],
    question: "Why are orders being processed minutes late?",
    options: [
      { id: "consumers", label: "Consumers can't keep up — under-partitioned / under-scaled" },
      { id: "down", label: "Kafka itself is down" },
      { id: "producers", label: "Producers are too slow" },
      { id: "partition", label: "Network partition" },
    ],
    correctId: "consumers",
    rootCause: "Consumers process slower than producers publish, so lag grows without bound — often because there are too few partitions to parallelise across.",
    evidence: "Lag climbing to 4M while producer rate stays high and consumer throughput is flat — the consumers, not Kafka, are the limit.",
    solutions: [
      { label: "Add partitions + consumers", note: "More parallelism in the consumer group" },
      { label: "Speed up per-message work", note: "Batch the DB writes" },
      { label: "Back pressure upstream", note: "Slow producers if lag persists" },
    ],
    lesson: "A queue hides overload as latency, not errors. Watch consumer lag, and scale consumers (and partitions) to match producers.",
    conceptId: "message-queue",
  },
  {
    id: "slow-consumer",
    title: "Slow Dependency",
    context: "A service calls a slow third-party API synchronously inside the request path.",
    metrics: [
      { label: "Thread pool", value: "exhausted", status: "bad" },
      { label: "Service p99", value: "5,000 ms", status: "bad" },
      { label: "3rd-party p99", value: "4,800 ms", status: "bad" },
      { label: "Timeout errors", value: "rising", status: "bad" },
    ],
    question: "Why is the whole service degraded, not just that one endpoint?",
    options: [
      { id: "exhaust", label: "The slow dependency exhausts the shared thread pool, blocking everything" },
      { id: "db", label: "The database is down" },
      { id: "gc", label: "Garbage-collection pauses" },
      { id: "deploy", label: "A bad deploy" },
    ],
    correctId: "exhaust",
    rootCause: "Synchronous calls to a slow dependency pile up and exhaust the shared thread/connection pool, so even unrelated requests can no longer be served.",
    evidence: "Thread pool exhausted and the service p99 tracks the dependency's p99 — the dependency is dragging the whole service down.",
    solutions: [
      { label: "Circuit breaker + timeout", note: "Fail fast instead of blocking" },
      { label: "Bulkhead the pool", note: "Isolate threads per dependency" },
      { label: "Make it async", note: "Queue the work off the request path" },
    ],
    lesson: "One slow dependency takes down everything that shares its threads. Isolate it with timeouts, breakers and bulkheads.",
    conceptId: "circuit-breaker",
  },
  {
    id: "n-plus-one",
    title: "N+1 Query Problem",
    context: "A list endpoint renders 100 items, each showing its author's name.",
    metrics: [
      { label: "Queries / request", value: "101", status: "bad" },
      { label: "Per-query time", value: "fast (2 ms)", status: "good" },
      { label: "p99 latency", value: "900 ms", status: "warn" },
      { label: "DB CPU", value: "70%", status: "warn" },
    ],
    question: "Why is one page slow when every individual query is fast?",
    options: [
      { id: "nplus1", label: "N+1 — one query per item instead of a join or batch" },
      { id: "index", label: "A missing index" },
      { id: "net", label: "Slow network" },
      { id: "payload", label: "Payload too large" },
    ],
    correctId: "nplus1",
    rootCause: "The code runs 1 query for the list plus 1 per item (the +N). 100 items become 101 serial round-trips — each cheap, but the count kills you.",
    evidence: "101 queries per request, each only 2 ms — the cost is the number of round-trips, not any single query.",
    solutions: [
      { label: "Eager-load with a JOIN", note: "Fetch authors in the same query" },
      { label: "Batch the fetch", note: "One IN-query / dataloader for all authors" },
      { label: "Cache authors", note: "Avoid re-fetching hot ones" },
    ],
    lesson: "Death by a thousand fast queries. Count round-trips, not just per-query time.",
    conceptId: "database",
  },
  {
    id: "lb-skew",
    title: "Load Balancer Skew",
    context: "App servers behind a load balancer, with sticky sessions pinning users to a node.",
    metrics: [
      { label: "App server #2 CPU", value: "95%", status: "bad" },
      { label: "Other servers CPU", value: "30%", status: "good" },
      { label: "LB throughput", value: "normal", status: "good" },
      { label: "p99 latency", value: "elevated", status: "warn" },
    ],
    question: "Why is one server hot while the others sit idle?",
    options: [
      { id: "sticky", label: "Sticky sessions skew load onto a few servers" },
      { id: "undersized", label: "That one server is undersized" },
      { id: "lbfail", label: "The load balancer is failing" },
      { id: "dns", label: "A DNS issue" },
    ],
    correctId: "sticky",
    rootCause: "Session affinity routes returning users back to the same node, so load is distributed by sessions rather than by current work.",
    evidence: "One server at 95% while peers sit at 30%, with LB throughput normal — it's a distribution problem, not a capacity one.",
    solutions: [
      { label: "Externalise session state", note: "Push sessions to Redis, drop stickiness" },
      { label: "Least-connections balancing", note: "Route to the idlest node" },
      { label: "Shorten affinity", note: "Rebalance more aggressively" },
    ],
    lesson: "Stateless servers distribute evenly; sticky state re-creates the single-server hotspot you scaled out to avoid.",
    conceptId: "load-balancer",
  },
  {
    id: "regional-outage",
    title: "Regional Outage",
    context: "A single-region deployment. The cloud region just suffered a network incident.",
    metrics: [
      { label: "Region availability", value: "0%", status: "bad" },
      { label: "Error rate", value: "100%", status: "bad" },
      { label: "Other regions", value: "none", status: "bad" },
      { label: "Recovery path", value: "unknown", status: "bad" },
    ],
    question: "Why is the entire product down — and what would have prevented it?",
    options: [
      { id: "single", label: "Single region is a single point of failure — needs multi-region" },
      { id: "deploy", label: "A bad deploy" },
      { id: "corrupt", label: "Database corruption" },
      { id: "evict", label: "Cache eviction" },
    ],
    correctId: "single",
    rootCause: "Everything runs in one region, so a regional incident takes the whole product offline — there is nowhere to fail over to.",
    evidence: "A 100% error rate that correlates exactly with the region's incident, and no second region to absorb traffic.",
    solutions: [
      { label: "Multi-region active-active", note: "Survive a region loss with zero downtime" },
      { label: "Active-passive DR", note: "A standby region with geo-routing failover" },
      { label: "Cross-region backups", note: "At minimum, a tested recovery runbook" },
    ],
    lesson: "One region is one failure domain. Your advertised nines can't exceed the region's — go multi-region for the top tier.",
    conceptId: "failover",
  },
];
