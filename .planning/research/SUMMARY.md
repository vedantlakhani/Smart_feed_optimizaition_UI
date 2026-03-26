# Project Research Summary

**Project:** AxNano SmartFeed Demo Package -- Landing Page, Dashboard Redesign, Data Visualization
**Domain:** Industrial optimization demo product (SCWO waste-stream blending) for academic and customer audiences
**Researched:** 2026-03-26
**Confidence:** MEDIUM

## Executive Summary

This project is a demo package for an existing SCWO waste-stream blending optimizer. The core algorithm is functional and validated (23 tests, 36-47% cost savings). The work ahead is entirely presentation-layer: a marketing landing page, a redesigned dashboard that communicates results to non-technical audiences, and a chemistry validation framework that earns trust from technical reviewers. The existing Next.js 16 + React 19 + shadcn/ui + Framer Motion + Recharts stack covers every technology need -- no new dependencies are required. The architecture is a route-group split within the same Next.js app: a full-bleed marketing surface at `/` and the functional dashboard at `/dashboard`.

The recommended approach is to fix critical algorithm bugs first (pH_min enforcement, float-inf serialization, hardcoded constants), then scaffold the route-group architecture, build the landing page, layer in the chemistry assumptions/progressive-disclosure framework, and finally polish the dashboard with jargon elimination and number formatting. This ordering is driven by hard dependencies: bugs block demos, architecture blocks all UI work, the landing page is the entry point, and jargon elimination touches every component so it comes last.

The key risk is credibility destruction. Three uncalibrated K-values feed into every dollar figure the dashboard shows. If a chemistry professor asks "where does this number come from?" and the UI offers no answer, the entire product loses trust in one exchange. The mitigation is systematic: confidence badges on every derived number, a progressive-disclosure assumptions panel, and framing the product as "directional optimization" rather than precise cost prediction. A secondary risk is live demo failure from edge-case crashes (inf serialization, null results, 60-second wait times). Pre-computed result caching and a curated demo safety harness address this.

## Key Findings

### Recommended Stack

The existing stack requires zero new npm dependencies. Next.js 16 App Router with route groups provides layout isolation between the marketing page and dashboard. Framer Motion 12 handles all animation needs (scroll reveals, number counters, micro-interactions). Recharts covers standard charts; custom SVG + Framer Motion handles specialty visualizations (waterfall, progress rings). shadcn/ui 4 with Tailwind CSS 4 provides all UI primitives with full design control through CSS variables.

**Core technologies (all already installed):**
- **Next.js 16 App Router** -- route groups for marketing/dashboard layout isolation
- **Framer Motion 12** -- scroll-triggered animations, whileInView reveals, number transitions
- **Recharts 3.8** -- bar charts for baseline-vs-optimized cost breakdown
- **shadcn/ui 4 + Tailwind CSS 4** -- premium UI primitives with Apple-like design tokens
- **Custom SVG + Framer Motion** -- waterfall charts, progress rings where Recharts falls short

**Do not add:** GSAP (licensing), React Spring (redundant), D3 directly (too low-level), Nivo/Chart.js/Plotly (bundle bloat), smooth-scroll libraries (CSS scroll-snap suffices).

### Expected Features

**Must have (table stakes):**
- Problem-first hero section with dramatic savings number
- One-click demo with pre-loaded data (zero friction entry)
- Plain-language "How It Works" (3-4 steps, no jargon)
- Executive summary KPI cards (savings, diesel reduction, runtime)
- Baseline vs Optimized side-by-side comparison
- Loading state with staged progress messages (critical for 5-stream 60s waits)
- Assumptions disclosure panel with K-value transparency
- Unit labels on every number
- Safety check display with correct (non-hardcoded) values

**Should have (differentiators):**
- Environmental impact framing (diesel to CO2 equivalent)
- Interactive blending explainer widget on landing page
- Guided walkthrough tour for first-time visitors
- PDF export of executive summary + phase plan
- Methodology confidence badge ("Exact search: globally optimal")

**Defer (v2+):**
- "What if" scenario comparison (high complexity, requires careful UX)
- Animated blend visualization (effort-to-impact ratio unfavorable vs other items)
- Mobile responsiveness (demo shown on laptops/projectors only)
- Authentication / user accounts

**Anti-features (explicitly do not build):**
- Editable waste stream properties for non-experts
- Real-time reactor integration claims
- Marketing hype language ("AI-powered" etc.)
- More than 2 decimal places on cost numbers

