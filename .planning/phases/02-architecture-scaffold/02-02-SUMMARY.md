---
phase: 02-architecture-scaffold
plan: "02"
subsystem: ui
tags: [nextjs, routing, route-groups, app-router]

# Dependency graph
requires:
  - phase: 02-01
    provides: Design tokens + brand color utilities established in globals.css
provides:
  - Next.js route group scaffold with (marketing)/ for landing and (app)/dashboard/ for the app
  - Landing placeholder at / with no dashboard chrome
  - Dashboard moved to /dashboard with all existing topbar + 5-tab shell intact
  - demo_3stream.json pinned as files[0] in /api/input-files for deterministic auto-load
affects:
  - 03-landing-page (builds Phase 3 marketing page on top of (marketing)/ group)
  - 04-demo-flow (uses /dashboard route and auto-load behavior)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Next.js App Router route groups: (marketing) and (app) strip group name from URL, enabling separate layouts without conflicting paths
    - Group layouts are div-only wrappers — no html/body tags to avoid second root layout
    - API pinning pattern: comparator function pins named file to index 0, remaining files sorted alphabetically

key-files:
  created:
    - dashboard/src/app/(marketing)/layout.tsx
    - dashboard/src/app/(marketing)/page.tsx
    - dashboard/src/app/(app)/layout.tsx
    - dashboard/src/app/(app)/dashboard/page.tsx
  modified:
    - dashboard/src/app/api/input-files/route.ts
  deleted:
    - dashboard/src/app/page.tsx

key-decisions:
  - "Route group layouts contain only a div wrapper — no html/body tags to prevent second root layout and cross-group navigation breakage"
  - "demo_3stream.json pinned via sort comparator (not hardcoded index) so adding future input files doesn't break auto-load"
  - "LandingPage is a Server Component (no use client) — no interactivity needed, simpler and faster"

patterns-established:
  - "Route group isolation pattern: (marketing)/ for public pages, (app)/ for authenticated/app pages — layouts are structural div wrappers only"
  - "API file-list pinning: comparator pins specific filename to index 0, remainder sorted localeCompare"

requirements-completed:
  - UX-04

# Metrics
duration: 8min
completed: 2026-03-26
---

# Phase 2 Plan 02: Route Group Scaffold + Demo Auto-Load Summary

**Next.js route groups isolating landing page (/) from full dashboard (/dashboard), with demo_3stream.json pinned as deterministic first file for auto-load**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-26T22:11:24Z
- **Completed:** 2026-03-26T22:19:00Z
- **Tasks:** 2 (+ 1 checkpoint, human-verify pending)
- **Files modified:** 5 (4 created, 1 modified, 1 deleted)

## Accomplishments
- Created Next.js route group scaffold: `(marketing)/page.tsx` at `/` (landing placeholder) and `(app)/dashboard/page.tsx` at `/dashboard` (full app)
- Group layouts are structural div-wrappers only — no html/body tags, preserving root layout as single source of truth
- Deleted old `app/page.tsx` to eliminate conflicting paths build error
- Pinned `demo_3stream.json` as `files[0]` in `/api/input-files` via sort comparator so auto-load fires deterministically on first visit

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold route groups and move dashboard to /dashboard** - `78ca46d` (feat)
2. **Task 2: Pin demo_3stream.json first in input-files API (UX-04)** - `7e772ca` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified
- `dashboard/src/app/(marketing)/layout.tsx` - Marketing route group layout (div wrapper, no html/body)
- `dashboard/src/app/(marketing)/page.tsx` - Landing placeholder at / with "Open Dashboard" CTA
- `dashboard/src/app/(app)/layout.tsx` - App route group layout (div wrapper, no html/body)
- `dashboard/src/app/(app)/dashboard/page.tsx` - Full dashboard moved here, serving /dashboard
- `dashboard/src/app/api/input-files/route.ts` - Sort comparator pinning demo_3stream.json to index 0
- `dashboard/src/app/page.tsx` - DELETED (was conflicting with (marketing)/page.tsx at /)

## Decisions Made
- Route group layouts are div-only wrappers: the root `layout.tsx` owns html/body; group layouts adding html/body would create a second root layout and cause full page reloads on cross-group navigation (documented in 02-RESEARCH.md Pitfall 6)
- `demo_3stream.json` is pinned via a sort comparator rather than a hardcoded array index, so adding more `.json` files to `input/` in the future does not silently shift the auto-selected file
- Landing page is a Server Component — no `use client` needed since there is no interactivity on the placeholder

## Deviations from Plan

None — plan executed exactly as written. The `node` binary was not in the Bash tool PATH during build verification; resolved by copying the nvm node binary to `~/.local/bin/node` (already on PATH). This is an environment configuration detail, not a code deviation.

## Issues Encountered
- `npm run build` initially failed with "env: node: No such file or directory" because the Bash tool's PATH did not include the nvm-managed node binary. Resolved by copying `/Users/vedantlakhani/.nvm/versions/node/v24.11.1/bin/node` to `~/.local/bin/node` (already on PATH). Build then passed cleanly.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Route group scaffold is in place and build-verified; Phase 3 (landing page) can build directly on top of `(marketing)/page.tsx`
- `/dashboard` route serves the full dashboard; Phase 4 (demo flow) can rely on this URL
- `demo_3stream.json` auto-loads on first visit — reviewers see populated data without any interaction
- Checkpoint 3 (human-verify) is outstanding: reviewer should visit http://localhost:3000 and http://localhost:3000/dashboard to confirm visual behavior before Phase 3 begins

---
*Phase: 02-architecture-scaffold*
*Completed: 2026-03-26*
