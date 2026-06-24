"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Lightbulb, BookOpen, Zap, Link2, ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { rgba } from "@/lib/color";
import { GlossaryTerm } from "./GlossaryTooltip";
import { useUniverse } from "@/lib/store";
import type { LessonSection } from "@/lib/foundations-lessons";

function ProblemSolutionFlow({
  problem,
  consequence,
  solution,
  tradeoff,
  accent,
}: {
  problem: string;
  consequence: string;
  solution: string;
  tradeoff: string;
  accent: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2.5 rounded-xl p-3" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
        <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: "#f87171" }} />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#f87171" }}>Problem</div>
          <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{problem}</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl p-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
        <Zap size={15} className="mt-0.5 shrink-0" style={{ color: "#fbbf24" }} />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#fbbf24" }}>Consequence</div>
          <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{consequence}</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl p-3" style={{ background: rgba(accent, 0.06), border: `1px solid ${rgba(accent, 0.15)}` }}>
        <Lightbulb size={15} className="mt-0.5 shrink-0" style={{ color: accent }} />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: accent }}>Solution</div>
          <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{solution}</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl p-3" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <BookOpen size={15} className="mt-0.5 shrink-0" style={{ color: "#a855f7" }} />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#a855f7" }}>Tradeoff</div>
          <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{tradeoff}</p>
        </div>
      </div>
    </div>
  );
}

export function LessonCard({
  section,
  accent,
  index,
}: {
  section: LessonSection;
  accent: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const selectConcept = useUniverse((s) => s.selectConcept);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${rgba(accent, 0.2)}` }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left transition-all hover:brightness-105"
        style={{ background: rgba(accent, 0.06) }}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: rgba(accent, 0.15), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
        >
          <Icon name={section.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{section.title}</h3>
          <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-dim)" }}>{section.simpleDefinition}</p>
        </div>
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform"
          style={{ color: "var(--text-faint)", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4 pt-2">
              {/* Problem → Solution flow */}
              <ProblemSolutionFlow
                problem={section.problem}
                consequence={section.consequence}
                solution={section.solution}
                tradeoff={section.tradeoff}
                accent={accent}
              />

              {/* Mental model */}
              <div className="rounded-xl p-3" style={{ background: rgba(accent, 0.06), border: `1px solid ${rgba(accent, 0.12)}` }}>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
                  <Lightbulb size={11} /> Mental Model
                </div>
                <p className="mt-1.5 text-[13px] font-medium italic" style={{ color: "var(--text)" }}>
                  &ldquo;{section.mentalModel}&rdquo;
                </p>
              </div>

              {/* Why it exists */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                  Why it exists
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  {section.whyItExists}
                </p>
              </div>

              {/* Real example */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                  Real-world example
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  {section.realExample}
                </p>
              </div>

              {/* Common mistakes */}
              {section.commonMistakes.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#fbbf24" }}>
                    <AlertTriangle size={11} /> Common mistakes
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {section.commonMistakes.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "#fbbf24" }} />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related glossary terms */}
              {section.relatedTerms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {section.relatedTerms.map((term) => (
                    <GlossaryTerm key={term} term={term} accent={accent}>
                      <span
                        className="inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-medium"
                        style={{ background: rgba(accent, 0.1), border: `1px solid ${rgba(accent, 0.25)}` }}
                      >
                        {term}
                      </span>
                    </GlossaryTerm>
                  ))}
                </div>
              )}

              {/* Links to deeper concepts */}
              {section.linkedConcepts.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {section.linkedConcepts.map((id) => (
                    <button
                      key={id}
                      onClick={() => selectConcept(id)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all hover:brightness-125"
                      style={{ background: rgba(accent, 0.1), color: accent, border: `1px solid ${rgba(accent, 0.25)}` }}
                    >
                      <ExternalLink size={10} /> {id} deep dive
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
