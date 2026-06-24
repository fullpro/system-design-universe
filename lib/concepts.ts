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
    whenToUse:
      "Every system has a client — the question is how thick. Use a rich client (SPA, native app) when you need offline capability, rich interactivity, or push updates. Use a thin client (server-rendered HTML) when you want fast first paint, SEO, and minimal JS.",
    whenNotToUse:
      "Don't put business logic, secrets, or trust boundaries in the client — it runs on hardware you don't control. Never treat client-side validation as a security gate; always re-validate server-side.",
    relatedConcepts: ["cdn", "dns", "load-balancer", "http", "web-server"],
    sources: [
      { label: "web.dev — Performance", url: "https://web.dev/performance/" },
      { label: "MDN — Progressive Web Apps", url: "https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps" },
      { label: "Google — RAIL performance model", url: "https://web.dev/rail/" },
    ],
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
    whenToUse:
      "Always — it's foundational. Lean on it deliberately for geo-routing, weighted/canary rollouts, and health-based failover, and lower TTLs ahead of a planned migration so changes propagate quickly.",
    whenNotToUse:
      "Don't use DNS as your only failover mechanism for fast recovery — TTL caching means clients can keep hitting a dead IP for minutes. For internal east-west service discovery, a registry (Consul/etcd) reacts faster than public DNS.",
    relatedConcepts: ["cdn", "load-balancer", "client", "failover", "http"],
    sources: [
      { label: "RFC 1034 — Domain Names: Concepts and Facilities", url: "https://www.rfc-editor.org/rfc/rfc1034" },
      { label: "Cloudflare — What is DNS?", url: "https://www.cloudflare.com/learning/dns/what-is-dns/" },
      { label: "AWS — Route 53 routing policies", url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html" },
    ],
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
    whenToUse:
      "For static and cacheable assets (images, JS/CSS, video, downloads) served to a geographically spread audience, and increasingly for cacheable API responses and edge compute. Also a front-line DDoS absorption layer.",
    whenNotToUse:
      "For highly dynamic, per-user, uncacheable responses there's little to cache (though edge TLS termination and DDoS protection can still help). Cache invalidation of frequently-changing assets adds complexity you may not want.",
    relatedConcepts: ["dns", "cache", "reverse-proxy", "object-store", "http"],
    sources: [
      { label: "Cloudflare — What is a CDN?", url: "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/" },
      { label: "AWS — How CloudFront delivers content", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html" },
      { label: "MDN — HTTP caching", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching" },
    ],
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
      failures: [
        {
          at: "edge",
          label: "Edge PoP failure",
          what: "If the nearest edge goes down, users in that region lose the latency benefit and may see errors until traffic reroutes.",
          recovery: "Anycast routing automatically steers traffic to the next-nearest PoP. The failover is transparent to the client — just slightly higher latency while the closer PoP is down.",
        },
        {
          at: "origin",
          label: "Origin overload on cache miss storm",
          what: "If many edge caches expire simultaneously (mass TTL expiry or a purge), all PoPs fetch from origin at once — a thundering herd that can crush the origin server.",
          recovery: "Stagger TTLs with jitter so caches don't expire in lockstep. Use a shield (mid-tier cache) between edges and origin so only one upstream request per asset reaches the origin.",
        },
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
    whenToUse:
      "The moment you run more than one instance of anything stateless — to spread load, route around dead instances, and present a single stable address. L4 for raw throughput, L7 when you need path/host routing, TLS termination or header-aware decisions.",
    whenNotToUse:
      "For a single instance with no redundancy it adds a hop for no benefit. It also can't rescue a stateful app that pins users to one server — fix the state first (externalise sessions), or the balancer just spreads load it can't actually move.",
    relatedConcepts: ["reverse-proxy", "api-gateway", "dns", "failover", "services"],
    sources: [
      { label: "Cloudflare — What is load balancing?", url: "https://www.cloudflare.com/learning/performance/what-is-load-balancing/" },
      { label: "NGINX — Load balancing", url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/" },
      { label: "AWS — Elastic Load Balancing types", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html" },
    ],
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
    whenToUse:
      "Once you have multiple services and want one front door to centralise auth, rate limiting, routing, and request shaping — so every service doesn't reimplement them. The natural public edge of a microservice system.",
    whenNotToUse:
      "For a single service, a plain reverse proxy is lighter. Beware letting business logic leak into the gateway — that turns it into a distributed monolith and a deployment bottleneck every team must coordinate through.",
    relatedConcepts: ["reverse-proxy", "load-balancer", "rate-limiting", "services", "rest"],
    sources: [
      { label: "Microsoft Azure — API Gateway pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway" },
      { label: "NGINX — API gateway", url: "https://www.nginx.com/learn/api-gateway/" },
      { label: "AWS — What is an API gateway?", url: "https://aws.amazon.com/what-is/api-gateway/" },
    ],
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
      failures: [
        {
          at: "auth",
          label: "Auth service down",
          what: "If the authentication service is unreachable, the gateway can't verify tokens and rejects every request — even from legitimate, previously-authenticated users.",
          recovery: "Cache valid token verifications briefly (JWT signature checks are stateless and cacheable). For non-sensitive endpoints, consider a fail-open policy with degraded auth during brief outages.",
        },
        {
          at: "rate",
          label: "Rate limiter state lost",
          what: "If the shared rate-limit counter store (Redis) restarts or loses state, all counters reset to zero — temporarily allowing a burst of traffic through that should have been throttled.",
          recovery: "Use distributed, replicated counters and accept approximate limits during recovery. Per-node local rate limits provide a floor even when the shared store is unavailable.",
        },
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
    whenToUse:
      "When teams and domains have grown enough that a single codebase slows everyone down, and parts of the system need to scale or deploy independently. Split along clear domain boundaries with their own data.",
    whenNotToUse:
      "Early on, or for small teams — a well-structured monolith ships faster and is far easier to operate than a distributed system. Premature microservices buy network failures, latency and operational load for org benefits you don't yet need.",
    relatedConcepts: ["api-gateway", "message-queue", "kubernetes", "federation", "circuit-breaker"],
    sources: [
      { label: "Martin Fowler — Microservices", url: "https://martinfowler.com/articles/microservices.html" },
      { label: "Martin Fowler — MonolithFirst", url: "https://martinfowler.com/bliki/MonolithFirst.html" },
      { label: "Microsoft — Microservices architecture style", url: "https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices" },
    ],
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

  // ───────────────────────────────────────── Read API
  {
    id: "read-api",
    name: "Read API",
    category: "application",
    icon: "BookOpen",
    tagline: "The fast path — serve reads without touching the write master.",
    mentalModel: "The reference desk at a library — answers questions from copies and indexes, never disturbing the author at work.",
    misconception: {
      myth: "Reads and writes can share the same scaling strategy.",
      reality: "Reads outnumber writes 10–100× in most systems. Separating them lets you cache, replicate and scale reads independently without complicating the write path.",
    },
    consequenceIfRemoved: "Every read hits the same path as writes, competing for write-master resources. Under load, reads starve or writes slow down — you can't tune either independently.",
    definition:
      "A dedicated API tier that handles all read (query) requests, pulling from caches and read replicas rather than the write master.",
    whyItExists:
      "Reads are the majority of traffic and tolerate slight staleness. Giving them their own path lets you optimise for latency (cache, replicas) without affecting write consistency.",
    problemSolved:
      "Prevents read traffic from competing with writes on the same database connection pool, and enables aggressive caching and replication on the read path alone.",
    advantages: [
      "Scales independently — add caches and replicas without touching the write path",
      "Lower latency — reads served from memory or replicas, not the busy primary",
      "Failure isolation — a read-path issue doesn't block writes",
    ],
    disadvantages: [
      "Stale reads — caches and replicas lag behind the write master",
      "More moving parts — cache invalidation and replication lag must be managed",
      "Cross-cutting queries that join read and write data become harder",
    ],
    alternatives: [
      { name: "Unified API", note: "One path for everything — simpler until scale forces a split" },
      { name: "GraphQL", note: "Clients declare exactly the data they need; backend resolves read sources" },
    ],
    realWorld: [
      "Twitter's read path serving timelines from Redis, not the write DB",
      "E-commerce product pages served from read replicas + CDN",
      "Search APIs backed by Elasticsearch, decoupled from the write store",
    ],
    interviewQuestions: [
      "How do you handle a user reading their own write before the replica catches up?",
      "When should a read bypass the cache and go straight to the database?",
      "How do you decide the TTL for cached reads?",
    ],
    scaling:
      "Add read replicas and cache layers horizontally. Because reads are stateless and tolerate staleness, you can scale them almost linearly — the write master is never the bottleneck for reads.",
    whenToUse:
      "When reads vastly outnumber writes (the common case — 10–100×) and you can tolerate slight staleness. Splitting the read path lets you cache aggressively and add replicas without touching the write master.",
    whenNotToUse:
      "When reads must always reflect the latest write (e.g. 'did my payment go through?') — read-your-writes consistency adds complexity. Also overkill for low-traffic systems where a single API handles both paths fine.",
    relatedConcepts: ["write-api", "cache", "read-replica", "cqrs", "database"],
    sources: [
      { label: "Microsoft — CQRS pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs" },
      { label: "AWS — Read replicas", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html" },
      { label: "Martin Fowler — CQRS", url: "https://martinfowler.com/bliki/CQRS.html" },
    ],
  },

  // ───────────────────────────────────────── Write API
  {
    id: "write-api",
    name: "Write API",
    category: "application",
    icon: "PenLine",
    tagline: "The synchronous write path — validate, persist, confirm.",
    mentalModel: "The bank teller — takes your deposit, records it in the ledger, and hands you a receipt before you leave.",
    misconception: {
      myth: "All writes need to be synchronous.",
      reality: "Only writes where the caller needs immediate confirmation (e.g. payment) must be synchronous. Everything else can be queued and processed async for better throughput.",
    },
    consequenceIfRemoved: "No synchronous writes — the system can't confirm changes to the caller. Users get no receipt, no confirmation, no error feedback on their mutations.",
    definition:
      "A dedicated API tier that processes synchronous write (mutation) requests — validates input, persists to the write master, updates the cache, and returns a result.",
    whyItExists:
      "Some writes need an immediate answer: did the payment go through? Is the username taken? The synchronous write API guarantees the caller gets a definitive result before the connection closes.",
    problemSolved:
      "Gives callers immediate confirmation of writes while keeping the write path separate from reads so each can be scaled, rate-limited and monitored independently.",
    advantages: [
      "Immediate confirmation — the caller knows the write succeeded or failed",
      "Can enforce strict validation and consistency on the write path",
      "Separated from reads, so write-heavy spikes don't degrade query latency",
    ],
    disadvantages: [
      "Slower than async — the caller blocks until the write is durable",
      "Write master is a bottleneck — can't horizontally scale a single primary easily",
      "Heavy writes can spike latency if not rate-limited",
    ],
    alternatives: [
      { name: "Async write API", note: "Queue the write and confirm later — higher throughput, eventual confirmation" },
      { name: "CQRS", note: "Formalise the read/write split with separate models and stores" },
    ],
    realWorld: [
      "Stripe's payment API — synchronous because the caller needs the charge result",
      "User registration — must confirm the username is available before proceeding",
      "Inventory reservation — must atomically decrement stock and confirm",
    ],
    interviewQuestions: [
      "When should a write be synchronous vs. async?",
      "How do you handle a write that succeeds at the DB but the response is lost?",
      "What consistency guarantee does the caller get from a synchronous write?",
    ],
    scaling:
      "Vertical scale the write master as far as it goes, then shard by key. Rate-limit writes to protect the primary. Move non-critical side effects (emails, analytics) to the async path.",
    whenToUse:
      "When the caller needs immediate confirmation that the mutation succeeded — payments, account creation, inventory reservation. The synchronous receipt is the point.",
    whenNotToUse:
      "When the caller doesn't need an instant result — email sends, thumbnail generation, analytics events. These should go through the async write path for better throughput and resilience.",
    relatedConcepts: ["read-api", "write-api-async", "database", "cqrs", "message-queue"],
    sources: [
      { label: "Microsoft — CQRS pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs" },
      { label: "Stripe — Idempotent requests", url: "https://stripe.com/docs/api/idempotent_requests" },
      { label: "Martin Fowler — CQRS", url: "https://martinfowler.com/bliki/CQRS.html" },
    ],
  },

  // ───────────────────────────────────────── Write API Async
  {
    id: "write-api-async",
    name: "Write API Async",
    category: "application",
    icon: "SendHorizonal",
    tagline: "Accept now, process later — decouple the caller from the work.",
    mentalModel: "The post office — you hand over the package and get a tracking number; delivery happens in the background.",
    misconception: {
      myth: "Async writes are unreliable because you don't wait for a result.",
      reality: "The write is durably enqueued the moment you get an acknowledgement. The queue guarantees it will be processed — you've traded synchronous confirmation for throughput and resilience.",
    },
    consequenceIfRemoved: "Every write must be processed inline, blocking the caller. Spiky workloads overwhelm the system because there's no buffer to absorb bursts.",
    definition:
      "An API tier that accepts write requests, durably enqueues them, and returns immediately. Background workers drain the queue and do the actual processing.",
    whyItExists:
      "Many writes don't need instant results: sending emails, generating thumbnails, updating analytics. Accepting them into a queue and processing out-of-band smooths spikes and keeps the request path fast.",
    problemSolved:
      "Decouples the speed of acceptance from the speed of processing. The caller gets a fast acknowledgement; the system processes the work at its own pace without being overwhelmed by bursts.",
    advantages: [
      "Fast response — the caller doesn't wait for heavy processing",
      "Absorbs traffic spikes — the queue buffers bursts that would overwhelm synchronous processing",
      "Retry-friendly — failed processing can be retried from the queue without the caller re-submitting",
    ],
    disadvantages: [
      "No immediate result — the caller only knows the write was accepted, not completed",
      "Complexity — you need a queue, workers, dead-letter handling, and idempotency",
      "Ordering — parallel workers may process messages out of order",
    ],
    alternatives: [
      { name: "Synchronous write API", note: "Block until done — simpler when latency and throughput allow" },
      { name: "Webhooks", note: "Notify the caller when async processing completes" },
    ],
    realWorld: [
      "Video upload — accept the file, return a job ID, transcode in the background",
      "Order placement — enqueue for fulfilment, email confirmation async",
      "Bulk import — accept the CSV, process rows via workers, report progress",
    ],
    interviewQuestions: [
      "How does the caller find out the async write finished?",
      "What happens if a worker crashes mid-processing?",
      "How do you guarantee exactly-once processing from a queue?",
    ],
    scaling:
      "Add more workers to drain the queue faster. The queue itself scales by partitioning. Because workers are stateless consumers, horizontal scaling is straightforward — just add instances.",
    whenToUse:
      "When the caller doesn't need the result now — file processing, notifications, analytics ingestion, anything where 'accepted' is a good enough immediate answer. Also when you need to absorb traffic spikes without scaling the write master.",
    whenNotToUse:
      "When the caller blocks on the outcome (payment confirmation, username uniqueness check). If the user is staring at a spinner waiting for the result, async adds complexity without benefit — use the synchronous write API.",
    relatedConcepts: ["write-api", "message-queue", "worker-service", "back-pressure", "task-queue"],
    sources: [
      { label: "AWS — Asynchronous messaging patterns", url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/async-messaging.html" },
      { label: "Microsoft — Async request-reply pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/async-request-reply" },
      { label: "Confluent — Event-driven architecture", url: "https://developer.confluent.io/courses/event-driven-architecture/overview/" },
    ],
  },

  // ───────────────────────────────────────── Worker Service
  {
    id: "worker-service",
    name: "Worker Service",
    category: "application",
    icon: "Cog",
    tagline: "The background crew — drains queues and does the heavy lifting.",
    mentalModel: "The warehouse team — they unload the delivery trucks at their own pace, separate from the shop floor.",
    misconception: {
      myth: "Workers are just slower versions of the API.",
      reality: "Workers are optimised for throughput, not latency. They batch, retry, and can take minutes per job — they're a fundamentally different execution model from request-response.",
    },
    consequenceIfRemoved: "Queued work piles up unprocessed. Async writes never complete, thumbnails never generate, emails never send — the queue grows until it hits its retention limit.",
    definition:
      "A pool of background processes that consume messages from a queue, perform the actual work (persist to NoSQL, send emails, generate reports), and acknowledge completion.",
    whyItExists:
      "Separating 'accept the request' from 'do the work' lets each scale independently. Workers can be CPU-heavy, slow, and bursty without affecting the user-facing API latency.",
    problemSolved:
      "Processes async work reliably at the system's own pace, independent of user-facing traffic. Failed jobs retry automatically; the queue guarantees nothing is silently dropped.",
    advantages: [
      "Independent scaling — add workers when the queue depth grows",
      "Failure isolation — a crashing worker doesn't affect the API",
      "Can be specialised — different worker pools for different job types",
    ],
    disadvantages: [
      "Operational overhead — monitoring queue depth, dead letters, worker health",
      "Latency is unbounded — processing time depends on queue depth and worker count",
      "Idempotency required — workers must handle duplicate deliveries safely",
    ],
    alternatives: [
      { name: "Serverless functions", note: "Auto-scaling workers triggered by queue events" },
      { name: "Inline processing", note: "Do the work in the request path — simpler, but blocks the caller" },
    ],
    realWorld: [
      "Celery workers processing Django background tasks",
      "AWS Lambda triggered by SQS messages",
      "Sidekiq workers handling Ruby on Rails background jobs",
    ],
    interviewQuestions: [
      "How do you handle a worker that dies mid-job?",
      "How do you scale workers based on queue pressure?",
      "What's the difference between at-least-once and exactly-once processing?",
    ],
    scaling:
      "Horizontal: spin up more worker instances. The queue is the backpressure signal — monitor depth and scale workers to keep it near zero. Use separate pools for different job priorities.",
    whenToUse:
      "Whenever work can be done outside the request path — background jobs, ETL, image processing, sending emails. Workers decouple acceptance speed from processing speed.",
    whenNotToUse:
      "For request-response work where the user is waiting for the result. Workers are throughput-optimised, not latency-optimised — if sub-second response matters, keep it in the API tier.",
    relatedConcepts: ["write-api-async", "message-queue", "task-queue", "back-pressure", "kubernetes"],
    sources: [
      { label: "AWS — Worker environments", url: "https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features-managing-env-tiers.html" },
      { label: "Sidekiq — Best practices", url: "https://github.com/sidekiq/sidekiq/wiki/Best-Practices" },
      { label: "Celery — Introduction", url: "https://docs.celeryq.dev/en/stable/getting-started/introduction.html" },
    ],
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
    whenToUse:
      "Read-heavy workloads with hot keys read far more than written — sessions, feeds, product pages, rate-limiter counters, leaderboards. Anywhere repeated reads of the same data are pounding a slower datastore.",
    whenNotToUse:
      "For write-heavy or rarely-re-read data (the cache churns without ever paying off), or where every read must be perfectly fresh and you can't tolerate any staleness window. A cache adds an invalidation problem — don't take it on for no read benefit.",
    relatedConcepts: ["read-replica", "database", "cqrs", "consistent-hashing", "denormalization"],
    sources: [
      { label: "Redis — Documentation", url: "https://redis.io/docs/latest/" },
      { label: "AWS — Caching strategies (ElastiCache)", url: "https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html" },
      { label: "Cloudflare — What is caching?", url: "https://www.cloudflare.com/learning/cdn/what-is-caching/" },
    ],
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
    whenToUse:
      "As the system of record for anything that must be durable and queryable. Reach for a relational DB by default — its transactions, constraints and joins are exactly what most applications need until proven otherwise.",
    whenNotToUse:
      "Don't stuff large blobs (use an object store), high-throughput event streams (use a log/queue), or pure ephemeral hot data (use a cache) into the primary database. Each has a purpose-built home that keeps the DB lean.",
    relatedConcepts: ["read-replica", "sharding", "cache", "indexing", "cap-theorem", "nosql"],
    sources: [
      { label: "PostgreSQL — Documentation", url: "https://www.postgresql.org/docs/current/" },
      { label: "Martin Kleppmann — Designing Data-Intensive Applications", url: "https://dataintensive.net/" },
      { label: "AWS — Relational vs non-relational databases", url: "https://aws.amazon.com/relational-database/" },
    ],
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
    whenToUse:
      "To decouple producers from consumers in time — absorbing spikes, fanning one event out to many consumers, and smoothing write bursts. Essential for event-driven architectures and reliable async work hand-off.",
    whenNotToUse:
      "When the caller needs an immediate, synchronous answer (use a direct call/RPC), or for tiny systems where a queue is operational overhead you don't yet need. A log (Kafka) and a task queue solve different problems — don't conflate them.",
    relatedConcepts: ["task-queue", "worker-service", "back-pressure", "write-api-async", "cqrs"],
    sources: [
      { label: "Apache Kafka — Documentation (intro)", url: "https://kafka.apache.org/documentation/#introduction" },
      { label: "Confluent — What is a message queue?", url: "https://www.confluent.io/learn/message-queue/" },
      { label: "AWS — Message queues", url: "https://aws.amazon.com/message-queue/" },
    ],
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
    whenToUse:
      "When you need to answer historical or aggregate questions (revenue by region, user cohort trends) that would cripple your transactional database. Any workload that scans millions of rows belongs in a warehouse, not in prod.",
    whenNotToUse:
      "For low-latency, per-request lookups — warehouses are optimised for scan throughput, not single-key speed. Also overkill when your dataset fits comfortably in the transactional DB and queries run fine there.",
    relatedConcepts: ["database", "message-queue", "worker-service", "observability"],
    sources: [
      { label: "Google Cloud — What is a data warehouse?", url: "https://cloud.google.com/learn/what-is-a-data-warehouse" },
      { label: "AWS — Modern data architecture", url: "https://aws.amazon.com/big-data/datalakes-and-analytics/modern-data-architecture/" },
      { label: "Snowflake — Architecture overview", url: "https://docs.snowflake.com/en/user-guide/intro-key-concepts" },
    ],
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
    whenToUse:
      "When reads dominate and are straining the primary — the first, cheapest horizontal scaling move for a database. Also for serving analytics/reporting off a replica so heavy queries don't touch the write primary.",
    whenNotToUse:
      "When the bottleneck is writes (replicas don't help — shard instead), or when every read must reflect the latest write and you can't tolerate replication lag. Route read-your-own-write traffic to the primary.",
    relatedConcepts: ["database", "sharding", "cache", "cqrs", "consistency-models", "failover"],
    sources: [
      { label: "PostgreSQL — Replication & high availability", url: "https://www.postgresql.org/docs/current/high-availability.html" },
      { label: "AWS — RDS read replicas", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html" },
      { label: "Martin Kleppmann — Designing Data-Intensive Applications (Ch. 5)", url: "https://dataintensive.net/" },
    ],
    internal: {
      summary: "The primary streams its write-ahead log (WAL) to replicas, which replay the changes asynchronously to stay in sync.",
      nodes: [
        { id: "write", label: "Write to Primary", sublabel: "INSERT / UPDATE", kind: "start", detail: "All writes go to the single primary. The primary writes the change to its write-ahead log (WAL) before confirming to the client — this makes it durable and replayable." },
        { id: "wal", label: "WAL Record", sublabel: "write-ahead log", kind: "step", detail: "The change is appended to the WAL — a sequential, append-only log of every mutation. This is the source of truth for replication: replicas don't re-execute SQL, they replay WAL entries." },
        { id: "stream", label: "Stream to Replicas", sublabel: "async shipping", kind: "step", detail: "The primary continuously ships WAL records to each replica over a persistent connection. This is asynchronous by default — the primary doesn't wait for replicas to confirm before committing." },
        { id: "replay", label: "Replay on Replica", sublabel: "apply changes", kind: "step", detail: "Each replica applies WAL records in order, arriving at the same state as the primary — just slightly behind. The gap is replication lag, typically milliseconds to seconds." },
        { id: "lag", label: "Replication Lag", sublabel: "ms to seconds", kind: "decision", detail: "The lag between primary commit and replica visibility. Under normal load it's milliseconds; under write spikes or replica resource pressure it can grow to seconds — this is when read-your-writes becomes inconsistent." },
        { id: "read", label: "Read from Replica", sublabel: "query offloaded", kind: "terminal", detail: "Read traffic is routed to replicas, offloading the primary. The tradeoff: reads may reflect a slightly older state. For most use cases (product pages, dashboards) this is fine." },
      ],
      edges: [
        { source: "write", target: "wal" },
        { source: "wal", target: "stream" },
        { source: "stream", target: "replay" },
        { source: "replay", target: "lag" },
        { source: "lag", target: "read" },
      ],
    },
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
    whenToUse:
      "Only when a single primary genuinely can't hold the data or absorb the write throughput, and you've already exhausted replicas, caching and vertical scaling. The last resort for write scale.",
    whenNotToUse:
      "Before you've truly outgrown one machine — sharding breaks cross-shard joins and transactions and makes everything harder. If reads are the problem, replicas/caching are far cheaper. A bad shard key is a future migration nightmare.",
    relatedConcepts: ["database", "read-replica", "consistent-hashing", "federation", "cap-theorem"],
    sources: [
      { label: "AWS — What is database sharding?", url: "https://aws.amazon.com/what-is/database-sharding/" },
      { label: "MongoDB — Sharding", url: "https://www.mongodb.com/docs/manual/sharding/" },
      { label: "Vitess — Sharding (horizontal scaling of MySQL)", url: "https://vitess.io/docs/concepts/shard/" },
    ],
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
    whenToUse:
      "At any public API boundary — especially authentication endpoints, paid-tier quotas, and anywhere a retry storm or scraper can generate unbounded load. Also useful internally between services to prevent cascade overload.",
    whenNotToUse:
      "On internal paths where callers are trusted and backpressure is already handled by the queue or circuit breaker. Over-limiting internal traffic adds latency and false rejections that hurt more than they help.",
    relatedConcepts: ["api-gateway", "reverse-proxy", "back-pressure", "circuit-breaker", "load-balancer"],
    sources: [
      { label: "Cloudflare — What is rate limiting?", url: "https://www.cloudflare.com/learning/bots/what-is-rate-limiting/" },
      { label: "Stripe — Rate limiting strategies", url: "https://stripe.com/blog/rate-limiters" },
      { label: "RFC 6585 — 429 Too Many Requests", url: "https://datatracker.ietf.org/doc/html/rfc6585#section-4" },
    ],
    internal: {
      summary: "A token bucket fills at a steady rate; each request consumes a token. When the bucket empties, excess requests are rejected until tokens refill.",
      nodes: [
        { id: "req", label: "Incoming Request", kind: "start", detail: "A request arrives at the rate-limited endpoint. Before it touches any business logic, the limiter must decide: allow or reject." },
        { id: "bucket", label: "Token Bucket", sublabel: "capacity: N tokens", kind: "step", detail: "The bucket holds up to N tokens and refills at a fixed rate (e.g. 100/sec). Each token represents permission to process one request." },
        { id: "check", label: "Token available?", kind: "decision", detail: "The limiter atomically checks and decrements. In a distributed setup this is a Redis EVAL (Lua script) or MULTI/EXEC to avoid race conditions between nodes." },
        { id: "allow", label: "Allow", sublabel: "consume 1 token", kind: "terminal", detail: "A token is consumed and the request proceeds. The remaining count is often returned in response headers (X-RateLimit-Remaining) so clients can self-throttle." },
        { id: "reject", label: "429 Too Many Requests", sublabel: "Retry-After header", kind: "terminal", detail: "No tokens left — the server returns 429 with a Retry-After header. Well-behaved clients back off; aggressive ones hit the limit again and stay rejected." },
        { id: "refill", label: "Refill Timer", sublabel: "steady drip", kind: "step", detail: "Tokens are added at a constant rate regardless of consumption. This allows short bursts (up to bucket capacity) while enforcing a sustained average rate." },
      ],
      edges: [
        { source: "req", target: "bucket" },
        { source: "bucket", target: "check" },
        { source: "check", target: "allow", label: "yes" },
        { source: "check", target: "reject", label: "no" },
        { source: "refill", target: "bucket", label: "add tokens" },
      ],
    },
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
    whenToUse:
      "Around any synchronous call to a dependency that can fail or slow down — especially in a mesh of services where a single slow node could otherwise tie up every caller's threads and cascade into a system-wide stall.",
    whenNotToUse:
      "For purely local, in-process calls that can't fail remotely, or for async/queued work where there's no caller blocking on a response. A breaker also needs a sensible fallback — tripping it with nothing to fall back to just fails faster.",
    relatedConcepts: ["retry", "rpc", "services", "failover", "back-pressure"],
    sources: [
      { label: "Martin Fowler — CircuitBreaker", url: "https://martinfowler.com/bliki/CircuitBreaker.html" },
      { label: "Google SRE — Addressing Cascading Failures", url: "https://sre.google/sre-book/addressing-cascading-failures/" },
      { label: "Microsoft Azure — Circuit Breaker pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker" },
    ],
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

  // ───────────────────────────────────────── Web Server
  {
    id: "web-server",
    name: "Web Server",
    category: "traffic",
    icon: "Server",
    tagline: "The single entry point that routes requests to specialized API tiers.",
    mentalModel: "A receptionist in an office building — takes your request and directs you to the right desk (read requests to the read team, writes to the write team, async jobs to the queue).",
    misconception: {
      myth: "A web server is where you serve static files.",
      reality: "In modern architectures, the web server is a routing layer — it forwards dynamic requests to backend APIs, not a file server. Static files go on a CDN.",
    },
    consequenceIfRemoved: "Every client has to know about and route to different API endpoints (reads here, writes there, async there). The system becomes fragmented and brittle.",
    definition:
      "A front-facing server that receives all requests from the load balancer and routes them to the appropriate backend API tier — read APIs, write APIs, or async work queues.",
    whyItExists:
      "Different request types have different optimisation needs. The web server unifies the client-facing interface while routing each request to the tier optimised for it.",
    problemSolved:
      "Provides a single, stable entry point that abstracts the backend's specialised API tiers, so clients don't need to know about the read/write/async split.",
    advantages: [
      "Clients see one unified API surface",
      "Can route by request type (GET → read API, POST → write API, async tasks → queue)",
      "Failure isolation — if the read API is slow, write requests still flow",
      "Can apply cross-cutting concerns (auth, logging, rate limiting) once before routing",
    ],
    disadvantages: [
      "Another hop in the request path adds latency",
      "If the web server is down, nothing reaches the backends",
      "Complex routing logic can become a bottleneck",
    ],
    alternatives: [
      { name: "API Gateway", note: "Move routing logic into a gateway with more sophisticated rule matching" },
      { name: "Service mesh", note: "Let sidecar proxies handle routing at the infrastructure level" },
      { name: "Client-side routing", note: "Let clients decide which API to call — harder to maintain and scales poorly" },
    ],
    realWorld: [
      "Nginx in front of multiple backend services",
      "HAProxy directing requests based on URL patterns",
      "A simple Node.js/Go reverse proxy routing /api/read → read tier, /api/write → write tier",
    ],
    interviewQuestions: [
      "How do you route different request types to different backend tiers?",
      "What happens if the web server goes down?",
      "How do you handle authentication that needs to run before routing?",
    ],
    scaling:
      "Horizontal: put the web server behind a load balancer to handle more concurrent connections. It's stateless, so each instance is identical. The load balancer scales it; the web server scales the backends through routing.",
    whenToUse:
      "When you want a single stable entry point that abstracts the backend's specialised API tiers — especially in CQRS architectures where reads, writes, and async work go to different services.",
    whenNotToUse:
      "When an API gateway already handles routing, auth, and rate limiting — adding a separate web-server layer becomes a redundant hop. At small scale, a single API process that handles everything is simpler.",
    relatedConcepts: ["load-balancer", "api-gateway", "reverse-proxy", "read-api", "write-api"],
    sources: [
      { label: "NGINX — What is a web server?", url: "https://www.nginx.com/resources/glossary/web-server/" },
      { label: "Cloudflare — Web server", url: "https://www.cloudflare.com/learning/ddos/glossary/web-server/" },
      { label: "MDN — What is a web server?", url: "https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_web_server" },
    ],
  },

  // ───────────────────────────────────────── Reverse Proxy
  {
    id: "reverse-proxy",
    name: "Reverse Proxy",
    category: "edge",
    icon: "Shuffle",
    tagline: "A shield and switchboard in front of servers.",
    mentalModel: "The receptionist at a corporate front desk — visitors only ever talk to the desk, which checks them in, hands out badges, and routes them to the right office. They never see the building's interior.",
    misconception: {
      myth: "A reverse proxy and a load balancer are different products you buy separately.",
      reality: "They're roles, not products. The same software — Nginx, HAProxy, Envoy — does both. A reverse proxy fronts and shields backends; a load balancer spreads traffic across a pool. Most deployments do both at once.",
    },
    consequenceIfRemoved: "Every backend is exposed directly to the internet and must terminate its own TLS, do its own compression, and be addressable by clients. Topology leaks to the outside world, and edge concerns get duplicated into every service.",
    definition:
      "A server that sits in front of one or more backends, accepting client connections on their behalf and forwarding requests — terminating TLS, caching, compressing, and routing by path or host along the way.",
    whyItExists:
      "Edge concerns — TLS handshakes, gzip/Brotli compression, static caching, request routing — are identical across every backend and have nothing to do with business logic. Centralising them in one hardened tier keeps app servers simple and hides the internal topology behind a single public address.",
    problemSolved:
      "Gives you one controllable choke point for TLS termination, compression, caching, header rewriting and routing — and shields backends, which can now speak plaintext on a private network and never face the public internet directly.",
    advantages: [
      "Terminates TLS once at the edge, so backends speak cheap plaintext on a trusted network instead of each paying the handshake cost",
      "Hides backend topology behind one address — you can move, rename or rescale servers without clients noticing",
      "Offloads static caching and compression from app servers, cutting both their CPU load and response bytes",
      "A natural place to enforce cross-cutting policy: rate limits, IP allow-lists, request-size caps, header sanitisation",
    ],
    disadvantages: [
      "Adds a network hop and a component that must itself be made highly available — it's now in the critical path of every request",
      "Becomes a single point of failure and a potential bottleneck if under-provisioned or not itself load-balanced",
      "Routing/TLS misconfiguration is high-blast-radius: one bad rule can break or expose every backend behind it",
      "Terminating TLS here means traffic to backends is plaintext — fine on a private network, a risk on a shared one",
    ],
    whenToUse:
      "Almost always, the moment you have more than one backend or want TLS, caching and routing handled outside app code. Essential for hiding internal services and presenting a single public entry point.",
    whenNotToUse:
      "A single small service with TLS handled by the platform (e.g. a managed PaaS or serverless function) may not need its own proxy — the platform already is one. Don't add a self-managed proxy tier you then have to keep highly available for no real gain.",
    alternatives: [
      { name: "API Gateway", note: "A reverse proxy plus API-aware features (auth, quotas, request shaping)" },
      { name: "Load balancer", note: "Same software, different emphasis — spreading load over a pool" },
      { name: "Service mesh", note: "Pushes proxying into per-pod sidecars for east-west traffic" },
    ],
    realWorld: [
      "Nginx, HAProxy and Envoy deployed as the edge tier in front of app fleets",
      "Cloudflare acting as a global reverse proxy, terminating TLS and caching at 300+ POPs",
      "TLS terminated at the proxy, plaintext HTTP/2 to internal services over a private network",
    ],
    interviewQuestions: [
      "Forward proxy vs reverse proxy — who is each one hiding, the client or the server?",
      "Reverse proxy vs load balancer vs API gateway — where do the roles overlap?",
      "Where would you terminate TLS, and what's the security tradeoff of terminating it at the edge?",
    ],
    scaling:
      "Reverse proxies are stateless, so they scale horizontally trivially — put several behind a load balancer (or anycast) and they share the load. The same Nginx/Envoy binary often does the load balancing too; the labels describe roles, not separate machines.",
    relatedConcepts: ["load-balancer", "api-gateway", "cdn", "http", "rate-limiting"],
    sources: [
      { label: "NGINX — What Is a Reverse Proxy Server?", url: "https://www.nginx.com/resources/glossary/reverse-proxy-server/" },
      { label: "Cloudflare — Reverse proxy vs. forward proxy", url: "https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/" },
      { label: "Envoy Proxy — Architecture overview", url: "https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/arch_overview" },
    ],
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
    whenToUse:
      "When you run many containerised services across multiple machines and need automated scheduling, scaling, self-healing, and service discovery. The break-even point is typically 5–10+ services where manual orchestration becomes untenable.",
    whenNotToUse:
      "For a monolith, a few services, or a solo developer — the operational tax (networking, RBAC, YAML, upgrade cycles) outweighs the benefit. Consider managed PaaS (Vercel, Fly, Railway) or simpler orchestrators (ECS, Nomad) first.",
    relatedConcepts: ["services", "load-balancer", "observability", "federation", "worker-service"],
    sources: [
      { label: "Kubernetes — Concepts overview", url: "https://kubernetes.io/docs/concepts/overview/" },
      { label: "Google Cloud — Kubernetes best practices", url: "https://cloud.google.com/kubernetes-engine/docs/best-practices" },
      { label: "CNCF — Kubernetes documentation", url: "https://kubernetes.io/docs/home/" },
    ],
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
    whenToUse:
      "From day one in any system you intend to operate — and non-negotiably once you have multiple services, where failures hide in the gaps between them. Define SLIs/SLOs and instrument before you need to debug, not during the incident.",
    whenNotToUse:
      "There's no real 'don't' — but resist over-instrumenting: unbounded high-cardinality metrics and 100% trace retention get expensive fast, and noisy alerts that don't map to user pain cause fatigue and get ignored.",
    relatedConcepts: ["services", "kubernetes", "circuit-breaker", "load-balancer"],
    sources: [
      { label: "Google SRE — Monitoring Distributed Systems", url: "https://sre.google/sre-book/monitoring-distributed-systems/" },
      { label: "OpenTelemetry — Observability primer", url: "https://opentelemetry.io/docs/concepts/observability-primer/" },
      { label: "Google SRE — Service Level Objectives", url: "https://sre.google/sre-book/service-level-objectives/" },
    ],
  },

  // ───────────────────────────────────────── CQRS
  {
    id: "cqrs",
    name: "CQRS",
    category: "scalability",
    icon: "GitFork",
    tagline: "Separate the read model from the write model.",
    mentalModel: "A restaurant kitchen vs. its menu. The kitchen (write side) is organised for cooking — raw ingredients, strict process, integrity. The menu (read side) is organised for the diner — denormalised, pretty, instant to scan. Forcing one layout to serve both makes both worse.",
    misconception: {
      myth: "CQRS means you need two databases and event sourcing.",
      reality: "CQRS is just separating the read model from the write model — it can be two classes against one database. Two datastores and event sourcing are an optional, heavier extreme of the same idea, not a requirement.",
    },
    consequenceIfRemoved: "Reads and writes share one schema, so every read query is shaped by write-side normalisation. Complex read screens need expensive multi-table joins, and you can't scale or denormalise the read path without risking write integrity.",
    definition:
      "Command Query Responsibility Segregation splits the write model (commands that change state) from the read model (queries that return it), so each can use a schema, store and scaling strategy tuned for its own job.",
    whyItExists:
      "Reads and writes pull schemas in opposite directions: writes want normalised, constraint-enforced tables for integrity; reads want flat, denormalised, pre-joined shapes for speed. In one model every change is a compromise. CQRS removes the compromise by letting each side evolve on its own.",
    problemSolved:
      "Lets the read and write sides scale, deploy and model data independently — read models can be denormalised and replicated for query speed without weakening the authoritative, consistent write side.",
    advantages: [
      "Read and write paths scale independently — and read volume is often 10–100× writes, so this is exactly where you want the freedom",
      "Read models are pre-shaped to query patterns, turning expensive runtime joins into cheap key lookups",
      "Write side stays small, normalised and easy to reason about for correctness and auditing",
      "Composes naturally with event sourcing and materialized views when you do need the heavier version",
    ],
    disadvantages: [
      "The read model lags the write model — you inherit eventual consistency and must design the UI to tolerate 'read-your-own-write' gaps",
      "More moving parts: a sync mechanism (events, CDC, or replication) plus two models to keep correct and deploy",
      "Genuinely overkill for simple CRUD — the synchronisation cost buys nothing if reads and writes have the same shape",
      "Debugging spans two models; a stale read can mean a projection bug, not a write bug",
    ],
    whenToUse:
      "When the read and write workloads diverge sharply — very high read:write ratios, complex read screens that need different shapes than the write schema, or a write side that demands strict auditing while reads can tolerate slight staleness.",
    whenNotToUse:
      "For straightforward CRUD where reads and writes share the same shape, or when your team can't absorb eventual consistency. Reach for read replicas or materialized views first — they scale reads without a second model.",
    alternatives: [
      { name: "Single-model CRUD", note: "Simplest; correct default for the vast majority of apps" },
      { name: "Read replicas", note: "Scale reads with the same schema — no second model to sync" },
      { name: "Materialized views", note: "Precomputed read shapes maintained inside the database" },
    ],
    realWorld: [
      "Event-sourced systems projecting events into purpose-built read models",
      "High-read dashboards fed by a denormalised projection of a write-side stream",
      "Order systems separating placement (command) from order-history queries",
    ],
    interviewQuestions: [
      "When is CQRS worth its synchronisation cost — and when is it cargo-culting?",
      "How do you keep the read and write models in sync, and what consistency do you get?",
      "How does CQRS relate to event sourcing — and why are they often confused?",
    ],
    scaling:
      "CQRS lets you scale the read side — often 10–100× the write volume — independently: replicate and denormalise read models freely while a single authoritative write model preserves consistency. The sync pipeline (events or CDC) becomes the thing you must keep healthy.",
    relatedConcepts: ["read-replica", "denormalization", "message-queue", "consistency-models", "database"],
    sources: [
      { label: "Martin Fowler — CQRS", url: "https://martinfowler.com/bliki/CQRS.html" },
      { label: "Microsoft Azure — CQRS pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs" },
      { label: "Microsoft Azure — Materialized View pattern", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view" },
    ],
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
    whenToUse:
      "For any communication that needs reliable, ordered delivery — HTTP, database wire protocols, SSH, SMTP. TCP is the default transport for almost everything on the internet because correctness matters more than speed for most applications.",
    whenNotToUse:
      "When latency matters more than perfect delivery — real-time video/voice (dropped frames are better than delayed ones), DNS lookups (one small packet, easy to retry), and game state updates where the latest value overwrites the old. Use UDP or QUIC instead.",
    relatedConcepts: ["udp", "http", "dns", "load-balancer", "back-pressure"],
    sources: [
      { label: "RFC 9293 — TCP specification", url: "https://datatracker.ietf.org/doc/html/rfc9293" },
      { label: "Cloudflare — What is TCP?", url: "https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/" },
      { label: "Beej's Guide to Network Programming", url: "https://beej.us/guide/bgnet/" },
    ],
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
      failures: [
        {
          at: "syn",
          label: "SYN flood attack",
          what: "An attacker sends a flood of SYN packets without completing the handshake, filling the server's half-open connection table until it can't accept legitimate connections.",
          recovery: "SYN cookies let the server respond to SYNs statelessly — it encodes the connection info in the SYN-ACK sequence number and only allocates state when the final ACK arrives with a valid cookie.",
        },
        {
          at: "est",
          label: "Connection reset (RST)",
          what: "One side crashes or a middlebox drops the connection mid-stream. The other side receives a RST packet (or times out) and loses any in-flight data.",
          recovery: "Application-level retries with idempotency keys. TCP guarantees delivery within a connection, but connection death requires the application to reconnect and replay — which is only safe if the operation is idempotent.",
        },
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
    mentalModel: "Shouting across a noisy room. You say it once and move on — no waiting for confirmation. Most of it gets through; if a word is lost, it's already too late to matter, so you don't stop to repeat it.",
    misconception: {
      myth: "UDP is unreliable, so serious systems avoid it.",
      reality: "UDP is the foundation of some of the most demanding systems on the internet — DNS, video calls, and (via QUIC) HTTP/3. It isn't 'worse' than TCP; it hands reliability to the application so latency-sensitive workloads only pay for the guarantees they actually need.",
    },
    consequenceIfRemoved: "Latency-sensitive workloads would be forced onto TCP, where a single lost packet stalls the whole stream (head-of-line blocking) while it's retransmitted — fatal for live audio, video and games where a fresh packet matters more than a recovered stale one.",
    definition:
      "UDP is a connectionless transport that sends independent datagrams with no handshake, ordering, retransmission or congestion control — just a tiny header over best-effort IP, trading guarantees for minimal overhead and latency.",
    whyItExists:
      "For live audio, video and games, a retransmitted stale packet is useless — by the time it arrives, the moment has passed. TCP's insistence on in-order, guaranteed delivery actively hurts these workloads. UDP gets out of the way and lets the application decide what's worth recovering.",
    problemSolved:
      "Removes the latency and per-connection overhead of reliability for workloads that can tolerate loss — or that implement exactly the reliability they need at the application layer (as QUIC does).",
    advantages: [
      "Lowest possible latency — no handshake round-trip and no waiting on ACKs before sending the next datagram",
      "No head-of-line blocking: one lost datagram never stalls the others, which is decisive for real-time media",
      "Stateless on the server with a tiny 8-byte header, so a server can fan out to huge numbers of clients cheaply",
      "Supports broadcast and multicast — one send reaching many receivers",
    ],
    disadvantages: [
      "No delivery, ordering, or duplicate protection — the application must detect and handle loss and reordering itself",
      "No built-in congestion control, so naïve UDP can flood a network and harm other traffic (you must add it, as QUIC does)",
      "Frequently throttled, rate-limited or blocked by firewalls and NATs that assume TCP",
      "Easier to spoof and amplify — a common vector for reflection DDoS attacks",
    ],
    whenToUse:
      "Real-time media (VoIP, video conferencing, live streaming), online games, and small idempotent request/response like DNS — anywhere a fresh-but-lossy packet beats a guaranteed-but-late one, or where you'll build custom reliability on top (QUIC).",
    whenNotToUse:
      "Anything that needs every byte in order — file transfer, database connections, web pages, payments. Reach for TCP (or QUIC) rather than reinventing retransmission, ordering and congestion control yourself.",
    alternatives: [
      { name: "TCP", note: "Reliability and ordering when every byte must arrive" },
      { name: "QUIC", note: "Reliable, multiplexed streams built on UDP — no HOL blocking" },
      { name: "App-level ACKs", note: "Add back exactly the reliability you need, nothing more" },
    ],
    realWorld: [
      "VoIP, video conferencing and live streaming (often via RTP/WebRTC)",
      "Online multiplayer games sending frequent positional updates",
      "DNS queries — small, idempotent, cheaply retried; and QUIC/HTTP-3 underneath",
    ],
    interviewQuestions: [
      "UDP vs TCP — what's the core tradeoff, and who pays for reliability in each?",
      "Why does DNS use UDP by default, and when does it fall back to TCP?",
      "How do real-time games and QUIC cope with packet loss without TCP?",
    ],
    scaling:
      "Stateless datagrams scale trivially — no per-connection state means one server can serve enormous client counts — but you must add congestion control yourself to be a good network citizen, and layer application-level reliability only where it's truly needed.",
    relatedConcepts: ["tcp", "dns", "http", "back-pressure"],
    sources: [
      { label: "RFC 768 — User Datagram Protocol", url: "https://www.rfc-editor.org/rfc/rfc768" },
      { label: "Cloudflare — What is UDP?", url: "https://www.cloudflare.com/learning/ddos/glossary/user-datagram-protocol-udp/" },
      { label: "RFC 9000 — QUIC (reliability over UDP)", url: "https://www.rfc-editor.org/rfc/rfc9000" },
    ],
  },

  // ───────────────────────────────────────── HTTP
  {
    id: "http",
    name: "HTTP",
    category: "networking",
    icon: "ArrowLeftRight",
    tagline: "The request/response language of the web.",
    mentalModel: "A formal letter exchange. Each request is a self-contained envelope — a verb (what to do), an address (the URL), headers (metadata), and a body. The server replies with a status code and its own letter. Neither side remembers the last exchange unless you enclose an ID (a cookie or token).",
    misconception: {
      myth: "HTTP is slow and text-based, so it's a poor fit for high-performance systems.",
      reality: "That describes HTTP/1.1. HTTP/2 multiplexes many streams over one binary connection, and HTTP/3 runs over QUIC (UDP) to kill head-of-line blocking. Modern HTTP carries gRPC, video and real-time traffic at scale.",
    },
    consequenceIfRemoved: "There would be no shared contract for the web — every client and server pair would invent its own request format, and the entire ecosystem of caches, proxies, CDNs and browsers (all of which understand HTTP semantics) would have nothing to reason about.",
    definition:
      "HTTP is a stateless request/response protocol — traditionally over TCP, with HTTP/3 over QUIC — where verbs (GET, POST, PUT, PATCH, DELETE) act on resources identified by URLs, and status codes plus headers carry the semantics of each exchange.",
    whyItExists:
      "Clients and servers built by different people need one shared, extensible contract for requesting and manipulating resources. HTTP is that lingua franca — and because every proxy, cache and CDN understands it, an enormous infrastructure can act on requests without knowing the application.",
    problemSolved:
      "Standardises how the web exchanges documents and data, with caching, status codes, content negotiation and a uniform method vocabulary built in — so intermediaries can cache, route and secure traffic generically.",
    advantages: [
      "Universal and intermediary-friendly: caches, proxies and CDNs all understand its verbs and headers, so they can act on traffic without app knowledge",
      "Safe (GET/HEAD) and idempotent (GET/PUT/DELETE) method semantics let infrastructure retry and cache correctly",
      "Cache-Control, ETags and conditional requests enable end-to-end caching that keeps most reads off the origin",
      "Extensible by design — new headers, methods and versions (H2, H3) layer in without breaking older clients",
    ],
    disadvantages: [
      "Statelessness means session state must be carried explicitly in every request via cookies or tokens",
      "Per-request header overhead is real on HTTP/1.1 (mitigated by HPACK/QPACK header compression in H2/H3)",
      "Classic request/response shape fits poorly for server-initiated push and real-time streams (hence WebSockets / SSE)",
      "Easy to misuse the semantics — non-idempotent GETs or uncacheable responses quietly break caches and retries",
    ],
    whenToUse:
      "The default for virtually all client-server and service-to-service communication on the web — REST APIs, gRPC (over H2), browser traffic. If a request maps to 'do something to a resource and get a response', HTTP fits.",
    whenNotToUse:
      "For low-latency, server-pushed, bidirectional streams (live collaboration, trading tickers), reach for WebSockets or SSE. For internal high-throughput RPC you may prefer gRPC's binary contract — though it still rides on HTTP/2.",
    alternatives: [
      { name: "WebSockets", note: "Full-duplex, persistent connection for real-time, bidirectional data" },
      { name: "gRPC", note: "Typed binary RPC layered on HTTP/2" },
      { name: "Server-Sent Events", note: "One-way server→client streaming over plain HTTP" },
    ],
    realWorld: [
      "Every REST and GraphQL API on the public internet",
      "HTTP/2 multiplexing many concurrent streams over one TCP connection",
      "Cache-Control and ETags driving CDN and browser caching behaviour",
    ],
    interviewQuestions: [
      "Safe vs idempotent methods — which verbs are which, and why does it matter for retries?",
      "What exactly makes an HTTP response cacheable, and who honors those headers?",
      "PUT vs PATCH vs POST — semantics and idempotency of each?",
    ],
    scaling:
      "HTTP's statelessness is precisely what makes the app tier horizontally scalable — any server can answer any request. Lean on cache headers, CDNs and HTTP/2 multiplexing so most requests are served at the edge and never reach your origin.",
    relatedConcepts: ["rest", "tcp", "cdn", "cache", "reverse-proxy", "rpc"],
    sources: [
      { label: "MDN — HTTP overview", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview" },
      { label: "RFC 9110 — HTTP Semantics", url: "https://www.rfc-editor.org/rfc/rfc9110" },
      { label: "Cloudflare — HTTP/1 vs HTTP/2 vs HTTP/3", url: "https://www.cloudflare.com/learning/performance/http2-vs-http1.1/" },
    ],
    internal: {
      summary: "An HTTP request travels from the client through DNS, TCP, optional TLS, the request/response exchange, and potentially a cache — before the browser renders the result.",
      nodes: [
        { id: "client", label: "Browser / Client", kind: "start", detail: "The user clicks a link or an API client calls fetch(). Before any HTTP bytes flow, the client needs an IP address — so the journey starts with DNS." },
        { id: "dns", label: "DNS Lookup", sublabel: "hostname → IP", kind: "step", detail: "The client resolves the hostname to an IP. This is cached aggressively (browser cache, OS cache, resolver cache), so it's usually instant after the first hit." },
        { id: "tcp", label: "TCP Handshake", sublabel: "SYN → SYN-ACK → ACK", kind: "step", detail: "A three-way handshake establishes a reliable connection. This adds one round-trip of latency — which is why connection reuse (keep-alive) matters." },
        { id: "tls", label: "TLS Handshake", sublabel: "negotiate cipher + certs", kind: "step", detail: "For HTTPS, another 1–2 round-trips negotiate encryption. TLS 1.3 cuts this to one round-trip; 0-RTT resumption can eliminate it entirely on repeat visits." },
        { id: "send", label: "Send Request", sublabel: "method + headers + body", kind: "step", detail: "The client sends the HTTP request: method (GET/POST), headers (Host, Accept, Auth), and optionally a body. The server now has everything it needs." },
        { id: "process", label: "Server Processes", sublabel: "route → handler → DB", kind: "step", detail: "The server routes the request to a handler, runs business logic, queries the database, and assembles a response. This is where your application code lives." },
        { id: "response", label: "Response", sublabel: "status + headers + body", kind: "terminal", detail: "The server returns a status code (200, 404, 500), cache headers (Cache-Control, ETag), and the response body. The client uses the status to decide what to show." },
      ],
      edges: [
        { source: "client", target: "dns" },
        { source: "dns", target: "tcp" },
        { source: "tcp", target: "tls" },
        { source: "tls", target: "send" },
        { source: "send", target: "process" },
        { source: "process", target: "response" },
      ],
      failures: [
        {
          at: "tls",
          label: "Certificate expired",
          what: "An expired TLS certificate causes browsers to reject the connection entirely with a scary, unbypassable warning. The site appears completely down to users even though the servers are healthy.",
          recovery: "Automate certificate renewal with ACME/Let's Encrypt and monitor expiry dates. A cert that expires at 3am on a Saturday is a preventable outage.",
        },
        {
          at: "process",
          label: "5xx server error",
          what: "The server fails during processing — an unhandled exception, a database timeout, or an out-of-memory crash. The client receives a 500/502/503 status code.",
          recovery: "Retry idempotent methods (GET, PUT, DELETE) with backoff. For non-idempotent methods (POST), retry only if the client sent an idempotency key — otherwise the operation may double-apply.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── REST
  {
    id: "rest",
    name: "REST",
    category: "networking",
    icon: "Route",
    tagline: "Resources, verbs, and statelessness.",
    mentalModel: "A well-organised library. Everything is a thing (a resource) with a stable address (the URL), and you act on it with a small, fixed set of verbs — fetch it, add one, replace it, remove it. Once you know how to check out one book, you know how to check out every book.",
    misconception: {
      myth: "Any JSON-over-HTTP API is RESTful.",
      reality: "Most 'REST' APIs are really HTTP RPC. True REST (per Fielding) requires resource modelling, correct verb/status semantics, statelessness and ideally HATEOAS. The industry uses 'REST' loosely to mean 'resource-ish JSON over HTTP' — useful, but not the formal definition.",
    },
    consequenceIfRemoved: "Without a shared convention, every endpoint becomes a bespoke contract a client must learn individually — no predictable verbs, no free HTTP caching, and tight coupling between client and server internals.",
    definition:
      "REST is an architectural style for APIs that models everything as resources addressed by URIs and manipulated with standard HTTP verbs, where each request is stateless — carrying all the context the server needs to process it.",
    whyItExists:
      "APIs needed a uniform, predictable convention so clients could consume them without learning a bespoke contract per endpoint. Rather than invent a new protocol, REST leans on HTTP's existing semantics — verbs, status codes, caching — so the whole web infrastructure already understands it.",
    problemSolved:
      "Gives teams a consistent, cacheable, evolvable way to expose data over HTTP without coupling clients to server internals — learn the conventions once and every endpoint behaves predictably.",
    advantages: [
      "Uniform interface: because every resource follows the same verb conventions, a client that learns one endpoint can predict the rest",
      "GET responses are cacheable by the entire HTTP stack (browser, CDN, proxy) when you set cache headers correctly — caching the network already understands",
      "Statelessness lets any server answer any request, so the API tier scales horizontally with no session affinity",
      "Loose coupling: clients depend on the resource contract, not on how the server stores or computes the data",
    ],
    disadvantages: [
      "Over- and under-fetching: a fixed resource shape often returns more than a screen needs, or too little — forcing extra calls",
      "Related data means many round trips (the classic N+1 'fetch a list, then fetch each item'), painful on high-latency links",
      "No strict, machine-checked contract by default — drift between client and server is caught at runtime unless you add OpenAPI",
      "Mapping rich actions (\"refund this\", \"retry that\") onto CRUD verbs is often awkward and leads to RPC-in-disguise endpoints",
    ],
    whenToUse:
      "Public and partner APIs, CRUD-shaped resources, and anything that benefits from HTTP caching and broad client compatibility. The safe default when you want maximum interoperability and a low barrier for consumers.",
    whenNotToUse:
      "When clients need to shape exactly what they fetch (reach for GraphQL), for chatty internal service-to-service calls where a typed binary contract matters (gRPC), or for action-heavy domains that fight the resource/verb model.",
    alternatives: [
      { name: "GraphQL", note: "Client specifies exactly the fields it needs in one round trip" },
      { name: "gRPC", note: "Typed, binary, action-oriented — great for internal east-west traffic" },
      { name: "RPC", note: "Call remote actions directly when the domain is verbs, not nouns" },
    ],
    realWorld: [
      "Stripe, GitHub and Twilio public APIs (resource URLs + verbs + JSON)",
      "CRUD over HTTP in virtually every web and mobile backend",
      "OpenAPI/Swagger specs adding a machine-checked contract on top",
    ],
    interviewQuestions: [
      "REST vs RPC vs GraphQL — what does each optimise for, and when would you pick each?",
      "What actually makes an API RESTful — and why are most 'REST' APIs really HTTP RPC?",
      "How do you version a REST API without breaking existing clients?",
    ],
    scaling:
      "Statelessness lets any server answer any request, so REST APIs scale horizontally with ease. Pair with HTTP caching, pagination and conditional requests (ETags) to absorb read-heavy traffic before it reaches your origin.",
    relatedConcepts: ["http", "rpc", "api-gateway", "cache", "client"],
    sources: [
      { label: "Roy Fielding — Architectural Styles (REST, Ch. 5)", url: "https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm" },
      { label: "MDN — REST", url: "https://developer.mozilla.org/en-US/docs/Glossary/REST" },
      { label: "Microsoft — REST API design best practices", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design" },
    ],
  },

  // ───────────────────────────────────────── RPC
  {
    id: "rpc",
    name: "RPC",
    category: "networking",
    icon: "Webhook",
    tagline: "Call a remote function like a local one.",
    mentalModel: "A walkie-talkie with a shared codebook. You both agreed in advance on exactly what messages mean (the schema), so you can bark a short command and get a precise reply — fast and unambiguous, but only because you pre-shared the codebook.",
    misconception: {
      myth: "Because the call looks like a local function, you can treat it like one.",
      reality: "That's RPC's most dangerous feature. A local call can't take 2 seconds, vanish, or half-succeed — a remote one can. The syntactic sugar hides latency, partial failure and retries, so RPC calls must always be wrapped in timeouts, retries with backoff and circuit breakers.",
    },
    consequenceIfRemoved: "Service-to-service communication falls back to hand-rolled HTTP+JSON with no shared types or codegen — more boilerplate, looser contracts, larger payloads, and drift between caller and callee caught only at runtime.",
    definition:
      "Remote Procedure Call makes invoking a remote service look like a local function call — arguments are serialized (marshalled), sent over the network, executed remotely, and the result returned — usually over a typed, compact, binary contract with generated client/server stubs.",
    whyItExists:
      "Services need to invoke each other's behaviour, not just exchange resources. RPC frames inter-service communication as typed actions with generated stubs, so calling another service feels like calling a library — with a compact wire format tuned for high-volume internal traffic.",
    problemSolved:
      "Provides efficient, strongly-typed, action-oriented service-to-service calls with code generation and compact binary encoding — ideal for the high-frequency east-west traffic inside a microservice mesh.",
    advantages: [
      "Compact binary encoding (e.g. Protobuf) is far smaller and faster to parse than JSON — meaningful at internal call volumes",
      "Strongly-typed schema with codegen catches contract mismatches at build time, not in production",
      "Natural fit for actions/commands (\"charge card\", \"resize image\") that map awkwardly onto REST nouns",
      "Streaming and multiplexing come free via HTTP/2 (gRPC), so many calls share one connection",
    ],
    disadvantages: [
      "Tighter coupling: caller and callee must share and co-evolve the contract, so versioning needs discipline",
      "Less cache- and proxy-friendly than REST — the binary payloads aren't something a generic HTTP cache can reason about",
      "Hides the network: failures, latency and partial success look like ordinary function calls, inviting fragile code",
      "Harder to debug by hand (binary, not curl-able) and less accessible to browser clients without a proxy (gRPC-Web)",
    ],
    whenToUse:
      "Internal, high-throughput service-to-service traffic where you control both ends, want typed contracts, and care about latency and payload size — the backbone of most microservice meshes.",
    whenNotToUse:
      "For public APIs (REST/GraphQL are friendlier to unknown clients and browsers), for cache-heavy read paths, or when loose coupling matters more than raw efficiency. Don't expose RPC directly to the open internet without a gateway.",
    alternatives: [
      { name: "REST", note: "Resource-oriented and cacheable — better for public, browser-facing APIs" },
      { name: "GraphQL", note: "Flexible client-driven queries over one endpoint" },
      { name: "Message queue", note: "Async and decoupled in time when you don't need an immediate reply" },
    ],
    realWorld: [
      "gRPC, Thrift and Twirp powering internal microservice meshes",
      "High-volume east-west traffic where payload size and latency dominate",
      "HTTP/2 multiplexing many concurrent RPCs over a single connection",
    ],
    interviewQuestions: [
      "RPC vs REST — what does each optimise for, and where does the boundary sit?",
      "How does gRPC leverage HTTP/2 for multiplexing and streaming?",
      "What's the danger of making remote calls look local, and how do you guard against it?",
    ],
    scaling:
      "Binary, multiplexed RPC (gRPC over HTTP/2) keeps service-to-service traffic cheap at high volume — but because the calls look local, you must wrap every one in timeouts, bounded retries with backoff and circuit breakers, or a slow dependency cascades into a system-wide stall.",
    relatedConcepts: ["rest", "http", "circuit-breaker", "retry", "message-queue"],
    sources: [
      { label: "gRPC — Core concepts & architecture", url: "https://grpc.io/docs/what-is-grpc/core-concepts/" },
      { label: "Protocol Buffers — Overview", url: "https://protobuf.dev/overview/" },
      { label: "Google SRE — Addressing Cascading Failures", url: "https://sre.google/sre-book/addressing-cascading-failures/" },
    ],
  },

  // ───────────────────────────────────────── Object Store
  {
    id: "object-store",
    name: "Object Store",
    category: "data",
    icon: "Archive",
    tagline: "Infinite shelf space for files, images and blobs.",
    mentalModel: "A warehouse with infinite shelves — you give each item a label, drop it on a shelf, and retrieve it by label. No folders, no hierarchy, just keys and objects.",
    misconception: {
      myth: "Object storage is just a file system in the cloud.",
      reality: "Object stores have no directory hierarchy, no in-place edits, and no file locking. They're optimised for massive parallelism and durability, not POSIX semantics.",
    },
    consequenceIfRemoved: "Large binary data (images, videos, backups, logs) has nowhere to go. You'd stuff blobs into the database, crushing its performance, or lose them entirely.",
    definition:
      "A flat-namespace storage service that stores arbitrary binary objects (files, images, videos, backups) addressed by key, with built-in replication and virtually unlimited capacity.",
    whyItExists:
      "Relational databases are terrible at storing large binary blobs — they bloat tables, slow backups, and waste expensive IOPS. Object stores are purpose-built for this: cheap, durable, and massively parallel.",
    problemSolved:
      "Provides a durable, highly available, virtually unlimited store for binary data, decoupled from the transactional database so neither degrades the other.",
    advantages: [
      "Virtually unlimited capacity — scales to exabytes",
      "11 nines of durability — data is replicated across zones/regions",
      "Cheap per GB compared to block or database storage",
      "CDN-friendly — serve objects directly via signed URLs",
    ],
    disadvantages: [
      "No partial updates — you must rewrite the entire object",
      "Eventually consistent in some configurations (S3 was until 2020)",
      "Higher latency than local disk or block storage for small reads",
      "No query capability — you need the exact key to retrieve",
    ],
    alternatives: [
      { name: "Database BLOBs", note: "Store in the DB — simpler but kills performance at scale" },
      { name: "Block storage", note: "EBS/persistent disk — lower latency but limited capacity and tied to one VM" },
      { name: "File storage (NFS/EFS)", note: "Shared filesystem — POSIX semantics but harder to scale" },
    ],
    realWorld: [
      "AWS S3 storing images, backups and static assets",
      "GCS serving ML training datasets",
      "User-uploaded avatars stored in S3, served via CloudFront CDN",
    ],
    interviewQuestions: [
      "When would you store data in an object store vs. a database?",
      "How do you serve object-store files with low latency to end users?",
      "How do you handle large file uploads reliably?",
    ],
    scaling:
      "Object stores scale horizontally by design — the cloud provider handles partitioning and replication. Your job is key design (avoid hot prefixes) and lifecycle policies (move old objects to cold tiers).",
    whenToUse:
      "For large, immutable-ish binary blobs — images, video, backups, logs, data-lake files, static site assets — especially when fronted by a CDN. The default home for anything too big to belong in a database row.",
    whenNotToUse:
      "For small, frequently-updated, relational or transactional data (use a database), or low-latency random access to tiny records (use a cache/KV store). No in-place edits, no joins, no strong read-after-write everywhere.",
    relatedConcepts: ["cdn", "database", "nosql", "denormalization"],
    sources: [
      { label: "AWS — Amazon S3 (object storage)", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" },
      { label: "Google Cloud — Storage classes", url: "https://cloud.google.com/storage/docs/storage-classes" },
      { label: "Cloudflare — Object storage vs block vs file", url: "https://www.cloudflare.com/learning/cloud/what-is-object-storage/" },
    ],
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
    whenToUse:
      "When your access pattern is known and simple, scale or write throughput exceeds what one relational primary can handle, or the data is naturally document/graph/wide-column shaped. Pick the family (KV, document, wide-column, graph) that matches how you read.",
    whenNotToUse:
      "When you need rich ad-hoc queries, multi-row transactions, or joins across entities — relational databases do these far better. 'NoSQL because it scales' without a known access pattern usually trades flexibility you'll miss for scale you don't yet need.",
    relatedConcepts: ["database", "denormalization", "sharding", "consistent-hashing", "cap-theorem"],
    sources: [
      { label: "AWS — DynamoDB developer guide", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html" },
      { label: "MongoDB — Data modeling introduction", url: "https://www.mongodb.com/docs/manual/core/data-modeling-introduction/" },
      { label: "Martin Kleppmann — DDIA (data models & query languages)", url: "https://dataintensive.net/" },
    ],
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
      failures: [
        {
          at: "q",
          label: "Wrong store for the access pattern",
          what: "Choosing a NoSQL family that doesn't match how you actually query leads to expensive workarounds — ad-hoc queries on a wide-column store, joins in a document store, or writes at scale on a graph database.",
          recovery: "Prototype the real access pattern before committing. Migration between NoSQL families is painful — the data model is shaped for one query pattern and fights a different one.",
        },
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
    mentalModel: "Splitting one overloaded general hospital into specialist clinics — a cardiology centre, a maternity centre, an eye clinic. Each is smaller, independently staffed and tuned for its work. The catch: a patient needing two specialties now has to travel between buildings.",
    misconception: {
      myth: "Federation and sharding are the same scaling technique.",
      reality: "They split along different axes. Federation (functional/vertical) separates by domain — users here, orders there. Sharding (horizontal) splits one dataset by row across machines. Federation divides unrelated load; sharding divides a single oversized table.",
    },
    consequenceIfRemoved: "All domains share one database, so unrelated workloads contend for the same connections, locks and IO. A spike in one feature (say, analytics) degrades every other, and no team can tune or scale their slice in isolation.",
    definition:
      "Federation (functional partitioning) splits a database by feature or domain — separate stores for users, products and orders — so each scales, deploys and tunes independently. (Distinct from identity federation (SAML/OAuth) and GraphQL federation; here it means splitting databases by domain.)",
    whyItExists:
      "A single monolithic database becomes a shared bottleneck: unrelated features compete for the same locks, connections and IO budget. Splitting by function isolates that load and lets each team own and scale its slice without coordinating with everyone else.",
    problemSolved:
      "Reduces read/write load and lock contention on any one database by separating unrelated concerns into independently operable stores.",
    advantages: [
      "Less load and contention per database — a hot domain no longer starves unrelated ones",
      "Smaller per-domain datasets are faster to query, index, back up and restore",
      "Clear ownership boundaries: each team operates and scales its own store, mirroring service boundaries",
      "Different domains can use different engines — relational for orders, document for catalog",
    ],
    disadvantages: [
      "Cross-domain joins move out of the database and into application code (fetch users, then fetch their orders)",
      "You lose cross-domain transactions and foreign keys — consistency becomes the app's problem",
      "More databases to provision, monitor, back up and secure",
      "Doesn't help a single oversized dataset — one domain that outgrows a machine still needs sharding",
    ],
    whenToUse:
      "When distinct domains with different access patterns are contending in one database, and you want teams to own and scale their data independently — the data-layer counterpart of splitting a monolith into services.",
    whenNotToUse:
      "When the bottleneck is one giant table rather than competing domains (shard instead), or when your workload leans heavily on cross-domain joins and transactions that federation would force into fragile application code.",
    alternatives: [
      { name: "Sharding", note: "Split one big dataset horizontally across machines" },
      { name: "Read replicas", note: "Scale reads of the same data, not separate domains" },
      { name: "Microservices", note: "Service-private databases enforce the same boundaries" },
    ],
    realWorld: [
      "Separate users / orders / inventory databases behind their own services",
      "The data-layer mirror of a microservice decomposition",
      "Breaking a strained monolith DB apart one domain at a time",
    ],
    interviewQuestions: [
      "Federation vs sharding — which axis does each split on, and when do you need each?",
      "How do you handle a query that joins across two federated databases?",
      "When does federation stop helping, and what comes next?",
    ],
    scaling:
      "Federation buys headroom by dividing unrelated load across stores, but it doesn't shrink any single domain. A hot domain that outgrows one machine still needs sharding — federation and sharding are complementary, applied in that order.",
    relatedConcepts: ["sharding", "database", "read-replica", "services", "cqrs"],
    sources: [
      { label: "AWS — Database sharding & partitioning concepts", url: "https://aws.amazon.com/what-is/database-sharding/" },
      { label: "Microsoft Azure — Data partitioning strategies", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/data-partitioning" },
      { label: "Microsoft Azure — Database-per-service pattern", url: "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/data-sovereignty-per-microservice" },
    ],
  },

  // ───────────────────────────────────────── Denormalization
  {
    id: "denormalization",
    name: "Denormalization",
    category: "data",
    icon: "Combine",
    tagline: "Trade write cost for read speed.",
    mentalModel: "Printing the author's name directly on every book cover instead of looking it up in a separate catalog each time. Browsing is instant — but if the author changes their name, you must reprint every cover.",
    misconception: {
      myth: "Denormalization means your schema is badly designed.",
      reality: "It's a deliberate performance tradeoff, not a mistake. You normalize first for correctness, then denormalize selectively where read performance demands it — accepting redundancy and the duty to keep copies in sync.",
    },
    consequenceIfRemoved: "Every read recomputes joins and aggregations at query time. In a read-heavy system that turns hot endpoints into expensive multi-table joins, and the database becomes the bottleneck long before the business needs it to.",
    definition:
      "Denormalization deliberately stores redundant data — precomputed joins, duplicated fields, rolled-up aggregates — so reads avoid expensive join and aggregation work, paying instead with more complex writes that must update every copy.",
    whyItExists:
      "Joins and aggregations across large tables are expensive, and they run on every read. When reads vastly outnumber writes, it's far cheaper overall to compute the joined shape once at write time and store it, than to recompute it on every query.",
    problemSolved:
      "Eliminates repeated read-time joins and aggregations by paying that cost once, at write time — converting expensive runtime queries into cheap direct reads.",
    advantages: [
      "Much faster reads — a single-row fetch replaces a multi-table join on the hot path",
      "Fewer tables and locks touched per query, which also reduces contention under load",
      "Fits key-value and document stores (Cassandra, DynamoDB) that don't offer joins at all — there denormalization is the model, not an optimisation",
      "Predictable read latency: no query planner surprises from a join that degrades as data grows",
    ],
    disadvantages: [
      "Every write must update all copies, so writes get slower and more complex — and easy to get wrong",
      "Data drift: if one copy is missed, reads return inconsistent values with no constraint to catch it",
      "Uses more storage (sometimes dramatically) for the duplicated fields",
      "Schema changes ripple across every place the data is duplicated",
    ],
    whenToUse:
      "Read-heavy paths where joins are the proven bottleneck, feeds/timelines/counters that are read far more than written, and key-value or document stores where joins aren't available. Apply it surgically to the hot queries that need it.",
    whenNotToUse:
      "Write-heavy systems, data with strong consistency requirements, or before you've measured a real read bottleneck — premature denormalization buys complexity and drift risk for no proven gain. Try a cache or materialized view first.",
    alternatives: [
      { name: "Normalized + cache", note: "Keep one source of truth, cache the hot reads" },
      { name: "Materialized views", note: "Let the database maintain the precomputed join for you" },
      { name: "CQRS", note: "A separate, independently-shaped read model" },
    ],
    realWorld: [
      "Wide-column stores (Cassandra) where tables are designed per-query by design",
      "Precomputed news feeds, timelines and counters",
      "Storing author_name alongside post_id to skip a users join on every render",
    ],
    interviewQuestions: [
      "When is denormalization worth the write cost — and how do you decide which queries to denormalize?",
      "How do you keep duplicated copies consistent, and what happens when one update is missed?",
      "Normalization vs denormalization — what does each optimise for?",
    ],
    scaling:
      "Denormalization is how you make reads scale when joins won't — but it pushes consistency work onto every write path. It shines in read-heavy systems; in write-heavy ones the synchronisation cost can outweigh the read savings.",
    relatedConcepts: ["cache", "cqrs", "read-replica", "nosql", "indexing"],
    sources: [
      { label: "AWS — DynamoDB single-table & denormalization", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-modeling-nosql-B.html" },
      { label: "Microsoft Azure — Data denormalization & aggregation", url: "https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/modeling-data" },
      { label: "Use The Index, Luke — relational modelling", url: "https://use-the-index-luke.com/" },
    ],
  },

  // ───────────────────────────────────────── Indexing
  {
    id: "indexing",
    name: "Indexing & SQL Tuning",
    category: "data",
    icon: "ListTree",
    tagline: "Find rows without scanning them all.",
    mentalModel: "The index at the back of a textbook. To find every mention of 'mitochondria', you don't read all 900 pages — you flip to the alphabetised index and jump straight to the listed pages. The index is extra paper that must be reprinted whenever the book changes.",
    misconception: {
      myth: "Adding indexes always makes the database faster.",
      reality: "Indexes speed reads but tax every write (each INSERT/UPDATE must maintain them) and consume storage. Too many — or the wrong ones — slow the system down. The planner may also ignore an index if it estimates a scan is cheaper.",
    },
    consequenceIfRemoved: "Every filtered query becomes a full table scan — O(n) work that reads every row. Lookups that should take microseconds take seconds as tables grow, and the database melts under load that proper indexes would have made trivial.",
    definition:
      "An index is an auxiliary data structure — most often a B-tree — that lets the database locate rows by a column's value in roughly O(log n) instead of scanning the whole table in O(n). Choosing and maintaining indexes is the first and biggest lever of SQL tuning.",
    whyItExists:
      "Full table scans read every row, which is fine for hundreds of rows and catastrophic for millions. Indexes pre-sort a column into a structure the database can binary-search, turning lookups, range scans, sorts and joins from linear into logarithmic — paying with extra storage and slower writes.",
    problemSolved:
      "Makes targeted reads — equality lookups, range scans, ORDER BY, and join keys — fast without examining every row in the table.",
    advantages: [
      "Turns O(n) table scans into O(log n) lookups — the difference between seconds and microseconds at scale",
      "Accelerates filters, range queries, sorts and joins, and enforces uniqueness constraints cheaply",
      "A covering index can answer a query from the index alone, never touching the table (an index-only scan)",
      "EXPLAIN / EXPLAIN ANALYZE exposes the planner's choices so you can tune deliberately",
    ],
    disadvantages: [
      "Every index must be updated on each INSERT/UPDATE/DELETE, so writes get slower as index count grows",
      "Indexes consume significant extra storage and memory (and compete for the buffer cache)",
      "The wrong indexes hurt: low-selectivity columns, or many overlapping indexes, add write cost for little read gain",
      "The planner may ignore an index it deems unhelpful — and stale statistics can make it choose badly",
    ],
    whenToUse:
      "On columns you frequently filter, join or sort by — especially high-selectivity ones in your real, measured query patterns. Use composite indexes for multi-column predicates and covering indexes for hot read paths.",
    whenNotToUse:
      "On small tables (a scan is already cheap), on low-selectivity columns (a boolean flag), or speculatively 'just in case'. On write-heavy tables, every extra index is a tax on every write — index only what you've proven you query.",
    alternatives: [
      { name: "Full scans", note: "Perfectly fine for small or rarely-queried tables" },
      { name: "Denormalization", note: "Pre-join so the expensive query disappears entirely" },
      { name: "Search engines", note: "Elasticsearch / OpenSearch for full-text and faceted search" },
    ],
    realWorld: [
      "B-tree indexes backing primary keys and foreign keys in Postgres / MySQL",
      "Composite and covering indexes tuned to specific endpoints",
      "EXPLAIN ANALYZE used to confirm an index is actually being used",
    ],
    interviewQuestions: [
      "How does a B-tree index turn an O(n) scan into an O(log n) lookup?",
      "Why can too many indexes hurt, and how do you decide which to keep?",
      "What is a covering index, and when does it enable an index-only scan?",
    ],
    scaling:
      "Indexing is the first thing to reach for in SQL tuning, and often buys orders of magnitude before any architectural change. But each index taxes writes — so index for your real, measured query patterns, not hypothetical ones, and revisit them as access patterns shift.",
    relatedConcepts: ["database", "denormalization", "read-replica", "nosql"],
    sources: [
      { label: "Use The Index, Luke — How indexing works", url: "https://use-the-index-luke.com/sql/anatomy" },
      { label: "PostgreSQL Docs — Indexes", url: "https://www.postgresql.org/docs/current/indexes.html" },
      { label: "PostgreSQL Docs — Using EXPLAIN", url: "https://www.postgresql.org/docs/current/using-explain.html" },
    ],
  },

  // ───────────────────────────────────────── Consistent Hashing
  {
    id: "consistent-hashing",
    name: "Consistent Hashing",
    category: "scalability",
    icon: "Disc3",
    tagline: "Add a node without reshuffling everything.",
    mentalModel: "Seating guests around a circular table by birthday. Each guest sits at the next chair clockwise from their date. Add or remove one chair and only the guests beside it shuffle — everyone else stays put. Compare that to renumbering every seat the moment one person leaves.",
    misconception: {
      myth: "Consistent hashing distributes load perfectly evenly.",
      reality: "Plain consistent hashing can leave nodes with very uneven shares, because a few random ring positions rarely split the circle fairly. Even distribution comes from virtual nodes — placing each physical node at many ring points — not from the ring itself.",
    },
    consequenceIfRemoved: "Sharding falls back to hash(key) % N. The moment you add or remove a node, N changes and almost every key remaps — a thundering herd of cache misses (or a full data reshuffle) that can knock the backing store over exactly when you were trying to scale.",
    definition:
      "Consistent hashing maps both keys and nodes onto the same circular hash space (a ring); each key is owned by the first node clockwise from it, so adding or removing a node only relocates the keys in its immediate arc — about 1/N of them — rather than remapping everything.",
    whyItExists:
      "The obvious scheme, hash(key) % N, ties every key's location to the node count. Change N by one and nearly every key moves, wiping caches and triggering mass data movement. Consistent hashing decouples a key's position from N, so membership changes become incremental instead of catastrophic.",
    problemSolved:
      "Minimises how much data must move when a cluster grows, shrinks or loses a node — keeping distributed caches warm and rebalancing cheap and local.",
    advantages: [
      "Only ~1/N of keys move on a membership change, instead of nearly all of them with modulo hashing",
      "No central coordinator needed: ownership is a purely local 'walk clockwise' rule any client can compute",
      "Virtual nodes (many ring points per server) smooth out load and let heterogeneous servers carry weighted shares",
      "A failed node's keys fall to its single clockwise neighbour, not the whole cluster — failure is contained",
    ],
    disadvantages: [
      "More complex to implement and reason about than hash(key) % N",
      "Without virtual nodes, random placement leaves load badly skewed across nodes",
      "Provides placement only — you still need replication for availability and durability",
      "A node failure dumps all its load onto one neighbour, which can then become a hotspot",
    ],
    whenToUse:
      "Whenever a distributed cache, database or router must add and remove nodes elastically without remapping the whole keyspace — partitioning in Cassandra/DynamoDB-style stores, sharded caches, and sticky request routing.",
    whenNotToUse:
      "For a fixed, rarely-changing set of nodes, plain modulo hashing is simpler and fine. If you need ordered range scans, range partitioning fits better — consistent hashing scatters adjacent keys around the ring.",
    alternatives: [
      { name: "Modulo hashing", note: "Dead simple, but remaps almost everything on resize" },
      { name: "Range partitioning", note: "Keeps keys ordered for range scans, but prone to hotspots" },
      { name: "Rendezvous (HRW) hashing", note: "Highest-random-weight; even simpler ownership, similar guarantees" },
    ],
    realWorld: [
      "Distributed cache clients (Memcached/Redis client-side sharding)",
      "Partitioning in Cassandra and DynamoDB",
      "CDN and load-balancer routing that pins a key to a consistent backend",
    ],
    interviewQuestions: [
      "Why not just hash(key) % N — what exactly goes wrong when N changes?",
      "How do virtual nodes fix the uneven-distribution problem?",
      "What happens to a failed node's keys, and how can that create a hotspot?",
    ],
    scaling:
      "Consistent hashing is what lets distributed caches and databases grow and shrink elastically without a thundering herd of cache misses. Virtual nodes are essential at scale — they're what turn 'works in theory' into evenly balanced load in practice.",
    relatedConcepts: ["sharding", "cache", "load-balancer", "nosql"],
    sources: [
      { label: "Karger et al. — Consistent Hashing (original paper, 1997)", url: "https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf" },
      { label: "Amazon — Dynamo paper (partitioning via consistent hashing)", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf" },
      { label: "Cloudflare — Consistent hashing explained", url: "https://blog.cloudflare.com/improving-load-balancing-with-a-new-consistent-hashing-algorithm/" },
    ],
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
      failures: [
        {
          at: "walk",
          label: "Node failure dumps load on neighbour",
          what: "When a node dies, its entire arc of keys falls to the next clockwise neighbour — potentially doubling that neighbour's load and creating a hotspot or cascade.",
          recovery: "Replicate keys to multiple clockwise neighbours (replication factor N=3). On failure, load spreads across N-1 nodes instead of concentrating on one. Virtual nodes also help by distributing each server's arc across the ring.",
        },
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
    mentalModel: "A co-pilot in the cockpit. They're trained, strapped in, and tracking the flight the whole time — so if the captain is incapacitated, they take the controls in seconds, not minutes. The cost is paying a second qualified pilot to mostly watch.",
    misconception: {
      myth: "Failover means zero downtime and no lost data.",
      reality: "There's always a failover gap — the window between detecting the failure and the standby taking over — during which requests fail. And if replication to the standby was asynchronous, the most recent writes can be lost. Failover bounds downtime; it rarely eliminates it.",
    },
    consequenceIfRemoved: "Any single node's death takes the service down until a human notices, diagnoses, and manually promotes a replacement — turning a 30-second blip into a multi-hour outage and making real availability targets impossible.",
    definition:
      "Failover automatically shifts traffic from a failed component to a healthy replacement. In active-passive a warm standby waits idle until promoted; in active-active all nodes serve simultaneously and the survivors absorb a failed node's share.",
    whyItExists:
      "Hardware, processes and networks fail — it's a certainty, not a risk. To stay available a system must detect failure and redirect to a replacement automatically, in seconds, without waiting for a human to wake up and intervene.",
    problemSolved:
      "Removes single points of failure by guaranteeing a ready replacement takes over the moment a node goes down, bounding downtime to the detection-plus-promotion window.",
    advantages: [
      "Bounds downtime to seconds and recovers without paging a human — the foundation of high availability",
      "Active-active doubles as horizontal scale: the standbys aren't idle, they're serving traffic too",
      "Health-check-driven, so it reacts to real failure signals rather than a fixed schedule",
      "Combined with multi-AZ/multi-region placement, it survives whole-datacentre failures",
    ],
    disadvantages: [
      "Active-passive pays for standby capacity that sits idle until the rare moment it's needed",
      "Split-brain risk: if both nodes believe they're primary, they accept conflicting writes and corrupt data — fencing/quorum is mandatory",
      "The failover itself drops in-flight requests, and async replication can lose the last few writes (non-zero RPO)",
      "Tuning detection is a tightrope: too sensitive and it flaps, too slow and downtime drags",
    ],
    whenToUse:
      "For any stateful component whose downtime is unacceptable — primary databases, brokers, leaders. Active-passive when correctness and simplicity matter most; active-active when you also need the extra capacity and can tolerate concurrent writers.",
    whenNotToUse:
      "For stateless services already behind a load balancer (it does the rerouting for you), or for systems where a short manual recovery is genuinely acceptable and the standby cost and split-brain complexity aren't worth it.",
    alternatives: [
      { name: "Active-active", note: "All nodes serve; survivors absorb load, no idle standby" },
      { name: "Multi-region failover", note: "Survive an entire region going dark" },
      { name: "Accept downtime", note: "For non-critical systems, manual recovery can be the right cost tradeoff" },
    ],
    realWorld: [
      "Database primary failover via Patroni or RDS/Aurora Multi-AZ",
      "Load balancers draining and rerouting around dead instances",
      "Leader election via Raft or ZooKeeper to pick the new primary safely",
    ],
    interviewQuestions: [
      "Active-passive vs active-active — cost, capacity and consistency tradeoffs of each?",
      "What is split-brain, and how do fencing and quorum prevent it?",
      "What determine your RTO and RPO during a failover, and how do you shrink each?",
    ],
    scaling:
      "Failover is the mechanism behind the availability nines. Active-active doubles as horizontal scale; active-passive trades idle standby cost for simplicity and stronger consistency. Either way, quorum-based promotion is what keeps a partition from producing two primaries.",
    relatedConcepts: ["read-replica", "load-balancer", "cap-theorem", "circuit-breaker", "database"],
    sources: [
      { label: "AWS — RDS Multi-AZ failover", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html" },
      { label: "Google SRE — Managing Critical State (consensus, leader election)", url: "https://sre.google/sre-book/managing-critical-state/" },
      { label: "Raft — In Search of an Understandable Consensus Algorithm", url: "https://raft.github.io/raft.pdf" },
    ],
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
    mentalModel: "Calling a busy phone line. You don't redial the instant it's engaged, again and again — that just keeps the line jammed. You wait a bit, then a bit longer, and you and everyone else stagger your redials so you don't all hit redial at the same second.",
    misconception: {
      myth: "Adding retries always makes a system more reliable.",
      reality: "Naïve retries are how a small blip becomes a full outage. When a dependency is already overloaded, every client retrying immediately multiplies the load — a self-inflicted DDoS. Retries help only with backoff, jitter, a retry budget, and idempotent operations.",
    },
    consequenceIfRemoved: "Every transient blip — a momentary network drop, a brief GC pause — surfaces as a hard user-facing error, even though simply trying again a moment later would have succeeded. Reliability drops for failures that were never really failures.",
    definition:
      "A retry re-attempts a failed operation, ideally with exponential backoff (waiting longer after each failure) and jitter (randomising the wait), to ride out transient failures without overwhelming an already-struggling dependency.",
    whyItExists:
      "Many failures are transient: a dropped packet, a leader election, a brief overload. Retrying recovers from them invisibly. But immediate, synchronised retries from many clients turn a momentary hiccup into a sustained stampede — so the retry must be deliberately paced.",
    problemSolved:
      "Recovers from transient errors automatically, while backoff and jitter stop the recovery mechanism itself from amplifying the original problem into an outage.",
    advantages: [
      "Transparently survives transient faults the user would otherwise see as errors",
      "Exponential backoff gives a struggling dependency room to recover instead of pinning it down",
      "Jitter de-synchronises clients so they don't all retry on the same tick (the thundering-herd fix)",
      "A retry budget caps the fraction of traffic that is retries, bounding the worst-case amplification",
    ],
    disadvantages: [
      "Retrying a non-idempotent operation can double-apply it (charge a card twice) without an idempotency key",
      "Unbounded or un-jittered retries amplify load and can cause or prolong the very outage they react to",
      "Each retry adds latency to the eventual success or final failure the user waits on",
      "Retries compound across layers — client, gateway and service each retrying multiplies attempts geometrically",
    ],
    whenToUse:
      "For idempotent operations against dependencies that fail transiently — reads, idempotent writes, network calls — always paired with exponential backoff, jitter, a capped attempt count and a retry budget.",
    whenNotToUse:
      "For non-idempotent operations without an idempotency key, or against a dependency that is hard-down rather than blipping — there a circuit breaker (stop calling) beats retrying. Never retry a 4xx client error; it'll fail every time.",
    alternatives: [
      { name: "Circuit breaker", note: "Stop calling a dependency that's hard-down instead of retrying it" },
      { name: "Idempotency keys", note: "Make a retry safe to apply more than once" },
      { name: "Dead-letter queue", note: "Park work that keeps failing for later inspection" },
    ],
    realWorld: [
      "AWS SDKs retrying with exponential backoff and full jitter by default",
      "Automatically retrying idempotent reads on transient 5xx/timeout",
      "Retry budgets in service meshes (Envoy/Istio) capping retry amplification",
    ],
    interviewQuestions: [
      "Why is jitter as important as backoff — what fails without it?",
      "Which operations are safe to retry, and how do idempotency keys make the rest safe?",
      "Retry vs circuit breaker — when does each apply, and how do they compose?",
    ],
    scaling:
      "At scale, synchronised retries cause thundering herds that turn a recoverable blip into an outage. Exponential backoff with full jitter, a bounded attempt count, and a retry budget are what keep the recovery mechanism from becoming the incident.",
    relatedConcepts: ["circuit-breaker", "rpc", "message-queue", "back-pressure", "rate-limiting"],
    sources: [
      { label: "AWS — Timeouts, retries and backoff with jitter", url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/" },
      { label: "AWS — Exponential Backoff And Jitter (blog)", url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/" },
      { label: "Google SRE — Addressing Cascading Failures", url: "https://sre.google/sre-book/addressing-cascading-failures/" },
    ],
  },

  // ───────────────────────────────────────── Back Pressure
  {
    id: "back-pressure",
    name: "Back Pressure",
    category: "reliability",
    icon: "Waves",
    tagline: "Push back when you're overwhelmed.",
    mentalModel: "A kitchen during a dinner rush. When orders pile up faster than the chefs can cook, the right move isn't to keep accepting every order until the tickets bury the kitchen — it's for the expediter to tell the front of house 'stop seating, we're slammed.' The pressure flows backward up the line.",
    misconception: {
      myth: "A bigger queue solves overload — just buffer more.",
      reality: "A bigger buffer only delays the collapse and makes it worse: latency balloons as items sit in the queue, then memory runs out and everything crashes at once. Back pressure addresses the real problem — the producer is simply faster than the consumer — by slowing or shedding at the source.",
    },
    consequenceIfRemoved: "Fast producers fill an unbounded queue until the consumer runs out of memory and crashes — taking the in-flight work with it. Overload stays invisible until the moment of total failure, instead of degrading gracefully.",
    definition:
      "Back pressure is a flow-control signal: when a consumer can't keep up, it tells producers to slow down — or it bounds its intake and rejects/sheds the excess — instead of silently buffering until it collapses.",
    whyItExists:
      "Producers and consumers rarely run at the same speed, and unbounded queues hide that mismatch until memory is exhausted. Back pressure makes the limit explicit and keeps the system in a stable, predictably-degraded state rather than letting it accumulate toward a cliff.",
    problemSolved:
      "Prevents fast producers from overwhelming slow consumers — avoiding unbounded queues, runaway latency, out-of-memory crashes and the cascading failure they trigger.",
    advantages: [
      "Keeps the system stable under overload instead of accumulating toward a sudden collapse",
      "Bounds memory and queue depth, so latency stays predictable rather than growing without limit",
      "Fails fast and explicitly (HTTP 429/503) — callers learn the truth immediately and can back off",
      "Contains failure locally instead of letting one slow consumer stall everything upstream of it",
    ],
    disadvantages: [
      "Producers must be written to handle rejection or slowdown — fire-and-forget code breaks",
      "Pressure propagates upstream, so the limit has to be handled at every tier, not just the bottleneck",
      "Thresholds and buffer sizes are genuinely hard to tune — too tight wastes capacity, too loose defeats the purpose",
      "Shedding work means some requests are deliberately failed; that policy decision must be explicit",
    ],
    whenToUse:
      "Any pipeline where a producer can outpace a consumer — streaming, queue consumers, request handlers calling slower dependencies. Essential wherever an unbounded in-memory buffer could otherwise grow without limit.",
    whenNotToUse:
      "When load is reliably below capacity and bounded, or when proactively capping input at the edge (rate limiting) or adding consumers (autoscaling) is a cleaner fit. Back pressure complements these rather than replacing them.",
    alternatives: [
      { name: "Rate limiting", note: "Cap input proactively at the edge, before it enters the system" },
      { name: "Load shedding", note: "Drop low-priority work first to protect the critical path" },
      { name: "Autoscaling", note: "Add consumer capacity — but it reacts in minutes, not milliseconds" },
    ],
    realWorld: [
      "TCP flow control — the original back pressure, via the receive window",
      "Reactive Streams (the request(n) demand signal) and bounded executor queues",
      "Bounded queues that reject when full; HTTP 429/503 telling clients to slow down",
    ],
    interviewQuestions: [
      "Back pressure vs rate limiting — where does each sit, and how do they differ?",
      "What exactly happens to a system with an unbounded queue under sustained overload?",
      "How do Reactive Streams signal demand upstream so producers can't outrun consumers?",
    ],
    scaling:
      "Back pressure is what stops a distributed system from melting down under a spike — it converts 'crash' into 'gracefully slow / shed', buying time for autoscaling to add capacity. Without it, a single slow tier silently propagates failure to everything feeding it.",
    relatedConcepts: ["rate-limiting", "message-queue", "circuit-breaker", "task-queue", "tcp"],
    sources: [
      { label: "Reactive Streams — Specification", url: "https://www.reactive-streams.org/" },
      { label: "Google SRE — Handling Overload", url: "https://sre.google/sre-book/handling-overload/" },
      { label: "AWS — Using load shedding to avoid overload", url: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/" },
    ],
  },

  // ───────────────────────────────────────── Task Queue
  {
    id: "task-queue",
    name: "Task Queue",
    category: "messaging",
    icon: "ListChecks",
    tagline: "Offload slow work to background workers.",
    mentalModel: "A restaurant order ticket rail. The waiter (web request) doesn't stand at the table cooking — they clip the ticket to the rail and immediately go serve the next guest. The kitchen (workers) pulls tickets and cooks at its own pace. The diner gets a fast 'order received', not a frozen waiter.",
    misconception: {
      myth: "A task queue and a message queue are the same thing.",
      reality: "A task queue is a higher-level abstraction built for running jobs — it adds retries, scheduling, result tracking and worker pools. A message queue is lower-level transport for events. Task queues (Celery, Sidekiq) often run on top of a message broker (Redis, RabbitMQ).",
    },
    consequenceIfRemoved: "Slow work — sending email, encoding video, generating a report — runs inside the request, so response times balloon to seconds and a spike in slow jobs ties up web threads and stalls fast requests too.",
    definition:
      "A task queue accepts units of work (jobs), persists them, and hands them to a pool of background workers that execute them asynchronously — decoupling slow, retryable or scheduled work from the synchronous request path.",
    whyItExists:
      "Some work is simply too slow to do inside a request the user is waiting on — sending email, generating thumbnails, running billing. A task queue lets the request accept the work instantly, return a fast response, and let workers process it later, out of band.",
    problemSolved:
      "Keeps request latency low by moving slow, retryable or scheduled work off the synchronous path onto independently-scaled workers, with retries and dead-lettering built in.",
    advantages: [
      "Fast responses: the request enqueues in milliseconds and returns, while the heavy work runs later",
      "Workers scale independently of the web tier, sized to queue depth rather than request rate",
      "Built-in retries, delays and scheduling handle transient failures and periodic jobs without bespoke code",
      "Absorbs spikes: a burst of jobs queues up and drains at the workers' sustainable pace instead of overwhelming them",
    ],
    disadvantages: [
      "Eventual completion, not instant — the UI must handle 'queued/processing' states and notify on completion",
      "Most queues deliver at-least-once, so jobs must be idempotent or guard against double execution",
      "Another moving part to run and monitor: the broker, the workers, and a dead-letter queue for poison jobs",
      "Ordering and exactly-once are hard — don't assume jobs run in submission order without explicit design",
    ],
    whenToUse:
      "For slow, retryable, or scheduled work that doesn't need to finish inside the request — email, media processing, report generation, billing, webhooks, periodic cleanup. Anywhere you want to return fast and process later.",
    whenNotToUse:
      "When the caller genuinely needs the result before responding (do it synchronously), or for low-level event streaming/fan-out where a raw message queue or log (Kafka) is the better primitive. Don't add a worker tier for work that's already fast.",
    alternatives: [
      { name: "Message queue", note: "Lower-level event transport a task queue often runs on" },
      { name: "Synchronous call", note: "Simplest — fine when the work is genuinely fast" },
      { name: "Cron / batch", note: "For scheduled bulk work without per-job enqueueing" },
    ],
    realWorld: [
      "Celery on Redis or RabbitMQ for Python background jobs",
      "Sidekiq (Redis) for Ruby; Resque, BullMQ in the Node ecosystem",
      "Thumbnail, email, and report-generation pipelines",
    ],
    interviewQuestions: [
      "Task queue vs message queue — what does the task queue add on top?",
      "How do you handle a job that keeps failing (poison message), and what is a dead-letter queue?",
      "How do you make at-least-once job processing safe — and how do you schedule delayed or periodic jobs?",
    ],
    scaling:
      "Workers scale horizontally off queue depth — queue length is your autoscaling signal. Back pressure on the queue protects the downstreams workers write to, and a dead-letter queue keeps one poison job from blocking the rest.",
    relatedConcepts: ["message-queue", "worker-service", "back-pressure", "retry", "write-api-async"],
    sources: [
      { label: "Celery — Introduction & architecture", url: "https://docs.celeryq.dev/en/stable/getting-started/introduction.html" },
      { label: "AWS — SQS dead-letter queues", url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html" },
      { label: "Sidekiq — Best practices", url: "https://github.com/sidekiq/sidekiq/wiki/Best-Practices" },
    ],
  },

  // ───────────────────────────────────────── Idempotency
  {
    id: "idempotency",
    name: "Idempotency",
    category: "reliability",
    icon: "Fingerprint",
    tagline: "Do it twice, get the same result.",
    mentalModel: "An elevator call button — pressing it five times doesn't summon five elevators. The first press registers the intent; the rest are harmlessly ignored.",
    misconception: {
      myth: "Making an endpoint idempotent means ignoring duplicate requests.",
      reality: "True idempotency means producing the same outcome — which often requires storing the result of the first attempt and returning it on subsequent calls, not silently dropping them.",
    },
    consequenceIfRemoved: "Retries become dangerous. A network timeout after a successful payment could trigger a second charge, a duplicate order, or a double-applied database migration — with no way to tell if the first attempt succeeded.",
    definition:
      "An operation is idempotent if performing it multiple times produces the same result as performing it once — making retries, replays and at-least-once delivery safe by construction.",
    whyItExists:
      "Networks lose responses, queues deliver twice, and clients retry on timeout. Without idempotency, every retry is a gamble: did the first attempt succeed or not? Idempotency removes the gamble by making the answer the same either way.",
    problemSolved:
      "Makes retries and duplicate deliveries safe — the caller can re-send without fear of double-applying the operation.",
    advantages: [
      "Retries become safe — no double charges, duplicate records or repeated side effects",
      "Simplifies at-least-once queue consumers: process the message, ack, and don't worry about redelivery",
      "Enables aggressive retry strategies that improve reliability without risking correctness",
      "Naturally composable with circuit breakers, retry budgets and dead-letter queues",
    ],
    disadvantages: [
      "Requires storing idempotency keys and results — another stateful component to manage",
      "Key storage must be durable and fast (usually Redis or a DB table with TTL)",
      "Not all operations are naturally idempotent — some need redesigning (e.g. 'increment' vs 'set to X')",
      "Key expiry window is a design decision: too short and late retries fail, too long and storage grows",
    ],
    whenToUse:
      "For any non-naturally-idempotent operation that can be retried — payments, order placement, message processing, API mutations. If a caller might send the same request twice, make the handler safe for it.",
    whenNotToUse:
      "For naturally idempotent operations (GET, PUT, DELETE by ID) where the operation already produces the same result on replay. Adding idempotency machinery to an already-safe operation is needless complexity.",
    alternatives: [
      { name: "Natural idempotency", note: "PUT /users/42 is naturally idempotent — re-applying produces the same state" },
      { name: "Unique constraints", note: "Database unique indexes reject duplicates at the storage layer" },
      { name: "Deduplication at the consumer", note: "Track processed message IDs in a set" },
    ],
    realWorld: [
      "Stripe's Idempotency-Key header — retry a payment safely",
      "SQS message deduplication IDs preventing double processing",
      "PUT vs POST — PUT is naturally idempotent, POST is not",
    ],
    interviewQuestions: [
      "How do you make a payment API idempotent?",
      "What's the difference between naturally idempotent and artificially idempotent operations?",
      "How do you handle an idempotency key that arrives after the TTL has expired?",
    ],
    scaling:
      "Idempotency key storage must scale with request rate — usually a Redis SET with TTL, or a database table pruned by expiry. The key space is bounded by the retry window, so it doesn't grow without limit.",
    relatedConcepts: ["retry", "write-api", "message-queue", "rpc"],
    sources: [
      { label: "Stripe — Idempotent requests", url: "https://stripe.com/docs/api/idempotent_requests" },
      { label: "AWS — Idempotency in serverless", url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/" },
      { label: "Martin Kleppmann — Designing Data-Intensive Applications", url: "https://dataintensive.net/" },
    ],
    internal: {
      summary: "An idempotency key is checked before processing; hits return the stored result, misses process and store.",
      nodes: [
        { id: "req", label: "Request + Key", sublabel: "Idempotency-Key: abc123", kind: "start", detail: "The client sends the request with an idempotency key — a unique identifier (usually a UUID) that represents this specific intent. If the client retries, it sends the same key." },
        { id: "lookup", label: "Key Lookup", sublabel: "check store", kind: "step", detail: "Before any processing, the server checks whether this key has been seen before. This is typically a Redis GET or a database lookup — fast and atomic." },
        { id: "seen", label: "Already processed?", kind: "decision", detail: "If the key exists, the operation was already completed. If not, this is the first attempt." },
        { id: "cached", label: "Return stored result", sublabel: "same response", kind: "terminal", detail: "Key found: return the exact same response as the original request. The caller can't distinguish a fresh response from a replayed one — which is exactly the point." },
        { id: "process", label: "Process request", sublabel: "execute business logic", kind: "step", detail: "Key not found: this is a fresh request. Execute the business logic — charge the card, create the order, send the notification." },
        { id: "store", label: "Store key + result", sublabel: "SET key, TTL", kind: "step", detail: "After processing, store the idempotency key and the response together with a TTL. Any future request with the same key returns this stored result." },
        { id: "respond", label: "Return result", kind: "terminal", detail: "Return the result to the caller. If they retry with the same key, they'll get this exact response back without re-executing the operation." },
      ],
      edges: [
        { source: "req", target: "lookup" },
        { source: "lookup", target: "seen" },
        { source: "seen", target: "cached", label: "yes" },
        { source: "seen", target: "process", label: "no" },
        { source: "process", target: "store" },
        { source: "store", target: "respond" },
      ],
    },
  },

  // ───────────────────────────────────────── Consensus & Leader Election
  {
    id: "consensus",
    name: "Consensus & Leader Election",
    category: "scalability",
    icon: "Vote",
    tagline: "Getting distributed nodes to agree.",
    mentalModel: "A jury deliberation — a majority must agree on the verdict before it's final. One person can't decide alone, and a hung jury (no majority) means no decision at all.",
    misconception: {
      myth: "Consensus algorithms like Raft are only for databases.",
      reality: "Any distributed system that needs a single leader, a consistent configuration, or a coordinated decision uses consensus — leader election, distributed locks, configuration stores, and membership management all depend on it.",
    },
    consequenceIfRemoved: "Split-brain: two nodes both believe they're the leader and accept conflicting writes. Data diverges, and there's no automatic way to reconcile — the worst failure mode in a distributed system.",
    definition:
      "Consensus is a protocol that lets a group of distributed nodes agree on a single value (or leader) despite failures, ensuring that once a majority commits, the decision is durable and consistent — even if minority nodes crash or are partitioned.",
    whyItExists:
      "In a distributed system, no single node can be trusted to make decisions alone — it might crash or be partitioned. Consensus lets a majority agree, so the system makes progress as long as most nodes are alive, and never commits conflicting decisions.",
    problemSolved:
      "Provides a single, agreed-upon leader or value across distributed nodes, preventing split-brain and ensuring consistent state even during partial failures.",
    advantages: [
      "Prevents split-brain — only one leader at a time, guaranteed by majority vote",
      "Tolerates minority failures — the system makes progress with ⌊N/2⌋+1 nodes alive",
      "Durable decisions — once a majority commits, the value survives crashes",
      "Understandable (Raft) — designed to be implementable correctly, unlike Paxos",
    ],
    disadvantages: [
      "Requires a majority — a 3-node cluster tolerates 1 failure, not 2",
      "Latency: every write must be acknowledged by a majority before committing",
      "Availability drops during a partition if the minority side can't reach a quorum",
      "Operationally complex — membership changes and log compaction are subtle",
    ],
    whenToUse:
      "Whenever you need exactly one leader, a consistent configuration store, or coordinated distributed decisions — database primary election, distributed lock services, cluster membership, and configuration management.",
    whenNotToUse:
      "For data that can tolerate eventual consistency — consensus adds latency and reduces availability during partitions. If you can use a leaderless, AP design (Cassandra, DynamoDB), you avoid the coordination cost entirely.",
    alternatives: [
      { name: "Leaderless replication", note: "Cassandra/DynamoDB — no leader election, eventual consistency" },
      { name: "External coordination", note: "ZooKeeper/etcd as a shared consensus service" },
      { name: "Manual failover", note: "A human picks the new leader — simple but slow and error-prone" },
    ],
    realWorld: [
      "etcd (Raft) backing Kubernetes cluster state",
      "ZooKeeper (ZAB) for Kafka leader election and configuration",
      "CockroachDB using Raft per range for distributed SQL consensus",
    ],
    interviewQuestions: [
      "Walk through a Raft leader election.",
      "What happens during a network partition in a 5-node Raft cluster?",
      "Why does consensus require a majority, not unanimity?",
    ],
    scaling:
      "Consensus is inherently latency-bound by the quorum round-trip. It scales reads (followers can serve stale reads) but not writes (all go through the leader). For write-heavy workloads, shard the data so each shard has its own independent consensus group.",
    relatedConcepts: ["failover", "database", "cap-theorem", "consistency-models", "distributed-lock"],
    sources: [
      { label: "Raft — In Search of an Understandable Consensus Algorithm", url: "https://raft.github.io/raft.pdf" },
      { label: "Google — Paxos Made Live", url: "https://research.google/pubs/paxos-made-live-an-engineering-perspective/" },
      { label: "Martin Kleppmann — Designing Data-Intensive Applications (Ch. 9)", url: "https://dataintensive.net/" },
    ],
    internal: {
      summary: "A candidate requests votes from peers; a majority grants leadership; the leader replicates entries and heartbeats to maintain authority.",
      nodes: [
        { id: "timeout", label: "Election Timeout", sublabel: "no heartbeat received", kind: "start", detail: "A follower hasn't heard from the leader within the election timeout. It assumes the leader is dead and starts a new election by incrementing the term and voting for itself." },
        { id: "candidate", label: "Become Candidate", sublabel: "request votes", kind: "step", detail: "The node sends RequestVote RPCs to all peers, asking for their vote in this term. Each node votes for at most one candidate per term — first-come-first-served." },
        { id: "majority", label: "Majority votes?", kind: "decision", detail: "If the candidate receives votes from a majority of nodes (including itself), it becomes the leader. If not (split vote or timeout), a new election starts with a higher term." },
        { id: "leader", label: "Become Leader", sublabel: "send heartbeats", kind: "step", detail: "The new leader immediately sends heartbeats to all followers to assert authority and prevent new elections. It now handles all client writes." },
        { id: "replicate", label: "Replicate Entries", sublabel: "AppendEntries RPC", kind: "step", detail: "Client writes are appended to the leader's log and replicated to followers via AppendEntries. Once a majority acknowledges, the entry is committed — durable even if the leader crashes." },
        { id: "committed", label: "Entry Committed", sublabel: "majority acknowledged", kind: "terminal", detail: "The committed entry is applied to the state machine. Followers apply it when they learn it's committed. The leader responds to the client with success." },
      ],
      edges: [
        { source: "timeout", target: "candidate" },
        { source: "candidate", target: "majority" },
        { source: "majority", target: "leader", label: "yes" },
        { source: "majority", target: "candidate", label: "no — retry" },
        { source: "leader", target: "replicate" },
        { source: "replicate", target: "committed" },
      ],
      failures: [
        {
          at: "leader",
          label: "Leader crashes",
          what: "If the leader dies, followers stop receiving heartbeats and a new election triggers. In-flight uncommitted entries may be lost; committed entries are safe on the majority.",
          recovery: "Election timeout fires on the most up-to-date follower, which wins the next election. Committed entries are preserved; uncommitted ones are replayed from the new leader's log.",
        },
        {
          at: "majority",
          label: "No majority reachable",
          what: "If a network partition leaves less than a majority on either side, neither side can elect a leader — the system halts writes to preserve consistency.",
          recovery: "This is CAP in action: the system chose consistency over availability. Writes resume when the partition heals and a majority can communicate again.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── Sagas
  {
    id: "sagas",
    name: "Sagas",
    category: "reliability",
    icon: "GitPullRequest",
    tagline: "Distributed transactions via compensating actions.",
    mentalModel: "Booking a holiday — you reserve a flight, then a hotel, then a car. If the car rental falls through, you cancel the hotel, then cancel the flight. Each step has an explicit undo, and you work backwards through the chain.",
    misconception: {
      myth: "A saga gives you ACID transactions across services.",
      reality: "Sagas provide eventual consistency through compensations, not atomicity. Intermediate states are visible to other transactions, and compensations can themselves fail — you trade ACID guarantees for cross-service coordination.",
    },
    consequenceIfRemoved: "Cross-service operations become all-or-nothing gambles. A payment charges but the order never creates; inventory reserves but shipping never triggers. Partial completions leave the system in an inconsistent state with no automated recovery path.",
    definition:
      "A saga is a sequence of local transactions across services where each step has a compensating action. If any step fails, the saga executes compensations in reverse order to undo the work of prior steps, achieving eventual consistency without distributed locks.",
    whyItExists:
      "Distributed systems can't use a single database transaction across services — there's no shared transaction coordinator. Sagas decompose a long-lived business process into local transactions that each own their undo logic, so failures unwind cleanly without locking resources across services.",
    problemSolved:
      "Coordinates multi-service business processes (order → payment → inventory → shipping) with reliable rollback when any step fails, without requiring two-phase commit or distributed locks.",
    advantages: [
      "No distributed locks — each service commits locally and moves on, preserving autonomy",
      "Explicit compensation logic makes failure recovery visible and testable",
      "Works across heterogeneous services with different databases and technologies",
      "Choreography sagas are fully decoupled — services react to events, no central coordinator",
    ],
    disadvantages: [
      "Intermediate states are visible — other transactions can read partially-completed data",
      "Compensations can fail too, requiring their own retry and idempotency logic",
      "Orchestration sagas add a central coordinator that becomes a single point of failure if not designed carefully",
      "Debugging a failed saga across services requires correlated tracing and clear compensation logs",
    ],
    whenToUse:
      "For multi-service business processes where each service owns its own data — order fulfillment, travel booking, payment processing. Use orchestration when you need central visibility; use choreography when services should stay fully decoupled.",
    whenNotToUse:
      "When a single database can handle the transaction (just use ACID), or when you need strict isolation between concurrent sagas — sagas don't prevent dirty reads of intermediate states. Also avoid for simple two-service calls where a retry is sufficient.",
    alternatives: [
      { name: "Two-phase commit (2PC)", note: "True distributed atomicity, but blocks on coordinator failure and doesn't scale" },
      { name: "Outbox pattern", note: "Reliable event publishing from a single service without 2PC" },
      { name: "Manual reconciliation", note: "Batch jobs that detect and fix inconsistencies after the fact" },
    ],
    realWorld: [
      "Order fulfillment: reserve inventory → charge payment → schedule shipping — compensate in reverse on failure",
      "Travel booking engines coordinating flights, hotels and car rentals across independent providers",
      "Uber trip lifecycle: match rider → dispatch driver → start trip → charge — each step compensable",
    ],
    interviewQuestions: [
      "Choreography vs orchestration sagas — when do you pick each?",
      "What happens if a compensation action itself fails?",
      "How do sagas differ from two-phase commit, and why do microservices prefer sagas?",
    ],
    scaling:
      "Choreography sagas scale naturally — each service listens to events independently. Orchestration sagas scale by making the orchestrator stateless (persisting saga state to a database) and running multiple instances behind a load balancer. Either way, each local transaction is independent, so throughput scales with the services.",
    relatedConcepts: ["acid", "services", "message-queue", "idempotency"],
    sources: [
      { label: "Chris Richardson — Saga pattern", url: "https://microservices.io/patterns/data/saga.html" },
      { label: "Caitie McCaffrey — Applying the Saga Pattern (talk)", url: "https://www.youtube.com/watch?v=xDuwrtwYHu8" },
      { label: "AWS — Saga orchestration pattern", url: "https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-data-persistence/saga-pattern.html" },
    ],
    internal: {
      summary: "Each step executes a local transaction; on failure, compensations run in reverse to undo prior steps.",
      nodes: [
        { id: "start", label: "Start Saga", sublabel: "order placed", kind: "start", detail: "A business event triggers the saga — for example, a customer places an order. The saga orchestrator (or the first service in a choreography) kicks off the sequence of local transactions." },
        { id: "step1", label: "Step 1: Reserve", sublabel: "inventory service", kind: "step", detail: "The first service executes its local transaction — reserving inventory. It commits locally and emits a success event (or calls the next service in orchestration)." },
        { id: "step2", label: "Step 2: Charge", sublabel: "payment service", kind: "step", detail: "The payment service charges the customer. This is another local transaction — committed independently. If it succeeds, the saga moves forward." },
        { id: "step3", label: "Step 3: Ship", sublabel: "shipping service", kind: "step", detail: "The shipping service schedules delivery. If this step succeeds, the saga is complete. But if it fails, the saga must compensate all prior steps." },
        { id: "failed", label: "Step failed?", kind: "decision", detail: "At any point, a step can fail — the shipping provider is down, inventory was already sold, or the payment was declined. The saga must decide: continue or compensate." },
        { id: "comp2", label: "Compensate: Refund", sublabel: "payment service", kind: "step", detail: "The compensation for Step 2: issue a refund. Each compensation must be idempotent — it might be called more than once if the saga coordinator retries." },
        { id: "comp1", label: "Compensate: Release", sublabel: "inventory service", kind: "step", detail: "The compensation for Step 1: release the reserved inventory. Compensations run in reverse order — last committed, first undone." },
        { id: "done", label: "Saga Complete", kind: "terminal", detail: "All steps succeeded — the order is fulfilled, payment collected, and shipment scheduled. The saga is done." },
        { id: "rolled", label: "Saga Rolled Back", kind: "terminal", detail: "All compensations have run. The system is back to a consistent state — no charge, no reservation, no shipment. The customer is notified of the failure." },
      ],
      edges: [
        { source: "start", target: "step1" },
        { source: "step1", target: "step2" },
        { source: "step2", target: "step3" },
        { source: "step3", target: "failed" },
        { source: "failed", target: "done", label: "no" },
        { source: "failed", target: "comp2", label: "yes" },
        { source: "comp2", target: "comp1" },
        { source: "comp1", target: "rolled" },
      ],
      failures: [
        {
          at: "comp2",
          label: "Compensation fails",
          what: "The refund call to the payment service times out. The customer has been charged but the order won't be fulfilled — the worst partial state.",
          recovery: "Compensations must be retried with exponential backoff and must be idempotent. A dead-letter queue captures permanently failed compensations for manual intervention.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── Event Sourcing
  {
    id: "event-sourcing",
    name: "Event Sourcing",
    category: "data",
    icon: "History",
    tagline: "Store events, not state — replay to rebuild.",
    mentalModel: "A bank ledger — you never overwrite a balance. Instead, every deposit, withdrawal and transfer is an immutable line item. The current balance is derived by replaying the ledger from the beginning (or from a snapshot).",
    misconception: {
      myth: "Event sourcing is just an audit log.",
      reality: "An audit log records what happened alongside mutable state. Event sourcing makes the events the source of truth — the current state is a projection derived from the log, not stored independently. Losing the events means losing everything.",
    },
    consequenceIfRemoved: "You lose the ability to answer 'how did we get here?' State overwrites destroy history, making debugging, auditing, and retroactive corrections impossible. You can never replay past decisions or build new read models from old data.",
    definition:
      "Event sourcing persists every state change as an immutable event in an append-only log. The current state of an entity is derived by replaying its event stream — making the event log the authoritative source of truth, not a side-effect.",
    whyItExists:
      "Traditional CRUD overwrites state, destroying history. Event sourcing preserves every change, enabling full audit trails, temporal queries ('what was the balance on March 1st?'), and the ability to build new read models retroactively by replaying the log.",
    problemSolved:
      "Provides a complete, immutable history of every state change, enabling replay-based state reconstruction, retroactive projections, and debuggable audit trails.",
    advantages: [
      "Complete audit trail — every change is recorded with its intent, not just the final state",
      "Temporal queries: reconstruct state at any point in time by replaying events up to that moment",
      "New read models can be built retroactively by replaying the event log through a new projection",
      "Natural fit with CQRS — events feed projections that serve reads, decoupling write and read models",
    ],
    disadvantages: [
      "Event schema evolution is hard — old events must remain parseable as the schema changes over time",
      "Replaying a long event stream is slow without snapshots, adding operational complexity",
      "Eventual consistency between the event store and read projections — queries may lag behind writes",
      "Significantly more complex than CRUD for simple domains where history isn't valuable",
    ],
    whenToUse:
      "For domains where history and auditability are core requirements — financial systems, regulatory compliance, collaborative editing. Also when you need to build new read models from existing data, or when CQRS benefits from an event-driven write side.",
    whenNotToUse:
      "For simple CRUD applications where the current state is all that matters and history has no business value. The complexity of event versioning, snapshots, and projections isn't justified when a mutable row in a database would suffice.",
    alternatives: [
      { name: "CRUD with audit log", note: "Mutable state plus a side-table recording changes — simpler, but the audit log isn't the source of truth" },
      { name: "Change Data Capture (CDC)", note: "Capture changes from the database log (WAL) and stream them — less invasive than full event sourcing" },
      { name: "Temporal tables", note: "Database-level versioning (SQL:2011) — automatic history without application-level event modeling" },
    ],
    realWorld: [
      "Banking ledgers — every transaction is an event, the balance is a projection",
      "Event-sourced order systems (e.g. Axon Framework) replaying OrderPlaced, ItemAdded, OrderShipped",
      "Git — every commit is an immutable event; the working tree is a projection of the commit log",
    ],
    interviewQuestions: [
      "How does event sourcing differ from an audit log, and when does the distinction matter?",
      "How do you handle event schema changes when old events are immutable?",
      "What are snapshots in event sourcing, and when do you need them?",
    ],
    scaling:
      "The event store is append-only, which scales well for writes. Read performance depends on projections — pre-materialized read models that update asynchronously as events arrive. Snapshots bound replay time for entities with long event histories. Partition the event log by aggregate ID to scale horizontally.",
    relatedConcepts: ["cqrs", "message-queue", "database"],
    sources: [
      { label: "Martin Fowler — Event Sourcing", url: "https://martinfowler.com/eaaDev/EventSourcing.html" },
      { label: "Greg Young — CQRS and Event Sourcing", url: "https://cqrs.files.wordpress.com/2010/11/cqrs_documents.pdf" },
      { label: "EventStoreDB — Introduction", url: "https://www.eventstore.com/event-sourcing" },
    ],
    internal: {
      summary: "A command is validated, appended as an event, and projected into a read model for queries.",
      nodes: [
        { id: "cmd", label: "Command", sublabel: "PlaceOrder", kind: "start", detail: "A command represents the intent to change state — 'place this order'. It carries the data needed to validate and execute the action." },
        { id: "load", label: "Load Aggregate", sublabel: "replay events", kind: "step", detail: "The aggregate (e.g. an Order) is reconstituted by replaying its past events from the event store. There's no mutable row — the current state is rebuilt from the event stream (or from the last snapshot)." },
        { id: "validate", label: "Validate", sublabel: "business rules", kind: "decision", detail: "The command is validated against the current aggregate state. Can the order be placed? Is there sufficient inventory? If validation fails, no event is emitted." },
        { id: "reject", label: "Reject", sublabel: "return error", kind: "terminal", detail: "Validation failed — the command is rejected and no event is appended. The system state is unchanged." },
        { id: "append", label: "Append Event", sublabel: "OrderPlaced", kind: "step", detail: "Validation passed: an immutable event (OrderPlaced) is appended to the event store. This is the atomic commit — once appended, the event is the source of truth." },
        { id: "project", label: "Project", sublabel: "update read model", kind: "step", detail: "An event handler reads the new event and updates a read-optimized projection (e.g. a denormalized orders table). This happens asynchronously — the read model is eventually consistent." },
        { id: "query", label: "Query Read Model", kind: "terminal", detail: "Clients query the projection for fast reads. The read model is optimized for the query pattern — different projections can serve different views of the same event stream." },
      ],
      edges: [
        { source: "cmd", target: "load" },
        { source: "load", target: "validate" },
        { source: "validate", target: "reject", label: "fail" },
        { source: "validate", target: "append", label: "pass" },
        { source: "append", target: "project" },
        { source: "project", target: "query" },
      ],
    },
  },

  // ───────────────────────────────────────── Distributed Locks
  {
    id: "distributed-lock",
    name: "Distributed Locks",
    category: "scalability",
    icon: "Lock",
    tagline: "One node at a time — across the cluster.",
    mentalModel: "A bathroom key at a coffee shop — only one customer can hold it at a time. If they vanish with the key, the barista hands out a new one after a timeout. The key itself enforces mutual exclusion without the customers needing to coordinate.",
    misconception: {
      myth: "A Redis SETNX lock is safe for critical sections.",
      reality: "A single-node Redis lock can fail silently during a failover — the new primary doesn't have the lock, and two clients proceed simultaneously. For true safety, you need fencing tokens or a quorum-based protocol like Redlock.",
    },
    consequenceIfRemoved: "Concurrent nodes modify the same shared resource simultaneously — double-spending money, over-selling inventory, or corrupting a file. Any operation that requires exclusive access becomes a race condition.",
    definition:
      "A distributed lock provides mutual exclusion across processes running on different machines, ensuring that only one node can execute a critical section or access a shared resource at a time — with timeouts to prevent deadlocks from crashed holders.",
    whyItExists:
      "In-process mutexes don't work across machines. When multiple service instances need exclusive access to a shared resource — a database row, an external API, a file — a distributed lock serializes access so only one instance proceeds at a time.",
    problemSolved:
      "Prevents concurrent access to shared resources across distributed nodes, avoiding race conditions, double-processing and data corruption.",
    advantages: [
      "Enforces mutual exclusion across machines — only one holder at a time, cluster-wide",
      "TTL prevents deadlocks: if the holder crashes, the lock auto-expires and another node can acquire it",
      "Fencing tokens detect stale holders that continue operating after their lock expired",
      "Well-understood pattern with battle-tested implementations (Redis, ZooKeeper, etcd)",
    ],
    disadvantages: [
      "Single-node locks (Redis SETNX) can fail during failover — the lock vanishes with the old primary",
      "Clock skew can cause TTL-based locks to expire early on fast clocks, breaking mutual exclusion",
      "Adds latency to the critical path — every lock acquisition is a network round-trip",
      "Debugging lock contention and deadlocks across services is significantly harder than in-process locks",
    ],
    whenToUse:
      "When exactly one node must perform an operation — scheduling a cron job across replicas, processing a payment, migrating a database, or accessing a non-idempotent external API. Use fencing tokens for any operation where a stale lock could cause harm.",
    whenNotToUse:
      "When idempotency can replace locking — if the operation produces the same result regardless of who runs it, you don't need exclusive access. Also avoid for high-throughput paths where lock contention becomes a bottleneck; consider optimistic concurrency (CAS) instead.",
    alternatives: [
      { name: "Optimistic concurrency (CAS)", note: "Compare-and-swap at the storage layer — no lock, retry on conflict" },
      { name: "Idempotency", note: "Make the operation safe to run multiple times, eliminating the need for exclusion" },
      { name: "Database advisory locks", note: "Postgres pg_advisory_lock for simple cases within one database" },
    ],
    realWorld: [
      "Redis SETNX + TTL for leader election among cron-job runners",
      "ZooKeeper ephemeral nodes for Kafka partition leader locks",
      "Redlock algorithm for quorum-based locking across Redis nodes",
    ],
    interviewQuestions: [
      "What can go wrong with a single-node Redis lock during a failover?",
      "What is a fencing token and how does it prevent stale-lock corruption?",
      "How does the Redlock algorithm improve on a single-node Redis lock?",
    ],
    scaling:
      "Distributed locks are inherently serializing — they're a throughput bottleneck by design. Minimize the critical section, keep TTLs short, and partition locks by resource (e.g. one lock per order ID, not a global lock) to maximize parallelism.",
    relatedConcepts: ["cache", "consensus", "idempotency"],
    sources: [
      { label: "Martin Kleppmann — How to do distributed locking", url: "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html" },
      { label: "Redis — Distributed Locks with Redis (Redlock)", url: "https://redis.io/docs/manual/patterns/distributed-locks/" },
      { label: "Apache ZooKeeper — Recipes: Locks", url: "https://zookeeper.apache.org/doc/current/recipes.html#sc_recipes_Locks" },
    ],
    internal: {
      summary: "A client acquires a lock with a TTL, performs exclusive work, and releases it — with fencing tokens guarding against stale holders.",
      nodes: [
        { id: "request", label: "Acquire Lock", sublabel: "SETNX key, TTL", kind: "start", detail: "The client attempts to acquire the lock by setting a key in Redis (or creating an ephemeral node in ZooKeeper) with a TTL. If the key already exists, the lock is held by someone else." },
        { id: "acquired", label: "Lock acquired?", kind: "decision", detail: "If SET NX succeeds, the client holds the lock. If it fails, the lock is already held — the client must wait, retry with backoff, or give up." },
        { id: "wait", label: "Wait / Retry", sublabel: "backoff", kind: "step", detail: "The lock is held by another client. Wait for it to expire or be released, then retry. Use exponential backoff to avoid thundering-herd contention." },
        { id: "fence", label: "Get Fencing Token", sublabel: "monotonic counter", kind: "step", detail: "On acquisition, the lock service returns a fencing token — a monotonically increasing number. The client passes this token to downstream resources, which reject requests with an older token." },
        { id: "work", label: "Critical Section", sublabel: "exclusive work", kind: "step", detail: "The client performs the work that requires exclusive access — updating a database row, calling an external API, or processing a job. Keep this section as short as possible to reduce contention." },
        { id: "release", label: "Release Lock", sublabel: "DEL key", kind: "step", detail: "After completing the work, the client deletes the lock key (only if it still owns it — check the value matches). If the TTL already expired, the lock was auto-released." },
        { id: "done", label: "Done", kind: "terminal", detail: "The lock is released and the next waiting client can acquire it. If the holder crashed, the TTL ensures the lock is eventually freed." },
      ],
      edges: [
        { source: "request", target: "acquired" },
        { source: "acquired", target: "wait", label: "no" },
        { source: "wait", target: "request" },
        { source: "acquired", target: "fence", label: "yes" },
        { source: "fence", target: "work" },
        { source: "work", target: "release" },
        { source: "release", target: "done" },
      ],
      failures: [
        {
          at: "work",
          label: "Lock holder crashes",
          what: "The client crashes mid-work. Without TTL, the lock would be held forever, blocking all other clients (deadlock).",
          recovery: "The TTL auto-expires the lock after the timeout. The next client acquires it and resumes. Fencing tokens ensure the crashed client's late writes (if any) are rejected by downstream resources.",
        },
      ],
    },
  },

  // ───────────────────────────────────────── Connection Pooling
  {
    id: "connection-pool",
    name: "Connection Pooling",
    category: "application",
    icon: "Plug",
    tagline: "Reuse connections instead of rebuilding them.",
    mentalModel: "A car-share fleet — instead of buying a car for every trip, you check one out from a shared lot, drive it, and return it. The lot maintains a fixed number of cars so the roads (and parking) don't get overwhelmed.",
    misconception: {
      myth: "Just increase the pool size when you see connection errors.",
      reality: "A bigger pool often makes things worse — more connections mean more memory on the database, more context switching, and longer wait times under contention. The right fix is usually fewer, better-utilized connections and shorter hold times.",
    },
    consequenceIfRemoved: "Every request opens a new TCP connection, performs the TLS handshake, and authenticates — adding 10-50ms of overhead per query. Under load, the database is overwhelmed by connection storms and starts refusing new connections entirely.",
    definition:
      "Connection pooling maintains a cache of reusable database (or service) connections, lending them to callers on demand and returning them to the pool after use — amortizing the expensive cost of connection setup across many requests.",
    whyItExists:
      "Opening a database connection is expensive: TCP handshake, TLS negotiation, authentication, and server-side memory allocation. Doing this per-request is wasteful and doesn't scale. A pool creates connections once and reuses them thousands of times.",
    problemSolved:
      "Eliminates per-request connection overhead and bounds the number of simultaneous connections to the database, preventing connection storms and protecting the database from overload.",
    advantages: [
      "Dramatic latency reduction — reusing a warm connection avoids the 10-50ms setup cost per query",
      "Bounds database connections — the pool size caps how many connections the application opens, protecting the DB",
      "Enables connection health checking — the pool can validate connections before lending them, discarding broken ones",
      "Transparent to application code — the caller gets a connection and returns it, unaware of the pooling",
    ],
    disadvantages: [
      "Pool exhaustion: if all connections are in use and the pool is full, callers block or fail until one is returned",
      "Connection leaks: forgetting to return a connection (missing finally/close) slowly drains the pool until it's empty",
      "Stale connections: a pooled connection can be silently broken (server restart, firewall timeout) and fail on next use",
      "Sizing is non-trivial — too small starves callers, too large overwhelms the database with context-switching overhead",
    ],
    whenToUse:
      "Whenever your application talks to a database, cache, or external service over persistent connections — which is nearly always. Connection pooling is a default, not an optimization. Use PgBouncer, HikariCP, or your framework's built-in pool.",
    whenNotToUse:
      "For serverless functions with very short lifetimes and low concurrency, where the pool would be created and destroyed per invocation — use an external pooler (PgBouncer, RDS Proxy) instead. Also unnecessary for connectionless protocols like HTTP/1.0 without keep-alive.",
    alternatives: [
      { name: "External connection pooler", note: "PgBouncer, ProxySQL, RDS Proxy — pool at the infrastructure layer, not in the app" },
      { name: "Connection-per-request", note: "Simplest model, fine at low volume, catastrophic at scale" },
      { name: "Multiplexing (HTTP/2, gRPC)", note: "Multiple requests over a single connection — pooling at the protocol layer" },
    ],
    realWorld: [
      "HikariCP — the default JDBC pool for Spring Boot, tuned for minimal overhead",
      "PgBouncer sitting between thousands of serverless functions and a single Postgres instance",
      "Node.js pg Pool managing a fixed set of Postgres connections across async requests",
    ],
    interviewQuestions: [
      "What happens when the connection pool is exhausted — and how do you diagnose it?",
      "How do you size a connection pool, and why is bigger not always better?",
      "What is a connection leak and how do you detect one?",
    ],
    scaling:
      "Pool size should match the database's ability to handle concurrent connections, not the application's desire for them. A common formula: connections = (core_count * 2) + disk_spindles. Beyond that, add an external pooler (PgBouncer) to multiplex thousands of application connections onto a smaller set of database connections.",
    relatedConcepts: ["database", "tcp"],
    sources: [
      { label: "HikariCP — About Pool Sizing", url: "https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing" },
      { label: "PgBouncer — Lightweight connection pooler for PostgreSQL", url: "https://www.pgbouncer.org/" },
      { label: "PostgreSQL — Connection limits and resource usage", url: "https://www.postgresql.org/docs/current/runtime-config-connection.html" },
    ],
  },

  // ───────────────────────────────────────── Service Discovery
  {
    id: "service-discovery",
    name: "Service Discovery",
    category: "application",
    icon: "Search",
    tagline: "Find services without hardcoding addresses.",
    mentalModel: "A hotel concierge — you ask for 'a good restaurant nearby', not for '42 Oak Street'. The concierge knows what's open, what's closed, and what's good right now. Services register themselves; callers ask the registry.",
    misconception: {
      myth: "Service discovery is just internal DNS.",
      reality: "DNS returns IP addresses and caches aggressively. Service discovery registries return live, health-checked endpoints with metadata (version, region, weight) and react to changes in seconds, not minutes. DNS is a building block, not a replacement.",
    },
    consequenceIfRemoved: "Service locations must be hardcoded in configuration files. Every deployment, scaling event, or failure requires manual config updates across all callers — turning routine operations into error-prone, coordinated changes.",
    definition:
      "Service discovery is the mechanism by which services register their network locations and clients find healthy instances dynamically — replacing static configuration with a live registry that reflects the current state of the infrastructure.",
    whyItExists:
      "In a dynamic environment (containers, autoscaling, rolling deploys), service instances come and go constantly. Hardcoding addresses breaks on every change. Service discovery decouples callers from specific instances, letting the infrastructure scale and heal without config updates.",
    problemSolved:
      "Enables clients to find healthy service instances dynamically, without hardcoded addresses, making scaling, deployments and failure recovery transparent to callers.",
    advantages: [
      "Dynamic: new instances register automatically, failed ones are removed — no config changes needed",
      "Health-aware: only healthy instances are returned, so callers don't hit dead endpoints",
      "Metadata-rich: registries can expose version, region, canary tags and weights alongside addresses",
      "Enables advanced traffic management — blue/green, canary and A/B routing based on registry metadata",
    ],
    disadvantages: [
      "The registry itself becomes a critical dependency — if it's down, no one can find anyone",
      "Stale registrations: a service that's running but unhealthy (zombie) must be detected and deregistered",
      "Client-side caching of results can lead to stale endpoints and uneven load distribution",
      "Adds operational complexity — another system to deploy, monitor and keep highly available",
    ],
    whenToUse:
      "In any environment with dynamic service instances — Kubernetes, container orchestration, autoscaling groups. Essential for microservices architectures where tens to hundreds of services need to find each other without manual configuration.",
    whenNotToUse:
      "For a small, static deployment with a handful of services on fixed hosts — a config file or DNS CNAME is simpler and sufficient. Don't introduce a registry for three services that never move.",
    alternatives: [
      { name: "DNS with health checks", note: "Route 53, Cloudflare — works for stable, less dynamic environments" },
      { name: "Load balancer as registry", note: "Register behind an ALB/NLB; callers hit one stable endpoint" },
      { name: "Static configuration", note: "Config files or environment variables — simple but rigid" },
    ],
    realWorld: [
      "Consul — service mesh and discovery with health checks, KV store and DNS interface",
      "Kubernetes kube-dns/CoreDNS — every Service gets a DNS name backed by live endpoint tracking",
      "Netflix Eureka — client-side discovery for Spring Cloud microservices",
    ],
    interviewQuestions: [
      "Client-side vs server-side service discovery — what are the tradeoffs?",
      "How does service discovery handle a service that's running but unhealthy?",
      "Why isn't DNS sufficient for service discovery in a container orchestration environment?",
    ],
    scaling:
      "The registry must be highly available — run it as a replicated cluster (Consul uses Raft, etcd uses Raft, ZooKeeper uses ZAB). Reads scale with replicas; writes go through the leader. Client-side caching reduces registry load but introduces staleness.",
    relatedConcepts: ["dns", "load-balancer", "kubernetes"],
    sources: [
      { label: "Consul — Service Discovery", url: "https://developer.hashicorp.com/consul/docs/concepts/service-discovery" },
      { label: "Kubernetes — Service and DNS concepts", url: "https://kubernetes.io/docs/concepts/services-networking/service/" },
      { label: "Chris Richardson — Service Discovery Patterns", url: "https://microservices.io/patterns/service-registry.html" },
    ],
    internal: {
      summary: "Services self-register on startup; clients query the registry for healthy instances; health checks prune dead entries.",
      nodes: [
        { id: "boot", label: "Service Starts", sublabel: "instance boots", kind: "start", detail: "A new service instance starts up — from a deployment, autoscaling event, or restart. It needs to announce its existence so clients can find it." },
        { id: "register", label: "Register", sublabel: "POST /register", kind: "step", detail: "The service registers itself with the discovery registry, providing its address, port, health endpoint, and metadata (version, region, tags). The registration includes a TTL or lease." },
        { id: "health", label: "Health Check", sublabel: "periodic probe", kind: "step", detail: "The registry periodically probes the service's health endpoint (or the service sends heartbeats). If checks fail, the instance is marked unhealthy and eventually deregistered." },
        { id: "query", label: "Client Queries", sublabel: "GET /services/payment", kind: "step", detail: "A client asks the registry for instances of a service (e.g. 'payment-service'). The registry returns only healthy instances, optionally filtered by metadata." },
        { id: "call", label: "Call Instance", sublabel: "client → service", kind: "step", detail: "The client picks an instance from the returned list (round-robin, random, weighted) and makes the call. Client-side load balancing happens here." },
        { id: "deregister", label: "Deregister", sublabel: "shutdown or TTL expiry", kind: "terminal", detail: "When the service shuts down gracefully, it deregisters. If it crashes, the TTL expires and the registry removes it automatically — ensuring callers stop routing to dead instances." },
      ],
      edges: [
        { source: "boot", target: "register" },
        { source: "register", target: "health" },
        { source: "health", target: "query" },
        { source: "query", target: "call" },
        { source: "health", target: "deregister", label: "fails" },
      ],
    },
  },

  // ───────────────────────────────────────── Service Mesh
  {
    id: "service-mesh",
    name: "Service Mesh",
    category: "traffic",
    icon: "Waypoints",
    tagline: "Infrastructure-layer networking for microservices.",
    mentalModel: "A postal system — you drop a letter in the mailbox and the postal service handles routing, tracking, insurance, and delivery confirmation. You don't build your own delivery network; the infrastructure does it transparently.",
    misconception: {
      myth: "A service mesh replaces your application's networking code.",
      reality: "A service mesh handles cross-cutting concerns (mTLS, retries, observability, traffic shifting) at the infrastructure layer, but your application still owns its business logic, error handling, and API contracts. The mesh handles the plumbing, not the logic.",
    },
    consequenceIfRemoved: "Every service must implement its own mTLS, retries, circuit breaking, tracing and traffic shifting — in every language, in every service. Cross-cutting networking concerns are duplicated, inconsistent, and impossible to manage centrally.",
    definition:
      "A service mesh is a dedicated infrastructure layer that handles service-to-service communication — providing mTLS encryption, load balancing, retries, circuit breaking, observability and traffic management through sidecar proxies deployed alongside every service instance.",
    whyItExists:
      "As microservices multiply, cross-cutting networking concerns (security, observability, traffic control) become impossible to implement consistently in application code across teams and languages. A service mesh extracts these concerns into infrastructure, enforcing them uniformly and centrally.",
    problemSolved:
      "Provides consistent, centrally managed service-to-service security (mTLS), observability (distributed tracing, metrics), and traffic management (canary, retries, circuit breaking) without requiring application code changes.",
    advantages: [
      "Zero-trust networking: mTLS between all services, enforced by infrastructure, not application code",
      "Uniform observability: every request is traced and metered without instrumenting each service individually",
      "Traffic management: canary releases, fault injection and traffic shifting configured declaratively",
      "Language-agnostic: works with any language or framework since the sidecar handles networking transparently",
    ],
    disadvantages: [
      "Adds latency: every request passes through two sidecar proxies (source and destination), adding 1-3ms per hop",
      "Operational complexity: the control plane (Istio, Linkerd) is another distributed system to deploy and manage",
      "Resource overhead: each sidecar consumes CPU and memory, multiplied by every pod in the cluster",
      "Debugging is harder: network issues now involve sidecar proxy logs, control plane config and data plane behavior",
    ],
    whenToUse:
      "In large microservices deployments (dozens to hundreds of services) where consistent mTLS, observability and traffic management across teams and languages justifies the infrastructure cost. Especially valuable in zero-trust security environments.",
    whenNotToUse:
      "For a small number of services (under 10) where a shared library or API gateway handles cross-cutting concerns adequately. The operational overhead of a mesh isn't justified until the number of services and teams makes library-based approaches unmanageable.",
    alternatives: [
      { name: "Shared libraries", note: "Resilience4j, Polly — implement retries and circuit breaking in code, per-language" },
      { name: "API gateway only", note: "Handles north-south traffic; east-west goes direct without mesh overhead" },
      { name: "eBPF-based networking", note: "Cilium — kernel-level networking without sidecar proxies, lower overhead" },
    ],
    realWorld: [
      "Istio + Envoy — the most widely adopted service mesh, used by Google, eBay and Airbnb",
      "Linkerd — lightweight, Rust-based mesh focused on simplicity and performance",
      "AWS App Mesh — managed service mesh for ECS and EKS workloads",
    ],
    interviewQuestions: [
      "What does a sidecar proxy do, and why is it deployed per-pod instead of per-node?",
      "How does a service mesh enable mTLS without application code changes?",
      "When is a service mesh overkill, and what would you use instead?",
    ],
    scaling:
      "The data plane (sidecars) scales linearly with the number of pods — each pod gets its own proxy. The control plane must handle configuration distribution to all sidecars; scale it by running multiple replicas and using incremental config pushes (xDS in Envoy). Latency overhead is bounded per hop (1-3ms), not per cluster size.",
    relatedConcepts: ["load-balancer", "circuit-breaker", "observability"],
    sources: [
      { label: "Istio — Architecture", url: "https://istio.io/latest/docs/ops/deployment/architecture/" },
      { label: "Linkerd — Service Mesh Explained", url: "https://linkerd.io/what-is-a-service-mesh/" },
      { label: "CNCF — Service Mesh Interface specification", url: "https://smi-spec.io/" },
    ],
  },

  // ───────────────────────────────────────── TLS
  {
    id: "tls",
    name: "TLS",
    category: "networking",
    icon: "KeyRound",
    tagline: "Encrypt the wire — trust the other end.",
    mentalModel: "A sealed envelope with a wax seal — anyone can see an envelope is being delivered, but only the intended recipient can open it, and the seal proves it wasn't tampered with in transit.",
    misconception: {
      myth: "TLS only provides encryption.",
      reality: "TLS provides three guarantees: confidentiality (encryption), integrity (tamper detection via MACs), and authentication (the server proves its identity via a certificate chain). Removing any one of these breaks the security model.",
    },
    consequenceIfRemoved: "All data — passwords, tokens, credit card numbers — travels in plaintext. Any network observer (ISP, coffee-shop Wi-Fi, compromised router) can read and modify traffic. Man-in-the-middle attacks become trivial.",
    definition:
      "Transport Layer Security is a cryptographic protocol that encrypts communication between two parties, authenticates the server (and optionally the client) via certificates, and ensures data integrity — making eavesdropping, tampering and impersonation detectable.",
    whyItExists:
      "The internet was designed without encryption — TCP transmits in plaintext. TLS wraps TCP with encryption and authentication so that data remains confidential and unmodified in transit, even over untrusted networks like public Wi-Fi or shared infrastructure.",
    problemSolved:
      "Prevents eavesdropping, tampering and impersonation on network connections, ensuring that data in transit is confidential, intact, and delivered to the authenticated server.",
    advantages: [
      "Confidentiality: encrypts all data in transit — eavesdroppers see ciphertext, not content",
      "Authentication: certificates prove the server's identity, preventing man-in-the-middle attacks",
      "Integrity: MACs detect any tampering — modified packets are rejected, not silently delivered",
      "TLS 1.3 reduces handshake to 1-RTT (0-RTT for resumption), minimizing latency overhead",
    ],
    disadvantages: [
      "Certificate management: issuance, renewal, revocation and rotation are operationally complex at scale",
      "TLS termination adds CPU overhead for encryption/decryption (mitigated by hardware acceleration)",
      "Debugging encrypted traffic requires access to keys or TLS-terminating proxies — no more casual tcpdump",
      "Misconfiguration (weak ciphers, expired certs, missing intermediates) silently degrades security",
    ],
    whenToUse:
      "Everywhere. All HTTP should be HTTPS. All internal service-to-service communication should use mTLS in zero-trust environments. The question is where to terminate TLS (edge, load balancer, or sidecar), not whether to use it.",
    whenNotToUse:
      "There are almost no valid reasons to skip TLS in production. The only exceptions are purely internal, isolated networks where performance testing requires plaintext — and even then, prefer mTLS with sidecar termination. 'It's internal' is not a sufficient reason.",
    alternatives: [
      { name: "IPsec", note: "Network-layer encryption — encrypts all traffic between hosts, not per-connection" },
      { name: "WireGuard", note: "Modern VPN protocol — simpler than IPsec, encrypts at the tunnel level" },
      { name: "Application-layer encryption", note: "Encrypt payloads before sending — end-to-end, independent of transport" },
    ],
    realWorld: [
      "HTTPS everywhere — Let's Encrypt issuing free certificates, making TLS the default for the web",
      "mTLS in service meshes (Istio, Linkerd) — mutual authentication between all internal services",
      "TLS 1.3 adoption by Cloudflare, Google, and all major CDNs for faster, safer handshakes",
    ],
    interviewQuestions: [
      "Walk through a TLS 1.3 handshake — what happens in each round-trip?",
      "What's the difference between TLS termination at the load balancer vs end-to-end encryption?",
      "How does certificate pinning work, and what are its risks?",
    ],
    scaling:
      "TLS termination is CPU-intensive but well-optimized with AES-NI hardware acceleration. Terminate at the edge (CDN, load balancer) to offload backend services. Session resumption and 0-RTT (TLS 1.3) reduce handshake overhead for returning clients. Certificate management scales with automation (cert-manager, ACME/Let's Encrypt).",
    relatedConcepts: ["tcp", "http", "reverse-proxy"],
    sources: [
      { label: "RFC 8446 — TLS 1.3", url: "https://www.rfc-editor.org/rfc/rfc8446" },
      { label: "Cloudflare — How does TLS work?", url: "https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/" },
      { label: "Let's Encrypt — How It Works", url: "https://letsencrypt.org/how-it-works/" },
    ],
    internal: {
      summary: "The client and server negotiate a cipher, verify the certificate, exchange keys, and switch to encrypted communication.",
      nodes: [
        { id: "hello", label: "ClientHello", sublabel: "supported ciphers + random", kind: "start", detail: "The client initiates the handshake by sending its supported cipher suites, TLS version, and a random value. In TLS 1.3, it also sends a key share — speeding up the handshake to 1-RTT." },
        { id: "server", label: "ServerHello", sublabel: "chosen cipher + cert", kind: "step", detail: "The server picks a cipher suite, sends its certificate (containing its public key), and its own random value. In TLS 1.3, the server also sends its key share, completing the key exchange in this single message." },
        { id: "verify", label: "Verify Certificate", sublabel: "chain of trust", kind: "decision", detail: "The client verifies the server's certificate: is it signed by a trusted CA? Is it expired? Does the hostname match? If any check fails, the connection is aborted — this is what prevents man-in-the-middle attacks." },
        { id: "reject", label: "Abort", sublabel: "untrusted cert", kind: "terminal", detail: "Certificate verification failed — the server's identity can't be trusted. The client terminates the connection and shows an error. No data is exchanged." },
        { id: "keys", label: "Key Exchange", sublabel: "derive session keys", kind: "step", detail: "Both sides derive the same session keys from the key exchange (ECDHE in TLS 1.3). These symmetric keys encrypt all subsequent data. The handshake switches to encrypted mode." },
        { id: "encrypted", label: "Encrypted Channel", sublabel: "application data flows", kind: "terminal", detail: "The TLS handshake is complete. All application data (HTTP requests, API calls) now flows over the encrypted channel. Both sides can detect tampering via MACs on every record." },
      ],
      edges: [
        { source: "hello", target: "server" },
        { source: "server", target: "verify" },
        { source: "verify", target: "reject", label: "fail" },
        { source: "verify", target: "keys", label: "pass" },
        { source: "keys", target: "encrypted" },
      ],
    },
  },

  // ───────────────────────────────────────── Deployment Strategies
  {
    id: "deployments",
    name: "Deployment Strategies",
    category: "reliability",
    icon: "Rocket",
    tagline: "Ship safely — roll out, don't yolo.",
    mentalModel: "A pilot run at a factory — before switching the whole assembly line to a new process, you run it on one station first. If quality holds, you expand; if defects appear, you revert before the whole line is affected.",
    misconception: {
      myth: "Blue/green deployment means zero downtime and zero risk.",
      reality: "Blue/green eliminates downtime during the switch, but the risk is proportional to traffic — the instant you flip to green, 100% of users hit the new version. A canary is safer because it exposes the change to a small percentage first.",
    },
    consequenceIfRemoved: "Every deploy is all-or-nothing. A bad release hits 100% of users immediately with no automated rollback path. Deployments become high-stress events that teams batch and delay, slowing delivery velocity and increasing risk per release.",
    definition:
      "Deployment strategies are techniques for releasing new versions of software with controlled risk — blue/green swaps environments atomically, canary releases to a small percentage first, rolling updates replace instances gradually, and feature flags decouple deploy from release.",
    whyItExists:
      "Deploying software is inherently risky — bugs slip through tests, performance degrades under real traffic, and edge cases only appear in production. Deployment strategies reduce blast radius by controlling how much traffic sees the new version and how quickly you can revert.",
    problemSolved:
      "Reduces deployment risk by controlling the blast radius of a new release — from a small canary slice to a full rollout — with automated rollback when metrics degrade.",
    advantages: [
      "Canary limits blast radius — a bug in the new version affects 5% of traffic, not 100%",
      "Blue/green enables instant rollback — switch traffic back to the old environment in seconds",
      "Rolling updates require no extra infrastructure — replace instances one by one within the existing fleet",
      "Feature flags decouple deployment from release — deploy dark code and enable it independently",
    ],
    disadvantages: [
      "Blue/green doubles infrastructure cost — you run two full environments simultaneously",
      "Canary requires traffic splitting and robust monitoring — metrics must detect regressions in the small slice",
      "Database schema changes are the hard part — the old and new versions must be compatible with the same schema",
      "Rolling updates create a mixed-version window where old and new instances serve simultaneously",
    ],
    whenToUse:
      "For any production deployment where risk matters. Canary for gradual validation with real traffic; blue/green for instant cutover and rollback; rolling updates for stateless services in orchestrated environments (Kubernetes); feature flags for decoupling deploy from release.",
    whenNotToUse:
      "For development and staging environments where fast, all-at-once deploys are fine. Also, avoid canary releases for changes that must be atomic (e.g. breaking API changes) — either all traffic sees the new version or none does.",
    alternatives: [
      { name: "Recreate (big bang)", note: "Stop old, start new — simple but causes downtime" },
      { name: "Shadow / dark launch", note: "Mirror traffic to the new version without serving responses — test under load without user impact" },
      { name: "A/B testing", note: "Route subsets of users to different versions to measure business metrics, not just stability" },
    ],
    realWorld: [
      "Kubernetes rolling updates — replace pods one by one with readiness probes gating traffic",
      "AWS CodeDeploy canary — shift 10% of traffic, monitor, then shift the rest",
      "LaunchDarkly feature flags decoupling deploy from release across thousands of services",
    ],
    interviewQuestions: [
      "Compare blue/green, canary and rolling deployments — when do you pick each?",
      "How do you handle database migrations during a canary or blue/green deployment?",
      "What metrics would you monitor during a canary to decide whether to promote or roll back?",
    ],
    scaling:
      "Blue/green doubles infrastructure during the transition. Canary adds minimal overhead — just a traffic split rule. Rolling updates are the most infrastructure-efficient, replacing instances in-place. Feature flags scale independently of deployment — they're just configuration, checked at runtime.",
    relatedConcepts: ["load-balancer", "observability", "kubernetes", "feature-flags"],
    sources: [
      { label: "Martin Fowler — Blue Green Deployment", url: "https://martinfowler.com/bliki/BlueGreenDeployment.html" },
      { label: "Kubernetes — Rolling Updates", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/" },
      { label: "AWS — Canary deployments with CodeDeploy", url: "https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html" },
    ],
    internal: {
      summary: "A canary deploy routes a small traffic slice to the new version, monitors for regressions, and gradually expands or rolls back.",
      nodes: [
        { id: "build", label: "Build & Test", sublabel: "CI pipeline passes", kind: "start", detail: "The new version passes all CI checks — unit tests, integration tests, linting and security scans. It's a candidate for production, but tests can't catch everything." },
        { id: "canary", label: "Deploy Canary", sublabel: "5% of traffic", kind: "step", detail: "The new version is deployed alongside the current one, receiving a small slice of real traffic (typically 1-10%). The rest of the traffic continues hitting the old version." },
        { id: "monitor", label: "Monitor Metrics", sublabel: "errors, latency, p99", kind: "step", detail: "During the canary window, key metrics are compared between the canary and the baseline: error rate, latency percentiles, business metrics (conversion, success rate). Automated analysis can trigger rollback." },
        { id: "healthy", label: "Canary healthy?", kind: "decision", detail: "Are the canary's metrics within acceptable bounds compared to the baseline? Statistical significance matters — a 5% traffic slice needs enough time to generate meaningful signal." },
        { id: "expand", label: "Expand Rollout", sublabel: "25% → 50% → 100%", kind: "step", detail: "Canary looks good: expand to a larger traffic slice. This can happen in stages (25%, 50%, 100%) with monitoring at each step, or jump straight to 100% if confidence is high." },
        { id: "complete", label: "Rollout Complete", sublabel: "100% on new version", kind: "terminal", detail: "All traffic is on the new version. The old version is kept around briefly for instant rollback, then decommissioned. The deploy is successful." },
        { id: "rollback", label: "Rollback", sublabel: "shift traffic back", kind: "terminal", detail: "Canary metrics degraded: all traffic is shifted back to the old version immediately. The canary is torn down, and the team investigates before retrying." },
      ],
      edges: [
        { source: "build", target: "canary" },
        { source: "canary", target: "monitor" },
        { source: "monitor", target: "healthy" },
        { source: "healthy", target: "expand", label: "yes" },
        { source: "healthy", target: "rollback", label: "no" },
        { source: "expand", target: "complete" },
      ],
    },
  },

  // ───────────────────────────────────────── Load Shedding
  {
    id: "load-shedding",
    name: "Load Shedding",
    category: "reliability",
    icon: "ShieldOff",
    tagline: "Drop low-priority work to protect the critical path.",
    mentalModel: "An emergency room triage nurse — when the ER is overwhelmed, critical patients are treated first and minor complaints are asked to wait or go elsewhere. The system doesn't try to treat everyone equally; it deliberately sacrifices the less important to save the most important.",
    misconception: {
      myth: "Load shedding is the same as rate limiting.",
      reality: "Rate limiting caps request rate regardless of priority. Load shedding selectively drops low-priority requests while continuing to serve high-priority ones — it's about differentiation under overload, not blanket throttling.",
    },
    consequenceIfRemoved: "Under overload, all requests degrade equally — critical payment processing competes with background analytics, and the system collapses uniformly instead of protecting its most important functions. A spike in low-value traffic takes down high-value operations.",
    definition:
      "Load shedding is the deliberate rejection or deferral of low-priority requests during overload, preserving system capacity for critical operations — choosing partial degradation over total collapse.",
    whyItExists:
      "Systems have finite capacity. When demand exceeds supply, you have two choices: degrade everything equally (and risk total failure), or deliberately sacrifice the less important to keep the most important running. Load shedding chooses the latter — it's triage for software.",
    problemSolved:
      "Prevents cascading failure during traffic spikes by ensuring critical operations (payments, authentication) continue functioning while non-essential work (analytics, recommendations) is dropped or delayed.",
    advantages: [
      "Protects critical-path operations during overload — payments keep processing while analytics are deferred",
      "Prevents cascading failure: shedding early is better than queuing until everything collapses",
      "Enables graceful degradation visible to users (e.g. simplified responses) rather than hard errors",
      "Composable with rate limiting and circuit breaking for layered overload protection",
    ],
    disadvantages: [
      "Requires classifying every request by priority — a design decision that spans the entire system",
      "Incorrect priority classification means important requests get dropped while unimportant ones proceed",
      "Customers whose requests are shed experience failures — even if the system is 'healthy' overall",
      "Testing load shedding under realistic overload conditions is difficult without chaos engineering",
    ],
    whenToUse:
      "When your system has clearly differentiated request priorities and you need to protect critical operations during overload — payment processing, authentication, core reads. Implement at API gateways, load balancers, or within services themselves.",
    whenNotToUse:
      "When all requests are equally important (rare in practice) or when the system can simply autoscale to meet demand. Also, don't use load shedding as a substitute for fixing the underlying capacity problem — it's an emergency valve, not a steady-state solution.",
    alternatives: [
      { name: "Rate limiting", note: "Cap request rate uniformly — simpler but doesn't differentiate by priority" },
      { name: "Autoscaling", note: "Add capacity to meet demand — better when possible, but not instant" },
      { name: "Queue-based smoothing", note: "Buffer requests in a queue and process at sustainable rate" },
    ],
    realWorld: [
      "Google — serving degraded search results (no personalization, no instant) during overload",
      "Amazon — disabling recommendation widgets during Prime Day spikes to protect checkout",
      "Netflix — shedding non-essential microservice calls when core streaming is under pressure",
    ],
    interviewQuestions: [
      "How do you decide which requests to shed and which to keep?",
      "What's the difference between load shedding and rate limiting?",
      "How would you implement load shedding at the API gateway layer?",
    ],
    scaling:
      "Load shedding is a local decision — each service independently monitors its own capacity (CPU, queue depth, latency) and sheds when thresholds are breached. No central coordination needed. Combine with back-pressure signals to propagate overload information upstream so callers stop sending before requests are shed.",
    relatedConcepts: ["rate-limiter", "back-pressure", "circuit-breaker"],
    sources: [
      { label: "Google SRE — Handling Overload", url: "https://sre.google/sre-book/handling-overload/" },
      { label: "AWS — Using load shedding to avoid overload", url: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/" },
      { label: "Stripe — Scaling to handle spiky traffic", url: "https://stripe.com/blog/scaling-your-api-with-rate-limiters" },
    ],
    internal: {
      summary: "Incoming requests are classified by priority; when capacity is exceeded, low-priority requests are shed while high-priority ones are admitted.",
      nodes: [
        { id: "req", label: "Request Arrives", sublabel: "inbound traffic", kind: "start", detail: "A request hits the service. Before any business logic runs, the load shedding check evaluates whether the system has capacity to handle it." },
        { id: "classify", label: "Classify Priority", sublabel: "critical / normal / low", kind: "step", detail: "Each request is assigned a priority based on its type, endpoint, customer tier, or headers. Payment requests are critical; analytics pings are low. This classification is the heart of load shedding." },
        { id: "capacity", label: "Capacity available?", kind: "decision", detail: "The service checks its current load against its capacity threshold — CPU utilization, in-flight request count, queue depth, or response latency. If capacity is available, all requests proceed." },
        { id: "admit", label: "Admit", sublabel: "process normally", kind: "terminal", detail: "The system has capacity: the request is processed normally regardless of priority. Load shedding is only active during overload." },
        { id: "priority", label: "Priority high enough?", kind: "decision", detail: "The system is overloaded. Only requests above the current priority threshold are admitted. As load increases, the threshold rises — first shedding low, then normal, keeping only critical." },
        { id: "process", label: "Process", sublabel: "critical request served", kind: "terminal", detail: "The request's priority is above the threshold: it's admitted and processed. The critical path keeps functioning even while the system is shedding lower-priority work." },
        { id: "shed", label: "Shed", sublabel: "HTTP 503 / retry-after", kind: "terminal", detail: "The request is below the priority threshold and is rejected with a 503 (or 429) and a Retry-After header. The client knows to back off and try later." },
      ],
      edges: [
        { source: "req", target: "classify" },
        { source: "classify", target: "capacity" },
        { source: "capacity", target: "admit", label: "yes" },
        { source: "capacity", target: "priority", label: "no" },
        { source: "priority", target: "process", label: "yes" },
        { source: "priority", target: "shed", label: "no" },
      ],
    },
  },

  // ───────────────────────────────────────── Bloom Filters
  {
    id: "bloom-filter",
    name: "Bloom Filters",
    category: "data",
    icon: "Filter",
    tagline: "Probably yes, definitely no.",
    mentalModel: "A bouncer with a guest list written in disappearing ink — if your name isn't on the list, you're definitely not getting in. If it looks like your name is there, you probably are, but there's a small chance it's a smudge from someone else's name. Never a false negative, sometimes a false positive.",
    misconception: {
      myth: "Bloom filters are just a smaller hash set.",
      reality: "A hash set gives exact answers and stores the actual elements. A Bloom filter uses far less space but sacrifices certainty — it can tell you 'definitely not in the set' or 'probably in the set', never 'definitely in the set'. You can't enumerate or delete elements from a standard Bloom filter.",
    },
    consequenceIfRemoved: "Every membership check becomes a full lookup — a disk read, a database query, or a network call. For workloads where most checks are negative (cache miss, non-existent key), you pay the full lookup cost for every negative answer that a Bloom filter would have short-circuited.",
    definition:
      "A Bloom filter is a space-efficient probabilistic data structure that tests whether an element is a member of a set. It can produce false positives (saying 'yes' when the element isn't present) but never false negatives (if it says 'no', the element is definitely absent).",
    whyItExists:
      "Checking if a key exists in a large dataset often requires expensive I/O — a disk seek, a database query, a network round-trip. A Bloom filter sits in memory (using far less space than the full dataset) and answers 'definitely not here' instantly, avoiding the expensive lookup for the majority of negative checks.",
    problemSolved:
      "Avoids expensive lookups for non-existent keys by providing a fast, memory-efficient 'definitely not' answer — turning O(disk) negative lookups into O(memory) bit checks.",
    advantages: [
      "Extremely space-efficient — a few bytes per element, regardless of element size",
      "O(k) lookup time (k = number of hash functions), typically under a microsecond",
      "No false negatives: 'not in set' is always correct, making it safe as a pre-filter",
      "Simple to implement and well-understood — decades of production use",
    ],
    disadvantages: [
      "False positives: 'probably in set' answers require a full lookup to confirm",
      "Cannot delete elements from a standard Bloom filter (counting Bloom filters can, at higher memory cost)",
      "Cannot enumerate the elements stored — it's a membership test, not a container",
      "False positive rate increases as the filter fills — sizing must account for the expected number of elements",
    ],
    whenToUse:
      "As a pre-filter before expensive lookups where most queries are negative — checking if a key exists before hitting disk (LSM-trees), if a URL has been crawled, if a username is taken, or if a request is in a blocklist. The payoff is largest when negative lookups dominate.",
    whenNotToUse:
      "When you need exact answers (no false positives tolerable), when you need to delete elements frequently, or when the dataset is small enough to fit in a hash set. Also not useful when most queries are positive — the filter rarely saves work.",
    alternatives: [
      { name: "Hash set", note: "Exact membership, but stores full elements — more memory, zero false positives" },
      { name: "Cuckoo filter", note: "Supports deletion and has better false positive rates at high occupancy" },
      { name: "Counting Bloom filter", note: "Replaces bits with counters to support deletion, at ~4x memory cost" },
    ],
    realWorld: [
      "LevelDB/RocksDB — Bloom filter per SSTable avoids disk reads for non-existent keys",
      "Akamai/CDN — Bloom filters check if a URL is in cache before going to disk",
      "Chrome Safe Browsing — a local Bloom filter checks URLs against a malware blocklist without hitting Google's servers",
    ],
    interviewQuestions: [
      "Why can a Bloom filter have false positives but not false negatives?",
      "How do you size a Bloom filter — what determines the false positive rate?",
      "Where would you use a Bloom filter in a distributed key-value store?",
    ],
    scaling:
      "Bloom filter size is O(n) bits where n is the expected number of elements, independent of element size. The false positive rate is tunable: more bits per element = fewer false positives. At 10 bits per element with 7 hash functions, the false positive rate is ~1%. Partitioned Bloom filters distribute across nodes by key range.",
    relatedConcepts: ["cache", "database", "indexing"],
    sources: [
      { label: "Burton H. Bloom — Original paper (1970)", url: "https://dl.acm.org/doi/10.1145/362686.362692" },
      { label: "LevelDB — Bloom filter implementation", url: "https://github.com/google/leveldb/blob/main/doc/table_format.md" },
      { label: "Cloudflare — When Bloom filters don't bloom", url: "https://blog.cloudflare.com/when-bloom-filters-dont-bloom/" },
    ],
  },

  // ───────────────────────────────────────── CRDTs
  {
    id: "crdt",
    name: "CRDTs",
    category: "data",
    icon: "Merge",
    tagline: "Merge without conflict — by mathematical design.",
    mentalModel: "A shared whiteboard where everyone has their own copy. People draw independently, and when copies sync up, the whiteboards merge automatically — additions are unioned, and the mathematical properties of the data type guarantee the same result regardless of merge order. No conflicts, no coordinator, no locking.",
    misconception: {
      myth: "CRDTs can model any data structure conflict-free.",
      reality: "CRDTs work for data types with a well-defined merge function (counters, sets, registers, maps). Not every operation can be made conflict-free — some business logic inherently requires coordination (e.g. 'only one person can book this seat'). CRDTs eliminate technical conflicts, not semantic ones.",
    },
    consequenceIfRemoved: "Concurrent offline edits conflict and require manual resolution or last-write-wins (which silently drops data). Collaborative editing, offline-first apps, and multi-region active-active writes all become fragile — conflicts are the norm, not the exception.",
    definition:
      "Conflict-free Replicated Data Types are data structures designed so that concurrent updates by different replicas can always be merged automatically, producing a consistent result without coordination — guaranteed by the mathematical properties of the merge function (commutativity, associativity, idempotency).",
    whyItExists:
      "In distributed systems with multiple writers (multi-region, offline-first, collaborative), concurrent updates to the same data are inevitable. Traditional approaches resolve conflicts with coordination (locks, consensus) or arbitrarily (last-write-wins). CRDTs eliminate the problem by making every concurrent update mergeable by construction.",
    problemSolved:
      "Enables concurrent writes from multiple replicas to converge to the same state automatically, without coordination, locks or conflict resolution — making eventual consistency practical and predictable.",
    advantages: [
      "No coordination: replicas operate independently and merge later — ideal for offline-first and multi-region",
      "Guaranteed convergence: all replicas reach the same state regardless of merge order or timing",
      "No conflicts to resolve: the merge function handles concurrency automatically by mathematical design",
      "Low latency for writes: no need to contact other replicas before accepting an update",
    ],
    disadvantages: [
      "Limited to data types with a valid merge function — not every domain model maps cleanly to a CRDT",
      "Metadata overhead: some CRDTs (e.g. OR-Set) carry tombstones or version vectors that grow over time",
      "Semantic conflicts still possible: two users can both edit the same sentence in a valid but nonsensical way",
      "Harder to reason about than single-writer models — developers must think in terms of concurrent, eventually-merged states",
    ],
    whenToUse:
      "For collaborative editing (Google Docs, Figma), offline-first applications (mobile, field workers), multi-region active-active replication, and any system where low-latency writes and tolerance of network partitions outweigh the need for strong consistency.",
    whenNotToUse:
      "When strong consistency is required (bank balances, inventory counts that must never go negative), when the data model doesn't map to existing CRDT types, or when a single-writer model is sufficient and the CRDT complexity isn't justified.",
    alternatives: [
      { name: "Last-write-wins (LWW)", note: "Simple but lossy — silently drops concurrent updates based on timestamp" },
      { name: "Operational Transformation (OT)", note: "Google Docs' original approach — transforms concurrent operations, but requires a central server" },
      { name: "Consensus (Raft/Paxos)", note: "Serialize all writes through a leader — strong consistency, but higher latency and partition sensitivity" },
    ],
    realWorld: [
      "Figma — CRDTs power real-time collaborative design with offline support",
      "Redis CRDT — active-active geo-replicated Redis with conflict-free merging",
      "Riak — distributed KV store using CRDTs (counters, sets, maps) for multi-datacenter replication",
    ],
    interviewQuestions: [
      "What are the mathematical properties that make CRDTs conflict-free?",
      "Explain the difference between a G-Counter and a PN-Counter.",
      "When would you choose CRDTs over consensus-based replication?",
    ],
    scaling:
      "CRDTs scale writes naturally — each replica accepts writes locally and syncs asynchronously. The challenge is metadata: version vectors grow with the number of replicas, and tombstones accumulate in set-based CRDTs. Garbage collection of metadata requires periodic coordination (anti-entropy sessions), which limits the practical number of replicas.",
    relatedConcepts: ["consistency-models", "base", "cap-theorem"],
    sources: [
      { label: "Marc Shapiro et al. — A comprehensive study of CRDTs", url: "https://hal.inria.fr/inria-00555588/document" },
      { label: "Martin Kleppmann — CRDTs and the Quest for Distributed Consistency (talk)", url: "https://www.youtube.com/watch?v=B5NULPSiOGw" },
      { label: "Figma — How Figma's multiplayer technology works", url: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/" },
    ],
  },

  // ───────────────────────────────────────── Feature Flags
  {
    id: "feature-flags",
    name: "Feature Flags",
    category: "application",
    icon: "ToggleLeft",
    tagline: "Decouple deployment from release.",
    mentalModel: "Light switches in a house — every room has its own switch. You can turn on the kitchen light without affecting the bedroom. If a bulb is bad, flip it off instantly without rewiring the house. Deployment installs the wiring; the flag controls whether the light is on.",
    misconception: {
      myth: "Feature flags are just if-statements for A/B tests.",
      reality: "Feature flags serve multiple purposes: release flags (deploy dark, enable later), experiment flags (A/B tests), ops flags (kill switches for degraded features), and permission flags (entitlements per customer). Each has different lifecycle, ownership and cleanup urgency.",
    },
    consequenceIfRemoved: "Every feature ships the moment it's deployed — no gradual rollout, no kill switch, no per-customer enablement. A bad feature requires a full rollback (redeploy), not a simple toggle. Deploys and releases become the same event, increasing risk and coupling.",
    definition:
      "Feature flags are runtime toggles that control which features are active in a running system — decoupling the act of deploying code from the decision to release it to users, enabling gradual rollouts, instant kill switches, and per-segment targeting without redeploying.",
    whyItExists:
      "Deploying code and releasing features are different decisions with different risk profiles. Feature flags let teams deploy continuously (reducing merge conflicts and integration risk) while controlling exactly when, for whom, and how much a feature is exposed — with a kill switch if things go wrong.",
    problemSolved:
      "Separates deployment from release, enabling dark launches, gradual rollouts, targeted experiments, and instant feature deactivation — all without redeploying code.",
    advantages: [
      "Instant kill switch: disable a feature in seconds without a redeploy or rollback",
      "Gradual rollout: expose a feature to 1%, then 10%, then 100% — each step validated with real metrics",
      "Targeted release: enable features per customer, region, plan tier or cohort — powerful for entitlements and experiments",
      "Trunk-based development: merge to main continuously with features behind flags, avoiding long-lived branches",
    ],
    disadvantages: [
      "Flag debt: abandoned flags accumulate as dead code paths — old flags must be actively cleaned up",
      "Testing combinatorics: N flags create 2^N possible states — not all combinations are tested",
      "Runtime complexity: flag evaluation on the hot path adds latency and a dependency on the flag service",
      "Organizational discipline required: without ownership and expiry policies, flag counts grow unbounded",
    ],
    whenToUse:
      "For any feature where you want to control exposure independently of deployment — new features needing gradual rollout, experiments needing per-segment targeting, operational kill switches for non-critical features under load, and entitlement gating per customer tier.",
    whenNotToUse:
      "For trivial, low-risk changes that don't need controlled exposure — not every code change needs a flag. Also avoid for long-lived flags that effectively become permanent configuration; use proper configuration management instead. Clean up flags aggressively after full rollout.",
    alternatives: [
      { name: "Branch-based releases", note: "Merge a feature branch when ready to release — simpler but creates long-lived branches and merge conflicts" },
      { name: "Canary deployments", note: "Deploy the new version to a subset of instances — controls exposure but requires redeployment to change" },
      { name: "Configuration files", note: "Static config checked into version control — no runtime changes, requires a redeploy" },
    ],
    realWorld: [
      "LaunchDarkly — feature management platform used by thousands of teams for rollouts, experiments and entitlements",
      "GitHub — ships features behind flags, enabling gradual rollout to millions of users with instant rollback",
      "Netflix — uses feature flags to disable non-critical features during peak load (a form of load shedding)",
    ],
    interviewQuestions: [
      "What are the different types of feature flags, and how do their lifecycles differ?",
      "How do you prevent feature flag debt from accumulating in a codebase?",
      "How do feature flags interact with deployment strategies like canary releases?",
    ],
    scaling:
      "Flag evaluation must be fast — typically cached locally with millisecond-latency lookups. The flag management service (LaunchDarkly, Unleash, custom) streams updates to clients via SSE or WebSockets, so flag changes propagate in seconds without polling. Flag count scales with feature velocity; discipline around cleanup keeps it bounded.",
    relatedConcepts: ["deployments", "services", "observability"],
    sources: [
      { label: "Martin Fowler — Feature Toggles", url: "https://martinfowler.com/articles/feature-toggles.html" },
      { label: "LaunchDarkly — Feature Flag Best Practices", url: "https://launchdarkly.com/blog/feature-flag-best-practices/" },
      { label: "Pete Hodgson — Feature Toggles (Feature Flags)", url: "https://www.martinfowler.com/articles/feature-toggles.html" },
    ],
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
