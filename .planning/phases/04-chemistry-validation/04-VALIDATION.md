---
phase: 4
slug: chemistry-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-27
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | npm build (TypeScript) + grep-based content checks |
| **Config file** | `dashboard/package.json` |
| **Quick run command** | `cd dashboard && npm run build` |
| **Full suite command** | `cd dashboard && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd dashboard && npm run build`
- **After every plan wave:** `npm run build` + manual visual review of details tab and recipe tab
- **Before `/gsd:verify-work`:** Full build green + all 4 CHEM success criteria verified visually

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | CHEM-03 | grep | `grep -rn "SensitivityNote" dashboard/src/components/dashboard/` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | CHEM-01 | grep + build | `grep -n "not yet calibrated" dashboard/src/components/dashboard/assumptions-panel.tsx` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 1 | CHEM-04 | grep | `grep -c "A[1-9]" dashboard/src/components/dashboard/assumptions-panel.tsx` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 2 | CHEM-02 | build | `cd dashboard && npm run build` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 2 | CHEM-03 | grep | `grep -rn "SensitivityNote" dashboard/src/components/dashboard/impact-header.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `dashboard/src/components/dashboard/sensitivity-note.tsx` — new file, covers CHEM-03
- [ ] `dashboard/src/components/dashboard/assumptions-panel.tsx` — new file, covers CHEM-01, CHEM-04

*Framework already present — no install required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Three-tier accordion opens/closes correctly without collapsing siblings | CHEM-02 | React interaction — not detectable via grep or build | Open Phase Details tab, expand a phase, click "Show formula", confirm tier 2 opens; click "Show derivation", confirm tier 3 opens without closing tier 2 |
| SensitivityNote visible under KPI strip Cost Reduction card | CHEM-03 | Visual layout — text present but position must be confirmed | Load example, run optimization, inspect Cost Reduction KPI card for amber note below the savings % |
| AssumptionsPanel renders without result (pre-run state) | CHEM-01, CHEM-04 | Conditional rendering — build passes but render path needs browser check | Navigate to /dashboard Phase Details tab before running optimization; confirm AssumptionsPanel is visible |
| All 9 assumption plain-English sentences readable by non-technical user | CHEM-04 | Content quality — no abbreviations, variable names, or ppm without explanation | Review each of A1–A9 for jargon; confirm no raw variable names (r_naoh, BTU, meq, «A») visible to user |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
