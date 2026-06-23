/**
 * System Design Universe — core data model.
 *
 * Everything the canvas renders is derived from these types. New concepts are
 * added as data (see lib/concepts.ts), never as bespoke components, so the
 * content surface scales independently of the rendering code.
 */

export type CategoryId =
  | "client"
  | "networking"
  | "edge"
  | "traffic"
  | "application"
  | "cache"
  | "data"
  | "messaging"
  | "scalability"
  | "reliability"
  | "observability"
  | "analytics"
  | "foundation";

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
  /** Primary accent (hex). Drives node border, glow and icon tint. */
  accent: string;
}

export interface Alternative {
  name: string;
  note: string;
}

/** A single node inside a concept's "zoom-in" internal flow. */
export interface InternalNode {
  id: string;
  label: string;
  sublabel?: string;
  kind?: "start" | "step" | "decision" | "yes" | "no" | "terminal";
  /** A full sentence explaining what happens at this step, shown in the walkthrough. */
  detail?: string;
}

export interface InternalEdge {
  source: string;
  target: string;
  label?: string;
}

/** A "what if this step fails?" scenario attached to an internal flow. */
export interface InternalFailure {
  /** Node id within the flow that fails. */
  at: string;
  label: string;
  /** What goes wrong when this step fails. */
  what: string;
  /** How a well-designed system detects and recovers. */
  recovery: string;
}

export interface InternalFlow {
  summary: string;
  nodes: InternalNode[];
  edges: InternalEdge[];
  /** Optional failure scenarios surfaced in Internals mode. */
  failures?: InternalFailure[];
}

/**
 * A system-design concept. This is the atomic unit of educational content —
 * each one is a fully self-contained lesson plus an optional zoomable diagram.
 */
export interface Misconception {
  myth: string;
  reality: string;
}

export interface Concept {
  id: string;
  name: string;
  category: CategoryId;
  /** lucide-react icon name (PascalCase). */
  icon: string;
  tagline: string;
  definition: string;
  whyItExists: string;
  problemSolved: string;
  advantages: string[];
  disadvantages: string[];
  alternatives: Alternative[];
  realWorld: string[];
  interviewQuestions: string[];
  scaling: string;
  /** One-line intuition pump, e.g. "The internet's phonebook." */
  mentalModel?: string;
  /** A common myth paired with the reality that corrects it. */
  misconception?: Misconception;
  /** What concretely breaks if this component is removed. */
  consequenceIfRemoved?: string;
  /** Optional internal architecture revealed when the user zooms in. */
  internal?: InternalFlow;
}

/** Placement of a concept on the World Map canvas. */
export interface MapNodeDef {
  id: string;
  x: number;
  y: number;
  label?: string;
  /** If set, this node is a child positioned relative to the parent group. */
  parentId?: string;
}

export interface MapGroupDef {
  id: string;
  conceptId: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HandleId = "sb" | "tt" | "sl" | "tl" | "sr" | "tr" | "st" | "tb";

export interface MapEdgeDef {
  id: string;
  source: string;
  target: string;
  label?: string;
  dashed?: boolean;
  /** Anchor handles for routing; defaults to bottom→top when omitted. */
  sourceHandle?: HandleId;
  targetHandle?: HandleId;
}

/** One rung on the traffic-scale ladder in the Simulator. */
export interface TrafficTier {
  users: string;
  rps: string;
  narrative: string;
}

/** A toggleable mitigation in the Simulator. */
export interface Solution {
  id: string;
  conceptId: string;
  name: string;
  effect: string;
}

export type ViewMode = "map" | "internals" | "simulator" | "evolution" | "learn" | "reason" | "studio";

/** Sub-modes inside the Reasoning Engine workspace. */
export type ReasonTab = "advisor" | "diagnose" | "tradeoff" | "failure" | "compare" | "interview";
