"use client";

import { ShieldCheck, FileText, Layers, FlaskConical } from "lucide-react";
import type { ConfidenceLevel, ConfidenceInfo } from "@/lib/types";
import { CONFIDENCE_META } from "@/lib/atlas";

const ICONS: Record<ConfidenceLevel, React.ReactNode> = {
  verified: <ShieldCheck size={11} />,
  "publicly-disclosed": <FileText size={11} />,
  "industry-pattern": <Layers size={11} />,
  "educational-simulation": <FlaskConical size={11} />,
};

export function ConfidenceBadge({ info, size = "sm" }: { info: ConfidenceInfo; size?: "sm" | "md" }) {
  const meta = CONFIDENCE_META[info.level];
  const isMd = size === "md";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-semibold uppercase tracking-wide ${isMd ? "px-2 py-1 text-[10px]" : "px-1.5 py-0.5 text-[9px]"}`}
      style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
      title={`${meta.label}: ${info.rationale}`}
    >
      {ICONS[info.level]}
      {meta.label}
    </span>
  );
}

export function ConfidenceLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(CONFIDENCE_META) as ConfidenceLevel[]).map((level) => {
        const meta = CONFIDENCE_META[level];
        return (
          <div
            key={level}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px]"
            style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
          >
            <span style={{ color: meta.color }}>{ICONS[level]}</span>
            <span className="font-semibold" style={{ color: meta.color }}>{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}
