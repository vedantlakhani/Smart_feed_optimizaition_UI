---
phase: 3
slug: landing-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Next.js build (TypeScript check) + grep + manual browser |
| **Config file** | `dashboard/package.json` |
| **Quick run command** | `cd dashboard && npm run build 2>&1 \| tail -5` |
| **Full suite command** | `cd dashboard && npm run build && npm run lint` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd dashboard && npm run build 2>&1 | tail -5`
- **After every plan wave:** Full build + lint
- **Before `/gsd:verify-work`:** Full suite must be green + manual browser check
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | LAND-01 | automated | `grep -c "solo\|processing cost\|blending" dashboard/src/app/\(marketing\)/page.tsx` (must be ≥3) | ✅ | ⬜ pending |
| 3-01-02 | 01 | 1 | LAND-02 | automated | `grep -c "step\|Step\|explainer\|3-step\|three" dashboard/src/app/\(marketing\)/page.tsx` (must be ≥3) | ✅ | ⬜ pending |
| 3-01-03 | 01 | 1 | LAND-03 | automated | `grep -c "CO2\|CO₂\|carbon\|climate" dashboard/src/app/\(marketing\)/page.tsx` (must be ≥1) | ✅ | ⬜ pending |
| 3-01-04 | 01 | 1 | LAND-04 | automated | `grep "href.*dashboard" dashboard/src/app/\(marketing\)/page.tsx \| wc -l` (must be ≥1) | ✅ | ⬜ pending |
| 3-01-05 | 01 | 1 | LAND-01–04 | automated | `cd dashboard && npm run build 2>&1 \| tail -3` (must exit 0) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test files needed — validation is grep-based + build check + manual browser verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero section above the fold on 1280×768 | LAND-01 | Requires browser visual check | 1. Open http://localhost:3000, 2. Confirm hero with cost pain + blending solution visible without scrolling |
| 3-step explainer reads in <30s with no jargon | LAND-02 | Requires human reading time judgment | 1. Open http://localhost:3000, 2. Read the 3-step section, 3. Confirm zero technical terms (r_water, BTU, Gatekeeper, etc.) |
| Climate impact numbers feel real and credible | LAND-03 | Requires qualitative judgment | 1. Open http://localhost:3000, 2. Confirm CO₂ section shows concrete equivalents (truck trips, trees, etc.) |
| CTA navigates to /dashboard with demo data loaded | LAND-04 | Requires browser interaction | 1. Click "Enter Demo" / "Try It Now" button, 2. Verify redirect to /dashboard, 3. Confirm demo_3stream.json auto-loaded (3 streams visible) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or explicit manual instructions
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0: not needed (no new test files required)
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
