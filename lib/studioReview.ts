/**
 * Design Studio — review engine v2.
 *
 * Unlike the v1 scorer (which graded the *inventory* of components present),
 * this reviews the *graph*: it traces request paths from clients to datastores
 * and derives findings from topology, not from which named boxes exist. A
 * component only earns its benefit when it is wired in correctly (a cache helps
 * only when it sits on a read path; a replica helps only when replication-wired).
 *
 * The verdict is **intent-relative**: you state a rough target (users, rps,
 * read/write, availability) and the same design is judged against *that* — so a
 * lean monolith reads as excellent for an MVP and weak for global scale.
 */

import { type Requirements, REQUIREMENT_PRESETS, compact } from "./reasoning/requirements";
import { deriveAxisWeights } from "./reasoning/advisor";
import { type AxisScores, emptyScores, clampScore, weightedFit, AXIS_ORDER } from "./reasoning/axes";
import type { NodeKind, EdgeKind } from "./studioTypes";

export interface ReviewNode {
  id: string;
  kind: NodeKind;
  label: string;
  conceptId?: string;
}
export interface ReviewEdge {
  source: string;
  target: string;
  kind: EdgeKind;
}

export type Severity = "high" | "medium" | "low" | "good";
export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  fix?: string;
}

export type ReviewState = "empty" | "draft" | "reviewable";

export interface DesignReview {
  state: ReviewState;
  hint?: string;
  findings: Finding[];
  scores: AxisScores;
  fit: number;
  grade: string;
  gradeLabel: string;
  scoredCount: number;
  unscoredCount: number;
  intentSummary: string;
}

export const DEFAULT_TARGET: Requirements = REQUIREMENT_PRESETS[1].values; // "Growing Product"

const SEV_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2, good: 3 };
const isScored = (k: NodeKind) => k !== "note" && k !== "other" && k !== "boundary";

