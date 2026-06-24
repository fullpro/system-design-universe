"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Cpu,
  Clock,
  EyeOff,
  BookOpen,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useUniverse } from "@/lib/store";
import { getCompany } from "@/lib/atlas";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { SourceList } from "./SourceCitation";

export function CompanyDetail() {
  const companyId = useUniverse((s) => s.atlasCompanyId);
  const selectCompany = useUniverse((s) => s.selectAtlasCompany);
  const selectConcept = useUniverse((s) => s.selectConcept);
  const setMode = useUniverse((s) => s.setMode);

  const company = companyId ? getCompany(companyId) : null;
  if (!company) return null;

  const accent = company.accent === "#000000" ? "#888888" : company.accent;

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
        onClick={() => selectCompany(null)}
        className="mb-4 flex items-center gap-1.5 text-[12px] font-medium transition-colors hover:brightness-125"
        style={{ color: "var(--text-dim)" }}
      >
        <ArrowLeft size={14} /> Back to companies
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
        >
          <Icon name={company.icon} size={28} strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{company.name}</h2>
          <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-dim)" }}>{company.scale}</p>
        </div>
      </div>

      {/* Overview */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: rgba(accent, 0.9) }}>
            <Building2 size={13} style={{ color: accent }} /> Core Products
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {company.coreProducts.map((p) => (
              <span key={p} className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: rgba(accent, 0.1), color: "var(--text)", border: `1px solid ${rgba(accent, 0.2)}` }}>
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: rgba(accent, 0.9) }}>
            <Cpu size={13} style={{ color: accent }} /> Known Infrastructure
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {company.knownInfra.map((i) => (
              <span key={i} className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>
                {i}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Technologies */}
      <section className="mt-8">
        <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
          <Cpu size={15} style={{ color: accent }} /> Publicly Known Technologies
        </h3>
        <div className="mt-3 space-y-2.5">
          {company.technologies.map((tech) => (
            <div
              key={tech.name}
              className="rounded-2xl p-4"
              style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{tech.name}</h4>
                <ConfidenceBadge info={tech.confidence} />
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {tech.description}
              </p>
              {tech.conceptIds && tech.conceptIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tech.conceptIds.map((cid) => (
                    <button
                      key={cid}
                      onClick={() => openConcept(cid)}
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-white/10"
                      style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}
                    >
                      {cid.replace(/-/g, " ")} <ChevronRight size={9} />
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2">
                <SourceList sources={tech.sources} accent={accent} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      {company.timeline.length > 0 && (
        <section className="mt-8">
          <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
            <Clock size={15} style={{ color: accent }} /> Architecture Timeline
          </h3>
          <div className="mt-3 space-y-0">
            {company.timeline.map((entry, i) => (
              <div key={i} className="relative flex gap-4 pb-6">
                {/* Vertical line */}
                {i < company.timeline.length - 1 && (
                  <div className="absolute left-[19px] top-8 bottom-0 w-px" style={{ background: rgba(accent, 0.25) }} />
                )}
                {/* Year dot */}
                <div className="flex shrink-0 flex-col items-center">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[12px] font-bold"
                    style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
                  >
                    {entry.year}
                  </span>
                </div>
                {/* Content */}
                <div className="min-w-0 flex-1 rounded-2xl p-3.5" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{entry.event}</h4>
                    <ConfidenceBadge info={entry.confidence} />
                  </div>
                  <div className="mt-2 space-y-1.5 text-[12px] leading-snug">
                    <div style={{ color: "var(--text-dim)" }}>
                      <span className="font-semibold" style={{ color: "var(--bad)" }}>Problem: </span>
                      {entry.problem}
                    </div>
                    <div style={{ color: "var(--text-dim)" }}>
                      <span className="font-semibold" style={{ color: "var(--good)" }}>Solution: </span>
                      {entry.solution}
                    </div>
                    <div style={{ color: "var(--text-faint)" }}>
                      <span className="font-semibold" style={{ color: accent }}>Why: </span>
                      {entry.why}
                    </div>
                  </div>
                  <div className="mt-2">
                    <SourceList sources={entry.sources} accent={accent} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* What We Don't Know */}
      {company.unknowns.length > 0 && (
        <section className="mt-8">
          <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
            <EyeOff size={15} style={{ color: "var(--text-faint)" }} /> What We Don't Know
          </h3>
          <p className="mt-1 text-[11px]" style={{ color: "var(--text-faint)" }}>
            Areas where public information is limited. We do not speculate.
          </p>
          <div className="mt-3 space-y-2">
            {company.unknowns.map((u) => (
              <div
                key={u.area}
                className="rounded-xl px-3.5 py-2.5"
                style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.18)" }}
              >
                <div className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>{u.area}</div>
                <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
                  Status: Not publicly documented. {u.note}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      <section className="mt-8">
        <h3 className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--text)" }}>
          <BookOpen size={15} style={{ color: accent }} /> Primary Sources
        </h3>
        <div className="mt-2">
          <SourceList sources={company.sources} accent={accent} />
        </div>
      </section>
    </motion.div>
  );
}
