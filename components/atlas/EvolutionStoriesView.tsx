"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  XCircle,
  CheckCircle,
  Scale,
  Sparkles,
  BookOpen,
  User,
  Calendar,
} from "lucide-react";
import { TECH_ORIGINS } from "@/lib/atlas";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { SourceList } from "./SourceCitation";

const STORIES = TECH_ORIGINS.filter(
  (t) => t.failedApproaches?.length || t.designDecisions?.length || t.tradeoffs?.length,
);

function StoryCard({ tech }: { tech: (typeof TECH_ORIGINS)[number] }) {
  const [open, setOpen] = useState(false);
  const accent = tech.accent === "#000000" ? "#888888" : tech.accent;

  return (
    <div
      className="rounded-2xl transition-all"
      style={{ background: "var(--panel)", border: `1px solid ${open ? rgba(accent, 0.4) : "var(--border)"}` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
        >
          <Icon name={tech.icon} size={20} strokeWidth={1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold" style={{ color: "var(--text)" }}>{tech.name}</div>
          <div className="mt-0.5 flex items-center gap-2 text-[10px]" style={{ color: "var(--text-faint)" }}>
            <span className="flex items-center gap-0.5"><User size={9} /> {tech.createdBy}</span>
            <span className="flex items-center gap-0.5"><Calendar size={9} /> {tech.year}</span>
          </div>
        </div>
        <ConfidenceBadge info={tech.confidence} />
        <ChevronDown
          size={16}
          className="shrink-0 transition-transform duration-200"
          style={{ color: "var(--text-faint)", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-4 pb-4" style={{ borderTop: "1px solid var(--border)" }}>
              {/* Problem */}
              <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.18)" }}>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--bad)" }}>The Problem</div>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text)" }}>{tech.problem}</p>
              </div>

              {/* Failed Approaches */}
              {tech.failedApproaches && tech.failedApproaches.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--bad)" }}>
                    <XCircle size={12} /> Failed Approaches
                  </h4>
                  <div className="mt-1.5 space-y-1">
                    {tech.failedApproaches.map((a) => (
                      <div key={a} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--bad)" }} />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Decisions */}
              {tech.designDecisions && tech.designDecisions.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--good)" }}>
                    <CheckCircle size={12} /> Design Decisions
                  </h4>
                  <div className="mt-1.5 space-y-1">
                    {tech.designDecisions.map((d) => (
                      <div key={d} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: "var(--text)" }}>
                        <CheckCircle size={12} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tradeoffs */}
              {tech.tradeoffs && tech.tradeoffs.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#fbbf24" }}>
                    <Scale size={12} /> Tradeoffs
                  </h4>
                  <div className="mt-1.5 space-y-1">
                    {tech.tradeoffs.map((t) => (
                      <div key={t} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
                        <Scale size={12} className="mt-0.5 shrink-0" style={{ color: "#fbbf24" }} />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Impact */}
              {tech.industryImpact && (
                <div className="rounded-xl p-3" style={{ background: rgba(accent, 0.06), border: `1px solid ${rgba(accent, 0.18)}` }}>
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
                    <Sparkles size={11} /> Industry Impact
                  </div>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text)" }}>{tech.industryImpact}</p>
                </div>
              )}

              {/* Sources */}
              <div>
                <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
                  <BookOpen size={12} /> Sources
                </h4>
                <div className="mt-1">
                  <SourceList sources={tech.sources} accent={accent} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EvolutionStoriesView() {
  return (
    <div className="mx-auto max-w-[900px] px-3 pb-20 pt-3 sm:px-5 sm:pt-4">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-lg font-bold tracking-tight sm:text-xl" style={{ color: "var(--text)" }}>
          Architecture Evolution Stories
        </h2>
        <p className="mt-1 text-[12px]" style={{ color: "var(--text-dim)" }}>
          Why these technologies were invented — the problems that drove them, the approaches that failed, and the tradeoffs their creators made.
        </p>
      </motion.header>
      <div className="space-y-2.5">
        {STORIES.map((tech) => (
          <StoryCard key={tech.id} tech={tech} />
        ))}
      </div>
    </div>
  );
}
