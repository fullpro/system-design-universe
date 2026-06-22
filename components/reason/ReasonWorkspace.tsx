"use client";

import { motion } from "framer-motion";
import { Sparkles, Stethoscope, SlidersHorizontal, Bomb, GitCompare, ClipboardList } from "lucide-react";
import { useUniverse } from "@/lib/store";
import type { ReasonTab } from "@/lib/types";
import { AdvisorView } from "./AdvisorView";
import { DiagnosisView } from "./DiagnosisView";
import { TradeoffView } from "./TradeoffView";
import { FailureView } from "./FailureView";
import { ComparisonView } from "./ComparisonView";
import { InterviewView } from "./InterviewView";

const TABS: { id: ReasonTab; label: string; icon: React.ReactNode; blurb: string }[] = [
  { id: "advisor", label: "Architecture Advisor", icon: <Sparkles size={14} />, blurb: "Constraints → architecture" },
  { id: "diagnose", label: "Bottleneck Diagnosis", icon: <Stethoscope size={14} />, blurb: "Symptoms → root cause" },
  { id: "tradeoff", label: "Tradeoff Lab", icon: <SlidersHorizontal size={14} />, blurb: "Priorities → archetype" },
  { id: "failure", label: "Failure Simulator", icon: <Bomb size={14} />, blurb: "Break it → watch it cascade" },
  { id: "compare", label: "Comparison", icon: <GitCompare size={14} />, blurb: "Two options, side by side" },
  { id: "interview", label: "Interview Challenge", icon: <ClipboardList size={14} />, blurb: "Build it → get graded" },
];

export function ReasonWorkspace() {
  const reasonTab = useUniverse((s) => s.reasonTab);
  const setReasonTab = useUniverse((s) => s.setReasonTab);

  return (
    <div className="absolute inset-x-0 bottom-0 top-[56px] z-20 flex flex-col sm:top-[64px]">
      {/* sub-nav */}
      <div className="flex justify-center px-2 pt-2 sm:px-3">
        <div className="glass sheen flex max-w-full items-center gap-0.5 overflow-x-auto rounded-2xl p-1 sm:gap-1">
          {TABS.map((tab) => {
            const active = reasonTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setReasonTab(tab.id)}
                className="relative flex shrink-0 items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors sm:gap-1.5 sm:px-3 sm:text-[12.5px]"
                style={{ color: active ? "#fff" : "var(--text-dim)" }}
              >
                {active && (
                  <motion.span layoutId="reasonPill" className="absolute inset-0 rounded-xl" style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.45)" }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* active view */}
      <div className="scroll-fade flex-1 overflow-y-auto">
        {reasonTab === "advisor" && <AdvisorView />}
        {reasonTab === "diagnose" && <DiagnosisView />}
        {reasonTab === "tradeoff" && <TradeoffView />}
        {reasonTab === "failure" && <FailureView />}
        {reasonTab === "compare" && <ComparisonView />}
        {reasonTab === "interview" && <InterviewView />}
      </div>
    </div>
  );
}
