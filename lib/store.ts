import { create } from "zustand";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { ViewMode, ReasonTab, AtlasTab, CategoryId } from "./types";
import { SIM_TIERS } from "./simulator";
import { EVOLUTION_STAGES } from "./evolution";
import { JOURNEYS } from "./journey";
import { type Requirements, DEFAULT_REQUIREMENTS } from "./reasoning/requirements";
import { type PriorityVector, type PriorityId, BALANCED_PRIORITIES } from "./reasoning/tradeoff";
import { SCENARIOS } from "./reasoning/scenarios";

interface UniverseState {
  /** Active canvas mode. */
  mode: ViewMode;
  /** The mode before entering internals; used to restore on back. */
  priorMode: ViewMode;

  // Global overlays
  /** Command palette (⌘K) visibility. */
  commandOpen: boolean;
  /** Interactive tool open in a modal from anywhere (Learn or the palette). */
  activeToolId: string | null;

  // Onboarding & progress (persisted)
  /** True once the user has dismissed the first-run welcome. */
  hasOnboarded: boolean;
  /** True after persisted state has been read from localStorage (avoids SSR flash). */
  hydrated: boolean;
  /** Modes the user has visited at least once — drives learning-path progress. */
  visitedModes: ViewMode[];
  /** Concept ids the user has opened the full lesson for. */
  studiedConcepts: string[];
  /** Lesson density: "beginner" collapses depth; "deep" expands everything. */
  lessonDensity: "beginner" | "deep";
  /** Concept whose detail panel is open (null = closed). */
  selectedConceptId: string | null;
  /** Concept whose internals are being explored in "internals" mode. */
  zoomedConceptId: string | null;
  /** World-Map layer focus; non-matching nodes recede. null = show all. */
  layerFilter: CategoryId | null;

  // Internals playback / failure inspection
  internalsStep: number | null;
  internalsPlaying: boolean;
  internalsFailure: string | null;

  // Design Studio (freeform builder) — persisted so the design survives tab switches.
  studioNodes: RFNode[];
  studioEdges: RFEdge[];

  // Simulator
  trafficTier: number;
  enabledSolutions: string[];

  // Evolution
  evolutionStage: number;
  /** Stage whose problem-gate question is currently posed (null = none). */
  evoChallenge: number | null;
  /** Stages whose gate has already been answered. */
  evoSolved: number[];

  // Request Journey (Explore mode) — index of the active hop, or null when idle.
  journeyId: string;
  journeyStep: number | null;
  journeyPlaying: boolean;

  // Reasoning Engine
  reasonTab: ReasonTab;
  requirements: Requirements;
  priorities: PriorityVector;
  scenarioIndex: number;
  diagSelected: string | null;
  diagRevealed: boolean;

  // Real Systems Atlas
  atlasTab: AtlasTab;
  atlasCompanyId: string | null;
  atlasTechId: string | null;

  // Actions
  setCommandOpen: (open: boolean) => void;
  openTool: (id: string) => void;
  closeTool: () => void;
  completeOnboarding: () => void;
  reopenOnboarding: () => void;
  setLessonDensity: (d: "beginner" | "deep") => void;
  hydratePersisted: (patch: Partial<UniverseState>) => void;
  setMode: (mode: ViewMode) => void;
  selectConcept: (id: string) => void;
  closeDetail: () => void;
  zoomInto: (id: string) => void;
  exitInternals: () => void;
  setLayerFilter: (cat: CategoryId | null) => void;

  setInternalsStep: (i: number | null) => void;
  internalsNext: (total: number) => void;
  internalsPrev: () => void;
  toggleInternalsPlay: (total: number) => void;
  setInternalsFailure: (id: string | null) => void;

  setStudioNodes: (u: RFNode[] | ((p: RFNode[]) => RFNode[])) => void;
  setStudioEdges: (u: RFEdge[] | ((p: RFEdge[]) => RFEdge[])) => void;
  clearStudio: () => void;

  setTrafficTier: (tier: number) => void;
  toggleSolution: (id: string) => void;
  setEnabledSolutions: (ids: string[]) => void;
  resetSimulator: () => void;
  /** Jump from Build into Simulate, pre-configured from the user's design. */
  stressTestDesign: (solutions: string[], tier?: number) => void;

  setEvolutionStage: (stage: number) => void;
  nextEvolution: () => void;
  prevEvolution: () => void;
  answerEvolution: () => void;
  dismissEvolutionChallenge: () => void;

  startJourney: (id?: string) => void;
  setJourneyId: (id: string) => void;
  endJourney: () => void;
  journeyNext: () => void;
  journeyPrev: () => void;
  setJourneyStep: (i: number) => void;
  toggleJourneyPlay: () => void;

  setAtlasTab: (tab: AtlasTab) => void;
  selectAtlasCompany: (id: string | null) => void;
  selectAtlasTech: (id: string | null) => void;

