"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Boxes } from "lucide-react";
import type { DesignAnalysis, Severity } from "@/lib/studio";
import { Radar } from "@/components/reason/Radar";

const SEV: Record<Severity, { color: string; bg: string; icon: React.ReactNode }> = {
  high: { color: "#f87171", bg: "rgba(248,113,113,0.1)", icon: <AlertTriangle size={13} /> },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", icon: <AlertCircle size={13} /> },
  low: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", icon: <Info size={13} /> },
  good: { color: "#34d399", bg: "rgba(52,211,153,0.1)", icon: <CheckCircle2 size={13} /> },
};

const GRADE_COLOR: Record<string, string> = { A: "#34d399", B: "#a3e635", C: "#fbbf24", D: "#fb923c", F: "#f87171", "—": "#5a6379" };

export function StudioAnalysis({ analysis }: { analysis: DesignAnalysis }) {
  const { score, issues, readiness, grade, gradeLabel, componentCount } = analysis;
  const gradeColor = GRADE_COLOR[grade] ?? "#818cf8";

  return (
    <div className="glass sheen flex h-full w-[330px] shrink-0 flex-col rounded-2xl">
      <div className="scroll-fade min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Live review</div>

        {componentCount === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 px-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(99,102,241,0.14)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
              <Boxes size={24} strokeWidth={1.7} />
            </span>
            <p className="text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
              Click components from the palette to start designing. Drag to arrange them, and drag from a node's edge to wire them together.
            </p>
            <p className="text-[11.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
              Your design is scored and reviewed live, the moment you place a component.
            </p>
          </div>
        ) : (
          <>
            {/* Grade + readiness */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold" style={{ background: `${gradeColor}1f`, color: gradeColor, border: `1.5px solid ${gradeColor}66` }}>
                {grade}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-bold leading-tight" style={{ color: "var(--text)" }}>{gradeLabel}</div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${readiness}%`, background: gradeColor }} />
                </div>
                <div className="mt-1 text-[10.5px] tabular-nums" style={{ color: "var(--text-faint)" }}>readiness {readiness}/100 · {componentCount} components</div>
              </div>
            </div>

            {/* Radar */}
            <div className="mt-3 flex justify-center">
              <Radar scores={score} size={210} accent="#818cf8" />
            </div>

            {/* Issues */}
            <div className="mt-1 space-y-1.5">
              <AnimatePresence initial={false}>
                {issues.map((issue) => {
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
          </>
        )}
      </div>
    </div>
  );
}
