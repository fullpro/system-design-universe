"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Compass, Gauge, GitBranch, Blocks, BrainCircuit, GraduationCap, Check, ArrowRight, Orbit } from "lucide-react";
import { useUniverse } from "@/lib/store";
import type { ViewMode } from "@/lib/types";

interface Step {
  mode: ViewMode;
  label: string;
  blurb: string;
  icon: React.ReactNode;
}

/** The deliberate learning path: spatial → causal → temporal → synthesis. */
const PATH: Step[] = [
  { mode: "map", label: "Explore the map", blurb: "See where every piece sits in one request's journey — then zoom into how any of them works.", icon: <Compass size={16} /> },
  { mode: "simulator", label: "Feel a bottleneck", blurb: "Crank traffic until something overheats, then watch the right fix cool it down.", icon: <Gauge size={16} /> },
  { mode: "evolution", label: "Grow a system", blurb: "Step from one server to multi-region — one scaling decision at a time, justified by real pain.", icon: <GitBranch size={16} /> },
  { mode: "studio", label: "Build your own", blurb: "Assemble an architecture from a palette and get a live, graded expert review.", icon: <Blocks size={16} /> },
  { mode: "reason", label: "Think like an architect", blurb: "Turn constraints into a justified design, diagnose incidents, and weigh tradeoffs.", icon: <BrainCircuit size={16} /> },
];

export function Onboarding() {
  const hydrated = useUniverse((s) => s.hydrated);
  const hasOnboarded = useUniverse((s) => s.hasOnboarded);
  const visited = useUniverse((s) => s.visitedModes);
  const completeOnboarding = useUniverse((s) => s.completeOnboarding);
  const setMode = useUniverse((s) => s.setMode);

  const open = hydrated && !hasOnboarded;
  const go = (mode: ViewMode) => {
    setMode(mode);
    completeOnboarding();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(4,5,9,0.78)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass sheen scroll-fade max-h-[88dvh] w-full max-w-[480px] overflow-y-auto rounded-3xl p-6"
            style={{ boxShadow: "0 40px 100px -30px rgba(0,0,0,0.9)" }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "rgba(99,102,241,0.18)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.35)" }}>
                <Orbit size={24} strokeWidth={1.7} />
              </span>
              <div>
                <h2 className="text-[19px] font-bold tracking-tight" style={{ color: "var(--text)" }}>Welcome to the Universe</h2>
                <p className="text-[12px]" style={{ color: "var(--text-dim)" }}>Build a complete mental model of distributed systems — by exploring, not memorising.</p>
              </div>
            </div>

            <p className="mt-4 text-[12.5px] font-medium uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
              A path that builds on itself
            </p>

            <div className="mt-2 space-y-1.5">
              {PATH.map((step, i) => {
                const done = visited.includes(step.mode);
                return (
                  <button
                    key={step.mode}
                    onClick={() => go(step.mode)}
                    className="group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all hover:-translate-y-0.5"
                    style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
                  >
                    <span
                      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: done ? "rgba(52,211,153,0.16)" : "rgba(99,102,241,0.14)", color: done ? "var(--good)" : "#a5b4fc", border: `1px solid ${done ? "rgba(52,211,153,0.4)" : "rgba(99,102,241,0.3)"}` }}
                    >
                      {done ? <Check size={16} /> : step.icon}
                      <span className="absolute -left-[7px] top-1/2 hidden h-1 w-1 -translate-y-1/2 rounded-full sm:block" style={{ background: "var(--text-faint)" }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: "var(--text-faint)" }}>{i + 1}</span>
                        <span className="text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>{step.label}</span>
                      </div>
                      <p className="text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{step.blurb}</p>
                    </div>
                    <ArrowRight size={15} className="shrink-0 opacity-40 transition-opacity group-hover:opacity-100" style={{ color: "#a5b4fc" }} />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => go("map")}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}
              >
                Start with the map <ArrowRight size={14} />
              </button>
              <button
                onClick={completeOnboarding}
                className="rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-white/10"
                style={{ color: "var(--text-dim)", border: "1px solid var(--border)" }}
              >
                Explore freely
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px]" style={{ color: "var(--text-faint)" }}>
              <GraduationCap size={12} /> The atlas (Learn) holds all {""}45 lessons & 7 tools whenever you want them.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
