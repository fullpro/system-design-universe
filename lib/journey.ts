/**
 * Request Journey — a guided, narrated packet that travels the World Map so a
 * learner *watches* a request flow through the system and sees each decision
 * resolve, instead of reading a static chart.
 *
 * Each hop lands on a map node, having traversed a specific map edge (`via`).
 * Every hop answers What happened and Why; decision hops show the branch the
 * request actually took and the alternative it could have taken. Node ids and
 * edge ids are the *real* ones from `lib/map.ts`, so the journey lights up the
 * existing graph rather than a parallel drawing.
 */

export interface JourneyDecision {
  /** The question the component is answering at this hop. */
  question: string;
  /** The branch this request actually takes, and why. */
  outcome: string;
  /** The road not taken — what would have happened on the other branch. */
  alternative: string;
}

export interface JourneyHop {
  /** Map node id this hop lands on. */
  node: string;
  /** Map edge id traversed to reach this hop (null for the origin). */
  via: string | null;
  /** Short imperative title, e.g. "Resolve the hostname". */
  title: string;
  /** What concretely happens at this hop. */
  what: string;
  /** Why this component exists in the path at all. */
  why: string;
  /** Optional branch the request resolves here. */
  decision?: JourneyDecision;
  /** Optional latency annotation, surfaced as a chip. */
  cost?: string;
}

