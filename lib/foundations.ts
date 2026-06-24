import type { Concept } from "./types";

/**
 * Foundations — the cross-cutting principles that don't sit at one spot on the
 * request-lifecycle map (CAP, consistency, ACID/BASE, scaling, the nines).
 * They are modelled as `Concept`s in the `foundation` category so they reuse the
 * existing detail panel, and they're surfaced in the Learn gallery.
 */
export const FOUNDATIONS: Concept[] = [
  {
    id: "cap-theorem",
    name: "CAP Theorem",
    category: "foundation",
    icon: "Triangle",
    tagline: "During a partition, choose: consistency or availability.",
    mentalModel: "When the phone line between two offices drops, each must choose: refuse to act (stay consistent) or act alone and reconcile later (stay available).",
    misconception: {
      myth: "CAP means you pick two of three: Consistency, Availability, Partition tolerance.",
      reality: "Partitions are not optional in a distributed system — they happen. So the real choice is only between C and A, and only during a partition.",
    },
    definition:
      "The CAP theorem states that a distributed system facing a network partition (P) must choose between Consistency (C) and Availability (A) — during a partition you cannot have both.",
    whyItExists:
      "Networks partition, full stop. CAP names the unavoidable tradeoff so architects choose behaviour deliberately instead of assuming they can have everything at once.",
    problemSolved:
      "Forces a conscious decision about what the system does during a partition — which in turn dictates datastore choice and user experience.",
    advantages: [
      "Clarifies the core distributed-systems tradeoff",
      "Guides datastore selection (CP vs AP)",
      "Sets correct expectations for behaviour under failure",
    ],
    disadvantages: [
      "Often oversimplified — it only applies during partitions",
      "Its 'C' is linearizability, not ACID's consistency",
      "PACELC is needed to also reason about latency",
    ],
    alternatives: [
      { name: "PACELC", note: "Adds latency-vs-consistency when there's no partition" },
      { name: "Tunable consistency", note: "Choose per-query, not per-system" },
    ],
    realWorld: [
      "CP: HBase, etcd, ZooKeeper require a quorum — minority partitions become unavailable to preserve consistency",
      "AP: Cassandra, DynamoDB stay available and reconcile later",
      "Banks lean CP; social feeds lean AP",
    ],
    interviewQuestions: [
      "What does CAP actually say — and not say?",
      "Give a concrete CP and AP example.",
      "Why is partition tolerance not optional in practice?",
    ],
    scaling:
      "CAP is the decision that shapes everything downstream: choosing AP buys availability at internet scale, while choosing CP buys correctness for money and inventory.",
    whenToUse:
      "As the first framing question when choosing a distributed datastore or designing replication: 'during a partition, does this use case need consistency (CP) or availability (AP)?' It clarifies which guarantee you're willing to sacrifice.",
    whenNotToUse:
      "Don't apply CAP to single-node systems (no partitions, no tradeoff). Don't use CAP alone — it says nothing about latency during normal operation. Reach for PACELC when you also need to reason about the latency-consistency tradeoff in the no-partition case.",
    relatedConcepts: ["consistency-models", "acid", "base", "database", "nosql"],
    prerequisites: [],
    sources: [
      { label: "Brewer — CAP Twelve Years Later", url: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/" },
      { label: "Martin Kleppmann — Please stop calling databases CP or AP", url: "https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html" },
      { label: "Gilbert & Lynch — Brewer's conjecture (formal proof)", url: "https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf" },
    ],
  },
  {
    id: "consistency-models",
    name: "Consistency Models",
    category: "foundation",
    icon: "GitCompare",
    tagline: "How fresh is the data you just read?",
    mentalModel: "A rumour spreading through a town — eventually everyone hears the same story, but for a while different people know different things.",
    misconception: {
      myth: "Eventual consistency means you'll eventually read the latest value.",
      reality: "It only guarantees replicas converge once writes stop. Mid-stream you may read stale data indefinitely — it says nothing about how fresh any individual read is.",
    },
    definition:
      "Consistency models define what a read is guaranteed to see relative to writes. Linearizability (the strongest) guarantees every read sees the most recent completed write, as if there were a single copy. Sequential consistency preserves the order of each client's operations but allows global reordering. Causal consistency preserves cause-and-effect ordering. Eventual consistency guarantees that, if writes stop, all replicas converge to the same value — but makes no guarantee about what you read in the meantime.",
    whyItExists:
      "Replication introduces lag, so 'the value' depends on when and where you read. Naming the guarantee lets applications reason about correctness instead of guessing.",
    problemSolved:
      "Sets explicit expectations about staleness, so you can decide where freshness is mandatory (money) and where lag is harmless (like counts).",
    advantages: [
      "Trade consistency for availability/latency deliberately",
      "Match the guarantee to each use case",
      "Quorums (R+W>N) overlap read and write sets for fresher reads — full linearizability still requires consensus",
    ],
    disadvantages: [
      "Weak models surprise developers with stale reads",
      "Read-your-writes needs explicit handling",
      "Stronger models cost coordination and latency",
    ],
    alternatives: [
      { name: "Quorum consistency", note: "R+W>N for tunable strength" },
      { name: "Causal consistency", note: "Preserve cause→effect ordering" },
    ],
    realWorld: [
      "Strong: bank balances, inventory counts",
      "Eventual: social feeds, view counts, DNS propagation",
      "Read-your-writes: show a user their own just-posted comment",
    ],
    interviewQuestions: [
      "Explain linearizability, sequential, causal, and eventual consistency.",
      "What is read-your-writes consistency and why is it tricky?",
      "How do quorums (R + W > N) improve read freshness, and why aren't they sufficient for linearizability?",
    ],
    scaling:
      "Internet-scale systems mostly pick eventual consistency to stay available and fast, reserving strong consistency for the few operations that genuinely require it.",
    whenToUse:
      "When choosing replication strategy: pick the weakest model your use case can tolerate — eventual for counters and feeds, read-your-writes for user-facing mutations, linearizable for money and inventory. Weaker = faster and more available.",
    whenNotToUse:
      "Don't default to strong consistency everywhere — the coordination cost kills latency and availability at scale. Conversely, don't use eventual consistency for financial balances or anything where a stale read causes real harm.",
    relatedConcepts: ["cap-theorem", "database", "read-replica", "acid", "base"],
    prerequisites: ["cap-theorem"],
    sources: [
      { label: "Jepsen — Consistency models", url: "https://jepsen.io/consistency" },
      { label: "AWS — Consistency models in DynamoDB", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html" },
      { label: "Martin Kleppmann — Designing Data-Intensive Applications (Ch. 9)", url: "https://dataintensive.net/" },
    ],
  },
  {
    id: "acid",
    name: "ACID",
    category: "foundation",
    icon: "ShieldCheck",
    tagline: "The guarantees behind a transaction.",
    mentalModel: "A bank transfer — either both the debit and the credit happen, or neither does. Never half.",
    misconception: {
      myth: "ACID's Consistency is the same as CAP's Consistency.",
      reality: "ACID's C means a transaction respects database constraints (valid state→valid state). CAP's C means every read sees the latest write (linearizability). Different ideas, same letter.",
    },
    definition:
      "ACID — Atomicity, Consistency, Isolation, Durability — are the guarantees relational databases give a transaction: all-or-nothing, the database transitions between valid states respecting all constraints, non-interfering concurrent access, and surviving crashes once committed.",
    whyItExists:
      "Concurrent access and crashes can corrupt data mid-update. ACID lets applications treat a complex multi-step operation as one reliable, indivisible unit.",
    problemSolved:
      "Guarantees correctness for operations that must never partially apply — money transfers, inventory decrements, seat bookings.",
    advantages: [
      "Strong correctness guarantees you can trust",
      "Simple mental model — transactions just work",
      "Crash-safe durability after commit",
    ],
    disadvantages: [
      "Coordination caps horizontal write scaling",
      "Isolation costs locks and latency",
      "Genuinely hard to achieve across distributed nodes",
    ],
    alternatives: [
      { name: "BASE", note: "Eventual consistency for scale" },
      { name: "Sagas", note: "Compensating steps for distributed transactions" },
    ],
    realWorld: [
      "PostgreSQL / MySQL transactions",
      "Double-entry bookkeeping",
      "Anything financial or inventory-critical",
    ],
    interviewQuestions: [
      "Explain each letter of ACID.",
      "Why is ACID hard to scale horizontally?",
      "What do the SQL isolation levels trade off?",
    ],
    scaling:
      "ACID is why a single relational primary is the hardest tier to scale — distributed ACID (Spanner, CockroachDB) exists but pays for it in latency and operational complexity.",
    whenToUse:
      "For any operation where partial application would be catastrophic — financial transfers, inventory decrements, booking systems. ACID transactions are the correct default for relational data until you have evidence they're the bottleneck.",
    whenNotToUse:
      "For high-throughput, eventually-consistent workloads (event streams, analytics ingestion, activity feeds) where the coordination overhead of transactions kills performance and availability. Consider BASE or saga patterns instead.",
    relatedConcepts: ["base", "cap-theorem", "database", "consistency-models", "sharding"],
    prerequisites: [],
    sources: [
      { label: "PostgreSQL — Transaction isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html" },
      { label: "Jepsen — Consistency models", url: "https://jepsen.io/consistency" },
      { label: "Jim Gray — The Transaction Concept", url: "https://jimgray.azurewebsites.net/papers/theTransactionConcept.pdf" },
    ],
  },
  {
    id: "base",
    name: "BASE",
    category: "foundation",
    icon: "CloudCog",
    tagline: "Trade strict guarantees for scale.",
    mentalModel: "A shop that always takes your order even if the stockroom is briefly out of sync — it reconciles afterward rather than making you wait.",
    misconception: {
      myth: "BASE is only for NoSQL databases.",
      reality: "BASE is a design philosophy — stay available, accept eventual convergence. It applies to any distributed system, including ones built on SQL engines.",
    },
    definition:
      "BASE — Basically Available, Soft state, Eventual consistency — is the distributed-systems counterpoint to ACID: stay available and scale out, and accept that data converges over time rather than being immediately consistent.",
    whyItExists:
      "ACID's coordination caps availability and scale. BASE relaxes those guarantees so systems can stay up and scale horizontally even during partitions.",
    problemSolved:
      "Enables internet-scale availability and write throughput by giving up immediate consistency.",
    advantages: [
      "High availability and horizontal scale",
      "Resilient to partitions",
      "Low-latency, always-accept writes",
    ],
    disadvantages: [
      "Stale reads until convergence",
      "Conflict resolution becomes your problem",
      "Harder for application code to reason about",
    ],
    alternatives: [
      { name: "ACID", note: "Strict correctness, harder to scale" },
      { name: "CRDTs", note: "Conflict-free merging by design" },
    ],
    realWorld: [
      "Cassandra, DynamoDB, Riak",
      "Shopping carts that reconcile concurrent edits",
      "Social feeds and activity streams",
    ],
    interviewQuestions: [
      "ACID vs BASE — when each?",
      "What does 'soft state' mean?",
      "How do AP systems resolve write conflicts?",
    ],
    scaling:
      "BASE is the philosophy that makes massive distributed datastores possible — availability and scale first, with consistency treated as a convergence process.",
    whenToUse:
      "When availability and horizontal write throughput matter more than immediate consistency — social feeds, shopping carts, activity streams, IoT telemetry. Any workload where 'always accept the write, reconcile later' is acceptable.",
    whenNotToUse:
      "For operations requiring strict correctness — financial transfers, inventory where overselling is costly, anything governed by a regulatory ledger. Use ACID transactions for these, even if it limits scale.",
    relatedConcepts: ["acid", "cap-theorem", "nosql", "consistency-models", "database"],
    prerequisites: ["acid", "cap-theorem"],
    sources: [
      { label: "Werner Vogels — Eventually Consistent", url: "https://www.allthingsdistributed.com/2008/12/eventually_consistent.html" },
      { label: "AWS — DynamoDB consistency", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html" },
      { label: "Dan Pritchett — BASE: An ACID Alternative", url: "https://dl.acm.org/doi/10.1145/1394127.1394128" },
    ],
  },
  {
    id: "scaling-types",
    name: "Vertical vs Horizontal Scaling",
    category: "foundation",
    icon: "Scaling",
    tagline: "Bigger box vs more boxes.",
    mentalModel: "Hire a stronger chef (scale up) versus hire more chefs (scale out). One has a ceiling; the other needs a kitchen that coordinates.",
    misconception: {
      myth: "Horizontal scaling is always better than vertical.",
      reality: "Scaling out brings distributed-systems complexity and requires statelessness. Scaling up is simpler and often the right first move — until you hit the single-machine ceiling.",
    },
    definition:
      "Vertical scaling (scale up) adds power to one machine; horizontal scaling (scale out) adds more machines to share the workload. Beyond a point, large systems must scale out.",
    whyItExists:
      "Demand eventually outgrows a single machine. You either buy a bigger one (simple but bounded) or spread load across many (complex but limitless).",
    problemSolved:
      "Frames the fundamental capacity decision — simplicity with a ceiling, versus complexity with elasticity.",
    advantages: [
      "Up: no code changes, no distribution problems",
      "Out: near-limitless capacity and elasticity",
      "Out: fault tolerance — lose a node, not the system",
    ],
    disadvantages: [
      "Up: hard ceiling and a single point of failure",
      "Out: requires statelessness and load balancing",
      "Out: brings full distributed-systems complexity",
    ],
    alternatives: [
      { name: "Hybrid", note: "Scale up first, then out" },
      { name: "Serverless", note: "Let the platform scale for you" },
    ],
    realWorld: [
      "Scale a DB primary up as far as it goes",
      "Scale the stateless app tier out behind a load balancer",
      "Autoscaling groups adding instances on demand",
    ],
    interviewQuestions: [
      "Vertical vs horizontal — the tradeoffs?",
      "Why is statelessness the key to scaling out?",
      "When do you stop scaling up?",
    ],
    scaling:
      "This whole app teaches it: keep the app tier stateless so it scales out freely, and push state into systems (cache, DB) that are designed to be scaled deliberately.",
    whenToUse:
      "Scale up first — it's simpler, requires no code changes, and buys time. Scale out when you hit the single-machine ceiling or need fault tolerance that one box can't provide. Most teams switch to horizontal scaling for stateless tiers early and keep the database vertical as long as possible.",
    whenNotToUse:
      "Don't scale out prematurely — distributed-systems complexity (consensus, partitioning, network failures) is real cost. If a bigger instance solves the problem for the next year, scale up.",
    relatedConcepts: ["load-balancer", "sharding", "read-replica", "kubernetes", "availability-nines"],
    prerequisites: [],
    sources: [
      { label: "AWS — Scalability concepts", url: "https://docs.aws.amazon.com/whitepapers/latest/web-application-hosting-best-practices/scalability.html" },
      { label: "Martin Fowler — Scalability", url: "https://martinfowler.com/bliki/Scalability.html" },
      { label: "Google SRE — Handling overload", url: "https://sre.google/sre-book/handling-overload/" },
    ],
  },
  {
    id: "latency-vs-throughput",
    name: "Latency vs Throughput",
    category: "foundation",
    icon: "Timer",
    tagline: "Speed of one vs volume of many.",
    mentalModel: "A single-lane racetrack versus a wide highway — one car can be fast (latency) while a highway moves many cars per minute (throughput).",
    misconception: {
      myth: "Higher throughput means lower latency.",
      reality: "They often trade off. Batching raises throughput but adds latency to each item. Improving one can regress the other — name your real target.",
    },
    definition:
      "Latency is how long a single operation takes; throughput is how many operations complete per unit time. Related but distinct — and frequently in tension.",
    whyItExists:
      "Optimizing one can hurt the other — batching raises throughput but adds latency. Naming both keeps design goals explicit and honest.",
    problemSolved:
      "Separates two performance goals so you optimize for the one your users actually feel.",
    advantages: [
      "Clarifies the real performance target",
      "Exposes the batching/pipelining tradeoff",
      "Drives the right metric: p99 latency vs req/s",
    ],
    disadvantages: [
      "Easy to conflate the two",
      "Averages hide tail latency",
      "Improving one can regress the other",
    ],
    alternatives: [
      { name: "Percentiles", note: "Track p50/p95/p99, not the mean" },
    ],
    realWorld: [
      "Batching & pipelining to raise throughput",
      "CDNs and caches to cut latency",
      "Dashboards reporting p99, not average, latency",
    ],
    interviewQuestions: [
      "Define latency and throughput.",
      "How does batching trade one for the other?",
      "Why report p99 instead of the average?",
    ],
    scaling:
      "Scaling out usually raises throughput; cutting latency needs caching, proximity (CDN/edge) and fewer round trips. Always measure the tail (p99), never just the mean.",
    whenToUse:
      "As the first question when setting performance targets: 'is the user waiting for one response (latency) or are we processing a firehose (throughput)?' Name the real goal before you optimise, because techniques for one can hurt the other.",
    whenNotToUse:
      "Don't conflate the two — batching raises throughput but adds latency; pipelining helps throughput but not individual request time. If someone says 'make it faster', clarify which dimension before reaching for a tool.",
    relatedConcepts: ["cache", "cdn", "load-balancer", "availability-nines", "back-pressure"],
    prerequisites: [],
    sources: [
      { label: "Google SRE — Monitoring distributed systems", url: "https://sre.google/sre-book/monitoring-distributed-systems/" },
      { label: "Gil Tene — How NOT to measure latency", url: "https://www.youtube.com/watch?v=lJ8ydIuPFeU" },
      { label: "AWS — Performance pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html" },
    ],
  },
  {
    id: "availability-nines",
    name: "Availability & the Nines",
    category: "foundation",
    icon: "BadgeCheck",
    tagline: "What '99.9%' actually costs you.",
    mentalModel: "An error budget, not a badge — 99.9% literally means you're allowed ~8.8 hours of downtime a year to spend.",
    misconception: {
      myth: "Each extra nine is a small incremental improvement.",
      reality: "Each nine cuts allowed downtime ~10×: 99.9% is 8.8h/yr, 99.99% is 52min, 99.999% is 5min. The cost to achieve each one grows exponentially.",
    },
    definition:
      "Availability is the fraction of time a system is operational, expressed in 'nines': 99.9% (~8.8h down/yr), 99.99% (~52min), 99.999% (~5min). Each extra nine is exponentially harder.",
    whyItExists:
      "'Highly available' means nothing without numbers. The nines quantify an uptime target and the concrete downtime budget it allows.",
    problemSolved:
      "Turns availability into a measurable SLO with an error budget, guiding exactly how much redundancy is worth buying.",
    advantages: [
      "Quantifies reliability as a target",
      "Defines an error budget to spend",
      "Makes the ROI of redundancy explicit",
    ],
    disadvantages: [
      "Each extra nine costs exponentially more",
      "Sequential dependencies multiply (99% × 99% ≈ 98.01%)",
      "Measuring true availability is genuinely hard",
    ],
    alternatives: [
      { name: "SLO / SLI", note: "Service-level objectives & indicators" },
      { name: "Error budgets", note: "Spend allowed downtime intentionally" },
    ],
    realWorld: [
      "Cloud SLAs of 99.9–99.99%",
      "Multi-AZ / multi-region for extra nines",
      "Public status pages and incident budgets",
    ],
    interviewQuestions: [
      "How much yearly downtime is 99.99%?",
      "Why do dependencies multiply availability?",
      "How does redundancy add nines?",
    ],
    scaling:
      "More nines come from removing single points of failure — redundancy, failover, multi-region — but every nine multiplies cost, so target the SLO your users actually need.",
    whenToUse:
      "When setting an SLO — translate the business impact of downtime into a concrete nines target, then engineer to that budget. Define error budgets early; they drive decisions about deploys, testing, and redundancy investment.",
    whenNotToUse:
      "Don't chase five nines when three nines are sufficient for your users — each additional nine costs ~10× more in redundancy, operational effort, and deployment constraints. Over-engineering availability wastes money and slows feature velocity.",
    relatedConcepts: ["failover", "load-balancer", "observability", "scaling-types", "cap-theorem"],
    prerequisites: ["scaling-types"],
    sources: [
      { label: "Google SRE — Embracing risk", url: "https://sre.google/sre-book/embracing-risk/" },
      { label: "Google SRE — Service Level Objectives", url: "https://sre.google/sre-book/service-level-objectives/" },
      { label: "AWS — Availability concepts", url: "https://docs.aws.amazon.com/whitepapers/latest/availability-and-beyond-improving-resilience/availability.html" },
    ],
  },
];
