# The Reasoning Engine

> Turning System Design Universe from a platform that teaches **technologies** into one
> that teaches **decision-making**. The new **Reason** mode answers "my database is
> overloaded — Redis, replicas, sharding, or CQRS?" rather than "what is Redis?".

Everything here is **deterministic, rule-based, content-driven** — no AI, no backend. Add a
rule, a scenario, or an archetype as data and it flows through the UI automatically.

---

## 1 · Feature architecture

A single new top-level mode, **Reason**, hosts a sub-navigated workspace. Three sub-modes
ship today, all sitting on one shared reasoning core:

```
Reason (workspace)
├─ Architecture Advisor   constraints  → rule engine → justified architecture + score
├─ Bottleneck Diagnosis   symptoms     → scenario data → root cause + fixes
└─ Tradeoff Lab           priorities   → matcher      → best-fit archetype + ranking
                                   │
                          ┌────────┴─────────┐
                          │  reasoning core  │  lib/reasoning/
                          │  axes · scoring ·│  (shared by every sub-mode)
                          │  rules · data    │
                          └──────────────────┘
```

The **Scoring Engine** (six axes) is the shared currency: the Advisor scores its output, the
Tradeoff Lab plots each archetype, and a future Comparison mode will overlay two designs on
the same radar.

## 2 · State management

Extends the existing Zustand store (`lib/store.ts`) — no new store:

```ts
mode: ViewMode            // gains "reason"
reasonTab: ReasonTab      // "advisor" | "diagnose" | "tradeoff"
requirements: Requirements        // Advisor inputs
priorities: PriorityVector        // Tradeoff sliders
scenarioIndex, diagSelected, diagRevealed   // Diagnosis progress
// actions: setReasonTab, setRequirements, applyRequirements, setPriority,
//          applyPriorities, answerScenario, gotoScenario
```

Each sub-view derives its output with a pure function inside `useMemo` — state stays minimal;
the engine is stateless.

## 3 · Data models (`lib/reasoning/`)

- **`axes.ts`** — the six scoring axes (Scalability, Reliability, Latency, Cost-efficiency,
  Simplicity, Operability), `AxisScores`, `overallScore`. Higher is always better.
- **`requirements.ts`** — `Requirements` (users, rps, read %, geo, availability, latency,
  budget, consistency) + `derive()` flags + `REQUIREMENT_PRESETS`.
- **`advisor.ts`** — `Recommendation` (id, conceptId, tier, reason, solves, alternatives,
  tradeoff) + `COMPONENT_META` catalog.
- **`scenarios.ts`** — `Scenario` (context, metrics, options, correct, root cause, evidence,
  fixes, lesson) for Bottleneck Diagnosis.
- **`tradeoff.ts`** — `Archetype` (priority profile, component stack, pros/cons/ops).

## 4 · Rule engine (`advisor.ts`)

`runAdvisor(requirements)` derives high-level flags, then applies ordered rules. Each rule
`add(componentId, reason)`s a component **justified by the constraint that triggered it** —
so a `<100ms` global target adds a CDN *with the sentence explaining why*. Components dedupe
by id and sort by `tier` into the request path; cross-cutting concerns (rate limiting,
failover, multi-region, observability) form a separate reliability/ops layer. Extensible:
new behaviour is one `COMPONENT_META` entry + one `add(...)` line.

## 5 · Scoring engine (`scoring.ts`)

`scoreArchitecture(componentIds)` starts every axis at a baseline (50) and sums each
component's signed `COMPONENT_DELTAS` — a cache buys latency & scale but costs simplicity;
sharding buys scale at a brutal simplicity/ops price; multi-region buys reliability & global
latency at steep cost & complexity. Clamped to 0–100 and rendered as a hexagonal `Radar`.
The same function scores Advisor output and every Tradeoff archetype.

## 6 · Simulation / matching engine

- **Diagnosis** is a self-checking scenario quiz — the "simulation" is the symptom→cause
  mapping encoded in each `Scenario`.
- **Tradeoff** `matchArchetypes(priorities)` ranks archetypes by RMSE distance between the
  user's desired priority vector and each archetype's delivered profile — closest wins,
  proving you can't max every axis at once.
- *(Next wave)* The **Failure Simulator** adds a dependency/cascade model: kill a component →
  propagate impact through the graph → recompute availability/latency/error-rate.

## 7 · Folder structure (additions)

```
lib/reasoning/   axes · requirements · scoring · advisor · scenarios · tradeoff
components/reason/
  ReasonWorkspace   sub-nav + routing
  AdvisorView · DiagnosisView · TradeoffView
  Radar             shared 6-axis radar
  controls          Segmented / Slider / LogSlider / Field
```

## 8 · UI wireframes

```
Advisor                              Diagnosis                 Tradeoff Lab
┌ constraints ┬ recommendation ┐    ┌ scenario ──────────┐    ┌ sliders ┬ best-fit ──┐
│ presets     │ summary  ▢radar│    │ metric metric tiles│    │ consist │ archetype  │
│ ▭ users     │ ① Client      │    │ Q: bottleneck?     │    │ avail   │ stack chips│
│ ▭ rps       │ ② DNS  why…   │    │ ○ option           │    │ latency │ pros  cons │
│ ▭ r/w       │ ③ CDN  solves │    │ ○ option ✓         │    │ thrupt  │ ▢radar     │
│ ◻ geo       │ …              │    │ ─ root cause       │    │ cost    ├────────────┤
│ ◻ avail     │ ops layer ▢ ▢  │    │ ─ fixes · lesson   │    │ simple  │ fit ranking│
└─────────────┴────────────────┘    └────────────────────┘    └─────────┴────────────┘
```


All six reasoning sub-modes are live under the **Reason** tab. Future: drag-and-drop on the
Interview canvas, a "diagnosis streak" score, and shareable/URL-encoded designs.
