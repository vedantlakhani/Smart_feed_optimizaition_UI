---
phase: 04-chemistry-validation
verified: 2026-03-27T00:00:00Z
status: human_needed
score: 6/6 automated must-haves verified
re_verification: false
human_verification:
  - test: "Open Phase Details tab before running optimization. Confirm AssumptionsPanel is visible at the bottom with 'Model Assumptions' card, 3 K-value rows each bearing amber badge 'Theoretical estimate — not yet calibrated', plain-English labels (Fluoride-to-acid conversion / pH base contribution / Acid-to-neutralizer volume), and 9 collapsed accordion items A1–A9."
    expected: "Panel renders with no optimization result. All labels are human-readable, not raw variable names."
    why_human: "Conditional rendering inside TabsContent is not observable by grep; requires browser to confirm the tab is accessible and panel visible before any run."
  - test: "Run optimization with example data. Check KPI strip below 'Cost Reduction' value for amber SensitivityNote text."
    expected: "Amber Info icon + 'Directional estimate — savings figures will shift when calibration parameters are measured from reactor data.' appears only under Cost Reduction, not under Diesel Offset or Optimized Runtime."
    why_human: "The bottomNote prop is conditionally passed at runtime based on hasResult; browser needed to confirm correct card placement."
  - test: "On the Optimization tab after a run, scroll through the Cost Story table and Climate Impact section."
    expected: "SensitivityNote appears once below the cost comparison table and once below the Total Cost Reduction progress bar. Not present elsewhere in that tab."
    why_human: "Placement relative to Card boundaries requires visual confirmation; grep shows markup but not rendered order."
  - test: "On the Phase Details tab with results, expand a phase accordion and inspect the middle 'Additive Rates' column."
    expected: "Four plain-English sentences visible immediately (r_water, r_diesel, r_naoh, pH). Each has a 'Show formula' trigger. r_naoh and pH each have a nested 'Show derivation' trigger inside their formula content. Opening one accordion item does not collapse another (multiple=true behavior)."
    why_human: "Progressive disclosure interaction (accordion open/close isolation) requires live DOM testing."
  - test: "Expand all MVP assumption accordion items (A1–A9) in the AssumptionsPanel."
    expected: "Each expands to a plain-English sentence with no jargon tokens: no r_naoh, r_water, r_diesel, K_F_TO_ACID, K_PH_TO_BASE, K_ACID_TO_NAOH_VOL, meq (standalone), BTU (standalone), or angle-bracket labels."
    why_human: "Content correctness and jargon-free quality must be assessed by a human reader, not by absence of a string."
---

# Phase 4: Chemistry Validation Verification Report

**Phase Goal:** Technical reviewers can see exactly what is calibrated vs. assumed, and non-technical viewers are not confused by it
**Verified:** 2026-03-27
**Status:** human_needed — all automated checks pass; 5 items require browser verification
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | AssumptionsPanel renders all three K-values with amber "Theoretical estimate — not yet calibrated" badges and plain-English descriptions | VERIFIED | File `assumptions-panel.tsx` line 83: exact badge text; `K_ASSUMPTIONS` array has 3 entries each with `plainLabel` and `plainDesc` fields; badge uses `border-amber-300 bg-amber-50 text-amber-700` |
| 2 | AssumptionsPanel renders all 9 MVP assumptions (A1–A9) as plain-English sentences inside an Accordion | VERIFIED | Lines 39–47 of `assumptions-panel.tsx`: 9 entries in `MVP_ASSUMPTIONS` with `plainEnglish` field; rendered via `<Accordion multiple>` on line 104 |
| 3 | SensitivityNote is a reusable component that renders an amber Info note about directional estimates | VERIFIED | `sensitivity-note.tsx` exports `SensitivityNote` with optional `className`; text matches spec exactly; amber `text-amber-600/80` styling confirmed |
| 4 | AssumptionsPanel renders unconditionally in Phase Details tab (before any run) | VERIFIED | `page.tsx` lines 189–191: `<AssumptionsPanel />` is outside the `{result && ...}` block at line 180 |
| 5 | SensitivityNote appears in exactly 3 locations (cost table, Total Cost Reduction bar, Cost Reduction KPI) | VERIFIED | `cost-story.tsx`: 3 occurrences (import + 2 usage sites at lines 181, 229); `impact-header.tsx`: 2 occurrences (import + 1 usage at line 121 via `bottomNote` prop on Cost Reduction card only) |
| 6 | PhaseDetail shows three-tier disclosure for r_naoh and pH, two-tier for r_water and r_diesel | VERIFIED | `phase-details-tab.tsx`: 4 "Show formula" occurrences (r_water, r_diesel, r_naoh, pH); 2 "Show derivation" occurrences (r_naoh, pH); all `<Accordion>` use `multiple` boolean prop; zero `type="multiple"` occurrences |

