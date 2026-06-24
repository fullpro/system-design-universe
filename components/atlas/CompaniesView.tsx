"use client";

import { motion } from "framer-motion";
import { useUniverse } from "@/lib/store";
import { COMPANIES } from "@/lib/atlas";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { CompanyDetail } from "./CompanyDetail";

function CompanyCard({ company, index }: { company: (typeof COMPANIES)[number]; index: number }) {
  const selectCompany = useUniverse((s) => s.selectAtlasCompany);
  const accent = company.accent === "#000000" ? "#888888" : company.accent;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      onClick={() => selectCompany(company.id)}
      className="group sheen flex flex-col gap-2.5 rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "var(--panel)", border: `1px solid ${rgba(accent, 0.28)}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
        >
          <Icon name={company.icon} size={22} strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold leading-tight" style={{ color: "var(--text)" }}>
            {company.name}
          </div>
          <div className="mt-0.5 text-[10px]" style={{ color: "var(--text-faint)" }}>
            {company.technologies.length} technologies · {company.timeline.length} milestones
          </div>
        </div>
      </div>
      <p className="line-clamp-2 text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
        {company.scale}
      </p>
      <div className="flex flex-wrap gap-1">
        {company.knownInfra.slice(0, 4).map((i) => (
          <span key={i} className="rounded-md px-1.5 py-0.5 text-[9px] font-medium" style={{ background: rgba(accent, 0.1), color: rgba(accent, 0.9), border: `1px solid ${rgba(accent, 0.2)}` }}>
            {i}
          </span>
        ))}
        {company.knownInfra.length > 4 && (
          <span className="rounded-md px-1.5 py-0.5 text-[9px] font-medium" style={{ color: "var(--text-faint)" }}>
            +{company.knownInfra.length - 4}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export function CompaniesView() {
  const companyId = useUniverse((s) => s.atlasCompanyId);

  if (companyId) return <CompanyDetail />;

  return (
    <div className="mx-auto max-w-[1140px] px-3 pb-20 pt-3 sm:px-5 sm:pt-4">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-lg font-bold tracking-tight sm:text-xl" style={{ color: "var(--text)" }}>
          Real Systems by Company
        </h2>
        <p className="mt-1 text-[12px]" style={{ color: "var(--text-dim)" }}>
          What is publicly known about how these companies build their infrastructure. Click a company to explore.
        </p>
      </motion.header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {COMPANIES.map((company, i) => (
          <CompanyCard key={company.id} company={company} index={i} />
        ))}
      </div>
    </div>
  );
}
