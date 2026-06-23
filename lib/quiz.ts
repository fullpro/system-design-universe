import { CONCEPTS, getConcept } from "./concepts";
import type { Concept } from "./types";

/**
 * Deterministic retrieval-practice question generator.
 *
 * Recognition (reading a lesson) is weak; recall is what sticks. Every question
 * is derived from the existing concept library — no separate content to maintain
 * — and is deterministic per concept, so the same card always asks the same
 * thing (good for honest self-testing, and stable across renders).
 */

export interface QuizOption {
  text: string;
  correct: boolean;
  /** Shown after answering — why this option is right/wrong. */
  because?: string;
}

export interface QuizQuestion {
  id: string;
  conceptId: string;
  prompt: string;
  options: QuizOption[];
  /** Kind, for analytics/variety. */
  kind: "mental-model" | "tradeoff" | "alternative";
}

/** A tiny stable string hash → used for deterministic shuffles. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded shuffle (Fisher–Yates with a mulberry32 PRNG) — deterministic per seed. */
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rnd = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function intuition(c: Concept): string {
  return c.mentalModel ?? c.tagline;
}

/** Pick `n` distractor concepts unlike `concept` (different category preferred). */
function distractors(concept: Concept, n: number, seed: number): Concept[] {
  const pool = CONCEPTS.filter((c) => c.id !== concept.id && (c.mentalModel || c.tagline));
  const ranked = shuffle(pool, seed).sort((a, b) => {
    // Prefer a different category so the wrong answers are clearly wrong.
    const da = a.category === concept.category ? 1 : 0;
    const db = b.category === concept.category ? 1 : 0;
    return da - db;
  });
  return ranked.slice(0, n);
}

/** Build the canonical question for one concept (deterministic). */
export function quizForConcept(conceptId: string): QuizQuestion | null {
  const concept = getConcept(conceptId);
  if (!concept) return null;
  const seed = hash(conceptId);
  // Rotate question kind by hash so the set has variety, but each concept is stable.
  const kindRoll = seed % 3;

  if (kindRoll === 0 && (concept.mentalModel || concept.tagline)) {
    const wrong = distractors(concept, 3, seed);
    const options: QuizOption[] = [
      { text: intuition(concept), correct: true, because: `Yes — that's the core intuition for ${concept.name}.` },
      ...wrong.map((w) => ({ text: intuition(w), correct: false, because: `That's ${w.name}.` })),
    ];
    return { id: `q-${conceptId}`, conceptId, kind: "mental-model", prompt: `Which one-line intuition best captures ${concept.name}?`, options: shuffle(options, seed + 1) };
  }

  if (kindRoll === 1 && concept.disadvantages.length) {
    const wrong = distractors(concept, 3, seed).filter((w) => w.disadvantages.length);
    const options: QuizOption[] = [
      { text: concept.disadvantages[0], correct: true, because: `Correct — this is a real cost of ${concept.name}.` },
      ...wrong.slice(0, 3).map((w) => ({ text: w.disadvantages[0], correct: false, because: `That's a tradeoff of ${w.name}, not ${concept.name}.` })),
    ];
    return { id: `q-${conceptId}`, conceptId, kind: "tradeoff", prompt: `What is a genuine tradeoff of ${concept.name}?`, options: shuffle(options, seed + 1) };
  }

  if (concept.alternatives.length) {
    const correctAlt = concept.alternatives[0].name;
    const wrong = distractors(concept, 3, seed).map((w) => w.name);
    const options: QuizOption[] = [
      { text: correctAlt, correct: true, because: `Right — a common alternative to ${concept.name}.` },
      ...wrong.slice(0, 3).map((t) => ({ text: t, correct: false, because: `Not an alternative to ${concept.name}.` })),
    ];
    return { id: `q-${conceptId}`, conceptId, kind: "alternative", prompt: `Which is a real alternative to ${concept.name}?`, options: shuffle(options, seed + 1) };
  }

  // Fallback to mental-model if the chosen kind had no data.
  const wrong = distractors(concept, 3, seed);
  const options: QuizOption[] = [
    { text: intuition(concept), correct: true },
    ...wrong.map((w) => ({ text: intuition(w), correct: false })),
  ];
  return { id: `q-${conceptId}`, conceptId, kind: "mental-model", prompt: `Which one-line intuition best captures ${concept.name}?`, options: shuffle(options, seed + 1) };
}

/** A short self-test of `n` distinct concepts, varied across categories. */
export function buildQuiz(n = 8, seed = Date.now()): QuizQuestion[] {
  const eligible = CONCEPTS.filter((c) => c.mentalModel || c.disadvantages.length || c.alternatives.length);
  return shuffle(eligible, seed)
    .slice(0, n)
    .map((c) => quizForConcept(c.id))
    .filter((q): q is QuizQuestion => q !== null);
}
