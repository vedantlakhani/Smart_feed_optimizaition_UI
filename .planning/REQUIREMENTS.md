# Requirements: AxNano SmartFeed Demo Package

**Defined:** 2026-03-26
**Core Value:** A non-technical person can open the product, immediately grasp why waste blending matters, and read a credible optimized plan — no explanation from the AxNano team required.

## v1 Requirements

### Bug Fixes

- [x] **BUG-01**: System handles the case where no feasible blend exists without crashing (fix `float("inf")` JSON serialization)
- [x] **BUG-02**: Optimizer enforces pH_min so blends below safe pH are rejected as infeasible (not incorrectly shown as safe)
- [x] **BUG-03**: Phase Details safety check uses user-configured K-values/eta instead of hardcoded constants
- [x] **BUG-04**: Dashboard shows a clear message when optimizer returns no result instead of crashing

### Landing Page

- [ ] **LAND-01**: Visitor sees a hero section that leads with the cost pain of solo processing, then presents blending as the solution
- [ ] **LAND-02**: Visitor sees a 3-step visual explainer (load streams → optimize → get a plan) that takes under 30 seconds to understand with no jargon
- [ ] **LAND-03**: Visitor sees a climate impact section that expresses fuel savings in CO₂ equivalent terms
- [ ] **LAND-04**: Visitor can enter the dashboard demo from the landing page via a single prominent CTA, with example data pre-loaded

### Chemistry Validation

- [ ] **CHEM-01**: Dashboard shows an assumptions panel with K-values described in plain language with confidence badges ("theoretical estimate — not yet calibrated")
- [ ] **CHEM-02**: Chemistry details use progressive disclosure: plain language summary always visible, formula expandable, derivation expandable — so both professors and operators are served
- [ ] **CHEM-03**: Cost savings figures are accompanied by a plain-language sensitivity note explaining they are directional estimates pending K-value calibration
- [ ] **CHEM-04**: Each of the 9 MVP assumptions (A1–A9) is presented in one plain-English sentence accessible in the dashboard

### UX Redesign

- [ ] **UX-01**: All jargon replaced throughout UI: r_water/r_diesel/r_naoh → plain labels; BTU → energy content; phase → processing step; blend ratio → mix proportion; Gatekeeper/B&B never visible
- [ ] **UX-02**: Dashboard layout leads with the cost savings story (baseline cost vs. optimized cost) before showing technical details
- [ ] **UX-03**: Each processing step shows operator-ready plain-language instructions ("Mix X litres of Stream A with Y litres of Stream B")
- [x] **UX-04**: Dashboard auto-loads example data on first visit so no user ever sees an empty state

### Polish

- [x] **PLSH-01**: Dashboard and landing page use Apple-like premium aesthetic: shadow-based elevation, generous whitespace, smooth cubic-bezier easing via CSS design tokens in globals.css
- [x] **PLSH-02**: All AxNano brand colors are applied via Tailwind utilities (ax-cyan, ax-orange) rather than 40+ hardcoded hex values
- [ ] **PLSH-03**: Optimization run shows a progress/loading indicator so a 60-second 5-stream run does not appear frozen
- [ ] **PLSH-04**: A curated 3-stream example input is available that runs in ~0.01s, suitable for live demos without waiting

## v2 Requirements

### Demo Hardening

- **DEMO-01**: Pre-computed result caching for known input files (instant results on demo hardware)
- **DEMO-02**: Guided tour / onboarding flow for first-time visitors
- **DEMO-03**: PDF export of the optimized plan with AxNano branding

### Extended Chemistry

- **EXTC-01**: K-value sensitivity analysis panel (show savings range across ±50% K-value variation)
- **EXTC-02**: Ability to input calibrated K-values from real reactor data and compare against theoretical baseline

### Multi-Audience

- **AUD-01**: Manager summary view: one-page printable cost + environmental impact report
- **AUD-02**: Shareable link to pre-loaded demo scenario (no file upload required)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real reactor data calibration | No operational data yet — K-value fitting deferred |
| Authentication / user accounts | Single-user demo prototype; not needed for v1 |
| More than 5 waste streams | MVP algorithm constraint («A1») |
| Mobile app | Web-first; mobile deferred |
| Real-time reactor control | Advisory optimization only, not control system |
| AI/ML rebranding | Algorithm is exact combinatorial search — no AI claims |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 1: Critical Bug Fixes | Complete |
| BUG-02 | Phase 1: Critical Bug Fixes | Complete |
| BUG-03 | Phase 1: Critical Bug Fixes | Complete |
| BUG-04 | Phase 1: Critical Bug Fixes | Complete |
| LAND-01 | Phase 3: Landing Page | Pending |
| LAND-02 | Phase 3: Landing Page | Pending |
| LAND-03 | Phase 3: Landing Page | Pending |
| LAND-04 | Phase 3: Landing Page | Pending |
| CHEM-01 | Phase 4: Chemistry Validation | Pending |
| CHEM-02 | Phase 4: Chemistry Validation | Pending |
| CHEM-03 | Phase 4: Chemistry Validation | Pending |
| CHEM-04 | Phase 4: Chemistry Validation | Pending |
| UX-01 | Phase 5: Dashboard UX Redesign | Pending |
| UX-02 | Phase 5: Dashboard UX Redesign | Pending |
| UX-03 | Phase 5: Dashboard UX Redesign | Pending |
| UX-04 | Phase 2: Architecture Scaffold | Complete |
| PLSH-01 | Phase 2: Architecture Scaffold | Complete (2026-03-26) |
| PLSH-02 | Phase 2: Architecture Scaffold | Complete (2026-03-26) |
| PLSH-03 | Phase 5: Dashboard UX Redesign | Pending |
| PLSH-04 | Phase 6: Demo Preparation | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after roadmap creation (traceability verified, all 20 requirements mapped)*
