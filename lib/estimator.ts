/**
 * Back-of-the-Envelope estimator — the capacity math every system-design
 * interview turns on. Pure functions: given a handful of inputs, derive QPS,
 * storage and bandwidth, and translate the magnitudes back into the
 * architectural decisions the rest of the app teaches.
 */

const SECONDS_PER_DAY = 86_400;

export interface EstimatorInputs {
  /** Daily active users. */
  dau: number;
  /** Writes (posts, messages, pings…) generated per user per day. */
  writesPerUserPerDay: number;
  /** Reads per write (timeline views, redirects…). */
  readWriteRatio: number;
  /** Bytes stored per write. */
  payloadBytes: number;
  /** Peak QPS ÷ average QPS. */
  peakFactor: number;
  /** Years of data retained. */
  retentionYears: number;
  /** Storage copies kept (replication / erasure overhead). */
  replication: number;
}

export interface EstimatorResult {
  writesPerDay: number;
  writeQps: number;
  readQps: number;
  totalQps: number;
  peakQps: number;
  storagePerDay: number;
  storageTotal: number;
  ingressBytesPerSec: number;
  egressBytesPerSec: number;
}

export function estimate(i: EstimatorInputs): EstimatorResult {
  const writesPerDay = i.dau * i.writesPerUserPerDay;
  const writeQps = writesPerDay / SECONDS_PER_DAY;
  const readQps = writeQps * i.readWriteRatio;
  const totalQps = writeQps + readQps;
  const peakQps = totalQps * i.peakFactor;
  const storagePerDay = writesPerDay * i.payloadBytes * i.replication;
  const storageTotal = storagePerDay * 365 * i.retentionYears;
  return {
    writesPerDay,
    writeQps,
    readQps,
    totalQps,
    peakQps,
    storagePerDay,
    storageTotal,
    ingressBytesPerSec: writeQps * i.payloadBytes,
    egressBytesPerSec: readQps * i.payloadBytes,
  };
}

export interface EstimatorPreset {
  id: string;
  name: string;
  icon: string;
  blurb: string;
  values: EstimatorInputs;
}

export const ESTIMATOR_PRESETS: EstimatorPreset[] = [
  {
    id: "microblog",
    name: "Microblog feed",
    icon: "Hash",
    blurb: "Short text posts, reads dwarf writes.",
    values: { dau: 250_000_000, writesPerUserPerDay: 2, readWriteRatio: 1000, payloadBytes: 300, peakFactor: 3, retentionYears: 5, replication: 3 },
  },
  {
    id: "photos",
    name: "Photo sharing",
    icon: "Image",
    blurb: "Big binary payloads — storage explodes.",
    values: { dau: 500_000_000, writesPerUserPerDay: 0.5, readWriteRatio: 100, payloadBytes: 1_500_000, peakFactor: 4, retentionYears: 5, replication: 3 },
  },
  {
    id: "chat",
    name: "Global chat",
    icon: "MessageCircle",
    blurb: "Tiny messages at a colossal write rate.",
    values: { dau: 2_000_000_000, writesPerUserPerDay: 40, readWriteRatio: 2, payloadBytes: 100, peakFactor: 5, retentionYears: 1, replication: 3 },
  },
  {
    id: "shortener",
    name: "URL shortener",
    icon: "Link",
    blurb: "Rare writes, redirect-heavy reads.",
    values: { dau: 5_000_000, writesPerUserPerDay: 0.2, readWriteRatio: 1000, payloadBytes: 500, peakFactor: 3, retentionYears: 5, replication: 3 },
  },
  {
    id: "rideshare",
    name: "Ride-sharing pings",
    icon: "Car",
    blurb: "A location firehose, barely retained.",
    values: { dau: 5_000_000, writesPerUserPerDay: 57600, readWriteRatio: 1, payloadBytes: 50, peakFactor: 3, retentionYears: 1, replication: 1 },
  },
];

export interface Implication {
  tone: "read" | "write" | "storage" | "peak" | "ok";
  text: string;
}

/** Translate the magnitudes into the architecture they imply. */
export function implications(r: EstimatorResult, i: EstimatorInputs): Implication[] {
  const out: Implication[] = [];
  const rw = r.writeQps > 0 ? r.readQps / r.writeQps : 0;

  if (r.writeQps >= 50_000)
    out.push({ tone: "write", text: `Write firehose (${fmtQps(r.writeQps)}). One primary can't absorb this — shard, or reach for an LSM/wide-column store fronted by a queue.` });
  if (rw >= 50)
    out.push({ tone: "read", text: `Read-heavy (${fmtCount(rw)}:1). Cache aggressively and add read replicas + a CDN before touching the write path.` });
  if (r.storageTotal >= 1e15)
    out.push({ tone: "storage", text: `Storage dominates (${fmtBytes(r.storageTotal)} retained). Blobs live in object storage with tiering; the database keeps only metadata.` });
  else if (i.payloadBytes >= 500_000)
    out.push({ tone: "storage", text: `Large objects (${fmtBytes(i.payloadBytes)} each) belong behind a CDN in blob storage, never inline in the DB.` });
  if (r.peakQps >= 100_000 && out.length < 3)
    out.push({ tone: "peak", text: `Peak reaches ${fmtQps(r.peakQps)} (${i.peakFactor}× average). Provision and autoscale for the peak; rate-limit to protect the floor.` });

  if (out.length === 0)
    out.push({ tone: "ok", text: "Modest scale — a single well-tuned primary with a cache handles this comfortably. Resist the urge to over-engineer." });
  return out.slice(0, 3);
}

// ── Formatting ────────────────────────────────────────────────────────────
export function fmtCount(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`;
  if (n >= 1) return String(Math.round(n));
  return n.toFixed(2);
}

export function fmtBytes(b: number): string {
  if (b >= 1e15) return `${(b / 1e15).toFixed(b >= 1e16 ? 0 : 1)} PB`;
  if (b >= 1e12) return `${(b / 1e12).toFixed(b >= 1e13 ? 0 : 1)} TB`;
  if (b >= 1e9) return `${(b / 1e9).toFixed(b >= 1e10 ? 0 : 1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(b >= 1e7 ? 0 : 1)} MB`;
  if (b >= 1e3) return `${(b / 1e3).toFixed(0)} KB`;
  return `${Math.round(b)} B`;
}

export function fmtQps(n: number): string {
  return `${fmtCount(n)}/s`;
}
