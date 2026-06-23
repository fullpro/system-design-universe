"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Boxes, Gauge, Target } from "lucide-react";
import type { DesignReview, Severity } from "@/lib/studioReview";
import { REQUIREMENT_PRESETS, type Requirements } from "@/lib/reasoning/requirements";
import { Radar } from "@/components/reason/Radar";

const SEV: Record<Severity, { color: string; bg: string; icon: React.ReactNode }> = {
  high: { color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: <AlertTriangle size={13} /> },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: <AlertCircle size={13} /> },
  low: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", icon: <Info size={13} /> },
  good: { color: "#34d399", bg: "rgba(52,211,153,0.1)", icon: <CheckCircle2 size={13} /> },
};

const GRADE_COLOR: Record<string, string> = { A: "#34d399", B: "#a3e635", C: "#fbbf24", D: "#fb923c", F: "#f87171", "—": "#757e95" };

interface Props {
  review: DesignReview;
  target: Requirements;
  onTarget: (r: Requirements) => void;
  onStressTest: () => void;
}

export function StudioAnalysis({ review, target, onTarget, onStressTest }: Props) {
  const { state, hint, findings, scores, fit, grade, gradeLabel, scoredCount, unscoredCount, intentSummary } = review;
  const gradeColor = GRADE_COLOR[grade] ?? "#818cf8";

  return (
    <div className="flex w-full shrink-0 flex-col sm:glass sm:sheen sm:h-full sm:w-[330px] sm:rounded-2xl">
      <div className="scroll-fade min-h-0 flex-1 overflow-y-auto p-4">
        {/* Intent target — the design is judged relative to this. */}
        <div className="mb-3 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
            <Target size={11} /> Judged for
          </div>
          <div className="mt-0.5 text-[11.5px] font-medium" style={{ color: "var(--text)" }}>{intentSummary}</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {REQUIREMENT_PRESETS.map((p) => {
              const active = p.values === target;
              return (
                <button
                  key={p.id}
                  onClick={() => onTarget(p.values)}
                  title={p.blurb}
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors"
                  style={{ background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(129,140,248,0.5)" : "var(--border)"}`, color: active ? "#c7d2fe" : "var(--text-dim)" }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {state === "empty" && (
          <div className="mt-6 flex flex-col items-center gap-3 px-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(99,102,241,0.14)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
              <Boxes size={24} strokeWidth={1.7} />
            </span>
            <p className="text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{hint}</p>
            <p className="text-[11.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
              Pick from <b>Custom</b> to build anything (label it, double-click to rename) or drop a known component. Click any edge to set its type.
            </p>
          </div>
        )}

        {state === "draft" && (
          <>
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(251,191,36,0.16)", color: "var(--warn)" }}>
                <AlertCircle size={18} />
              </span>
              <div>
                <div className="text-[13px] font-bold" style={{ color: "var(--text)" }}>Draft — not yet reviewable</div>
                <div className="text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{hint}</div>
              </div>
            </div>
            <FindingList findings={findings} />
          </>
        )}

        {state === "reviewable" && (
          <>
            {/* Verdict headline */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold" style={{ background: `${gradeColor}1f`, color: gradeColor, border: `1.5px solid ${gradeColor}66` }}>
                {grade}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-bold leading-tight" style={{ color: "var(--text)" }}>{gradeLabel}</div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${fit}%`, background: gradeColor }} />
                </div>
                <div className="mt-1 text-[10.5px] tabular-nums" style={{ color: "var(--text-faint)" }}>
                  fit {fit}/100 · {scoredCount} reviewed{unscoredCount > 0 ? ` · ${unscoredCount} not scored` : ""}
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-center">
              <Radar scores={scores} size={208} accent="#818cf8" />
            </div>

            <button
              onClick={onStressTest}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12.5px] font-semibold transition-all hover:brightness-110"
              style={{ background: "rgba(129,140,248,0.18)", border: "1px solid rgba(129,140,248,0.45)", color: "#c7d2fe" }}
            >
              <Gauge size={14} /> Stress-test this design
            </button>

            <FindingList findings={findings} />
          </>
        )}
      </div>
    </div>
  );
}

function FindingList({ findings }: { findings: DesignReview["findings"] }) {
  if (findings.length === 0) return null;
  return (
    <div className="mt-3 space-y-1.5">
      <AnimatePresence initial={false}>
        {findings.map((issue) => {
          const s = SEV[issue.severity];
          return (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl px-3 py-2"
              style={{ background: s.bg, border: `1px solid ${s.color}33` }}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0" style={{ color: s.color }}>{s.icon}</span>
                <div>
                  <div className="text-[12px] font-semibold leading-snug" style={{ color: "var(--text)" }}>{issue.title}</div>
                  {issue.fix && <div className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--text-dim)" }}>{issue.fix}</div>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
