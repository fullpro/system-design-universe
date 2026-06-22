"use client";

import { useState } from "react";
import { Database, LayoutGrid } from "lucide-react";

interface Option {
  label: string;
  sql?: number;
  nosql?: number;
}
interface Question {
  id: string;
  q: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "relational",
    q: "How connected is your data?",
    options: [
      { label: "Lots of joins & foreign keys", sql: 2 },
      { label: "Mostly standalone records", nosql: 2 },
    ],
  },
  {
    id: "consistency",
    q: "Consistency requirement?",
    options: [
      { label: "Strong / ACID transactions", sql: 2 },
      { label: "Eventual is acceptable", nosql: 2 },
    ],
  },
  {
    id: "scale",
    q: "Write scale?",
    options: [
      { label: "Fits one primary + replicas", sql: 2 },
      { label: "Must shard writes across machines", nosql: 2 },
    ],
  },
  {
    id: "schema",
    q: "Schema shape?",
    options: [
      { label: "Stable & well-defined", sql: 1 },
      { label: "Evolving / semi-structured", nosql: 1 },
    ],
  },
];

const ACCESS: { label: string; type: string }[] = [
  { label: "By key", type: "Key-Value · Redis" },
  { label: "Whole documents", type: "Document · MongoDB" },
  { label: "Huge tables", type: "Wide-Column · Cassandra" },
  { label: "Relationships", type: "Graph · Neo4j" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-3 py-1.5 text-[12px] font-medium transition-all"
      style={{
        background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(129,140,248,0.6)" : "var(--border)"}`,
        color: active ? "#c7d2fe" : "var(--text-dim)",
      }}
    >
      {children}
    </button>
  );
}

export function SqlVsNoSql() {
  const [answers, setAnswers] = useState<Record<string, number>>({
    relational: 0,
    consistency: 0,
    scale: 0,
    schema: 0,
  });
  const [access, setAccess] = useState(1);

  let sql = 0;
  let nosql = 0;
  for (const question of QUESTIONS) {
    const opt = question.options[answers[question.id] ?? 0];
    sql += opt.sql ?? 0;
    nosql += opt.nosql ?? 0;
  }
  const isSql = sql >= nosql;

  return (
    <div>
      <div className="space-y-3">
        {QUESTIONS.map((question) => (
          <div key={question.id} className="flex flex-wrap items-center gap-2">
            <span className="w-[180px] shrink-0 text-[12.5px]" style={{ color: "var(--text-dim)" }}>{question.q}</span>
            {question.options.map((opt, i) => (
              <Chip
                key={opt.label}
                active={(answers[question.id] ?? 0) === i}
                onClick={() => setAnswers((a) => ({ ...a, [question.id]: i }))}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-[180px] shrink-0 text-[12.5px]" style={{ color: "var(--text-dim)" }}>If NoSQL, you read…</span>
          {ACCESS.map((a, i) => (
            <Chip key={a.label} active={access === i} onClick={() => setAccess(i)}>
              {a.label}
            </Chip>
          ))}
        </div>
      </div>

      <div
        className="mt-5 flex items-center gap-4 rounded-2xl p-4"
        style={{
          background: isSql ? "rgba(251,191,36,0.1)" : "rgba(99,102,241,0.12)",
          border: `1px solid ${isSql ? "rgba(251,191,36,0.4)" : "rgba(129,140,248,0.5)"}`,
        }}
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: isSql ? "rgba(251,191,36,0.18)" : "rgba(129,140,248,0.2)", color: isSql ? "#fbbf24" : "#a5b4fc" }}
        >
          {isSql ? <Database size={24} /> : <LayoutGrid size={24} />}
        </span>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Recommendation</div>
          <div className="text-[17px] font-bold" style={{ color: "var(--text)" }}>
            {isSql ? "Relational (SQL) — PostgreSQL / MySQL" : `NoSQL — ${ACCESS[access].type}`}
          </div>
          <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>
            {isSql
              ? "Your data's relationships, consistency needs and scale fit a relational database. Reach for NoSQL only when one of those genuinely breaks."
              : "Your scale, flexible schema or access pattern favour a non-relational store. Model the data around how you query it, and design for eventual consistency."}
          </p>
        </div>
      </div>
    </div>
  );
}
