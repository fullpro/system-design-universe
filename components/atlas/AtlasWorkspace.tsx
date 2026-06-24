"use client";

import { motion } from "framer-motion";
import { Building2, Cpu, GitBranch, Share2 } from "lucide-react";
import { useUniverse } from "@/lib/store";
import type { AtlasTab } from "@/lib/types";
import { ConfidenceLegend } from "./ConfidenceBadge";
import { CompaniesView } from "./CompaniesView";
import { TechnologiesView } from "./TechnologiesView";
import { EvolutionStoriesView } from "./EvolutionStoriesView";
import { KnowledgeGraphView } from "./KnowledgeGraphView";

const TABS: { id: AtlasTab; label: string; short: string; icon: React.ReactNode; blurb: string }[] = [
  { id: "companies", label: "Companies", short: "Companies", icon: <Building2 size={14} />, blurb: "Real systems by org" },
  { id: "technologies", label: "Technology Origins", short: "Tech", icon: <Cpu size={14} />, blurb: "Why they were built" },
  { id: "evolution", label: "Evolution Stories", short: "Stories", icon: <GitBranch size={14} />, blurb: "Problem → invention" },
  { id: "graph", label: "Knowledge Graph", short: "Graph", icon: <Share2 size={14} />, blurb: "How it all connects" },
];

export function AtlasWorkspace() {
  const atlasTab = useUniverse((s) => s.atlasTab);
  const setAtlasTab = useUniverse((s) => s.setAtlasTab);

  return (
    <div className="absolute inset-x-0 bottom-0 top-[56px] z-20 flex flex-col sm:top-[64px]">
      {/* Sub-nav */}
      <div className="flex items-center justify-center gap-3 px-2 pt-2 sm:px-3">
        <div className="glass sheen flex max-w-full items-center gap-0.5 overflow-x-auto rounded-2xl p-1 sm:gap-1">
          {TABS.map((tab) => {
            const active = atlasTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAtlasTab(tab.id)}
                className="relative flex shrink-0 items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors sm:gap-1.5 sm:px-3 sm:text-[12.5px]"
                style={{ color: active ? "#fff" : "var(--text-dim)" }}
              >
                {active && (
                  <motion.span
                    layoutId="atlasPill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.45)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10 text-[10px] sm:text-[12.5px]">
                  <span className="sm:hidden">{tab.short}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confidence legend — shown on companies and technologies tabs */}
      {(atlasTab === "companies" || atlasTab === "technologies" || atlasTab === "evolution") && (
        <div className="flex justify-center px-3 pt-2">
          <ConfidenceLegend />
        </div>
      )}

      {/* Active view */}
      <div className="scroll-fade flex-1 overflow-y-auto">
        {atlasTab === "companies" && <CompaniesView />}
        {atlasTab === "technologies" && <TechnologiesView />}
        {atlasTab === "evolution" && <EvolutionStoriesView />}
        {atlasTab === "graph" && <KnowledgeGraphView />}
      </div>
    </div>
  );
}
