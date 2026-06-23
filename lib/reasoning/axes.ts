/**
 * The six axes every architectural decision is scored against. Higher is always
 * better (low cost → high "cost-efficiency", simple → high "simplicity"), so the
 * radar and comparisons can treat all axes uniformly.
 *
 * These axes are the shared currency of the whole Reasoning Engine: the Advisor
 * scores its recommendation, the Tradeoff lab matches your priorities against
 * them, and Comparison plots two designs on the same chart.
 */

export type AxisId =
  | "scalability"
  | "reliability"
  | "latency"
  | "cost"
  | "simplicity"
  | "operability";

export interface Axis {
  id: AxisId;
  label: string;
  short: string;
  /** What a HIGH score means. */
  high: string;
  accent: string;
}

export const AXES: Record<AxisId, Axis> = {
  scalability: { id: "scalability", label: "Scalability", short: "Scale", high: "Handles more load by adding machines", accent: "#818cf8" },
  reliability: { id: "reliability", label: "Reliability", short: "Reliab.", high: "Stays up and correct through failures", accent: "#34d399" },
  latency: { id: "latency", label: "Latency", short: "Latency", high: "Responds fast at the tail (p99)", accent: "#22d3ee" },
  cost: { id: "cost", label: "Cost-efficiency", short: "Cost", high: "Cheap to run for the value delivered", accent: "#fbbf24" },
  simplicity: { id: "simplicity", label: "Simplicity", short: "Simple", high: "Few moving parts, easy to reason about", accent: "#7dd3fc" },
  operability: { id: "operability", label: "Operability", short: "Ops", high: "Easy to deploy, monitor and debug", accent: "#f472b6" },
};

export const AXIS_ORDER: AxisId[] = [
  "scalability",
  "reliability",
  "latency",
  "cost",
  "simplicity",
  "operability",
];

export type AxisScores = Record<AxisId, number>;

export function emptyScores(value = 50): AxisScores {
  return {
    scalability: value,
    reliability: value,
    latency: value,
    cost: value,
    simplicity: value,
    operability: value,
  };
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function overallScore(s: AxisScores): number {
  const sum = AXIS_ORDER.reduce((acc, a) => acc + s[a], 0);
  return Math.round(sum / AXIS_ORDER.length);
}

export type AxisWeights = Partial<Record<AxisId, number>>;

/**
 * "Fit to your constraints" — a weighted mean of the axes, where the weights
 * encode what the user actually asked for. Unlike a flat mean, this does NOT
 * punish a design for trading away simplicity/cost when the user never asked to
 * optimise them — so a sound architecture reads as a good *fit*, not a mediocre
 * average of opposing concerns.
 */
export function weightedFit(s: AxisScores, weights: AxisWeights): number {
  let wsum = 0;
  let acc = 0;
  for (const a of AXIS_ORDER) {
    const w = weights[a] ?? 1;
    wsum += w;
    acc += w * s[a];
  }
  return wsum === 0 ? 0 : clampScore(acc / wsum);
}
