"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, RotateCcw, Sparkles, Users, Timer, ShieldCheck, Wrench, ArrowRight } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { SIM_TIERS, SIM_SOLUTIONS, computeSimulation, formatAvailability, formatDowntime } from "@/lib/simulator";
import { getConcept } from "@/lib/concepts";
import { Icon } from "@/components/ui/Icon";

function latencyColor(ms: number): string {
  if (ms < 40) return "var(--good)";
  if (ms < 120) return "var(--warn)";
  return "var(--bad)";
}

function BeforeAfter({ label, before, after, good }: { label: string; before: string; after: string; good: boolean }) {
  return (
    <div className="text-center">
      <div className="text-[8.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{label}</div>
      <div className="flex items-center gap-1 text-[11.5px] font-medium tabular-nums">
        <span style={{ color: "var(--text-faint)", textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.25)" }}>{before}</span>
        <ArrowRight size={10} style={{ color: "var(--text-faint)" }} />
        <span style={{ color: good ? "var(--good)" : "var(--text)" }}>{after}</span>
      </div>
    </div>
  );
}

const BOTTLENECK_LABEL: Record<string, string> = {
  db: "Database",
  app: "Application tier",
};

export function SimulatorBar() {
  const trafficTier = useUniverse((s) => s.trafficTier);
  const enabledSolutions = useUniverse((s) => s.enabledSolutions);
  const setTrafficTier = useUniverse((s) => s.setTrafficTier);
  const toggleSolution = useUniverse((s) => s.toggleSolution);
  const resetSimulator = useUniverse((s) => s.resetSimulator);

  const sim = computeSimulation(trafficTier, new Set(enabledSolutions));
  const tier = SIM_TIERS[trafficTier];

  // Pick the recommendation that most improves p99, and project its before/after.
  let rec:
    | { id: string; sol: (typeof SIM_SOLUTIONS)[number]; after: ReturnType<typeof computeSimulation>; gain: number }
    | null = null;
  if (sim.bottleneck && sim.suggestions.length) {
    for (const id of sim.suggestions) {
      const after = computeSimulation(trafficTier, new Set([...enabledSolutions, id]));
      const gain = sim.p99Latency - after.p99Latency;
      const sol = SIM_SOLUTIONS.find((s) => s.id === id);
      if (sol && (!rec || gain > rec.gain)) rec = { id, sol, after, gain };
    }
  }

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="glass sheen absolute inset-x-3 bottom-3 z-30 rounded-3xl px-5 py-4"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Traffic dial */}
        <div className="lg:w-[320px] lg:shrink-0">
          <div className="mb-1.5 flex items-end justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              <Users size={12} /> Traffic
            </span>
            <span className="text-right">
              <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--text)" }}>{tier.users}</span>
              <span className="ml-1.5 text-[11px]" style={{ color: "var(--text-faint)" }}>users · {tier.rps}</span>
            </span>
          </div>
          <input
            type="range"
            className="dial w-full"
            min={0}
            max={SIM_TIERS.length - 1}
            step={1}
            value={trafficTier}
            onChange={(e) => setTrafficTier(Number(e.target.value))}
          />
          <div className="mt-1 flex justify-between">
            {SIM_TIERS.map((t, i) => (
              <button
                key={t.users}
                onClick={() => setTrafficTier(i)}
                className="text-[9.5px] font-medium tabular-nums transition-colors"
                style={{ color: i === trafficTier ? "#a5b4fc" : "var(--text-faint)" }}
              >
                {t.users.replace(",000,000", "M").replace(",000", "K")}
              </button>
            ))}
          </div>
        </div>

        {/* Status + narrative */}
        <div className="min-w-0 flex-1 lg:border-l lg:pl-5" style={{ borderColor: "var(--border)" }}>
          <AnimatePresence mode="wait">
            {sim.bottleneck ? (
              <motion.div
                key="bottleneck"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2.5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(248,113,113,0.16)", color: "var(--bad)" }}>
                  <AlertTriangle size={15} />
                </span>
                <div>
                  <span className="text-[13.5px] font-semibold" style={{ color: "var(--bad)" }}>
                    {BOTTLENECK_LABEL[sim.bottleneck] ?? sim.bottleneck} is the bottleneck
                  </span>
                  <span className="ml-1.5 text-[12px] tabular-nums" style={{ color: "var(--text-faint)" }}>
                    · {Math.round(sim.bottleneckHeat * 100)}% load
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="healthy" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(52,211,153,0.16)", color: "var(--good)" }}>
                  <CheckCircle2 size={15} />
                </span>
                <span className="text-[13.5px] font-semibold" style={{ color: "var(--good)" }}>Healthy at this scale</span>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-1.5 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
            {sim.bottleneck || trafficTier === 0
              ? sim.narrative
              : "Solved — your architecture absorbs this scale. Slide traffic higher to uncover the next bottleneck."}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-medium tabular-nums"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
            >
              <Timer size={12} style={{ color: latencyColor(sim.p99Latency) }} />
              p99 <span style={{ color: latencyColor(sim.p99Latency) }}>~{sim.p99Latency} ms</span>
            </span>
            <span
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-medium tabular-nums"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
            >
              <ShieldCheck size={12} style={{ color: "var(--good)" }} />
              <span style={{ color: "var(--good)" }}>{formatAvailability(sim.availability)}</span>
              <span style={{ color: "var(--text-faint)" }}>{formatDowntime(sim.availability)}</span>
            </span>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={resetSimulator}
          className="hidden items-center gap-1.5 self-start rounded-xl px-3 py-2 text-[12px] font-medium transition-colors hover:bg-white/10 lg:flex"
          style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      {/* Recommendation reasoning + projected before/after */}
      <AnimatePresence>
        {rec && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-2xl"
            style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.22)" }}
          >
            <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2.5 lg:w-[300px] lg:shrink-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(251,191,36,0.16)", color: "var(--warn)" }}>
                  <Wrench size={15} />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--warn)" }}>
                    Recommended fix
                  </div>
                  <div className="text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>
                    Add {rec.sol.name}
                  </div>
                </div>
              </div>

              <p className="min-w-0 flex-1 text-[12px] leading-snug lg:border-l lg:pl-3" style={{ color: "var(--text-dim)", borderColor: "var(--border)" }}>
                <span style={{ color: "var(--text)" }}>Why: </span>{rec.sol.effect}
              </p>

              {/* Projected before → after */}
              <div className="flex shrink-0 items-center gap-3">
                <BeforeAfter label="p99" before={`${sim.p99Latency}ms`} after={`${rec.after.p99Latency}ms`} good={rec.after.p99Latency < sim.p99Latency} />
                <BeforeAfter label="uptime" before={formatAvailability(sim.availability)} after={formatAvailability(rec.after.availability)} good={rec.after.availability >= sim.availability} />
                <button
                  onClick={() => toggleSolution(rec!.id)}
                  className="flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-[12.5px] font-semibold transition-all hover:brightness-110"
                  style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.5)", color: "var(--warn)" }}
                >
                  <Sparkles size={13} /> Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solution toggles */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
        <span className="mr-1 text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
          Solutions
        </span>
        {SIM_SOLUTIONS.map((sol) => {
          const active = enabledSolutions.includes(sol.id);
          const suggested = sim.suggestions.includes(sol.id);
          const concept = getConcept(sol.conceptId);
          return (
            <button
              key={sol.id}
              onClick={() => toggleSolution(sol.id)}
              title={sol.effect}
              className="relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all"
              style={{
                background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? "rgba(129,140,248,0.6)" : suggested ? "rgba(251,191,36,0.55)" : "var(--border)"}`,
                color: active ? "#c7d2fe" : suggested ? "var(--warn)" : "var(--text-dim)",
                boxShadow: suggested && !active ? "0 0 18px -4px rgba(251,191,36,0.5)" : undefined,
              }}
            >
              {concept && <Icon name={concept.icon} size={13} />}
              {sol.name}
              {suggested && !active && (
                <span className="ml-0.5 flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide">
                  <Sparkles size={9} /> try
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
