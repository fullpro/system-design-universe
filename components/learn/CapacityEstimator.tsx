"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  ESTIMATOR_PRESETS,
  estimate,
  implications,
  fmtCount,
  fmtBytes,
  fmtQps,
  type EstimatorInputs,
} from "@/lib/estimator";

type Key = keyof EstimatorInputs;

interface Control {
  key: Key;
  label: string;
  /** [min, max] log-scale, or undefined for linear. */
  log?: [number, number];
  lin?: [number, number, number];
  fmt: (v: number) => string;
  round?: (v: number) => number;
}

const CONTROLS: Control[] = [
  { key: "dau", label: "Daily active users", log: [1e4, 5e9], fmt: fmtCount, round: Math.round },
  { key: "writesPerUserPerDay", label: "Writes / user / day", log: [0.01, 100_000], fmt: (v) => (v < 1 ? v.toFixed(2) : fmtCount(v)), round: (v) => (v < 1 ? Math.round(v * 100) / 100 : Math.round(v)) },
  { key: "readWriteRatio", label: "Reads per write", log: [1, 10_000], fmt: (v) => `${fmtCount(v)} : 1`, round: Math.round },
  { key: "payloadBytes", label: "Bytes per write", log: [50, 50e6], fmt: fmtBytes, round: Math.round },
  { key: "peakFactor", label: "Peak factor", lin: [1, 10, 0.5], fmt: (v) => `×${v}` },
  { key: "retentionYears", label: "Retention", lin: [1, 10, 1], fmt: (v) => `${v} yr` },
  { key: "replication", label: "Replication", lin: [1, 5, 1], fmt: (v) => `×${v}` },
];

const toRaw = (c: Control, v: number): number => {
  if (c.log) return (1000 * Math.log(v / c.log[0])) / Math.log(c.log[1] / c.log[0]);
  return v;
};
const toValue = (c: Control, raw: number): number => {
  if (c.log) {
    const v = c.log[0] * Math.pow(c.log[1] / c.log[0], raw / 1000);
    return c.round ? c.round(v) : v;
  }
  return raw;
};

const TONE: Record<string, { color: string; bg: string }> = {
  read: { color: "#6ee7b7", bg: "rgba(52,211,153,0.1)" },
  write: { color: "#fca5a5", bg: "rgba(248,113,113,0.1)" },
  storage: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  peak: { color: "#c7d2fe", bg: "rgba(99,102,241,0.1)" },
  ok: { color: "#6ee7b7", bg: "rgba(52,211,153,0.1)" },
};

function Stat({ label, value, work, big }: { label: string; value: string; work: string; big?: boolean }) {
  return (
    <div className="rounded-xl p-3" style={{ background: big ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${big ? "rgba(129,140,248,0.4)" : "var(--border)"}` }}>
      <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{label}</div>
      <div className={`mt-0.5 font-bold tabular-nums leading-none ${big ? "text-[26px]" : "text-[18px]"}`} style={{ color: big ? "#c7d2fe" : "var(--text)" }}>{value}</div>
      <div className="mt-1 text-[10px] leading-snug" style={{ color: "var(--text-faint)", fontFamily: "ui-monospace, monospace" }}>{work}</div>
    </div>
  );
}

export function CapacityEstimator() {
  const [inputs, setInputs] = useState<EstimatorInputs>(ESTIMATOR_PRESETS[0].values);
  const [activePreset, setActivePreset] = useState<string>(ESTIMATOR_PRESETS[0].id);

  const r = estimate(inputs);
  const imps = implications(r, inputs);

  const setOne = (key: Key, v: number) => {
    setInputs((s) => ({ ...s, [key]: v }));
    setActivePreset("");
  };

  return (
    <div>
      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {ESTIMATOR_PRESETS.map((p) => {
          const active = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => { setInputs(p.values); setActivePreset(p.id); }}
              title={p.blurb}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all"
              style={{
                background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? "rgba(129,140,248,0.6)" : "var(--border)"}`,
                color: active ? "#c7d2fe" : "var(--text-dim)",
              }}
            >
              <Icon name={p.icon} size={13} /> {p.name}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Controls */}
        <div className="lg:w-[300px] lg:shrink-0">
          {CONTROLS.map((c) => {
            const v = inputs[c.key];
            const raw = c.log ? toRaw(c, v) : v;
            const [min, max, step] = c.lin ?? [0, 1000, 1];
            return (
              <div key={c.key} className="mb-3">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[11.5px] font-medium" style={{ color: "var(--text-dim)" }}>{c.label}</span>
                  <span className="text-[12.5px] font-bold tabular-nums" style={{ color: "var(--text)" }}>{c.fmt(v)}</span>
                </div>
                <input
                  type="range"
                  className="dial w-full"
                  min={c.log ? 0 : min}
                  max={c.log ? 1000 : max}
                  step={c.log ? 1 : step}
                  value={raw}
                  onChange={(e) => setOne(c.key, toValue(c, Number(e.target.value)))}
                />
              </div>
            );
          })}
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <Stat big label="Peak QPS" value={fmtQps(r.peakQps)} work={`(reads + writes) × ${inputs.peakFactor} peak`} />
            </div>
            <Stat label="Write QPS (avg)" value={fmtQps(r.writeQps)} work={`${fmtCount(r.writesPerDay)} writes/day ÷ 86,400s`} />
            <Stat label="Read QPS (avg)" value={fmtQps(r.readQps)} work={`write QPS × ${fmtCount(inputs.readWriteRatio)}`} />
            <Stat label="Storage / day" value={fmtBytes(r.storagePerDay)} work={`${fmtCount(r.writesPerDay)} × ${fmtBytes(inputs.payloadBytes)} × ${inputs.replication}`} />
            <Stat label={`Storage / ${inputs.retentionYears} yr`} value={fmtBytes(r.storageTotal)} work={`storage/day × 365 × ${inputs.retentionYears}`} />
            <Stat label="Egress bandwidth" value={`${fmtBytes(r.egressBytesPerSec)}/s`} work={`read QPS × ${fmtBytes(inputs.payloadBytes)}`} />
            <Stat label="Ingress bandwidth" value={`${fmtBytes(r.ingressBytesPerSec)}/s`} work={`write QPS × ${fmtBytes(inputs.payloadBytes)}`} />
          </div>

          {/* What the numbers imply */}
          <div className="mt-3 space-y-1.5">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>What these numbers demand</div>
            {imps.map((imp, i) => (
              <div key={i} className="rounded-xl px-3 py-2 text-[12px] leading-snug" style={{ background: TONE[imp.tone].bg, border: `1px solid ${TONE[imp.tone].color}33`, color: "var(--text-dim)" }}>
                {imp.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
