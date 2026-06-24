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

// ═══════════════════════════════════════════════════════════════════════════
// Journey 6: GET /products · cache down — failure path
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_DOWN_JOURNEY: JourneyHop[] = [
  {
    node: "client",
    via: null,
    title: "The request is born",
    what: "The browser issues GET /products to api.shop.com.",
    why: "A normal read request — but the cache is about to be unreachable.",
    cost: "0 ms",
  },
  {
    node: "dns",
    via: "client-dns",
    title: "Resolve the hostname",
    what: "api.shop.com resolves to the load balancer's IP.",
    why: "DNS doesn't know the cache is down — resolution is unaffected.",
    cost: "~1 ms (cached)",
  },
  {
    node: "load-balancer",
    via: "dns-lb",
    title: "Pick a healthy server",
    what: "The load balancer routes to a healthy web server.",
    why: "The load balancer health-checks app servers, not the cache — traffic flows normally.",
    cost: "+1 ms",
  },
  {
    node: "web-server",
    via: "lb-web",
    title: "Route through the web server",
    what: "The web server routes GET to the Read API.",
    why: "Routing is unaware of downstream cache health.",
    cost: "+1 ms",
  },
  {
    node: "read-api",
    via: "web-read",
    title: "Enter the Read API",
    what: "The Read API attempts its normal cache-first lookup.",
    why: "The read path always tries the cache first — but this time it won't respond.",
    cost: "+1 ms",
  },
  {
    node: "cache",
    via: "read-cache",
    title: "Cache is unreachable!",
    what: "The Read API's cache lookup times out after 50ms — Redis is down. The request falls through to the database.",
    why: "Short cache timeouts are critical: without one, every request would hang waiting for a dead cache, turning a cache outage into a total outage. The timeout triggers a graceful fallback.",
    decision: {
      question: "Redis is unreachable — what should the Read API do?",
      outcome: "FALLBACK — the cache call timed out. Skip the cache and query the database directly. Every request now pays the full database cost.",
      alternative: "If there were no timeout, threads would pile up waiting for a dead cache, and the entire Read API would stall — a cache outage would cascade into a total outage.",
    },
    cost: "+50 ms (timeout)",
  },
  {
    node: "read-replica",
    via: "cache-sqlr",
    title: "Every read hits the database",
    what: "Without the cache absorbing reads, every request goes to the read replica. The database — sized assuming the cache handles 80% of reads — takes 5× normal load. p99 climbs from 11ms to 35ms.",
    why: "This is a cache stampede in real time. The database can survive briefly, but connection pools fill and queries queue. If Redis stays down, the database becomes the next failure point.",
    cost: "+35 ms (under load)",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Journey 7: POST /orders · DB failover — failure path
// ═══════════════════════════════════════════════════════════════════════════

const DB_FAILOVER_JOURNEY: JourneyHop[] = [
  {
    node: "client",
    via: null,
    title: "The write request is born",
    what: "The browser submits POST /orders — but the database primary is about to crash.",
    why: "The user clicked 'Place Order' with no idea the primary is failing. This is where failover earns its keep.",
    cost: "0 ms",
  },
  {
    node: "dns",
    via: "client-dns",
    title: "Resolve the hostname",
    what: "api.shop.com resolves normally.",
    why: "DNS doesn't know about database health.",
    cost: "~1 ms (cached)",
  },
  {
    node: "load-balancer",
    via: "dns-lb",
    title: "Pick a healthy server",
    what: "The load balancer routes to a web server — app servers are still healthy.",
    why: "The load balancer checks app server health, not database health. Traffic flows normally to the app tier.",
    cost: "+1 ms",
  },
  {
    node: "web-server",
    via: "lb-web",
    title: "Route to the write path",
    what: "The web server routes POST /orders to the Write API.",
    why: "The routing layer is unaware of the downstream database failure.",
    cost: "+1 ms",
  },
  {
    node: "write-api",
    via: "web-write",
    title: "Write fails — primary is down",
    what: "The Write API validates the order and attempts to write to the SQL primary — but the connection fails. The primary has crashed.",
    why: "During the failover window (~10-30 seconds), all write requests return 500 errors. This is the most painful moment in a database's life — and exactly why automatic failover and replica promotion exist.",
    decision: {
      question: "The primary database is unreachable. What happens?",
      outcome: "FAILOVER — the health monitor detects the primary is dead and begins promoting a read replica. During the ~10-30 second window, writes fail with 500 errors.",
      alternative: "Without automatic failover, a human would need to wake up, diagnose, and manually promote — turning a 30-second blip into a multi-hour outage.",
    },
    cost: "~10-30s (failover gap)",
  },
  {
    node: "database",
    via: "write-db",
    title: "Replica promoted — writes resume",
    what: "The read replica has been promoted to the new primary. The Write API reconnects. The order is retried and committed successfully.",
    why: "Failover turns a hardware death into a brief blip. The promoted replica was already nearly in sync (minus seconds of replication lag). A new replica is provisioned to restore redundancy.",
    cost: "+12 ms",
  },
  {
    node: "cache",
    via: "write-cache",
    title: "Business as usual",
    what: "The Write API invalidates the stale cache entry. The system has healed itself.",
    why: "The only evidence of the failure is a brief spike in the error rate dashboard. New writes flow to the promoted primary, reads are served, and a fresh replica is being provisioned.",
    cost: "+1 ms",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Journey 8: order.created event — fan-out to multiple consumers
// ═══════════════════════════════════════════════════════════════════════════

const FAN_OUT_JOURNEY: JourneyHop[] = [
  {
    node: "write-api",
    via: null,
    title: "An order is committed",
    what: "The Write API has just committed a new order to the database. Before returning, it publishes an order.created event to the message queue.",
    why: "The write path's job is to persist and confirm. Everything else — emails, inventory, analytics — should not slow down the response or couple the write path to downstream services.",
    cost: "0 ms",
  },
  {
    node: "message-queue",
    via: null,
    title: "Event enters the topic",
    what: "The order.created event lands in a durable, partitioned Kafka topic. It is now available for any number of consumer groups to read — independently, at their own pace.",
    why: "The producer publishes once; any number of consumers can subscribe without the producer knowing or caring who they are. Adding a new consumer requires zero changes to the publisher.",
    decision: {
      question: "How many services will process this single event?",
      outcome: "FAN-OUT — three independent consumer groups each read the same event: email, inventory, and analytics. Each processes at its own speed; one being slow doesn't affect the others.",
      alternative: "Without fan-out, the write path would call each service synchronously — tripling latency and creating a failure chain where one slow service blocks the entire response.",
    },
    cost: "+2 ms",
  },
  {
    node: "worker-service",
    via: "queue-worker",
    title: "Email consumer sends confirmation",
    what: "The email consumer group picks up the event and sends a confirmation email via an external SMTP provider. If the send fails, the message stays in the queue for retry.",
    why: "Each consumer group maintains its own offset — it reads independently. The email service being slow or down has zero impact on inventory or analytics.",
    cost: "~50 ms (async)",
  },
  {
    node: "database",
    via: "worker-db",
    title: "Inventory consumer decrements stock",
    what: "A separate inventory consumer reads the same event and decrements the product's stock count. This happens asynchronously — the user already has their order confirmation.",
    why: "Eventual consistency: the stock count may be briefly stale, but it converges quickly. For most products this brief window is acceptable — for limited drops, you'd use synchronous reservation.",
    cost: "~8 ms (async)",
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
  {
    id: "cache-down",
    label: "GET /products · cache down",
    short: "Cache failure",
    sublabel: "What happens when Redis dies",
    hops: CACHE_DOWN_JOURNEY,
    total: "≈ 90 ms (degraded)",
  },
  {
    id: "db-failover",
    label: "POST /orders · DB failover",
    short: "DB failover",
    sublabel: "What happens when the primary crashes",
    hops: DB_FAILOVER_JOURNEY,
    total: "~30s gap, then ≈ 16 ms",
  },
  {
    id: "fan-out",
    label: "order.created event",
    short: "Fan-out",
    sublabel: "One event, many consumers",
    hops: FAN_OUT_JOURNEY,
    total: "≈ 3 ms publish + async",
  },
];

/** Default journey for backwards compat. */
export const JOURNEY = READ_JOURNEY;

/** Total modelled end-to-end latency for the default journey. */
export const JOURNEY_TOTAL = "≈ 16 ms";
