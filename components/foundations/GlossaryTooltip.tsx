"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import { getGlossaryEntry, type GlossaryEntry } from "@/lib/glossary";
import { useUniverse } from "@/lib/store";
import { rgba } from "@/lib/color";
import { CATEGORIES } from "@/lib/categories";
import { getConcept } from "@/lib/concepts";

function TooltipCard({ entry, onNavigate }: { entry: GlossaryEntry; onNavigate?: (conceptId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const concept = entry.conceptId ? getConcept(entry.conceptId) : null;
  const accent = concept ? CATEGORIES[concept.category].accent : "#a5b4fc";

  return (
    <div
      className="w-[300px] rounded-xl p-3.5"
      style={{
        background: "rgba(13, 15, 23, 0.97)",
        border: `1px solid ${rgba(accent, 0.35)}`,
        boxShadow: `0 20px 60px -15px rgba(0,0,0,0.8), 0 0 20px ${rgba(accent, 0.1)}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[13px] font-bold" style={{ color: accent }}>{entry.term}</span>
          {entry.fullForm && (
            <span className="ml-1.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
              ({entry.fullForm})
            </span>
          )}
        </div>
        {entry.conceptId && onNavigate && (
          <button
            onClick={() => onNavigate(entry.conceptId!)}
            className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium transition-colors hover:bg-white/10"
            style={{ color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
          >
            <ExternalLink size={9} /> Deep dive
          </button>
        )}
      </div>

      <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        {entry.beginner}
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1 text-[10.5px] font-medium transition-colors hover:brightness-125"
        style={{ color: rgba(accent, 0.8) }}
      >
        <ChevronDown
          size={12}
          className="transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        />
        {expanded ? "Show less" : "Show more"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-lg p-2.5" style={{ background: rgba(accent, 0.06) }}>
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: rgba(accent, 0.7) }}>
                Intermediate
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {entry.intermediate}
              </p>
            </div>

            <div className="mt-2 rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                Why it exists
              </div>
              <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {entry.whyItExists}
              </p>
            </div>

            {entry.related.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {entry.related.map((r) => (
                  <span
                    key={r}
                    className="rounded-full px-2 py-0.5 text-[10px]"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-faint)" }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GlossaryTerm({
  term,
  children,
  accent = "#a5b4fc",
}: {
  term: string;
  children: React.ReactNode;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const selectConcept = useUniverse((s) => s.selectConcept);
  const entry = getGlossaryEntry(term);

  const handleNavigate = useCallback(
    (conceptId: string) => {
      selectConcept(conceptId);
      setOpen(false);
    },
    [selectConcept],
  );

  if (!entry) return <>{children}</>;

  return (
    <span className="relative inline-block" ref={ref}>
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className="cursor-help border-b border-dotted transition-colors"
        style={{ borderColor: rgba(accent, 0.4), color: accent }}
      >
        {children}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <TooltipCard entry={entry} onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export function GlossaryText({ text, accent = "#a5b4fc" }: { text: string; accent?: string }) {
  const { findGlossaryTerms } = require("@/lib/glossary");
  const matches = findGlossaryTerms(text);

  if (matches.length === 0) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of matches) {
    if (match.start > lastIndex) {
      parts.push(text.slice(lastIndex, match.start));
    }
    parts.push(
      <GlossaryTerm key={`${match.start}-${match.term}`} term={match.term} accent={accent}>
        {match.term}
      </GlossaryTerm>,
    );
    lastIndex = match.end;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
