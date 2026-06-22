import { type AxisId, type AxisScores, emptyScores, clampScore, AXIS_ORDER } from "./axes";

/**
 * The scoring engine. Each component contributes signed deltas to the six axes;
 * an architecture's profile is the baseline plus the sum of its components'
 * deltas, clamped to 0–100. Deterministic and fully explainable — no magic.
 *
 * Deltas are illustrative-but-defensible, encoding the classic tradeoffs:
 * a cache buys latency & scale at the cost of simplicity; sharding buys huge
 * scale at a brutal simplicity/operability price; multi-region buys reliability
 * & global latency at a steep cost and complexity, etc.
 */
type Delta = Partial<Record<AxisId, number>>;

export const COMPONENT_DELTAS: Record<string, Delta> = {
  // baseline tier
  client: {},
  services: { scalability: 6, simplicity: 2 },
  database: { reliability: 8, simplicity: 0, scalability: -6 },

  // traffic / edge
  "load-balancer": { scalability: 18, reliability: 14, latency: 2, cost: -5, simplicity: -8, operability: -6 },
  cdn: { scalability: 12, reliability: 8, latency: 20, cost: -3, simplicity: -4, operability: -4 },
  dns: { reliability: 10, latency: 8, scalability: 5 },
  "api-gateway": { scalability: 8, reliability: 6, latency: -2, cost: -4, simplicity: -8, operability: -8 },
  "reverse-proxy": { reliability: 6, latency: 4, simplicity: -3, operability: -3 },

  // application
  microservices: { scalability: 14, reliability: 8, latency: -4, cost: -8, simplicity: -16, operability: -16 },
  kubernetes: { scalability: 12, reliability: 10, cost: -6, simplicity: -14, operability: -10 },

  // caching / data scaling
  cache: { scalability: 14, latency: 22, reliability: 2, cost: -4, simplicity: -8, operability: -8 },
  "read-replica": { scalability: 14, reliability: 10, latency: 6, cost: -8, simplicity: -6, operability: -8 },
  sharding: { scalability: 24, reliability: 4, latency: 4, cost: -6, simplicity: -22, operability: -20 },
  cqrs: { scalability: 12, latency: 8, simplicity: -16, operability: -12 },

  // messaging
  "message-queue": { scalability: 16, reliability: 12, latency: -2, cost: -6, simplicity: -10, operability: -10 },
  analytics: { scalability: 6, cost: -6, simplicity: -6, operability: -6 },

  // reliability
  "rate-limiter": { reliability: 8, simplicity: -2, operability: -2 },
  "circuit-breaker": { reliability: 12, simplicity: -2, operability: -2 },
  failover: { reliability: 16, cost: -6, simplicity: -6, operability: -8 },
  "multi-region": { reliability: 20, scalability: 10, latency: 12, cost: -16, simplicity: -16, operability: -18 },
  observability: { reliability: 10, operability: 14, cost: -4, simplicity: -4 },
};

/** Score an architecture (list of component ids) across the six axes. */
export function scoreArchitecture(componentIds: string[], baseline = 50): AxisScores {
  const scores = emptyScores(baseline);
  for (const id of componentIds) {
    const delta = COMPONENT_DELTAS[id];
    if (!delta) continue;
    for (const axis of AXIS_ORDER) {
      if (delta[axis]) scores[axis] += delta[axis]!;
    }
  }
  for (const axis of AXIS_ORDER) scores[axis] = clampScore(scores[axis]);
  return scores;
}
