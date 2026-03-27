# Phase 5: Dashboard UX Redesign — Research

**Researched:** 2026-03-27
**Domain:** React/Next.js frontend UX, jargon elimination, industrial SaaS design, progress/loading states
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UX-01 | All jargon replaced throughout UI: r_water/r_diesel/r_naoh → plain labels; BTU → energy content; phase → processing step; blend ratio → mix proportion; Gatekeeper/B&B never visible | Full jargon audit in § Jargon Audit maps every occurrence to a replacement string |
| UX-02 | Dashboard layout leads with the cost savings story (baseline vs. optimized cost) before showing technical details | § Architecture Patterns describes the "story-first" tab reorder and CostStory elevation |
| UX-03 | Each processing step shows operator-ready plain-language instructions ("Mix X litres of Stream A with Y litres of Stream B") | § Code Examples shows the sentence-generation pattern; § Architecture Patterns describes OperationTab upgrade |
| PLSH-03 | Optimization run shows a progress/loading indicator so a 60-second 5-stream run does not appear frozen | § Standard Stack covers the interval-ticker approach; § Architecture Patterns documents the multi-stage message sequence |
</phase_requirements>

---

## Summary

Phase 5 is a pure front-end pass. The Python algorithm and API route are unchanged. All work lives inside `dashboard/src/`. The phase has four independent concerns that map cleanly to two implementation plans: (1) jargon elimination across every user-facing string (UX-01), (2) story-first layout reorder so CostStory appears first inside the Optimization tab (UX-02), (3) operator-ready sentence generation in OperationTab (UX-03), and (4) a multi-stage progress indicator during the optimization POST (PLSH-03).

The existing codebase is already well-structured. The design tokens, brand colors, and component architecture are stable. No new npm packages are required — framer-motion (already installed at ^12.36.0), React `useState`/`useEffect`, and `setInterval` are sufficient for the progress ticker. The jargon audit below identifies every file and line that must change, making this a mechanical but precision task.

**Primary recommendation:** Implement in two plans — Plan 05-01 addresses jargon (UX-01) and the progress indicator (PLSH-03), because both are mechanical and self-contained. Plan 05-02 addresses layout story-first reorder (UX-02) and operator instruction sentences (UX-03), because both affect rendered output that must be visually verified.

---

## Jargon Audit (UX-01 — Complete Inventory)

This is the authoritative map of every jargon occurrence in user-facing UI text. TypeScript variable names and internal code comments are NOT jargon — only strings rendered in the browser matter.

### Files Requiring Changes

