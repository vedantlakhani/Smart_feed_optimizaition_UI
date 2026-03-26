---
phase: 01-critical-bug-fixes
plan: 02
subsystem: ui
tags: [nextjs, react, typescript, safety-checks, dashboard]

# Dependency graph
requires:
  - phase: 01-critical-bug-fixes/01-01
    provides: BUG-01 inf serialization fix and BUG-02 pH_min enforcement — correctness baseline this UI work builds on top of
provides:
  - Safety check values in Phase Details and Expert Overrides now use live cfg values (BTU_diesel, eta, solid_max_pct, salt_max_ppm, W_min) instead of hardcoded constants
  - recipe-tab.tsx shows a distinct amber "No Feasible Blend Found" panel with baseline cost when result.optimized is null
affects: [Phase 5 Dashboard UX Redesign, Phase 4 Chemistry Validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "cfg prop threading: SystemConfig from result.config threaded as explicit prop through PhaseDetailRow rather than imported globally — keeps component testable and decoupled from store shape"
    - "Two-branch null guard: !result → EmptyState (not run), result && !result.optimized → NoFeasibleState (ran, infeasible) — pattern for all future tabs that depend on optimized schedule"

key-files:
  created: []
  modified:
    - dashboard/src/components/dashboard/phase-details-tab.tsx
    - dashboard/src/components/dashboard/expert-overrides.tsx
    - dashboard/src/components/dashboard/recipe-tab.tsx

key-decisions:
  - "BTU_eff_min threshold (1800 BTU/lb) left hardcoded — SystemConfig has no BTU_eff_min field; this is documented tech debt in RESEARCH.md and deferred to a future calibration phase"
  - "operation-tab and phase-details-tab null guards left as !result?.optimized → EmptyState (not split) — operator instructions and phase data cannot exist without an optimized schedule, so the single guard is semantically correct"
  - "Two pre-existing UI rendering issues (empty phase cards, duplicate Runtime label) deferred to Phase 5 — out of scope for correctness bug fixes"

patterns-established:
  - "cfg prop threading: pass SystemConfig as explicit prop, not via ambient context, so safety check components remain pure and independently testable"
  - "Two-branch null guard in result-dependent tabs: always check !result before !result.optimized to distinguish 'not run' from 'infeasible'"

requirements-completed: [BUG-03, BUG-04]

# Metrics
duration: ~20min
completed: 2026-03-26
---

# Phase 1 Plan 02: Dashboard Bug Fixes (BUG-03 + BUG-04) Summary

**Safety check BTU/solid/salt/W_min limits now sourced from live SystemConfig, and recipe-tab shows a distinct amber "No Feasible Blend Found" panel with baseline cost when optimizer returns no feasible blend**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-26T21:10:00Z
- **Completed:** 2026-03-26T21:30:00Z
- **Tasks:** 2 auto + 1 human-verify checkpoint
- **Files modified:** 3

## Accomplishments

- BUG-03: Eliminated all hardcoded `18300 * 0.89` occurrences in `phase-details-tab.tsx` and `expert-overrides.tsx`; BTU_eff now computed as `cfg.BTU_diesel * cfg.eta` so changing Technical Calibration values reflects immediately in safety checks
- BUG-03: Expert Overrides PhaseDetailRow now accepts `cfg: SystemConfig` prop and uses `cfg.solid_max_pct`, `cfg.salt_max_ppm`, and `cfg.W_min` for safety check limits and pass/fail logic — no more hardcoded 15/5000/0.5
- BUG-04: `recipe-tab.tsx` null guard split into two branches — `!result` shows "No Feed Recipe Yet" (not run), `!result.optimized` shows amber AlertTriangle panel with "No Feasible Blend Found" heading and baseline cost (null-safe display using `total_cost != null ? ... : "N/A"`)
- Dashboard TypeScript build passes with zero errors after all changes
- Human verification confirmed all 4 bugs fixed: BTU values dynamic (7486 and 4880 BTU/lb from blend, not hardcoded 18300×0.89), pH_min enforced, inf serialization clean, infeasible state distinct

## Task Commits

Each task was committed atomically:

1. **Task 1: BUG-03 replace hardcoded constants with cfg values** - `056ece8` (fix)
2. **Task 2: BUG-04 distinct No Feasible Blend Found state** - `c5ee74e` (fix)
3. **Task 3: Visual verification checkpoint** - approved by user (no commit)

## Files Created/Modified

- `dashboard/src/components/dashboard/phase-details-tab.tsx` - Line 85: `btuEff` now uses `cfg.BTU_diesel * cfg.eta` instead of hardcoded `18300 * 0.89`
- `dashboard/src/components/dashboard/expert-overrides.tsx` - Added `SystemConfig` import; `PhaseDetailRow` accepts `cfg` prop; safety check limits use `cfg.solid_max_pct`, `cfg.salt_max_ppm`, `cfg.W_min`; call site passes `cfg={result.config}`
- `dashboard/src/components/dashboard/recipe-tab.tsx` - Added `AlertTriangle` import; split single `!result?.optimized` guard into two-branch `!result` / `!result.optimized` with distinct amber panel for infeasible state

## Decisions Made

- BTU_eff_min threshold (1800 BTU/lb) intentionally left hardcoded — there is no `BTU_eff_min` field in `SystemConfig`; adding one is a calibration-phase concern, not a bug fix
- `operation-tab.tsx` and `phase-details-tab.tsx` null guards left unchanged — a single `!result?.optimized → EmptyState` is semantically correct because operator instructions and phase detail data have no meaningful content without an optimized schedule
- Two pre-existing UI rendering issues (empty phase cards, duplicate Runtime label) deferred to Phase 5 — they are pre-existing and out of scope for a correctness bug fix plan

## Deviations from Plan

None — plan executed exactly as written. All six named changes in each task matched the plan's action blocks precisely.

## Issues Encountered

None — TypeScript build passed on first attempt after each task. No type errors, no missing imports discovered beyond what the plan already specified.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All four Phase 1 bugs (BUG-01 through BUG-04) are now fixed and human-verified
- Phase 1 success criteria fully met: inf serialization clean, pH_min enforced, safety check values dynamic, infeasible result shows distinct state
- Phase 2 (Architecture Scaffold) can begin: route group split, CSS design tokens, auto-loaded example data
- Deferred items for Phase 5: empty phase cards rendering issue, duplicate Runtime label in impact header

---
*Phase: 01-critical-bug-fixes*
*Completed: 2026-03-26*