  setReasonTab: (tab: ReasonTab) => void;
  setRequirements: (patch: Partial<Requirements>) => void;
  applyRequirements: (values: Requirements) => void;
  setPriority: (id: PriorityId, value: number) => void;
  applyPriorities: (values: PriorityVector) => void;
  answerScenario: (optionId: string) => void;
  gotoScenario: (index: number) => void;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const useUniverse = create<UniverseState>((set) => ({
  mode: "map",
  priorMode: "map",
  commandOpen: false,
  activeToolId: null,
  hasOnboarded: false,
  hydrated: false,
  visitedModes: [],
  studiedConcepts: [],
  lessonDensity: "beginner",
  selectedConceptId: null,
  zoomedConceptId: null,
  layerFilter: null,
  internalsStep: null,
  internalsPlaying: false,
  internalsFailure: null,
  studioNodes: [],
  studioEdges: [],
  trafficTier: 0,
  enabledSolutions: [],
  evolutionStage: 0,
  evoChallenge: null,
  evoSolved: [],
  journeyId: "read",
  journeyStep: null,
  journeyPlaying: false,

  atlasTab: "companies",
  atlasCompanyId: null,
  atlasTechId: null,

  reasonTab: "advisor",
  requirements: DEFAULT_REQUIREMENTS,
  priorities: BALANCED_PRIORITIES,
  scenarioIndex: 0,
  diagSelected: null,
  diagRevealed: false,

  setCommandOpen: (open) => set({ commandOpen: open }),
  openTool: (id) => set({ activeToolId: id, commandOpen: false }),
  closeTool: () => set({ activeToolId: null }),
  completeOnboarding: () => set({ hasOnboarded: true }),
  reopenOnboarding: () => set({ hasOnboarded: false }),
  setLessonDensity: (d) => set({ lessonDensity: d }),
  hydratePersisted: (patch) => set({ ...patch, hydrated: true }),

  setMode: (mode) =>
    set((s) => ({
      mode,
      visitedModes: s.visitedModes.includes(mode) ? s.visitedModes : [...s.visitedModes, mode],
      priorMode: mode === "internals" ? s.priorMode : mode,
      // Leaving internals clears the zoom target; opening a fresh mode closes the panel.
      zoomedConceptId: mode === "internals" ? s.zoomedConceptId : null,
      selectedConceptId: mode === s.mode ? s.selectedConceptId : null,
      // A request journey only lives on the World Map.
      journeyStep: mode === "map" ? s.journeyStep : null,
      journeyPlaying: mode === "map" ? s.journeyPlaying : false,
    })),

  selectConcept: (id) =>
    set((s) => ({
      selectedConceptId: id,
      studiedConcepts: s.studiedConcepts.includes(id) ? s.studiedConcepts : [...s.studiedConcepts, id],
    })),
  closeDetail: () => set({ selectedConceptId: null }),

  zoomInto: (id) =>
    set((s) => ({
      priorMode: s.mode,
      mode: "internals",
      zoomedConceptId: id,
      selectedConceptId: id,
      internalsStep: null,
      internalsPlaying: false,
      internalsFailure: null,
    })),

  exitInternals: () =>
    set((s) => ({
      mode: s.priorMode,
      zoomedConceptId: null,
      selectedConceptId: null,
      internalsStep: null,
      internalsPlaying: false,
      internalsFailure: null,
    })),

  setLayerFilter: (cat) =>
    set((s) => ({ layerFilter: s.layerFilter === cat ? null : cat })),

  setInternalsStep: (i) => set({ internalsStep: i, internalsPlaying: false, internalsFailure: null }),
  internalsNext: (total) =>
    set((s) => {
      if (s.internalsStep === null) return { internalsStep: 0, internalsFailure: null };
      if (s.internalsStep >= total - 1) return { internalsPlaying: false };
      return { internalsStep: s.internalsStep + 1, internalsFailure: null };
    }),
  internalsPrev: () =>
    set((s) =>
      s.internalsStep === null
        ? s
        : { internalsStep: Math.max(0, s.internalsStep - 1), internalsPlaying: false, internalsFailure: null },
    ),
  toggleInternalsPlay: (total) =>
    set((s) => {
      if (s.internalsStep === null || (!s.internalsPlaying && s.internalsStep >= total - 1))
        return { internalsStep: 0, internalsPlaying: true, internalsFailure: null };
      return { internalsPlaying: !s.internalsPlaying };
    }),
  setInternalsFailure: (id) =>
    set((s) => ({ internalsFailure: s.internalsFailure === id ? null : id, internalsPlaying: false })),

  setStudioNodes: (u) =>
    set((s) => ({ studioNodes: typeof u === "function" ? u(s.studioNodes) : u })),
  setStudioEdges: (u) =>
    set((s) => ({ studioEdges: typeof u === "function" ? u(s.studioEdges) : u })),
  clearStudio: () => set({ studioNodes: [], studioEdges: [] }),

  setTrafficTier: (tier) => set({ trafficTier: clamp(tier, 0, SIM_TIERS.length - 1) }),
  toggleSolution: (id) =>
    set((s) => ({
      enabledSolutions: s.enabledSolutions.includes(id)
        ? s.enabledSolutions.filter((x) => x !== id)
        : [...s.enabledSolutions, id],
    })),
  setEnabledSolutions: (ids) => set({ enabledSolutions: [...new Set(ids)] }),
  resetSimulator: () => set({ trafficTier: 0, enabledSolutions: [] }),
  stressTestDesign: (solutions, tier = 3) =>
    set({ mode: "simulator", enabledSolutions: [...new Set(solutions)], trafficTier: clamp(tier, 0, SIM_TIERS.length - 1), selectedConceptId: null }),

  setEvolutionStage: (stage) =>
    set({ evolutionStage: clamp(stage, 0, EVOLUTION_STAGES.length - 1), evoChallenge: null }),
  nextEvolution: () =>
    set((s) => {
      const target = clamp(s.evolutionStage + 1, 0, EVOLUTION_STAGES.length - 1);
      if (target === s.evolutionStage) return s;
      // Gate the reveal behind the stage's problem-first question (once).
      if (EVOLUTION_STAGES[target].question && !s.evoSolved.includes(target)) {
        return { evoChallenge: target };
      }
      return { evolutionStage: target };
    }),
  prevEvolution: () =>
    set((s) => ({ evolutionStage: clamp(s.evolutionStage - 1, 0, EVOLUTION_STAGES.length - 1), evoChallenge: null })),
  answerEvolution: () =>
    set((s) =>
      s.evoChallenge === null
        ? s
        : {
            evolutionStage: s.evoChallenge,
            evoSolved: [...new Set([...s.evoSolved, s.evoChallenge])],
            evoChallenge: null,
          },
    ),
  dismissEvolutionChallenge: () => set({ evoChallenge: null }),

  // ── Request Journey ──────────────────────────────────────────────
  startJourney: (id) => set((s) => ({ journeyId: id ?? s.journeyId, journeyStep: 0, journeyPlaying: true, selectedConceptId: null, layerFilter: null })),
  setJourneyId: (id) => set({ journeyId: id, journeyStep: 0, journeyPlaying: false }),
  endJourney: () => set({ journeyStep: null, journeyPlaying: false }),
  journeyNext: () =>
    set((s) => {
      if (s.journeyStep === null) return s;
      const j = JOURNEYS.find((j) => j.id === s.journeyId) ?? JOURNEYS[0];
      if (s.journeyStep >= j.hops.length - 1) return { journeyPlaying: false };
      return { journeyStep: s.journeyStep + 1 };
    }),
  journeyPrev: () =>
    set((s) =>
      s.journeyStep === null
        ? s
        : { journeyStep: Math.max(0, s.journeyStep - 1), journeyPlaying: false },
    ),
  setJourneyStep: (i) =>
    set((s) => {
      const j = JOURNEYS.find((j) => j.id === s.journeyId) ?? JOURNEYS[0];
      return { journeyStep: clamp(i, 0, j.hops.length - 1), journeyPlaying: false };
    }),
  toggleJourneyPlay: () =>
    set((s) => {
      const j = JOURNEYS.find((j) => j.id === s.journeyId) ?? JOURNEYS[0];
      if (s.journeyStep === null) return { journeyStep: 0, journeyPlaying: true };
      if (!s.journeyPlaying && s.journeyStep >= j.hops.length - 1)
        return { journeyStep: 0, journeyPlaying: true };
      return { journeyPlaying: !s.journeyPlaying };
    }),

  setAtlasTab: (tab) => set({ atlasTab: tab, atlasCompanyId: null, atlasTechId: null }),
  selectAtlasCompany: (id) => set({ atlasCompanyId: id }),
  selectAtlasTech: (id) => set({ atlasTechId: id }),

  setReasonTab: (tab) => set({ reasonTab: tab, selectedConceptId: null }),
  setRequirements: (patch) => set((s) => ({ requirements: { ...s.requirements, ...patch } })),
  applyRequirements: (values) => set({ requirements: values }),
  setPriority: (id, value) =>
    set((s) => ({ priorities: { ...s.priorities, [id]: clamp(value, 0, 100) } })),
  applyPriorities: (values) => set({ priorities: values }),
  answerScenario: (optionId) =>
    set((s) => (s.diagRevealed ? s : { diagSelected: optionId, diagRevealed: true })),
  gotoScenario: (index) =>
    set({
      scenarioIndex: clamp(index, 0, SCENARIOS.length - 1),
      diagSelected: null,
      diagRevealed: false,
    }),
}));
