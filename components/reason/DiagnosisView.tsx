"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, ChevronLeft, ChevronRight, Check, X, Lightbulb, Wrench, ArrowRight } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { SCENARIOS, type MetricStatus } from "@/lib/reasoning/scenarios";

const STATUS_COLOR: Record<MetricStatus, string> = { good: "#34d399", warn: "#fbbf24", bad: "#f87171" };

export function DiagnosisView() {
  const index = useUniverse((s) => s.scenarioIndex);
  const selected = useUniverse((s) => s.diagSelected);
  const revealed = useUniverse((s) => s.diagRevealed);
  const answer = useUniverse((s) => s.answerScenario);
  const goto = useUniverse((s) => s.gotoScenario);
  const selectConcept = useUniverse((s) => s.selectConcept);

  const sc = SCENARIOS[index];
  const correct = revealed && selected === sc.correctId;

  return (
    <div className="mx-auto max-w-[820px] px-5 py-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>Bottleneck Diagnosis</h2>
          <p className="text-[12px]" style={{ color: "var(--text-dim)" }}>Read the symptoms. Find the real cause.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] tabular-nums" style={{ color: "var(--text-faint)" }}>{index + 1} / {SCENARIOS.length}</span>
          <button onClick={() => goto(index - 1)} disabled={index === 0} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors enabled:hover:bg-white/10 disabled:opacity-30" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => goto(index + 1)} disabled={index === SCENARIOS.length - 1} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors enabled:hover:bg-white/10 disabled:opacity-30" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={sc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          <div className="sheen rounded-2xl p-5" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
            <h3 className="text-[17px] font-bold" style={{ color: "var(--text)" }}>{sc.title}</h3>
            <p className="mt-1 text-[13px] leading-snug" style={{ color: "var(--text-dim)" }}>{sc.context}</p>

            {/* metrics */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {sc.metrics.map((m) => (
                <div key={m.label} className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${STATUS_COLOR[m.status]}33` }}>
                  <div className="flex items-center gap-1.5">
                    <Activity size={11} style={{ color: STATUS_COLOR[m.status] }} />
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{m.label}</span>
                  </div>
                  <div className="mt-1 text-[15px] font-bold tabular-nums" style={{ color: STATUS_COLOR[m.status] }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* question + options */}
            <div className="mt-5 text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>{sc.question}</div>
            <div className="mt-2.5 space-y-2">
              {sc.options.map((opt) => {
                const isCorrect = opt.id === sc.correctId;
                const isSelected = opt.id === selected;
                let border = "var(--border)";
                let bg = "rgba(255,255,255,0.03)";
                let icon = null;
                if (revealed) {
                  if (isCorrect) { border = "rgba(52,211,153,0.6)"; bg = "rgba(52,211,153,0.1)"; icon = <Check size={15} style={{ color: "var(--good)" }} />; }
                  else if (isSelected) { border = "rgba(248,113,113,0.6)"; bg = "rgba(248,113,113,0.1)"; icon = <X size={15} style={{ color: "var(--bad)" }} />; }
                }
                return (
                  <button
                    key={opt.id}
                    onClick={() => answer(opt.id)}
                    disabled={revealed}
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-[13px] transition-all enabled:hover:border-white/25"
                    style={{ background: bg, border: `1px solid ${border}`, color: "var(--text)", cursor: revealed ? "default" : "pointer" }}
                  >
                    <span>{opt.label}</span>
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* explanation */}
          <AnimatePresence>
            {revealed && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                <div className="sheen mt-3 rounded-2xl p-5" style={{ background: "var(--panel)", border: `1px solid ${correct ? "rgba(52,211,153,0.35)" : "rgba(248,113,113,0.35)"}` }}>
                  <div className="flex items-center gap-2 text-[13px] font-bold" style={{ color: correct ? "var(--good)" : "var(--bad)" }}>
                    {correct ? <Check size={16} /> : <X size={16} />}
                    {correct ? "Correct" : "Not quite — here's the real cause"}
                  </div>
                  <div className="mt-3 space-y-3 text-[12.5px] leading-relaxed">
                    <div><span className="font-semibold" style={{ color: "var(--text)" }}>Root cause. </span><span style={{ color: "var(--text-dim)" }}>{sc.rootCause}</span></div>
                    <div><span className="font-semibold" style={{ color: "var(--text)" }}>Evidence. </span><span style={{ color: "var(--text-dim)" }}>{sc.evidence}</span></div>
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}><Wrench size={12} /> Fixes</div>
                      <div className="space-y-1.5">
                        {sc.solutions.map((s) => (
                          <div key={s.label} className="flex items-start gap-2" style={{ color: "var(--text-dim)" }}>
                            <ArrowRight size={13} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} />
                            <span><span style={{ color: "var(--text)" }}>{s.label}</span> — {s.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
                      <Lightbulb size={14} className="mt-0.5 shrink-0" style={{ color: "var(--warn)" }} />
                      <span className="text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{sc.lesson}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    {sc.conceptId ? (
                      <button onClick={() => selectConcept(sc.conceptId!)} className="text-[12px] font-medium" style={{ color: "#a5b4fc" }}>Deep dive: the concept →</button>
                    ) : <span />}
                    {index < SCENARIOS.length - 1 && (
                      <button onClick={() => goto(index + 1)} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all hover:brightness-110" style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}>
                        Next case <ChevronRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
