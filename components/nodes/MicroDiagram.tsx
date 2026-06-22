"use client";

import { memo } from "react";

interface Props {
  conceptId: string;
  accent: string;
}

function c(hex: string, o: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${o})`;
}

type D = (a: string) => React.ReactNode;

const DIAGRAMS: Record<string, D> = {
  client: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <rect x="28" y="6" width="16" height="32" rx="3" stroke={c(a, 0.4)} fill={c(a, 0.05)} />
      <line x1="34" y1="34" x2="38" y2="34" stroke={c(a, 0.2)} />
      <rect x="68" y="12" width="30" height="16" rx="2" stroke={c(a, 0.5)} fill={c(a, 0.06)} />
      <path d="M62 30h42" stroke={c(a, 0.25)} strokeLinecap="round" />
      <rect x="132" y="6" width="38" height="24" rx="2" stroke={c(a, 0.5)} fill={c(a, 0.06)} />
      <path d="M151 30v6M143 36h16" stroke={c(a, 0.25)} strokeLinecap="round" />
    </svg>
  ),

  dns: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <rect x="4" y="14" width="38" height="20" rx="4" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <text x="23" y="27" fill={c(a, 0.5)} fontSize="7" textAnchor="middle" fontFamily="ui-monospace,monospace">name</text>
      <path d="M46 24h22" stroke={c(a, 0.3)} strokeDasharray="3 2" />
      <polygon points="70,21 76,24 70,27" fill={c(a, 0.3)} />
      <circle cx="96" cy="24" r="10" stroke={c(a, 0.4)} fill={c(a, 0.06)} />
      <text x="96" y="27" fill={c(a, 0.4)} fontSize="6" textAnchor="middle">DNS</text>
      <path d="M110 24h22" stroke={c(a, 0.3)} strokeDasharray="3 2" />
      <polygon points="134,21 140,24 134,27" fill={c(a, 0.3)} />
      <rect x="144" y="14" width="48" height="20" rx="4" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <text x="168" y="27" fill={c(a, 0.5)} fontSize="7" textAnchor="middle" fontFamily="ui-monospace,monospace">IP</text>
    </svg>
  ),

  cdn: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <circle cx="20" cy="24" r="8" stroke={c(a, 0.4)} fill={c(a, 0.06)} />
      <text x="20" y="27" fill={c(a, 0.4)} fontSize="5" textAnchor="middle">User</text>
      <path d="M30 24h18" stroke={c(a, 0.3)} />
      <polygon points="50,21 56,24 50,27" fill={c(a, 0.3)} />
      <circle cx="76" cy="10" r="7" stroke={c(a, 0.4)} fill={c(a, 0.08)} />
      <circle cx="76" cy="24" r="7" stroke={c(a, 0.45)} fill={c(a, 0.1)} />
      <circle cx="76" cy="38" r="7" stroke={c(a, 0.4)} fill={c(a, 0.08)} />
      <text x="76" y="13" fill={c(a, 0.35)} fontSize="4.5" textAnchor="middle">edge</text>
      <text x="76" y="27" fill={c(a, 0.4)} fontSize="4.5" textAnchor="middle">edge</text>
      <text x="76" y="41" fill={c(a, 0.35)} fontSize="4.5" textAnchor="middle">edge</text>
      <path d="M86 24h28" stroke={c(a, 0.2)} strokeDasharray="2 2" />
      <rect x="118" y="14" width="52" height="20" rx="4" stroke={c(a, 0.3)} fill={c(a, 0.05)} />
      <text x="144" y="27" fill={c(a, 0.35)} fontSize="6" textAnchor="middle">origin</text>
    </svg>
  ),

  "load-balancer": (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <path d="M20 24h30" stroke={c(a, 0.35)} strokeLinecap="round" />
      <polygon points="52,21 58,24 52,27" fill={c(a, 0.35)} />
      <circle cx="74" cy="24" r="10" stroke={c(a, 0.5)} fill={c(a, 0.08)} />
      <text x="74" y="27" fill={c(a, 0.45)} fontSize="5.5" textAnchor="middle">LB</text>
      <path d="M84 18L128 8M84 24h44M84 30L128 40" stroke={c(a, 0.35)} strokeLinecap="round" />
      <rect x="130" y="2" width="28" height="14" rx="3" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <rect x="130" y="17" width="28" height="14" rx="3" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <rect x="130" y="32" width="28" height="14" rx="3" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <text x="144" y="12" fill={c(a, 0.35)} fontSize="5.5" textAnchor="middle">A</text>
      <text x="144" y="27" fill={c(a, 0.35)} fontSize="5.5" textAnchor="middle">B</text>
      <text x="144" y="42" fill={c(a, 0.35)} fontSize="5.5" textAnchor="middle">C</text>
    </svg>
  ),

  "api-gateway": (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <path d="M4 24h12" stroke={c(a, 0.25)} />
      <polygon points="18,21 24,24 18,27" fill={c(a, 0.25)} />
      <rect x="28" y="12" width="38" height="24" rx="4" stroke={c(a, 0.4)} fill={c(a, 0.07)} />
      <text x="47" y="27" fill={c(a, 0.45)} fontSize="6" textAnchor="middle">Auth</text>
      <path d="M70 24h6" stroke={c(a, 0.2)} />
      <rect x="80" y="12" width="38" height="24" rx="4" stroke={c(a, 0.4)} fill={c(a, 0.07)} />
      <text x="99" y="27" fill={c(a, 0.45)} fontSize="6" textAnchor="middle">Rate</text>
      <path d="M122 24h6" stroke={c(a, 0.2)} />
      <rect x="132" y="12" width="38" height="24" rx="4" stroke={c(a, 0.4)} fill={c(a, 0.07)} />
      <text x="151" y="27" fill={c(a, 0.45)} fontSize="6" textAnchor="middle">Route</text>
      <path d="M174 24h14" stroke={c(a, 0.25)} />
    </svg>
  ),

  services: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <rect x="10" y="10" width="38" height="28" rx="4" stroke={c(a, 0.4)} fill={c(a, 0.07)} />
      <text x="29" y="27" fill={c(a, 0.4)} fontSize="5.5" textAnchor="middle">Users</text>
      <rect x="79" y="10" width="38" height="28" rx="4" stroke={c(a, 0.4)} fill={c(a, 0.07)} />
      <text x="98" y="27" fill={c(a, 0.4)} fontSize="5.5" textAnchor="middle">Orders</text>
      <rect x="148" y="10" width="38" height="28" rx="4" stroke={c(a, 0.4)} fill={c(a, 0.07)} />
      <text x="167" y="27" fill={c(a, 0.4)} fontSize="5.5" textAnchor="middle">Pay</text>
      <path d="M48 24h31M117 24h31" stroke={c(a, 0.25)} strokeDasharray="3 2" />
    </svg>
  ),

  cache: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <text x="4" y="20" fill={c(a, 0.4)} fontSize="7" fontFamily="ui-monospace,monospace">GET</text>
      <path d="M26 18h14" stroke={c(a, 0.3)} />
      <rect x="44" y="6" width="38" height="22" rx="4" stroke={c(a, 0.5)} fill={c(a, 0.08)} />
      <text x="63" y="20" fill={c(a, 0.5)} fontSize="6" textAnchor="middle">Cache</text>
      <path d="M82 16h30" stroke={c(a, 0.45)} strokeWidth="1.5" />
      <text x="97" y="12" fill={c(a, 0.35)} fontSize="5">HIT</text>
      <circle cx="118" cy="16" r="5" fill={c(a, 0.15)} stroke={c(a, 0.35)} />
      <text x="118" y="19" fill={c(a, 0.5)} fontSize="6" textAnchor="middle">⚡</text>
      <text x="132" y="19" fill={c(a, 0.4)} fontSize="6">fast</text>
      <path d="M63 28v6" stroke={c(a, 0.2)} strokeDasharray="2 2" />
      <rect x="44" y="34" width="38" height="12" rx="3" stroke={c(a, 0.25)} fill={c(a, 0.04)} />
      <text x="63" y="43" fill={c(a, 0.3)} fontSize="5.5" textAnchor="middle">DB</text>
      <text x="90" y="43" fill={c(a, 0.2)} fontSize="5">MISS</text>
    </svg>
  ),

  database: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <ellipse cx="98" cy="10" rx="44" ry="7" stroke={c(a, 0.4)} fill={c(a, 0.06)} />
      <path d="M54 10v24" stroke={c(a, 0.4)} />
      <path d="M142 10v24" stroke={c(a, 0.4)} />
      <ellipse cx="98" cy="34" rx="44" ry="7" stroke={c(a, 0.4)} fill={c(a, 0.06)} />
      <path d="M60 18h76M60 26h76" stroke={c(a, 0.12)} strokeDasharray="4 3" />
    </svg>
  ),

  "message-queue": (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <circle cx="12" cy="24" r="8" stroke={c(a, 0.4)} fill={c(a, 0.06)} />
      <text x="12" y="27" fill={c(a, 0.4)} fontSize="6" textAnchor="middle">P</text>
      <path d="M22 24h10" stroke={c(a, 0.3)} />
      <polygon points="34,21 40,24 34,27" fill={c(a, 0.3)} />
      <rect x="44" y="14" width="18" height="20" rx="3" stroke={c(a, 0.4)} fill={c(a, 0.1)} />
      <rect x="66" y="14" width="18" height="20" rx="3" stroke={c(a, 0.4)} fill={c(a, 0.08)} />
      <rect x="88" y="14" width="18" height="20" rx="3" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <rect x="110" y="14" width="18" height="20" rx="3" stroke={c(a, 0.3)} fill={c(a, 0.04)} />
      <path d="M132 24h10" stroke={c(a, 0.3)} />
      <polygon points="144,21 150,24 144,27" fill={c(a, 0.3)} />
      <circle cx="166" cy="18" r="7" stroke={c(a, 0.35)} fill={c(a, 0.05)} />
      <circle cx="180" cy="30" r="7" stroke={c(a, 0.35)} fill={c(a, 0.05)} />
      <text x="166" y="21" fill={c(a, 0.35)} fontSize="5" textAnchor="middle">C₁</text>
      <text x="180" y="33" fill={c(a, 0.35)} fontSize="5" textAnchor="middle">C₂</text>
    </svg>
  ),

  analytics: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <rect x="24" y="26" width="20" height="18" rx="2" fill={c(a, 0.1)} stroke={c(a, 0.2)} />
      <rect x="50" y="18" width="20" height="26" rx="2" fill={c(a, 0.13)} stroke={c(a, 0.25)} />
      <rect x="76" y="22" width="20" height="22" rx="2" fill={c(a, 0.1)} stroke={c(a, 0.2)} />
      <rect x="102" y="8" width="20" height="36" rx="2" fill={c(a, 0.16)} stroke={c(a, 0.3)} />
      <rect x="128" y="14" width="20" height="30" rx="2" fill={c(a, 0.13)} stroke={c(a, 0.25)} />
      <rect x="154" y="10" width="20" height="34" rx="2" fill={c(a, 0.16)} stroke={c(a, 0.3)} />
    </svg>
  ),

  "read-replica": (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <ellipse cx="40" cy="12" rx="26" ry="6" stroke={c(a, 0.45)} fill={c(a, 0.08)} />
      <path d="M14 12v18" stroke={c(a, 0.45)} />
      <path d="M66 12v18" stroke={c(a, 0.45)} />
      <ellipse cx="40" cy="30" rx="26" ry="6" stroke={c(a, 0.45)} fill={c(a, 0.08)} />
      <text x="40" y="24" fill={c(a, 0.4)} fontSize="5.5" textAnchor="middle">Primary</text>
      <path d="M68 20h16M68 24h16" stroke={c(a, 0.25)} strokeDasharray="2 2" />
      <polygon points="86,17 92,20 86,23" fill={c(a, 0.2)} />
      <polygon points="86,21 92,24 86,27" fill={c(a, 0.2)} />
      <ellipse cx="128" cy="12" rx="20" ry="5" stroke={c(a, 0.3)} fill={c(a, 0.05)} />
      <path d="M108 12v12" stroke={c(a, 0.3)} />
      <path d="M148 12v12" stroke={c(a, 0.3)} />
      <ellipse cx="128" cy="24" rx="20" ry="5" stroke={c(a, 0.3)} fill={c(a, 0.05)} />
      <ellipse cx="164" cy="28" rx="20" ry="5" stroke={c(a, 0.3)} fill={c(a, 0.05)} />
      <path d="M144 28v12" stroke={c(a, 0.3)} />
      <path d="M184 28v12" stroke={c(a, 0.3)} />
      <ellipse cx="164" cy="40" rx="20" ry="5" stroke={c(a, 0.3)} fill={c(a, 0.05)} />
    </svg>
  ),

  sharding: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <rect x="12" y="6" width="40" height="36" rx="4" stroke={c(a, 0.45)} fill={c(a, 0.08)} />
      <path d="M18 16h28M18 26h28" stroke={c(a, 0.12)} />
      <path d="M56 24h18" stroke={c(a, 0.3)} />
      <polygon points="76,21 82,24 76,27" fill={c(a, 0.3)} />
      <rect x="88" y="2" width="32" height="12" rx="3" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <rect x="88" y="18" width="32" height="12" rx="3" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <rect x="88" y="34" width="32" height="12" rx="3" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <text x="104" y="11" fill={c(a, 0.3)} fontSize="5.5" textAnchor="middle">S₁</text>
      <text x="104" y="27" fill={c(a, 0.3)} fontSize="5.5" textAnchor="middle">S₂</text>
      <text x="104" y="43" fill={c(a, 0.3)} fontSize="5.5" textAnchor="middle">S₃</text>
    </svg>
  ),

  kubernetes: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <rect x="18" y="4" width="160" height="40" rx="6" stroke={c(a, 0.35)} fill={c(a, 0.04)} strokeDasharray="4 3" />
      <text x="98" y="14" fill={c(a, 0.3)} fontSize="5.5" textAnchor="middle">cluster</text>
      <circle cx="46" cy="30" r="8" stroke={c(a, 0.4)} fill={c(a, 0.08)} />
      <circle cx="80" cy="30" r="8" stroke={c(a, 0.4)} fill={c(a, 0.08)} />
      <circle cx="114" cy="30" r="8" stroke={c(a, 0.4)} fill={c(a, 0.08)} />
      <circle cx="148" cy="30" r="8" stroke={c(a, 0.35)} fill={c(a, 0.06)} />
      <text x="46" y="33" fill={c(a, 0.35)} fontSize="5" textAnchor="middle">pod</text>
      <text x="80" y="33" fill={c(a, 0.35)} fontSize="5" textAnchor="middle">pod</text>
      <text x="114" y="33" fill={c(a, 0.35)} fontSize="5" textAnchor="middle">pod</text>
      <text x="148" y="33" fill={c(a, 0.3)} fontSize="5" textAnchor="middle">pod</text>
    </svg>
  ),

  observability: (a) => (
    <svg viewBox="0 0 196 48" fill="none">
      <rect x="8" y="4" width="180" height="40" rx="4" stroke={c(a, 0.3)} fill={c(a, 0.04)} />
      <path d="M18 18L34 14L50 20L66 10L82 16L98 12L114 18L130 8L146 14L162 10L178 16" stroke={c(a, 0.45)} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 36L34 32L50 34L66 28L82 30L98 26L114 32L130 24L146 28L162 22L178 26" stroke={c(a, 0.3)} strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const DIAGRAM_IDS = new Set(Object.keys(DIAGRAMS));

export function hasMicroDiagram(conceptId: string): boolean {
  return DIAGRAM_IDS.has(conceptId);
}

function MicroDiagramImpl({ conceptId, accent }: Props) {
  const render = DIAGRAMS[conceptId];
  if (!render) return null;
  return <div className="micro-diagram w-full">{render(accent)}</div>;
}

export const MicroDiagram = memo(MicroDiagramImpl);
