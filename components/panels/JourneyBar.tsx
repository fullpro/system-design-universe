"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, X, GitBranch, Lightbulb, Gauge } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { JOURNEYS } from "@/lib/journey";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";

const HOP_MS = 2600;

export function JourneyBar() {
  const step = useUniverse((s) => s.journeyStep);
  const playing = useUniverse((s) => s.journeyPlaying);
  const journeyId = useUniverse((s) => s.journeyId);
  const setJourneyId = useUniverse((s) => s.setJourneyId);
  const next = useUniverse((s) => s.journeyNext);
  const prev = useUniverse((s) => s.journeyPrev);
  const setStep = useUniverse((s) => s.setJourneyStep);
  const togglePlay = useUniverse((s) => s.toggleJourneyPlay);
  const end = useUniverse((s) => s.endJourney);

  const journey = JOURNEYS.find((j) => j.id === journeyId) ?? JOURNEYS[0];
  const hops = journey.hops;

  useEffect(() => {
    if (step === null || !playing) return;
    const t = setTimeout(() => next(), HOP_MS);
    return () => clearTimeout(t);
  }, [step, playing, next]);

  if (step === null) return null;
  const hop = hops[step];
  const concept = getConcept(hop.node);
  const accent = concept ? CATEGORIES[concept.category].accent : "#818cf8";
  const atEnd = step >= hops.length - 1;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="glass sheen safe-bottom absolute inset-x-2 bottom-0 z-30 rounded-t-2xl sm:inset-x-3 sm:bottom-3 sm:rounded-3xl"
    >
      {/* ── Mobile layout ── */}
      <div className="p-3 sm:hidden">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.35)}` }}
          >
            {concept ? <Icon name={concept.icon} size={16} strokeWidth={1.7} /> : <Gauge size={14} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: rgba(accent, 0.9) }}>
                {concept?.name ?? hop.node}
              </span>
              <span className="text-[9px] font-semibold tabular-nums" style={{ color: "var(--text-faint)" }}>
                {step + 1}/{hops.length}
              </span>
            </div>
            <h2 className="truncate text-[13px] font-bold leading-tight" style={{ color: "var(--text)" }}>
              {hop.title}
            </h2>
          </div>
          <button
            onClick={end}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ color: "var(--text-faint)" }}
            aria-label="Exit"
          >
            <X size={15} />
          </button>
        </div>

        <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug" style={{ color: "var(--text-dim)" }}>
          {hop.what}
        </p>

        {/* Compact transport */}
        <div className="mt-2.5 flex items-center gap-2">
          <button onClick={prev} disabled={step === 0} className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-30" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={togglePlay} className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold" style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}>
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? "Pause" : atEnd ? "Replay" : "Play"}
          </button>
          <button onClick={next} disabled={atEnd} className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-30" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Scrubber */}
        <div className="mt-2 flex items-center gap-1">
          {hops.map((h, i) => (
            <button key={h.node + i} onClick={() => setStep(i)} className="flex-1">
              <div className="h-1 rounded-full transition-all duration-300" style={{ background: i <= step ? accent : "rgba(255,255,255,0.1)", opacity: i === step ? 1 : i < step ? 0.55 : 1 }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden p-4 px-5 sm:block">
        <div className="flex items-start gap-4">
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.35)}` }}
            >
              {concept ? <Icon name={concept.icon} size={22} strokeWidth={1.7} /> : <Gauge size={20} />}
            </span>
            <span className="text-[10px] font-semibold tabular-nums" style={{ color: "var(--text-faint)" }}>
              {step + 1}/{hops.length}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.22 }}
              >
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: rgba(accent, 0.9) }}>
                    {concept?.name ?? hop.node}
                  </span>
                  <h2 className="text-[15px] font-bold leading-tight" style={{ color: "var(--text)" }}>
                    {hop.title}
                  </h2>
                  {hop.cost && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-faint)" }}>
                      {hop.cost}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[12.5px] leading-snug" style={{ color: "var(--text)" }}>
                  {hop.what}
                </p>

                <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
                  <Lightbulb size={13} className="mt-0.5 shrink-0" style={{ color: rgba(accent, 0.9) }} />
                  {hop.why}
                </p>

                {hop.decision && (
                  <div className="mt-2 rounded-xl px-3 py-2" style={{ background: rgba(accent, 0.07), border: `1px solid ${rgba(accent, 0.22)}` }}>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: rgba(accent, 0.95) }}>
                      <GitBranch size={12} /> {hop.decision.question}
                    </div>
                    <div className="mt-1 text-[12px] font-medium leading-snug" style={{ color: "var(--text)" }}>
                      {hop.decision.outcome}
                    </div>
                    <div className="mt-1 text-[11.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
                      Otherwise → {hop.decision.alternative}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button onClick={prev} disabled={step === 0} className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors enabled:hover:bg-white/10 disabled:opacity-30" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }} aria-label="Previous hop">
              <ChevronLeft size={17} />
            </button>
            <button onClick={togglePlay} className="flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold transition-all hover:brightness-110" style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}>
              {playing ? <Pause size={15} /> : <Play size={15} />}
              {playing ? "Pause" : atEnd ? "Replay" : "Play"}
            </button>
            <button onClick={next} disabled={atEnd} className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors enabled:hover:bg-white/10 disabled:opacity-30" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }} aria-label="Next hop">
              <ChevronRight size={17} />
            </button>
            <button onClick={end} className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/10" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }} aria-label="Exit journey">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t pt-3 overflow-x-auto" style={{ borderColor: "var(--border)" }}>
          <div className="flex shrink-0 gap-0.5">
            {JOURNEYS.map((j) => (
              <button
                key={j.id}
                onClick={() => setJourneyId(j.id)}
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold transition-all whitespace-nowrap"
                style={{
                  background: j.id === journeyId ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${j.id === journeyId ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                  color: j.id === journeyId ? "#c7d2fe" : "var(--text-faint)",
                }}
                title={j.sublabel}
              >
                {j.label.split(" ")[0]}
              </button>
            ))}
          </div>
          {hops.map((h, i) => (
            <button key={h.node + i} onClick={() => setStep(i)} className="flex-1" title={h.title}>
              <div className="h-1.5 rounded-full transition-all duration-300" style={{ background: i <= step ? accent : "rgba(255,255,255,0.1)", opacity: i === step ? 1 : i < step ? 0.55 : 1 }} />
            </button>
          ))}
          <span className="ml-2 shrink-0 text-[10px] font-medium tabular-nums" style={{ color: "var(--text-faint)" }}>
            {atEnd ? `total ${journey.total}` : journey.sublabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
