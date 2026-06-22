"use client";

/** Small, shared form controls for the Reasoning Engine views. */

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all"
            style={{
              background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? "rgba(129,140,248,0.6)" : "var(--border)"}`,
              color: active ? "#c7d2fe" : "var(--text-dim)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{label}</span>
        {value && <span className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--text)" }}>{value}</span>}
      </div>
      {children}
    </div>
  );
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="range"
      className="dial w-full"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

/** A slider over a base-10 log range (lo/hi are powers of ten). */
export function LogSlider({
  value,
  lo,
  hi,
  onChange,
}: {
  value: number;
  lo: number;
  hi: number;
  onChange: (v: number) => void;
}) {
  const t = ((Math.log10(Math.max(value, 10 ** lo)) - lo) / (hi - lo)) * 100;
  const toValue = (tt: number) => {
    const raw = 10 ** (lo + (tt / 100) * (hi - lo));
    // snap to 1/2/5 × 10^n for clean numbers
    const mag = 10 ** Math.floor(Math.log10(raw));
    const lead = raw / mag;
    const snapped = lead < 1.5 ? 1 : lead < 3.5 ? 2 : lead < 7.5 ? 5 : 10;
    return Math.round(snapped * mag);
  };
  return (
    <input
      type="range"
      className="dial w-full"
      min={0}
      max={100}
      step={1}
      value={Math.round(t)}
      onChange={(e) => onChange(toValue(Number(e.target.value)))}
    />
  );
}
