"use client";

import { useState } from "react";

type Strategy = "round-robin" | "weighted" | "least-conn" | "random";

const STRATEGIES: { id: Strategy; label: string; why: string }[] = [
  { id: "round-robin", label: "Round Robin", why: "Rotates evenly through servers. Simple and stateless — but blind to server speed, so a slow server gets the same share and backs up." },
  { id: "weighted", label: "Weighted", why: "Sends traffic in proportion to each server's capacity. Great for mixed fleet sizes or gradually shifting load during a rollout." },
  { id: "least-conn", label: "Least Connections", why: "Sends each request to the server with the fewest in-flight requests, so it naturally steers away from the slow one. Adapts to real load." },
  { id: "random", label: "Random", why: "Picks a server at random. Even on average and trivially scalable, but bursty in the short term — some servers spike while others idle." },
];

// Three backends with different processing speeds (lower time = faster).
const SERVERS = [
  { id: "S1", label: "Fast", weight: 3, time: 1, color: "#34d399" },
  { id: "S2", label: "Medium", weight: 2, time: 2, color: "#fbbf24" },
  { id: "S3", label: "Slow", weight: 1, time: 3, color: "#f87171" },
];
const TOTAL = 24;

function distribute(strategy: Strategy): number[] {
  const counts = [0, 0, 0];
  if (strategy === "round-robin" || strategy === "random") {
    for (let i = 0; i < TOTAL; i++) counts[i % 3]++;
    return counts;
  }
  if (strategy === "weighted") {
    const w = SERVERS.map((s) => s.weight);
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map((x) => Math.round((x / sum) * TOTAL));
  }
  // least-connections: assign to whichever server has the least accumulated load.
  const load = [0, 0, 0];
  for (let i = 0; i < TOTAL; i++) {
    let min = 0;
    for (let j = 1; j < 3; j++) if (load[j] < load[min]) min = j;
    counts[min]++;
    load[min] += SERVERS[min].time;
  }
  return counts;
}

export function LoadBalancerStrategies() {
  const [strategy, setStrategy] = useState<Strategy>("round-robin");
  const counts = distribute(strategy);
  const max = Math.max(...counts, 1);
  const active = STRATEGIES.find((s) => s.id === strategy)!;

  return (
    <div>
      <p className="mb-3 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
        One stable front door distributes {TOTAL} requests across three backends of different speeds. Switch the strategy and watch how the load lands.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id)}
            className="rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all"
            style={{
              background: strategy === s.id ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${strategy === s.id ? "rgba(129,140,248,0.6)" : "var(--border)"}`,
              color: strategy === s.id ? "#c7d2fe" : "var(--text-dim)",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-end justify-around gap-4 rounded-2xl px-4 pb-3 pt-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", height: 200 }}>
        {SERVERS.map((s, i) => (
          <div key={s.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[12px] font-bold tabular-nums" style={{ color: s.color }}>{counts[i]}</span>
            <div className="w-full max-w-[64px] overflow-hidden rounded-t-lg transition-all duration-500" style={{ height: `${(counts[i] / max) * 110}px`, background: s.color, opacity: 0.85 }} />
            <div className="text-center">
              <div className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>{s.id}</div>
              <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>{s.label} · {s.time}× time</div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 rounded-xl px-3.5 py-2.5 text-[12px] leading-snug" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", color: "var(--text-dim)" }}>
        <span className="font-semibold" style={{ color: "#c7d2fe" }}>{active.label}: </span>{active.why}
      </p>
    </div>
  );
}
