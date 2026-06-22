"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONCEPTS } from "@/lib/concepts";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { rgba } from "@/lib/color";
import { useUniverse } from "@/lib/store";
import type { CategoryId, Concept } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { WidgetModal } from "@/components/learn/WidgetModal";
import { TOOLS, type ToolDef } from "@/components/learn/registry";

function ConceptCard({ concept, index }: { concept: Concept; index: number }) {
  const selectConcept = useUniverse((s) => s.selectConcept);
  const selected = useUniverse((s) => s.selectedConceptId === concept.id);
  const accent = CATEGORIES[concept.category].accent;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.012, 0.25), duration: 0.25 }}
      onClick={() => selectConcept(concept.id)}
      className="group sheen flex h-full flex-col gap-2 rounded-2xl p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: selected ? rgba(accent, 0.14) : "var(--panel)",
        border: `1px solid ${selected ? accent : rgba(accent, 0.28)}`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
          style={{ background: rgba(accent, 0.16), color: accent, border: `1px solid ${rgba(accent, 0.3)}` }}
        >
          <Icon name={concept.icon} size={18} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold leading-tight" style={{ color: "var(--text)" }}>
            {concept.name}
          </div>
          {concept.internal && (
            <div className="text-[9.5px] font-medium uppercase tracking-wide" style={{ color: rgba(accent, 0.8) }}>
              zoomable
            </div>
          )}
        </div>
      </div>
      <p className="line-clamp-2 text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>
        {concept.tagline}
      </p>
    </motion.button>
  );
}

function CategorySection({ category, concepts }: { category: CategoryId; concepts: Concept[] }) {
  const c = CATEGORIES[category];
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.accent, boxShadow: `0 0 8px ${c.accent}` }} />
        <h2 className="text-[15px] font-bold tracking-tight" style={{ color: "var(--text)" }}>{c.label}</h2>
        <span className="text-[12px]" style={{ color: "var(--text-faint)" }}>{c.blurb}</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {concepts.map((concept, i) => (
          <ConceptCard key={concept.id} concept={concept} index={i} />
        ))}
      </div>
    </section>
  );
}

export function LearnGallery() {
  const [widget, setWidget] = useState<ToolDef | null>(null);
  const closeDetail = useUniverse((s) => s.closeDetail);
  const openWidget = (tool: ToolDef) => {
    closeDetail();
    setWidget(tool);
  };

  // Group concepts by category once.
  const byCategory = new Map<CategoryId, Concept[]>();
  for (const concept of CONCEPTS) {
    if (!byCategory.has(concept.category)) byCategory.set(concept.category, []);
    byCategory.get(concept.category)!.push(concept);
  }
  // Foundations first (featured), then the rest in canonical order.
  const ordered = ["foundation", ...CATEGORY_ORDER.filter((c) => c !== "foundation")] as CategoryId[];

  return (
    <div className="scroll-fade absolute inset-x-0 bottom-0 top-[56px] z-20 overflow-y-auto sm:top-[64px]">
      <div className="mx-auto max-w-[1140px] px-3 pb-20 pt-3 sm:px-5 sm:pt-4">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 mt-2"
        >
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: "var(--text)" }}>The Atlas</h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-dim)" }}>
            Every concept and cross-cutting principle in one place — {CONCEPTS.length} lessons. Click any card to open it.
          </p>
        </motion.header>

        {/* Interactive tools */}
        <section className="mb-8">
          <div className="mb-3 flex items-baseline gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#a5b4fc", boxShadow: "0 0 8px #a5b4fc" }} />
            <h2 className="text-[15px] font-bold tracking-tight" style={{ color: "var(--text)" }}>Interactive Tools</h2>
            <span className="text-[12px]" style={{ color: "var(--text-faint)" }}>Play with the numbers and tradeoffs directly.</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => openWidget(tool)}
                className="group sheen flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: rgba(tool.accent, 0.1), border: `1px solid ${rgba(tool.accent, 0.4)}` }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{ background: rgba(tool.accent, 0.18), color: tool.accent, border: `1px solid ${rgba(tool.accent, 0.35)}` }}
                >
                  {tool.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold leading-tight" style={{ color: "var(--text)" }}>{tool.name}</div>
                  <div className="text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{tool.tagline}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {ordered.map((cat) => {
          const concepts = byCategory.get(cat);
          if (!concepts || concepts.length === 0) return null;
          return <CategorySection key={cat} category={cat} concepts={concepts} />;
        })}
      </div>

      <AnimatePresence>
        {widget && (
          <WidgetModal
            title={widget.title}
            subtitle={widget.subtitle}
            onClose={() => setWidget(null)}
          >
            {widget.render()}
          </WidgetModal>
        )}
      </AnimatePresence>
    </div>
  );
}
