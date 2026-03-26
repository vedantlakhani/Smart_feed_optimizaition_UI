---
phase: 02-architecture-scaffold
plan: 01
subsystem: ui
tags: [tailwind, design-tokens, css-variables, next.js, shadcn]

requires:
  - phase: 01-critical-bug-fixes
    provides: stable Python algorithm + dashboard base components

provides:
  - "globals.css @theme inline block with 6 elevation/easing design tokens (shadow-card, shadow-card-hover, shadow-topbar, ease-smooth, ease-spring, ease-out-expo)"
  - "All dashboard components using Tailwind ax-cyan / ax-orange utilities instead of hardcoded hex"
  - "Single-source-of-truth brand color system via @theme inline"

affects: [03-ui-polish, 04-storytelling, all subsequent dashboard phases]

tech-stack:
  added: []
  patterns:
    - "Design token pattern: CSS custom properties in @theme inline block register as Tailwind utilities"
    - "Brand color single-source-of-truth: change --color-ax-cyan once, all components update"
    - "Elevation vocabulary: shadow-card / shadow-card-hover for Apple-like card depth"
    - "Easing vocabulary: ease-smooth / ease-spring / ease-out-expo for animation consistency"

key-files:
  created: []
  modified:
    - "dashboard/src/app/globals.css"
    - "dashboard/src/components/dashboard/topbar.tsx"
    - "dashboard/src/components/dashboard/impact-header.tsx"
    - "dashboard/src/components/dashboard/intro-tab.tsx"
    - "dashboard/src/components/dashboard/manifest-tab.tsx"
    - "dashboard/src/components/dashboard/operation-tab.tsx"
    - "dashboard/src/components/dashboard/cost-story.tsx"
    - "dashboard/src/components/dashboard/recipe-tab.tsx"
    - "dashboard/src/components/dashboard/phase-details-tab.tsx"
    - "dashboard/src/components/dashboard/expert-overrides.tsx"

key-decisions:
  - "phase-details-tab.tsx and expert-overrides.tsx were not in plan's file list but also contained hardcoded hex classNames — auto-fixed to make verification grep pass (Rule 2: missing critical scope)"
  - "STREAM_COLORS literal hex arrays in recipe-tab and operation-tab left unchanged — these are Recharts fill= props requiring CSS color strings, not className attributes"
  - "magicui BorderBeam colorFrom/colorTo and ShimmerButton shimmerColor props left unchanged — animation API requires literal hex"
  - "Light-variant hex (#fff7ed, #ecfeff) in bg= props left unchanged — not in the replacement map; only #06b6d4 and #ff8c00 were in scope"

patterns-established:
  - "Use text-ax-cyan / text-ax-orange / bg-ax-cyan / bg-ax-orange / border-ax-cyan / border-ax-orange in all new components — never hardcode hex in className"
  - "Use shadow-card / shadow-card-hover for card elevation — never use arbitrary shadow values"
  - "Use ease-smooth / ease-spring / ease-out-expo in transition/animation — never duplicate cubic-bezier strings"

requirements-completed: [PLSH-01, PLSH-02]

duration: 6min
completed: 2026-03-26
---

# Phase 02 Plan 01: Architecture Scaffold - Design Tokens & Brand Color Utilities Summary

**Apple-like elevation/easing tokens added to globals.css @theme inline block, and all hardcoded #06b6d4/#ff8c00 hex values in className attributes replaced with text-ax-cyan/text-ax-orange Tailwind utilities across 9 dashboard components — build passes clean.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-26T22:02:05Z
- **Completed:** 2026-03-26T22:08:04Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Added 6 design tokens to globals.css @theme inline block: `--shadow-card`, `--shadow-card-hover`, `--shadow-topbar` (elevation) + `--ease-smooth`, `--ease-spring`, `--ease-out-expo` (easing) + 2 whitespace scale tokens, all generating Tailwind utilities
- Replaced every `text-[#06b6d4]`, `text-[#ff8c00]`, `bg-[#ff8c00]`, `border-[#ff8c00]`, `border-[#06b6d4]` className occurrence across all 9 affected component files with `text-ax-cyan` / `text-ax-orange` / `bg-ax-cyan` / `bg-ax-orange` / `border-ax-cyan` / `border-ax-orange`
- `npm run build` passes: TypeScript clean, no errors, Compiled successfully in 2.1s

