"use client";

import { memo } from "react";
import { EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";

export interface FlowEdgeData {
  accent?: string;
  animated?: boolean;
  dashed?: boolean;
  label?: string;
  danger?: boolean;
  /** Journey: this edge is off the active path — fade it back. */
  dim?: boolean;
  /** Journey: the packet has already crossed this edge — keep it lit. */
  traversed?: boolean;
  [key: string]: unknown;
}

function FlowEdgeImpl({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.28,
  });

  const d = (data ?? {}) as FlowEdgeData;
  const color = d.danger ? "var(--bad)" : d.accent ?? "#6366f1";
  const pathId = `${id}-path`;

  // Journey states fade the off-path graph and brighten what's been crossed.
  const glowOpacity = d.dim ? 0.04 : d.traversed ? 0.18 : 0.12;
  const baseOpacity = d.dim ? 0.14 : d.traversed ? 0.7 : 0.45;
  const baseWidth = d.traversed ? 2.25 : 1.75;

  return (
    <>
      {/* soft glow */}
      <path d={path} fill="none" stroke={color} strokeOpacity={glowOpacity} strokeWidth={7} strokeLinecap="round" />
      {/* base line */}
      <path
        id={pathId}
        d={path}
        fill="none"
        stroke={color}
        strokeOpacity={baseOpacity}
        strokeWidth={baseWidth}
        strokeLinecap="round"
        strokeDasharray={d.dashed ? "5 6" : undefined}
      />
      {/* animated dash overlay */}
      {d.animated && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeOpacity={0.85}
          strokeWidth={1.75}
          className="flow-dash"
        />
      )}
      {/* travelling request packet — larger & brisker during a guided journey */}
      {d.animated && (
        <circle r={d.dim === undefined ? 3 : 4} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
          <animateMotion dur={d.dim === undefined ? "2.6s" : "1.3s"} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}

      {d.label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute rounded-md px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wide"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "rgba(8,9,14,0.82)",
              color: "var(--text-dim)",
              border: "1px solid var(--border)",
            }}
          >
            {d.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const FlowEdge = memo(FlowEdgeImpl);
