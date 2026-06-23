"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Compass, Gauge, GitBranch, Blocks, GraduationCap, BrainCircuit, CornerDownLeft } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { CONCEPTS, getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { WidgetModal } from "@/components/learn/WidgetModal";
import { TOOLS } from "@/components/learn/registry";
import type { ViewMode } from "@/lib/types";

interface Item {
  id: string;
  kind: "mode" | "concept" | "tool";
  label: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
  run: () => void;
}

const MODES: { mode: ViewMode; label: string; hint: string; icon: React.ReactNode }[] = [
  { mode: "map", label: "Explore", hint: "The request lifecycle map", icon: <Compass size={15} /> },
  { mode: "simulator", label: "Simulate", hint: "Traffic, heat & bottlenecks", icon: <Gauge size={15} /> },
  { mode: "evolution", label: "Evolve", hint: "Grow a system stage by stage", icon: <GitBranch size={15} /> },
  { mode: "studio", label: "Build", hint: "Design & get a live review", icon: <Blocks size={15} /> },
  { mode: "learn", label: "Learn", hint: "The atlas of every concept", icon: <GraduationCap size={15} /> },
  { mode: "reason", label: "Reason", hint: "Advise, diagnose, weigh tradeoffs", icon: <BrainCircuit size={15} /> },
];

export function CommandPalette() {
  const open = useUniverse((s) => s.commandOpen);
  const setCommandOpen = useUniverse((s) => s.setCommandOpen);
  const setMode = useUniverse((s) => s.setMode);
  const selectConcept = useUniverse((s) => s.selectConcept);
  const openTool = useUniverse((s) => s.openTool);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl-K toggle (and "/" when not typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!useUniverse.getState().commandOpen);
      } else if (e.key === "Escape" && useUniverse.getState().commandOpen) {
        setCommandOpen(false);
      } else if (
        e.key === "/" &&
        !useUniverse.getState().commandOpen &&
        !/^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items: Item[] = useMemo(() => {
    const all: Item[] = [
      ...MODES.map((m) => ({
        id: `mode-${m.mode}`,
        kind: "mode" as const,
        label: m.label,
        hint: m.hint,
        icon: m.icon,
        accent: "#a5b4fc",
        run: () => setMode(m.mode),
      })),
      ...TOOLS.map((t) => ({
        id: `tool-${t.id}`,
        kind: "tool" as const,
        label: t.name,
        hint: t.tagline,
        icon: t.icon,
        accent: t.accent,
        run: () => openTool(t.id),
      })),
      ...CONCEPTS.map((c) => ({
        id: `concept-${c.id}`,
        kind: "concept" as const,
        label: c.name,
        hint: c.tagline,
        icon: <Icon name={c.icon} size={15} />,
        accent: CATEGORIES[c.category].accent,
        run: () => selectConcept(c.id),
      })),
    ];
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all
      .map((it) => {
        const label = it.label.toLowerCase();
        let score = -1;
        if (label.startsWith(term)) score = 0;
        else if (label.includes(term)) score = 1;
        else if (it.hint.toLowerCase().includes(term)) score = 2;
        return { it, score };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.it);
  }, [q, setMode, selectConcept, openTool]);

  const close = () => setCommandOpen(false);
  const choose = (it?: Item) => {
    const target = it ?? items[active];
    if (!target) return;
    target.run();
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]"
            style={{ background: "rgba(4,5,9,0.72)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="glass sheen w-full max-w-[560px] overflow-hidden rounded-2xl"
              style={{ boxShadow: "0 40px 100px -30px rgba(0,0,0,0.9)" }}
            >
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <Search size={16} style={{ color: "var(--text-faint)" }} />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Search concepts, tools, modes…"
                  className="w-full bg-transparent text-[14px] outline-none"
                  style={{ color: "var(--text)" }}
                  aria-label="Command palette search"
                />
                <kbd className="hidden rounded px-1.5 py-0.5 text-[10px] sm:block" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-faint)", border: "1px solid var(--border)" }}>esc</kbd>
              </div>

              <div className="scroll-fade max-h-[52vh] overflow-y-auto p-1.5">
                {items.length === 0 && (
                  <div className="px-3 py-6 text-center text-[12.5px]" style={{ color: "var(--text-faint)" }}>
                    No matches for “{q}”.
                  </div>
                )}
                {items.slice(0, 40).map((it, i) => (
                  <button
                    key={it.id}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(it)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors"
                    style={{ background: i === active ? "rgba(99,102,241,0.18)" : "transparent" }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: rgba(it.accent, 0.16), color: it.accent, border: `1px solid ${rgba(it.accent, 0.3)}` }}>
                      {it.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold" style={{ color: "var(--text)" }}>{it.label}</span>
                      <span className="block truncate text-[11px]" style={{ color: "var(--text-dim)" }}>{it.hint}</span>
                    </span>
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-faint)" }}>
                      {it.kind}
                    </span>
                    {i === active && <CornerDownLeft size={13} style={{ color: "var(--text-faint)" }} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToolHost />
    </>
  );
}

/** Renders the interactive-tool modal when one is opened from anywhere. */
function ToolHost() {
  const activeToolId = useUniverse((s) => s.activeToolId);
  const closeTool = useUniverse((s) => s.closeTool);
  const tool = TOOLS.find((t) => t.id === activeToolId);
  return (
    <AnimatePresence>
      {tool && (
        <WidgetModal title={tool.title} subtitle={tool.subtitle} onClose={closeTool}>
          {tool.render()}
        </WidgetModal>
      )}
    </AnimatePresence>
  );
}
