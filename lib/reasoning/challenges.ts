/**
 * Interview Challenge — realistic design exercises. The user assembles a design
 * from a component palette; `evaluateDesign` scores coverage against a reference
 * architecture, flags missing essentials (with why), notes over-engineering, and
 * surfaces the classic pitfalls. Deterministic and content-driven.
 */

export interface ReqComponent {
  id: string; // concept id (for icon/name + deep dive)
  why: string;
}

export interface Challenge {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  assumptions: string[];
  nfrs: string[];
  required: ReqComponent[];
  bonus: ReqComponent[];
  pitfalls: string[];
}

/** The components a user can drop into their design. */
export const PALETTE: string[] = [
  "dns", "cdn", "load-balancer", "api-gateway", "services", "cache",
  "database", "nosql", "read-replica", "sharding", "message-queue",
  "task-queue", "analytics", "rate-limiter", "circuit-breaker", "cqrs", "observability", "microservices",
];

export const CHALLENGES: Challenge[] = [
  {
    id: "url-shortener",
    name: "URL Shortener",
    icon: "Link",
    prompt: "Design a TinyURL: take a long URL, return a short code, redirect on lookup.",
    assumptions: ["~100M new URLs/month", "Read:write ≈ 100:1 (redirects dominate)", "Codes are short & permanent"],
    nfrs: ["Redirects < 100ms", "Highly available", "Codes never collide"],
    required: [
      { id: "load-balancer", why: "Spread redirect traffic across app servers." },
      { id: "services", why: "Generate codes (hash / counter / base62) and redirect." },
      { id: "cache", why: "Redirects are 100:1 reads — cache hot codes in memory." },
      { id: "database", why: "Durable code → URL mapping (a key-value store is ideal)." },
    ],
    bonus: [
      { id: "read-replica", why: "Scale the read-dominated lookup load." },
      { id: "rate-limiter", why: "Stop abusive bulk-creation." },
      { id: "analytics", why: "Click tracking per short code." },
    ],
    pitfalls: ["Using a slow DB for redirects instead of a cache", "Random codes without a collision check", "Forgetting reads vastly outnumber writes"],
  },
  {
    id: "instagram-feed",
    name: "Instagram Feed",
    icon: "Image",
    prompt: "Design the home feed: users post photos; followers see a ranked, fresh feed.",
    assumptions: ["100M+ DAU, global", "Extremely read-heavy (95%+)", "Some accounts have millions of followers"],
    nfrs: ["Feed loads < 200ms globally", "99.99% availability", "Eventual consistency is fine"],
    required: [
      { id: "cdn", why: "Serve photos from the edge worldwide." },
      { id: "load-balancer", why: "Distribute massive read traffic." },
      { id: "api-gateway", why: "One entry point for many feed/post/user services." },
      { id: "services", why: "Feed assembly, posting, ranking." },
      { id: "cache", why: "Cache hot timelines and media metadata." },
      { id: "database", why: "Store posts, users, the social graph." },
      { id: "message-queue", why: "Fan-out a new post to followers' feeds asynchronously." },
    ],
    bonus: [
      { id: "read-replica", why: "Scale graph & metadata reads." },
      { id: "sharding", why: "Partition posts/users at this scale." },
      { id: "cqrs", why: "Precomputed feed read models." },
    ],
    pitfalls: ["Fan-out-on-write for celebrity accounts (hybrid push/pull needed)", "Synchronous feed assembly under read load", "No CDN for media"],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "MessageCircle",
    prompt: "Design 1:1 and group messaging with delivery & read receipts.",
    assumptions: ["Billions of messages/day", "Persistent connections (WebSocket)", "Must work on flaky mobile networks"],
    nfrs: ["Near-real-time delivery", "Messages never lost", "Ordered per conversation"],
    required: [
      { id: "load-balancer", why: "Distribute millions of persistent connections." },
      { id: "api-gateway", why: "Auth & route connection/message traffic." },
      { id: "services", why: "Connection handling, message routing, receipts." },
      { id: "message-queue", why: "Reliably hand off messages for offline delivery." },
      { id: "nosql", why: "Wide-column store (HBase/Cassandra) for billions of messages/day — relational won't scale write volume." },
    ],
    bonus: [
      { id: "cache", why: "Online-presence and routing lookups." },
      { id: "sharding", why: "Already built into Cassandra; manage hot partitions." },
      { id: "observability", why: "Trace delivery across the fleet." },
    ],
    pitfalls: ["No durable store → messages lost when a user is offline", "Losing per-conversation ordering", "Stateful connection servers that can't scale out", "Trying to store billions of messages in a relational DB"],
  },
  {
    id: "uber",
    name: "Uber",
    icon: "Car",
    prompt: "Design ride matching: riders request, nearby drivers are matched in real time.",
    assumptions: ["Millions of location updates/sec", "Geo-spatial matching", "Surge pricing by area"],
    nfrs: ["Match in seconds", "Regional low latency", "Accurate ETAs"],
    required: [
      { id: "load-balancer", why: "Absorb the firehose of location updates." },
      { id: "api-gateway", why: "Front the rider/driver/matching services." },
      { id: "services", why: "Geo-indexing, matching, pricing, trips." },
      { id: "cache", why: "Hot geo-index of nearby drivers." },
      { id: "database", why: "Trips, users, payments — durable record." },
      { id: "message-queue", why: "Stream location & trip events between services." },
    ],
    bonus: [
      { id: "sharding", why: "Partition by geography." },
      { id: "analytics", why: "Surge pricing & demand prediction." },
    ],
    pitfalls: ["A single relational table for live locations (needs a geo index)", "Synchronous matching that blocks under load", "No regional partitioning for a global service"],
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "Play",
    prompt: "Design video upload, transcoding, and global streaming.",
    assumptions: ["Petabytes of video", "Global viewers", "Long-tail + viral spikes"],
    nfrs: ["Smooth playback worldwide", "Handle viral spikes", "Durable storage"],
    required: [
      { id: "dns", why: "Geo-route viewers to the nearest edge." },
      { id: "cdn", why: "Stream video from edge caches — the core of delivery." },
      { id: "load-balancer", why: "Distribute API & upload traffic." },
      { id: "services", why: "Upload, transcoding orchestration, metadata, recommendations." },
      { id: "message-queue", why: "Queue transcoding jobs (multiple resolutions) asynchronously." },
      { id: "database", why: "Video metadata, users, view counts." },
    ],
    bonus: [
      { id: "analytics", why: "Watch-time & recommendation signals." },
      { id: "cache", why: "Hot metadata and trending lists." },
      { id: "sharding", why: "Partition metadata at scale." },
    ],
    pitfalls: ["Storing video bytes in the database instead of object storage (S3/GCS)", "Serving video from the origin instead of a CDN", "Synchronous transcoding on upload", "Counting views with a single hot row"],
  },
  {
    id: "notifications",
    name: "Notification System",
    icon: "Bell",
    prompt: "Design multi-channel notifications (push, email, SMS) at scale.",
    assumptions: ["Bursty — millions in a fan-out", "Multiple providers (APNs, FCM, SES…)", "Must respect user preferences & rate limits"],
    nfrs: ["Don't drop notifications", "Don't spam users", "Survive a provider outage"],
    required: [
      { id: "api-gateway", why: "Accept notification requests from many services." },
      { id: "services", why: "Templating, preference checks, channel routing." },
      { id: "message-queue", why: "Buffer bursts and decouple from slow providers." },
      { id: "database", why: "User preferences, templates, delivery status." },
      { id: "rate-limiter", why: "Avoid spamming users and respect provider quotas." },
    ],
    bonus: [
      { id: "circuit-breaker", why: "Fail fast when a provider (APNs/SES) is down." },
      { id: "task-queue", why: "Per-channel worker pools." },
      { id: "analytics", why: "Open/click/delivery metrics." },
    ],
    pitfalls: ["Sending synchronously and blocking on a slow provider", "No rate limiting → users get spammed", "No retry/dead-letter for failed sends"],
  },
];

export interface Evaluation {
  score: number;
  present: ReqComponent[];
  missing: ReqComponent[];
  bonusPresent: ReqComponent[];
  overEngineered: string[];
  verdict: string;
}

export function evaluateDesign(challenge: Challenge, design: Set<string>): Evaluation {
  const present = challenge.required.filter((r) => design.has(r.id));
  const missing = challenge.required.filter((r) => !design.has(r.id));
  const bonusPresent = challenge.bonus.filter((b) => design.has(b.id));
  const known = new Set([...challenge.required, ...challenge.bonus].map((c) => c.id));
  const overEngineered = [...design].filter((id) => !known.has(id));

  const score = Math.round((present.length / challenge.required.length) * 100);
  const verdict =
    score === 100 ? "Solid — you covered every essential. Now defend the tradeoffs."
    : score >= 70 ? "Good design, but a few essentials are missing."
    : score >= 40 ? "On the right track — key pieces are still missing."
    : "Significant gaps. Study the reference architecture below.";

  return { score, present, missing, bonusPresent, overEngineered, verdict };
}
