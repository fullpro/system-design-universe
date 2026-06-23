"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { runAdvisor, type Recommendation } from "@/lib/reasoning/advisor";
import { REQUIREMENT_PRESETS, compact } from "@/lib/reasoning/requirements";
import { AXES, AXIS_ORDER } from "@/lib/reasoning/axes";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { Radar } from "./Radar";
import { Segmented, Field, Slider, LogSlider } from "./controls";

function accentFor(rec: Recommendation): string {
  const c = rec.conceptId ? getConcept(rec.conceptId) : undefined;
  return c ? CATEGORIES[c.category].accent : "#818cf8";
}

function RecCard({ rec, index }: { rec: Recommendation; index: number }) {
  const selectConcept = useUniverse((s) => s.selectConcept);
  const concept = rec.conceptId ? getConcept(rec.conceptId) : undefined;
  const accent = accentFor(rec);

  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.3 }}
      className="relative flex gap-3"
    >
      {/* rail */}
      <div className="flex flex-col items-center">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold"
          style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.4)}` }}
        >
          {concept ? <Icon name={concept.icon} size={15} /> : index + 1}
        </span>
        <span className="my-1 w-px flex-1" style={{ background: "var(--border)" }} />
      </div>

      <div className="sheen mb-2.5 flex-1 rounded-2xl p-3.5" style={{ background: "var(--panel)", border: `1px solid ${rgba(accent, 0.28)}` }}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-bold" style={{ color: "var(--text)" }}>{rec.label}</span>
          {rec.conceptId && (
            <button
              onClick={() => selectConcept(rec.conceptId!)}
              className="flex items-center gap-1 text-[11px] font-medium transition-colors hover:brightness-125"
              style={{ color: accent }}
            >
              deep dive <ArrowRight size={11} />
            </button>
          )}
        </div>
        <p className="mt-1 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{rec.reason}</p>
        <div className="mt-2 flex flex-col gap-1 text-[11.5px] leading-snug">
          <div style={{ color: "var(--text-faint)" }}><span style={{ color: "var(--good)" }}>Solves:</span> {rec.solves}</div>
          <div style={{ color: "var(--text-faint)" }}><span style={{ color: "var(--warn)" }}>Trade-off:</span> {rec.tradeoff}</div>
        </div>
        {rec.alternatives.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {rec.alternatives.map((alt) => (
              <span key={alt.name} title={alt.note} className="rounded-md px-1.5 py-0.5 text-[10.5px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>
                alt · {alt.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AdvisorView() {
  const requirements = useUniverse((s) => s.requirements);
  const setRequirements = useUniverse((s) => s.setRequirements);
  const applyRequirements = useUniverse((s) => s.applyRequirements);

  const result = useMemo(() => runAdvisor(requirements), [requirements]);
  const spine = result.recommendations.filter((r) => !r.crossCutting);
  const crossCutting = result.recommendations.filter((r) => r.crossCutting);
  // What the user's constraints weight most heavily — shown as the "why this fit".
  const drivers = AXIS_ORDER.filter((a) => (result.weights[a] ?? 1) >= 2)
    .sort((a, b) => (result.weights[b] ?? 1) - (result.weights[a] ?? 1))
    .map((a) => AXES[a].short);
  const fitColor = result.fit >= 75 ? "var(--good)" : result.fit >= 55 ? "#a5b4fc" : "var(--warn)";

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-4 px-3 py-4 sm:gap-6 sm:px-5 sm:py-6 lg:grid-cols-[340px_1fr]">
      {/* ── Inputs ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>Constraints</h2>
          <p className="text-[12px]" style={{ color: "var(--text-dim)" }}>Describe the system; the rules do the reasoning.</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {REQUIREMENT_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyRequirements(p.values)}
              title={p.blurb}
              className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all hover:brightness-125"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="sheen space-y-4 rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <Field label="Users" value={compact(requirements.users)}>
            <LogSlider value={requirements.users} lo={3} hi={8} onChange={(v) => setRequirements({ users: v })} />
          </Field>
          <Field label="Peak requests / sec" value={compact(requirements.rps)}>
            <LogSlider value={requirements.rps} lo={1} hi={5} onChange={(v) => setRequirements({ rps: v })} />
          </Field>
          <Field label="Read / Write ratio" value={`${requirements.readPct} / ${100 - requirements.readPct}`}>
            <Slider value={requirements.readPct} min={5} max={99} onChange={(v) => setRequirements({ readPct: v })} />
          </Field>
          <Field label="p99 latency target" value={`< ${requirements.latencyMs} ms`}>
            <Slider value={requirements.latencyMs} min={20} max={500} step={10} onChange={(v) => setRequirements({ latencyMs: v })} />
          </Field>
          <Field label="Traffic">
            <Segmented value={requirements.geo} options={[{ value: "regional", label: "Regional" }, { value: "global", label: "Global" }]} onChange={(v) => setRequirements({ geo: v })} />
          </Field>
          <Field label="Availability target">
            <Segmented value={requirements.availabilityNines} options={[{ value: 99, label: "99%" }, { value: 99.9, label: "99.9%" }, { value: 99.99, label: "99.99%" }, { value: 99.999, label: "99.999%" }]} onChange={(v) => setRequirements({ availabilityNines: v })} />
          </Field>
          <Field label="Consistency">
            <Segmented value={requirements.consistency} options={[{ value: "strong", label: "Strong" }, { value: "eventual", label: "Eventual" }, { value: "either", label: "Either" }]} onChange={(v) => setRequirements({ consistency: v })} />
          </Field>
          <Field label="Budget">
            <Segmented value={requirements.budget} options={[{ value: "lean", label: "Lean" }, { value: "balanced", label: "Balanced" }, { value: "premium", label: "Premium" }]} onChange={(v) => setRequirements({ budget: v })} />
          </Field>
        </div>
      </div>

      {/* ── Recommendation ── */}
      <div className="space-y-5">
        <div className="sheen flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(129,140,248,0.35)" }}>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles size={15} style={{ color: "#a5b4fc" }} />
              <span className="text-[13px] font-bold" style={{ color: "var(--text)" }}>Recommended architecture</span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{result.summary}</p>
            <p className="mt-1.5 text-[10.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
              Rule-based, no AI · scores are illustrative tradeoff weights, not benchmarks.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <div
              className="text-center"
              title="A weighted score: how well this design serves the constraints you set, rather than a flat average of opposing concerns."
            >
              <div className="text-3xl font-bold tabular-nums" style={{ color: fitColor }}>{result.fit}</div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>fit</div>
              {drivers.length > 0 && (
                <div className="mt-0.5 text-[9px] leading-tight" style={{ color: "var(--text-faint)" }}>
                  weighted for<br />{drivers.join(" · ")}
                </div>
              )}
            </div>
            <Radar scores={result.scores} size={180} />
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>The request path</div>
          {spine.map((rec, i) => (
            <RecCard key={rec.id} rec={rec} index={i} />
          ))}
        </div>

        {crossCutting.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              <ShieldCheck size={12} /> Reliability & ops layer
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {crossCutting.map((rec, i) => (
                <RecCard key={rec.id} rec={rec} index={spine.length + i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
