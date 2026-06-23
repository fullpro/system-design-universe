"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronDown, X } from "lucide-react";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { CONCEPTS } from "@/lib/concepts";
import { MAP_NODES } from "@/lib/map";
import { rgba } from "@/lib/color";
import { useUniverse } from "@/lib/store";
import { useIsMobile } from "@/lib/useIsMobile";
import { Icon } from "@/components/ui/Icon";
import type { CategoryId } from "@/lib/types";

export function Legend() {
  const mobile = useIsMobile();
  const [open, setOpen] = useState(true);
  // A cross-cutting category whose concepts are shown in a popover (they have no
  // single home on the map because they apply across every tier).
  const [lens, setLens] = useState<CategoryId | null>(null);

  // Collapse on first mount when on a small screen.
  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  }, []);
  const layerFilter = useUniverse((s) => s.layerFilter);
  const setLayerFilter = useUniverse((s) => s.setLayerFilter);
  const selectConcept = useUniverse((s) => s.selectConcept);

  // Only categories with at least one node on the World Map are focusable.
  const onMap = useMemo(() => {
    const ids = new Set(MAP_NODES.map((n) => n.id));
    const cats = new Set(CONCEPTS.filter((c) => ids.has(c.id)).map((c) => c.category));
    return cats;
  }, []);
  const lensConcepts = useMemo(
    () => (lens ? CONCEPTS.filter((c) => c.category === lens) : []),
    [lens],
  );

  return (
    <div className="absolute left-2 top-[56px] z-20 w-[180px] sm:left-3 sm:top-[72px] sm:w-[210px]">
      <div className="glass sheen overflow-hidden rounded-2xl">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-3.5 py-2.5"
        >
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
            <Layers size={13} /> Layers
          </span>
          <span className="flex items-center gap-1.5">
            {layerFilter && (
              <span
                onClick={(e) => { e.stopPropagation(); setLayerFilter(null); }}
                className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                style={{ background: rgba(CATEGORIES[layerFilter].accent, 0.2), color: CATEGORIES[layerFilter].accent }}
              >
                <X size={9} /> clear
              </span>
            )}
            <motion.span animate={{ rotate: open ? 0 : -90 }} style={{ color: "var(--text-faint)" }}>
              <ChevronDown size={15} />
            </motion.span>
          </span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 gap-0.5 px-2 pb-2">
                {CATEGORY_ORDER.map((id) => {
                  const c = CATEGORIES[id];
                  const focusable = onMap.has(id);
                  const active = layerFilter === id || lens === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        if (focusable) {
                          setLens(null);
                          setLayerFilter(id);
                        } else {
                          setLayerFilter(null);
                          setLens((l) => (l === id ? null : id));
                        }
                      }}
                      title={focusable ? `Focus the ${c.label} layer` : `${c.label} applies across the whole system — see its concepts`}
                      className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-white/5"
                      style={active ? { background: rgba(c.accent, 0.16) } : undefined}
                    >
                      {/* Solid dot = sits on the map; ring = cross-cutting (everywhere). */}
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={focusable
                          ? { background: c.accent, boxShadow: `0 0 6px ${c.accent}` }
                          : { background: "transparent", border: `1.5px solid ${c.accent}` }}
                      />
                      <span className="text-[11px]" style={{ color: active ? c.accent : "var(--text-dim)" }}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="px-3.5 pb-2.5 text-[9.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--text-faint)" }} /> on the map ·
                  <span className="h-1.5 w-1.5 rounded-full" style={{ border: "1.5px solid var(--text-faint)" }} /> cross-cutting
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cross-cutting concepts popover — gives every Atlas concept a home reachable
          from the map, while honestly framing them as system-wide concerns. */}
      <AnimatePresence>
        {lens && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="glass sheen mt-2 overflow-hidden rounded-2xl"
          >
            <div className="flex items-center justify-between px-3.5 pt-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: CATEGORIES[lens].accent }}>
                {CATEGORIES[lens].label}
              </span>
              <button onClick={() => setLens(null)} aria-label="Close" style={{ color: "var(--text-faint)" }}><X size={13} /></button>
            </div>
            <p className="px-3.5 pb-2 pt-0.5 text-[9.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
              Applies across every tier — no single home on the map.
            </p>
            <div className="max-h-[44vh] space-y-0.5 overflow-y-auto px-2 pb-2 scroll-fade">
              {lensConcepts.map((c) => {
                const accent = CATEGORIES[c.category].accent;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectConcept(c.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}>
                      <Icon name={c.icon} size={13} />
                    </span>
                    <span className="text-[11.5px] font-medium" style={{ color: "var(--text)" }}>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
