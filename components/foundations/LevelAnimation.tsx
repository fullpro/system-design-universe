"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, RotateCcw } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { rgba } from "@/lib/color";
import type { AnimationStep } from "@/lib/foundations-lessons";

function AnimNode({ node, index }: { node: AnimationStep["nodes"][0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl sm:h-16 sm:w-16"
        style={{
          background: rgba(node.color, 0.15),
          border: `1.5px solid ${rgba(node.color, 0.45)}`,
          boxShadow: `0 0 20px ${rgba(node.color, 0.15)}`,
        }}
      >
        <Icon name={node.icon} size={24} style={{ color: node.color }} />
      </div>
      <span className="text-[11px] font-semibold" style={{ color: node.color }}>
        {node.label}
      </span>
    </motion.div>
  );
}

function AnimEdge({ label, vertical }: { label?: string; vertical?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${vertical ? "flex-col py-1" : "px-1"}`}>
      <motion.div
        initial={{ scaleY: vertical ? 0 : 1, scaleX: vertical ? 1 : 0, opacity: 0 }}
        animate={{ scaleY: 1, scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className={vertical ? "h-6 w-px" : "h-px w-8 sm:w-12"}
        style={{ background: "rgba(255,255,255,0.2)" }}
      />
      {label && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[9px]"
          style={{ color: "var(--text-faint)" }}
        >
          {label}
        </motion.span>
      )}
      <svg width="8" height="8" viewBox="0 0 8 8" className={vertical ? "rotate-90" : ""}>
        <path d="M0 0 L8 4 L0 8 Z" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
}

export function LevelAnimation({ steps, accent }: { steps: AnimationStep[]; accent: string }) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(steps.length - 1, c + 1));
  const reset = () => setCurrent(0);

  return (
    <div
      className="rounded-2xl p-4 sm:p-6"
      style={{
        background: rgba(accent, 0.05),
        border: `1px solid ${rgba(accent, 0.2)}`,
      }}
    >
      {/* Step indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className="flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium transition-all"
              style={{
                background: i === current ? rgba(accent, 0.2) : "rgba(255,255,255,0.04)",
                border: `1px solid ${i === current ? rgba(accent, 0.45) : "transparent"}`,
                color: i === current ? accent : "var(--text-faint)",
              }}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                style={{
                  background: i <= current ? rgba(accent, 0.3) : "rgba(255,255,255,0.08)",
                  color: i <= current ? "#fff" : "var(--text-faint)",
                }}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
        <button onClick={reset} className="text-[11px]" style={{ color: "var(--text-faint)" }}>
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Animation viewport */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* Nodes laid out in a vertical flow */}
          <div className="flex flex-wrap items-center justify-center gap-3 py-4 sm:gap-4">
            {step.nodes.map((node, i) => (
              <div key={node.id} className="flex items-center gap-2 sm:gap-3">
                <AnimNode node={node} index={i} />
                {i < step.nodes.length - 1 && <AnimEdge label={step.edges[i]?.label} />}
              </div>
            ))}
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-center text-[13px] leading-relaxed"
            style={{ color: "var(--text-dim)" }}
          >
            {step.description}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={current === 0}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all disabled:opacity-30"
          style={{ color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
        >
          <ChevronLeft size={14} /> Back
        </button>
        <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
          {current + 1} / {steps.length}
        </span>
        <button
          onClick={next}
          disabled={current === steps.length - 1}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all disabled:opacity-30"
          style={{ background: rgba(accent, 0.15), color: accent, border: `1px solid ${rgba(accent, 0.35)}` }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
