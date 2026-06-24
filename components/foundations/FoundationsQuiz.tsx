"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, Award, RotateCcw } from "lucide-react";
import { rgba } from "@/lib/color";
import type { QuizItem } from "@/lib/foundations-lessons";

function QuestionCard({
  item,
  index,
  total,
  onAnswer,
  accent,
}: {
  item: QuizItem;
  index: number;
  total: number;
  onAnswer: (correct: boolean) => void;
  accent: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  const handleSelect = (i: number) => {
    if (answered) return;
    setSelected(i);
    onAnswer(item.options[i].correct);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: "var(--text-faint)" }}>
          Question {index + 1} of {total}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-6 rounded-full transition-all"
              style={{
                background: i === index ? accent : i < index ? rgba(accent, 0.3) : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>
      </div>

      <h3 className="mt-3 text-[15px] font-semibold leading-snug" style={{ color: "var(--text)" }}>
        {item.question}
      </h3>

      <div className="mt-4 space-y-2">
        {item.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = answered && opt.correct;
          const showWrong = answered && isSelected && !opt.correct;

          let bg = "rgba(255,255,255,0.04)";
          let border = "rgba(255,255,255,0.08)";
          let textColor = "var(--text-dim)";

          if (showCorrect) {
            bg = "rgba(52,211,153,0.12)";
            border = "rgba(52,211,153,0.45)";
            textColor = "#34d399";
          } else if (showWrong) {
            bg = "rgba(248,113,113,0.12)";
            border = "rgba(248,113,113,0.45)";
            textColor = "#f87171";
          } else if (isSelected) {
            bg = rgba(accent, 0.12);
            border = rgba(accent, 0.45);
            textColor = accent;
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background: isSelected ? (showCorrect ? "#34d399" : showWrong ? "#f87171" : accent) : "rgba(255,255,255,0.08)",
                  color: isSelected ? "#fff" : "var(--text-faint)",
                }}
              >
                {showCorrect ? <Check size={11} /> : showWrong ? <X size={11} /> : String.fromCharCode(65 + i)}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[13px]" style={{ color: textColor }}>
                  {opt.text}
                </span>
                {answered && (isSelected || opt.correct) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1.5 text-[11.5px] leading-relaxed"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {opt.explanation}
                  </motion.p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function FoundationsQuiz({
  questions,
  accent,
  onComplete,
}: {
  questions: QuizItem[];
  accent: string;
  onComplete: (score: number, total: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (correct) setScore((s) => s + 1);
      setAnswered(true);
    },
    [],
  );

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setAnswered(false);
    } else {
      setFinished(true);
      onComplete(score + (answered ? 0 : 0), questions.length);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setScore(0);
    setAnswered(false);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl p-6 text-center"
        style={{
          background: passed ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
          border: `1px solid ${passed ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: passed ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
            color: passed ? "#34d399" : "#f87171",
          }}
        >
          <Award size={28} />
        </div>
        <div>
          <h3 className="text-[18px] font-bold" style={{ color: "var(--text)" }}>
            {passed ? "Great job!" : "Keep learning!"}
          </h3>
          <p className="mt-1 text-[14px]" style={{ color: "var(--text-dim)" }}>
            You scored {score} out of {questions.length} ({pct}%)
          </p>
        </div>
        {!passed && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all hover:brightness-110"
            style={{ background: rgba(accent, 0.15), color: accent, border: `1px solid ${rgba(accent, 0.35)}` }}
          >
            <RotateCcw size={14} /> Try again
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <QuestionCard
          key={current}
          item={questions[current]}
          index={current}
          total={questions.length}
          onAnswer={handleAnswer}
          accent={accent}
        />
      </AnimatePresence>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-end"
        >
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all hover:brightness-110"
            style={{ background: rgba(accent, 0.15), color: accent, border: `1px solid ${rgba(accent, 0.35)}` }}
          >
            {current < questions.length - 1 ? "Next question" : "See results"} <ChevronRight size={14} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
