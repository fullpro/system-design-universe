"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, Trophy } from "lucide-react";
import { buildQuiz, type QuizQuestion } from "@/lib/quiz";

/** A single answerable question. Locks after the first choice and explains. */
export function QuizCard({
  question,
  accent = "#a5b4fc",
  onAnswered,
}: {
  question: QuizQuestion;
  accent?: string;
  onAnswered?: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    onAnswered?.(question.options[i].correct);
  };

  return (
    <div>
      <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--text)" }}>
        {question.prompt}
      </p>
      <div className="mt-2.5 space-y-1.5">
        {question.options.map((opt, i) => {
          const isPicked = picked === i;
          const reveal = answered && (opt.correct || isPicked);
          const bg = !answered
            ? "rgba(255,255,255,0.03)"
            : opt.correct
              ? "rgba(52,211,153,0.14)"
              : isPicked
                ? "rgba(248,113,113,0.14)"
                : "rgba(255,255,255,0.02)";
          const border = !answered
            ? "var(--border)"
            : opt.correct
              ? "rgba(52,211,153,0.5)"
              : isPicked
                ? "rgba(248,113,113,0.5)"
                : "var(--border)";
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className="flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-[12.5px] leading-snug transition-all"
              style={{ background: bg, border: `1px solid ${border}`, color: "var(--text)", cursor: answered ? "default" : "pointer" }}
            >
              <span className="mt-0.5 shrink-0">
                {reveal ? (
                  opt.correct ? <Check size={14} style={{ color: "var(--good)" }} /> : <X size={14} style={{ color: "var(--bad)" }} />
                ) : (
                  <span className="block h-3.5 w-3.5 rounded-full" style={{ border: `1.5px solid ${accent}` }} />
                )}
              </span>
              <span>
                {opt.text}
                {reveal && opt.because && (
                  <span className="mt-0.5 block text-[11px]" style={{ color: "var(--text-faint)" }}>{opt.because}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A short, self-paced self-test rendered as a full overlay. */
export function SelfTest({ onClose }: { onClose: () => void }) {
  const [seed, setSeed] = useState(() => Date.now());
  const questions = useMemo<QuizQuestion[]>(() => buildQuiz(8, seed), [seed]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredThis, setAnsweredThis] = useState(false);
  const done = idx >= questions.length;
  const q = questions[idx];

  const restart = () => {
    setSeed(Date.now());
    setIdx(0);
    setScore(0);
    setAnsweredThis(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[65] flex items-center justify-center p-4"
      style={{ background: "rgba(4,5,9,0.78)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="glass sheen w-full max-w-[460px] overflow-hidden rounded-3xl"
        style={{ boxShadow: "0 40px 100px -30px rgba(0,0,0,0.9)" }}
      >
        <div className="flex items-center justify-between px-5 pt-4" style={{ color: "var(--text)" }}>
          <span className="text-[14px] font-bold">Self-test</span>
          <button onClick={onClose} aria-label="Close" style={{ color: "var(--text-faint)" }}><X size={16} /></button>
        </div>

        {/* progress */}
        <div className="mt-2 px-5">
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#818cf8" }}
              animate={{ width: `${(Math.min(idx, questions.length) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-4 text-center">
                <Trophy size={34} className="mx-auto" style={{ color: score / questions.length >= 0.7 ? "var(--good)" : "var(--warn)" }} />
                <div className="mt-3 text-3xl font-bold tabular-nums" style={{ color: "var(--text)" }}>{score}/{questions.length}</div>
                <p className="mt-1 text-[12.5px]" style={{ color: "var(--text-dim)" }}>
                  {score === questions.length ? "Flawless — you've got the intuitions cold." : score / questions.length >= 0.7 ? "Strong recall. Review the misses and go again." : "Worth another pass — recall is how it sticks."}
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={restart} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-semibold transition-all hover:brightness-110" style={{ background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)", color: "#c7d2fe" }}>
                    <RotateCcw size={14} /> New set
                  </button>
                  <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-white/10" style={{ border: "1px solid var(--border)", color: "var(--text-dim)" }}>Done</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key={idx} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                  Question {idx + 1} of {questions.length}
                </div>
                <QuizCard
                  question={q}
                  onAnswered={(correct) => {
                    if (answeredThis) return;
                    setAnsweredThis(true);
                    if (correct) setScore((s) => s + 1);
                  }}
                />
                <button
                  onClick={() => {
                    setIdx((i) => i + 1);
                    setAnsweredThis(false);
                  }}
                  disabled={!answeredThis}
                  className="mt-4 flex w-full items-center justify-center rounded-xl py-2.5 text-[13px] font-semibold transition-all disabled:opacity-40"
                  style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.45)", color: "#c7d2fe" }}
                >
                  {idx === questions.length - 1 ? "See results" : "Next question"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
