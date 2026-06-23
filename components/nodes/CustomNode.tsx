"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { useUniverse } from "@/lib/store";
import { KIND_META, type NodeKind } from "@/lib/studioTypes";
import { rgba } from "@/lib/color";
import { Icon } from "@/components/ui/Icon";
import { NodeHandles } from "./NodeHandles";

export interface CustomNodeData {
  kind: NodeKind;
  label: string;
  [key: string]: unknown;
}

function CustomNodeImpl({ id, data, selected }: NodeProps) {
  const { kind, label } = data as CustomNodeData;
  const meta = KIND_META[kind] ?? KIND_META.other;
  const accent = meta.accent;
  const setStudioNodes = useUniverse((s) => s.setStudioNodes);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const next = draft.trim() || meta.label;
    setStudioNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: next } } : n)));
    setEditing(false);
  };

  // A boundary/zone renders as a translucent labelled container.
  const isZone = kind === "boundary";
  const isNote = kind === "note";

  if (isZone) {
    // Click-through fill so nodes placed inside stay grabbable; drag/rename via the label.
    return (
      <div
        className="relative h-full w-full rounded-2xl"
        style={{ border: `1.5px dashed ${rgba(accent, 0.55)}`, background: rgba(accent, 0.05), pointerEvents: "none" }}
      >
        <span
          onDoubleClick={() => setEditing(true)}
          className="absolute -top-2.5 left-3 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: "var(--panel-solid)", color: accent, border: `1px solid ${rgba(accent, 0.4)}`, pointerEvents: "auto", cursor: "move" }}
        >
          <Icon name={meta.icon} size={10} />
          {editing ? (
            <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} className="w-24 bg-transparent outline-none" style={{ color: "var(--text)" }} />
          ) : (
            label
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      className="concept-node group relative flex w-[180px] flex-col rounded-2xl text-left transition-all duration-200"
      style={{
        background: isNote ? rgba(accent, 0.08) : "var(--panel)",
        borderTop: `2.5px solid ${rgba(accent, selected ? 0.9 : 0.6)}`,
        borderRight: `1px solid ${rgba(accent, selected ? 0.5 : 0.18)}`,
        borderBottom: `1px solid ${rgba(accent, selected ? 0.5 : 0.18)}`,
        borderLeft: `1px solid ${rgba(accent, selected ? 0.5 : 0.18)}`,
        backdropFilter: "blur(12px)",
        "--node-glow": rgba(accent, 0.3),
      } as React.CSSProperties}
      onDoubleClick={() => setEditing(true)}
    >
      <NodeHandles />
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: rgba(accent, 0.14), color: accent, border: `1px solid ${rgba(accent, 0.25)}` }}>
          <Icon name={meta.icon} size={15} strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[8.5px] font-medium uppercase tracking-wider" style={{ color: rgba(accent, 0.75) }}>
            {meta.label}
          </div>
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              className="w-full bg-transparent text-[13px] font-semibold outline-none"
              style={{ color: "var(--text)" }}
            />
          ) : (
            <div className="truncate text-[13px] font-semibold leading-tight" style={{ color: "var(--text)" }}>
              {label}
            </div>
          )}
        </div>
      </div>
      {!editing && (
        <span className="pointer-events-none absolute inset-x-0 -bottom-5 text-center text-[8.5px] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--text-faint)" }}>
          double-click to rename
        </span>
      )}
    </div>
  );
}

export const CustomNode = memo(CustomNodeImpl);