**Score:** 6/6 automated truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `dashboard/src/components/dashboard/sensitivity-note.tsx` | CHEM-03 amber inline callout | VERIFIED | 15 lines; exports `SensitivityNote`; exact spec copy text; `Info` from lucide-react; amber styling |
| `dashboard/src/components/dashboard/assumptions-panel.tsx` | CHEM-01 K-values + CHEM-04 MVP assumptions accordion | VERIFIED | 127 lines; exports `AssumptionsPanel` (zero props, no `interface AssumptionsPanelProps`); 3 K-value entries; 9 MVP entries; `<Accordion multiple>`; correct badge text |
| `dashboard/src/components/dashboard/cost-story.tsx` | CHEM-03 SensitivityNote in cost table + climate section | VERIFIED | Import at line 16; rendered at line 181 (below cost table) and line 229 (below Total Cost Reduction bar) |
| `dashboard/src/components/dashboard/impact-header.tsx` | CHEM-03 SensitivityNote below KPI savings value | VERIFIED | Import at line 7; `bottomNote?: React.ReactNode` prop on `KpiCard` (line 40); passed only to Cost Reduction card (line 121) |
| `dashboard/src/components/dashboard/phase-details-tab.tsx` | CHEM-02 three-tier disclosure | VERIFIED | "Additive Rates" section replaces old "Gatekeeper Rates (L/L)" flat table; 4x "Show formula", 2x "Show derivation" nested; all `<Accordion multiple>` — zero `type="multiple"` |
| `dashboard/src/app/(app)/dashboard/page.tsx` | AssumptionsPanel wired unconditionally in details tab | VERIFIED | Import at line 13; rendered at lines 189–191 outside `{result && ...}` guard |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `page.tsx` details tab | `AssumptionsPanel` | `import + <AssumptionsPanel />` outside result guard | WIRED | Lines 13 and 189–191 confirmed |
| `impact-header.tsx` KpiCard | `SensitivityNote` | `bottomNote` prop on Cost Reduction card only | WIRED | Line 121: `bottomNote={hasResult ? <SensitivityNote .../> : undefined}` |
| `cost-story.tsx` | `SensitivityNote` | Two render sites after cost table and after Total Cost Reduction bar | WIRED | Lines 181 and 229 |
| `phase-details-tab.tsx` PhaseDetail | `Accordion multiple` | Nested accordions for formula + derivation tiers | WIRED | Lines 154, 173, 192, 202, 224, 234 all use `<Accordion multiple>` boolean prop; zero `type="multiple"` |
| `assumptions-panel.tsx` | `@/components/ui/accordion` | `import Accordion, AccordionContent, AccordionItem, AccordionTrigger` + `<Accordion multiple>` | WIRED | Lines 6–11 import; line 104 usage with `multiple` prop |
| `assumptions-panel.tsx` | `@/components/ui/badge` | `import Badge` + `variant="outline"` | WIRED | Line 4 import; line 80 usage |
| `sensitivity-note.tsx` | `lucide-react` | `import Info` + `<Info className="w-3 h-3 shrink-0 mt-0.5" />` | WIRED | Lines 1 and 11 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CHEM-01 | 04-01, 04-02 | Dashboard shows assumptions panel with K-values described in plain language with confidence badges ("theoretical estimate — not yet calibrated") | SATISFIED | `assumptions-panel.tsx` K_ASSUMPTIONS array; badge text exactly "Theoretical estimate — not yet calibrated" on all 3 entries; `AssumptionsPanel` rendered unconditionally in details tab |
| CHEM-02 | 04-02 | Chemistry details use progressive disclosure: plain language always visible, formula expandable, derivation expandable | SATISFIED | `phase-details-tab.tsx` Additive Rates section: 4x two/three-tier accordion structure; "Show formula" (×4) and "Show derivation" (×2) confirmed present |
| CHEM-03 | 04-01, 04-02 | Cost savings figures accompanied by plain-language sensitivity note about directional estimates pending K-value calibration | SATISFIED | `SensitivityNote` with exact spec text rendered in 3 locations: below cost table, below Total Cost Reduction bar, below Cost Reduction KPI value |
| CHEM-04 | 04-01, 04-02 | Each of the 9 MVP assumptions (A1–A9) presented in one plain-English sentence accessible in the dashboard | SATISFIED | All 9 MVP_ASSUMPTIONS entries A1–A9 present in `assumptions-panel.tsx` with `plainEnglish` sentences; rendered in `<Accordion multiple>` |

