"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Gauge, GitBranch, Blocks, GraduationCap, BrainCircuit, Orbit, HelpCircle, X } from "lucide-react";
import { useUniverse } from "@/lib/store";
import type { ViewMode } from "@/lib/types";

const TABS: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: "map", label: "Explore", icon: <Compass size={15} /> },
  { id: "simulator", label: "Simulate", icon: <Gauge size={15} /> },
  { id: "evolution", label: "Evolve", icon: <GitBranch size={15} /> },
  { id: "studio", label: "Build", icon: <Blocks size={15} /> },
  { id: "learn", label: "Learn", icon: <GraduationCap size={15} /> },
  { id: "reason", label: "Reason", icon: <BrainCircuit size={15} /> },
];

const HELP = [
  { k: "Explore", v: "Pan & zoom the request lifecycle. Click any node for a full lesson, then zoom into its internals." },
  { k: "Simulate", v: "Crank up traffic and watch components overheat. Toggle solutions to relieve the bottleneck." },
  { k: "Evolve", v: "Step a system from one server to multi-region, one scaling decision at a time." },
  { k: "Build", v: "Design your own architecture from a palette and get a live expert review — scoring, single points of failure and missing pieces." },
  { k: "Learn", v: "The atlas: browse every concept and cross-cutting principle, plus interactive tools." },
  { k: "Reason", v: "Think like an architect: get a recommended design, diagnose bottlenecks, and weigh tradeoffs." },
];

export function TopBar() {
  const mode = useUniverse((s) => s.mode);
  const setMode = useUniverse((s) => s.setMode);
  const [helpOpen, setHelpOpen] = useState(false);

  const active: ViewMode = mode === "internals" ? "map" : mode;

  return (
    <header className="absolute inset-x-3 top-3 z-40 flex items-center justify-between">
      {/* Brand */}
      <div className="glass sheen flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(99,102,241,0.18)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.35)" }}>
          <Orbit size={18} strokeWidth={1.8} />
        </span>
        <div className="leading-tight">
          <div className="whitespace-nowrap text-[14px] font-bold tracking-tight" style={{ color: "var(--text)" }}>
            System Design Universe
          </div>
          <div className="hidden whitespace-nowrap text-[10px] xl:block" style={{ color: "var(--text-faint)" }}>
            Explore how every concept fits together
          </div>
        </div>
      </div>

      {/* Mode switcher */}
      <div className="glass sheen flex items-center gap-1 rounded-2xl p-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className="relative flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition-colors"
              style={{ color: isActive ? "#fff" : "var(--text-dim)" }}
            >
              {isActive && (
                <motion.span
                  layoutId="tabPill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.45)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Help */}
      <div className="relative">
        <button
          onClick={() => setHelpOpen((o) => !o)}
          className="glass sheen flex h-10 items-center gap-1.5 rounded-2xl px-3 text-[13px] font-medium transition-colors hover:brightness-125"
          style={{ color: "var(--text-dim)" }}
        >
          <HelpCircle size={16} /> <span className="hidden md:inline">Guide</span>
        </button>
        <AnimatePresence>
          {helpOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="glass sheen absolute right-0 top-12 w-[300px] rounded-2xl p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>How to explore</span>
                <button onClick={() => setHelpOpen(false)} style={{ color: "var(--text-faint)" }}><X size={15} /></button>
              </div>
              <div className="space-y-2.5">
                {HELP.map((h) => (
                  <div key={h.k}>
                    <div className="text-[12px] font-semibold" style={{ color: "#a5b4fc" }}>{h.k}</div>
                    <div className="text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{h.v}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
