# System Design Universe

> A "Google Maps for system design." An interactive, infinite-canvas world map that
> helps developers build a **complete mental model** of modern distributed systems by
> visually exploring how every major concept — DNS, CDN, Load Balancers, Redis, Kafka,
> Kubernetes, Sharding, Replication, Rate Limiting, Circuit Breakers — fits together.

It is **not** an interview-prep site, a company-architecture explorer, or a network
simulator. It teaches **relationships, tradeoffs, bottlenecks and scaling strategies**
through visualization and interaction.

🚀 **[Live Demo](https://system-design-universe.vercel.app)** — Start exploring now

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000  (this repo was previewed on :3100)
npm run build        # production build
```

Requires Node 18+ (developed on Node 24).

---

## The six modes

A top-bar switches between six ways of looking at the same universe (Explore, Simulate,
Evolve and Build run on one infinite, pannable, zoomable React Flow canvas; Learn and
Reason are dedicated surfaces):

| Mode | What it does |
|------|--------------|
| **Explore** (Map) | The canonical request lifecycle — `User → DNS → CDN → Load Balancer → API Gateway → Services → Cache → Database → Queue → Analytics` — as an animated graph. Launch a **guided request journey** that walks a packet hop-by-hop with a narrated decision at each step; **hover** any node for an instant why/tradeoff/alternative card; **focus a layer** to isolate it. Click any node for the full lesson. |
| **Internals** (zoom-in) | *“Zoom into the internals”* of a concept to dive into its flow — DNS recursive resolution, CDN cache-hit/miss, LB routing strategies, Redis cache-aside, DB replication, the TCP handshake, the circuit-breaker state machine, and more. **Step through** it with narration on every node, trigger **“what if it fails?”** scenarios, and open a **concept-specific interactive tool**. Auto-laid-out from a tiny graph spec. |
| **Simulate** | Drag the traffic dial from 100 → 1,000,000 users. Components accumulate **heat** (load ÷ capacity); the hottest is flagged as the **bottleneck** (with visible request **backlog**), alongside live **p99 latency** and **availability "nines"**. A **recommendation panel** explains the best fix and projects the **before → after**. Toggle solutions and watch the architecture adapt until it's healthy. |
| **Evolve** | Step a system through 9 cumulative stages, from one server to multi-region — each gated by a **problem-first question** before the change is revealed, with a live **complexity meter** (scalability / reliability / cost / operability) so you feel every tradeoff. |
| **Build** (Design Studio) | A **freeform sandbox**: assemble your own architecture from a component palette, drag to arrange and wire it together, and get a **live expert review** — a six-axis score, a letter grade, and a design linter that flags single points of failure, missing caches, exposed datastores and absent observability in real time. |
| **Learn** (Atlas) | A browsable gallery of all concepts and cross-cutting principles (CAP, consistency, ACID/BASE, scaling, the nines) — each with a **mental model** and a **myth vs reality** — plus **seven interactive tools**: a back-of-the-envelope **Capacity Estimator**, **Latency Numbers** visualizer, **Consistent-Hashing Ring**, **Load-Balancer Strategies**, **Cache Hit-Ratio Simulator**, **CAP Explorer**, and **SQL-vs-NoSQL** chooser. |
| **Reason** (Reasoning Engine) | Think like an architect, not a memoriser — six deterministic, rule-based sub-modes. **Architecture Advisor**: constraints → a justified architecture + six-axis score. **Bottleneck Diagnosis**: incidents + metrics → root-cause reasoning. **Tradeoff Lab**: slide priorities → best-fit archetype. **Failure Simulator**: break components → cascading failure, failover & recovery on a live graph. **Comparison**: two options on one radar, side by side. **Interview Challenge**: build a design from a palette → graded against a reference. No AI — see [REASONING.md](REASONING.md). |

---

## 1 · Product architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Universe (shell)                      │
│  TopBar (mode switch)   ·   Legend   ·   Guide               │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │                  React Flow infinite canvas              │ │
│ │   nodeTypes: concept | internal | sim                    │ │
│ │   edgeTypes: flow (animated bezier + travelling packet)  │ │
│ └──────────────────────────────────────────────────────────┘ │
│  DetailPanel (right drawer)                                  │
│  SimulatorBar / EvolutionBar / InternalsHeader (per mode)    │
└──────────────────────────────────────────────────────────────┘
            ▲                                    ▲
            │ reads view state                   │ derives graph
     ┌──────┴────────┐                  ┌────────┴─────────┐
     │  Zustand store│                  │  pure builders   │
     │ (mode, sel,   │                  │  map / internals │
     │  tier, stage) │                  │  sim / evolution │
     └───────────────┘                  └──────────────────┘
                                                 ▲
                                        ┌────────┴─────────┐
                                        │  CONCEPTS (data) │  ← single source of truth
                                        └──────────────────┘
```

**Principle:** the UI is a pure function of `(view state) × (content data)`. All four modes
are computed by small, testable builder functions from one content library. There is no
backend — content is JSON-driven and shipped statically.

## 2 · Information architecture

- **Concept** — the atomic unit of learning. ~18 concepts across 12 **categories**
  (Client, Networking, Edge, Traffic, Application, Caching, Data, Messaging, Scalability,
  Reliability, Observability, Analytics). Each concept carries a full lesson + an optional
  zoomable internal flow.
- **Category** — the colour/identity system. One accent colour per category is the single
  source of truth used by nodes, edges, panels and the legend.
- **Views** — Map, Internals, Simulator, Evolution — are *projections* of the concept set.

## 3 · UI layout (wireframe)

```
┌─ brand ─────────────┬──── [Explore][Simulate][Evolve] ──────┬─ Guide ─┐
│                                                                       │
│ ┌ Legend ┐                                          ┌─ DetailPanel ─┐ │
│ │ layers │              ● animated request          │  icon · name  │ │
│ └────────┘              ●   lifecycle on            │  definition   │ │
│                         ●   infinite canvas         │  why · problem│ │
│                         ●                           │  tradeoffs    │ │
│                  [minimap]                [zoom ±]  │  alternatives │ │
│ ┌──────────── SimulatorBar / EvolutionBar ─────────┐│  interview Qs │ │
│ │ traffic dial · bottleneck · solution toggles     │└───────────────┘ │
│ └──────────────────────────────────────────────────┘                  │
└───────────────────────────────────────────────────────────────────────┘
```

## 4 · Data model (`lib/types.ts`)

```ts
Concept {
  id, name, category, icon, tagline,
  definition, whyItExists, problemSolved,
  advantages[], disadvantages[], alternatives[{name,note}],
  realWorld[], interviewQuestions[], scaling,
  internal?: { summary, nodes[], edges[] }   // optional zoom-in flow
}
Category { id, label, blurb, accent }
MapNodeDef { id, x, y }       MapEdgeDef { id, source, target, label?, dashed?, handles? }
TrafficTier / Solution        // simulator model
EvolutionStage { title, trigger, narrative, addNodes[], addEdges[], removeEdges?, labels? }
```

Add a new technology by appending one `Concept` object to `lib/concepts.ts` — it
automatically gains a detail panel, a legend entry and (if it declares `internal`) a
zoomable diagram. **Content scales independently of code.**

## 5 · Component hierarchy

```
app/page.tsx
└─ Universe                         (client shell, ReactFlowProvider)
   ├─ Canvas                        builds nodes/edges per mode → <ReactFlow>
   │  ├─ nodes/ConceptNode          map + evolution
   │  ├─ nodes/InternalNode         zoom-in flowchart nodes
   │  ├─ nodes/SimNode              heat bars + bottleneck pulse
   │  └─ edges/FlowEdge             animated bezier + travelling packet
   ├─ panels/TopBar                 mode switcher + guide
   ├─ panels/DetailPanel            the lesson drawer (framer-motion)
   ├─ panels/SimulatorBar           traffic dial + solution toggles
   ├─ panels/EvolutionBar           9-stage stepper
   ├─ panels/InternalsHeader        back + summary
   └─ panels/Legend                 category colour key
```

## 6 · Folder structure

```
app/            layout.tsx · page.tsx · globals.css (theme + RF overrides)
components/      Universe · Canvas · nodes/* · edges/* · panels/* · ui/*
lib/            types · categories · concepts (content) · map · internals
                · simulator · evolution · store (zustand) · color
```

## 7 · Learning progression system

The app deliberately teaches in three escalating loops:

1. **Spatial** — *where does this sit?* The Map gives every concept a home in the request
   lifecycle, so knowledge is anchored to a place.
2. **Causal** — *why does this exist?* The Simulator induces a real bottleneck, then lets
   you feel a technology solve it. Solutions are recommended **counterfactually** — a fix
   only appears if toggling it would actually cool the current hottest component, so the
   advice is always correct, and the bottleneck *moves* (reads → writes → app tier) the
   way it does in real systems.
3. **Temporal** — *when do I add this?* Evolution sequences decisions against the scale
   and pain that justify them, countering premature optimization.

## 8 · Architecture graph schema

- **World map:** `MapNodeDef[]` (fixed positions) + `MapEdgeDef[]` (with optional handle
  anchors `sb/tt/sl/tr/...` for clean routing).
- **Internals:** a concept's `{nodes, edges}` are auto-laid-out by `lib/internals.ts` —
  BFS rank assignment → top-down layers, branches spread horizontally, back-edges
  (state-machine cycles) loop on the right.
- **Simulator:** `lib/simulator.ts` is a deterministic load model — `heat = demand ÷
  capacity`, mitigations either cut demand or raise capacity; the bottleneck and
  suggestions fall out of the math.
- **Evolution:** stages declare `addNodes / addEdges / removeEdges / labels`; the builder
  folds them cumulatively over fixed positions so new pieces animate into a stable layout.

## 9· Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · React Flow
(`@xyflow/react` v12) · Framer Motion · Zustand · lucide-react. No backend required.
