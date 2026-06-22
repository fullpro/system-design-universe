"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Zap, RotateCcw, Check, X, HelpCircle } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { EVOLUTION_STAGES, buildEvolution } from "@/lib/evolution";
import { scoreArchitecture } from "@/lib/reasoning/scoring";

const METERS: { key: "scalability" | "reliability" | "cost" | "operability"; label: string; color: string }[] = [
  { key: "scalability", label: "Scalability", color: "#818cf8" },
  { key: "reliability", label: "Reliability", color: "#34d399" },
  { key: "cost", label: "Cost-efficiency", color: "#fbbf24" },
  { key: "operability", label: "Operability", color: "#22d3ee" },
];

function EvolutionChallenge() {
  const challenge = useUniverse((s) => s.evoChallenge);
  const answer = useUniverse((s) => s.answerEvolution);
  const dismiss = useUniverse((s) => s.dismissEvolutionChallenge);
  const [picked, setPicked] = useState<number | null>(null);

  // Reset the local pick whenever a new challenge opens.
  useEffect(() => setPicked(null), [challenge]);

  if (challenge === null) return null;
  const stage = EVOLUTION_STAGES[challenge];
  const q = stage.question;
  if (!q) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(6,7,12,0.6)", backdropFilter: "blur(3px)" }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        className="glass sheen w-[460px] max-w-[calc(100vw-32px)] rounded-3xl p-5"
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#a5b4fc" }}>
          <HelpCircle size={13} /> Before you scale — what would you do?
        </div>
        <p className="mt-2 text-[14.5px] font-semibold leading-snug" style={{ color: "var(--text)" }}>
          {q.prompt}
        </p>

        <div className="mt-3 space-y-2">
          {q.options.map((opt, i) => {
            const revealed = picked !== null;
            const isPicked = picked === i;
            const showState = revealed && (isPicked || opt.correct);
            return (
              <button
                key={opt.label}
                onClick={() => picked === null && setPicked(i)}
                disabled={revealed}
                className="w-full rounded-xl px-3.5 py-2.5 text-left transition-all"
                style={{
                  background: showState ? (opt.correct ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)") : "rgba(255,255,255,0.03)",
                  border: `1px solid ${showState ? (opt.correct ? "rgba(52,211,153,0.5)" : "rgba(248,113,113,0.5)") : "var(--border)"}`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{opt.label}</span>
                  {showState && (opt.correct
                    ? <Check size={15} style={{ color: "var(--good)" }} />
                    : isPicked ? <X size={15} style={{ color: "var(--bad)" }} /> : null)}
                </div>
                {revealed && (isPicked || opt.correct) && (
                  <div className="mt-1 text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{opt.note}</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={dismiss} className="text-[12px] font-medium transition-colors hover:brightness-125" style={{ color: "var(--text-faint)" }}>
            Cancel
          </button>
          <button
            onClick={answer}
            disabled={picked === null}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all enabled:hover:brightness-110 disabled:opacity-40"
            style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}
          >
            Reveal the change <ChevronRight size={15} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function EvolutionBar() {
  const stage = useUniverse((s) => s.evolutionStage);
  const setStage = useUniverse((s) => s.setEvolutionStage);
  const next = useUniverse((s) => s.nextEvolution);
  const prev = useUniverse((s) => s.prevEvolution);

  const data = EVOLUTION_STAGES[stage];
  const total = EVOLUTION_STAGES.length;
  const scores = scoreArchitecture(buildEvolution(stage).nodes.map((n) => n.id));

  return (
    <>
      <AnimatePresence>
        <EvolutionChallenge key="evo-challenge" />
      </AnimatePresence>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="glass sheen absolute inset-x-3 bottom-3 z-30 rounded-3xl px-5 py-4"
      >
        <div className="flex items-center gap-4">
          {/* Stage index */}
          <div className="shrink-0 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Stage</div>
            <div className="text-2xl font-bold tabular-nums leading-none" style={{ color: "#a5b4fc" }}>
              {stage + 1}<span className="text-sm" style={{ color: "var(--text-faint)" }}>/{total}</span>
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 border-l pl-4" style={{ borderColor: "var(--border)" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[15px] font-bold leading-tight" style={{ color: "var(--text)" }}>{data.title}</h2>
                  <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "rgba(99,102,241,0.16)", color: "#a5b4fc" }}>
                    <Zap size={9} /> {data.trigger}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
                  {data.narrative}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav */}
          <div className="flex shrink-0 items-center gap-2">
            {stage > 0 && (
              <button
                onClick={() => setStage(0)}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
                style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}
                title="Restart"
              >
                <RotateCcw size={15} />
              </button>
            )}
            <button
              onClick={prev}
              disabled={stage === 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors enabled:hover:bg-white/10 disabled:opacity-30"
              style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={next}
              disabled={stage === total - 1}
              className="flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold transition-all enabled:hover:brightness-110 disabled:opacity-30"
              style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Complexity meter — the cost of every component you add. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
          <span className="text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
            Cost of complexity
          </span>
          {METERS.map((m) => (
            <div key={m.key} className="flex min-w-[130px] flex-1 items-center gap-2">
              <span className="w-[78px] shrink-0 text-[10px] font-medium" style={{ color: "var(--text-dim)" }}>{m.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${scores[m.key]}%`, background: m.color }} />
              </div>
              <span className="w-5 shrink-0 text-right text-[10px] font-semibold tabular-nums" style={{ color: m.color }}>{scores[m.key]}</span>
            </div>
          ))}
        </div>

        {/* Progress dots */}
        <div className="mt-2.5 flex items-center gap-1.5" style={{ borderColor: "var(--border)" }}>
          {EVOLUTION_STAGES.map((s, i) => (
            <button
              key={s.title}
              onClick={() => setStage(i)}
              className="group flex-1"
              title={s.title}
            >
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  background: i <= stage ? "#818cf8" : "rgba(255,255,255,0.1)",
                  opacity: i === stage ? 1 : i < stage ? 0.6 : 1,
                }}
              />
            </button>
          ))}
        </div>
      </motion.div>
    </>
  );
}
