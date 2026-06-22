import type { Concept } from "./types";
import { FOUNDATIONS } from "./foundations";

/**
 * The concept library — the educational core of System Design Universe.
 *
 * Every concept is a self-contained lesson. Add a new technology by appending a
 * `Concept` object here; it automatically becomes available to the detail panel,
 * the legend and (if it defines an `internal` flow) the zoom-in view.
 */
const INFRA_CONCEPTS: Concept[] = [
  // ───────────────────────────────────────── Client
  {
    id: "client",
    name: "Client",
    category: "client",
    icon: "MonitorSmartphone",
    tagline: "Where every request is born.",
    mentalModel: "The customer standing at the counter — everything behind it exists to serve them.",
    misconception: {
      myth: "The client is just a dumb screen; all the work is on the server.",
      reality: "Modern clients render, validate, cache and retry. They do real work — but you still can't trust them for security.",
    },
    consequenceIfRemoved: "Nothing initiates requests. The client is the source of all demand; without it the system has nothing to serve.",
    definition:
      "The user-facing surface — a browser, mobile app, IoT device or another service — that initiates requests and renders responses.",
    whyItExists:
      "Systems exist to serve users. The client is the origin of demand and the final judge of latency: everything downstream is optimised so the client feels fast.",
    problemSolved:
      "Gives humans (or machines) a way to express intent and consume results without knowing anything about the servers behind the curtain.",
    advantages: [
      "Can cache, retry and degrade gracefully on its own",
      "Modern clients do real work (rendering, validation), offloading servers",
      "Closest point to the user — best place to measure real experience",
    ],
    disadvantages: [
      "Untrusted: never rely on client-side checks for security",
      "Wildly heterogeneous (networks, devices, versions) — hard to control",
      "Limited compute and memory on mobile devices; battery constraints",
    ],
    alternatives: [
      { name: "Server-side rendering", note: "Move work back to the server for thin clients" },
      { name: "Edge rendering", note: "Render close to the user to cut latency" },
    ],
    realWorld: [
      "A React SPA calling a JSON API",
      "A mobile app talking gRPC to a backend",
      "A service acting as a client to another service",
    ],
    interviewQuestions: [
      "Where should validation live — client, server, or both?",
      "How do you handle an offline-first client?",
      "What can a client safely cache, and for how long?",
    ],
    scaling:
      "Clients scale themselves — every user brings their own device. The challenge is the fan-in: millions of independent clients converging on shared infrastructure.",
  },

  // ───────────────────────────────────────── DNS
  {
    id: "dns",
    name: "DNS",
    category: "networking",
    icon: "Globe",
    tagline: "The phone book of the internet.",
    mentalModel: "The internet's phonebook — you know the name, it gives you the number.",
    misconception: {
      myth: "DNS changes take effect instantly.",
      reality: "Records are cached at every layer for their TTL. A change can take minutes to hours to fully propagate — which is why low TTLs precede a planned migration.",
    },
    consequenceIfRemoved: "Clients would have to hardcode IP addresses. Any server move or failover would break every client until they were manually updated.",
    definition:
      "The Domain Name System translates human-friendly names like api.example.com into the IP addresses machines actually route to.",
    whyItExists:
      "Humans remember names; networks route to numbers. DNS is the indirection layer that lets IPs change behind a stable name — enabling failover, load distribution and migrations without touching clients.",
    problemSolved:
      "Removes the need to hardcode server IPs and provides a global, cacheable, hierarchical lookup that resolves in milliseconds.",
    advantages: [
      "Decouples names from infrastructure — swap servers freely",
      "Heavily cached at every layer (browser, OS, resolver)",
      "Enables geo-routing, weighted routing and health-based failover",
    ],
    disadvantages: [
      "Propagation is governed by TTLs — changes aren't instant",
      "A misconfiguration can take an entire domain offline",
      "Plain DNS is unencrypted (mitigated by DoH / DoT)",
    ],
    alternatives: [
      { name: "Hardcoded IPs", note: "Brittle; breaks on any infra change" },
      { name: "Service discovery", note: "Consul/etcd for internal east-west traffic" },
      { name: "Anycast", note: "Same IP announced from many locations" },
    ],
    realWorld: [
      "Route 53, Cloudflare DNS, NS1 powering global routing",
      "GeoDNS sending EU users to EU data centres",
      "Low-TTL records enabling fast failover during incidents",
    ],
    interviewQuestions: [
      "Walk me through what happens after you type a URL and hit enter.",
      "How does DNS-based failover work, and what's its weakness?",
      "Why might a DNS change not take effect immediately?",
    ],
    scaling:
      "DNS scales through aggressive caching and anycast: the same record is served from thousands of edge locations, so lookups stay sub-10ms regardless of global query volume.",
    internal: {
      summary: "A recursive resolver walks the DNS hierarchy until it finds an authoritative answer, caching at every hop.",
      nodes: [
        { id: "browser", label: "Browser", sublabel: "needs IP for example.com", kind: "start", detail: "You typed a hostname, but the network only routes to IP addresses. The browser asks its configured recursive resolver to find the IP behind example.com." },
        { id: "resolver", label: "Recursive Resolver", sublabel: "ISP or 8.8.8.8", kind: "step", detail: "The recursive resolver does the legwork on your behalf — it will walk the DNS hierarchy and hand back a final answer, so the browser only makes one request." },
        { id: "cached", label: "In cache?", kind: "decision", detail: "First the resolver checks its own cache. Most lookups stop here — this is why DNS feels instant and why a record change isn't visible until its TTL expires." },
        { id: "return", label: "Return cached IP", sublabel: "TTL not expired", kind: "terminal", detail: "Cache hit: the resolver returns the stored IP immediately, skipping the whole hierarchy. The answer is reused until its time-to-live runs out." },
        { id: "root", label: "Root Nameserver", sublabel: "delegates .com", kind: "step", detail: "Cache miss: the resolver starts at the top. The root servers don't know example.com, but they know who runs .com and point the resolver there." },
        { id: "tld", label: "TLD Nameserver", sublabel: "knows example.com's NS", kind: "step", detail: "The .com TLD server doesn't hold the final answer either — it knows which authoritative nameserver is responsible for example.com and delegates down." },
        { id: "auth", label: "Authoritative NS", sublabel: "holds the A record", kind: "step", detail: "The authoritative nameserver is the source of truth for example.com. It holds the actual A record and returns the real IP address." },
        { id: "ip", label: "IP Address", sublabel: "93.184.216.34", kind: "terminal", detail: "The IP travels back up, getting cached at each hop along the way, so the next person asking for example.com gets it far faster." },
      ],
      edges: [
        { source: "browser", target: "resolver" },
        { source: "resolver", target: "cached" },
        { source: "cached", target: "return", label: "yes" },
        { source: "cached", target: "root", label: "no" },
        { source: "root", target: "tld" },
        { source: "tld", target: "auth" },
        { source: "auth", target: "ip" },
      ],
      failures: [
        {
          at: "resolver",
          label: "Resolver down",
          what: "If the recursive resolver is unreachable, name resolution fails and the user can't connect at all — even though your servers are perfectly healthy.",
          recovery: "Clients are configured with multiple resolvers (e.g. 8.8.8.8 and 1.1.1.1) and fail over between them; OS and browser caches still answer for recently-seen names during a brief outage.",
        },
        {
          at: "auth",
          label: "Authoritative timeout",
          what: "If your authoritative nameserver times out, new lookups for your domain fail until a cached answer is found elsewhere.",
          recovery: "Run redundant authoritative nameservers across providers and networks (anycast), so a single one failing never takes the whole domain offline.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── CDN
  {
    id: "cdn",
    name: "CDN",
    category: "edge",
    icon: "Network",
    tagline: "Your content, cached next door.",
    mentalModel: "A chain of local warehouses — your stuff is stocked in a city near every customer.",
    misconception: {
      myth: "A CDN only makes things faster.",
      reality: "It also absorbs traffic spikes and DDoS, and shields the origin from read load — availability and resilience, not just latency.",
    },
    consequenceIfRemoved: "Every asset request travels to the origin. Distant users pay full round-trip latency and the origin shoulders all read load, becoming the bottleneck under traffic.",
    definition:
      "A Content Delivery Network is a globally distributed fleet of edge servers that cache content close to users, slashing latency and offloading the origin.",
    whyItExists:
      "Light travels fast, but not instantly — a request from Sydney to Virginia pays ~200ms round-trip. A CDN serves that user from a nearby city instead, and absorbs traffic that would otherwise crush the origin.",
    problemSolved:
      "Eliminates repeated long-haul fetches for cacheable content (images, JS, video, even API responses) and shields the origin from read load and DDoS.",
    advantages: [
      "Dramatically lower latency via geographic proximity",
      "Massive origin offload — most requests never reach you",
      "Built-in DDoS absorption and TLS termination at the edge",
    ],
    disadvantages: [
      "Cache invalidation is genuinely hard to get right",
      "Stale content risk if TTLs and purge logic are sloppy",
      "Less effective for highly dynamic, per-user responses",
    ],
    alternatives: [
      { name: "Origin-only", note: "Simpler, but slow and fragile under load" },
      { name: "Edge compute", note: "Run logic at the edge, not just cache" },
      { name: "Reverse proxy cache", note: "Varnish/Nginx near the origin" },
    ],
    realWorld: [
      "Cloudflare, Akamai, Fastly, CloudFront",
      "Netflix Open Connect caching video inside ISPs",
      "Static site assets served entirely from the edge",
    ],
    interviewQuestions: [
      "How would you design cache invalidation for a CDN?",
      "What's cacheable vs. not, and how do you decide TTLs?",
      "How does a CDN help with availability, not just latency?",
    ],
    scaling:
      "CDNs are the original horizontally-scaled system: add more PoPs and the cache hit ratio climbs while origin load stays flat. The metric that matters is hit ratio — every percentage point is origin traffic you never pay for.",
    internal: {
      summary: "A request lands at the nearest edge PoP; a cache hit returns instantly, a miss fetches from origin and populates the edge.",
      nodes: [
        { id: "req", label: "Request", sublabel: "GET /logo.png", kind: "start", detail: "A user requests a static asset. Instead of crossing the planet to your origin, DNS/anycast steers them to the physically nearest CDN location." },
        { id: "edge", label: "Nearest Edge PoP", sublabel: "anycast routed", kind: "step", detail: "The request lands at the closest point-of-presence — maybe a few milliseconds away — rather than the origin that could be an ocean apart." },
        { id: "hit", label: "Cache hit?", kind: "decision", detail: "The edge checks whether it already has a fresh copy of this asset. The cache-hit ratio is the metric that matters: every hit is a request your origin never sees." },
        { id: "serve", label: "Serve from edge", sublabel: "~10ms", kind: "terminal", detail: "Hit: the asset is returned straight from the nearby edge in milliseconds, with zero load on your origin servers." },
        { id: "origin", label: "Origin Server", sublabel: "fetch fresh copy", kind: "step", detail: "Miss: the edge fetches the asset from your origin once. This is the only request that pays the full long-haul round-trip." },
        { id: "fill", label: "Populate edge cache", sublabel: "store with TTL", kind: "step", detail: "The edge stores the fetched copy with a time-to-live, so every subsequent user in this region is served locally — the miss happens once, not repeatedly." },
        { id: "serve2", label: "Return to user", kind: "terminal", detail: "The asset is delivered, and the edge is now warm. The next request for /logo.png here is a fast cache hit." },
      ],
      edges: [
        { source: "req", target: "edge" },
        { source: "edge", target: "hit" },
        { source: "hit", target: "serve", label: "hit" },
        { source: "hit", target: "origin", label: "miss" },
        { source: "origin", target: "fill" },
        { source: "fill", target: "serve2" },
      ],
    },
  },

  // ───────────────────────────────────────── Load Balancer
  {
    id: "load-balancer",
    name: "Load Balancer",
    category: "traffic",
    icon: "Split",
    tagline: "One front door, many servers behind it.",
    mentalModel: "A traffic officer at a junction — directing each car to the lane that's moving.",
    misconception: {
      myth: "A load balancer makes a single server faster.",
      reality: "It adds no speed to any one server. It spreads requests across many and routes around dead ones — that's throughput and availability, not per-request speed.",
    },
    consequenceIfRemoved: "All traffic targets one server. It becomes both the capacity ceiling and a single point of failure — when it dies, the whole app tier is gone.",
    definition:
      "A load balancer distributes incoming traffic across a pool of servers, removing unhealthy ones and presenting a single stable endpoint to clients.",
    whyItExists:
      "A single server has a ceiling. To go beyond it you run many — but clients can only talk to one address. The load balancer is that address, spreading work and routing around failures.",
    problemSolved:
      "Enables horizontal scaling and high availability: no single server is a bottleneck or a single point of failure for the application tier.",
    advantages: [
      "Horizontal scale — add servers to grow capacity (near-linearly for stateless tiers)",
      "Health checks route traffic away from dead instances",
      "Enables zero-downtime deploys (drain, deploy, rejoin)",
    ],
    disadvantages: [
      "Becomes a single point of failure itself (run it redundantly)",
      "Sticky sessions complicate even distribution",
      "Adds a hop of latency and another thing to operate",
    ],
    alternatives: [
      { name: "DNS round-robin", note: "Crude, no health awareness" },
      { name: "Client-side LB", note: "Clients pick from a service registry" },
      { name: "Service mesh", note: "Sidecars balance east-west traffic" },
    ],
    realWorld: [
      "AWS ELB/ALB/NLB, HAProxy, Nginx, Envoy",
      "L4 (TCP) vs L7 (HTTP) balancing for different needs",
      "Global load balancers steering users to the nearest region",
    ],
    interviewQuestions: [
      "Compare L4 and L7 load balancing.",
      "How do you keep the load balancer itself highly available?",
      "When do least-connections beat round-robin?",
    ],
    scaling:
      "The balancer is what makes the stateless app tier infinitely scalable — but push state out (to cache/DB) so any server can handle any request. Beyond one region, layer a global balancer on top of regional ones.",
    internal: {
      summary: "Incoming requests are assigned to a healthy server by a routing strategy; health checks keep the pool honest.",
      nodes: [
        { id: "in", label: "Incoming Requests", kind: "start", detail: "Clients all hit one stable address — the load balancer. They never know or care how many servers sit behind it, which is exactly the point." },
        { id: "strategy", label: "Routing Strategy", kind: "decision", detail: "The balancer must choose which backend gets this request. The algorithm it uses is a real tradeoff between simplicity and how evenly load actually spreads." },
        { id: "rr", label: "Round Robin", sublabel: "even rotation", kind: "step", detail: "Round robin just rotates through servers in order. Dead simple and stateless, but it ignores that some requests are heavier or some servers slower." },
        { id: "lc", label: "Least Connections", sublabel: "pick the idlest", kind: "step", detail: "Least-connections sends the request to whichever server has the fewest in-flight requests — it adapts to uneven request cost far better than round robin." },
        { id: "wt", label: "Weighted", sublabel: "by capacity", kind: "step", detail: "Weighted routing sends more traffic to bigger servers. Useful during a gradual rollout or when your fleet is a mix of instance sizes." },
        { id: "geo", label: "Geographic", sublabel: "nearest region", kind: "step", detail: "Geographic routing sends each user to their nearest region, cutting latency — the basis of a global, multi-region front door." },
        { id: "pool", label: "Healthy Server Pool", sublabel: "health-checked", kind: "step", detail: "Whatever the strategy, it only ever picks from servers passing health checks. Continuous probing ejects dead instances before a request can hit them." },
        { id: "server", label: "Application Server", kind: "terminal", detail: "The request reaches a healthy app server. If that server dies mid-flight, health checks remove it and traffic reroutes — no single server is a point of failure." },
      ],
      edges: [
        { source: "in", target: "strategy" },
        { source: "strategy", target: "rr" },
        { source: "strategy", target: "lc" },
        { source: "strategy", target: "wt" },
        { source: "strategy", target: "geo" },
        { source: "rr", target: "pool" },
        { source: "lc", target: "pool" },
        { source: "wt", target: "pool" },
        { source: "geo", target: "pool" },
        { source: "pool", target: "server" },
      ],
      failures: [
        {
          at: "pool",
          label: "All backends unhealthy",
          what: "If health checks mark every server unhealthy, the load balancer has nowhere to route and returns 503s to everyone.",
          recovery: "Keep capacity headroom across zones, and tune health-check thresholds so a transient blip doesn't eject healthy servers all at once.",
        },
        {
          at: "in",
          label: "The LB itself dies",
          what: "The load balancer is the single front door — if it fails, every backend is healthy but unreachable.",
          recovery: "Run the balancer redundantly (active-passive or active-active) behind a floating IP or DNS failover, so a standby takes over instantly.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── API Gateway
  {
    id: "api-gateway",
    name: "API Gateway",
    category: "traffic",
    icon: "DoorOpen",
    tagline: "The smart entrance to your services.",
    mentalModel: "The front desk of an office — checks your badge, logs you in, points you to the right room.",
    misconception: {
      myth: "An API gateway is just a load balancer.",
      reality: "A load balancer spreads traffic; a gateway is API-aware — it does auth, rate limiting, request shaping and aggregation. They overlap but solve different problems.",
    },
    consequenceIfRemoved: "Every service must re-implement auth, rate limiting and routing itself, and clients must know the internal service topology.",
    definition:
      "An API Gateway is a single entry point that handles cross-cutting concerns — auth, rate limiting, routing, aggregation — so individual services don't have to.",
    whyItExists:
      "In a microservices world, every service would otherwise re-implement authentication, throttling and TLS. The gateway centralises these concerns and gives clients one coherent API over many services.",
    problemSolved:
      "Stops the duplication of cross-cutting logic and hides internal service topology from clients, who see one clean surface.",
    advantages: [
      "One place for auth, rate limiting, logging, TLS",
      "Aggregates multiple service calls into one client response",
      "Decouples clients from internal service boundaries",
    ],
    disadvantages: [
      "Risk of becoming a bottleneck or a god-object",
      "Adds latency and operational complexity",
      "Can blur into business logic if undisciplined",
    ],
    alternatives: [
      { name: "Direct-to-service", note: "Simple, but duplicates concerns" },
      { name: "BFF", note: "A gateway per client type (web, mobile)" },
      { name: "Service mesh", note: "Pushes concerns into sidecars" },
    ],
    realWorld: [
      "Kong, Apigee, AWS API Gateway, Envoy",
      "Netflix Zuul pioneered the pattern (now largely replaced by Spring Cloud Gateway)",
      "GraphQL gateways aggregating microservices",
    ],
    interviewQuestions: [
      "Gateway vs. load balancer — what's the difference?",
      "How do you stop the gateway becoming a bottleneck?",
      "Where does authentication belong: gateway or service?",
    ],
    scaling:
      "Keep the gateway stateless and horizontally scaled behind a load balancer. Offload heavy work (auth token validation) to caches, and resist the urge to let business logic creep in.",
    internal: {
      summary: "Each request flows through a pipeline of cross-cutting stages before being routed to the right backend service.",
      nodes: [
        { id: "client", label: "Client Request", kind: "start", detail: "Every external request enters through the gateway — one front door for many services, so clients see a single coherent API instead of internal topology." },
        { id: "auth", label: "AuthN / AuthZ", sublabel: "verify token", kind: "step", detail: "First the gateway verifies who you are and what you're allowed to do. Doing it here means no downstream service has to re-implement authentication." },
        { id: "rate", label: "Rate Limiting", sublabel: "throttle abusers", kind: "step", detail: "Next it enforces rate limits. Note the order: auth runs first, so the limit can be applied per-identity rather than blindly per-IP." },
        { id: "route", label: "Route", kind: "decision", detail: "Only now, with a trusted and throttled request, does the gateway decide which backend service should handle it based on the path." },
        { id: "users", label: "Users Service", kind: "terminal", detail: "A /users request is forwarded to the Users service — which can stay simple because auth, throttling and TLS were already handled upstream." },
        { id: "orders", label: "Orders Service", kind: "terminal", detail: "A /orders request goes to the Orders service. The gateway can also fan out and aggregate several service calls into one client response." },
      ],
      edges: [
        { source: "client", target: "auth" },
        { source: "auth", target: "rate" },
        { source: "rate", target: "route" },
        { source: "route", target: "users", label: "/users" },
        { source: "route", target: "orders", label: "/orders" },
      ],
    },
  },

  // ───────────────────────────────────────── Application Services
  {
    id: "services",
    name: "Application Services",
    category: "application",
    icon: "Boxes",
    tagline: "Where business logic actually runs.",
    mentalModel: "The kitchen — where raw requests are turned into finished responses.",
    misconception: {
      myth: "Microservices are always better than a monolith.",
      reality: "Microservices trade in-process simplicity for distributed-systems complexity. Below real scale, a well-structured monolith ships faster and breaks less.",
    },
    consequenceIfRemoved: "There is no business logic — requests have nothing to act on. This is the compute tier; without it the system is just plumbing.",
    definition:
      "The compute tier that executes business logic — as a single monolith or a fleet of independently deployable microservices.",
    whyItExists:
      "Someone has to turn requests into decisions: validate the order, charge the card, update inventory. Splitting that logic into services lets teams own, scale and deploy their slice independently.",
    problemSolved:
      "Separates concerns so teams move in parallel, and lets hot paths scale independently of cold ones instead of scaling one giant binary.",
    advantages: [
      "Independent deploys and scaling per service",
      "Team autonomy and clear ownership boundaries",
      "Failure isolation — one service down ≠ all down",
    ],
    disadvantages: [
      "Distributed systems are hard: partial failure, latency, consistency",
      "Operational overhead explodes (observability, networking)",
      "Bad boundaries create a 'distributed monolith'",
    ],
    alternatives: [
      { name: "Monolith", note: "One deployable — simplest until it isn't" },
      { name: "Modular monolith", note: "Clean modules, single deploy" },
      { name: "Serverless", note: "Functions scale to zero per request" },
    ],
    realWorld: [
      "Uber, Netflix, Amazon running thousands of services",
      "Stripe's payment services behind one API",
      "A monolith deliberately kept simple at smaller scale",
    ],
    interviewQuestions: [
      "When should you NOT use microservices?",
      "How do you define good service boundaries?",
      "How do services stay consistent without distributed transactions?",
    ],
    scaling:
      "Keep services stateless so any instance handles any request, then scale horizontally behind the load balancer. Communicate async (events) where you can to avoid synchronous failure chains.",
    internal: {
      summary: "Behind the gateway, focused services each own their data and collaborate over synchronous calls and an async event bus.",
      nodes: [
        { id: "gw", label: "API Gateway", kind: "start", detail: "Requests arrive from the gateway and fan out to focused services, each owning one business capability so teams can deploy and scale independently." },
        { id: "users", label: "Users Service", kind: "step", detail: "The Users service owns everything about accounts. It exposes an API but keeps its data private — no other service reaches into its database." },
        { id: "orders", label: "Orders Service", kind: "step", detail: "The Orders service handles checkout. To complete an order it needs payment, so it makes a synchronous call to the Payments service." },
        { id: "payments", label: "Payments Service", kind: "step", detail: "Payments is called synchronously because Orders needs the result now. This coupling is exactly where you'd wrap a timeout and circuit breaker." },
        { id: "udb", label: "Users DB", sublabel: "owned data", kind: "terminal", detail: "Each service owns its own database. This is what gives failure isolation — the Users DB going down doesn't take Orders with it." },
        { id: "odb", label: "Orders DB", sublabel: "owned data", kind: "terminal", detail: "Separate storage per service avoids a shared-database bottleneck, but means cross-service queries become API calls or event-driven joins." },
        { id: "bus", label: "Event Bus", sublabel: "async decoupling", kind: "terminal", detail: "Services publish events (order.created, payment.captured) to a bus. Anyone interested subscribes — decoupling them in time and avoiding synchronous chains." },
      ],
      edges: [
        { source: "gw", target: "users" },
        { source: "gw", target: "orders" },
        { source: "orders", target: "payments", label: "sync" },
        { source: "users", target: "udb" },
        { source: "orders", target: "odb" },
        { source: "orders", target: "bus", label: "publish" },
        { source: "payments", target: "bus", label: "publish" },
      ],
      failures: [
        {
          at: "payments",
          label: "Payments slow/down",
          what: "If the Payments service is slow or down, the synchronous call from Orders blocks; waiting threads pile up and the stall can cascade back to the gateway.",
          recovery: "Wrap the call in a timeout + circuit breaker, and move non-critical work to the event bus so a slow dependency can't take the whole request path down.",
        },
        {
          at: "udb",
          label: "A service's DB fails",
          what: "Because each service owns its database, the Users DB failing takes down only user-related features — orders and payments keep working.",
          recovery: "This is failure isolation by design: per-service databases contain the blast radius. Restore from replica/backup while the rest of the system serves on.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── Cache (Redis)
  {
    id: "cache",
    name: "Redis Cache",
    category: "cache",
    icon: "Zap",
    tagline: "Sub-millisecond reads for hot data.",
    mentalModel: "Shared RAM for your whole application — the notepad you keep on the desk instead of walking to the filing cabinet.",
    misconception: {
      myth: "Redis is only a cache.",
      reality: "Redis also does pub/sub, streams, queues, distributed locks, rate-limiter counters and leaderboards. Caching is its most common job, not its only one.",
    },
    consequenceIfRemoved: "Every read goes to the database. Repeated hot queries hammer the primary, p99 latency climbs, and read throughput collapses under load.",
    definition:
      "An in-memory data store placed in front of slower databases to serve frequently-read data in sub-milliseconds instead of milliseconds.",
    whyItExists:
      "Databases are durable but comparatively slow, and the same hot rows get read over and over. A cache holds those in RAM so reads skip the disk and the query planner entirely.",
    problemSolved:
      "Absorbs read load that would otherwise hammer the database, collapsing p99 latency and multiplying effective read throughput.",
    advantages: [
      "Sub-millisecond reads from memory",
      "Massive read offload from the primary database",
      "Versatile: sessions, rate limiters, queues, leaderboards",
    ],
    disadvantages: [
      "Cache invalidation — one of the two hard problems",
      "Stale reads if TTLs / write paths are wrong",
      "Memory is finite and pricey; eviction must be tuned",
    ],
    alternatives: [
      { name: "Memcached", note: "Simpler, pure cache, no persistence" },
      { name: "Read replicas", note: "Scale reads with consistency" },
      { name: "Materialized views", note: "Precompute in the DB" },
    ],
    realWorld: [
      "Redis for sessions, leaderboards, rate limiting",
      "Twitter caching timelines for hot accounts",
      "Cache-aside in front of Postgres/MySQL everywhere",
    ],
    interviewQuestions: [
      "Explain cache-aside, write-through and write-behind.",
      "How do you prevent a cache stampede / thundering herd?",
      "What eviction policy would you choose and why?",
    ],
    scaling:
      "Scale with replication for read availability and sharding (hash slots) for capacity. Guard against stampedes with request coalescing and jittered TTLs; pick an eviction policy (LRU/LFU) that matches your access pattern.",
    internal: {
      summary: "The classic cache-aside read path: check the cache, fall back to the database on a miss, then backfill the cache.",
      nodes: [
        { id: "req", label: "Read Request", kind: "start", detail: "The application needs some data. In the cache-aside pattern, it always asks the cache first — never the database directly." },
        { id: "lookup", label: "Cache Lookup", sublabel: "Redis GET", kind: "step", detail: "A single in-memory key lookup in Redis. This is sub-millisecond because there's no disk and no query planner involved — just a hash lookup in RAM." },
        { id: "hit", label: "Hit?", kind: "decision", detail: "Either the value is cached (hit) or it isn't (miss). A high hit ratio is what makes the cache worth it — most reads should never reach the database." },
        { id: "ret", label: "Return cached", sublabel: "< 1ms", kind: "terminal", detail: "Hit: return the value straight from memory. The database is untouched, sparing it the load and keeping latency tiny." },
        { id: "db", label: "Query Database", sublabel: "on miss", kind: "step", detail: "Miss: fall through to the database for the real value. This is the slow path — and if many requests miss the same key at once, they all stampede here." },
        { id: "update", label: "Write to cache", sublabel: "SET key, TTL", kind: "step", detail: "Before returning, the app writes the value back into the cache with a TTL. The miss happens once; the next reader gets a hit." },
        { id: "ret2", label: "Return data", kind: "terminal", detail: "The data is returned and the cache is now warm. The TTL controls how long before it must be re-fetched — the core staleness-vs-freshness knob." },
      ],
      edges: [
        { source: "req", target: "lookup" },
        { source: "lookup", target: "hit" },
        { source: "hit", target: "ret", label: "yes" },
        { source: "hit", target: "db", label: "no" },
        { source: "db", target: "update" },
        { source: "update", target: "ret2" },
      ],
      failures: [
        {
          at: "lookup",
          label: "Cache down",
          what: "With Redis unavailable, every read falls through to the database. Under load the database — sized assuming the cache absorbs most reads — can buckle, turning a cache outage into a latency and error spike.",
          recovery: "Degrade gracefully: short timeouts on cache calls, serve straight from the database, and coalesce concurrent misses so a cold cache doesn't stampede the primary.",
        },
        {
          at: "db",
          label: "Miss stampede",
          what: "When a hot key expires, many requests miss simultaneously and all hit the database for the same value at once — a thundering herd.",
          recovery: "Single-flight (let one request rebuild the key while others wait), jittered TTLs, and stale-while-revalidate keep one miss from becoming thousands of database hits.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── Database
  {
    id: "database",
    name: "Database",
    category: "data",
    icon: "Database",
    tagline: "The durable source of truth.",
    mentalModel: "The official ledger — the one record everyone agrees is correct, and the one that survives a crash.",
    misconception: {
      myth: "If reads are slow, the database is too small — just scale it up.",
      reality: "Scaling up has a ceiling. Read load is solved with caching and replicas; only write volume past one primary forces sharding. Bigger box buys time, not escape.",
    },
    consequenceIfRemoved: "There is no durable source of truth. State lives only in volatile memory — a crash loses everything, and nothing enforces invariants.",
    definition:
      "The durable, consistent store of record. A relational database (e.g. PostgreSQL) enforces schema and transactions; NoSQL stores trade some of that for scale or flexibility.",
    whyItExists:
      "State has to live somewhere that survives crashes, enforces invariants and answers queries. The database is that somewhere — the system's authoritative memory.",
    problemSolved:
      "Provides durable, queryable, consistent storage with transactional guarantees so application logic can trust what it reads and writes.",
    advantages: [
      "ACID transactions and strong consistency (relational)",
      "Powerful, flexible querying with indexes and joins",
      "Battle-tested durability and recovery",
    ],
    disadvantages: [
      "The hardest tier to scale — usually the first bottleneck",
      "In single-primary architectures, writes bottleneck on one node",
      "Schema migrations at scale are operationally scary",
    ],
    alternatives: [
      { name: "NoSQL (Cassandra)", note: "Horizontal writes, eventual consistency" },
      { name: "Document (MongoDB)", note: "Flexible schema, denormalised" },
      { name: "NewSQL", note: "Spanner/Cockroach: SQL that shards" },
    ],
    realWorld: [
      "PostgreSQL / MySQL as the system of record",
      "Cassandra for write-heavy, globally-distributed data",
      "Read replicas serving analytics off the primary",
    ],
    interviewQuestions: [
      "Explain the CAP theorem with a concrete example.",
      "When do you reach for NoSQL over a relational DB?",
      "How do indexes speed reads but cost writes?",
    ],
    scaling:
      "Scale reads first with replicas and caching; scale writes last with sharding (the nuclear option — it complicates everything). The CAP theorem forces a choice under partition: stay consistent or stay available.",
    internal: {
      summary: "A single primary takes all writes and streams them to read replicas, which absorb the read load.",
      nodes: [
        { id: "writes", label: "Writes", sublabel: "INSERT / UPDATE", kind: "start", detail: "All writes must go to one place — the primary — so there's a single authoritative ordering of changes. This is also why writes are the hardest thing to scale." },
        { id: "primary", label: "Primary", sublabel: "source of truth", kind: "step", detail: "The primary applies the write durably and becomes the source of truth. Every replica's job is to faithfully copy what the primary did." },
        { id: "wal", label: "Replication Log", sublabel: "WAL stream", kind: "step", detail: "The primary streams its write-ahead log to replicas. Because this shipping is asynchronous, replicas are always a little behind — that lag is replication lag." },
        { id: "r1", label: "Read Replica 1", kind: "step", detail: "A replica replays the log to mirror the primary. It can serve reads — and if the primary dies, it's a warm candidate to be promoted." },
        { id: "r2", label: "Read Replica 2", kind: "step", detail: "Add more replicas to scale reads near-linearly. But note: they only help reads — every write still funnels through the one primary." },
        { id: "reads", label: "Read Queries", sublabel: "load-balanced", kind: "terminal", detail: "Reads spread across replicas, taking load off the primary. The catch: a read may hit a lagging replica and miss a just-made write (read-your-writes)." },
      ],
      edges: [
        { source: "writes", target: "primary" },
        { source: "primary", target: "wal" },
        { source: "wal", target: "r1", label: "async" },
        { source: "wal", target: "r2", label: "async" },
        { source: "r1", target: "reads" },
        { source: "r2", target: "reads" },
      ],
      failures: [
        {
          at: "primary",
          label: "Primary crash",
          what: "If the primary dies, all writes fail during the failover window (~10–30s); reads can still be served by the replicas.",
          recovery: "Automatic failover promotes a replica to primary (Patroni, RDS Multi-AZ). Writes resume once promotion completes, and a fresh replica is provisioned.",
        },
        {
          at: "r1",
          label: "Replica lag",
          what: "A lagging replica serves stale reads — a user may not see their own just-written change (the read-your-writes problem).",
          recovery: "Route must-be-fresh reads to the primary or use session consistency, and monitor lag so reads are shed from replicas that fall too far behind.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── Message Queue (Kafka)
  {
    id: "message-queue",
    name: "Message Queue",
    category: "messaging",
    icon: "Workflow",
    tagline: "Decouple producers from consumers.",
    mentalModel: "A durable conveyor belt — drop work on it now, a worker picks it up when ready.",
    misconception: {
      myth: "A message queue can be replaced by a database table you poll.",
      reality: "Polling works at small scale, but a real broker gives you ordering, fan-out, backpressure, at-least-once delivery and replay — guarantees a table-poll loop doesn't.",
    },
    consequenceIfRemoved: "Producers and consumers are coupled in time. A slow or down consumer blocks the producer, spikes aren't absorbed, and in-flight work is lost on failure.",
    definition:
      "A durable buffer that lets services communicate asynchronously: producers publish messages, consumers process them at their own pace.",
    whyItExists:
      "Synchronous calls couple services in time — if the downstream is slow or down, the caller suffers. A queue breaks that coupling, absorbing spikes and letting work happen later.",
    problemSolved:
      "Smooths traffic spikes, decouples services, and guarantees work isn't lost when a consumer is slow, busy or temporarily down.",
    advantages: [
      "Absorbs spikes — producers never wait on consumers",
      "Decoupling: add/replace consumers without touching producers",
      "Durability and replay (especially log-based like Kafka)",
    ],
    disadvantages: [
      "Eventual consistency and out-of-order delivery to reason about",
      "At-least-once delivery demands idempotent consumers",
      "Another distributed system to operate and monitor",
    ],
    alternatives: [
      { name: "Synchronous calls", note: "Direct HTTP/RPC, simpler but coupled" },
      { name: "Database polling", note: "Poll a table for new work — simple but latent" },
      { name: "Serverless event triggers", note: "Cloud-native eventing (EventBridge, Cloud Functions)" },
    ],
    realWorld: [
      "Kafka streaming events at LinkedIn / Uber scale",
      "Order pipelines: place order → queue → fulfilment",
      "Fan-out: one event, many independent consumers",
    ],
    interviewQuestions: [
      "At-least-once vs exactly-once — how do you achieve each?",
      "How do you guarantee ordering, and at what cost?",
      "How do you handle a poison message?",
    ],
    scaling:
      "Partition the topic to scale throughput — each partition is an ordered, independently-consumed log. Consumer groups parallelise processing; more partitions means more parallel consumers, at the cost of cross-partition ordering.",
    internal: {
      summary: "A producer writes to a partitioned topic; independent consumer groups each read the full stream at their own pace.",
      nodes: [
        { id: "producer", label: "Producer", sublabel: "order.created", kind: "start", detail: "A service publishes an event and moves on immediately — it doesn't wait for anyone to process it. That instant hand-off is what decouples producers from consumers." },
        { id: "topic", label: "Topic", sublabel: "partitioned & durable", kind: "step", detail: "The event lands in a durable, append-only topic. Unlike a fire-and-forget call, it's persisted — a slow or crashed consumer can pick it up later without data loss." },
        { id: "p0", label: "Partition 0", kind: "step", detail: "Topics are split into partitions to scale throughput. A message's key decides its partition, and ordering is guaranteed only within a partition, not across them." },
        { id: "p1", label: "Partition 1", kind: "step", detail: "More partitions means more consumers can read in parallel. The tradeoff is that you give up a single global ordering across the whole topic." },
        { id: "email", label: "Email Service", kind: "terminal", detail: "One consumer group sends confirmation emails. It reads at its own pace; if it falls behind, messages simply wait in the log rather than being lost." },
        { id: "inventory", label: "Inventory Service", kind: "terminal", detail: "A separate consumer group updates stock from the same events. Adding it required zero changes to the producer — that's the power of fan-out." },
        { id: "analytics", label: "Analytics", kind: "terminal", detail: "Analytics replays the whole event history to build reports. Because the log is durable and replayable, you can add new consumers that reprocess past events." },
      ],
      edges: [
        { source: "producer", target: "topic" },
        { source: "topic", target: "p0" },
        { source: "topic", target: "p1" },
        { source: "p0", target: "email" },
        { source: "p1", target: "inventory" },
        { source: "p0", target: "analytics" },
        { source: "p1", target: "analytics" },
      ],
    },
  },

  // ───────────────────────────────────────── Analytics / Warehouse
  {
    id: "analytics",
    name: "Analytics / Warehouse",
    category: "analytics",
    icon: "BarChart3",
    tagline: "Turning events into insight, offline.",
    mentalModel: "A back office that reads yesterday's receipts — never the cashier ringing up the next sale.",
    misconception: {
      myth: "Just run the analytics queries on the production database.",
      reality: "Big scans (OLAP) and latency-sensitive transactions (OLTP) fight for the same resources. A columnar warehouse isolates the heavy queries so dashboards never slow down checkout.",
    },
    consequenceIfRemoved: "Heavy analytical scans run on the transactional database, contending with live traffic — or you simply lose the ability to ask historical questions.",
    definition:
      "A separate analytical store (data warehouse / lake) optimised for large scans and aggregations over historical data, kept off the transactional path.",
    whyItExists:
      "Analytical queries ('revenue by region last quarter') scan millions of rows and would cripple a transactional database. A warehouse is built for exactly that — columnar, batch-friendly, isolated.",
    problemSolved:
      "Separates heavy analytical workloads (OLAP) from latency-sensitive transactional ones (OLTP), so dashboards never slow down checkout.",
    advantages: [
      "Columnar storage crushes aggregations and scans",
      "Isolated from production — analysts can't take down the app",
      "Cheap, near-infinite historical storage",
    ],
    disadvantages: [
      "Data is stale by minutes to hours (batch/stream lag)",
      "Building reliable ETL/ELT pipelines is real work",
      "Not for per-request, low-latency lookups",
    ],
    alternatives: [
      { name: "OLAP DB", note: "ClickHouse/Druid for real-time analytics" },
      { name: "Data lake", note: "Raw files + query engine (S3 + Spark)" },
      { name: "HTAP", note: "One store for both — at a cost" },
    ],
    realWorld: [
      "Snowflake, BigQuery, Redshift powering BI",
      "Event streams landing in a lake for ML",
      "Nightly ETL feeding executive dashboards",
    ],
    interviewQuestions: [
      "OLTP vs OLAP — why separate them?",
      "Walk me through an event from app to dashboard.",
      "Batch vs streaming ETL — how do you choose?",
    ],
    scaling:
      "Warehouses scale by separating storage from compute — spin up more compute for big queries without touching storage. Streaming pipelines (Kafka → warehouse) shrink the freshness gap when minutes-old data isn't good enough.",
  },

  // ───────────────────────────────────────── Read Replicas
  {
    id: "read-replica",
    name: "Read Replicas",
    category: "scalability",
    icon: "Copy",
    tagline: "Clone the database to scale reads.",
    mentalModel: "Photocopies of the ledger handed to every reader, while only the original is ever written to.",
    misconception: {
      myth: "Read replicas help with write scaling.",
      reality: "Replicas only scale reads. Every write still goes to the single primary; when writes are the bottleneck, replicas can't help and you need sharding.",
    },
    consequenceIfRemoved: "All reads hit the primary alongside writes. Read-heavy load contends with writes, and there's no warm copy to promote on primary failure.",
    definition:
      "Copies of the primary database that asynchronously stay in sync and serve read-only queries, multiplying read capacity.",
    whyItExists:
      "Most workloads read far more than they write. Replicas let you throw the read traffic at copies while the primary focuses on writes.",
    problemSolved:
      "Scales read throughput and isolates heavy/analytical reads from the write path without resorting to sharding.",
    advantages: [
      "Near-linear read scaling — add replicas, add capacity",
      "Geographic replicas cut read latency for distant users",
      "A replica can be promoted on primary failure",
    ],
    disadvantages: [
      "Replication lag → stale reads (read-your-writes issues)",
      "Writes still bottleneck on the single primary",
      "More moving parts to monitor and fail over",
    ],
    alternatives: [
      { name: "Caching", note: "Cheaper for hot reads, weaker consistency" },
      { name: "Sharding", note: "Needed when writes are the bottleneck" },
      { name: "CQRS", note: "Purpose-built read models" },
    ],
    realWorld: [
      "Postgres streaming replicas behind a read endpoint",
      "Routing analytics to a dedicated replica",
      "Cross-region replicas for local reads",
    ],
    interviewQuestions: [
      "How do you handle replication lag for read-your-writes?",
      "When do replicas stop helping?",
      "Sync vs async replication — the tradeoff?",
    ],
    scaling:
      "Replicas scale reads but not writes — when the single primary can't keep up with writes, replicas can't save you and sharding becomes unavoidable.",
  },

  // ───────────────────────────────────────── Sharding
  {
    id: "sharding",
    name: "Sharding",
    category: "scalability",
    icon: "Split",
    tagline: "Split the data to scale writes.",
    mentalModel: "Splitting one giant ledger into volumes A–H, I–P, Q–Z, each on its own desk.",
    misconception: {
      myth: "Sharding is just adding more database servers.",
      reality: "It splits the data itself by a shard key. Choose it badly and you get hotspots, cross-shard joins, and resharding pain — the hardest operational decision in the stack.",
    },
    consequenceIfRemoved: "Write volume and dataset size are capped at a single machine. Once one primary can't keep up, there's no path left to scale writes.",
    definition:
      "Horizontal partitioning that splits data across multiple independent databases (shards), each owning a slice of the keyspace.",
    whyItExists:
      "When even one beefy primary can't absorb the write volume or hold the dataset, you must split the data itself so writes spread across many machines.",
    problemSolved:
      "Scales writes and storage beyond a single machine — the only real escape hatch when vertical scaling and replicas are exhausted.",
    advantages: [
      "Scales writes and storage horizontally",
      "Smaller per-shard datasets = faster local queries",
      "Blast radius of a failure is one shard, not all data",
    ],
    disadvantages: [
      "Cross-shard queries and joins become painful",
      "Rebalancing / resharding is operationally brutal",
      "Hotspots if the shard key is poorly chosen",
    ],
    alternatives: [
      { name: "Read replicas", note: "If reads (not writes) are the issue" },
      { name: "NewSQL", note: "Cockroach/Spanner shard for you" },
      { name: "Vertical scaling", note: "Just buy a bigger box — for a while" },
    ],
    realWorld: [
      "Instagram sharding Postgres by user id",
      "Discord sharding messages by channel",
      "Consistent hashing to minimise resharding churn",
    ],
    interviewQuestions: [
      "How do you pick a shard key, and what makes a bad one?",
      "How do you run a cross-shard transaction?",
      "How does consistent hashing reduce resharding pain?",
    ],
    scaling:
      "Sharding is how you scale past a single machine — but it pushes complexity up into the application. Choose a key with high cardinality and even access to avoid hotspots; resharding later is the thing everyone dreads.",
    internal: {
      summary: "A router hashes the shard key to pick exactly one shard, so each query touches a single partition of the data.",
      nodes: [
        { id: "query", label: "Query", sublabel: "user_id = 42", kind: "start", detail: "A query arrives carrying the shard key — here, user_id. Choosing a good shard key is the single most important (and hardest to change) decision in sharding." },
        { id: "router", label: "Shard Router", sublabel: "hash(key) % N", kind: "decision", detail: "The router hashes the key to decide which shard owns this data. A well-distributed key spreads load evenly; a skewed one creates hotspots." },
        { id: "s0", label: "Shard 0", sublabel: "ids 0–33%", kind: "step", detail: "Each shard is an independent database holding a slice of the keyspace. A failure here only affects its slice — the blast radius is one shard, not all data." },
        { id: "s1", label: "Shard 1", sublabel: "ids 34–66%", kind: "step", detail: "user_id 42 hashes to this shard, so the query is routed here and nowhere else. Smaller per-shard data also means faster local queries." },
        { id: "s2", label: "Shard 2", sublabel: "ids 67–100%", kind: "step", detail: "The other shards aren't touched for this query. The flip side: a query that needs data from several shards becomes a painful scatter-gather." },
        { id: "result", label: "Result", kind: "terminal", detail: "One shard answers and returns the result. Writes now scale horizontally — but cross-shard transactions and resharding are the costs you've taken on." },
      ],
      edges: [
        { source: "query", target: "router" },
        { source: "router", target: "s0" },
        { source: "router", target: "s1", label: "selected" },
        { source: "router", target: "s2" },
        { source: "s1", target: "result" },
      ],
    },
  },

  // ───────────────────────────────────────── Rate Limiting
  {
    id: "rate-limiter",
    name: "Rate Limiting",
    category: "reliability",
    icon: "Gauge",
    tagline: "Protect the system from too much love.",
    mentalModel: "A bouncer with a clicker — only so many through the door per minute, everyone else waits.",
    misconception: {
      myth: "Rate limiting is only needed to stop malicious attackers.",
      reality: "It's just as much about accidental load — a retry storm or a buggy client can take you down as surely as an attack. It protects capacity and enforces fairness at any scale.",
    },
    consequenceIfRemoved: "A single noisy client or retry storm can exhaust shared capacity and degrade the service for everyone.",
    definition:
      "A control that caps how many requests a client can make in a window, rejecting or delaying the excess to protect downstream resources.",
    whyItExists:
      "Unbounded demand — whether abusive or accidental (a retry storm) — will exhaust shared resources. Rate limiting enforces fairness and protects capacity.",
    problemSolved:
      "Prevents a single noisy client or attack from degrading the service for everyone, and shields fragile downstreams from overload.",
    advantages: [
      "Protects capacity and enforces fair usage",
      "Blunts brute-force and scraping attacks",
      "Enables tiered plans (free vs paid quotas)",
    ],
    disadvantages: [
      "Distributed counting is tricky (needs shared state)",
      "Too aggressive → legitimate users get blocked",
      "Clients must handle 429s and back off correctly",
    ],
    alternatives: [
      { name: "Admission control", note: "Priority-based request acceptance" },
      { name: "Autoscaling", note: "Scale capacity to meet demand instead of rejecting" },
      { name: "Load shedding", note: "Drop work when overloaded" },
    ],
    realWorld: [
      "API gateways enforcing per-key quotas",
      "Login endpoints throttling brute force",
      "Redis-backed token buckets shared across nodes",
    ],
    interviewQuestions: [
      "Design a distributed rate limiter.",
      "Token bucket vs sliding window — tradeoffs?",
      "Where in the stack should rate limiting live?",
    ],
    scaling:
      "At scale the counter itself must scale — usually a shared Redis with atomic operations, or approximate local limits per node. The classic tradeoff is accuracy vs. coordination cost.",
  },

  // ───────────────────────────────────────── Circuit Breaker
  {
    id: "circuit-breaker",
    name: "Circuit Breaker",
    category: "reliability",
    icon: "ShieldAlert",
    tagline: "Fail fast instead of failing slowly.",
    mentalModel: "A fuse in the wiring — it trips to stop one fault burning down the whole house.",
    misconception: {
      myth: "Retries are enough to handle a failing dependency.",
      reality: "Retrying a dependency that's already overloaded makes it worse. A breaker stops calling it entirely so it can recover — retries and breakers solve different failure shapes.",
    },
    consequenceIfRemoved: "A slow dependency makes callers pile up waiting, exhausting threads and connections — the failure cascades upward into a fleet-wide outage.",
    definition:
      "A resilience pattern that stops calling a failing dependency after errors cross a threshold, 'opening' to fail fast and giving it time to recover.",
    whyItExists:
      "A slow or dead dependency causes callers to pile up waiting, exhausting threads and cascading the failure upward. The breaker cuts that chain.",
    problemSolved:
      "Prevents cascading failures and resource exhaustion by failing fast and shedding load from an unhealthy dependency.",
    advantages: [
      "Stops cascading failures across services",
      "Fails fast — frees threads/connections instantly",
      "Gives the struggling dependency room to recover",
    ],
    disadvantages: [
      "Tuning thresholds is subtle (flapping vs sluggish)",
      "Needs a sensible fallback or graceful degradation",
      "Can mask real problems if used as a crutch",
    ],
    alternatives: [
      { name: "Retries + backoff", note: "For transient blips only" },
      { name: "Timeouts", note: "The bare minimum — always set them" },
      { name: "Bulkheads", note: "Isolate pools so failure is contained" },
    ],
    realWorld: [
      "Netflix Hystrix popularised the pattern (now in maintenance; Resilience4j is the modern successor)",
      "Resilience4j / Envoy breakers in modern stacks",
      "Service mesh enforcing breakers per route",
    ],
    interviewQuestions: [
      "Walk through the breaker's three states.",
      "Circuit breaker vs retry — when each?",
      "What makes a good fallback?",
    ],
    scaling:
      "Breakers are essential once you have a web of synchronous service calls — they keep one slow node from taking down the fleet. Pair with timeouts and bulkheads for layered defence.",
    internal: {
      summary: "The breaker moves between three states based on the health of the dependency, testing recovery before fully trusting it again.",
      nodes: [
        { id: "closed", label: "Closed", sublabel: "requests flow normally", kind: "start", detail: "Normally the breaker is closed and lets every call through to the dependency, quietly counting how many succeed and how many fail." },
        { id: "check", label: "Failures > threshold?", kind: "decision", detail: "It watches the failure rate. As long as failures stay low it does nothing; once they cross a threshold, it assumes the dependency is in trouble." },
        { id: "open", label: "Open", sublabel: "fail fast, no calls", kind: "step", detail: "Tripped open: the breaker stops calling the dependency entirely and fails instantly. This frees threads and gives the struggling dependency room to recover instead of piling on." },
        { id: "half", label: "Half-Open", sublabel: "allow test traffic", kind: "step", detail: "After a cooldown it goes half-open and lets a few trial requests through — just enough to test whether the dependency has actually recovered." },
        { id: "recovered", label: "Recovered", sublabel: "back to normal", kind: "terminal", detail: "If the trial requests succeed, the breaker closes and normal traffic resumes. If they still fail, it snaps back open and waits again — preventing a premature flood." },
      ],
      edges: [
        { source: "closed", target: "check" },
        { source: "check", target: "open", label: "yes" },
        { source: "check", target: "closed", label: "no" },
        { source: "open", target: "half", label: "after timeout" },
        { source: "half", target: "recovered", label: "success" },
        { source: "half", target: "open", label: "still failing" },
      ],
    },
  },

  // ───────────────────────────────────────── Reverse Proxy
  {
    id: "reverse-proxy",
    name: "Reverse Proxy",
    category: "edge",
    icon: "Shuffle",
    tagline: "A shield and switchboard in front of servers.",
    definition:
      "A server that sits in front of backends and forwards client requests to them, handling TLS, caching, compression and routing along the way.",
    whyItExists:
      "You want a single hardened entry point that hides backend topology and centralises concerns like TLS termination and static caching, separate from app logic.",
    problemSolved:
      "Centralises edge concerns (TLS, compression, caching, routing) and shields backends from direct exposure to the internet.",
    advantages: [
      "TLS termination and compression in one place",
      "Hides and protects backend servers",
      "Can cache and serve static content directly",
    ],
    disadvantages: [
      "Another hop and another component to operate",
      "Misconfiguration can expose or break routing",
      "Can become a bottleneck if under-provisioned",
    ],
    alternatives: [
      { name: "API Gateway", note: "Reverse proxy + API-aware features" },
      { name: "Load balancer", note: "Overlapping roles, different focus" },
      { name: "Service mesh", note: "Proxying pushed to sidecars" },
    ],
    realWorld: [
      "Nginx / Envoy / HAProxy at the edge",
      "Cloudflare acting as a global reverse proxy",
      "TLS termination before plaintext to internal services",
    ],
    interviewQuestions: [
      "Forward proxy vs reverse proxy?",
      "Reverse proxy vs load balancer vs API gateway?",
      "Where do you terminate TLS, and why?",
    ],
    scaling:
      "Reverse proxies are stateless and scale horizontally trivially. They're often the same software (Nginx/Envoy) that also does load balancing — the distinction is about role, not binary.",
  },

  // ───────────────────────────────────────── Kubernetes
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "application",
    icon: "Container",
    tagline: "Declarative orchestration for containers.",
    mentalModel: "An air-traffic controller for containers — you say where you want planes, it keeps them there.",
    misconception: {
      myth: "Every system should run on Kubernetes.",
      reality: "K8s earns its complexity only when you have many services across many machines. For a handful of services, its operational weight usually costs more than it saves.",
    },
    consequenceIfRemoved: "You schedule, scale and restart containers across machines by hand. Past a few services this becomes unmanageable and self-healing disappears.",
    definition:
      "A container orchestrator that schedules, scales, heals and networks containerised workloads across a cluster of machines from a declarative spec.",
    whyItExists:
      "Running hundreds of containers across many machines by hand is impossible. Kubernetes turns 'what I want' (declarative state) into 'what's running', and keeps it that way.",
    problemSolved:
      "Automates deployment, scaling, self-healing and service discovery for containerised apps, abstracting away individual machines.",
    advantages: [
      "Self-healing — dead pods are rescheduled automatically",
      "Declarative, version-controllable infrastructure",
      "Autoscaling and rolling deploys out of the box",
    ],
    disadvantages: [
      "Steep learning curve and real operational weight",
      "Easy to over-engineer for small systems",
      "Networking and storage abstractions can leak",
    ],
    alternatives: [
      { name: "Serverless", note: "No orchestration to run at all" },
      { name: "ECS / Nomad", note: "Simpler orchestrators" },
      { name: "Plain VMs", note: "Fine until you have many services" },
    ],
    realWorld: [
      "Most large microservice fleets run on K8s",
      "Managed offerings: EKS, GKE, AKS",
      "HPA autoscaling pods on CPU/latency",
    ],
    interviewQuestions: [
      "What problem does Kubernetes actually solve?",
      "Pod vs deployment vs service?",
      "How does a rolling update achieve zero downtime?",
    ],
    scaling:
      "Kubernetes scales workloads (horizontal pod autoscaling) and the cluster itself (node autoscaling). It shines when you have many services; for a handful, its complexity often outweighs the benefit.",
  },

  // ───────────────────────────────────────── Observability
  {
    id: "observability",
    name: "Observability",
    category: "observability",
    icon: "Activity",
    tagline: "Know what your system is doing.",
    mentalModel: "The cockpit instruments — without them you're flying a distributed system blind.",
    misconception: {
      myth: "Logs are enough to debug a distributed system.",
      reality: "Logs tell you what one service did; metrics show system-wide trends; traces follow one request across services. You need all three pillars to answer 'why is it slow?'",
    },
    consequenceIfRemoved: "Incidents become opaque. You can't see where latency or errors originate across services, so mean-time-to-recovery balloons.",
    definition:
      "The ability to understand a system's internal state from its outputs — built on the three pillars of logs, metrics and traces.",
    whyItExists:
      "Distributed systems fail in ways you can't predict. Observability lets you ask new questions of a live system during an incident, not just watch pre-built dashboards.",
    problemSolved:
      "Turns opaque, distributed behaviour into something you can debug — finding where latency, errors and bottlenecks actually live.",
    advantages: [
      "Faster incident diagnosis (lower MTTR)",
      "Traces reveal latency across service hops",
      "Metrics drive autoscaling and alerting",
    ],
    disadvantages: [
      "Telemetry volume (and its cost) can explode",
      "Too many noisy alerts cause fatigue",
      "Instrumentation is ongoing engineering work",
    ],
    alternatives: [
      { name: "Logs only", note: "Cheap start, blind to system-wide latency" },
      { name: "APM suites", note: "Datadog/New Relic, batteries included" },
      { name: "OpenTelemetry", note: "Vendor-neutral instrumentation" },
    ],
    realWorld: [
      "Prometheus + Grafana for metrics",
      "Jaeger / Tempo for distributed tracing",
      "Structured logs shipped to Loki / ELK",
    ],
    interviewQuestions: [
      "Logs vs metrics vs traces — when each?",
      "How do you trace a request across services?",
      "What are good SLIs/SLOs for an API?",
    ],
    scaling:
      "Telemetry grows with traffic, so sample traces and aggregate metrics to control cost. The goal is high-cardinality insight without storing every single event forever.",
  },

  // ───────────────────────────────────────── CQRS
  {
    id: "cqrs",
    name: "CQRS",
    category: "scalability",
    icon: "GitFork",
    tagline: "Separate the read model from the write model.",
    definition:
      "Command Query Responsibility Segregation splits writes (commands) and reads (queries) into separate models, each optimised for its job.",
    whyItExists:
      "Reads and writes often have opposite needs — writes want normalised integrity, reads want denormalised speed. CQRS stops one compromise from hobbling both.",
    problemSolved:
      "Lets reads and writes scale and evolve independently, with read models shaped precisely for query patterns.",
    advantages: [
      "Read and write paths scale independently",
      "Read models tailored to exact query needs",
      "Pairs naturally with event sourcing",
    ],
    disadvantages: [
      "Eventual consistency between the two models",
      "More moving parts and code to maintain",
      "Overkill for simple CRUD apps",
    ],
    alternatives: [
      { name: "Single model CRUD", note: "Simplest; fine for most apps" },
      { name: "Read replicas", note: "Scale reads without two models" },
      { name: "Materialized views", note: "Precomputed reads in the DB" },
    ],
    realWorld: [
      "Event-sourced systems with projected read models",
      "High-read dashboards fed by a write-side stream",
      "Order systems separating placement from queries",
    ],
    interviewQuestions: [
      "When is CQRS worth the complexity?",
      "How do you keep read and write models in sync?",
      "How does CQRS relate to event sourcing?",
    ],
    scaling:
      "CQRS lets you scale the read side (often 100x the write volume) independently — replicate and denormalise read models freely while keeping writes authoritative and consistent.",
  },

  // ───────────────────────────────────────── TCP
  {
    id: "tcp",
    name: "TCP",
    category: "networking",
    icon: "Cable",
    tagline: "Reliable, ordered delivery — at a cost.",
    mentalModel: "A phone call — you both say hello first, and every word arrives in order.",
    misconception: {
      myth: "TCP guarantees your message was processed.",
      reality: "TCP guarantees bytes arrive in order at the OS — not that the application read or acted on them. End-to-end correctness still needs application-level acknowledgements.",
    },
    consequenceIfRemoved: "Applications would each have to rebuild ordering, retransmission and congestion control on top of raw, lossy packets.",
    definition:
      "TCP is a connection-oriented transport protocol that turns an unreliable packet network into an ordered, error-checked, reliable byte stream between two hosts.",
    whyItExists:
      "Networks lose, duplicate and reorder packets. TCP hides that chaos behind a dependable stream so applications don't each have to reinvent delivery guarantees.",
    problemSolved:
      "Provides reliable, ordered, flow- and congestion-controlled delivery on top of a best-effort packet network.",
    advantages: [
      "Guaranteed, in-order, error-checked delivery",
      "Built-in flow and congestion control",
      "Ubiquitous and deeply battle-tested",
    ],
    disadvantages: [
      "Handshake + ACKs add round-trip latency",
      "Head-of-line blocking stalls the whole stream",
      "Heavier per-connection state than UDP",
    ],
    alternatives: [
      { name: "UDP", note: "Speed over reliability" },
      { name: "QUIC", note: "Reliable streams over UDP, no HOL blocking" },
      { name: "HTTP/3", note: "Built on QUIC" },
    ],
    realWorld: [
      "HTTP(S), database connections, SSH, SMTP",
      "Connection pooling to amortise handshakes",
      "Keep-alive to avoid re-handshaking",
    ],
    interviewQuestions: [
      "Walk through the three-way handshake.",
      "When would you choose TCP over UDP?",
      "What is head-of-line blocking?",
    ],
    scaling:
      "Connection setup is expensive at scale, so pool and reuse connections, keep them alive, and terminate TLS at the edge to avoid re-handshaking on every request.",
    internal: {
      summary: "TCP opens a connection with a three-way handshake, establishing sequence numbers before any data flows.",
      nodes: [
        { id: "client", label: "Client", sublabel: "wants a connection", kind: "start", detail: "Before any data flows, both sides must agree they're talking and sync up sequence numbers. That negotiation is the three-way handshake." },
        { id: "syn", label: "SYN →", sublabel: "seq = x", kind: "step", detail: "The client sends SYN with its initial sequence number x — essentially 'I want to talk, and I'll number my bytes starting here.'" },
        { id: "synack", label: "← SYN-ACK", sublabel: "server agrees, seq = y", kind: "step", detail: "The server replies SYN-ACK: it acknowledges x and sends its own starting number y. Both directions are now being established at once." },
        { id: "ack", label: "ACK →", sublabel: "ack = y + 1", kind: "step", detail: "The client acknowledges the server's number. Three messages, one round-trip of setup cost — which is why short-lived connections are expensive and pooling pays off." },
        { id: "est", label: "Connection Established", sublabel: "reliable byte stream", kind: "terminal", detail: "The connection is open. From here TCP guarantees ordered, retransmitted, congestion-controlled delivery — the reliable byte stream applications take for granted." },
      ],
      edges: [
        { source: "client", target: "syn" },
        { source: "syn", target: "synack" },
        { source: "synack", target: "ack" },
        { source: "ack", target: "est" },
      ],
    },
  },

  // ───────────────────────────────────────── UDP
  {
    id: "udp",
    name: "UDP",
    category: "networking",
    icon: "Radio",
    tagline: "Fire and forget — speed over guarantees.",
    definition:
      "UDP is a connectionless transport that sends datagrams with no handshake, ordering, or delivery guarantees — minimal overhead, minimal latency.",
    whyItExists:
      "Some workloads (live audio, video, games) would rather have a fresh packet now than a retransmitted stale one. UDP simply gets out of the way.",
    problemSolved:
      "Removes the latency and overhead of reliability when the application can tolerate loss — or handle it itself.",
    advantages: [
      "Lowest latency — no handshake or ACKs",
      "Supports broadcast and multicast",
      "Tiny header, stateless on the server",
    ],
    disadvantages: [
      "No delivery or ordering guarantees",
      "The app must cope with loss and reordering",
      "Often throttled or blocked by firewalls",
    ],
    alternatives: [
      { name: "TCP", note: "Reliability and ordering" },
      { name: "QUIC", note: "Reliability with UDP's speed" },
      { name: "App-level acks", note: "Add just the reliability you need" },
    ],
    realWorld: [
      "VoIP, video conferencing, live streaming",
      "Online multiplayer games",
      "DNS queries (small, retryable)",
    ],
    interviewQuestions: [
      "UDP vs TCP — the core tradeoff?",
      "Why does DNS use UDP?",
      "How do real-time games cope with packet loss?",
    ],
    scaling:
      "Stateless datagrams scale trivially — there's no per-connection state on the server — so pair UDP with application-level reliability only where it's actually needed.",
  },

  // ───────────────────────────────────────── HTTP
  {
    id: "http",
    name: "HTTP",
    category: "networking",
    icon: "ArrowLeftRight",
    tagline: "The request/response language of the web.",
    definition:
      "HTTP is a stateless request/response protocol (traditionally over TCP; HTTP/3 runs over QUIC) where verbs — GET, POST, PUT, PATCH, DELETE — act on resources identified by URLs, with status codes and headers conveying semantics.",
    whyItExists:
      "Clients and servers need a shared, extensible contract for requesting and manipulating resources. HTTP is that lingua franca of the web.",
    problemSolved:
      "Standardises how the web exchanges documents and data, with caching, status codes and content negotiation built in.",
    advantages: [
      "Universal and well understood",
      "GETs are cacheable end to end",
      "Rich semantics: verbs, status codes, headers",
    ],
    disadvantages: [
      "Stateless — state must live in cookies/tokens",
      "Verbose headers on every request",
      "Request/response only (no native push pre-HTTP/2)",
    ],
    alternatives: [
      { name: "WebSockets", note: "Full-duplex, persistent" },
      { name: "gRPC", note: "Binary RPC over HTTP/2" },
      { name: "HTTP/3", note: "HTTP over QUIC, no HOL blocking" },
    ],
    realWorld: [
      "Every REST API on the internet",
      "HTTP/2 multiplexing many streams per connection",
      "Cache-Control driving CDN behaviour",
    ],
    interviewQuestions: [
      "Idempotent vs safe methods — which are which?",
      "What makes an HTTP response cacheable?",
      "PUT vs PATCH — what's the difference?",
    ],
    scaling:
      "HTTP's statelessness is exactly what makes the app tier horizontally scalable; lean on caching headers and CDNs so most requests never reach your origin.",
  },

  // ───────────────────────────────────────── REST
  {
    id: "rest",
    name: "REST",
    category: "networking",
    icon: "Route",
    tagline: "Resources, verbs, and statelessness.",
    definition:
      "REST is an architectural style for APIs that models everything as resources addressed by URIs and manipulated with standard HTTP verbs, with each request carrying all the state it needs.",
    whyItExists:
      "APIs needed a uniform, predictable convention so clients could consume them without bespoke per-endpoint contracts. REST leans on HTTP's existing semantics to provide it.",
    problemSolved:
      "Gives teams a consistent, cacheable, evolvable way to expose data over HTTP without tightly coupling clients to server internals.",
    advantages: [
      "Uniform and predictable interface",
      "GETs are cacheable for free",
      "Clients decoupled from server implementation",
    ],
    disadvantages: [
      "Over- and under-fetching of data",
      "Many round trips for related resources",
      "No strict, machine-checked contract by default",
    ],
    alternatives: [
      { name: "GraphQL", note: "Client shapes exactly what it needs" },
      { name: "gRPC", note: "Typed, binary, action-oriented" },
      { name: "RPC", note: "Call remote actions directly" },
    ],
    realWorld: [
      "Stripe, GitHub, Twitter public APIs",
      "CRUD over HTTP in virtually every web app",
      "Resource URLs + verbs + JSON payloads",
    ],
    interviewQuestions: [
      "REST vs RPC vs GraphQL — when each?",
      "What actually makes an API RESTful?",
      "How do you version a REST API?",
    ],
    scaling:
      "Statelessness lets any server answer any request, so REST APIs scale horizontally with ease — pair with caching and pagination to handle read-heavy traffic.",
  },

  // ───────────────────────────────────────── RPC
  {
    id: "rpc",
    name: "RPC",
    category: "networking",
    icon: "Webhook",
    tagline: "Call a remote function like a local one.",
    definition:
      "Remote Procedure Call makes invoking a remote service look like a local function call — arguments are marshalled, sent, executed remotely, and the result returned, usually over a typed, binary contract.",
    whyItExists:
      "Services need to invoke each other's behaviour, not just shuffle resources around. RPC frames that as typed actions with generated client/server stubs.",
    problemSolved:
      "Provides efficient, strongly-typed, action-oriented service-to-service calls, often with code generation and compact binary encoding.",
    advantages: [
      "Compact and fast (binary, e.g. Protobuf)",
      "Strongly-typed contracts with codegen",
      "Natural fit for actions and commands",
    ],
    disadvantages: [
      "Tighter coupling to the shared contract",
      "Less cache-friendly than REST",
      "Hides the network — failures look like function calls",
    ],
    alternatives: [
      { name: "REST", note: "Resource-oriented, cacheable" },
      { name: "GraphQL", note: "Flexible client-driven queries" },
      { name: "Message queue", note: "Async, decoupled in time" },
    ],
    realWorld: [
      "gRPC, Thrift, and Twirp in microservice meshes",
      "Internal east-west traffic at scale",
      "HTTP/2 multiplexing many RPCs per connection",
    ],
    interviewQuestions: [
      "RPC vs REST — when would you pick each?",
      "How does gRPC leverage HTTP/2?",
      "What's the danger of making remote calls look local?",
    ],
    scaling:
      "Binary, multiplexed RPC (gRPC over HTTP/2) keeps service-to-service traffic cheap — but because the calls look local, always wrap them in timeouts and circuit breakers.",
  },

  // ───────────────────────────────────────── NoSQL
  {
    id: "nosql",
    name: "NoSQL Databases",
    category: "data",
    icon: "LayoutGrid",
    tagline: "Beyond tables and joins — stores shaped for specific access patterns.",
    mentalModel: "Specialised tools, not a Swiss-army knife — a key-value store, a document store and a graph store solve different jobs.",
    misconception: {
      myth: "NoSQL is schema-less and always faster than SQL.",
      reality: "Many NoSQL stores (Cassandra, wide-column) require a schema, and they're faster only for access patterns they're modelled around. Query off the partition key and they're slower than SQL.",
    },
    consequenceIfRemoved: "Workloads that don't fit relational tables — huge write volumes, flexible documents, graph traversals — are forced into a relational model that fights them.",
    definition:
      "NoSQL is a family of non-relational stores — key-value, document, wide-column, and graph — that trade some relational guarantees for horizontal scale, flexible schemas, or specific access patterns.",
    whyItExists:
      "Not all data is relational, and a single relational primary can't always absorb internet-scale writes. NoSQL stores optimise for particular data shapes and for scaling out.",
    problemSolved:
      "Provides horizontally-scalable storage and flexible schemas for workloads where joins and strict consistency aren't the top priority.",
    advantages: [
      "Horizontal write scaling out of the box",
      "Flexible, evolving schemas",
      "Each family tuned for a specific access pattern",
    ],
    disadvantages: [
      "Many default to eventual consistency (BASE), though tunable and strong options exist",
      "Limited joins and multi-row transactions",
      "You model around queries, not entities",
    ],
    alternatives: [
      { name: "RDBMS", note: "Relational integrity and joins" },
      { name: "NewSQL", note: "SQL semantics that shard" },
      { name: "Polyglot persistence", note: "Right store per workload" },
    ],
    realWorld: [
      "Redis (KV), MongoDB (document)",
      "Cassandra (wide-column), Neo4j (graph)",
      "DynamoDB powering massive write workloads",
    ],
    interviewQuestions: [
      "Key-value vs document vs wide-column vs graph?",
      "When do you choose NoSQL over SQL?",
      "How does denormalization fit NoSQL modelling?",
    ],
    scaling:
      "NoSQL is built to scale out — but you pay by modelling data per query and accepting eventual consistency. Pick the family that matches how you actually read your data.",
    internal: {
      summary: "Choosing a NoSQL store starts from your access pattern — the data's shape points to a family.",
      nodes: [
        { id: "q", label: "How do you read the data?", kind: "decision", detail: "NoSQL isn't one thing — it's a family. The right choice falls out of one question: what does your access pattern actually look like? Model around the query, not the entity." },
        { id: "kv", label: "Key-Value", sublabel: "Redis · sessions, caches", kind: "terminal", detail: "If you always look data up by a single key, a key-value store gives you the fastest possible read. Perfect for sessions, caches and feature flags." },
        { id: "doc", label: "Document", sublabel: "MongoDB · nested objects", kind: "terminal", detail: "If your data is self-contained nested objects you fetch whole, a document store fits — flexible schema, no joins needed to reassemble one record." },
        { id: "wc", label: "Wide-Column", sublabel: "Cassandra · massive writes", kind: "terminal", detail: "If you need enormous write throughput and always query by a partition key, a wide-column store like Cassandra scales writes horizontally — at the cost of ad-hoc queries." },
        { id: "graph", label: "Graph", sublabel: "Neo4j · relationships", kind: "terminal", detail: "If the relationships between records are the point — friends-of-friends, recommendations — a graph database traverses them far more naturally than joins ever could." },
      ],
      edges: [
        { source: "q", target: "kv", label: "simple lookups" },
        { source: "q", target: "doc", label: "nested records" },
        { source: "q", target: "wc", label: "write-heavy" },
        { source: "q", target: "graph", label: "connections" },
      ],
    },
  },

  // ───────────────────────────────────────── Federation
  {
    id: "federation",
    name: "Federation",
    category: "data",
    icon: "Columns3",
    tagline: "Split databases by function.",
    definition:
      "Federation (functional partitioning) splits a database by feature or domain — separate stores for users, products and orders — so each can be scaled and tuned independently. Not to be confused with identity federation (SAML/OAuth) or GraphQL federation — this is about splitting databases by domain.",
    whyItExists:
      "A single monolithic database becomes a bottleneck and a point of contention. Splitting by function reduces load and lets teams own their slice of the data.",
    problemSolved:
      "Reduces read/write load and lock contention on any one database by separating unrelated concerns.",
    advantages: [
      "Less load and contention per database",
      "Smaller, faster per-domain datasets",
      "Clear data ownership boundaries",
    ],
    disadvantages: [
      "Cross-domain joins move into application code",
      "More databases to operate and back up",
      "Doesn't help a single oversized dataset",
    ],
    alternatives: [
      { name: "Sharding", note: "Split one big dataset horizontally" },
      { name: "Read replicas", note: "Scale reads, not domains" },
      { name: "Microservices", note: "Service-private databases" },
    ],
    realWorld: [
      "Separate users / orders / inventory databases",
      "The data-layer mirror of microservices",
      "Decomposing a strained monolith DB",
    ],
    interviewQuestions: [
      "Federation vs sharding — what's the difference?",
      "How do you join across federated databases?",
      "When does federation stop helping?",
    ],
    scaling:
      "Federation buys headroom by dividing unrelated load, but a single hot domain still eventually needs sharding to scale beyond one machine.",
  },

  // ───────────────────────────────────────── Denormalization
  {
    id: "denormalization",
    name: "Denormalization",
    category: "data",
    icon: "Combine",
    tagline: "Trade write cost for read speed.",
    definition:
      "Denormalization stores redundant data — precomputed joins, duplicated fields — so reads avoid expensive joins, at the cost of more complex, duplicated writes.",
    whyItExists:
      "Joins across large tables are slow. When reads vastly outnumber writes, precomputing the joined shape is far cheaper overall.",
    problemSolved:
      "Eliminates expensive read-time joins and aggregations by paying that cost once, at write time.",
    advantages: [
      "Much faster reads — no joins at query time",
      "Fewer tables touched per query",
      "Aligns naturally with key-value and document stores that lack joins",
    ],
    disadvantages: [
      "Writes must update every copy",
      "Risk of data drift and inconsistency",
      "Uses more storage",
    ],
    alternatives: [
      { name: "Normalized + cache", note: "Keep one copy, cache hot reads" },
      { name: "Materialized views", note: "DB precomputes the join" },
      { name: "CQRS", note: "A separate read model" },
    ],
    realWorld: [
      "Wide-column stores (Cassandra) by design",
      "Precomputed feeds and counters",
      "Storing author_name alongside post_id",
    ],
    interviewQuestions: [
      "When is denormalization worth it?",
      "How do you keep duplicated copies consistent?",
      "Normalization vs denormalization tradeoffs?",
    ],
    scaling:
      "Denormalization is how you make reads scale when joins won't — but it pushes consistency work onto every write path, so it shines in read-heavy systems.",
  },

  // ───────────────────────────────────────── Indexing
  {
    id: "indexing",
    name: "Indexing & SQL Tuning",
    category: "data",
    icon: "ListTree",
    tagline: "Find rows without scanning them all.",
    definition:
      "An index is an auxiliary structure (usually a B-tree) that lets the database locate rows by a column's value in O(log n) instead of scanning the whole table — the first lever of SQL tuning.",
    whyItExists:
      "Full table scans are O(n) and crippling at scale. Indexes turn lookups, ranges and sorts into fast operations, at the cost of storage and slower writes.",
    problemSolved:
      "Makes targeted reads — lookups, range scans, sorts, joins — fast without examining every row.",
    advantages: [
      "Dramatically faster reads, filters and sorts",
      "Enables efficient joins and uniqueness",
      "EXPLAIN exposes the query plan to tune",
    ],
    disadvantages: [
      "Every index slows down writes",
      "Indexes consume storage",
      "Wrong indexes hurt more than they help",
    ],
    alternatives: [
      { name: "Full scans", note: "Fine for small tables" },
      { name: "Denormalization", note: "Avoid the join entirely" },
      { name: "Search engines", note: "Elasticsearch for text" },
    ],
    realWorld: [
      "B-tree indexes in Postgres / MySQL",
      "Composite and covering indexes",
      "EXPLAIN ANALYZE to inspect plans",
    ],
    interviewQuestions: [
      "How does a B-tree index work?",
      "Why can too many indexes hurt?",
      "What is a covering index?",
    ],
    scaling:
      "Indexing is the first thing to reach for in SQL tuning — but each index taxes writes, so index for your real query patterns, not hypothetical ones.",
  },

  // ───────────────────────────────────────── Consistent Hashing
  {
    id: "consistent-hashing",
    name: "Consistent Hashing",
    category: "scalability",
    icon: "Disc3",
    tagline: "Add a node without reshuffling everything.",
    definition:
      "Consistent hashing maps both keys and nodes onto a ring; each key belongs to the next node clockwise, so adding or removing a node only relocates the keys near it — not all of them.",
    whyItExists:
      "Naive hash(key) % N remaps almost every key when N changes, causing massive cache and data churn. Consistent hashing makes scaling incremental.",
    problemSolved:
      "Minimises how much data must move when the cluster grows or shrinks, keeping caches warm and rebalancing cheap.",
    advantages: [
      "Only ~1/N of keys move when scaling",
      "No global reshuffle on membership change",
      "Virtual nodes smooth out hotspots",
    ],
    disadvantages: [
      "More complex than modulo hashing",
      "Uneven load without virtual nodes",
      "Still needs replication for availability",
    ],
    alternatives: [
      { name: "Modulo hashing", note: "Simple, but churny on resize" },
      { name: "Range partitioning", note: "Ordered, but prone to hotspots" },
      { name: "Rendezvous hashing", note: "Highest-random-weight variant" },
    ],
    realWorld: [
      "Distributed caches (Memcached clients)",
      "Cassandra & DynamoDB partitioning",
      "CDN and load-balancer request routing",
    ],
    interviewQuestions: [
      "Why not just hash mod N?",
      "How do virtual nodes help distribution?",
      "What happens to keys when a node fails?",
    ],
    scaling:
      "Consistent hashing is what lets distributed caches and databases grow and shrink elastically without triggering a thundering herd of cache misses.",
    internal: {
      summary: "A key is hashed onto a ring and owned by the next node clockwise; adding a node only steals keys from its neighbour.",
      nodes: [
        { id: "key", label: "Key 'user_42'", kind: "start", detail: "We need to decide which server stores this key. Naive hash(key) % N works — until N changes, which remaps almost every key and triggers a cache-wipe stampede." },
        { id: "hash", label: "hash(key)", sublabel: "→ position on ring", kind: "step", detail: "Consistent hashing hashes the key to a point on a fixed circle (0–360°), independent of how many servers currently exist." },
        { id: "ring", label: "Place on hash ring", sublabel: "0° … 360°", kind: "step", detail: "The servers are hashed onto the same ring. Both keys and nodes live in one circular address space — that shared space is the whole trick." },
        { id: "walk", label: "Walk clockwise →", sublabel: "find next node", kind: "step", detail: "From the key's position, walk clockwise to the first server you meet. That server owns the key — a purely local rule needing no central coordinator." },
        { id: "owner", label: "Node B owns it", sublabel: "virtual nodes even the load", kind: "terminal", detail: "Add or remove a server and only the keys between it and its neighbour move — about 1/N of them. Virtual nodes scatter each server to many ring points so load stays even." },
      ],
      edges: [
        { source: "key", target: "hash" },
        { source: "hash", target: "ring" },
        { source: "ring", target: "walk" },
        { source: "walk", target: "owner" },
      ],
    },
  },

  // ───────────────────────────────────────── Failover
  {
    id: "failover",
    name: "Failover",
    category: "reliability",
    icon: "RefreshCw",
    tagline: "Promote a standby when the primary dies.",
    definition:
      "Failover automatically shifts traffic from a failed component to a healthy replacement — active-passive (a warm standby waits) or active-active (all nodes serve and survivors absorb the load).",
    whyItExists:
      "Hardware and processes fail. To stay available, the system must detect failure and redirect to a replacement without waiting for a human.",
    problemSolved:
      "Removes single points of failure by ensuring a ready replacement takes over the moment a node goes down.",
    advantages: [
      "Higher availability — more nines",
      "Recovers without human intervention",
      "Active-active also adds serving capacity",
    ],
    disadvantages: [
      "Standby capacity costs money (active-passive)",
      "Split-brain risk if both think they're primary",
      "Failover itself can drop in-flight work",
    ],
    alternatives: [
      { name: "Active-active", note: "All nodes serve; no idle standby" },
      { name: "Multi-region", note: "Survive a whole region failing" },
      { name: "Accept downtime", note: "Sometimes cheapest and fine" },
    ],
    realWorld: [
      "DB primary failover (Patroni, RDS Multi-AZ)",
      "Load balancers draining dead instances",
      "Leader election via Raft / ZooKeeper",
    ],
    interviewQuestions: [
      "Active-passive vs active-active?",
      "What is split-brain and how do you prevent it?",
      "How do health checks drive failover?",
    ],
    scaling:
      "Failover is the mechanism behind the availability nines; active-active doubles as horizontal scale, while active-passive trades idle cost for simplicity.",
    internal: {
      summary: "A health check continuously probes the primary; on failure it promotes a standby to take over.",
      nodes: [
        { id: "primary", label: "Primary serving", kind: "start", detail: "The primary handles all traffic while a standby waits in the wings, kept in sync and ready to take over the moment it's needed." },
        { id: "check", label: "Heartbeat OK?", kind: "decision", detail: "A health monitor continuously pings the primary. Failover lives or dies on this detection: too eager and you flap, too slow and downtime drags on." },
        { id: "ok", label: "Keep serving", sublabel: "re-check on interval", kind: "step", detail: "Heartbeat healthy: nothing to do. The system simply loops back and checks again on the next interval." },
        { id: "down", label: "Mark primary down", sublabel: "fence it off", kind: "step", detail: "Heartbeat lost: declare the primary dead and fence it off so it can't keep accepting writes — this is what prevents two primaries (split-brain)." },
        { id: "promote", label: "Promote standby", kind: "step", detail: "The standby is promoted to primary. The brief window between detection and promotion is when writes fail — the failover gap you're trying to minimise." },
        { id: "live", label: "Standby is now primary", kind: "terminal", detail: "Traffic reroutes to the new primary and service resumes automatically — no human paged. A fresh standby is then provisioned to restore redundancy." },
      ],
      edges: [
        { source: "primary", target: "check" },
        { source: "check", target: "ok", label: "yes" },
        { source: "ok", target: "check" },
        { source: "check", target: "down", label: "no" },
        { source: "down", target: "promote" },
        { source: "promote", target: "live" },
      ],
    },
  },

  // ───────────────────────────────────────── Retry & Backoff
  {
    id: "retry",
    name: "Retry & Backoff",
    category: "reliability",
    icon: "Repeat",
    tagline: "Try again — but politely.",
    definition:
      "A retry re-attempts a failed operation, ideally with exponential backoff and jitter, to ride out transient failures without overwhelming an already-struggling dependency.",
    whyItExists:
      "Many failures are transient — a blip, a brief overload. Retrying recovers from them, but naive immediate retries can turn a hiccup into a self-inflicted DDoS.",
    problemSolved:
      "Recovers from transient errors automatically while backoff and jitter stop retry storms from amplifying the original problem.",
    advantages: [
      "Transparently survives transient faults",
      "Backoff protects the struggling dependency",
      "Jitter de-synchronises retrying clients",
    ],
    disadvantages: [
      "Retrying non-idempotent ops can double-apply",
      "Unbounded retries amplify load",
      "Adds latency to the eventual success/failure",
    ],
    alternatives: [
      { name: "Circuit breaker", note: "Stop retrying a dead dependency" },
      { name: "Idempotency keys", note: "Make retries safe to repeat" },
      { name: "Dead-letter queue", note: "Park what keeps failing" },
    ],
    realWorld: [
      "AWS SDKs' exponential backoff",
      "Retrying idempotent reads automatically",
      "Capped retries + full jitter",
    ],
    interviewQuestions: [
      "Why add jitter to exponential backoff?",
      "Which operations are safe to retry?",
      "Retry vs circuit breaker — when each?",
    ],
    scaling:
      "At scale, synchronised retries cause thundering herds — exponential backoff with jitter and a retry budget keep recovery from becoming the outage.",
  },

  // ───────────────────────────────────────── Back Pressure
  {
    id: "back-pressure",
    name: "Back Pressure",
    category: "reliability",
    icon: "Waves",
    tagline: "Push back when you're overwhelmed.",
    definition:
      "Back pressure is a flow-control signal: when a consumer can't keep up, it tells producers to slow down — or rejects and sheds work — instead of silently collapsing.",
    whyItExists:
      "Unbounded queues hide overload until memory runs out and everything crashes. Back pressure surfaces the limit and keeps the system in a stable, degraded state.",
    problemSolved:
      "Prevents fast producers from overwhelming slow consumers, avoiding unbounded queues, OOM crashes and cascading failure.",
    advantages: [
      "Stability under overload",
      "Bounded memory and queue depth",
      "Fails predictably (429/503) not catastrophically",
    ],
    disadvantages: [
      "Producers must handle rejection or slowdown",
      "Pressure can propagate upstream",
      "Thresholds are tricky to tune",
    ],
    alternatives: [
      { name: "Rate limiting", note: "Cap input proactively" },
      { name: "Load shedding", note: "Drop low-priority work" },
      { name: "Autoscaling", note: "Add consumers instead" },
    ],
    realWorld: [
      "TCP flow control (the original back pressure)",
      "Reactive streams signalling demand",
      "Queues rejecting when full; HTTP 429/503",
    ],
    interviewQuestions: [
      "Back pressure vs rate limiting?",
      "What happens with an unbounded queue under load?",
      "How do reactive streams signal demand upstream?",
    ],
    scaling:
      "Back pressure is what keeps a distributed system from melting down under a spike — it converts 'crash' into 'gracefully slow', buying time for autoscaling to catch up.",
  },

  // ───────────────────────────────────────── Task Queue
  {
    id: "task-queue",
    name: "Task Queue",
    category: "messaging",
    icon: "ListChecks",
    tagline: "Offload slow work to background workers.",
    definition:
      "A task queue accepts units of work (jobs) and hands them to a pool of background workers that execute them asynchronously, decoupling slow work from the request path.",
    whyItExists:
      "Some work — sending email, generating thumbnails, running billing — is too slow to do inside a request. A task queue lets you accept it instantly and process it later.",
    problemSolved:
      "Keeps request latency low by moving slow, retryable, or scheduled work off the synchronous path onto workers.",
    advantages: [
      "Fast responses — the work happens later",
      "Built-in retries and scheduling",
      "Scale workers independently of the web tier",
    ],
    disadvantages: [
      "Eventual completion, not instant",
      "Jobs must be idempotent (at-least-once)",
      "Another system to monitor (dead-letter queues)",
    ],
    alternatives: [
      { name: "Message queue", note: "Lower-level event transport" },
      { name: "Synchronous", note: "Simple, but blocks the request" },
      { name: "Cron / batch", note: "For scheduled bulk work" },
    ],
    realWorld: [
      "Celery on Redis / RabbitMQ",
      "Sidekiq for Ruby background jobs",
      "Thumbnail, email and report pipelines",
    ],
    interviewQuestions: [
      "Task queue vs message queue?",
      "How do you handle a job that keeps failing?",
      "How do you schedule delayed or periodic jobs?",
    ],
    scaling:
      "Workers scale horizontally off the queue depth — queue length is your autoscaling signal, and back pressure protects the downstreams they write to.",
  },
];

/** The full library: infrastructure concepts plus cross-cutting foundations. */
export const CONCEPTS: Concept[] = [...INFRA_CONCEPTS, ...FOUNDATIONS];

/** Fast lookup by id. */
export const CONCEPT_MAP: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);

export function getConcept(id: string): Concept | undefined {
  return CONCEPT_MAP[id];
}
