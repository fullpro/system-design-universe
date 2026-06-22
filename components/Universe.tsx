"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick, Send } from "lucide-react";
import { useUniverse } from "@/lib/store";
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

function HintPill() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ delay: 0.4 }}
      className="glass sheen absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[12px]"
      style={{ color: "var(--text-dim)" }}
    >
      <MousePointerClick size={14} style={{ color: "#a5b4fc" }} />
      Click any node to dive in · scroll to zoom · drag to pan
    </motion.div>
  );
}

function LaunchRequest() {
  const startJourney = useUniverse((s) => s.startJourney);
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      onClick={startJourney}
      className="glass sheen absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all hover:brightness-110"
      style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}
    >
      <Send size={15} />
      Send a request through the system
      <span className="rounded-md px-1.5 py-0.5 font-mono text-[10px]" style={{ background: "rgba(255,255,255,0.08)", color: "#a5b4fc" }}>
        GET /products
      </span>
    </motion.button>
  );
}

export function Universe() {
  const mode = useUniverse((s) => s.mode);
  const selected = useUniverse((s) => s.selectedConceptId);
  const journeyStep = useUniverse((s) => s.journeyStep);
  const onJourney = mode === "map" && journeyStep !== null;

  // Reserve space around the canvas for the overlay chrome so React Flow's
  // fitView frames the graph in the *visible* area, never behind a panel.
  const panelOpen = Boolean(selected) && mode !== "internals";
  const canvasInset: React.CSSProperties = {
    top: 72,
    left: 0,
    right: panelOpen ? 440 : 0,
    bottom: mode === "simulator" ? 256 : mode === "evolution" ? 200 : onJourney ? 200 : 16,
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
        {mode === "map" && !onJourney && !selected && <LaunchRequest key="launch" />}
        {mode === "map" && !onJourney && !selected && <HintPill key="hint" />}
      </AnimatePresence>
    </main>
  );
}
