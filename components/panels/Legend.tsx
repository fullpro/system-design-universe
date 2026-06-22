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

export function Legend() {
  const mobile = useIsMobile();
  const [open, setOpen] = useState(true);

  // Collapse on first mount when on a small screen.
  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setOpen(false);
  }, []);
  const layerFilter = useUniverse((s) => s.layerFilter);
  const setLayerFilter = useUniverse((s) => s.setLayerFilter);

  // Only categories with at least one node on the World Map are focusable.
  const onMap = useMemo(() => {
    const ids = new Set(MAP_NODES.map((n) => n.id));
    const cats = new Set(CONCEPTS.filter((c) => ids.has(c.id)).map((c) => c.category));
    return cats;
  }, []);

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
                  const active = layerFilter === id;
                  return (
                    <button
                      key={id}
                      disabled={!focusable}
                      onClick={() => setLayerFilter(id)}
                      title={focusable ? `Focus the ${c.label} layer` : `${c.label} isn't on the World Map`}
                      className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors enabled:hover:bg-white/5 disabled:opacity-35"
                      style={active ? { background: rgba(c.accent, 0.16) } : undefined}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.accent, boxShadow: focusable ? `0 0 6px ${c.accent}` : "none" }} />
                      <span className="text-[11px]" style={{ color: active ? c.accent : "var(--text-dim)" }}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="px-3.5 pb-2.5 text-[9.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
                Click a layer to focus it on the map.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