| File | Line(s) | Current Text | Replacement |
|------|---------|--------------|-------------|
| `manifest-tab.tsx` | 131 | `BTU/lb` (table header) | `Energy (BTU/lb)` |
| `manifest-tab.tsx` | 216/220 | `BTU Target` / `BTU/lb` (config label + unit) | `Energy Target` / `BTU/lb` — keep unit (understood by engineers in this context) |
| `recipe-tab.tsx` | 109–111 | `Optimized Feed Schedule — N Phases` | `Optimized Processing Plan — N Steps` |
| `recipe-tab.tsx` | 146 | `Phase {idx+1}` (badge) | `Step {idx+1}` |
| `recipe-tab.tsx` | 165 | `Blend ratio:` | `Mix proportion:` |
| `recipe-tab.tsx` | 207–220 | `Water:` / `Diesel:` / `NaOH:` labels for additive rates | `Water added:` / `Fuel supplement:` / `Neutralizer:` |
| `operation-tab.tsx` | 84 | `Operator Work Instructions — N Phases` | `Operator Instructions — N Processing Steps` |
| `operation-tab.tsx` | 137–139 | `Blend ratio:` + ratio string | `Mix proportion:` |
| `operation-tab.tsx` | 161 | `Waste Feed Rates` section header | `Waste Feed Rates` — acceptable; keep |
| `operation-tab.tsx` | 209 | `Additive Pump Rates` section header | keep — pump operator understands |
| `operation-tab.tsx` | 213 | `Water pump` label | `Water pump` — keep (operator term) |
| `operation-tab.tsx` | 219 | `Diesel pump` label | `Fuel supplement pump` |
| `operation-tab.tsx` | 225 | `NaOH pump` label | `Neutralizer pump` |
| `operation-tab.tsx` | 232–235 | `r_ext = {value} L external / L waste` | plain: `Total additives: {value} L per L of waste` |
| `phase-details-tab.tsx` | 38 | `blend properties, Gatekeeper rates, and safety checks` | `blend properties, additive rates, and safety checks` |
| `phase-details-tab.tsx` | 95/129 | `Phase {idx+1}` pill | `Step {idx+1}` |
| `phase-details-tab.tsx` | 127 | `BTU/lb` row label | `Energy (BTU/lb)` |
| `phase-details-tab.tsx` | 142 | `{/* Gatekeeper Rates — progressive disclosure */}` | comment only; section header already fixed (was fixed in Phase 4 to "Additive Rates") |
| `phase-details-tab.tsx` | 253/258 | `r_ext (total)` / `W (L/min)` visible plain text | `Total additives (L/L)` / `Waste throughput (L/min)` |
| `phase-details-tab.tsx` | 302 | `Effective BTU/lb` SafetyCheck label | `Effective energy (BTU/lb)` |
| `phase-details-tab.tsx` | 303 | `≥1800 BTU/lb` limit string | `≥1800 BTU/lb` — keep (technical spec, in PhaseDetails which is the expert tab) |
| `phase-details-tab.tsx` | 304 | `W ≥ W_min` SafetyCheck label | `Throughput ≥ minimum` |
| `cost-story.tsx` | 105 | `NaOH Cost` row | `Neutralizer Cost` |
| `intro-tab.tsx` | 34 | `BTU value` | `energy value (BTU/lb)` |
| `intro-tab.tsx` | 55 | `blend ratios, additive pump rates` | `mix proportions, additive pump rates` |
| `intro-tab.tsx` | 70–71 | `High BTU` / `Low BTU` pair labels | `High energy` / `Low energy` |
| `intro-tab.tsx` | 147 | `high-BTU resin with a low-BTU aqueous stream` | `high-energy resin with a low-energy aqueous stream` |
| `expert-overrides.tsx` | 94–103 | `Gatekeeper Rates` section + `r_water`/`r_diesel`/`r_naoh` labels | This is the **expert/technical** section deliberately labeled for engineers. Per the Phase 4 decision, it was renamed to "Additive Rates" already. The `r_water/r_diesel/r_naoh` variable labels here live inside the "Technical Calibration" expert accordion — acceptable per CLAUDE.md's progressive disclosure pattern. **Do NOT change these; they are in the expert-only section.** |

### Files That Are Clean (No Changes Needed)
- `topbar.tsx` — no jargon
- `impact-header.tsx` — "Diesel Offset" label is OK; not chemistry jargon
- `cost-story.tsx` — "Diesel Cost" row (one change: NaOH → Neutralizer above)
- `sensitivity-note.tsx` — no jargon
- `assumptions-panel.tsx` — intentionally technical (expert section)

### Key Insight on Scope
TypeScript type fields (`r_water`, `r_naoh`, `BTU_diesel`, etc. in `lib/types.ts`) are **internal identifiers**, not user-facing text. Do NOT rename them — changing type field names would cascade to `run_optimization.py` bridge and all Python model serialization. The Python dataclass field names must remain unchanged.

---

## Architecture Patterns

### Pattern 1: Story-First Tab Layout (UX-02)

**What:** The "Optimization" tab currently renders `RecipeTab` (phase cards + cost chart) then `CostStory` below it. For story-first, `CostStory` must appear **above** the phase step cards so the savings comparison is the first thing visible.

**Current render order in `page.tsx` (recipe tab):**
```
RecipeTab → [loading state OR phase cards + cost chart]
CostStory → [baseline vs. optimized table + climate impact]
```

**New render order:**
```
CostStory  → [savings story — FIRST]
RecipeTab  → [step-by-step plan — SECOND]
```

**Implementation:** In `page.tsx`, swap the JSX order inside `TabsContent value="recipe"`. CostStory is already conditionally shown on `(result || loading)` — that guard remains. RecipeTab already handles its own empty/loading states.

**Why this works without component changes:** Both components are siblings in the same `TabsContent`. Swapping JSX order requires changing ~4 lines in `page.tsx` only.

### Pattern 2: Operator Instruction Sentence Generator (UX-03)

**What:** Each processing step in OperationTab must show a human-readable sentence like "Mix 4.2 litres of Stream A with 2.1 litres of Stream B, then add 0.8 litres of water."

**The data is already available** — `phase.W`, `phase.r_water`, `phase.r_diesel`, `phase.r_naoh`, `phase.streams` (stream ID + ratio parts), `phase.runtime_min`, `phase.Q_phase`.

