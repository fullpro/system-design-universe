import type { HandleId, Solution } from "./types";

/**
 * The Scale Simulator — a small, deterministic load model.
 *
 * As traffic climbs the tiers, each component accumulates "heat" (load ÷
 * capacity). Mitigations either cut demand (CDN, cache, queue) or raise
 * capacity (load balancer, replicas, sharding). The bottleneck is whatever runs
 * hottest, and suggestions are computed counterfactually: a fix is recommended
 * only if toggling it would actually cool the current bottleneck.
 */

export interface TrafficTierDef {
  users: string;
  rps: string;
  narrative: string;
  /** Relative demand on the system at this tier, 0–1.1. */
  demand: number;
}

export const SIM_TIERS: TrafficTierDef[] = [
  {
    users: "100",
    rps: "~5 req/s",
    demand: 0.15,
    narrative: "A single server with a database. Everything is fast. Don't add anything yet — premature scaling is its own bug.",
  },
  {
    users: "1,000",
    rps: "~50 req/s",
    demand: 0.35,
    narrative: "Still comfortable, but the app server is starting to warm up under sustained load. A good moment to think ahead.",
  },
  {
    users: "10,000",
    rps: "~500 req/s",
    demand: 0.6,
    narrative: "The database is doing the same expensive reads over and over, and one app server is no longer enough headroom.",
  },
  {
    users: "100,000",
    rps: "~5k req/s",
    demand: 0.85,
    narrative: "Read load is crushing the primary database. Without caching and replicas, query latency spikes and timeouts cascade.",
  },
  {
    users: "1,000,000",
    rps: "~50k req/s",
    demand: 1.1,
    narrative: "Even reads are handled — now write volume itself exceeds a single primary. This is where sharding stops being optional.",
  },
];

export const SIM_SOLUTIONS: Solution[] = [
  { id: "cdn", conceptId: "cdn", name: "CDN", effect: "Serves static & cacheable responses from the edge, offloading ~40% of app traffic." },
  { id: "loadbalancer", conceptId: "load-balancer", name: "Load Balancer", effect: "Spreads traffic across multiple app servers — roughly 4× the application capacity." },
  { id: "cache", conceptId: "cache", name: "Redis Cache", effect: "Absorbs ~75% of repeated reads in memory before they ever reach the database." },
  { id: "replicas", conceptId: "read-replica", name: "Read Replicas", effect: "Adds read-only copies of the database, multiplying read capacity ~3×." },
  { id: "queue", conceptId: "message-queue", name: "Message Queue", effect: "Smooths write spikes by processing them asynchronously, shaving ~30% off write pressure." },
  { id: "sharding", conceptId: "sharding", name: "Sharding", effect: "Partitions the database across machines, roughly tripling write capacity." },
];

export interface SimNodeDef {
  id: string;
  /** Solution that must be enabled for this node to appear; null = always present. */
  gatedBy: string | null;
  x: number;
  y: number;
  /** Concept this node links to when clicked. */
  conceptId?: string;
}

export const SIM_NODES: SimNodeDef[] = [
  { id: "client", gatedBy: null, x: 310, y: 0, conceptId: "client" },
  { id: "cdn", gatedBy: "cdn", x: 580, y: 90, conceptId: "cdn" },
  { id: "lb", gatedBy: "loadbalancer", x: 310, y: 180, conceptId: "load-balancer" },
  { id: "app", gatedBy: null, x: 310, y: 370, conceptId: "services" },
  { id: "cache", gatedBy: "cache", x: 30, y: 370, conceptId: "cache" },
  { id: "queue", gatedBy: "queue", x: 580, y: 370, conceptId: "message-queue" },
  { id: "db", gatedBy: null, x: 310, y: 570, conceptId: "database" },
  { id: "replica", gatedBy: "replicas", x: 30, y: 570, conceptId: "read-replica" },
];

export type HeatStatus = "idle" | "healthy" | "warm" | "hot" | "critical" | "support";

export interface SimNodeState {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  status: HeatStatus;
  heat: number;
  conceptId?: string;
}

export interface SimEdgeState {
  id: string;
  source: string;
  target: string;
  sourceHandle: HandleId;
  targetHandle: HandleId;
  dashed?: boolean;
  label?: string;
}

export interface SimulationResult {
  nodes: SimNodeState[];
  edges: SimEdgeState[];
  bottleneck: string | null;
  bottleneckHeat: number;
  suggestions: string[];
  narrative: string;
  /** Secondary, non-blocking observations (hot keys, queue lag, the frontier). */
  notes: string[];
  /** Estimated end-to-end p99 latency in milliseconds. */
  p99Latency: number;
  /** Composite availability, 0–1 (the "nines"). */
  availability: number;
}

function has(sols: Set<string>, id: string): boolean {
  return sols.has(id);
}

/** Heat of the application tier. */
function appHeat(demand: number, sols: Set<string>): number {
  const capacity = has(sols, "loadbalancer") ? 4 : 1;
  const offload = has(sols, "cdn") ? 0.6 : 1;
  return (demand * offload) / capacity;
}

