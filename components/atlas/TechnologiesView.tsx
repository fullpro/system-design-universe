"use client";

import { motion } from "framer-motion";
import { User, Calendar } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { TECH_ORIGINS } from "@/lib/atlas";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { TechDetail } from "./TechDetail";

function TechCard({ tech, index }: { tech: (typeof TECH_ORIGINS)[number]; index: number }) {
  const selectTech = useUniverse((s) => s.selectAtlasTech);
  const accent = tech.accent === "#000000" ? "#888888" : tech.accent;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      onClick={() => selectTech(tech.id)}
      className="group sheen flex flex-col gap-2 rounded-2xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: "var(--panel)", border: `1px solid ${rgba(accent, 0.28)}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
            style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
          >
            <Icon name={tech.icon} size={20} strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-bold leading-tight" style={{ color: "var(--text)" }}>
              {tech.name}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px]" style={{ color: "var(--text-faint)" }}>
              <span className="flex items-center gap-0.5"><User size={9} /> {tech.createdBy}</span>
              <span className="flex items-center gap-0.5"><Calendar size={9} /> {tech.year}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="line-clamp-2 text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
        {tech.problem}
      </p>
      <div className="mt-auto pt-1">
        <ConfidenceBadge info={tech.confidence} />
      </div>
    </motion.button>
  );
}

export function TechnologiesView() {
  const techId = useUniverse((s) => s.atlasTechId);

  if (techId) return <TechDetail />;

  return (
    <div className="mx-auto max-w-[1140px] px-3 pb-20 pt-3 sm:px-5 sm:pt-4">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-lg font-bold tracking-tight sm:text-xl" style={{ color: "var(--text)" }}>
          Technology Origins
        </h2>
        <p className="mt-1 text-[12px]" style={{ color: "var(--text-dim)" }}>
          Why these technologies were invented — the problems, the failed approaches, the design decisions, and the industry impact.
        </p>
      </motion.header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TECH_ORIGINS.map((tech, i) => (
          <TechCard key={tech.id} tech={tech} index={i} />
        ))}
      </div>
    </div>
  );
}
