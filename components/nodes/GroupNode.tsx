"use client";

import { memo, useCallback } from "react";
import type { NodeProps } from "@xyflow/react";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { Icon } from "@/components/ui/Icon";
import { useUniverse } from "@/lib/store";

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export interface GroupNodeData {
  conceptId: string;
  labelOverride?: string;
  width: number;
  height: number;
  [key: string]: unknown;
}

function GroupNodeImpl({ data }: NodeProps) {
  const { conceptId, labelOverride, width, height } = data as GroupNodeData;
  const concept = getConcept(conceptId);
  const selectConcept = useUniverse((s) => s.selectConcept);
  const handleClick = useCallback(() => selectConcept(conceptId), [selectConcept, conceptId]);
  if (!concept) return null;

  const cat = CATEGORIES[concept.category];
  const accent = cat.accent;

  return (
    <div
      style={{
        width,
        height,
        background: rgba(accent, 0.04),
        border: `1.5px dashed ${rgba(accent, 0.35)}`,
        borderRadius: 20,
        position: "relative",
      }}
    >
      <div
        role="button"
        onClick={handleClick}
        className="flex cursor-pointer items-center gap-1.5 px-3 py-2 transition-opacity hover:opacity-80"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: rgba(accent, 0.14),
            color: accent,
            border: `1px solid ${rgba(accent, 0.25)}`,
          }}
        >
          <Icon name={concept.icon} size={13} strokeWidth={1.8} />
        </span>
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: rgba(accent, 0.7) }}
        >
          {labelOverride ?? concept.name}
        </span>
      </div>
    </div>
  );
}

export const GroupNode = memo(GroupNodeImpl);
