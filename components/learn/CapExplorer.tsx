"use client";

import { useState } from "react";

type Choice = "CP" | "AP";

const P = { x: 170, y: 34 };
const C = { x: 40, y: 230 };
const A = { x: 300, y: 230 };

const DBS: Record<Choice, { title: string; blurb: string; examples: string }> = {
  CP: {
    title: "CP — Consistency + Partition tolerance",
    blurb:
      "During a partition the system refuses reads/writes that can't be made consistent. It sacrifices availability to never return stale or conflicting data.",
    examples: "HBase · etcd · ZooKeeper · Redis (single primary) · MongoDB (default)",
  },
  AP: {
    title: "AP — Availability + Partition tolerance",
    blurb:
      "During a partition the system keeps serving on every node and reconciles conflicts later. It sacrifices strong consistency to stay up.",
    examples: "Cassandra · DynamoDB · Riak · CouchDB · DNS",
  },
};

export function CapExplorer() {
  const [choice, setChoice] = useState<Choice>("CP");

  const cLit = choice === "CP";
  const aLit = choice === "AP";
  const litColor = "#818cf8";
  const cColor = cLit ? "#60a5fa" : "#3a4252";
  const aColor = aLit ? "#34d399" : "#3a4252";

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center">
      <svg viewBox="0 0 340 260" className="w-full max-w-[340px] shrink-0">
        {/* edges */}
        <line x1={P.x} y1={P.y} x2={C.x} y2={C.y} stroke={cLit ? cColor : "#2a3040"} strokeWidth={cLit ? 3 : 1.5} />
        <line x1={P.x} y1={P.y} x2={A.x} y2={A.y} stroke={aLit ? aColor : "#2a3040"} strokeWidth={aLit ? 3 : 1.5} />
        {/* the bottom edge — the one you can't have during a partition */}
        <line x1={C.x} y1={C.y} x2={A.x} y2={A.y} stroke="#f87171" strokeWidth={1.5} strokeDasharray="5 6" opacity={0.6} />
        <text x={170} y={252} textAnchor="middle" fontSize={9} fill="#f87171" opacity={0.8}>
          can't have both during a partition
        </text>

        {/* vertices */}
        {[
          { pt: P, label: "P", sub: "Partition", color: litColor, lit: true },
          { pt: C, label: "C", sub: "Consistency", color: cColor, lit: cLit },
          { pt: A, label: "A", sub: "Availability", color: aColor, lit: aLit },
        ].map((v) => (
          <g key={v.label}>
            <circle cx={v.pt.x} cy={v.pt.y} r={26} fill={v.lit ? `${v.color}22` : "#161922"} stroke={v.color} strokeWidth={v.lit ? 2.5 : 1.5} />
            <text x={v.pt.x} y={v.pt.y + 5} textAnchor="middle" fontSize={20} fontWeight={700} fill={v.color}>
              {v.label}
            </text>
            <text x={v.pt.x} y={v.pt.y + (v.label === "P" ? -34 : 44)} textAnchor="middle" fontSize={10} fill={v.lit ? "#e8eaf2" : "#5a6379"}>
              {v.sub}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex-1">
        <p className="mb-3 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
          A network partition <strong style={{ color: "#c7d2fe" }}>will</strong> happen — so P isn't optional. The real
          choice is what to do <em>during</em> one:
        </p>
        <div className="mb-4 flex gap-2">
          {(["CP", "AP"] as Choice[]).map((c) => (
            <button
              key={c}
              onClick={() => setChoice(c)}
              className="flex-1 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all"
              style={{
                background: choice === c ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${choice === c ? "rgba(129,140,248,0.6)" : "var(--border)"}`,
                color: choice === c ? "#c7d2fe" : "var(--text-dim)",
              }}
            >
              {c === "CP" ? "Stay Consistent" : "Stay Available"}
            </button>
          ))}
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
          <div className="text-[13px] font-bold" style={{ color: "var(--text)" }}>{DBS[choice].title}</div>
          <p className="mt-1.5 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>{DBS[choice].blurb}</p>
          <div className="mt-2.5 text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Examples</div>
          <div className="mt-1 text-[12.5px]" style={{ color: choice === "CP" ? "#93c5fd" : "#6ee7b7" }}>{DBS[choice].examples}</div>
        </div>
      </div>
    </div>
  );
}
