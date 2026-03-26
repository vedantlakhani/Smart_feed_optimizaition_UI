---
phase: 2
slug: architecture-scaffold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 2 — Validation Strategy

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
| 2-01-01 | 01 | 1 | PLSH-02 | automated | `grep -r "#06b6d4\|#ff8c00\|#06B6D4\|#FF8C00" dashboard/src/components/ --include="*.tsx" \| grep -v "magicui\|recharts" \| wc -l` (must be 0) | ✅ | ⬜ pending |
| 2-01-02 | 01 | 1 | PLSH-01 | automated | `grep "shadow-card\|ease-smooth\|ease-spring" dashboard/src/app/globals.css \| wc -l` (must be ≥3) | ✅ | ⬜ pending |
| 2-02-01 | 02 | 2 | UX-04 | manual | Browser: open http://localhost:3000/dashboard, verify demo_3stream.json auto-loads | N/A | ⬜ pending |
| 2-02-02 | 02 | 2 | PLSH-02+PLSH-01 | automated | `cd dashboard && npm run build 2>&1 \| tail -3` (must exit 0) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. No new test files needed — validation is grep-based + build check.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Landing page at `/` has full-bleed layout (no topbar/tabs) | PLSH-01 (route groups) | Requires browser visual check | 1. Open http://localhost:3000, 2. Confirm no dashboard chrome visible |
| Dashboard at `/dashboard` retains topbar + tabs | PLSH-01 (route groups) | Requires browser visual check | 1. Open http://localhost:3000/dashboard, 2. Confirm topbar and 5 tabs present |
| demo_3stream.json auto-loads on first visit | UX-04 | Requires browser interaction | 1. Open fresh http://localhost:3000/dashboard, 2. Confirm 3 streams loaded without user action |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or explicit manual instructions
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0: not needed (no new test files required)
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
