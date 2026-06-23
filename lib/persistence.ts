"use client";

import { useEffect, useRef } from "react";
import { useUniverse } from "./store";

/**
 * Lightweight persistence + shareable-URL state.
 *
 * We deliberately avoid the zustand `persist` middleware: this app is a fully
 * client-rendered shell, and reading localStorage in an explicit post-mount
 * effect (gated by a `hydrated` flag) keeps SSR output deterministic and avoids
 * hydration mismatches. The same encoded slice powers shareable URLs.
 */

const KEY = "sdu:v1";

/** The subset of store state we persist / can share. */
interface Persisted {
  mode: ReturnType<typeof currentSlice>["mode"];
  hasOnboarded: boolean;
  visitedModes: string[];
  studiedConcepts: string[];
  lessonDensity: "beginner" | "deep";
  trafficTier: number;
  enabledSolutions: string[];
  evolutionStage: number;
  evoSolved: number[];
  requirements: ReturnType<typeof currentSlice>["requirements"];
  priorities: ReturnType<typeof currentSlice>["priorities"];
  reasonTab: ReturnType<typeof currentSlice>["reasonTab"];
  journeyId: string;
  studioNodes: ReturnType<typeof currentSlice>["studioNodes"];
  studioEdges: ReturnType<typeof currentSlice>["studioEdges"];
}

function currentSlice() {
  const s = useUniverse.getState();
  return {
    mode: s.mode,
    hasOnboarded: s.hasOnboarded,
    visitedModes: s.visitedModes,
    studiedConcepts: s.studiedConcepts,
    lessonDensity: s.lessonDensity,
    trafficTier: s.trafficTier,
    enabledSolutions: s.enabledSolutions,
    evolutionStage: s.evolutionStage,
    evoSolved: s.evoSolved,
    requirements: s.requirements,
    priorities: s.priorities,
    reasonTab: s.reasonTab,
    journeyId: s.journeyId,
    studioNodes: s.studioNodes,
    studioEdges: s.studioEdges,
  };
}

function snapshot(): Persisted {
  const c = currentSlice();
  return { ...c } as Persisted;
}

/** Base64url-encode a state slice for a shareable `#s=` URL fragment. */
export function encodeState(partial: Partial<Persisted>): string {
  try {
    const json = JSON.stringify(partial);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch {
    return "";
  }
}

function decodeState(s: string): Partial<Persisted> | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as Partial<Persisted>;
  } catch {
    return null;
  }
}

/** Build a shareable URL that restores the current Build/Simulate/Advisor state. */
export function buildShareUrl(): string {
  if (typeof window === "undefined") return "";
  const s = useUniverse.getState();
  const share: Partial<Persisted> = {
    mode: s.mode,
    trafficTier: s.trafficTier,
    enabledSolutions: s.enabledSolutions,
    evolutionStage: s.evolutionStage,
    requirements: s.requirements,
    priorities: s.priorities,
    reasonTab: s.reasonTab,
    studioNodes: s.studioNodes,
    studioEdges: s.studioEdges,
  };
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#s=${encodeState(share)}`;
}

/**
 * Hydrate persisted/shared state on mount, then mirror future changes to
 * localStorage (debounced). URL `#s=` state wins over localStorage.
 */
export function usePersistence() {
  const hydratePersisted = useUniverse((s) => s.hydratePersisted);
  const hydrated = useUniverse((s) => s.hydrated);
  const wrote = useRef(false);

  // Load once.
  useEffect(() => {
    let patch: Partial<Persisted> = {};
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) patch = { ...(JSON.parse(raw) as Partial<Persisted>) };
    } catch {
      /* ignore */
    }
    if (window.location.hash.startsWith("#s=")) {
      const shared = decodeState(window.location.hash.slice(3));
      if (shared) {
        patch = { ...patch, ...shared };
        // Don't let a shared link suppress onboarding for a genuine first-timer
        // beyond this session — but do skip the welcome when arriving via a link.
        patch.hasOnboarded = true;
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    hydratePersisted(patch as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change (debounced) once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const write = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        try {
          localStorage.setItem(KEY, JSON.stringify(snapshot()));
        } catch {
          /* quota / private mode — ignore */
        }
      }, 400);
    };
    wrote.current = true;
    const unsub = useUniverse.subscribe(write);
    write();
    return () => {
      clearTimeout(t);
      unsub();
    };
  }, [hydrated]);
}