### Architecture Approach

The architecture uses Next.js route groups to split the app into three surfaces sharing one build: `(marketing)/` for the landing page (Server Components, full-bleed, no chrome), `(app)/` for the dashboard (Client Components, topbar + tabs, existing state management), and optionally `(docs)/` for methodology documentation. The landing page is purely presentational with no API calls. The dashboard preserves the current subprocess-bridge architecture (POST to API route, spawn Python, JSON stdin/stdout). A new `lib/assumptions.ts` module provides the data layer for progressive-disclosure assumption cards. A `lib/labels.ts` module centralizes the jargon-to-plain-language mapping.

**Major components:**
1. **Root layout** -- fonts, global CSS, metadata (shared by all surfaces)
2. **Marketing layout + landing page** -- full-bleed scroll-snap sections, Server Components
3. **App layout + dashboard** -- existing topbar/tabs/state, Client Components
4. **Assumptions layer** -- `lib/assumptions.ts` data + `AssumptionsPanel` component with 3-tier progressive disclosure
5. **Shared brand components** -- logo, stat cards, badges, footer (used across both surfaces)
6. **Labels module** -- `lib/labels.ts` jargon mapping, single source of truth for user-facing terminology

### Critical Pitfalls

1. **Uncalibrated K-values presented as validated results** -- Every dollar figure depends on three theoretical constants. Add confidence badges to every derived number. Frame as "directional optimization," not precise prediction. Create a prominent assumptions panel.
2. **Jargon removal that silently changes meaning** -- Renaming `r_water` to "water added" loses the "per liter of waste" dimensionality. Every renamed label must preserve units. Convert ratios to absolute volumes in operator instructions. Chemistry-literate sign-off required.
3. **Demo crashes on edge cases** -- `float("inf")` serialization bug, null optimized results, and no subprocess timeout. Fix the serialization bug, add null-safety to all dashboard components, add a 120s timeout with user-facing message.
4. **60-second wait kills live demos** -- Pre-compute results for demo input files. Use 3-stream examples (0.01s) for live demos. Add multi-stage progress indicator for live computation.
5. **pH_min not enforced** -- Corrosive blends (pH 2-3) pass safety checks. One-line fix in `gatekeeper.py` and `search.py`. Must be fixed before any demo.

## Implications for Roadmap

### Phase 1: Critical Bug Fixes and Algorithm Hardening

**Rationale:** These are correctness bugs that produce wrong or crashing results. Nothing else matters if the algorithm gives incorrect safety assessments or the demo crashes during a presentation. This phase has zero UI work -- it is pure Python fixes and test additions.
**Delivers:** A correct, crash-proof algorithm that can be safely demoed.
**Addresses:** Safety check correctness, serialization robustness, null-result handling.
**Avoids:** Pitfall 3 (demo crashes), Pitfall 5 (pH_min not enforced), Pitfall 8 (hardcoded constants).
**Scope:**
- Fix pH_min enforcement in gatekeeper.py and search.py
- Fix float("inf")/NaN serialization in run_optimization.py
- Fix hardcoded BTU_diesel/eta in phase-details-tab.tsx
- Add null-safety for optimized=None in all dashboard components
- Add subprocess timeout (120s) with error message
- Add test cases for edge inputs (all-acidic, zero-BTU, single stream)
- Add health-check endpoint (/api/health)

### Phase 2: Architecture Scaffold and Route Group Split

**Rationale:** All UI work depends on the route-group structure being in place. Moving existing code into `(app)/` and creating the `(marketing)/` skeleton unblocks the landing page and dashboard redesign in parallel. This phase also extracts shared components and creates the labels/assumptions data modules.
**Delivers:** Working route-group architecture with dashboard at `/dashboard` and empty landing page scaffold at `/`.
**Uses:** Next.js App Router route groups, existing component library.
**Implements:** Route group split, shared brand components, lib/labels.ts, lib/assumptions.ts.
**Avoids:** Anti-pattern of monolithic "use client" landing page, shared state between surfaces.
**Scope:**
- Create (marketing)/ and (app)/ route group directories
- Move existing page.tsx to (app)/dashboard/page.tsx
- Move API routes into (app)/api/
- Create root layout (fonts + CSS only), marketing layout (full-bleed), app layout (topbar + container)
- Extract shared components (logo, stat-card, badge, footer)
- Create lib/labels.ts jargon mapping
- Create lib/assumptions.ts with A1-A9 and K-value metadata
- Verify dashboard still works at /dashboard

