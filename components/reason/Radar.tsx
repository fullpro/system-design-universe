"use client";

import { AXES, AXIS_ORDER, type AxisScores } from "@/lib/reasoning/axes";

interface RadarProps {
  scores: AxisScores;
  size?: number;
  accent?: string;
  /** Optional second polygon for side-by-side comparison. */
  compare?: AxisScores;
  compareAccent?: string;
}

function point(cx: number, cy: number, r: number, i: number, value: number) {
  const angle = (-90 + i * 60) * (Math.PI / 180);
  const d = (value / 100) * r;
  return [cx + d * Math.cos(angle), cy + d * Math.sin(angle)] as const;
}

export function Radar({ scores, size = 240, accent = "#818cf8", compare, compareAccent = "#f472b6" }: RadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 34;

  const poly = (s: AxisScores) =>
    AXIS_ORDER.map((a, i) => point(cx, cy, r, i, s[a]).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {/* grid rings */}
      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          points={AXIS_ORDER.map((_, i) => point(cx, cy, r, i, ring).join(",")).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}
      {/* spokes + labels */}
      {AXIS_ORDER.map((a, i) => {
        const [x, y] = point(cx, cy, r, i, 100);
        const [lx, ly] = point(cx, cy, r + 18, i, 100);
        return (
          <g key={a}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="var(--text-faint)">
              {AXES[a].short}
            </text>
            <text x={lx} y={ly + 10} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} fill={AXES[a].accent}>
              {scores[a]}
            </text>
          </g>
        );
      })}
      {/* compare polygon (behind) */}
      {compare && (
        <polygon points={poly(compare)} fill={compareAccent} fillOpacity={0.12} stroke={compareAccent} strokeWidth={1.5} strokeOpacity={0.7} />
      )}
      {/* main polygon */}
      <polygon points={poly(scores)} fill={accent} fillOpacity={0.18} stroke={accent} strokeWidth={2} />
      {AXIS_ORDER.map((a, i) => {
        const [x, y] = point(cx, cy, r, i, scores[a]);
        return <circle key={a} cx={x} cy={y} r={2.5} fill={accent} />;
      })}
    </svg>
  );
}
