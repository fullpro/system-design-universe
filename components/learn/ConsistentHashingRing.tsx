"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

/** Deterministic hash → angle in [0,360). */
function hashAngle(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 3600) / 10;
}

const KEYS = ["user_42", "cart_88", "session_7", "img_31", "order_19", "post_5", "like_2", "msg_61"];
const NODE_NAMES = ["A", "B", "C", "D", "E", "F"];
const NODE_COLORS: Record<string, string> = { A: "#818cf8", B: "#34d399", C: "#fb7185", D: "#fbbf24", E: "#22d3ee", F: "#c084fc" };

const CX = 150, CY = 150, R = 108, KR = 88;
const pt = (angle: number, radius: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
};

function ownersFor(nodeNames: string[]): Record<string, string> {
  const placed = nodeNames.map((n) => ({ n, a: hashAngle("vnode:" + n) }));
  const out: Record<string, string> = {};
  for (const k of KEYS) {
    const ka = hashAngle(k);
    let best = placed[0];
    let bestGap = 999;
    for (const node of placed) {
      const gap = (node.a - ka + 360) % 360;
      if (gap < bestGap) { bestGap = gap; best = node; }
    }
    out[k] = best.n;
  }
  return out;
}

export function ConsistentHashingRing() {
  const [nodes, setNodes] = useState(["A", "B", "C"]);
  const [moved, setMoved] = useState<string[]>([]);

  const change = (next: string[]) => {
    const before = ownersFor(nodes);
    const after = ownersFor(next);
    setMoved(KEYS.filter((k) => before[k] !== after[k]));
    setNodes(next);
  };
  const addNode = () => nodes.length < NODE_NAMES.length && change([...nodes, NODE_NAMES[nodes.length]]);
  const removeNode = () => nodes.length > 1 && change(nodes.slice(0, -1));

  const owners = ownersFor(nodes);

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] shrink-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} />

        {/* key → owner connectors */}
        {KEYS.map((k) => {
          const kp = pt(hashAngle(k), KR);
          const np = pt(hashAngle("vnode:" + owners[k]), R);
          const isMoved = moved.includes(k);
          return <line key={"l" + k} x1={kp.x} y1={kp.y} x2={np.x} y2={np.y} stroke={isMoved ? "#fbbf24" : NODE_COLORS[owners[k]]} strokeWidth={isMoved ? 1.6 : 0.8} strokeOpacity={isMoved ? 0.9 : 0.35} />;
        })}

        {/* nodes */}
        {nodes.map((n) => {
          const p = pt(hashAngle("vnode:" + n), R);
          return (
            <g key={"n" + n}>
              <circle cx={p.x} cy={p.y} r={11} fill={NODE_COLORS[n]} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0a0c14">{n}</text>
            </g>
          );
        })}

        {/* keys */}
        {KEYS.map((k) => {
          const p = pt(hashAngle(k), KR);
          const isMoved = moved.includes(k);
          return <circle key={"k" + k} cx={p.x} cy={p.y} r={isMoved ? 5 : 3.5} fill={isMoved ? "#fbbf24" : "#e8eaf2"} stroke={isMoved ? "#fbbf24" : "none"} strokeWidth={2} strokeOpacity={0.4} />;
        })}
      </svg>

      <div className="flex-1">
        <p className="mb-3 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
          Each key (white dot) is owned by the first node (colored) clockwise around the ring. Add or remove a node and watch how few keys have to move.
        </p>
        <div className="mb-4 flex items-center gap-2">
          <button onClick={addNode} disabled={nodes.length >= NODE_NAMES.length} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all enabled:hover:brightness-110 disabled:opacity-40" style={{ background: "rgba(52,211,153,0.18)", border: "1px solid rgba(52,211,153,0.5)", color: "#6ee7b7" }}>
            <Plus size={14} /> Add node
          </button>
          <button onClick={removeNode} disabled={nodes.length <= 1} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all enabled:hover:brightness-110 disabled:opacity-40" style={{ background: "rgba(248,113,113,0.16)", border: "1px solid rgba(248,113,113,0.5)", color: "#fca5a5" }}>
            <Minus size={14} /> Remove node
          </button>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[12px]" style={{ color: "var(--text-dim)" }}>Nodes in the ring</span>
            <span className="text-[15px] font-bold tabular-nums" style={{ color: "var(--text)" }}>{nodes.length}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[12px]" style={{ color: "var(--text-dim)" }}>Keys remapped by that change</span>
            <span className="text-[15px] font-bold tabular-nums" style={{ color: moved.length ? "#fbbf24" : "var(--text-faint)" }}>
              {moved.length} <span className="text-[11px] font-medium" style={{ color: "var(--text-faint)" }}>of {KEYS.length}</span>
            </span>
          </div>
          <p className="mt-3 text-[11.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
            With naive <code>hash(key) % N</code>, almost every key would move on each change — wiping the whole cache. Consistent hashing moves only ~1/N.
          </p>
        </div>
      </div>
    </div>
  );
}
