"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Check,
  BookOpen,
  Dumbbell,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useUniverse } from "@/lib/store";
import { Icon } from "@/components/ui/Icon";
import { rgba } from "@/lib/color";
import { FOUNDATION_LEVELS } from "@/lib/foundations-lessons";
import { LevelAnimation } from "./LevelAnimation";
import { LessonCard } from "./LessonCard";
import { FoundationsQuiz } from "./FoundationsQuiz";

function LevelSidebar({
  currentLevel,
  completedLevels,
  onSelect,
}: {
  currentLevel: number;
  completedLevels: number[];
  onSelect: (n: number) => void;
}) {
  return (
    <nav className="w-full lg:w-56 shrink-0">
      <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
        {FOUNDATION_LEVELS.map((level) => {
          const isCurrent = level.number === currentLevel;
          const isCompleted = completedLevels.includes(level.number);
          const isLocked = level.number > 1 && !completedLevels.includes(level.number - 1) && !isCurrent;

          return (
            <button
              key={level.id}
              onClick={() => !isLocked && onSelect(level.number)}
              disabled={isLocked}
              className="group flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all lg:w-full"
              style={{
                background: isCurrent ? rgba(level.accent, 0.12) : "transparent",
                border: `1px solid ${isCurrent ? rgba(level.accent, 0.35) : "transparent"}`,
                opacity: isLocked ? 0.4 : 1,
              }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                style={{
                  background: isCompleted ? rgba(level.accent, 0.2) : isCurrent ? rgba(level.accent, 0.15) : "rgba(255,255,255,0.06)",
                  color: isCompleted || isCurrent ? level.accent : "var(--text-faint)",
                  border: `1px solid ${isCompleted || isCurrent ? rgba(level.accent, 0.35) : "transparent"}`,
                }}
              >
                {isCompleted ? <Check size={13} /> : isLocked ? <Lock size={11} /> : level.number}
              </span>
              <div className="hidden min-w-0 lg:block">
                <div className="truncate text-[12px] font-semibold" style={{ color: isCurrent ? "var(--text)" : "var(--text-dim)" }}>
                  {level.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function LevelView({ levelNumber }: { levelNumber: number }) {
  const level = FOUNDATION_LEVELS.find((l) => l.number === levelNumber);
  const [showQuiz, setShowQuiz] = useState(false);
  const completeLevel = useUniverse((s) => s.completeFoundationsLevel);
  const setFoundationsLevel = useUniverse((s) => s.setFoundationsLevel);
  const completedLevels = useUniverse((s) => s.foundationsCompleted);

  const handleQuizComplete = useCallback(
    (score: number, total: number) => {
      if (score / total >= 0.6) {
        completeLevel(levelNumber);
      }
    },
    [completeLevel, levelNumber],
  );

  const goNext = () => {
    if (levelNumber < FOUNDATION_LEVELS.length) {
      setFoundationsLevel(levelNumber + 1);
      setShowQuiz(false);
    }
  };

  if (!level) return null;

  const isCompleted = completedLevels.includes(levelNumber);
  const isLast = levelNumber === FOUNDATION_LEVELS.length;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={level.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3 }}
        className="max-w-[720px]"
      >
        {/* Level header */}
        <div className="mb-6 flex items-start gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: rgba(level.accent, 0.15),
              color: level.accent,
              border: `1px solid ${rgba(level.accent, 0.35)}`,
              boxShadow: `0 0 24px ${rgba(level.accent, 0.12)}`,
            }}
          >
            <Icon name={level.icon} size={28} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: rgba(level.accent, 0.15), color: level.accent }}>
                Level {level.number}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                  <Check size={10} /> Completed
                </span>
              )}
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl" style={{ color: "var(--text)" }}>
              {level.title}
            </h2>
            <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-dim)" }}>
              {level.subtitle}
            </p>
          </div>
        </div>

        {/* Interactive animation (if present) */}
        {level.animation && (
          <div className="mb-6">
            <LevelAnimation steps={level.animation} accent={level.accent} />
          </div>
        )}

        {/* Lesson sections */}
        <div className="space-y-3">
          {level.sections.map((section, i) => (
            <LessonCard key={section.id} section={section} accent={level.accent} index={i} />
          ))}
        </div>

        {/* Quiz toggle */}
        <div className="mt-8">
          {!showQuiz ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <button
                onClick={() => setShowQuiz(true)}
                className="sheen flex items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  background: rgba(level.accent, 0.15),
                  color: level.accent,
                  border: `1px solid ${rgba(level.accent, 0.4)}`,
                }}
              >
                <Dumbbell size={16} /> Test your knowledge
              </button>
              {isCompleted && !isLast && (
                <button
                  onClick={goNext}
                  className="flex items-center gap-1.5 text-[13px] font-medium transition-all hover:brightness-125"
                  style={{ color: level.accent }}
                >
                  Next level <ArrowRight size={14} />
                </button>
              )}
            </div>
          ) : (
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{ background: rgba(level.accent, 0.04), border: `1px solid ${rgba(level.accent, 0.15)}` }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[15px] font-bold" style={{ color: "var(--text)" }}>
                  <Dumbbell size={16} style={{ color: level.accent }} /> Knowledge Check
                </h3>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="text-[11px]"
                  style={{ color: "var(--text-faint)" }}
                >
                  Close
                </button>
              </div>
              <FoundationsQuiz
                questions={level.quiz}
                accent={level.accent}
                onComplete={handleQuizComplete}
              />
              {isCompleted && !isLast && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={goNext}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all hover:brightness-110"
                    style={{ background: rgba(level.accent, 0.15), color: level.accent, border: `1px solid ${rgba(level.accent, 0.35)}` }}
                  >
                    Continue to Level {levelNumber + 1} <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function FoundationsWorkspace() {
  const currentLevel = useUniverse((s) => s.foundationsLevel);
  const completedLevels = useUniverse((s) => s.foundationsCompleted);
  const setFoundationsLevel = useUniverse((s) => s.setFoundationsLevel);
  const setMode = useUniverse((s) => s.setMode);

  const progress = completedLevels.length;
  const total = FOUNDATION_LEVELS.length;
  const pct = Math.round((progress / total) * 100);

  return (
    <div className="scroll-fade absolute inset-x-0 bottom-0 top-[56px] z-20 overflow-y-auto sm:top-[64px]">
      <div className="mx-auto max-w-[1060px] px-3 pb-20 pt-3 sm:px-5 sm:pt-4">
        {/* Page header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 mt-2"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: "var(--text)" }}>
                  System Design Foundations
                </h1>
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}
                >
                  <Sparkles size={10} /> Beginner
                </span>
              </div>
              <p className="mt-1 text-[13px]" style={{ color: "var(--text-dim)" }}>
                From &ldquo;I know how to code&rdquo; to &ldquo;I understand how modern systems are built.&rdquo;
              </p>
            </div>
            <button
              onClick={() => setMode("learn")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all hover:brightness-125"
              style={{ color: "var(--text-faint)", border: "1px solid var(--border)" }}
            >
              <BookOpen size={13} /> Full Atlas
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #6366f1, #a78bfa)" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className="text-[12px] font-medium" style={{ color: "var(--text-dim)" }}>
              {progress}/{total} levels
            </span>
          </div>
        </motion.header>

        {/* Main layout: sidebar + content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          <LevelSidebar
            currentLevel={currentLevel}
            completedLevels={completedLevels}
            onSelect={setFoundationsLevel}
          />
          <div className="min-w-0 flex-1">
            <LevelView levelNumber={currentLevel} />
          </div>
        </div>
      </div>
    </div>
  );
}