export function reviewDesign(nodes: ReviewNode[], edges: ReviewEdge[], target: Requirements): DesignReview {
  const baseScores = emptyScores(50);
  const intentSummary = buildIntent(target);

  if (nodes.length === 0) {
    return {
      state: "empty",
      hint: "Drop a client, a service and a datastore, then wire a request from the client to the store — I'll review the path.",
      findings: [],
      scores: baseScores,
      fit: 0,
      grade: "—",
      gradeLabel: "Start designing",
      scoredCount: 0,
      unscoredCount: 0,
      intentSummary,
    };
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out = new Map<string, ReviewEdge[]>();
  const connected = new Set<string>();
  for (const e of edges) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue;
    if (!out.has(e.source)) out.set(e.source, []);
    out.get(e.source)!.push(e);
    connected.add(e.source);
    connected.add(e.target);
  }

  const kindOf = (id: string) => byId.get(id)?.kind;
  const nodesOf = (k: NodeKind) => nodes.filter((n) => n.kind === k);
  const sources = nodes.filter((n) => n.kind === "client" || n.kind === "external");
  const datastores = nodesOf("datastore");

  // Reachability from a set of starting node ids (directed BFS).
  const reach = (starts: string[]): Set<string> => {
    const seen = new Set<string>(starts);
    const stack = [...starts];
    while (stack.length) {
      const id = stack.pop()!;
      for (const e of out.get(id) ?? []) {
        if (!seen.has(e.target)) {
          seen.add(e.target);
          stack.push(e.target);
        }
      }
    }
    return seen;
  };

  const fromSources = reach(sources.map((s) => s.id));
  const reachableStore = datastores.find((d) => fromSources.has(d.id));
  const hasRequestPath = Boolean(sources.length && reachableStore);

  const scoredNodes = nodes.filter((n) => isScored(n.kind));
  const scoredCount = scoredNodes.length;
  const unscoredCount = nodes.length - scoredCount;

  // ── Draft gate: no grade until there's a real request path ──────────────
  if (!hasRequestPath) {
    const hint = !sources.length
      ? "Add a Client (or External caller) — every request has to start somewhere."
      : !datastores.length
        ? "Add a Datastore — then wire a path to it so I can trace where data lives."
        : "Connect a request path: drag an edge from the client through your services to the datastore.";
    return {
      state: "draft",
      hint,
      findings: orphanFindings(nodes, connected),
      scores: baseScores,
      fit: 0,
      grade: "—",
      gradeLabel: "Draft — keep going",
      scoredCount,
      unscoredCount,
      intentSummary,
    };
  }

  // ── Topology features ───────────────────────────────────────────────────
  const computeReachable = nodes.some((n) => n.kind === "compute" && fromSources.has(n.id));
  const proxyExists = nodesOf("proxy").length > 0;
  const gatewayExists = nodesOf("gateway").length > 0;
  const obsExists = nodesOf("observability").length > 0;
  const edgeExists = nodesOf("edge").length > 0;
  const computeCount = nodesOf("compute").length;
  const hasReplication = edges.some((e) => e.kind === "replication");
  const redundantData = datastores.length >= 2 || hasReplication;

  // Cache on a read path: a cache reachable from a source that itself reaches a store.
  const cacheOnPath = nodesOf("cache").some((c) => fromSources.has(c.id) && reach([c.id]).has(reachableStore!.id));
  const asyncIntoQueue = edges.some((e) => e.kind === "async" && kindOf(e.target) === "queue");
  const queueExists = nodesOf("queue").length > 0;

  // ── Findings ────────────────────────────────────────────────────────────
  const findings: Finding[] = [];
  const add = (f: Finding) => findings.push(f);

  // Exposed datastore (direct client/external → datastore).
  if (edges.some((e) => (kindOf(e.source) === "client" || kindOf(e.source) === "external") && kindOf(e.target) === "datastore"))
    add({ id: "exposed-store", severity: "high", title: "A datastore is exposed directly to a client.", fix: "Never let clients reach a store directly. Route through a service (and ideally a gateway / load balancer)." });

  // Compute with nothing balancing it.
  if (computeReachable && !proxyExists)
    add({ id: "no-proxy", severity: "high", title: "Services sit behind no load balancer.", fix: "A single instance is a SPOF and a hard capacity ceiling. Put a load balancer in front of a horizontal pool." });

  // Single datastore, no redundancy.
  if (!redundantData)
    add({ id: "db-spof", severity: "medium", title: "Single datastore — no replica or replication.", fix: "It's a single point of failure for your data and caps read throughput. Add a replica (replication edge) or a second store." });

  // No cache on the read path.
  if (!cacheOnPath)
    add({ id: "no-cache", severity: "medium", title: "Reads reach the datastore with no cache in front.", fix: "Repeated hot reads pound the store. Put a cache on the read path (client → … → cache → store)." });

  // Observability at complexity.
  if (computeCount >= 3 && !obsExists)
    add({ id: "no-obs", severity: "medium", title: "No observability at this complexity.", fix: "You'll debug a distributed system blind. Add logs, metrics and traces." });

  // Gateway at complexity.
  if (computeCount >= 3 && !gatewayExists && !proxyExists)
    add({ id: "no-gateway", severity: "low", title: "Several services, no gateway.", fix: "Centralise auth, rate-limiting and routing at the edge instead of in every service." });

  // Synchronous call into a queue.
  if (edges.some((e) => e.kind === "sync" && kindOf(e.target) === "queue"))
    add({ id: "sync-queue", severity: "low", title: "A synchronous call feeds a queue.", fix: "Queues exist to decouple. Make the edge async/event so the caller doesn't block on the consumer." });

  // Orphans.
  orphanFindings(nodes, connected).forEach(add);

  // Unreviewed elements.
  if (unscoredCount > 0)
    add({ id: "unreviewed", severity: "low", title: `${unscoredCount} element${unscoredCount > 1 ? "s" : ""} drawn but not reviewed.`, fix: "Notes, zones and 'Other' nodes are for communication — they don't factor into the score." });

  // ── Positive signals ─────────────────────────────────────────────────────
  if (proxyExists && redundantData && obsExists)
    add({ id: "good-backbone", severity: "good", title: "Solid backbone: balanced compute, redundant data, and you can see what's happening." });
  if (cacheOnPath && edgeExists)
    add({ id: "good-cache", severity: "good", title: "Layered caching (edge + app cache) — most reads never reach the origin." });
  if (queueExists && asyncIntoQueue)
    add({ id: "good-async", severity: "good", title: "Async decoupling in place — spikes are absorbed, not amplified." });

  // ── Scoring (topology-gated, then intent-weighted) ───────────────────────
  const s = { ...baseScores };
  const bump = (axis: keyof AxisScores, d: number) => {
    s[axis] += d;
  };

  if (computeReachable) bump("scalability", 4);
  if (proxyExists && computeReachable) {
    bump("scalability", 14);
    bump("reliability", 12);
    bump("simplicity", -6);
    bump("operability", -4);
  }
  if (edgeExists) {
    bump("latency", 14);
    bump("scalability", 8);
    bump("reliability", 6);
  }
  if (cacheOnPath) {
    bump("latency", 18);
    bump("scalability", 10);
    bump("simplicity", -6);
  }
  if (redundantData) {
    bump("reliability", 14);
    bump("scalability", 6);
    bump("simplicity", -4);
  } else {
    bump("reliability", 6);
    bump("scalability", -4);
  }
  if (queueExists && asyncIntoQueue) {
    bump("scalability", 14);
    bump("reliability", 8);
    bump("simplicity", -8);
    bump("operability", -8);
  }
  if (gatewayExists) {
    bump("scalability", 4);
    bump("reliability", 5);
    bump("simplicity", -6);
    bump("operability", -6);
  }
  if (obsExists) {
    bump("operability", 14);
    bump("reliability", 8);
    bump("simplicity", -3);
  }
  // Penalties for the worst findings, on the axes they actually hurt.
  for (const f of findings) {
    if (f.id === "exposed-store") {
      bump("reliability", -16);
    } else if (f.id === "no-proxy") {
      bump("reliability", -16);
      bump("scalability", -10);
    } else if (f.id === "db-spof") {
      bump("reliability", -12);
    } else if (f.id === "no-cache") {
      bump("latency", -10);
      bump("scalability", -6);
    } else if (f.id === "no-obs") {
      bump("operability", -10);
    }
  }
  for (const a of AXIS_ORDER) s[a] = clampScore(s[a]);

  const fit = weightedFit(s, deriveAxisWeights(target));
  const [grade, gradeLabel] = gradeFor(fit, findings);

  findings.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);

  return {
    state: "reviewable",
    findings,
    scores: s,
    fit,
    grade,
    gradeLabel,
    scoredCount,
    unscoredCount,
    intentSummary,
  };
}

