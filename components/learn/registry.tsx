"use client";

import { Timer, Triangle, Database, Disc3, Split, Zap, Calculator } from "lucide-react";
import { LatencyVisualizer } from "./LatencyVisualizer";
import { CapExplorer } from "./CapExplorer";
import { SqlVsNoSql } from "./SqlVsNoSql";
import { ConsistentHashingRing } from "./ConsistentHashingRing";
import { LoadBalancerStrategies } from "./LoadBalancerStrategies";
import { CacheSimulator } from "./CacheSimulator";
import { CapacityEstimator } from "./CapacityEstimator";

export interface ToolDef {
  id: string;
  /** Concept whose internals page also surfaces this tool. */
  conceptId?: string;
  name: string;
  tagline: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
  render: () => React.ReactNode;
}

export const TOOLS: ToolDef[] = [
  {
    id: "estimator",
    name: "Capacity Estimator",
    tagline: "Back-of-the-envelope QPS, storage & bandwidth.",
    title: "Back-of-the-Envelope Capacity Estimator",
    subtitle: "The number sense every interview tests — and the architecture each magnitude forces.",
    accent: "#2dd4bf",
    icon: <Calculator size={18} />,
    render: () => <CapacityEstimator />,
  },
  {
    id: "ring",
    conceptId: "consistent-hashing",
    name: "Hash Ring",
    tagline: "Add a node, watch how few keys move.",
    title: "Consistent Hashing Ring",
    subtitle: "Why scaling a distributed cache or database doesn't wipe it.",
    accent: "#818cf8",
    icon: <Disc3 size={18} />,
    render: () => <ConsistentHashingRing />,
  },
  {
    id: "lb",
    conceptId: "load-balancer",
    name: "LB Strategies",
    tagline: "See how each algorithm spreads load.",
    title: "Load Balancer Strategies",
    subtitle: "Round robin, weighted, least-connections — and when each wins.",
    accent: "#a78bfa",
    icon: <Split size={18} />,
    render: () => <LoadBalancerStrategies />,
  },
  {
    id: "cache",
    conceptId: "cache",
    name: "Cache Simulator",
    tagline: "Dial the hit ratio, watch DB load fall.",
    title: "Cache Hit-Ratio Simulator",
    subtitle: "How a cache trades a little staleness for huge latency and load wins.",
    accent: "#fb7185",
    icon: <Zap size={18} />,
    render: () => <CacheSimulator />,
  },
  {
    id: "latency",
    name: "Latency Numbers",
    tagline: "Every duration, scaled to human time.",
    title: "Latency Numbers Every Programmer Should Know",
    subtitle: "The orders of magnitude that drive every caching and locality decision.",
    accent: "#f472b6",
    icon: <Timer size={18} />,
    render: () => <LatencyVisualizer />,
  },
  {
    id: "cap",
    conceptId: "cap-theorem",
    name: "CAP Explorer",
    tagline: "Pick CP or AP, see who chose what.",
    title: "CAP Theorem Explorer",
    subtitle: "During a network partition you must choose: consistency or availability.",
    accent: "#fb923c",
    icon: <Triangle size={18} />,
    render: () => <CapExplorer />,
  },
  {
    id: "sql",
    conceptId: "nosql",
    name: "SQL vs NoSQL",
    tagline: "Answer four questions, get a pick.",
    title: "SQL vs NoSQL",
    subtitle: "A quick heuristic — the real answer is always 'it depends', but this points the way.",
    accent: "#fbbf24",
    icon: <Database size={18} />,
    render: () => <SqlVsNoSql />,
  },
];

export const TOOL_BY_CONCEPT: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.filter((t) => t.conceptId).map((t) => [t.conceptId as string, t]),
);