### Phase 3: Landing Page

**Rationale:** The landing page is the entry point for every visitor. It frames the problem, communicates the value proposition, and drives users to the dashboard. It depends on the route-group scaffold (Phase 2) and shared components but is otherwise independent of dashboard work.
**Delivers:** A complete marketing landing page at `/` with hero, problem statement, solution explanation, proof stats, and CTA to dashboard.
**Uses:** Framer Motion whileInView for scroll reveals, CSS scroll-snap, existing Magic UI components (shimmer button, animated gradient text, number ticker), Server Components with client islands.
**Addresses:** Problem-first hero, "How It Works" explainer, one-click demo CTA, credibility signals.
**Avoids:** Pitfall 6 (overpromising precision) by framing as directional optimization and leading with mechanism not numbers.
**Scope:**
- Hero section with animated tagline and savings number
- Problem section (solo processing costs)
- Solution section (blending insight, reuse BLENDING_PAIRS data)
- Stats bar (savings range, stream count, speed, DRE)
- CTA section linking to /dashboard
- Footer with team/course affiliation

### Phase 4: Dashboard Redesign -- Assumptions Layer and Progressive Disclosure

**Rationale:** The assumptions/trust layer is the highest-risk UX challenge and must be designed before the jargon elimination pass, because the progressive-disclosure pattern determines how technical detail is exposed throughout the dashboard. This phase builds the AssumptionsPanel and confidence badge system.
**Delivers:** Progressive-disclosure assumptions panel embedded in the dashboard, confidence badges on all K-value-dependent numbers, "How did we calculate this?" expandable sections.
**Implements:** Three-tier progressive disclosure (plain language / formula / derivation), confidence badge system (validated/theoretical/pending), AssumptionsPanel replacing ExpertOverrides.
**Avoids:** Pitfall 1 (K-values as validated), Pitfall 7 (losing verification layer in redesign).
**Scope:**
- Build AssumptionCard, KValueCard, FormulaCard components
- Build AssumptionsPanel with progressive disclosure tiers
- Add confidence badges to all KPI cards and cost numbers
- Embed assumptions panel in Optimization tab ("How did we calculate this?")
- Ensure Phase Details tab retains full technical detail for expert review

### Phase 5: Dashboard Redesign -- Jargon Elimination and UX Polish

**Rationale:** Jargon elimination touches every dashboard component and must happen after the assumptions layer is in place (Phase 4) so that technical terms have a home in the expert view. This phase also adds the loading state improvements, unit labels, number formatting, and environmental impact framing.
**Delivers:** A dashboard where every user-facing string passes the "plant operator can read this" test, with consistent number formatting, unit labels, and staged loading feedback.
**Addresses:** Jargon elimination, unit labels audit, loading state improvement, environmental impact framing, number formatting consistency, auto-load example data on first visit.
**Avoids:** Pitfall 2 (meaning-changing jargon removal) by preserving units in every label and having chemistry-literate review. Pitfall 9 (moisture field confusion) by visually separating display-only fields.
**Scope:**
- Apply lib/labels.ts mappings throughout all dashboard components
- Convert ratios to absolute volumes in operator instructions
- Add unit labels to every displayed number
- Define and apply number formatting standard (dollars 2dp, percentages 1dp, ratios 2dp, volumes 1dp)
- Add staged loading progress messages
- Add environmental impact framing (diesel to CO2 equivalent)
- Auto-load 3-stream example on first dashboard visit
- Mark moisture field as display-only

### Phase 6: Demo Preparation and Polish

**Rationale:** Final hardening for live presentation. Depends on all previous phases being complete. Focuses on pre-computed caching, curated demo inputs, end-to-end testing on the demo machine, and any remaining polish items.
**Delivers:** A demo-ready product with pre-tested input files, cached results for instant display, and a verified setup on the presentation machine.
**Addresses:** PDF export, guided tour (if time permits), methodology confidence badge.
**Avoids:** Pitfall 4 (60-second wait) via pre-computed cache. Pitfall 10 (machine portability) via demo setup checklist and health-check endpoint.
**Scope:**
- Pre-compute and cache results for all demo input files
- Create demo setup checklist
- End-to-end test on demo machine
- Add PDF export of executive summary (should-have)
- Add guided walkthrough tour (should-have, if time permits)
- Add "Best found" / methodology badge to results
- Final visual polish pass

