"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Plus, Sparkles, AlertTriangle, ClipboardCheck, Target } from "lucide-react";
import { CHALLENGES, PALETTE, evaluateDesign, type ReqComponent } from "@/lib/reasoning/challenges";
import { getConcept } from "@/lib/concepts";
import { CATEGORIES } from "@/lib/categories";
import { rgba } from "@/lib/color";
import { useUniverse } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";

function compName(id: string) {
  return getConcept(id)?.name ?? id;
}
function compIcon(id: string) {
  return getConcept(id)?.icon ?? "Box";
}
function compAccent(id: string) {
  const c = getConcept(id);
  return c ? CATEGORIES[c.category].accent : "#818cf8";
}

export function InterviewView() {
  const [challengeId, setChallengeId] = useState(CHALLENGES[0].id);
  const [design, setDesign] = useState<Set<string>>(new Set());
  const [evaluated, setEvaluated] = useState(false);
  const selectConcept = useUniverse((s) => s.selectConcept);

  const challenge = CHALLENGES.find((c) => c.id === challengeId) ?? CHALLENGES[0];

  // Reset the board when the challenge changes.
  useEffect(() => {
    setDesign(new Set());
    setEvaluated(false);
  }, [challengeId]);

  const evaln = useMemo(() => evaluateDesign(challenge, design), [challenge, design]);

  const add = (id: string) => setDesign((p) => new Set(p).add(id));
  const remove = (id: string) =>
    setDesign((p) => {
      const n = new Set(p);
      n.delete(id);
      return n;
    });

  const ReqRow = ({ r, ok }: { r: ReqComponent; ok: boolean }) => (
    <div className="flex items-start gap-2 text-[12.5px] leading-snug">
      {ok ? <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--good)" }} /> : <X size={14} className="mt-0.5 shrink-0" style={{ color: "var(--bad)" }} />}
      <span style={{ color: "var(--text-dim)" }}>
        <button onClick={() => selectConcept(r.id)} className="font-semibold hover:underline" style={{ color: "var(--text)" }}>{compName(r.id)}</button> — {r.why}
      </span>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-5 py-6 lg:grid-cols-[330px_1fr]">
      {/* brief + palette */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {CHALLENGES.map((c) => {
            const active = c.id === challengeId;
            return (
              <button key={c.id} onClick={() => setChallengeId(c.id)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium transition-all" style={{ background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "rgba(129,140,248,0.6)" : "var(--border)"}`, color: active ? "#c7d2fe" : "var(--text-dim)" }}>
                <Icon name={c.icon} size={12} /> {c.name}
              </button>
            );
          })}
        </div>

        <div className="sheen rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>{challenge.name}</h2>
          <p className="mt-1 text-[12.5px] leading-snug" style={{ color: "var(--text-dim)" }}>{challenge.prompt}</p>
          <div className="mt-3 space-y-2.5">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}><Target size={11} /> Assumptions</div>
              {challenge.assumptions.map((a) => <div key={a} className="text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>• {a}</div>)}
            </div>
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>Non-functional reqs</div>
              {challenge.nfrs.map((a) => <div key={a} className="text-[11.5px] leading-snug" style={{ color: "var(--text-dim)" }}>• {a}</div>)}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Component palette</div>
          <div className="flex flex-wrap gap-1.5">
            {PALETTE.map((id) => {
              const added = design.has(id);
              const accent = compAccent(id);
              return (
                <button key={id} onClick={() => add(id)} disabled={added} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11.5px] font-medium transition-all disabled:opacity-35" style={{ background: rgba(accent, 0.1), border: `1px solid ${rgba(accent, 0.35)}`, color: "var(--text-dim)" }}>
                  <Icon name={compIcon(id)} size={12} style={{ color: accent }} /> {compName(id)} {!added && <Plus size={11} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* board + evaluation */}
      <div className="space-y-5">
        <div className="sheen min-h-[120px] rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px dashed var(--border-strong)" }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Your design</span>
            <button onClick={() => setEvaluated(true)} disabled={design.size === 0} className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-[12.5px] font-semibold transition-all enabled:hover:brightness-110 disabled:opacity-30" style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}>
              <ClipboardCheck size={14} /> Evaluate
            </button>
          </div>
          {design.size === 0 ? (
            <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>Click components from the palette to assemble your architecture.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {[...design].map((id) => {
                const accent = compAccent(id);
                return (
                  <button key={id} onClick={() => remove(id)} className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium" style={{ background: rgba(accent, 0.14), border: `1px solid ${rgba(accent, 0.4)}`, color: "var(--text)" }}>
                    <Icon name={compIcon(id)} size={12} style={{ color: accent }} /> {compName(id)}
                    <X size={12} className="opacity-50 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {evaluated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="sheen flex items-center gap-4 rounded-2xl p-4" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(129,140,248,0.35)" }}>
              <div className="text-center">
                <div className="text-3xl font-bold tabular-nums" style={{ color: evaln.score >= 70 ? "var(--good)" : evaln.score >= 40 ? "var(--warn)" : "var(--bad)" }}>{evaln.score}%</div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>coverage</div>
              </div>
              <p className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{evaln.verdict}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sheen rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Essentials</div>
                <div className="space-y-1.5">
                  {evaln.present.map((r) => <ReqRow key={r.id} r={r} ok />)}
                  {evaln.missing.map((r) => <ReqRow key={r.id} r={r} ok={false} />)}
                </div>
              </div>
              <div className="sheen rounded-2xl p-4" style={{ background: "var(--panel)", border: "1px solid var(--border)" }}>
                {evaln.bonusPresent.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}><Sparkles size={11} /> Nice extras</div>
                    {evaln.bonusPresent.map((b) => <div key={b.id} className="text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>✓ {compName(b.id)} — {b.why}</div>)}
                  </div>
                )}
                {evaln.overEngineered.length > 0 && (
                  <div className="mb-3 text-[12px] leading-snug" style={{ color: "var(--text-faint)" }}>
                    <span className="font-semibold" style={{ color: "var(--warn)" }}>Possibly over-engineered: </span>
                    {evaln.overEngineered.map(compName).join(", ")} — make sure each earns its complexity.
                  </div>
                )}
                <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}><AlertTriangle size={11} /> Common pitfalls</div>
                {challenge.pitfalls.map((p) => <div key={p} className="text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>• {p}</div>)}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