No orphaned requirements: all 4 CHEM requirements from the REQUIREMENTS.md traceability table are claimed in plans 04-01 and 04-02, and all 4 are verified as satisfied above.

---

## Anti-Patterns Found

No blockers or warnings detected.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `phase-details-tab.tsx` | 253–258 | `r_ext (total)` and `W (L/min)` labels remain as technical jargon in the always-visible plain state of the Additive Rates column | Info | Per plan spec these two rows are intentionally left without disclosure ("plain only, no disclosure needed") — plan author accepted this tradeoff. Not a CHEM-phase concern but flagged for Phase 5 UX-01 jargon cleanup. |

No TODO/FIXME/placeholder comments, no `return null`/empty implementations, no stub handlers found in phase 4 modified files.

---

## Human Verification Required

### 1. AssumptionsPanel pre-run visibility

**Test:** Open the Phase Details tab in the browser WITHOUT running optimization first.
**Expected:** "Model Assumptions" card is visible at the bottom of the tab. Three K-value rows appear with amber "Theoretical estimate — not yet calibrated" badges and human-readable labels. Nine accordion items labeled A1–A9 are visible and expandable.
**Why human:** Tab rendering requires a live browser; grep confirms the markup is outside the `result &&` guard but cannot confirm the tab is reachable or the panel actually renders in the DOM.

### 2. SensitivityNote on Cost Reduction KPI only

**Test:** Run optimization. Check all three KPI cards in the dark header strip.
**Expected:** Amber "Directional estimate..." note appears only below the "Cost Reduction" value. The "Diesel Offset" and "Optimized Runtime" cards have no such note.
**Why human:** The `bottomNote` conditional is runtime-evaluated; visual inspection required to confirm layout placement and confirm no layout breakage.

### 3. SensitivityNote placement in Optimization tab

**Test:** After a run, scroll the Optimization tab through Cost Story and Climate Impact.
**Expected:** Amber note appears once after the baseline-vs-optimized table and once after the Total Cost Reduction progress bar. No spurious appearances elsewhere.
**Why human:** Rendered position relative to Card boundaries requires visual confirmation.

### 4. Progressive disclosure interaction in Phase Details

**Test:** After a run, open a phase accordion in the Phase Details tab. In the "Additive Rates" column, click "Show formula" on r_water, then click "Show formula" on r_naoh, then click "Show derivation" inside the r_naoh formula content.
**Expected:** Each accordion section opens independently (multiple=true). The nested derivation opens without collapsing the formula. Formula text and derivation text are legible at the expected size.
**Why human:** Accordion open/close isolation across independent `<Accordion multiple>` instances requires live interaction testing.

### 5. Jargon-free plain state scan

**Test:** Without expanding any accordion, read all visible text across the dashboard after a run.
**Expected:** None of these tokens are visible in the non-collapsed state: `r_naoh`, `r_water`, `r_diesel`, `K_F_TO_ACID`, `K_PH_TO_BASE`, `K_ACID_TO_NAOH_VOL`, angle-bracket labels (`«A`). (Note: formulas inside accordions intentionally contain these symbols — only the plain always-visible state is tested here.)
**Why human:** Text visibility in collapsed vs. expanded accordion states requires browser inspection.

---

## Gaps Summary

No gaps. All automated checks pass.

The phase goal is structurally achieved: the assumptions panel and progressive disclosure exist, are correctly wired, and render the correct content for both technical and non-technical audiences. The `human_needed` status reflects the visual and interactive nature of the CHEM requirements — they inherently require browser confirmation that the UI renders legibly, the amber callouts appear in the right spatial positions, and the accordion interaction behaves correctly.

---

_Verified: 2026-03-27_
_Verifier: Claude (gsd-verifier)_