### Phase Ordering Rationale

- **Phase 1 before everything:** Correctness bugs must be fixed before any UI work is showcased. A crashing demo or wrong safety check invalidates all presentation-layer effort.
- **Phase 2 before Phases 3-5:** The route-group scaffold is a hard dependency for both the landing page and dashboard redesign. Shared components and data modules (labels, assumptions) are consumed by all subsequent phases.
- **Phase 3 can run in parallel with Phase 4:** Landing page and assumptions layer have no code dependencies on each other (only both depend on Phase 2).
- **Phase 4 before Phase 5:** The progressive-disclosure pattern must be in place before jargon elimination, because the jargon removal needs to know where technical terms will be accessible in the expert view.
- **Phase 6 last:** Demo preparation is inherently a final-stage activity that validates everything built in prior phases.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Assumptions Layer):** The three-tier progressive disclosure pattern is well-defined in ARCHITECTURE.md but the exact component API and data model need implementation-time refinement. The confidence badge system needs design review to ensure it does not clutter the UI.
- **Phase 5 (Jargon Elimination):** The label translation table needs chemistry-literate review. Every renamed label must be verified to preserve physical meaning and units. This is a domain-expertise task, not a code task.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Bug Fixes):** Specific bugs are already identified with line numbers and exact fixes documented in PITFALLS.md and CONCERNS.md.
- **Phase 2 (Route Group Scaffold):** Next.js App Router route groups are a well-documented, standard pattern.
- **Phase 3 (Landing Page):** Standard marketing page with established patterns. Framer Motion scroll animations are well-documented.
- **Phase 6 (Demo Prep):** Operational checklist, not a design challenge.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies already installed and proven in the codebase. No new dependencies needed. |
| Features | MEDIUM | Feature priorities based on established industrial SaaS and academic demo patterns, not user research. The "table stakes" list is solid; differentiator prioritization is judgment-based. |
| Architecture | HIGH | Route-group pattern is standard Next.js. Existing codebase structure confirmed via direct inspection. Progressive disclosure is an established UX pattern. |
| Pitfalls | MEDIUM-HIGH | Critical bugs confirmed via codebase analysis (specific files and line numbers). Domain-specific pitfalls (K-value credibility, jargon meaning shifts) based on training data patterns for academic/industrial products. |

**Overall confidence:** MEDIUM -- primarily because WebSearch was unavailable for all four research streams, so version-specific API details and current best practices could not be verified against live documentation. The architectural and feature recommendations are well-grounded in codebase analysis and established patterns.

### Gaps to Address

- **K-value calibration data:** No operational data exists to validate the three K-constants. This is a product limitation, not a research gap, but it must be communicated clearly in the UI. The assumptions layer (Phase 4) addresses this.
- **Framer Motion 12 + React 19 strict mode:** STACK.md flags this as MEDIUM confidence. Verify `whileInView` behavior early in Phase 3 development.
- **5-stream performance on demo hardware:** The 60-second benchmark is from development hardware. Must be tested on the actual demo machine during Phase 6.
- **Chemistry-literate label review:** The jargon translation table needs sign-off from someone who understands SCWO chemistry. This is a process gap, not a research gap -- plan for it in Phase 5.
- **Exact demo audience:** Features are prioritized for "professors, plant managers, and operators" but the specific presentation context (classroom? trade show? investor meeting?) could shift priorities. Clarify before finalizing Phase 3 landing page copy.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `dashboard/package.json`, `smart_feed_v9/`, all component files -- direct inspection
- `CLAUDE.md` -- algorithm design decisions, assumptions A1-A9, performance benchmarks
- `.planning/codebase/CONCERNS.md` -- documented bugs with specific file/line references

### Secondary (MEDIUM confidence)
- Next.js App Router route groups -- established pattern since Next.js 13.4+, confirmed in training data
- Framer Motion whileInView API -- stable since Framer Motion 7+, confirmed used in existing codebase
- Industrial SaaS demo patterns, academic presentation conventions -- training data consensus

### Tertiary (LOW confidence)
- Framer Motion 12 specifics with React 19 strict mode -- needs live verification
- Current npm package versions -- should be verified against registry before Phase 2

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
