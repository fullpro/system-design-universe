/**
 * The constraint model the Architecture Advisor reasons over. These are the
 * inputs a real architect starts from before choosing a single technology.
 */

export type Geo = "regional" | "global";
export type Budget = "lean" | "balanced" | "premium";
export type Consistency = "strong" | "eventual" | "either";

export interface Requirements {
  users: number; // total users
  rps: number; // peak requests/sec
  readPct: number; // 0–100, the rest are writes
  geo: Geo;
  availabilityNines: number; // 99, 99.9, 99.99, 99.999
  latencyMs: number; // p99 target
  budget: Budget;
  consistency: Consistency;
}

/** Derived flags the rules read, so thresholds live in one place. */
export interface Derived {
  readHeavy: boolean;
  writeHeavy: boolean;
  highScale: boolean; // needs horizontal app scale
  hyperScale: boolean; // needs sharding / heavy decoupling
  global: boolean;
  tightLatency: boolean;
  highAvailability: boolean;
  lean: boolean;
}

export function derive(r: Requirements): Derived {
  return {
    readHeavy: r.readPct >= 80,
    writeHeavy: r.readPct <= 55,
    highScale: r.rps >= 500 || r.users >= 200_000,
    hyperScale: r.rps >= 20_000 || r.users >= 10_000_000,
    global: r.geo === "global",
    tightLatency: r.latencyMs <= 100,
    highAvailability: r.availabilityNines >= 99.9,
    lean: r.budget === "lean",
  };
}

export interface RequirementPreset {
  id: string;
  name: string;
  blurb: string;
  values: Requirements;
}

export const REQUIREMENT_PRESETS: RequirementPreset[] = [
  {
    id: "startup",
    name: "Startup MVP",
    blurb: "Ship fast, stay cheap, don't over-engineer.",
    values: { users: 5_000, rps: 50, readPct: 70, geo: "regional", availabilityNines: 99, latencyMs: 300, budget: "lean", consistency: "strong" },
  },
  {
    id: "growth",
    name: "Growing Product",
    blurb: "Traffic is climbing; the single box is creaking.",
    values: { users: 250_000, rps: 800, readPct: 80, geo: "regional", availabilityNines: 99.9, latencyMs: 200, budget: "balanced", consistency: "strong" },
  },
  {
    id: "readheavy",
    name: "Read-Heavy at Scale",
    blurb: "A social feed — reads dwarf writes.",
    values: { users: 5_000_000, rps: 12_000, readPct: 95, geo: "global", availabilityNines: 99.99, latencyMs: 100, budget: "balanced", consistency: "eventual" },
  },
  {
    id: "global",
    name: "Global Real-time",
    blurb: "Millions of users worldwide, low latency, always up.",
    values: { users: 50_000_000, rps: 60_000, readPct: 85, geo: "global", availabilityNines: 99.99, latencyMs: 80, budget: "premium", consistency: "either" },
  },
  {
    id: "writeheavy",
    name: "Write-Heavy Ingest",
    blurb: "Telemetry / events — a firehose of writes.",
    values: { users: 2_000_000, rps: 40_000, readPct: 30, geo: "global", availabilityNines: 99.99, latencyMs: 150, budget: "balanced", consistency: "eventual" },
  },
];

export const DEFAULT_REQUIREMENTS: Requirements = REQUIREMENT_PRESETS[1].values;

/** Pretty-print a user/rps count (1_500_000 → "1.5M"). */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return `${n}`;
}
