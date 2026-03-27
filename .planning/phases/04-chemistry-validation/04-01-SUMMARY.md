---
phase: 04-chemistry-validation
plan: 01
subsystem: ui
tags: [react, nextjs, shadcn, tailwind, lucide-react, accordion, badge]

# Dependency graph
requires:
  - phase: 02-architecture-scaffold
    provides: Design tokens (ax-cyan, ax-orange, font-data), shadcn/ui accordion with @base-ui/react multiple prop

provides:
  - AssumptionsPanel component: K-values with amber confidence badges + 9 MVP assumptions accordion (CHEM-01, CHEM-04)
  - SensitivityNote component: amber inline directional-estimate callout (CHEM-03)

affects:
  - 04-02 (Wave 2 wiring — imports AssumptionsPanel and SensitivityNote into dashboard layout)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Static content components with zero props pattern for always-visible informational UI
    - Data array + .map() pattern for K-values and assumption lists (consistent with expert-overrides.tsx)
    - Accordion multiple (boolean prop from @base-ui/react) for multi-open accordion sections

key-files:
  created:
    - dashboard/src/components/dashboard/sensitivity-note.tsx
    - dashboard/src/components/dashboard/assumptions-panel.tsx
  modified: []

key-decisions:
  - "AssumptionsPanel takes zero props and renders unconditionally — static informational content always shown"
  - "Badge text is 'Theoretical estimate — not yet calibrated' (new wording, not the old 'Pending Fit' from expert-overrides.tsx)"
  - "K_ASSUMPTIONS array uses plainLabel and plainDesc fields (human-readable) vs expert-overrides K_VALUES which uses jargon labels"
  - "npm at ~/.local/bin/npm is broken; used ~/.nvm/versions/node/v24.11.1/bin/npm for build verification"

patterns-established:
  - "Plain-English data arrays: use plainLabel / plainDesc / plainEnglish field names (not technical label/desc) for non-expert-facing UI"
  - "Zero-prop static components: components rendering only configuration/assumption data take no props"

requirements-completed: [CHEM-01, CHEM-03, CHEM-04]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 4 Plan 01: Chemistry Validation UI Primitives Summary

**Two static dashboard components: AssumptionsPanel (K-values with amber calibration badges + 9 MVP assumptions accordion) and SensitivityNote (amber inline callout) — both compile clean.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-27T11:35:23Z
- **Completed:** 2026-03-27T11:37:06Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `sensitivity-note.tsx` — amber `text-amber-600/80` inline callout with Info icon and exact copy text for CHEM-03
- Created `assumptions-panel.tsx` — Card with K-values section (3 entries, amber "Theoretical estimate — not yet calibrated" badges, plain-English labels/descriptions) and MVP Assumptions accordion (9 items A1–A9) for CHEM-01 and CHEM-04
- `npm run build` exits 0 — TypeScript compilation clean with both new components

## Task Commits

Each task was committed atomically:

1. **Task 1: Create sensitivity-note.tsx** - `105fe85` (feat)
2. **Task 2: Create assumptions-panel.tsx** - `62884a0` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `dashboard/src/components/dashboard/sensitivity-note.tsx` — Amber inline callout component; exports `SensitivityNote` with optional `className` prop; covers CHEM-03
- `dashboard/src/components/dashboard/assumptions-panel.tsx` — Static Card with K-values and MVP assumptions; exports `AssumptionsPanel` with zero props; covers CHEM-01 and CHEM-04

## Decisions Made

- AssumptionsPanel takes zero props and renders unconditionally — all content is static configuration data that should always be visible
- Badge text is "Theoretical estimate — not yet calibrated" (new, plain-English wording) rather than copying "Pending Fit" from `expert-overrides.tsx` (which is the technical/plant-manager view)
- K_ASSUMPTIONS data structure uses `plainLabel` and `plainDesc` fields to distinguish from the jargon-heavy `K_VALUES` in expert-overrides.tsx
- System npm binary at `~/.local/bin/npm` is broken (missing `../lib/cli.js`); used `~/.nvm/versions/node/v24.11.1/bin/npm` for build verification

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The system `npm` binary at `~/.local/bin/npm` was broken (Node.js v24 upgrade orphaned the symlink). Build verification used `~/.nvm/versions/node/v24.11.1/bin/npm run build` directly — same result, exits 0. Not a code issue.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `AssumptionsPanel` and `SensitivityNote` are ready to be imported into the dashboard layout by Wave 2 (plan 04-02)
- Both exports are named exports (no default exports) consistent with the project pattern
- No blockers

---
*Phase: 04-chemistry-validation*
*Completed: 2026-03-27*