## Task Commits

1. **Task 1: Add elevation and easing design tokens to globals.css** - `23c0282` (feat)
2. **Task 2: Replace hardcoded hex with Tailwind utilities in 9 component files** - `3ed3bad` (feat)

## Files Created/Modified

- `dashboard/src/app/globals.css` - Added 6 elevation/easing/spacing design tokens inside existing @theme inline block
- `dashboard/src/components/dashboard/topbar.tsx` - 2 hex → ax-cyan
- `dashboard/src/components/dashboard/impact-header.tsx` - 2 hex → ax-cyan, 2 hex → ax-orange
- `dashboard/src/components/dashboard/intro-tab.tsx` - 4 hex → ax-cyan/orange in icon classNames + data object color strings
- `dashboard/src/components/dashboard/manifest-tab.tsx` - STREAM_COLORS className object: 2 border + 2 text → ax-cyan/orange
- `dashboard/src/components/dashboard/operation-tab.tsx` - PHASE_COLORS + 4 inline classNames → ax-cyan/orange
- `dashboard/src/components/dashboard/cost-story.tsx` - 4 hex → ax-cyan, 1 hex → ax-orange
- `dashboard/src/components/dashboard/recipe-tab.tsx` - STREAM_BORDER array + 3 inline classNames → ax-cyan/orange
- `dashboard/src/components/dashboard/phase-details-tab.tsx` - PHASE_COLORS + 7 inline classNames → ax-cyan/orange (auto-fix)
- `dashboard/src/components/dashboard/expert-overrides.tsx` - 6 inline classNames → ax-cyan/orange (auto-fix)

## Decisions Made

- **STREAM_COLORS literal arrays preserved**: `recipe-tab.tsx` and `operation-tab.tsx` each define `const STREAM_COLORS = ["#ff8c00", "#06b6d4", ...]` used as Recharts `fill=` prop values and inline `style={{ backgroundColor: sc }}` — these are JavaScript CSS color strings, not Tailwind classNames, and must remain as literal hex.
- **magicui animation props preserved**: `BorderBeam colorFrom/colorTo` and `ShimmerButton shimmerColor` accept CSS color strings directly, not Tailwind classes.
- **#fff7ed / #ecfeff light-variant hex left in bg= positions**: These are the `-light` palette variants, not in the replacement map. Only #06b6d4 and #ff8c00 were targeted.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Extended hex replacement to phase-details-tab.tsx and expert-overrides.tsx**
- **Found during:** Task 2 (post-replacement verification grep)
- **Issue:** The plan listed 7 component files but the verification grep covers all files in `dashboard/src/components/dashboard/`. Both `phase-details-tab.tsx` and `expert-overrides.tsx` contained hardcoded hex classNames that would cause the zero-count verification to fail.
- **Fix:** Applied the same cyan/orange replacement map to all remaining hex classNames in both files. Recharts/magicui props untouched.
- **Files modified:** `phase-details-tab.tsx`, `expert-overrides.tsx`
- **Verification:** Grep returned 0 after fix; build still passes.
- **Committed in:** `3ed3bad` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — incomplete scope)
**Impact on plan:** Required to satisfy the plan's own success criterion (zero hardcoded hex in component classNames). No scope creep — same transformation, just 2 more files.

## Issues Encountered

- `npm` not on default shell PATH — resolved by using full path `~/.nvm/versions/node/v24.11.1/bin/npm` with explicit PATH including `/usr/bin:/bin`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Design token vocabulary established: all subsequent phases can reference `shadow-card`, `ease-smooth`, `ease-spring`, `ease-out-expo` in className strings
- Brand color system is single-source-of-truth: changing `--color-ax-cyan` in globals.css propagates to all 9 components automatically
- Build is green — safe to continue UI polish phases

## Self-Check: PASSED

- FOUND: `dashboard/src/app/globals.css`
- FOUND: `dashboard/src/components/dashboard/topbar.tsx`
- FOUND: `.planning/phases/02-architecture-scaffold/02-01-SUMMARY.md`
- FOUND commit: `23c0282`
- FOUND commit: `3ed3bad`
