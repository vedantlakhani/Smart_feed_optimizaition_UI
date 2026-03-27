---
phase: 04-chemistry-validation
plan: 02
subsystem: ui
tags: [react, nextjs, shadcn, accordion, progressive-disclosure, chemistry]

# Dependency graph
requires:
  - phase: 04-chemistry-validation plan 01
    provides: SensitivityNote and AssumptionsPanel components built in Plan 01
provides:
  - SensitivityNote wired in 3 locations across cost-story.tsx and impact-header.tsx
  - Three-tier progressive disclosure (plain + formula + derivation) in PhaseDetail for r_naoh and pH, two-tier for r_water and r_diesel
  - AssumptionsPanel rendered unconditionally in Phase Details tab (no result guard)
affects: [phase-details-tab, cost-story, impact-header, dashboard page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "bottomNote?: React.ReactNode prop on KpiCard for conditional sub-card content"
    - "Nested Accordion multiple for three-tier progressive disclosure"
    - "Unconditional render pattern for static informational panels (outside result guard)"

key-files:
  created: []
  modified:
    - dashboard/src/components/dashboard/cost-story.tsx
    - dashboard/src/components/dashboard/impact-header.tsx
    - dashboard/src/components/dashboard/phase-details-tab.tsx
    - dashboard/src/app/(app)/dashboard/page.tsx

key-decisions:
  - "bottomNote prop pattern on KpiCard — optional React.ReactNode injected below value, avoids layout restructuring"
  - "AssumptionsPanel placed outside {result &&} guard per RESEARCH.md spec — renders before any optimization run"
  - "Gatekeeper Rates section renamed to Additive Rates — plain English column heading avoids jargon"

patterns-established:
  - "Progressive disclosure pattern: plain-text summary always visible; accordion reveals formula; nested accordion reveals derivation"
  - "Accordion multiple prop (boolean) — confirmed consistent with existing usage in phase-details-tab.tsx"

requirements-completed: [CHEM-01, CHEM-02, CHEM-03, CHEM-04]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 4 Plan 02: Chemistry Validation Wire-Up Summary

**SensitivityNote placed in 3 locations and three-tier progressive chemistry disclosure added to PhaseDetail accordion, completing all four CHEM requirements**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-27T11:41:35Z
- **Completed:** 2026-03-27T11:41:54Z
- **Tasks:** 2 auto-tasks completed (checkpoint:human-verify pending)
- **Files modified:** 4

## Accomplishments
- SensitivityNote amber callout added below cost comparison table and below Total Cost Reduction progress bar in cost-story.tsx
- SensitivityNote added below Cost Reduction KPI value in impact-header.tsx via new `bottomNote` prop on KpiCard (not on Diesel Offset or Runtime cards)
- Flat Gatekeeper Rates table replaced with progressive disclosure — r_water and r_diesel two-tier (plain + Show formula), r_naoh and pH blending three-tier (plain + Show formula + Show derivation nested inside)
- AssumptionsPanel imported and rendered unconditionally in Phase Details tab (outside the `{result && ...}` guard block)

## Task Commits

Each task was committed atomically:

1. **Task 1: SensitivityNote to cost-story and impact-header (CHEM-03)** - `2af54bd` (feat)
2. **Task 2: Progressive disclosure in PhaseDetail + AssumptionsPanel wire-up (CHEM-01/02/04)** - `5b56765` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `dashboard/src/components/dashboard/cost-story.tsx` - Added SensitivityNote import + two usage sites (below cost table, below Total Cost Reduction bar)
- `dashboard/src/components/dashboard/impact-header.tsx` - Added SensitivityNote import + bottomNote prop on KpiCard; passed only to Cost Reduction card
- `dashboard/src/components/dashboard/phase-details-tab.tsx` - Replaced Gatekeeper Rates table with progressive accordion structure (4x Show formula, 2x Show derivation)
- `dashboard/src/app/(app)/dashboard/page.tsx` - Imported AssumptionsPanel; rendered unconditionally after ExpertOverrides in details tab

## Decisions Made
- `bottomNote?: React.ReactNode` prop added to KpiCard — cleanest injection point without layout changes; does not affect Diesel Offset or Runtime cards
- Renamed column heading from "Gatekeeper Rates (L/L)" to "Additive Rates" — removes jargon per no-jargon requirement in plain visible state
- AssumptionsPanel outside result guard — renders before any run, per RESEARCH.md explicit spec

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None — build passed on first attempt after each task.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All four CHEM requirements (CHEM-01 through CHEM-04) are fully wired and visible in the dashboard
- Pending: human visual verification in browser (checkpoint:human-verify)
- Phase 04 chemistry-validation complete after checkpoint approval

## Self-Check

### Files exist:
- `dashboard/src/components/dashboard/cost-story.tsx` — modified (SensitivityNote import + 2 usages)
- `dashboard/src/components/dashboard/impact-header.tsx` — modified (SensitivityNote import + bottomNote prop)
- `dashboard/src/components/dashboard/phase-details-tab.tsx` — modified (progressive disclosure)
- `dashboard/src/app/(app)/dashboard/page.tsx` — modified (AssumptionsPanel unconditional render)

### Commits exist:
- `2af54bd` — Task 1
- `5b56765` — Task 2

## Self-Check: PASSED

---
*Phase: 04-chemistry-validation*
*Completed: 2026-03-27*