export interface JourneyDef {
  id: string;
  label: string;
  /** Compact, unambiguous label for tight/mobile layouts (never just an HTTP verb). */
  short: string;
  sublabel: string;
  hops: JourneyHop[];
  total: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Journey 1: GET /products — the read path
// ═══════════════════════════════════════════════════════════════════════════

const READ_JOURNEY: JourneyHop[] = [
  {
    node: "client",
    via: null,
    title: "The request is born",
    what: "The browser issues GET /products to api.shop.com.",
    why: "Every request starts at a client. From here on, the whole system exists to answer this one call as fast and reliably as it can.",
    cost: "0 ms",
  },
  {
    node: "dns",
    via: "client-dns",
    title: "Resolve the hostname",
    what: "api.shop.com is translated into an IP address the network can route to — the load balancer's address.",
    why: "Humans use names, networks use numbers. DNS is the indirection that lets the IP behind the name change — for failover or migration — without the client ever knowing.",
    cost: "~1 ms (cached)",
  },
  {
    node: "load-balancer",
    via: "dns-lb",
    title: "Pick a healthy server",
    what: "The load balancer forwards the request to one web server from a pool, using least-connections.",
    why: "One server has a ceiling and can die. The balancer spreads load across many and routes around the dead ones — this is what makes the web tier horizontally scalable.",
    cost: "+1 ms",
  },
  {
    node: "web-server",
    via: "lb-web",
    title: "Route through the web server",
    what: "The web server receives the GET request and routes it to the Read API inside the API Gateway.",
    why: "The web server is the single entry point that fans requests out to specialized API tiers: reads, writes, and async writes each have their own optimised path.",
    cost: "+1 ms",
  },
  {
    node: "read-api",
    via: "web-read",
    title: "Enter the Read API",
    what: "The Read API handles the GET request and checks the memory cache before touching any database.",
    why: "Separating reads from writes lets each scale independently. The read path is optimised for low latency — cache first, replica second, never the write master.",
    cost: "+1 ms",
  },
  {
    node: "cache",
    via: "read-cache",
    title: "Check the memory cache",
    what: "The Read API runs a cache lookup for products:top before considering any database.",
    why: "Cache-aside: read memory first. A hit is sub-millisecond and spares the database entirely.",
    decision: {
      question: "Is products:top in the cache (and not expired)?",
      outcome: "MISS — this key isn't cached yet. The request falls through to the SQL read replicas.",
      alternative: "On a HIT the response returns here in <1 ms and no database is ever touched — which is what happens for the next reader.",
    },
    cost: "+1 ms",
  },
  {
    node: "read-replica",
    via: "cache-sqlr",
    title: "Query a read replica",
    what: "The read replica runs the indexed query and returns the product rows. The Read API writes them back into the cache with a TTL, then sends the response all the way back to the client.",
    why: "Read replicas absorb read load so the write master stays free for writes. Because the result is now cached, the very next GET /products skips this hop entirely.",
    cost: "+11 ms",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Journey 2: POST /orders — the write path
// ═══════════════════════════════════════════════════════════════════════════

const WRITE_JOURNEY: JourneyHop[] = [
  {
    node: "client",
    via: null,
    title: "The write request is born",
    what: "The browser submits POST /orders with a cart payload.",
    why: "The user clicked 'Place Order' — this is a mutation that must be durable and confirmed before the client moves on.",
    cost: "0 ms",
  },
  {
    node: "dns",
    via: "client-dns",
    title: "Resolve the hostname",
    what: "api.shop.com resolves to the load balancer's IP, same as any request.",
    why: "DNS doesn't care about HTTP methods — reads and writes resolve the same way.",
    cost: "~1 ms (cached)",
  },
  {
    node: "load-balancer",
    via: "dns-lb",
    title: "Pick a healthy server",
    what: "The load balancer routes POST /orders to a web server.",
    why: "The load balancer is method-agnostic — it spreads all traffic evenly. The routing decision happens downstream at the web server.",
    cost: "+1 ms",
  },
  {
    node: "web-server",
    via: "lb-web",
    title: "Route to the write path",
    what: "The web server sees POST /orders and routes it to the Write API — this is a synchronous mutation that needs immediate confirmation.",
    why: "The web server distinguishes reads from writes. A POST goes to the Write API; a GET would go to the Read API. This separation lets each path scale independently.",
    decision: {
      question: "Is this a synchronous or async write?",
      outcome: "SYNCHRONOUS — the client needs to know the order was placed before leaving the page. It goes to the Write API.",
      alternative: "For fire-and-forget work (send confirmation email, generate invoice PDF) it would go to the Write API Async → Queue path instead.",
    },
    cost: "+1 ms",
  },
  {
    node: "write-api",
    via: "web-write",
    title: "Validate and persist",
    what: "The Write API validates the order, checks inventory, and writes the record to the SQL write master.",
    why: "Synchronous writes go to the single source of truth — the write master. The caller blocks until the write is durable, getting a definitive success or failure.",
    cost: "+3 ms",
  },
  {
    node: "database",
    via: "write-db",
    title: "Commit to the write master",
    what: "The SQL write master inserts the order row inside a transaction. The write is now durable.",
    why: "The write master is the single authority — all writes go through it to maintain a consistent ordering. Replicas will receive this change via the replication stream.",
    cost: "+8 ms",
  },
  {
    node: "cache",
    via: "write-cache",
    title: "Invalidate the cache",
    what: "The Write API deletes the stale orders cache entry so the next read fetches fresh data from the replica.",
    why: "After a write, the cached version is stale. Invalidating immediately means the next reader gets the updated data — this is how you solve 'I just placed an order but I don't see it.'",
    cost: "+1 ms",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Journey 3: GET /products (cache hit) — the blazing fast read path
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_HIT_JOURNEY: JourneyHop[] = [
  {
    node: "client",
    via: null,
    title: "The request is born",
    what: "The browser issues GET /products to api.shop.com.",
    why: "Every request starts at a client.",
    cost: "0 ms",
  },
  {
    node: "dns",
    via: "client-dns",
    title: "Resolve the hostname",
    what: "api.shop.com resolves to the load balancer's IP.",
    why: "DNS decouples names from infrastructure.",
    cost: "~1 ms (cached)",
  },
  {
    node: "load-balancer",
    via: "dns-lb",
    title: "Pick a healthy server",
    what: "The load balancer routes to one web server.",
    why: "Spreads load across many servers for resilience and scale.",
    cost: "+1 ms",
  },
  {
    node: "web-server",
    via: "lb-web",
    title: "Route through the web server",
    what: "The web server routes GET to the Read API.",
    why: "Single entry point that fans requests to specialized paths.",
    cost: "+1 ms",
  },
  {
    node: "read-api",
    via: "web-read",
    title: "Enter the Read API",
    what: "The Read API checks the memory cache.",
    why: "Separating reads from writes lets each scale independently.",
    cost: "+1 ms",
  },
  {
    node: "cache",
    via: "read-cache",
    title: "Cache HIT!",
    what: "The product data is already in memory — return immediately.",
    why: "Cache-aside pattern: memory is sub-millisecond, spares the database entirely.",
    decision: {
      question: "Is products:top in the cache?",
      outcome: "HIT! The response returns here in <1 ms. No database touch.",
      alternative: "On a MISS, the request would fall through to read replicas.",
    },
    cost: "<1 ms",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Journey 4: POST /email — async background job
// ═══════════════════════════════════════════════════════════════════════════

const ASYNC_JOB_JOURNEY: JourneyHop[] = [
  {
    node: "client",
    via: null,
    title: "Fire-and-forget request",
    what: "The client submits POST /email to send a confirmation email asynchronously.",
    why: "The user doesn't need to wait for the email to actually send — acknowledge immediately.",
    cost: "0 ms",
  },
  {
    node: "dns",
    via: "client-dns",
    title: "Resolve the hostname",
    what: "api.shop.com resolves to the load balancer.",
    why: "DNS abstracts away IP changes.",
    cost: "~1 ms (cached)",
  },
  {
    node: "load-balancer",
    via: "dns-lb",
    title: "Pick a healthy server",
    what: "The load balancer routes to a web server.",
    why: "Ensures no single server becomes a bottleneck.",
    cost: "+1 ms",
  },
  {
    node: "web-server",
    via: "lb-web",
    title: "Route to async handler",
    what: "The web server sees this is async work and routes to Write API Async.",
    why: "Fire-and-forget requests go through a different path optimized for queueing.",
    cost: "+1 ms",
  },
  {
    node: "write-api-async",
    via: "web-async",
    title: "Enqueue the job",
    what: "Write API Async validates the request and pushes a job onto the message queue.",
    why: "Decouples the client from slow background work — respond fast, process later.",
    cost: "+2 ms",
  },
  {
    node: "message-queue",
    via: "async-queue",
    title: "Job enters the queue",
    what: "The job sits in the queue, waiting for a worker to pick it up.",
    why: "Queues absorb spiky load and provide durability — jobs won't be lost on restart.",
    cost: "+1 ms",
  },
  {
    node: "worker-service",
    via: "queue-worker",
    title: "Worker processes the job",
    what: "A worker pulls the job and sends the confirmation email (via external SMTP service).",
    why: "Workers run in the background at their own pace — no time pressure from clients.",
    cost: "~50 ms (external I/O)",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Journey 5: GET /static/app.js — static asset delivery via CDN
// ═══════════════════════════════════════════════════════════════════════════

const CDN_STATIC_JOURNEY: JourneyHop[] = [
  {
    node: "client",
    via: null,
    title: "Fetch static asset",
    what: "The browser loads GET /static/app.js from cdn.shop.com.",
    why: "Static assets (JS, CSS, images) don't need to hit your origin — they're cacheable worldwide.",
    cost: "0 ms",
  },
  {
    node: "dns",
    via: "client-dns",
    title: "Resolve CDN hostname",
    what: "cdn.shop.com resolves to a CDN edge node geographically close to the user.",
    why: "DNS anycast directs users to the nearest edge location.",
    cost: "~1 ms (cached)",
  },
  {
    node: "cdn",
    via: "dns-cdn",
    title: "CDN serves from edge cache",
    what: "The nearest CDN edge node returns the file from its local cache (usually a HIT).",
    why: "Geographic proximity shrinks latency — edge cache is often sub-10ms from the user.",
    decision: {
      question: "Is app.js cached on this edge?",
      outcome: "HIT! Serve from edge cache in ~5 ms — blazing fast.",
      alternative: "On a MISS, the CDN would fetch from origin, then cache for future requests.",
    },
    cost: "~5 ms",
  },
];

export const JOURNEYS: JourneyDef[] = [
  {
    id: "read",
    label: "GET /products · cold",
    short: "Cold read",
    sublabel: "Read path — cache miss",
    hops: READ_JOURNEY,
    total: "≈ 16 ms",
  },
  {
    id: "write",
    label: "POST /orders",
    short: "Write",
    sublabel: "Write path — place an order",
    hops: WRITE_JOURNEY,
    total: "≈ 15 ms",
  },
  {
    id: "cache-hit",
    label: "GET /products · cached",
    short: "Warm read",
    sublabel: "Read path — cache hit (fast!)",
    hops: CACHE_HIT_JOURNEY,
    total: "≈ 5 ms",
  },
  {
    id: "async-job",
    label: "POST /email",
    short: "Async job",
    sublabel: "Async background job",
    hops: ASYNC_JOB_JOURNEY,
    total: "≈ 6 ms (immediate), ~50 ms (background)",
  },
  {
    id: "cdn-static",
    label: "GET /static",
    short: "Static asset",
    sublabel: "CDN static asset delivery",
    hops: CDN_STATIC_JOURNEY,
    total: "≈ 6 ms (edge cache hit)",
  },
];

/** Default journey for backwards compat. */
export const JOURNEY = READ_JOURNEY;

/** Total modelled end-to-end latency for the default journey. */
export const JOURNEY_TOTAL = "≈ 16 ms";
