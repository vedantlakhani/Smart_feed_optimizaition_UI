# Roadmap: AxNano SmartFeed Demo Package

## Overview

Transform the existing SmartFeed optimizer from a working-but-jargon-heavy prototype into a self-explanatory demo product. The journey starts by fixing correctness bugs that would undermine any demo, then scaffolds the architecture (route groups, design tokens, shared modules) that all UI work depends on. Next, the landing page provides the entry point that frames the problem for non-technical visitors. The chemistry validation layer builds trust with technical reviewers by making assumptions transparent. The dashboard UX redesign replaces jargon with plain language and reorders the layout around the cost savings story. Finally, demo preparation ensures a fast, curated example is ready for live presentations.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Critical Bug Fixes** - Fix correctness bugs and crash paths so the algorithm produces safe, serializable results
- [ ] **Phase 2: Architecture Scaffold** - Route group split, CSS design tokens, brand utilities, shared modules, and auto-loaded example data
- [ ] **Phase 3: Landing Page** - Problem-first marketing page that educates visitors and drives them into the dashboard demo
- [ ] **Phase 4: Chemistry Validation** - Assumptions panel with progressive disclosure, confidence badges, and plain-language sensitivity notes
- [ ] **Phase 5: Dashboard UX Redesign** - Jargon elimination, story-first layout, operator instructions, and loading states
- [ ] **Phase 6: Demo Preparation** - Curated fast 3-stream example input and end-to-end demo verification

## Phase Details

### Phase 1: Critical Bug Fixes
**Goal**: The algorithm produces correct, safe, crash-proof results for all valid inputs
**Depends on**: Nothing (first phase)
**Requirements**: BUG-01, BUG-02, BUG-03, BUG-04
**Success Criteria** (what must be TRUE):
  1. An input where no feasible blend exists returns a structured result (not a JSON parse error or crash) and the dashboard shows a clear "no feasible blend" message
  2. A blend with pH below pH_min (e.g., pH 3.5) is rejected as infeasible by the optimizer -- it never appears in results as a valid processing step
  3. Phase Details safety check values match the user-configured K-values and eta (changing BTU_diesel or eta in Technical Calibration changes the displayed effective BTU accordingly)
  4. All pytest tests pass, including new edge-case tests for single-stream infeasible, all-acidic, and zero-BTU inputs
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Python fixes: BUG-01 inf serialization (_sanitize helper), BUG-02 pH_min enforcement in gatekeeper.py + search.py, regression tests
- [ ] 01-02-PLAN.md — Dashboard fixes: BUG-03 hardcoded BTU_diesel/eta/limits replaced with cfg values, BUG-04 "No Feasible Blend Found" message in recipe-tab

### Phase 2: Architecture Scaffold
**Goal**: The codebase has route-group isolation, centralized design tokens, and shared modules that unblock all subsequent UI work
**Depends on**: Phase 1
**Requirements**: PLSH-01, PLSH-02, UX-04
**Success Criteria** (what must be TRUE):
  1. The landing page renders at `/` with a full-bleed marketing layout (no dashboard chrome) and the dashboard renders at `/dashboard` with the existing topbar and tabs -- both served from the same Next.js build
  2. All AxNano brand colors (ax-cyan, ax-orange) are applied via Tailwind utility classes sourced from CSS custom properties in globals.css -- no hardcoded hex values remain in component files
  3. Shadow-based elevation, whitespace spacing, and easing values are defined as CSS design tokens in globals.css and consumed via Tailwind utilities throughout the app
  4. The dashboard auto-loads a 3-stream example on first visit so no user ever sees an empty state
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Landing Page
**Goal**: A non-technical visitor understands why waste blending matters and enters the demo within 60 seconds of landing
**Depends on**: Phase 2
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04
**Success Criteria** (what must be TRUE):
  1. The hero section at `/` leads with the cost pain of solo processing and presents blending as the solution -- a visitor with no SCWO knowledge understands the value proposition without scrolling past the fold
  2. A 3-step visual explainer (load streams, optimize, get a plan) is visible and takes under 30 seconds to read with zero jargon
  3. A climate impact section expresses fuel savings in CO2 equivalent terms (e.g., "equivalent to X fewer truck trips")
  4. A single prominent CTA button navigates to `/dashboard` with example data pre-loaded, requiring zero configuration from the visitor
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Chemistry Validation
**Goal**: Technical reviewers can see exactly what is calibrated vs. assumed, and non-technical viewers are not confused by it
**Depends on**: Phase 2
**Requirements**: CHEM-01, CHEM-02, CHEM-03, CHEM-04
**Success Criteria** (what must be TRUE):
  1. An assumptions panel in the dashboard shows all three K-values with plain-language descriptions and a "theoretical estimate -- not yet calibrated" confidence badge on each
  2. Chemistry details use three-tier progressive disclosure: plain language summary always visible, formula expandable on click, full derivation expandable on second click
  3. Every cost savings figure (savings %, dollar amounts) is accompanied by a visible sensitivity note explaining these are directional estimates pending K-value calibration
  4. All 9 MVP assumptions (A1-A9) are each stated in one plain-English sentence, accessible from within the dashboard
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Dashboard UX Redesign
**Goal**: Every user-facing string passes the "plant operator can read this" test, and the layout tells a cost-savings story
**Depends on**: Phase 2, Phase 4
**Requirements**: UX-01, UX-02, UX-03, PLSH-03
**Success Criteria** (what must be TRUE):
  1. Zero instances of r_water, r_diesel, r_naoh, BTU, Gatekeeper, B&B, or "blend ratio" appear in any user-facing UI text -- all replaced with plain labels (water added, fuel supplement, neutralizer, energy content, mix proportion)
  2. The dashboard layout leads with baseline cost vs. optimized cost comparison before showing any processing step details -- the first thing a user sees after results load is the savings story
  3. Each processing step shows operator-ready instructions in plain language (e.g., "Mix 4.2 litres of Stream A with 2.1 litres of Stream B, then add 0.8 litres of water")
  4. A multi-stage progress indicator shows meaningful status messages during optimization runs so a 60-second 5-stream run does not appear frozen
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

### Phase 6: Demo Preparation
**Goal**: A curated fast example is available for live demos with no wait time
**Depends on**: Phase 5
**Requirements**: PLSH-04
**Success Criteria** (what must be TRUE):
  1. A curated 3-stream example input file exists that produces meaningful optimization results (demonstrable savings) and runs in under 1 second
  2. The dashboard file picker includes this demo example and it is the default auto-loaded file
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6
Note: Phases 3 and 4 can execute in parallel (both depend only on Phase 2).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Critical Bug Fixes | 1/2 | In Progress|  |
| 2. Architecture Scaffold | 0/2 | Not started | - |
| 3. Landing Page | 0/2 | Not started | - |
| 4. Chemistry Validation | 0/2 | Not started | - |
| 5. Dashboard UX Redesign | 0/2 | Not started | - |
| 6. Demo Preparation | 0/1 | Not started | - |
