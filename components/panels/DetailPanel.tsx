"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Maximize2,
  Check,
  Minus,
  Lightbulb,
  AlertCircle,
  Building2,
  HelpCircle,
  TrendingUp,
  Shuffle,
  Brain,
  Ghost,
  Unplug,
} from "lucide-react";
import { useUniverse } from "@/lib/store";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";

function Section({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
      <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: rgba(accent, 0.9) }}>
        <span style={{ color: accent }}>{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export function DetailPanel() {
  const selectedConceptId = useUniverse((s) => s.selectedConceptId);
  const mode = useUniverse((s) => s.mode);
  const closeDetail = useUniverse((s) => s.closeDetail);
  const zoomInto = useUniverse((s) => s.zoomInto);

  const concept = selectedConceptId ? getConcept(selectedConceptId) : undefined;
  const open = Boolean(concept) && mode !== "internals";

  return (
    <AnimatePresence>
      {open && concept && (
        <motion.aside
          key={concept.id}
          initial={{ x: 460, opacity: 0.4 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 460, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="scroll-fade glass absolute z-30 overflow-y-auto rounded-2xl sm:rounded-3xl inset-x-2 bottom-2 top-14 sm:inset-x-auto sm:right-3 sm:top-20 sm:bottom-3 sm:w-[420px]"
          style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8)" }}
        >
          {(() => {
            const accent = CATEGORIES[concept.category].accent;
            return (
              <>
                {/* Header */}
                <div className="sticky top-0 z-10 px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5" style={{ background: "linear-gradient(180deg, var(--panel-solid) 70%, transparent)", backdropFilter: "blur(8px)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
                      >
                        <Icon name={concept.icon} size={22} strokeWidth={1.7} />
                      </span>
                      <div>
                        <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: rgba(accent, 0.9) }}>
                          {CATEGORIES[concept.category].label}
                        </div>
                        <h2 className="text-xl font-bold leading-tight" style={{ color: "var(--text)" }}>
                          {concept.name}
                        </h2>
                      </div>
                    </div>
                    <button
                      onClick={closeDetail}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                      style={{ color: "var(--text-dim)" }}
                      aria-label="Close"
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <p className="mt-3 text-[13px] italic leading-snug" style={{ color: "var(--text-dim)" }}>
                    “{concept.tagline}”
                  </p>
                  {concept.internal && (
                    <button
                      onClick={() => zoomInto(concept.id)}
                      className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all hover:brightness-110"
                      style={{ background: rgba(accent, 0.18), color: accent, border: `1px solid ${rgba(accent, 0.4)}` }}
                    >
                      <Maximize2 size={15} /> Zoom into the internals
                    </button>
                  )}
                </div>

                {/* Mental model — the intuition pump, surfaced first. */}
                {concept.mentalModel && (
                  <div className="px-5 pt-4">
                    <div
                      className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
                      style={{ background: rgba(accent, 0.1), border: `1px solid ${rgba(accent, 0.28)}` }}
                    >
                      <Brain size={16} className="mt-0.5 shrink-0" style={{ color: accent }} />
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: rgba(accent, 0.9) }}>
                          Mental model
                        </div>
                        <p className="mt-0.5 text-[13px] font-medium leading-snug" style={{ color: "var(--text)" }}>
                          {concept.mentalModel}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Body */}
                <Section title="Definition" icon={<Icon name={concept.icon} size={13} />} accent={accent}>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text)" }}>
                    {concept.definition}
                  </p>
                </Section>

                {concept.misconception && (
                  <Section title="Common misconception" icon={<Ghost size={13} />} accent={accent}>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
                        <span className="mt-0.5 shrink-0 rounded px-1 text-[9px] font-bold uppercase tracking-wide" style={{ background: "rgba(248,113,113,0.16)", color: "var(--bad)" }}>
                          Myth
                        </span>
                        {concept.misconception.myth}
                      </div>
                      <div className="flex items-start gap-2 text-[12.5px] font-medium leading-snug" style={{ color: "var(--text)" }}>
                        <span className="mt-0.5 shrink-0 rounded px-1 text-[9px] font-bold uppercase tracking-wide" style={{ background: "rgba(52,211,153,0.16)", color: "var(--good)" }}>
                          Real
                        </span>
                        {concept.misconception.reality}
                      </div>
                    </div>
                  </Section>
                )}

                <Section title="Why it exists" icon={<Lightbulb size={13} />} accent={accent}>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                    {concept.whyItExists}
                  </p>
                </Section>

                <Section title="Problem it solves" icon={<AlertCircle size={13} />} accent={accent}>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                    {concept.problemSolved}
                  </p>
                </Section>

                {concept.consequenceIfRemoved && (
                  <Section title="What breaks without it" icon={<Unplug size={13} />} accent={accent}>
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                      {concept.consequenceIfRemoved}
                    </p>
                  </Section>
                )}

                <Section title="Tradeoffs" icon={<Shuffle size={13} />} accent={accent}>
                  <div className="space-y-1.5">
                    {concept.advantages.map((a) => (
                      <div key={a} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text)" }}>
                        <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} />
                        {a}
                      </div>
                    ))}
                    {concept.disadvantages.map((d) => (
                      <div key={d} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
                        <Minus size={14} className="mt-0.5 shrink-0" style={{ color: "var(--bad)" }} />
                        {d}
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Alternatives" icon={<Shuffle size={13} />} accent={accent}>
                  <div className="space-y-2">
                    {concept.alternatives.map((alt) => (
                      <div key={alt.name} className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                        <div className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>{alt.name}</div>
                        <div className="text-[11.5px] leading-snug" style={{ color: "var(--text-faint)" }}>{alt.note}</div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Real-world usage" icon={<Building2 size={13} />} accent={accent}>
                  <ul className="space-y-1.5">
                    {concept.realWorld.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section title="Interview questions" icon={<HelpCircle size={13} />} accent={accent}>
                  <ol className="space-y-2">
                    {concept.interviewQuestions.map((q, i) => (
                      <li key={q} className="flex gap-2.5 text-[12.5px] leading-snug" style={{ color: "var(--text)" }}>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold" style={{ background: rgba(accent, 0.16), color: accent }}>
                          {i + 1}
                        </span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </Section>

                <Section title="Scaling implications" icon={<TrendingUp size={13} />} accent={accent}>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                    {concept.scaling}
                  </p>
                </Section>

                <div className="h-3" />
              </>
            );
          })()}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
