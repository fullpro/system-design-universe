"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Minus, Wrench } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { PRIORITIES, matchArchetypes, BALANCED_PRIORITIES } from "@/lib/reasoning/tradeoff";
import { scoreArchitecture } from "@/lib/reasoning/scoring";
import { overallScore } from "@/lib/reasoning/axes";
import { getConcept } from "@/lib/concepts";
import { Radar } from "./Radar";
import { Field, Slider } from "./controls";

const VIRTUAL_LABELS: Record<string, string> = {
  microservices: "Microservices",
  "multi-region": "Multi-Region",
};
function labelFor(id: string): string {
  return VIRTUAL_LABELS[id] ?? getConcept(id)?.name ?? id;
}

export function TradeoffView() {
  const priorities = useUniverse((s) => s.priorities);
  const setPriority = useUniverse((s) => s.setPriority);
  const applyPriorities = useUniverse((s) => s.applyPriorities);

  const ranked = useMemo(() => matchArchetypes(priorities), [priorities]);
  const top = ranked[0];
  const scores = useMemo(() => scoreArchitecture(top.archetype.components), [top]);

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-5 py-6 lg:grid-cols-[320px_1fr]">
      {/* sliders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>What do you value?</h2>
            <p className="text-[12px]" style={{ color: "var(--text-dim)" }}>You can't max everything — that's the point.</p>
          </div>
          <button onClick={() => applyPriorities(BALANCED_PRIORITIES)} className="rounded-lg px-2 py-1 text-[11px] font-medium" style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}>Reset</button>
        </div>
        <div className="sheen space-y-4 rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          {PRIORITIES.map((p) => (
            <Field key={p.id} label={p.label} value={`${priorities[p.id]}`}>
              <Slider value={priorities[p.id]} min={0} max={100} step={5} onChange={(v) => setPriority(p.id, v)} />
              <div className="mt-1 text-[10.5px]" style={{ color: "var(--text-faint)" }}>{p.hint}</div>
            </Field>
          ))}
        </div>
      </div>

      {/* recommendation */}
      <div className="space-y-5">
        <motion.div key={top.archetype.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sheen rounded-2xl p-5" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(129,140,248,0.35)" }}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: "rgba(129,140,248,0.2)", color: "#a5b4fc" }}>best fit · {top.fit}%</span>
                <span className="text-3xl font-bold tabular-nums" style={{ color: "#a5b4fc" }}>{overallScore(scores)}</span>
                <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>score</span>
              </div>
              <h3 className="mt-2 text-xl font-bold" style={{ color: "var(--text)" }}>{top.archetype.name}</h3>
              <p className="mt-1 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{top.archetype.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {top.archetype.components.map((id) => (
                  <span key={id} className="rounded-md px-1.5 py-0.5 text-[10.5px]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>{labelFor(id)}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0 self-center"><Radar scores={scores} size={190} /></div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              {top.archetype.pros.map((p) => (
                <div key={p} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
                  <Check size={13} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} />{p}
                </div>
              ))}
            </div>
            <div>
              {top.archetype.cons.map((c) => (
                <div key={c} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
                  <Minus size={13} className="mt-0.5 shrink-0" style={{ color: "var(--bad)" }} />{c}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-xl p-2.5 text-[11.5px] leading-snug" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>
            <Wrench size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-faint)" }} />
            <span><span style={{ color: "var(--text-faint)" }}>Operational cost: </span>{top.archetype.ops}</span>
          </div>
        </motion.div>

        {/* ranking */}
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>How the archetypes fit your priorities</div>
          <div className="space-y-1.5">
            {ranked.map((m, i) => (
              <div key={m.archetype.id} className="flex items-center gap-3">
                <span className="w-[150px] shrink-0 text-[12px]" style={{ color: i === 0 ? "var(--text)" : "var(--text-dim)" }}>{m.archetype.name}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div animate={{ width: `${m.fit}%` }} className="h-full rounded-full" style={{ background: i === 0 ? "#818cf8" : "rgba(129,140,248,0.4)" }} />
                </div>
                <span className="w-9 shrink-0 text-right text-[11px] tabular-nums" style={{ color: "var(--text-faint)" }}>{m.fit}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
