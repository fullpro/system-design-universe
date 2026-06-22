"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Play, Pause, ChevronLeft, ChevronRight, ZapOff, RotateCcw, FlaskConical } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { layoutInternal } from "@/lib/internals";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { WidgetModal } from "@/components/learn/WidgetModal";
import { TOOL_BY_CONCEPT } from "@/components/learn/registry";

const STEP_MS = 2200;

export function InternalsHeader() {
  const zoomedConceptId = useUniverse((s) => s.zoomedConceptId);
  const priorMode = useUniverse((s) => s.priorMode);
  const exitInternals = useUniverse((s) => s.exitInternals);
  const selectConcept = useUniverse((s) => s.selectConcept);
  const setMode = useUniverse((s) => s.setMode);

  const step = useUniverse((s) => s.internalsStep);
  const playing = useUniverse((s) => s.internalsPlaying);
  const failure = useUniverse((s) => s.internalsFailure);
  const setStep = useUniverse((s) => s.setInternalsStep);
  const stepNext = useUniverse((s) => s.internalsNext);
  const stepPrev = useUniverse((s) => s.internalsPrev);
  const togglePlay = useUniverse((s) => s.toggleInternalsPlay);
  const setFailure = useUniverse((s) => s.setInternalsFailure);
  const [toolOpen, setToolOpen] = useState(false);

  const concept = zoomedConceptId ? getConcept(zoomedConceptId) : undefined;
  const flow = concept?.internal;
  const tool = concept ? TOOL_BY_CONCEPT[concept.id] : undefined;
  const steps = flow ? layoutInternal(flow).nodes : [];
  const total = steps.length;
  const failures = flow?.failures ?? [];
  const activeFailure = failures.find((f) => f.at === failure);

  // Auto-advance the walkthrough while playing.
  useEffect(() => {
    if (step === null || !playing) return;
    const t = setTimeout(() => stepNext(total), STEP_MS);
    return () => clearTimeout(t);
  }, [step, playing, total, stepNext]);

  if (!concept || !flow) return null;
  const accent = CATEGORIES[concept.category].accent;
  const activeStep = step !== null ? steps[step] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass sheen absolute left-3 top-20 z-30 w-[320px] max-w-[calc(100vw-24px)] rounded-2xl p-4"
    >
      <button
        onClick={exitInternals}
        className="mb-2.5 flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:brightness-125"
        style={{ color: "var(--text-dim)" }}
      >
        <ArrowLeft size={14} /> Back to World Map
      </button>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}>
          <Icon name={concept.icon} size={18} strokeWidth={1.7} />
        </span>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: rgba(accent, 0.9) }}>Internals</div>
          <h2 className="text-[16px] font-bold leading-tight" style={{ color: "var(--text)" }}>{concept.name}</h2>
        </div>
      </div>
      <p className="mt-2.5 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
        {flow.summary}
      </p>

      {/* Walkthrough controls */}
      <div className="mt-3 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => togglePlay(total)}
            className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-all hover:brightness-110"
            style={{ background: rgba(accent, 0.2), border: `1px solid ${rgba(accent, 0.45)}`, color: accent }}
          >
            {playing ? <Pause size={13} /> : <Play size={13} />}
            {playing ? "Pause" : step === null ? "Walk through it" : "Play"}
          </button>
          {step !== null && (
            <>
              <button onClick={stepPrev} disabled={step === 0} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors enabled:hover:bg-white/10 disabled:opacity-30" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }} aria-label="Previous step">
                <ChevronLeft size={15} />
              </button>
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--text-dim)" }}>{step + 1}/{total}</span>
              <button onClick={() => stepNext(total)} disabled={step >= total - 1} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors enabled:hover:bg-white/10 disabled:opacity-30" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }} aria-label="Next step">
                <ChevronRight size={15} />
              </button>
              <button onClick={() => setStep(null)} className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10" style={{ color: "var(--text-faint)" }} aria-label="Reset walkthrough">
                <RotateCcw size={13} />
              </button>
            </>
          )}
        </div>
        {step !== null && (
          <>
            <div className="mt-2 flex items-center gap-1">
              {steps.map((s, i) => (
                <button key={s.id} onClick={() => setStep(i)} className="flex-1" title={s.label}>
                  <div className="h-1.5 rounded-full transition-all" style={{ background: i <= step ? accent : "rgba(255,255,255,0.1)", opacity: i === step ? 1 : i < step ? 0.55 : 1 }} />
                </button>
              ))}
            </div>
            {activeStep && (
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-2">
                  <div className="flex items-baseline gap-2">
                    <div className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>{activeStep.label}</div>
                    {activeStep.sublabel && <div className="text-[10.5px]" style={{ color: rgba(accent, 0.85) }}>{activeStep.sublabel}</div>}
                  </div>
                  {activeStep.detail && (
                    <p className="mt-1 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>{activeStep.detail}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </div>

      {/* Failure modes */}
      {failures.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--bad)" }}>
            <ZapOff size={12} /> What if it fails?
          </div>
          <div className="flex flex-wrap gap-1.5">
            {failures.map((f) => {
              const active = failure === f.at;
              return (
                <button
                  key={f.at}
                  onClick={() => setFailure(f.at)}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium transition-all"
                  style={{
                    background: active ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? "rgba(248,113,113,0.5)" : "var(--border)"}`,
                    color: active ? "var(--bad)" : "var(--text-dim)",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {activeFailure && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden rounded-xl p-2.5"
                style={{ background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.25)" }}
              >
                <div className="text-[12px] font-medium leading-snug" style={{ color: "var(--text)" }}>{activeFailure.what}</div>
                <div className="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
                  <span className="shrink-0 rounded px-1 text-[9px] font-bold uppercase tracking-wide" style={{ background: "rgba(52,211,153,0.16)", color: "var(--good)" }}>Recovery</span>
                  {activeFailure.recovery}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {tool && (
        <button
          onClick={() => setToolOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold transition-all hover:brightness-110"
          style={{ background: rgba(tool.accent, 0.18), color: tool.accent, border: `1px solid ${rgba(tool.accent, 0.45)}` }}
        >
          <FlaskConical size={13} /> Try it: {tool.name}
        </button>
      )}

      <button
        onClick={() => {
          const id = concept.id;
          setMode(priorMode);
          selectConcept(id);
        }}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold transition-all hover:brightness-110"
        style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.35)}` }}
      >
        <BookOpen size={13} /> Read the full lesson
      </button>

      <AnimatePresence>
        {tool && toolOpen && (
          <WidgetModal title={tool.title} subtitle={tool.subtitle} onClose={() => setToolOpen(false)}>
            {tool.render()}
          </WidgetModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
