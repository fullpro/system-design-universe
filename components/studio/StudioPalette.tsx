"use client";

import { useMemo } from "react";
import { Trash2, Sparkles, Plus } from "lucide-react";
import { BUILDABLE } from "@/lib/studio";
import { CUSTOM_KINDS, KIND_META, type NodeKind } from "@/lib/studioTypes";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { rgba } from "@/lib/color";
import type { CategoryId, Concept } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

interface Props {
  count: number;
  onAdd: (conceptId: string) => void;
  onAddCustom: (kind: NodeKind) => void;
  onClear: () => void;
  onExample: () => void;
}

export function StudioPalette({ count, onAdd, onAddCustom, onClear, onExample }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<CategoryId, Concept[]>();
    for (const id of BUILDABLE) {
      const c = getConcept(id);
      if (!c) continue;
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({ cat, items: map.get(cat)! }));
  }, []);

  return (
    <div className="flex w-full shrink-0 flex-col sm:glass sm:sheen sm:h-full sm:w-[244px] sm:rounded-2xl">
      <div className="flex items-center justify-between px-3.5 pb-2.5 pt-3">
        <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Components</span>
        <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-faint)" }}>{count}</span>
      </div>

      <div className="flex gap-1.5 px-3 pb-2.5">
        <button onClick={onExample} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold transition-all hover:brightness-110" style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.45)", color: "#c7d2fe" }}>
          <Sparkles size={12} /> Example
        </button>
        <button onClick={onClear} disabled={count === 0} className="flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all enabled:hover:bg-white/10 disabled:opacity-30" style={{ border: "1px solid var(--border)", color: "var(--text-dim)" }} title="Clear canvas">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="scroll-fade min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {/* Custom typed nodes — build anything; double-click to rename. */}
        <div className="mb-3">
          <div className="mb-1 flex items-center gap-1.5 px-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#a5b4fc" }} />
            <span className="text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Custom · build anything</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {CUSTOM_KINDS.map((kind) => {
              const m = KIND_META[kind];
              return (
                <button
                  key={kind}
                  onClick={() => onAddCustom(kind)}
                  title={m.hint}
                  className="group flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-white/5"
                  style={{ border: `1px solid ${rgba(m.accent, 0.18)}` }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md" style={{ background: rgba(m.accent, 0.14), color: m.accent }}>
                    <Icon name={m.icon} size={11} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[10.5px] font-medium" style={{ color: "var(--text-dim)" }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-1 px-1.5 text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
          Known components
        </div>
        {grouped.map(({ cat, items }) => {
          const c = CATEGORIES[cat];
          return (
            <div key={cat} className="mb-2.5">
              <div className="mb-1 flex items-center gap-1.5 px-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} />
                <span className="text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{c.label}</span>
              </div>
              <div className="space-y-1">
                {items.map((concept) => {
                  const accent = CATEGORIES[concept.category].accent;
                  return (
                    <button
                      key={concept.id}
                      onClick={() => onAdd(concept.id)}
                      title={concept.tagline}
                      className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: rgba(accent, 0.14), color: accent, border: `1px solid ${rgba(accent, 0.25)}` }}>
                        <Icon name={concept.icon} size={13} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium" style={{ color: "var(--text)" }}>{concept.name}</span>
                      <Plus size={12} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--text-faint)" }} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