**Sentence generation formula:**
```typescript
// Source: derived from operation-tab.tsx existing calculations
function buildInstructionSentence(phase: PhaseResult): string {
  const streamEntries = Object.entries(phase.streams);
  const totalRatioSum = streamEntries.reduce((s, [, r]) => s + r, 0);

  // Volume consumed per stream over full phase runtime
  const streamVolumes = streamEntries.map(([sid, ratio]) => ({
    sid,
    litres: ((phase.W * ratio) / totalRatioSum) * phase.runtime_min,
  }));

  // Additive totals for the phase
  const waterLitres = phase.r_water * phase.W * phase.runtime_min;
  const dieselLitres = phase.r_diesel * phase.W * phase.runtime_min;
  const naohLitres = phase.r_naoh * phase.W * phase.runtime_min;

  const wastePart = streamVolumes
    .map(({ sid, litres }) => `${litres.toFixed(1)} L of ${sid}`)
    .join(" with ");

  const additiveParts: string[] = [];
  if (waterLitres > 0.01) additiveParts.push(`${waterLitres.toFixed(1)} L of water`);
  if (dieselLitres > 0.01) additiveParts.push(`${dieselLitres.toFixed(1)} L of fuel supplement`);
  if (naohLitres > 0.01) additiveParts.push(`${naohLitres.toFixed(1)} L of neutralizer`);

  const addPart = additiveParts.length > 0
    ? `, then add ${additiveParts.join(" and ")}`
    : "";

  return `Mix ${wastePart}${addPart}. Run for ${(phase.runtime_min / 60).toFixed(1)} hours.`;
}
```

**Placement:** A highlighted instruction box at the top of each OperationTab phase card, above the existing 3-column metric grid. Use a subtle `bg-ax-cyan-light border border-ax-cyan/30` callout card.

### Pattern 3: Multi-Stage Progress Indicator (PLSH-03)

**What:** A multi-stage progress bar with meaningful status messages shown during the ~60-second 5-stream optimization run.

**Constraint:** The API call is a single `fetch()` to `/api/optimize` that blocks until the Python subprocess exits. There is no streaming or SSE from the current route. The route cannot push interim progress because the Python process writes no intermediate output to stdout.

**Solution: Client-side time-based progress ticker**

The optimization durations are predictable (from CLAUDE.md benchmarks):
- 3 streams: ~0.01s
- 4 streams: ~0.8s
- 5 streams: ~60s

Use an `setInterval` ticker that advances through pre-defined stages over an estimated time budget. The number of streams in the current run (`streams.length`) determines the time budget.

```typescript
// Source: derived from CLAUDE.md benchmarks
const STAGE_MESSAGES = [
  "Reading waste manifest…",
  "Computing baseline costs…",
  "Evaluating blend combinations…",
  "Pruning infeasible recipes…",
  "Ranking by total cost…",
  "Finalising optimal plan…",
];

// Time budgets per stream count (ms)
const TIME_BUDGET: Record<number, number> = {
  1: 500,
  2: 500,
  3: 1000,
  4: 5000,
  5: 65000,
};
```

The ticker advances the stage index at equal intervals. The UI shows: (1) current stage message, (2) a determinate progress bar that moves forward in equal steps per stage, (3) the stage number ("Step 3 of 6").

**Implementation approach:**
- New component: `OptimizationProgress` in `dashboard/src/components/dashboard/optimization-progress.tsx`
- Props: `streamCount: number; isVisible: boolean`
- Uses `useEffect` + `setInterval` internally; clears on unmount
- Rendered in `page.tsx` above the tab content area when `loading === true`
- No new npm dependencies — uses existing shadcn `Progress` component

**Framer-motion option (optional polish):** Use `useMotionValue` + `useSpring` from the already-installed `framer-motion@^12.36.0` to animate the progress bar fill smoothly. The `number-ticker.tsx` magicui component already demonstrates this exact pattern.

### Pattern 4: Tab Label Alignment

The TABS array in `page.tsx` currently uses:
```typescript
{ value: "recipe", label: "Optimization", ... }
```

