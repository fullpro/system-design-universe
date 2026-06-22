/**
 * Design Studio analysis — the live "architecture review" behind the freeform
 * builder. Given the set of components a user has placed (and how they wired
 * them), it scores the design on the six axes and runs a rule-based linter that
 * flags single points of failure, missing caches, exposed datastores and other
 * classic mistakes — then grades the whole thing. Pure and deterministic.
 */

import { scoreArchitecture } from "./reasoning/scoring";
import { overallScore, type AxisScores } from "./reasoning/axes";
import { getConcept } from "./concepts";

/** Components a user can drop onto the canvas (deployable boxes, not patterns). */
export const BUILDABLE: string[] = [
  "client",
  "dns",
  "cdn",
  "reverse-proxy",
  "load-balancer",
  "api-gateway",
  "services",
  "kubernetes",
  "cache",
  "database",
  "nosql",
  "read-replica",
  "sharding",
  "message-queue",
  "task-queue",
  "analytics",
  "rate-limiter",
  "circuit-breaker",
  "observability",
].filter((id) => getConcept(id));

export type Severity = "high" | "medium" | "low" | "good";

export interface DesignIssue {
  id: string;
  severity: Severity;
  title: string;
  fix?: string;
}

export interface DesignEdge {
  source: string; // concept id
  target: string; // concept id
}

export interface DesignAnalysis {
  score: AxisScores;
  issues: DesignIssue[];
  readiness: number;
  grade: string;
  gradeLabel: string;
  componentCount: number;
}

const DATASTORES = new Set(["database", "nosql"]);
const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2, good: 3 };

export function analyzeDesign(ids: string[], edges: DesignEdge[]): DesignAnalysis {
  const set = new Set(ids);
  const has = (id: string) => set.has(id);
  const count = ids.length;
  const issues: DesignIssue[] = [];

  // ── Structural rules (component set) ──────────────────────────────
  if (count > 0 && !has("client"))
    issues.push({ id: "no-client", severity: "low", title: "No client in the design.", fix: "Every request originates somewhere — add a Client as the entry point." });

  if (has("services") && !has("load-balancer"))
    issues.push({ id: "no-lb", severity: "high", title: "App tier has no load balancer.", fix: "A single app server is a single point of failure and a hard capacity ceiling. Put a load balancer in front of a horizontal pool." });

  if (has("database") && !has("cache"))
    issues.push({ id: "no-cache", severity: "medium", title: "No cache in front of the database.", fix: "Repeated hot reads will pound the primary. A cache absorbs them and collapses read latency." });

  if (has("database") && !has("read-replica") && !has("sharding"))
    issues.push({ id: "db-spof", severity: "medium", title: "Single database — no replica or shard.", fix: "It's a single point of failure for your data and caps read throughput. Add read replicas (and shard once writes dominate)." });

  if (has("services") && count >= 6 && !has("api-gateway") && !has("reverse-proxy"))
    issues.push({ id: "no-gateway", severity: "medium", title: "Many components, no API gateway.", fix: "Centralise auth, rate limiting and routing at the edge instead of re-implementing them in every service." });

  if (count >= 6 && !has("observability"))
    issues.push({ id: "no-obs", severity: "medium", title: "No observability at this complexity.", fix: "You'll be debugging a distributed system blind. Add logs, metrics and traces." });

  if (has("message-queue") && !has("services") && !has("analytics") && !has("task-queue"))
    issues.push({ id: "queue-no-consumer", severity: "low", title: "A message queue with nothing consuming it.", fix: "Add a service or worker pool that processes the messages." });

  if (has("sharding") && !has("database") && !has("nosql"))
    issues.push({ id: "shard-no-db", severity: "low", title: "Sharding with no database to shard.", fix: "Add the datastore you intend to partition." });

  if (has("kubernetes") && !has("services"))
    issues.push({ id: "k8s-no-svc", severity: "low", title: "Kubernetes with nothing to orchestrate.", fix: "K8s schedules containers — add the services it should run." });

  // ── Topology rules (wiring) ───────────────────────────────────────
  if (edges.some((e) => e.source === "client" && DATASTORES.has(e.target)))
    issues.push({ id: "client-db", severity: "high", title: "A client is wired straight to the database.", fix: "Never expose your datastore to clients. Route through an app tier, and ideally a gateway / load balancer." });

  // ── Positive signals ──────────────────────────────────────────────
  if (has("load-balancer") && (has("read-replica") || has("sharding")) && has("observability"))
    issues.push({ id: "good-backbone", severity: "good", title: "Solid backbone: redundant app tier, scaled data, and you can see what's happening." });

  if (has("cache") && has("cdn"))
    issues.push({ id: "good-cache", severity: "good", title: "Layered caching (CDN + app cache) — most reads never reach your origin." });

  if (has("circuit-breaker") || has("rate-limiter"))
    issues.push({ id: "good-resil", severity: "good", title: "Resilience patterns in place — failure and abuse are contained, not amplified." });

  // ── Score & grade ─────────────────────────────────────────────────
  const score = scoreArchitecture(ids);
  let readiness = count === 0 ? 0 : overallScore(score);
  for (const i of issues) {
    if (i.severity === "high") readiness -= 14;
    else if (i.severity === "medium") readiness -= 7;
    else if (i.severity === "low") readiness -= 3;
    else readiness += 5;
  }
  readiness = Math.max(0, Math.min(100, Math.round(readiness)));

  const [grade, gradeLabel] =
    count === 0
      ? ["—", "Start designing"]
      : readiness >= 85
        ? ["A", "Production-ready"]
        : readiness >= 70
          ? ["B", "Solid — a few gaps"]
          : readiness >= 55
            ? ["C", "Workable, needs hardening"]
            : readiness >= 40
              ? ["D", "Fragile"]
              : ["F", "Will fall over"];

  issues.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  return { score, issues, readiness, grade, gradeLabel, componentCount: count };
}
