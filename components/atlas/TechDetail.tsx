"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Calendar,
  Lightbulb,
  XCircle,
  CheckCircle,
  Scale,
  Sparkles,
  Link2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useUniverse } from "@/lib/store";
import { getTechOrigin } from "@/lib/atlas";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { SourceList } from "./SourceCitation";

export function TechDetail() {
  const techId = useUniverse((s) => s.atlasTechId);
  const selectTech = useUniverse((s) => s.selectAtlasTech);
  const selectConcept = useUniverse((s) => s.selectConcept);
  const setMode = useUniverse((s) => s.setMode);

  const tech = techId ? getTechOrigin(techId) : null;
  if (!tech) return null;

  const accent = tech.accent === "#000000" ? "#888888" : tech.accent;

  const openConcept = (id: string) => {
    setMode("learn");
    selectConcept(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[900px] px-3 pb-20 pt-3 sm:px-5 sm:pt-4"
    >
      <button
        onClick={() => selectTech(null)}
        className="mb-4 flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:brightness-125"
        style={{ color: "var(--text-dim)" }}
      >
        <ArrowLeft size={14} /> Back to technologies
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
        >
          <Icon name={tech.icon} size={28} strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{tech.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px]" style={{ color: "var(--text-dim)" }}>
            <span className="flex items-center gap-1"><User size={12} /> {tech.createdBy}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {tech.year}</span>
            {tech.inspiredBy && <span className="flex items-center gap-1"><Sparkles size={12} /> Inspired by {tech.inspiredBy}</span>}
          </div>
          <div className="mt-2">
            <ConfidenceBadge info={tech.confidence} size="md" />
          </div>
        </div>
      </div>

      {/* Problem & Motivation */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl p-4" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.18)" }}>
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--bad)" }}>
            <XCircle size={13} /> The Problem
          </h3>
          <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--text)" }}>
            {tech.problem}
          </p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: rgba(accent, 0.06), border: `1px solid ${rgba(accent, 0.18)}` }}>
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
            <Lightbulb size={13} /> Motivation
          </h3>
          <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--text)" }}>
            {tech.motivation}
          </p>
        </div>
      </div>

      {/* Failed Approaches */}
      {tech.failedApproaches && tech.failedApproaches.length > 0 && (
        <section className="mt-6">
          <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
            <XCircle size={15} style={{ color: "var(--bad)" }} /> What Didn't Work
          </h3>
          <div className="mt-2 space-y-1.5">
            {tech.failedApproaches.map((a) => (
              <div key={a} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--bad)" }} />
                {a}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Design Decisions */}
      {tech.designDecisions && tech.designDecisions.length > 0 && (
        <section className="mt-6">
          <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
            <CheckCircle size={15} style={{ color: "var(--good)" }} /> Key Design Decisions
          </h3>
          <div className="mt-2 space-y-1.5">
            {tech.designDecisions.map((d) => (
              <div key={d} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text)" }}>
                <CheckCircle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} />
                {d}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tradeoffs */}
      {tech.tradeoffs && tech.tradeoffs.length > 0 && (
        <section className="mt-6">
          <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
            <Scale size={15} style={{ color: "#fbbf24" }} /> Tradeoffs Made
          </h3>
          <div className="mt-2 space-y-1.5">
            {tech.tradeoffs.map((t) => (
              <div key={t} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
                <Scale size={13} className="mt-0.5 shrink-0" style={{ color: "#fbbf24" }} />
                {t}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Industry Impact */}
      {tech.industryImpact && (
        <section className="mt-6">
          <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
            <Sparkles size={15} style={{ color: accent }} /> Industry Impact
          </h3>
          <div
            className="mt-2 rounded-2xl px-4 py-3"
            style={{ background: rgba(accent, 0.08), border: `1px solid ${rgba(accent, 0.2)}` }}
          >
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text)" }}>
              {tech.industryImpact}
            </p>
          </div>
        </section>
      )}

      {/* Related Concepts */}
      {tech.conceptIds && tech.conceptIds.length > 0 && (
        <section className="mt-6">
          <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
            <Link2 size={15} style={{ color: "#a5b4fc" }} /> Related Concepts
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tech.conceptIds.map((cid) => (
              <button
                key={cid}
                onClick={() => openConcept(cid)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition-colors hover:bg-white/10"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#c7d2fe" }}
              >
                {cid.replace(/-/g, " ")} <ChevronRight size={10} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      <section className="mt-6">
        <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
          <BookOpen size={15} style={{ color: accent }} /> Sources
        </h3>
        <div className="mt-2">
          <SourceList sources={tech.sources} accent={accent} />
        </div>
      </section>
    </motion.div>
  );
}
