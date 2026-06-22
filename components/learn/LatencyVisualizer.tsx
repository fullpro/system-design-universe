"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LATENCY_NUMBERS,
  LATENCY_KIND_COLOR,
  LATENCY_KIND_LABEL,
  formatNs,
  formatHuman,
  logFraction,
  type LatencyKind,
} from "@/lib/latency";

const KINDS: LatencyKind[] = ["cpu", "memory", "disk", "network"];

export function LatencyVisualizer() {
  const [human, setHuman] = useState(false);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {KINDS.map((k) => (
            <span key={k} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: LATENCY_KIND_COLOR[k] }} />
              {LATENCY_KIND_LABEL[k]}
            </span>
          ))}
        </div>
        <button
          onClick={() => setHuman((h) => !h)}
          className="rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all"
          style={{
            background: human ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${human ? "rgba(129,140,248,0.6)" : "var(--border)"}`,
            color: human ? "#c7d2fe" : "var(--text-dim)",
          }}
        >
          {human ? "Showing human time (×1 billion)" : "Scale to human time"}
        </button>
      </div>

      <div className="space-y-1.5">
        {LATENCY_NUMBERS.map((entry, i) => {
          const color = LATENCY_KIND_COLOR[entry.kind];
          const width = Math.max(2, logFraction(entry.ns) * 100);
          return (
            <div key={entry.label} className="flex items-center gap-3">
              <div className="w-[230px] shrink-0 text-right text-[11.5px] leading-tight" style={{ color: "var(--text-dim)" }}>
                {entry.label}
              </div>
              <div className="relative h-6 flex-1 overflow-hidden rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ delay: i * 0.03, duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-md"
                  style={{ background: `linear-gradient(90deg, ${color}55, ${color})` }}
                />
                <span
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] font-semibold tabular-nums"
                  style={{ color: "var(--text)" }}
                >
                  {human ? formatHuman(entry.ns) : formatNs(entry.ns)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[12px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
        Bars are log-scaled — each gridline is roughly 10× the previous. The takeaway: memory is ~100× faster than SSD,
        SSD ~100× faster than a cross-country round trip. This is <em>why</em> caches, CDNs and locality matter so much.
      </p>
    </div>
  );
}
