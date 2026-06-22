import type { Category, CategoryId } from "./types";

/**
 * Category metadata. The accent colour is the single source of truth for how a
 * concept is tinted everywhere it appears (nodes, edges, panels, legend).
 */
export const CATEGORIES: Record<CategoryId, Category> = {
  client: {
    id: "client",
    label: "Client",
    blurb: "Where every request begins — browsers, apps, devices.",
    accent: "#7dd3fc",
  },
  networking: {
    id: "networking",
    label: "Networking",
    blurb: "How packets find their way: DNS, TCP, TLS, HTTP.",
    accent: "#60a5fa",
  },
  edge: {
    id: "edge",
    label: "Edge",
    blurb: "Bringing content physically closer to users.",
    accent: "#22d3ee",
  },
  traffic: {
    id: "traffic",
    label: "Traffic Management",
    blurb: "Distributing and governing requests at the front door.",
    accent: "#a78bfa",
  },
  application: {
    id: "application",
    label: "Application",
    blurb: "Where business logic lives and runs.",
    accent: "#34d399",
  },
  cache: {
    id: "cache",
    label: "Caching",
    blurb: "Trading memory for latency — serve hot data fast.",
    accent: "#fb7185",
  },
  data: {
    id: "data",
    label: "Data",
    blurb: "Durable storage, consistency and the source of truth.",
    accent: "#fbbf24",
  },
  messaging: {
    id: "messaging",
    label: "Messaging",
    blurb: "Decoupling producers from consumers over time.",
    accent: "#f472b6",
  },
  scalability: {
    id: "scalability",
    label: "Scalability",
    blurb: "Strategies for handling more without falling over.",
    accent: "#818cf8",
  },
  reliability: {
    id: "reliability",
    label: "Reliability",
    blurb: "Staying up and correct when things go wrong.",
    accent: "#f87171",
  },
  observability: {
    id: "observability",
    label: "Observability",
    blurb: "Knowing what your system is actually doing.",
    accent: "#2dd4bf",
  },
  analytics: {
    id: "analytics",
    label: "Analytics",
    blurb: "Turning raw events into insight, offline.",
    accent: "#c084fc",
  },
  foundation: {
    id: "foundation",
    label: "Foundations",
    blurb: "The cross-cutting principles every design rests on.",
    accent: "#fb923c",
  },
};

export const CATEGORY_ORDER: CategoryId[] = [
  "client",
  "networking",
  "edge",
  "traffic",
  "application",
  "cache",
  "data",
  "messaging",
  "scalability",
  "reliability",
  "observability",
  "analytics",
  "foundation",
];

export function categoryAccent(id: CategoryId): string {
  return CATEGORIES[id].accent;
}
