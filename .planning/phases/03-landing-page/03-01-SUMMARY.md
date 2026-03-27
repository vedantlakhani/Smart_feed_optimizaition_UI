---
phase: 03-landing-page
plan: "01"
subsystem: dashboard/marketing
tags: [landing-page, marketing, framer-motion, magicui, nextjs]
dependency_graph:
  requires: [02-02]
  provides: [LAND-01, LAND-02, LAND-03, LAND-04]
  affects: [dashboard/src/app/(marketing)/page.tsx, dashboard/src/components/magicui/animated-gradient-text.tsx]
tech_stack:
  added: []
  patterns: [data-driven-card-grid, framer-motion-fadein-stagger, shimmerbutton-cta]
key_files:
  created:
    - dashboard/src/app/(marketing)/page.tsx
  modified:
    - dashboard/src/components/magicui/animated-gradient-text.tsx
    - dashboard/src/app/api/optimize/route.ts
decisions:
  - "Used data-driven STEPS array pattern (same as intro-tab.tsx) for 3-step explainer — keeps JSX lean and steps readable"
  - "CO2 figure set to 40 kg from documented 15L diesel * 2.68 kg CO2/L = ~40 kg calculation"
  - "auto-fix: replaced inline require('fs') with ES module import in route.ts to resolve pre-existing lint error blocking success criteria"
metrics:
  duration: "3 minutes"
  completed_date: "2026-03-27"
  tasks_completed: 2
  files_modified: 3
---

# Phase 03 Plan 01: Landing Page — Full Marketing Page Summary

Jargon-free marketing landing page (223 lines) replacing a 22-line placeholder. AnimatedGradientText patched to Ax brand colors. Build and lint both pass.

## What Was Built

### Task 1: AnimatedGradientText gradient patch

Updated `dashboard/src/components/magicui/animated-gradient-text.tsx` line 24. Changed gradient from upstream amber-blue defaults (`from-[#F59E0B] via-[#5E81AC] to-[#F59E0B]`) to Ax brand colors (`from-[#FF8C00] via-[#06B6D4] to-[#FF8C00]`). One-line edit as specified.

Commit: `cd4c739`

### Task 2: Full landing page

Replaced 22-line Server Component placeholder with a 223-line `"use client"` page using framer-motion animations. Four sections:

1. **Hero (LAND-01):** AnimatedGradientText eyebrow badge, H1 problem statement, sub-copy solution statement, ShimmerButton CTA linking to `/dashboard`
2. **How It Works / 3-step explainer (LAND-02):** Data-driven `STEPS` array with exactly 3 entries rendered as border-left cards on a `bg-slate-50` full-width section. Plain-language copy only — no technical jargon.
3. **Climate Impact (LAND-03):** Centered card with `BorderBeam` accent, `NumberTicker` animating to 40 kg CO₂ with `suffix=" kg CO₂"`, disclaimer that figure is an estimate.
4. **Final CTA (LAND-04):** Dark `bg-slate-900` section, second ShimmerButton linking to `/dashboard`.

Commit: `3b29666`

## Key Decisions Made

- **Data-driven STEPS array:** Used the same `{STEPS.map(...)}` pattern as `intro-tab.tsx` instead of inline JSX. This means `grep 'STEP 0[123]'` returns 0 matches on static analysis (the step numbers are in the array data), but the rendered output produces `STEP 01`, `STEP 02`, `STEP 03` correctly at runtime. Functionally equivalent to inlined strings.
- **CO₂ value = 40:** From documented calculation: 15 L diesel × 2.68 kg CO₂/L ≈ 40 kg CO₂ (representative 3-stream scenario).
- **`"use client"` required:** framer-motion's `whileInView` and `useInView` hooks require a client component — page converted from Server Component to Client Component.

## Actual Line Count

`dashboard/src/app/(marketing)/page.tsx`: **223 lines** (plan minimum: 150)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing require() lint error in route.ts**
- **Found during:** Task 2 verification (npm run lint)
- **Issue:** `api/optimize/route.ts` used `const fs = require("fs")` inside a function body, which the ESLint rule `@typescript-eslint/no-require-imports` flags as an error. This caused `npm run lint` to exit with code 1, blocking the plan's success criteria.
- **Fix:** Added `import { existsSync } from "fs"` at the top of route.ts and replaced `fs.existsSync(p)` with `existsSync(p)`. No behavioral change.
- **Files modified:** `dashboard/src/app/api/optimize/route.ts`
- **Commit:** `3b29666` (included with Task 2 commit)

**2. Static grep check for `STEP 0[123]` vs dynamic rendering**
- **Found during:** Task 2 acceptance criteria check
- **Situation:** The plan's acceptance criteria includes `grep -c 'STEP 0[123]' ... returns 3`. The implementation uses a data-driven `STEPS.map()` pattern, so literal strings `STEP 01`, `STEP 02`, `STEP 03` do not appear in the source — only the template `STEP {s.step}` does. The rendered HTML at runtime produces the correct strings.
- **Decision:** Kept the data-driven pattern (matching the existing intro-tab.tsx convention) since it produces the correct rendered output. The grep criterion tests static content, but the behavioral requirement (3 steps displayed) is fully met.

## Self-Check: PASSED

Files exist:
- FOUND: dashboard/src/app/(marketing)/page.tsx
- FOUND: dashboard/src/components/magicui/animated-gradient-text.tsx

Commits exist:
- cd4c739: Task 1 — AnimatedGradientText patch
- 3b29666: Task 2 — Landing page + route.ts lint fix

Build: passes (exit 0)
Lint: passes (exit 0, 0 errors, 6 warnings in pre-existing files)
Jargon check: no matches
