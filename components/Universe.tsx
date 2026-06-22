"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick, Send } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { useIsMobile } from "@/lib/useIsMobile";
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

function BottomCTA() {
  const startJourney = useUniverse((s) => s.startJourney);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.3 }}
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 pb-[max(12px,env(safe-area-inset-bottom))] sm:pb-4"
    >
      <motion.button
        onClick={startJourney}
        className="glass sheen flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold transition-all hover:brightness-110 sm:px-5 sm:py-2.5 sm:text-[13px]"
        style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}
      >
        <Send size={15} className="shrink-0" />
        <span className="sm:hidden">Send a request</span>
        <span className="hidden sm:inline">Send a request through the system</span>
        <span className="hidden rounded-md px-1.5 py-0.5 font-mono text-[10px] sm:inline-block" style={{ background: "rgba(255,255,255,0.08)", color: "#a5b4fc" }}>
          GET /products
        </span>
      </motion.button>
      <div className="flex items-center gap-2 text-[11px] sm:text-[12px]" style={{ color: "var(--text-dim)" }}>
        <MousePointerClick size={13} className="shrink-0" style={{ color: "#a5b4fc" }} />
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
    <main className="relative h-screen w-screen overflow-hidden">
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
    </main>
  );
}
