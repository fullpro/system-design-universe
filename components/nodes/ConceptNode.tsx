"use client";

import { memo, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Maximize2, Info } from "lucide-react";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { rgba } from "@/lib/color";
import { useUniverse } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { NodeHandles } from "./NodeHandles";
import { MicroDiagram, hasMicroDiagram } from "./MicroDiagram";

export interface ConceptNodeData {
  conceptId: string;
  labelOverride?: string;
  /** Set by the Request Journey to spotlight the active hop. */
  journeyState?: "active" | "visited" | "upcoming";
  /** Set by the Layer filter to recede off-layer nodes. */
  faded?: boolean;
  [key: string]: unknown;
}

function HoverRow({ label, value, accent }: { label: string; value?: string; accent: string }) {
  if (!value) return null;
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: rgba(accent, 0.7) }}>
        {label}
      </div>
      <div className="text-[11px] leading-snug" style={{ color: "var(--text-dim)" }}>
        {value}
      </div>
    </div>
  );
}

function ConceptNodeImpl({ data }: NodeProps) {
  const { conceptId, labelOverride, journeyState, faded } = data as ConceptNodeData;
  const concept = getConcept(conceptId);
  const selected = useUniverse((s) => s.selectedConceptId === conceptId);
  const selectConcept = useUniverse((s) => s.selectConcept);
  const zoomInto = useUniverse((s) => s.zoomInto);
  // Tap-to-peek: hover is unavailable on touch, so the preview is also toggleable.
  const [peek, setPeek] = useState(false);

  if (!concept) return null;
  const cat = CATEGORIES[concept.category];
  const accent = cat.accent;
  const hasInternal = Boolean(concept.internal);
  const hasDiag = hasMicroDiagram(conceptId);

  const isActiveHop = journeyState === "active";
  const isUpcoming = journeyState === "upcoming";
  const lit = selected || isActiveHop;
  // The hover preview is a distraction during a guided journey or a layer focus.
  const showHover = journeyState === undefined && !faded;

  const style = {
    background: lit ? rgba(accent, 0.12) : "var(--panel)",
    borderTop: `2.5px solid ${lit ? accent : rgba(accent, 0.55)}`,
    borderRight: `1px solid ${rgba(accent, lit ? 0.5 : 0.15)}`,
    borderBottom: `1px solid ${rgba(accent, lit ? 0.5 : 0.15)}`,
    borderLeft: `1px solid ${rgba(accent, lit ? 0.5 : 0.15)}`,
    boxShadow: isActiveHop
      ? `0 0 0 1.5px ${accent}, 0 0 38px -6px ${rgba(accent, 0.85)}`
      : selected
        ? `0 0 0 1px ${accent}, 0 12px 40px -10px ${rgba(accent, 0.5)}`
        : undefined,
    backdropFilter: "blur(14px)",
    opacity: isUpcoming || faded ? 0.3 : 1,
    transform: isActiveHop ? "scale(1.05)" : undefined,
    "--node-glow": rgba(accent, 0.3),
  } as React.CSSProperties;

  const hint = concept.internal ? " Press Enter for the lesson, Z to zoom into its internals." : " Press Enter for the lesson.";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${cat.label}: ${concept.name}. ${concept.tagline}${hint}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectConcept(conceptId);
        } else if ((e.key === "z" || e.key === "Z") && concept.internal) {
          e.preventDefault();
          zoomInto(conceptId);
        }
      }}
      className="concept-node group relative flex w-[240px] cursor-pointer flex-col rounded-2xl text-left transition-all duration-300"
      style={style}
    >
      <NodeHandles />

      {/* Tap-to-peek button — surfaces the same preview on touch, where hover never fires. */}
      {showHover && (
        <button
          aria-label={`Quick facts about ${concept.name}`}
          aria-expanded={peek}
          onClick={(e) => {
            e.stopPropagation();
            setPeek((p) => !p);
          }}
          className="absolute left-2 top-2 z-50 flex h-5 w-5 items-center justify-center rounded-md transition-colors"
          style={{ background: peek ? rgba(accent, 0.3) : "rgba(255,255,255,0.06)", color: peek ? accent : "var(--text-faint)" }}
        >
          <Info size={11} />
        </button>
      )}

      {/* Preview — the why/tradeoff/alternative spine, instantly, without opening the full lesson.
          Shows on hover (mouse) or when peeked (touch). */}
      {showHover && (
        <div
          className={`absolute left-full top-0 z-50 ml-3 w-[230px] rounded-xl p-3 transition-opacity duration-200 ${peek ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 group-hover:opacity-100"}`}
          style={{ background: "var(--panel-solid)", border: `1px solid ${rgba(accent, 0.3)}`, boxShadow: "0 18px 50px -16px rgba(0,0,0,0.85)" }}
        >
          {/* A glance, not the lesson: one-line intuition + the single sharpest
              tradeoff. The full prose lives in the panel (click to open). */}
          {concept.mentalModel && (
            <div className="mb-2 text-[11.5px] font-medium italic leading-snug" style={{ color: rgba(accent, 0.95) }}>
              “{concept.mentalModel}”
            </div>
          )}
          <HoverRow label="Why it wins" value={concept.advantages[0]} accent={accent} />
          <HoverRow label="Tradeoff" value={concept.disadvantages[0]} accent={accent} />
          <HoverRow label="Instead" value={concept.alternatives[0]?.name} accent={accent} />
          <div className="mt-2 text-[9.5px] font-medium uppercase tracking-wide" style={{ color: rgba(accent, 0.7) }}>
            {hasInternal ? "Click for the full lesson · Z to zoom in" : "Click for the full lesson"}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          style={{
            background: rgba(accent, 0.14),
            color: accent,
            border: `1px solid ${rgba(accent, 0.25)}`,
            boxShadow: `0 0 12px -2px ${rgba(accent, 0.25)}`,
          }}
        >
          <Icon name={concept.icon} size={18} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <div
            className="truncate text-[9.5px] font-medium uppercase tracking-wider"
            style={{ color: rgba(accent, 0.7) }}
          >
            {cat.label}
          </div>
          <div
            className="truncate text-[14.5px] font-semibold leading-tight"
            style={{ color: "var(--text)" }}
          >
            {labelOverride ?? concept.name}
          </div>
        </div>
      </div>

      {/* Micro-diagram or tagline fallback */}
      {hasDiag ? (
        <div className="px-2.5 pb-2.5 pt-1.5">
          <MicroDiagram conceptId={conceptId} accent={accent} />
        </div>
      ) : (
        <p
          className="line-clamp-2 px-3.5 pb-3 pt-1 text-[11px] leading-snug"
          style={{ color: "var(--text-dim)" }}
        >
          {concept.tagline}
        </p>
      )}

      {/* Zoom-in hint — persistently visible (not hover-gated) so the "this has internals"
          affordance is discoverable on touch and at a glance. */}
      {hasInternal && (
        <span
          className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide opacity-70 transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: rgba(accent, 0.18), color: accent }}
        >
          <Maximize2 size={9} /> zoom
        </span>
      )}
    </div>
  );
}

export const ConceptNode = memo(ConceptNodeImpl);
