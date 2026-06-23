"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { GitBranch, Flag, Play, ZapOff } from "lucide-react";
import { rgba } from "@/lib/color";
import { NodeHandles } from "./NodeHandles";

export interface InternalNodeData {
  label: string;
  sublabel?: string;
  kind?: "start" | "step" | "decision" | "yes" | "no" | "terminal";
  accent: string;
  /** Playback spotlight from Internals step-through. */
  playState?: "active" | "visited" | "upcoming";
  /** This step is the one selected as failing. */
  failed?: boolean;
  /** Recede this node (failure focus on another node). */
  faded?: boolean;
  [key: string]: unknown;
}

function InternalNodeImpl({ data }: NodeProps) {
  const { label, sublabel, kind = "step", accent, playState, failed, faded } = data as InternalNodeData;

  const isDecision = kind === "decision";
  const isTerminal = kind === "terminal";
  const isStart = kind === "start";

  const baseColor = isDecision ? "var(--warn)" : isTerminal ? "var(--good)" : accent;
  const color = failed ? "var(--bad)" : baseColor;
  const Badge = failed ? ZapOff : isDecision ? GitBranch : isTerminal ? Flag : isStart ? Play : null;

  const isActive = playState === "active";
  const isUpcoming = playState === "upcoming";

  return (
    <div
      className="relative flex w-[184px] flex-col items-center gap-0.5 rounded-2xl px-4 py-3 text-center sheen transition-all duration-300"
      style={{
        background: failed
          ? "rgba(248,113,113,0.16)"
          : isActive
            ? rgba(accent, 0.16)
            : isStart
              ? rgba(accent, 0.22)
              : `linear-gradient(180deg, ${rgba(color, 0.1)}, var(--panel) 60%)`,
        // A clear coloured top edge so every node reads as its kind/category at a glance.
        borderTop: `2.5px solid ${rgba(color, failed || isActive ? 0.9 : 0.7)}`,
        borderRight: `1px solid ${rgba(color, failed || isActive || isDecision || isTerminal ? 0.5 : 0.25)}`,
        borderBottom: `1px solid ${rgba(color, failed || isActive || isDecision || isTerminal ? 0.5 : 0.25)}`,
        borderLeft: `1px solid ${rgba(color, failed || isActive || isDecision || isTerminal ? 0.5 : 0.25)}`,
        boxShadow: failed
          ? `0 0 28px -4px var(--bad)`
          : isActive
            ? `0 0 0 1.5px ${accent}, 0 0 30px -6px ${rgba(accent, 0.8)}`
            : undefined,
        opacity: isUpcoming || faded ? 0.32 : 1,
        transform: isActive ? "scale(1.04)" : undefined,
        backdropFilter: "blur(12px)",
      }}
    >
      <NodeHandles />
      {Badge && (
        <span
          className="mb-1 flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: rgba(color, 0.18), color }}
        >
          <Badge size={13} strokeWidth={2} />
        </span>
      )}
      <div className="text-[13.5px] font-semibold leading-tight" style={{ color: "var(--text)" }}>
        {label}
      </div>
      {sublabel && (
        <div className="text-[10.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}

export const InternalNode = memo(InternalNodeImpl);
