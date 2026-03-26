# AxNano SmartFeed — Demo Package

## What This Is

AxNano SmartFeed is a waste-stream optimization tool for SCWO (Supercritical Water Oxidation) reactors. It shows operators and managers how blending complementary waste streams — instead of processing each one alone — dramatically cuts fuel, chemical, and operating costs. The product needs to be presentable as a working prototype to professors (Design Climate course) and evaluable by potential customers, without requiring any technical background to understand.

## Core Value

A non-technical person can open the product, immediately grasp why waste blending matters, and read a credible optimized plan — no explanation from the AxNano team required.

## Requirements

### Validated

- ✓ Core optimization algorithm (Python) — exact search for ≤5 streams, B&B pruning, memoization
- ✓ pH blending via [H⁺] concentration method
- ✓ BTU dilution model (BTU_eff = BTU_blend / (1 + r_water))
- ✓ NaOH chemical model (F ppm acid load → net acid → NaOH volume)
- ✓ Baseline vs optimized cost comparison
- ✓ Next.js dashboard shell (5 tabs, shadcn/ui, Ax brand colors)
- ✓ Python ↔ Next.js subprocess bridge (run_optimization.py)
- ✓ 23 passing pytest tests

### Active

- [ ] Landing page: educate (problem → solution) → CTA to enter demo
- [ ] Dashboard redesign: story-first UX, no jargon, Apple-like premium aesthetic
- [ ] Jargon elimination: replace all technical terms with plain language throughout UI
- [ ] Chemistry validation framework: document K-values, A1–A9 assumptions, formulas with plain explanations
- [ ] Operator view: step-by-step plain-language instructions for each processing step
- [ ] Manager/customer view: impact summary (cost savings, environmental benefit) upfront
- [ ] AxNano brand consistency: Ax-Cyan, Ax-Orange, Inter + JetBrains Mono throughout

### Out of Scope

- Real reactor data calibration — K-values are theoretical; fitting deferred until operational data available
- Mobile app — web-first for this prototype
- Authentication / multi-user — single-user demo prototype
- More than 5 waste streams — MVP constraint («A1»)
- Real-time reactor control / integration — optimization advisory only

## Context

**Existing codebase state:** Algorithm is fully built and tested. Dashboard exists (Next.js 16 + shadcn/ui) but the UX doesn't tell a story — it exposes algorithm internals (r_water, BTU_eff, Gatekeeper) rather than communicating value to a non-technical audience.

**Chemistry status:** All three K-values (K_F_TO_ACID = 0.053, K_PH_TO_BASE = 50.0, K_ACID_TO_NAOH_VOL = 8.28e-5) are engineering estimates awaiting real reactor data. The validation framework should document these prominently so reviewers understand what's calibrated vs. assumed.

**Audience:** Three distinct groups must be served:
1. **Reactor operators** — need plain-language step-by-step instructions to physically run each blend phase
2. **Plant managers / customers** — need to see cost savings and trust the plan before approving
3. **Design Climate course professors** — need to understand the problem, solution, and design thinking

**Brand:** Ax-Cyan `#06B6D4` (optimized/success metrics), Ax-Orange `#FF8C00` (CTAs, alerts). Premium Light theme: `bg-slate-50` page, `bg-white` cards. Typography: Inter (body), JetBrains Mono (numbers only).

**Jargon to eliminate from UI:**
- `r_water`, `r_diesel`, `r_naoh` → "water added", "fuel supplement", "neutralizer"
- `BTU`, `BTU_eff` → "energy content", "effective energy"
- `Phase` (algorithmic) → "processing step"
- `blend ratio` → "mix proportion"
- `Gatekeeper`, `B&B pruning` → never shown in UI

**Testing lens:** All work should be reviewed through three lenses:
1. Chemistry engineer — are formulas, units, and safety checks physically correct?
2. Professor — is every concept explained clearly enough for a non-expert?
3. Designer — does the visual journey tell a compelling story?

## Constraints

- **Tech stack**: Python 3.13 (conda: axnano-smartfeed) + Next.js 16 + shadcn/ui — do not change
- **Algorithm**: Core optimization logic in `smart_feed_v9/` is locked; UI layer and bridge can change
- **Brand**: AxNano design system (colors, typography) must be consistent throughout
- **Prototype**: No backend infrastructure, auth, or database — file-based JSON inputs only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Landing page in Next.js (same repo) | Single deployable artifact for demos | — Pending |
| Jargon-free UI labels | Non-technical audience; professors and customers cannot parse algorithm terms | — Pending |
| Document assumptions visibly (not hide them) | Builds trust with technical reviewers; shows rigor even without real data | — Pending |
| Story order: problem → cost pain → optimized solution | Matches how a customer evaluates a product | — Pending |

---
*Last updated: 2026-03-26 after initialization*
