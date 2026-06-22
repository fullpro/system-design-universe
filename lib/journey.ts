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

/**
 * `GET /products` — a read that misses the edge cache and the app cache, so it
 * exercises the *entire* spine down to the database. The two decision hops
 * (CDN, Redis) are where the real teaching happens.
 */
export const JOURNEY: JourneyHop[] = [
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
    what: "api.shop.com is translated into an IP address the network can route to.",
    why: "Humans use names, networks use numbers. DNS is the indirection that lets the IP behind the name change — for failover or migration — without the client ever knowing.",
    cost: "~1 ms (cached)",
  },
  {
    node: "cdn",
    via: "dns-cdn",
    title: "Try the edge first",
    what: "The request hits the nearest CDN point-of-presence.",
    why: "The CDN serves cacheable content from a city near the user, skipping the long haul to the origin entirely.",
    decision: {
      question: "Is /products cacheable and fresh at this edge?",
      outcome: "MISS — a product list is personalized and changes often, so the edge can't answer it. The request continues to the origin.",
      alternative: "For a static asset (logo.png, app.js) this would be a HIT, returning in ~10 ms and never touching your servers.",
    },
    cost: "+8 ms",
  },
  {
    node: "load-balancer",
    via: "cdn-lb",
    title: "Pick a healthy server",
    what: "The load balancer forwards the request to one app server from a pool, using least-connections.",
    why: "One server has a ceiling and can die. The balancer spreads load across many and routes around the dead ones — this is what makes the app tier horizontally scalable.",
    cost: "+1 ms",
  },
  {
    node: "api-gateway",
    via: "lb-gw",
    title: "Authenticate & govern",
    what: "The gateway validates the auth token, checks the rate limit, then routes to the products service.",
    why: "Centralizing auth, throttling and routing here means each service behind it doesn't re-implement them. AuthN runs before rate-limiting so the limit can be applied per-identity.",
    cost: "+3 ms",
  },
  {
    node: "services",
    via: "gw-svc",
    title: "Run the business logic",
    what: "The products service receives the request and needs the catalogue rows to build the response.",
    why: "This is where the actual work happens — but the service shouldn't hammer the database for data it just fetched a moment ago.",
    cost: "+1 ms",
  },
  {
    node: "cache",
    via: "svc-cache",
    title: "Check the cache",
    what: "The service runs Redis GET products:top before considering the database.",
    why: "Cache-aside: read memory first. A hit is sub-millisecond and spares the database entirely.",
    decision: {
      question: "Is products:top in Redis (and not expired)?",
      outcome: "MISS — this key isn't cached yet. The service falls through to the database.",
      alternative: "On a HIT the response returns here in <1 ms and the database is never touched — which is what happens for the next reader.",
    },
    cost: "+1 ms",
  },
  {
    node: "database",
    via: "cache-db",
    title: "Hit the source of truth",
    what: "Postgres runs the indexed query, returns the rows, and the service writes them back into Redis with a TTL. The response then flows all the way back to the client.",
    why: "The database is the durable, consistent source of truth — slower, so you protect it with the cache. Because the result is now cached, the very next GET /products skips this hop entirely.",
    cost: "+11 ms",
  },
];

/** Total modelled end-to-end latency for the journey (sum of hop costs). */
export const JOURNEY_TOTAL = "≈ 26 ms";