/** Read-path heat on the database. */
function dbReadHeat(demand: number, sols: Set<string>): number {
  const reduction = (has(sols, "cache") ? 0.25 : 1) * (has(sols, "cdn") ? 0.85 : 1);
  const capacity = 1 + (has(sols, "replicas") ? 2 : 0);
  return (demand * reduction) / capacity;
}

/** Write-path heat on the database. */
function dbWriteHeat(demand: number, sols: Set<string>): number {
  const reduction = has(sols, "queue") ? 0.7 : 1;
  const capacity = has(sols, "sharding") ? 3 : 1;
  return (demand * reduction) / capacity;
}

function dbHeat(demand: number, sols: Set<string>): number {
  return Math.max(dbReadHeat(demand, sols), dbWriteHeat(demand, sols));
}

/**
 * The cache is not free capacity: it absorbs hot reads, but its own nodes have
 * finite throughput and — at the very top of the curve — hot keys concentrate
 * load on a single shard. So the cache visibly works harder as traffic climbs.
 */
function cacheHeat(demand: number, sols: Set<string>): number {
  if (!has(sols, "cache")) return 0;
  const hotKey = demand >= 1.0 ? 1.35 : 1; // skew concentrates load at hyperscale
  return Math.min(1.05, (demand * 0.8) / 1.8 * hotKey);
}

/**
 * The queue smooths write spikes, but if workers drain slower than ingest the
 * backlog grows. Sharding (more write capacity downstream) lets workers commit
 * faster, draining the queue.
 */
function queueHeat(demand: number, sols: Set<string>): number {
  if (!has(sols, "queue")) return 0;
  const drain = has(sols, "sharding") ? 0.7 : 1;
  return Math.min(1.05, (demand * 0.7) / 1.3 * drain);
}

function statusFor(heat: number): HeatStatus {
  if (heat < 0.45) return "healthy";
  if (heat < 0.75) return "warm";
  if (heat <= 1.0) return "hot";
  return "critical";
}

function handlesFor(source: string, target: string): Pick<SimEdgeState, "sourceHandle" | "targetHandle"> {
  const map: Record<string, [HandleId, HandleId]> = {
    "client>app": ["sb", "tt"],
    "client>cdn": ["sr", "tl"],
    "cdn>app": ["sb", "tr"],
    "client>lb": ["sb", "tt"],
    "lb>app": ["sb", "tt"],
    "app>cache": ["sl", "tr"],
    "cache>db": ["sb", "tl"],
    "app>queue": ["sr", "tl"],
    "queue>db": ["sb", "tr"],
    "app>db": ["sb", "tt"],
    "db>replica": ["sl", "tr"],
  };
  const [sh, th] = map[`${source}>${target}`] ?? ["sb", "tt"];
  return { sourceHandle: sh, targetHandle: th };
}