The "Phase Details" tab label uses "phase" terminology. Per UX-01 elimination:
- "Phase Details" → "Processing Details" (or keep — it's in the expert section tab)

Decision for planner: The "Phase Details" tab label is borderline. "Phase" here refers to a processing phase, which is operational vocabulary. Recommend keeping as-is to avoid confusing the tab bar, but flag for product owner sign-off.

### Recommended Component Layout After Phase 5

```
page.tsx  (state, handlers)
  Topbar
  ImpactHeader
  Tabs
    [Waste Streams tab]  manifest-tab.tsx  — minor label changes
    [Optimization tab]   cost-story.tsx   ← FIRST (savings story)
                         recipe-tab.tsx   ← SECOND (step cards)
    [Operation tab]      operation-tab.tsx — instruction sentence + label fixes
    [Processing Details] phase-details-tab.tsx — label fixes
  OptimizationProgress   ← new component, shown when loading=true
```

### Anti-Patterns to Avoid

- **Renaming TypeScript type fields** (`r_water`, `r_naoh` in `lib/types.ts`): Would cascade to the Python bridge serialization. Type fields are internal identifiers, not UI text.
- **Streaming the API response**: The current `spawn()` approach buffers stdout and returns on close. Converting to streaming would require a major API refactor, SSE, and Python-side progress printing. Out of scope for Phase 5.
- **Using a new animation library for progress**: framer-motion is already installed and proven in the codebase (number-ticker.tsx). Do not add `react-spring` or similar.
- **Making OperationTab instruction sentences context-dependent on screen size**: The sentences are always visible — they are the primary content. Do not hide behind a toggle.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animated progress bar fill | Custom CSS animation | shadcn `Progress` + framer-motion `useSpring` | Already in codebase, proven |
| Stage message cycling | Custom state machine | `setInterval` + `useState` index | Trivial; no library needed |
| Operator instruction text | External NLP or template engine | Pure TypeScript string interpolation (pattern above) | Data is already structured |
| Streaming optimizer progress | SSE / WebSockets | Time-based client ticker | Python process has no interim output; streaming would require algorithm changes |

---

## Common Pitfalls

### Pitfall 1: Changing TypeScript Type Field Names
**What goes wrong:** Developer renames `r_water` to `water_ratio` in `lib/types.ts`, breaking JSON deserialization from the Python bridge.
**Why it happens:** The jargon audit surfaces `r_water` in types.ts. It's tempting to rename all occurrences.
**How to avoid:** The jargon audit table above explicitly marks types.ts as out of scope. Only change strings inside JSX/render output.
**Warning signs:** TypeScript error in `run_optimization.py` output mapping or `result.optimized.phases[0].r_water` returning `undefined`.

### Pitfall 2: Progress Indicator Not Clearing on Fast Runs
**What goes wrong:** On a 3-stream run (~0.01s), the progress component mounts, triggers the interval, then the result arrives almost immediately. If the interval cleanup is not careful, stale stage messages briefly flash on the next run.
**Why it happens:** `setInterval` in React requires cleanup in `useEffect` return.
**How to avoid:** Always `clearInterval` in the `useEffect` cleanup function. Reset stage index to 0 whenever `isVisible` transitions from `true` to `false`.

### Pitfall 3: CostStory Empty State Visible Above Recipe Phase Cards
**What goes wrong:** After swapping JSX order, `CostStory` renders above `RecipeTab`. If `loading === true` but `result === null`, CostStory shows its loading skeleton. But `RecipeTab` also shows its loading skeleton. The user sees two skeleton blocks stacked, which looks broken.
**Why it happens:** Both components have independent `if (loading) return <LoadingState />`.
**How to avoid:** Render `CostStory` only when `result !== null` (i.e., not during loading). The loading skeleton should come only from `RecipeTab`. The current conditional `(result || loading)` guard for CostStory should be changed to `result` only — let RecipeTab own the loading state for the full tab.

### Pitfall 4: "Phase" Appearing in AccordionItem `value` Props
**What goes wrong:** AccordionItem `value="phase-0"` etc. are prop identifiers, not user-visible text. Developer spends time changing them.
**Why it happens:** Grep for "phase" returns these.
**How to avoid:** The jargon rule applies to rendered text only. Internal React keys and prop values are irrelevant.

### Pitfall 5: Operator Instruction Sentence Has Zero-Volume Additives
**What goes wrong:** When a blend needs no diesel (r_diesel ≈ 0), the sentence says "Mix ... then add 0.0 L of fuel supplement." This is confusing.
**Why it happens:** Additive rates can be exactly 0.
**How to avoid:** Apply the `> 0.01` threshold check (shown in the code example above) before including additives in the sentence.

---

## Code Examples

### Progress Ticker Component (Verified Pattern)

```typescript
// Source: derived from number-ticker.tsx (framer-motion + useEffect pattern)
// and CLAUDE.md performance benchmarks
"use client";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const STAGES = [
  "Reading waste manifest…",
  "Computing baseline costs…",
  "Evaluating blend combinations…",
  "Pruning infeasible recipes…",
  "Ranking by total cost…",
  "Finalising optimal plan…",
];

const BUDGET_MS: Record<number, number> = { 1: 500, 2: 500, 3: 1000, 4: 6000, 5: 65000 };

interface OptimizationProgressProps {
  streamCount: number;
  isVisible: boolean;
}

export function OptimizationProgress({ streamCount, isVisible }: OptimizationProgressProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!isVisible) { setStage(0); return; }
    const budget = BUDGET_MS[streamCount] ?? 5000;
    const interval = budget / STAGES.length;
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, interval);
    return () => clearInterval(id);
  }, [isVisible, streamCount]);

  if (!isVisible) return null;

  const pct = ((stage + 1) / STAGES.length) * 100;

  return (
    <div className="px-6 py-3" style={{ background: "#222222", borderBottom: "1px solid #3d3d3d" }}>
      <div className="max-w-7xl mx-auto space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2aabe1" }}>
            {STAGES[stage]}
          </span>
          <span className="text-xs font-data" style={{ color: "#737373" }}>
            Step {stage + 1} of {STAGES.length}
          </span>
        </div>
        <Progress value={pct} className="h-1 bg-[#3d3d3d] progress-cyan" />
      </div>
    </div>
  );
}
```

### Instruction Sentence Generation (Verified Pattern)

```typescript
// Source: derived from existing operation-tab.tsx calculation logic
function buildInstructionSentence(phase: PhaseResult): string {
  const entries = Object.entries(phase.streams);
  const totalRatio = entries.reduce((s, [, r]) => s + r, 0);
  const wastePart = entries
    .map(([sid, r]) => `${((phase.W * r) / totalRatio * phase.runtime_min).toFixed(1)} L of ${sid}`)
    .join(" with ");
  const adds: string[] = [];
  const w = phase.r_water * phase.W * phase.runtime_min;
  const d = phase.r_diesel * phase.W * phase.runtime_min;
  const n = phase.r_naoh * phase.W * phase.runtime_min;
  if (w > 0.01) adds.push(`${w.toFixed(1)} L of water`);
  if (d > 0.01) adds.push(`${d.toFixed(1)} L of fuel supplement`);
  if (n > 0.01) adds.push(`${n.toFixed(1)} L of neutralizer`);
  const addPart = adds.length ? `, then add ${adds.join(" and ")}` : "";
  return `Mix ${wastePart}${addPart}. Run for ${(phase.runtime_min / 60).toFixed(1)} hours.`;
}
```

---

## Standard Stack

### Core (already installed — no new packages)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | Component state for progress ticker | Already installed |
| framer-motion | ^12.36.0 | `useMotionValue` + `useSpring` for smooth progress | Already installed, used in number-ticker.tsx |
| shadcn `Progress` | via @base-ui/react ^1.3.0 | Progress bar component | Already installed, used in cost-story + phase-details |
| lucide-react | ^0.577.0 | Icons for instruction callout | Already installed |
| Next.js | 16.1.6 | App router, no changes | Already installed |

### No New Dependencies Required
All four requirements can be satisfied with what is already installed. This is a HIGH confidence finding based on direct inspection of `package.json` and the existing component patterns.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Fake spinner (Loader2 + "Optimizing…") | Multi-stage progress ticker with meaningful messages | Users know the algorithm is working, not frozen |
| Technical phase cards as primary content | Cost story first, then phase detail | Non-technical stakeholders see the value immediately |
| Raw `r_water/r_diesel/r_naoh` in UI text | Plain labels throughout | Plant operators can read and act without chemistry training |
| "Blend ratio: A:2 + B:1" | "Mix proportion: 2 parts Stream A, 1 part Stream B" | Operator-ready language |

---

## Open Questions

1. **"Phase Details" tab label**
   - What we know: Tab is labeled "Phase Details" with a Microscope icon; this tab is the expert section
   - What's unclear: Whether product owner wants "Phase" eliminated from the tab bar navigation too, or only from rendered content
   - Recommendation: Keep "Phase Details" in the tab bar (it is standard SaaS terminology for drill-down). Planner should add a verification step for product owner sign-off.

2. **Progress ticker accuracy for 5-stream runs**
   - What we know: 5-stream runs take ~60s per CLAUDE.md benchmarks, but this is hardware-dependent
   - What's unclear: Whether the progress bar will finish its stages before the actual result arrives on slower hardware
   - Recommendation: Stage timing uses 65s budget (5s buffer). If result arrives early, `isVisible` flips false and clears the ticker. If result is late, the ticker holds at stage 6 of 6 ("Finalising optimal plan…") — which is fine.

3. **Cost savings table row label "NaOH Cost"**
   - What we know: `cost-story.tsx` line 113 has `NaOH Cost` as a metric row
   - Recommendation: Rename to "Neutralizer Cost" per jargon table above.

---

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.x (see pyproject.toml) |
| Config file | `/pyproject.toml` — `[tool.pytest.ini_options]` |
| Quick run command | `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -x -q` |
| Full suite command | `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -v` |
| Frontend lint/type check | `cd dashboard && npm run build` (TypeScript check included) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 | Zero jargon strings in rendered UI | grep smoke | `grep -rn "r_water\|r_diesel\|r_naoh\|Gatekeeper\|B&B\|blend ratio\|blend_ratio" dashboard/src/components/ dashboard/src/app/\(app\)/` (excluding expert-overrides.tsx, types.ts, comments) | ❌ Wave 0 — add as verification grep in PLAN |
| UX-01 | TypeScript compiles cleanly after label changes | type check | `cd dashboard && npm run build` | ✅ exists |
| UX-02 | CostStory DOM element appears before RecipeTab phase cards | manual visual | Visual sign-off step in PLAN | manual-only |
| UX-03 | Instruction sentence generates correctly for 1-stream, 2-stream with additives, and 2-stream no additives | unit | `grep` for rendered string in Playwright or manual verification | manual-only (no Playwright installed) |
| PLSH-03 | Progress component renders during loading state | manual visual | Start 5-stream run and observe stage messages cycle | manual-only |
| PLSH-03 | Progress resets to stage 0 on second run | manual | Run twice, verify progress resets | manual-only |

**Note:** This phase is entirely front-end UI text and layout. The existing 23 Python pytest tests are unaffected and serve as a regression guard that the algorithm is unchanged. Run the full pytest suite once before committing to confirm no Python files were accidentally touched.

### Sampling Rate
- **Per task commit:** `cd dashboard && npm run build` (TypeScript type check, ~10s)
- **Per wave merge:** `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -v` + `cd dashboard && npm run build`
- **Phase gate:** Full suite green + manual visual sign-off of all 4 requirements before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No new test files required — no new logic, only UI string/order changes
- [ ] The verification grep command for UX-01 should be codified as a shell command in the PLAN's verification steps, not a separate test file

*(No test framework gaps — pytest + npm build already configured and working)*

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `dashboard/src/app/(app)/dashboard/page.tsx` — tab structure, render order, loading state
- Direct file inspection: `dashboard/src/components/dashboard/*.tsx` — all 10 component files, full jargon audit
- Direct file inspection: `dashboard/src/lib/types.ts` — TypeScript type field names confirmed as internal identifiers
- Direct file inspection: `dashboard/src/app/api/optimize/route.ts` — confirmed single-shot spawn, no streaming
- Direct file inspection: `dashboard/package.json` — confirmed framer-motion ^12.36.0, shadcn, no missing deps
- Direct file inspection: `dashboard/src/app/globals.css` — confirmed design tokens, brand colors
- Direct file inspection: `dashboard/src/components/magicui/number-ticker.tsx` — confirmed framer-motion pattern available

### Secondary (MEDIUM confidence)
- `CLAUDE.md` performance benchmarks (3-stream: 0.01s, 4-stream: 0.8s, 5-stream: ~60s) — used for progress ticker timing
- `.planning/config.json` — confirmed `nyquist_validation: true`

### Tertiary (LOW confidence)
- None required for this phase — all findings verifiable from the codebase directly

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed by direct package.json inspection; zero new dependencies
- Architecture: HIGH — all four patterns derived from existing component code, not assumptions
- Jargon audit: HIGH — every occurrence found by grep and verified by file inspection
- Pitfalls: HIGH — derived from the actual code structure and React lifecycle behavior

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable codebase; no fast-moving external dependencies involved)
