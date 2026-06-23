"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick, Send } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { useIsMobile } from "@/lib/useIsMobile";
import { usePersistence } from "@/lib/persistence";
import { JOURNEYS } from "@/lib/journey";
import { Canvas } from "./Canvas";
import { TopBar } from "./panels/TopBar";
import { DetailPanel } from "./panels/DetailPanel";
import { SimulatorBar } from "./panels/SimulatorBar";
import { EvolutionBar } from "./panels/EvolutionBar";
import { JourneyBar } from "./panels/JourneyBar";
import { InternalsHeader } from "./panels/InternalsHeader";
import { Legend } from "./panels/Legend";
import { LearnGallery } from "./panels/LearnGallery";
import { ReasonWorkspace } from "./reason/ReasonWorkspace";
import { Studio } from "./studio/Studio";
import { Onboarding } from "./panels/Onboarding";
import { CommandPalette } from "./panels/CommandPalette";

function BottomCTA() {
  const startJourney = useUniverse((s) => s.startJourney);

  const journeyColors: Record<string, { bg: string; border: string; color: string }> = {
    read: { bg: "rgba(99,102,241,0.25)", border: "rgba(99,102,241,0.5)", color: "#c7d2fe" },
    write: { bg: "rgba(234,88,12,0.2)", border: "rgba(234,88,12,0.45)", color: "#fed7aa" },
    "cache-hit": { bg: "rgba(34,197,94,0.2)", border: "rgba(34,197,94,0.45)", color: "#bbf7d0" },
    "async-job": { bg: "rgba(168,85,247,0.2)", border: "rgba(168,85,247,0.45)", color: "#e9d5ff" },
    "cdn-static": { bg: "rgba(59,130,246,0.2)", border: "rgba(59,130,246,0.45)", color: "#bfdbfe" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.3 }}
      className="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5"
    >
      <div className="pointer-events-auto flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {JOURNEYS.map((journey) => {
          const colors = journeyColors[journey.id] || journeyColors.read;
          return (
            <motion.button
              key={journey.id}
              onClick={() => startJourney(journey.id)}
              className="glass sheen flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all hover:brightness-110 sm:px-4 sm:py-2 sm:text-[12px]"
              style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.color }}
              title={journey.sublabel}
            >
              <Send size={13} className="shrink-0" />
              <span className="sm:hidden">{journey.short}</span>
              <span className="hidden sm:inline">{journey.label}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-[12px]" style={{ color: "var(--text-dim)" }}>
        <MousePointerClick size={12} className="shrink-0" style={{ color: "#a5b4fc" }} />
        <span className="sm:hidden">Tap a node · pinch to zoom</span>
        <span className="hidden sm:inline">Click any node to dive in · scroll to zoom · drag to pan</span>
      </div>
    </motion.div>
  );
}

export function Universe() {
  const mode = useUniverse((s) => s.mode);
  const selected = useUniverse((s) => s.selectedConceptId);
  const journeyStep = useUniverse((s) => s.journeyStep);
  const onJourney = mode === "map" && journeyStep !== null;
  const mobile = useIsMobile();
  usePersistence();

  // Reserve space around the canvas for the overlay chrome so React Flow's
  // fitView frames the graph in the *visible* area, never behind a panel.
  // On mobile the detail panel is full-width overlay, so no right inset.
  const panelOpen = Boolean(selected) && mode !== "internals";
  const canvasInset: React.CSSProperties = {
    top: mobile ? 48 : 56,
    left: 0,
    right: panelOpen && !mobile ? 440 : 0,
    bottom: mode === "simulator" ? (mobile ? 200 : 256) : mode === "evolution" ? (mobile ? 160 : 200) : onJourney ? (mobile ? 160 : 200) : 16,
  };

  return (
    <main className="relative w-screen overflow-hidden" style={{ height: "100dvh" }}>
      <div className="universe-bg" />

      {mode !== "learn" && mode !== "reason" && mode !== "studio" && (
        <div className="absolute" style={canvasInset}>
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </div>
      )}

      {mode === "learn" && <LearnGallery />}
      {mode === "reason" && <ReasonWorkspace />}
      {mode === "studio" && <Studio />}

      <TopBar />

      {mode === "map" && <Legend />}

      <AnimatePresence>{mode === "internals" && <InternalsHeader key="internals-header" />}</AnimatePresence>
      <AnimatePresence>{mode === "simulator" && <SimulatorBar key="sim-bar" />}</AnimatePresence>
      <AnimatePresence>{mode === "evolution" && <EvolutionBar key="evo-bar" />}</AnimatePresence>
      <AnimatePresence>{onJourney && <JourneyBar key="journey-bar" />}</AnimatePresence>

      <DetailPanel />

      <AnimatePresence>
        {mode === "map" && !onJourney && !selected && <BottomCTA key="bottom-cta" />}
      </AnimatePresence>

      <CommandPalette />
      <Onboarding />
    </main>
  );
}
