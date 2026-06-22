"use client";

import { useState } from "react";

const CACHE_MS = 1;
const DB_MS = 25;

function Metric({ label, value, unit, color }: { label: string; value: string; unit?: string; color: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
      <div className="text-[10.5px] font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>{label}</div>
      <div className="mt-1 text-[20px] font-bold tabular-nums leading-none" style={{ color }}>
        {value}{unit && <span className="ml-0.5 text-[11px] font-medium" style={{ color: "var(--text-faint)" }}>{unit}</span>}
      </div>
    </div>
  );
}

export function CacheSimulator() {
  const [hit, setHit] = useState(80);
  const miss = 100 - hit;
  const avgLatency = (hit / 100) * CACHE_MS + (miss / 100) * DB_MS;
  const dbPerThousand = miss * 10;
  const latencyColor = avgLatency < 4 ? "#34d399" : avgLatency < 10 ? "#fbbf24" : "#f87171";

  return (
    <div>
      <p className="mb-4 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
        A cache hit returns in ~{CACHE_MS}ms; a miss falls through to the database at ~{DB_MS}ms. Drag the hit ratio and watch how dramatically a good cache cuts both latency and database load.
      </p>

      <div className="mb-1 flex items-end justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Cache hit ratio</span>
        <span className="text-2xl font-bold tabular-nums" style={{ color: "#a5b4fc" }}>{hit}%</span>
      </div>
      <input type="range" min={0} max={100} step={1} value={hit} onChange={(e) => setHit(Number(e.target.value))} className="dial w-full" />

      {/* hit vs miss split bar */}
      <div className="mt-4 flex h-7 w-full overflow-hidden rounded-lg" style={{ border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-center text-[10.5px] font-semibold transition-all duration-300" style={{ width: `${hit}%`, background: "rgba(52,211,153,0.3)", color: "#6ee7b7" }}>
          {hit >= 12 && `served by cache`}
        </div>
        <div className="flex items-center justify-center text-[10.5px] font-semibold transition-all duration-300" style={{ width: `${miss}%`, background: "rgba(248,113,113,0.3)", color: "#fca5a5" }}>
          {miss >= 12 && `hits the DB`}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Metric label="Avg read latency" value={avgLatency.toFixed(1)} unit="ms" color={latencyColor} />
        <Metric label="DB queries / 1k reads" value={String(dbPerThousand)} color={miss > 30 ? "#f87171" : "#34d399"} />
        <Metric label="Origin load removed" value={String(hit)} unit="%" color="#a5b4fc" />
      </div>

      <p className="mt-3 rounded-xl px-3.5 py-2.5 text-[12px] leading-snug" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", color: "var(--text-dim)" }}>
        {hit >= 95
          ? "Above 95%, the database barely sees read traffic — but the last few points are the hardest to win, and a stampede on a cold key can still hurt."
          : hit >= 70
            ? "Even a modest hit ratio removes most database load. Note the asymmetry: going from 90% to 99% halves DB load again — hit ratio is the metric to obsess over."
            : "At a low hit ratio the cache barely helps and you pay an extra hop on every miss. A cache only earns its keep when most reads actually hit."}
      </p>
    </div>
  );
}