function orphanFindings(nodes: ReviewNode[], connected: Set<string>): Finding[] {
  const orphans = nodes.filter((n) => isScored(n.kind) && !connected.has(n.id));
  if (orphans.length === 0) return [];
  const names = orphans.slice(0, 3).map((o) => o.label).join(", ");
  return [{
    id: "orphans",
    severity: "low",
    title: orphans.length === 1 ? `"${names}" isn't wired to anything.` : `${orphans.length} components aren't wired to anything (${names}${orphans.length > 3 ? "…" : ""}).`,
    fix: "Connect it into a flow, or it's just decoration — disconnected nodes don't count toward the design.",
  }];
}

function gradeFor(fit: number, findings: Finding[]): [string, string] {
  const hasHigh = findings.some((f) => f.severity === "high");
  if (hasHigh && fit >= 70) return ["C", "Has a critical flaw to fix"];
  if (fit >= 85) return ["A", "Strong fit for the target"];
  if (fit >= 70) return ["B", "Solid — a few gaps"];
  if (fit >= 55) return ["C", "Workable, needs hardening"];
  if (fit >= 40) return ["D", "Thin for this target"];
  return ["F", "Under-built for this target"];
}

function buildIntent(t: Requirements): string {
  const d = `${compact(t.users)} users · ~${compact(t.rps)} rps · ${t.readPct}% reads · ${t.geo}`;
  return d;
}
