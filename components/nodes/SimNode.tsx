"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { AlertTriangle } from "lucide-react";
import type { HeatStatus } from "@/lib/simulator";
import { NodeHandles } from "./NodeHandles";

export interface SimNodeData {
  label: string;
  sublabel?: string;
  status: HeatStatus;
  heat: number;
  conceptId?: string;
  isBottleneck?: boolean;
  [key: string]: unknown;
}

const STATUS_COLOR: Record<HeatStatus, string> = {
  idle: "#7dd3fc",
  support: "#818cf8",
  healthy: "#34d399",
  warm: "#fbbf24",
  hot: "#f87171",
  critical: "#ef4444",
};

const STATUS_LABEL: Record<HeatStatus, string> = {
  idle: "Idle",
  support: "Active",
  healthy: "Healthy",
  warm: "Elevated",
  hot: "Stressed",
  critical: "Critical",
};

function rgbaFromVar(color: string, a: number) {
  const h = color.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function SimNodeImpl({ data }: NodeProps) {
  const { label, sublabel, status, heat, isBottleneck } = data as SimNodeData;
  const color = STATUS_COLOR[status];
  const showHeat = heat > 0;
  const hot = status === "hot" || status === "critical";

  const cpu = showHeat ? Math.round(heat * 100) : null;
  const latency = showHeat ? Math.round(3 + heat * heat * 140) : null;

  return (
    <div
      role="button"
      className="sim-node group relative flex w-[210px] cursor-pointer flex-col gap-1 rounded-2xl px-3.5 py-3 text-left transition-all duration-300"
      style={{
        background: isBottleneck ? rgbaFromVar(color, 0.14) : "var(--panel)",
        borderTop: `2.5px solid ${rgbaFromVar(color, isBottleneck ? 0.8 : 0.5)}`,
        borderRight: `1px solid ${rgbaFromVar(color, isBottleneck ? 0.5 : 0.18)}`,
        borderBottom: `1px solid ${rgbaFromVar(color, isBottleneck ? 0.5 : 0.18)}`,
        borderLeft: `1px solid ${rgbaFromVar(color, isBottleneck ? 0.5 : 0.18)}`,
        boxShadow: isBottleneck
          ? `0 0 28px -4px ${rgbaFromVar(color, 0.55)}`
          : `inset 0 1px 0 0 rgba(255,255,255,0.06), 0 10px 40px -12px rgba(0,0,0,0.7)`,
        backdropFilter: "blur(12px)",
      }}
    >
      <NodeHandles />

      {isBottleneck && (
        <>
          <span
            className="pulse-ring absolute inset-0 rounded-2xl"
            style={{ boxShadow: `0 0 0 2px ${color}` }}
          />
          <span
            className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{ background: color, color: "#1a0606" }}
          >
            <AlertTriangle size={9} strokeWidth={2.5} /> Bottleneck
          </span>
        </>
      )}

      {/* Header: name + status indicator */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold leading-tight" style={{ color: "var(--text)" }}>
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[8.5px] font-medium uppercase tracking-wide"
            style={{ color: rgbaFromVar(color, 0.85) }}
          >
            {STATUS_LABEL[status]}
          </span>
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          />
        </div>
      </div>

      {sublabel && (
        <span className="text-[10px]" style={{ color: hot ? color : "var(--text-dim)" }}>
          {sublabel}
        </span>
      )}

      {/* Derived metrics */}
      {cpu !== null && latency !== null && (
        <div
          className="flex items-center gap-3 text-[9.5px]"
          style={{ color: rgbaFromVar(color, 0.8), fontFamily: "ui-monospace, monospace" }}
        >
          <span>CPU {cpu}%</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>p99 {latency}ms</span>
        </div>
      )}

      {/* Heat bar with gradient from healthy → current status */}
      {showHeat && (
        <div
          className="mt-0.5 h-2 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.round(heat * 100))}%`,
              background: `linear-gradient(90deg, ${STATUS_COLOR.healthy}, ${color})`,
            }}
          />
        </div>
      )}

      {/* Backlog: when a tier is overloaded, requests visibly queue up. */}
      {hot && (
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: Math.min(7, Math.max(2, Math.round((heat - 0.55) * 12))) }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color, opacity: 0.5 + (i % 3) * 0.2, animation: `queuePulse 1s ease-in-out ${i * 0.12}s infinite` }}
            />
          ))}
          <span className="ml-1 text-[8.5px] font-medium uppercase tracking-wide" style={{ color }}>
            requests queuing
          </span>
        </div>
      )}
    </div>
  );
}

export const SimNode = memo(SimNodeImpl);
