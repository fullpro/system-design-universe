"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, LifeBuoy, ArrowRight } from "lucide-react";
import {
  FAIL_NODES,
  FAIL_EDGES,
  FAILURE_ACTIONS,
  computeFailureState,
  type NodeStatus,
} from "@/lib/reasoning/failure";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { rgba } from "@/lib/color";
import { useUniverse } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";

const W = 600;
const H = 430;

const STATUS_COLOR: Record<NodeStatus, string> = {
  healthy: "#818cf8",
  degraded: "#fbbf24",
  down: "#ef4444",
  failover: "#fb923c",
};

function metricColor(kind: "avail" | "p99" | "err" | "tp", v: number): string {
  if (kind === "avail") return v >= 0.999 ? "#34d399" : v >= 0.99 ? "#fbbf24" : "#ef4444";
  if (kind === "p99") return v < 300 ? "#34d399" : v < 1000 ? "#fbbf24" : "#ef4444";
  if (kind === "err") return v < 0.01 ? "#34d399" : v < 0.05 ? "#fbbf24" : "#ef4444";
  return v >= 0.9 ? "#34d399" : v >= 0.6 ? "#fbbf24" : "#ef4444";
}

const center = Object.fromEntries(FAIL_NODES.map((n) => [n.id, { x: n.x, y: n.y }]));

export function FailureView() {
  const [active, setActive] = useState<Set<string>>(new Set());
  const selectConcept = useUniverse((s) => s.selectConcept);
  const fs = useMemo(() => computeFailureState(active), [active]);

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const Metric = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <div className="sheen rounded-xl p-2.5" style={{ background: "var(--panel)", border: `1px solid ${color}44` }}>
      <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{label}</div>
      <div className="mt-0.5 text-[18px] font-bold tabular-nums" style={{ color }}>{value}</div>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-4 px-3 py-4 sm:gap-6 sm:px-5 sm:py-6 lg:grid-cols-[260px_1fr]">
      {/* actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>Break it</h2>
            <p className="text-[12px]" style={{ color: "var(--text-dim)" }}>What happens when things go wrong?</p>
          </div>
          {active.size > 0 && (
            <button onClick={() => setActive(new Set())} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}>
              <RotateCcw size={12} /> Heal
            </button>
          )}
        </div>
        <div className="space-y-2">
          {FAILURE_ACTIONS.map((a) => {
            const on = active.has(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggle(a.id)}
                title={a.blurb}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all"
                style={{
                  background: on ? "rgba(239,68,68,0.14)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${on ? "rgba(239,68,68,0.55)" : "var(--border)"}`,
                  color: on ? "#fca5a5" : "var(--text-dim)",
                }}
              >
                <Icon name={a.icon} size={15} />
                <span className="text-[12.5px] font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* impact */}
      <div className="space-y-5">
        {/* metrics */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Metric label="Availability" value={`${(fs.metrics.availability * 100).toFixed(fs.metrics.availability >= 0.999 ? 2 : 1)}%`} color={metricColor("avail", fs.metrics.availability)} />
          <Metric label="p99 latency" value={fs.metrics.p99 > 0 ? `${fs.metrics.p99} ms` : "—"} color={metricColor("p99", fs.metrics.p99 || 130)} />
          <Metric label="Error rate" value={`${(fs.metrics.errorRate * 100).toFixed(1)}%`} color={metricColor("err", fs.metrics.errorRate)} />
          <Metric label="Throughput" value={`${Math.round(fs.metrics.throughput * 100)}%`} color={metricColor("tp", fs.metrics.throughput)} />
        </div>

        {/* graph */}
        <div className="sheen overflow-x-auto rounded-2xl p-3" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <div className="relative mx-auto" style={{ width: W, height: H }}>
            <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0">
              {FAIL_EDGES.map((e) => {
                const a = center[e.source];
                const b = center[e.target];
                const broken = fs.brokenEdges.has(e.id);
                const degraded = fs.status[e.source] === "degraded" || fs.status[e.target] === "degraded";
                const color = broken ? "#ef4444" : degraded ? "#fbbf24" : "#6366f1";
                return (
                  <line
                    key={e.id}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={color}
                    strokeWidth={broken ? 1.5 : 2}
                    strokeOpacity={broken ? 0.7 : 0.4}
                    strokeDasharray={broken ? "5 5" : undefined}
                  />
                );
              })}
              {fs.rerouted.map((r, i) => {
                const a = center[r.source];
                const b = center[r.target];
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fb923c" strokeWidth={2.5} strokeDasharray="6 4" strokeOpacity={0.9} />;
              })}
            </svg>

            {FAIL_NODES.map((n) => {
              const st = fs.status[n.id];
              const color = STATUS_COLOR[st];
              const concept = n.conceptId ? getConcept(n.conceptId) : undefined;
              const baseAccent = concept ? CATEGORIES[concept.category].accent : "#818cf8";
              const border = st === "healthy" ? rgba(baseAccent, 0.4) : color;
              return (
                <button
                  key={n.id}
                  onClick={() => n.conceptId && selectConcept(n.conceptId)}
                  className="absolute flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
                  style={{
                    left: n.x, top: n.y, transform: "translate(-50%,-50%)",
                    background: st === "down" ? "rgba(239,68,68,0.12)" : st === "healthy" ? "var(--panel-solid)" : rgba(color, 0.12),
                    border: `1px solid ${border}`,
                    opacity: st === "down" ? 0.65 : 1,
                    boxShadow: st === "failover" ? `0 0 16px -2px ${color}` : undefined,
                  }}
                >
                  {concept && <Icon name={concept.icon} size={13} style={{ color: st === "healthy" ? baseAccent : color }} />}
                  <span className="text-[11.5px] font-semibold" style={{ color: "var(--text)", textDecoration: st === "down" ? "line-through" : undefined }}>{n.label}</span>
                  {(st === "down" || st === "failover" || st === "degraded") && (
                    <span className="rounded px-1 text-[8px] font-bold uppercase" style={{ background: rgba(color, 0.2), color }}>
                      {st === "down" ? "down" : st === "failover" ? "fail-over" : "hot"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* cascade log */}
        <div className="sheen rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
            <AlertTriangle size={12} /> Cascade
          </div>
          <div className="space-y-2">
            {fs.cascades.map((c, i) => (
              <motion.div key={c} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
                <ArrowRight size={13} className="mt-0.5 shrink-0" style={{ color: "#f87171" }} />
                {c}
              </motion.div>
            ))}
          </div>
          {fs.recovery.length > 0 && (
            <div className="mt-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                <LifeBuoy size={12} /> Failover & recovery
              </div>
              <div className="space-y-2">
                {fs.recovery.map((r) => (
                  <div key={r} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
                    <ArrowRight size={13} className="mt-0.5 shrink-0" style={{ color: "#34d399" }} />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
