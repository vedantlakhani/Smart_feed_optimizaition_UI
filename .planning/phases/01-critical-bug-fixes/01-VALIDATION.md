---
phase: 1
slug: critical-bug-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest (Python) + manual browser check (Next.js) |
| **Config file** | `pyproject.toml` |
| **Quick run command** | `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -x -q` |
| **Full suite command** | `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -v` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -x -q`
- **After every plan wave:** Run full suite
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | BUG-01 | unit | `pytest tests/test_core.py -k "infeasible" -v` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | BUG-02 | unit | `pytest tests/test_core.py -k "ph_min" -v` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | BUG-03 | manual | Browser: change eta in Technical Calibration, verify Phase Details updates | N/A | ⬜ pending |
| 1-02-02 | 02 | 2 | BUG-04 | manual | Browser: run infeasible input, verify clear message shown | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/test_core.py` — add test stubs for: infeasible input (float inf), pH_min enforcement (all-acidic blend), zero-BTU input
- [ ] Add fixture for infeasible input: single high-solid stream with no compatible blend partner

*Existing infrastructure (23 tests in test_core.py, conftest.py) covers most of phase. Only new edge-case stubs needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Phase Details BTU_eff updates when eta changes | BUG-03 | Requires browser + UI interaction with K-value override | 1. Open dashboard, 2. Run any optimization, 3. Go to Phase Details tab, 4. Open Technical Calibration, 5. Change eta from 0.85 to 0.70, 6. Verify BTU_eff in safety check changes |
| "No feasible blend" message shown | BUG-04 | Requires browser + infeasible test input | 1. Create input with all pH < 6 streams, 2. Run optimization, 3. Verify dashboard shows clear message instead of crash |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
