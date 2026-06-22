"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { COMPARISONS, type CompareSide } from "@/lib/reasoning/comparisons";
import { overallScore } from "@/lib/reasoning/axes";
import { useUniverse } from "@/lib/store";
import { getConcept } from "@/lib/concepts";
import { Icon } from "@/components/ui/Icon";
import { Radar } from "./Radar";

const A_COLOR = "#818cf8";
const B_COLOR = "#f472b6";

function SideHead({ side, color, align }: { side: CompareSide; color: string; align: "left" | "right" }) {
  const selectConcept = useUniverse((s) => s.selectConcept);
  const concept = side.conceptId ? getConcept(side.conceptId) : undefined;
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <div className={`flex items-center gap-2 ${align === "right" ? "justify-end" : ""}`}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <h3 className="text-[17px] font-bold" style={{ color: "var(--text)" }}>{side.name}</h3>
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>{overallScore(side.scores)}</span>
      </div>
      <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-dim)" }}>{side.tagline}</p>
      {concept && (
        <button onClick={() => selectConcept(side.conceptId!)} className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${align === "right" ? "ml-auto" : ""}`} style={{ color }}>
          deep dive <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}

export function ComparisonView() {
  const [id, setId] = useState(COMPARISONS[0].id);
  const cmp = COMPARISONS.find((c) => c.id === id) ?? COMPARISONS[0];

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-6">
      <div className="mb-4">
        <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>Architecture Comparison</h2>
        <p className="text-[12px]" style={{ color: "var(--text-dim)" }}>Two options, one radar, the tradeoffs side by side.</p>
      </div>

      {/* selector */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {COMPARISONS.map((c) => {
          const active = c.id === id;
          return (
            <button
              key={c.id}
              onClick={() => setId(c.id)}
              className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all"
              style={{ background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(129,140,248,0.6)" : "var(--border)"}`, color: active ? "#c7d2fe" : "var(--text-dim)" }}
            >
              {c.title}
            </button>
          );
        })}
      </div>

      <motion.div key={cmp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {/* heads + radar */}
        <div className="sheen rounded-2xl p-5" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <SideHead side={cmp.a} color={A_COLOR} align="left" />
            <div className="mx-auto"><Radar scores={cmp.a.scores} compare={cmp.b.scores} accent={A_COLOR} compareAccent={B_COLOR} size={210} /></div>
            <SideHead side={cmp.b} color={B_COLOR} align="right" />
          </div>
        </div>

        {/* characteristics */}
        <div className="sheen mt-4 overflow-hidden rounded-2xl" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          {cmp.rows.map((row, i) => (
            <div key={row.label} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[120px_1fr_1fr] sm:gap-4" style={{ borderTop: i === 0 ? undefined : "1px solid var(--border)" }}>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{row.label}</div>
              <div className="text-[12.5px] leading-snug sm:border-l sm:pl-3" style={{ color: "var(--text-dim)", borderColor: "var(--border)" }}>{row.a}</div>
              <div className="text-[12.5px] leading-snug sm:border-l sm:pl-3" style={{ color: "var(--text-dim)", borderColor: "var(--border)" }}>{row.b}</div>
            </div>
          ))}
        </div>

        {/* best for */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[{ side: cmp.a, color: A_COLOR }, { side: cmp.b, color: B_COLOR }].map(({ side, color }) => (
            <div key={side.name} className="rounded-2xl p-3.5" style={{ background: `${color}14`, border: `1px solid ${color}40` }}>
              <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>Choose {side.name} when</div>
              <p className="mt-1 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{side.bestFor}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