export function computeSimulation(tierIndex: number, sols: Set<string>): SimulationResult {
  const tier = SIM_TIERS[tierIndex];
  const demand = tier.demand;

  const aHeat = appHeat(demand, sols);
  const dHeat = dbHeat(demand, sols);
  const cHeat = cacheHeat(demand, sols);
  const qHeat = queueHeat(demand, sols);

  // Build visible nodes.
  const nodes: SimNodeState[] = SIM_NODES.filter(
    (n) => n.gatedBy === null || has(sols, n.gatedBy),
  ).map((n) => {
    let label = n.id;
    let sublabel: string | undefined;
    let status: HeatStatus = "support";
    let heat = 0;

    switch (n.id) {
      case "client":
        label = "Users";
        sublabel = `${tier.users} active`;
        status = "idle";
        break;
      case "app":
        label = has(sols, "loadbalancer") ? "App Servers ×4" : "App Server";
        heat = aHeat;
        status = statusFor(aHeat);
        sublabel = `load ${Math.round(aHeat * 100)}%`;
        break;
      case "db":
        label = has(sols, "sharding") ? "Database · sharded ×3" : "Database";
        heat = dHeat;
        status = statusFor(dHeat);
        sublabel = `load ${Math.round(dHeat * 100)}%`;
        break;
      case "cache":
        label = "Redis Cache";
        heat = cHeat;
        status = statusFor(cHeat);
        sublabel = cHeat >= 0.6 ? `${Math.round(cHeat * 100)}% — hot keys forming` : `absorbing reads · ${Math.round(cHeat * 100)}%`;
        break;
      case "replica":
        label = "Read Replicas";
        sublabel = "scale reads";
        break;
      case "lb":
        label = "Load Balancer";
        sublabel = "spread traffic";
        break;
      case "cdn":
        label = "CDN";
        sublabel = "edge offload";
        break;
      case "queue":
        label = "Message Queue";
        heat = qHeat;
        status = statusFor(qHeat);
        sublabel = qHeat >= 0.6 ? `backlog rising · ${Math.round(qHeat * 100)}%` : `async writes · ${Math.round(qHeat * 100)}%`;
        break;
    }
    return { id: n.id, label, sublabel, x: n.x, y: n.y, status, heat, conceptId: n.conceptId };
  });

  // Build edges from the active topology.
  const rawEdges: Array<[string, string, boolean?, string?]> = [];
  if (has(sols, "loadbalancer")) {
    rawEdges.push(["client", "lb"], ["lb", "app"]);
  } else {
    rawEdges.push(["client", "app"]);
  }
  if (has(sols, "cdn")) rawEdges.push(["client", "cdn"], ["cdn", "app"]);
  rawEdges.push(["app", "db"]);
  if (has(sols, "cache")) rawEdges.push(["app", "cache"], ["cache", "db", true, "on miss"]);
  if (has(sols, "queue")) rawEdges.push(["app", "queue"], ["queue", "db"]);
  if (has(sols, "replicas")) rawEdges.push(["db", "replica"]);

  const edges: SimEdgeState[] = rawEdges.map(([source, target, dashed, label]) => ({
    id: `${source}-${target}`,
    source,
    target,
    dashed,
    label,
    ...handlesFor(source, target),
  }));

  // The bottleneck is the hottest tier above the warning line.
  let bottleneck: string | null = null;
  let bottleneckHeat = 0;
  if (dHeat >= aHeat && dHeat > 0.7) {
    bottleneck = "db";
    bottleneckHeat = dHeat;
  } else if (aHeat > 0.7) {
    bottleneck = "app";
    bottleneckHeat = aHeat;
  }

  // Suggestions: inactive solutions that measurably cool the current bottleneck.
  const suggestions: string[] = [];
  if (bottleneck) {
    const baseHeat = bottleneck === "db" ? dbHeat(demand, sols) : appHeat(demand, sols);
    for (const sol of SIM_SOLUTIONS) {
      if (has(sols, sol.id)) continue;
      const next = new Set(sols);
      next.add(sol.id);
      const newHeat = bottleneck === "db" ? dbHeat(demand, next) : appHeat(demand, next);
      if (baseHeat - newHeat >= 0.08) suggestions.push(sol.id);
    }
  }

  // Estimated p99 latency: a healthy base plus a queuing penalty that grows
  // sharply with heat — so an overloaded tier visibly spikes the tail.
  const appLatency = (5 + aHeat * aHeat * 130) * (has(sols, "cdn") ? 0.85 : 1);
  const dataLatency = (has(sols, "cache") ? 3 : 11) + dHeat * dHeat * 150;
  const p99Latency = Math.round(appLatency + dataLatency);

  // Availability: redundancy (load balancer, replicas/sharding) adds nines.
  // Sequential dependencies multiply, so the weakest tier dominates — and each
  // new dependency you add is itself a thing that can fail.
  const appAvail = has(sols, "loadbalancer") ? 0.9999 : 0.999;
  const dbAvail = has(sols, "replicas") || has(sols, "sharding") ? 0.9999 : 0.999;
  // A single cache you depend on is a new failure mode: if it falls over, the
  // unshielded read storm can take the database with it (cache stampede).
  const cacheAvail = has(sols, "cache") && !has(sols, "replicas") ? 0.9997 : 1;
  const availability = appAvail * dbAvail * cacheAvail;

  // Secondary observations — the realism the single bottleneck doesn't capture.
  const notes: string[] = [];
  if (cHeat >= 0.6)
    notes.push(`Cache is doing heavy lifting (~${Math.round(cHeat * 100)}%). At this scale, hot keys concentrate on one shard — you'd spread it with consistent hashing and watch for stampedes.`);
  if (qHeat >= 0.6)
    notes.push(`Queue backlog is rising (~${Math.round(qHeat * 100)}%): workers are draining slower than ingest. More write capacity (sharding) or more workers clears it.`);
  if (has(sols, "cache") && !has(sols, "replicas") && demand >= 0.85)
    notes.push("You depend on a single cache with no replica behind it — if it drops, the read storm hits the database directly.");
  if (!bottleneck && demand >= 1.0)
    notes.push("Every tier is cooled — but at this scale the real frontier is coordination: hot keys, shard rebalancing and cross-shard queries. No architecture is truly free.");

  return {
    nodes,
    edges,
    bottleneck,
    bottleneckHeat,
    suggestions,
    narrative: tier.narrative,
    notes,
    p99Latency,
    availability,
  };
}

/** Format a 0–1 availability as a percentage string, e.g. "99.99%". */
export function formatAvailability(avail: number): string {
  return `${(avail * 100).toFixed(2)}%`;
}

/** Human-readable yearly downtime implied by an availability. */
export function formatDowntime(avail: number): string {
  const minPerYear = (1 - avail) * 525_600;
  if (minPerYear >= 1_440) return `~${(minPerYear / 1_440).toFixed(1)} days/yr`;
  if (minPerYear >= 60) return `~${(minPerYear / 60).toFixed(1)} h/yr`;
  return `~${Math.round(minPerYear)} min/yr`;
}
