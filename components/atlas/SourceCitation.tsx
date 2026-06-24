"use client";

import { ExternalLink, BookOpen, Code, Mic, GraduationCap, FileText, Scroll } from "lucide-react";
import type { AtlasSource } from "@/lib/types";

const SOURCE_ICONS: Record<AtlasSource["type"], React.ReactNode> = {
  rfc: <Scroll size={12} />,
  documentation: <BookOpen size={12} />,
  "engineering-blog": <FileText size={12} />,
  "conference-talk": <Mic size={12} />,
  "academic-paper": <GraduationCap size={12} />,
  "open-source": <Code size={12} />,
};

const SOURCE_LABELS: Record<AtlasSource["type"], string> = {
  rfc: "RFC",
  documentation: "Docs",
  "engineering-blog": "Blog",
  "conference-talk": "Talk",
  "academic-paper": "Paper",
  "open-source": "Code",
};

export function SourceCitation({ source, accent = "#818cf8" }: { source: AtlasSource; accent?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-[11.5px] leading-snug transition-colors hover:bg-white/5"
      style={{ color: "var(--text-dim)" }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: accent }}>
        {SOURCE_ICONS[source.type]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-faint)" }}>
            {SOURCE_LABELS[source.type]}
          </span>
          {source.date && (
            <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{source.date}</span>
          )}
        </div>
        <span className="line-clamp-1 group-hover:underline">{source.title}</span>
        {source.publication && (
          <span className="text-[10px]" style={{ color: "var(--text-faint)" }}> — {source.publication}</span>
        )}
      </div>
      <ExternalLink size={11} className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: accent }} />
    </a>
  );
}

export function SourceList({ sources, accent }: { sources: AtlasSource[]; accent?: string }) {
  if (!sources.length) return null;
  return (
    <div className="space-y-0.5">
      {sources.map((src, i) => (
        <SourceCitation key={`${src.url}-${i}`} source={src} accent={accent} />
      ))}
    </div>
  );
}
