/**
 * "Latency Numbers Every Programmer Should Know" (Jeff Dean / Peter Norvig,
 * as collected in the system-design-primer). Used by the Latency Visualizer.
 *
 * The human-scale trick: multiply every duration by 1e9 (so 1 ns becomes 1 s)
 * to map imperceptible hardware latencies onto a human, felt timescale.
 */

export type LatencyKind = "cpu" | "memory" | "disk" | "network";

export interface LatencyEntry {
  label: string;
  ns: number;
  kind: LatencyKind;
}

export const LATENCY_NUMBERS: LatencyEntry[] = [
  { label: "L1 cache reference", ns: 0.5, kind: "cpu" },
  { label: "Branch mispredict", ns: 5, kind: "cpu" },
  { label: "L2 cache reference", ns: 7, kind: "cpu" },
  { label: "Mutex lock / unlock", ns: 25, kind: "cpu" },
  { label: "Main memory reference", ns: 100, kind: "memory" },
  { label: "Compress 1 KB (Snappy)", ns: 10_000, kind: "cpu" },
  { label: "Send 1 KB over 1 Gbps network", ns: 10_000, kind: "network" },
  { label: "Read 4 KB randomly from SSD", ns: 150_000, kind: "disk" },
  { label: "Read 1 MB sequentially from memory", ns: 250_000, kind: "memory" },
  { label: "Round trip within same datacenter", ns: 500_000, kind: "network" },
  { label: "Read 1 MB sequentially from SSD", ns: 1_000_000, kind: "disk" },
  { label: "Disk seek (HDD)", ns: 10_000_000, kind: "disk" },
  { label: "Read 1 MB sequentially from HDD", ns: 30_000_000, kind: "disk" },
  { label: "Packet round trip CA → Netherlands → CA", ns: 150_000_000, kind: "network" },
];

export const LATENCY_KIND_COLOR: Record<LatencyKind, string> = {
  cpu: "#34d399",
  memory: "#60a5fa",
  disk: "#fbbf24",
  network: "#f472b6",
};

export const LATENCY_KIND_LABEL: Record<LatencyKind, string> = {
  cpu: "CPU",
  memory: "Memory",
  disk: "Disk",
  network: "Network",
};

/** Format a nanosecond duration with a sensible unit. */
export function formatNs(ns: number): string {
  if (ns < 1_000) return `${ns % 1 === 0 ? ns : ns.toFixed(1)} ns`;
  if (ns < 1_000_000) return `${(ns / 1_000).toFixed(ns < 10_000 ? 1 : 0)} µs`;
  if (ns < 1_000_000_000) return `${(ns / 1_000_000).toFixed(ns < 10_000_000 ? 1 : 0)} ms`;
  return `${(ns / 1_000_000_000).toFixed(1)} s`;
}

/** Map a duration to "human time" (× 1e9 ⇒ ns becomes seconds) and humanize. */
export function formatHuman(ns: number): string {
  const seconds = ns; // ns × 1e9 ns/s ⇒ the numeric ns value, read as seconds
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)} sec`;
  if (seconds < 3_600) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86_400) return `${(seconds / 3_600).toFixed(1)} hours`;
  if (seconds < 31_536_000) return `${(seconds / 86_400).toFixed(1)} days`;
  return `${(seconds / 31_536_000).toFixed(1)} years`;
}

export const LATENCY_MIN_NS = LATENCY_NUMBERS[0].ns;
export const LATENCY_MAX_NS = LATENCY_NUMBERS[LATENCY_NUMBERS.length - 1].ns;

/** Position 0–1 on a log scale across the full range (for bar widths). */
export function logFraction(ns: number): number {
  const lo = Math.log10(LATENCY_MIN_NS);
  const hi = Math.log10(LATENCY_MAX_NS);
  return (Math.log10(ns) - lo) / (hi - lo);
}
