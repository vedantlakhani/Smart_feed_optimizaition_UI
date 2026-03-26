# Phase 1: Critical Bug Fixes - Research

**Researched:** 2026-03-26
**Domain:** Python algorithm correctness, JSON serialization, Next.js error handling, TypeScript safety checks
**Confidence:** HIGH

## Summary

Phase 1 addresses four correctness bugs that would undermine any demo: (1) `float("inf")` in baseline costs crashes JSON serialization, (2) pH_min is defined but never enforced so acidic blends pass as feasible, (3) the Phase Details safety check hardcodes BTU_diesel=18300 and eta=0.89 instead of using user-configured values, and (4) the dashboard crashes when the optimizer returns no feasible result.

All four bugs have been precisely located in source code with exact line numbers. The fixes are surgical -- each touches 1-3 lines in 1-2 files. The primary risk is regression in the existing 23 tests, which must all continue to pass after fixes.

**Primary recommendation:** Fix each bug independently with a targeted test, run the full test suite after each fix to catch regressions immediately.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BUG-01 | System handles no feasible blend without crashing (fix `float("inf")` JSON serialization) | `baseline.py` line 46 produces `runtime_min = float("inf")` when W=0; `run_optimization.py` line 62 calls `json.dumps()` which emits non-standard `Infinity` token; JavaScript `JSON.parse` throws `SyntaxError`. Fix: sanitize inf/nan values before serialization. |
| BUG-02 | Optimizer enforces pH_min so blends below safe pH are rejected as infeasible | `gatekeeper.py` line 137 only checks `blend.pH > cfg.pH_max`; no `blend.pH < cfg.pH_min` check exists. `search.py` line 117 same gap. Fix: add pH_min check in both locations. |
| BUG-03 | Phase Details safety check uses user-configured K-values/eta instead of hardcoded constants | `phase-details-tab.tsx` line 85 and `expert-overrides.tsx` line 51 both hardcode `18300 * 0.89`. Fix: use `cfg.BTU_diesel * cfg.eta` from the passed config. Also hardcoded safety limits (solid 15, salt 5000, W_min 0.5) need to use cfg values. |
| BUG-04 | Dashboard shows a clear message when optimizer returns no result instead of crashing | `page.tsx` passes `result` to child components; when `result.optimized` is null, components like `recipe-tab`, `operation-tab` may crash accessing `.phases`. The API route also needs to handle Python process errors gracefully. Fix: null-guard in components + user-facing message. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Python 3.13 | 3.13 | Algorithm runtime | Project's conda env (`axnano-smartfeed`) |
| pytest | latest in env | Test framework | Already configured in `pyproject.toml` |
| Next.js | 16 | Dashboard framework | Already in use |
| TypeScript | 5.x | Dashboard type safety | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dataclasses (stdlib) | 3.13 | Python data models | All model definitions |
| json (stdlib) | 3.13 | Serialization bridge | `run_optimization.py` |
| math (stdlib) | 3.13 | `math.isfinite()` for inf checking | BUG-01 fix |

No new dependencies needed. All fixes use existing libraries.

## Architecture Patterns

### Bug Fix Pattern: Locate, Fix, Test, Verify

Each bug follows this pattern:
1. **Locate** the exact line(s) with the defect
2. **Fix** with minimal code change
3. **Add test** that would have caught the bug (regression test)
4. **Verify** all 23 existing tests still pass

### BUG-01: float("inf") JSON Serialization

**Root cause chain:**
- `baseline.py:46` — `runtime_min = stream.quantity_L / W if W > 0 else float("inf")`
- When W=0 (e.g., a stream requiring impossible external inputs), runtime becomes inf
- `calc_phase_cost` (gatekeeper.py:96-121) multiplies inf runtime by cost rates, producing inf cost values
- `run_optimization.py:62` — `json.dumps(output)` serializes inf as `Infinity` (Python-specific, non-standard JSON)
- `route.ts:59` — `JSON.parse(stdout)` throws `SyntaxError` on `Infinity` token
- API returns 500 with opaque "Failed to parse optimization output" error

**Fix locations:**
1. `run_optimization.py` — Add a recursive sanitizer that replaces `float("inf")` and `float("nan")` with `None` (becomes JSON `null`) before `json.dumps()`. Apply to the entire output dict.
2. Alternatively, use `json.dumps(output, default=...)` with a custom handler, but this does not catch inf inside dicts/lists — a recursive walk is safer.

**Secondary consideration:** The `search.py:305` memo also stores `float("inf")` for infeasible sub-problems. This is fine because it never reaches serialization — `build_optimized_schedule` returns `None` when `best_cost == float("inf")` (line 326). The `schedule_to_dict(None)` correctly returns `None` (line 27-28). The issue is specifically the **baseline** schedule which always has phases, even if some have inf costs.

**Edge case:** A single stream with W=0 produces baseline with `cost_total=inf` and `total_cost=inf`. The optimized schedule may be `None` (no feasible blend). Both paths must handle inf.

### BUG-02: pH_min Not Enforced

**Root cause:**
- `models.py:64` — `pH_min: float = 6.0` is defined with comment "pending engineering confirmation"
- `gatekeeper.py:137` — `if blend.pH > cfg.pH_max: return None` — only upper bound checked
- `search.py:117` — `if blend.pH > cfg.pH_max:` — only upper bound checked in template pre-computation
- No code anywhere checks `blend.pH < cfg.pH_min`

**Fix locations (2 parallel checks must both be added):**
1. `gatekeeper.py:137` — Change to: `if blend.pH > cfg.pH_max or blend.pH < cfg.pH_min: return None`
2. `search.py:117` — Change to: `if blend.pH > cfg.pH_max or blend.pH < cfg.pH_min:`

**Important:** Both locations must be fixed. The search pre-computation (search.py) filters templates; the evaluate_phase (gatekeeper.py) is the authoritative check used by baseline display logic. Missing either location would leave a gap.

**Impact on existing tests:**
- `test_infeasible_ph_too_high` tests pH=14 > pH_max=9 — still passes
- `test_feasible` uses AFFF with pH=7.5 — within [6.0, 9.0], still passes
- `test_single_stream` uses AFFF with pH=7.5 — still passes
- `test_optimized_beats_solo` uses Resin pH=3.0 + AFFF pH=7.5 — Resin solo has pH=3.0 < 6.0, but `evaluate_phase` is called via search, not baseline. Baseline does NOT call evaluate_phase, so baseline is unaffected. In the search, Resin solo would NOW be rejected (pH 3.0 < 6.0), but the blend of Resin+AFFF may have pH in range. Need to verify: the test `test_optimized_beats_solo` calls `search([resin, afff], cfg)` — if the Resin-solo template is now pruned but a Resin+AFFF blend template exists, the search still finds a feasible plan. However `search([resin], cfg)` called on line 194 would now return `float("inf")` (no feasible plan for Resin solo at pH 3.0). The test asserts `cost_mix < cost_resin + cost_afff` — if cost_resin is inf, this is `cost_mix < inf` which is true. **Test still passes.**
- `test_three_streams` uses Resin pH=3.0, AFFF pH=7.5, Caustic pH=13.5 — Caustic solo pH=13.5 > pH_max=9.0 already rejected. Resin solo pH=3.0 now also rejected. But blends of these should still be feasible. Need to verify that at least one blend of these three streams has pH in [6.0, 9.0]. The [H+] mixing of pH 3.0 (Resin) + pH 7.5 (AFFF) at ratio 1:1 would give pH ~ 3.3 (acid dominates). But other ratios like 1:10 might bring pH higher. With three streams including Caustic at pH 13.5, blends of AFFF+Caustic should work (7.5 and 13.5 blend near alkaline end but may be > pH_max). This test **may break** — needs careful verification.

**CRITICAL RISK:** The existing `test_three_streams` fixture uses Caustic with pH=13.5. Any blend containing Caustic is likely to have pH > 9.0 (pH_max). AFFF solo (pH=7.5) is feasible. Resin+AFFF blends may have pH < 6.0 depending on ratio. This test may need the assertion adjusted or the test streams modified to ensure at least one feasible multi-phase plan exists.

### BUG-03: Hardcoded BTU_diesel and eta in Safety Check

**Root cause:**
- `phase-details-tab.tsx:85` — `phase.r_diesel * 18300 * 0.89` instead of `phase.r_diesel * cfg.BTU_diesel * cfg.eta`
- `expert-overrides.tsx:51` — same hardcoded `18300 * 0.89`

**Additional hardcoded values found:**
- `expert-overrides.tsx:47` — `const W_MIN = 0.5;` instead of using cfg.W_min (but cfg is not passed to this component)
- `expert-overrides.tsx:126-127` — `solidEff <= 15` and `saltEff <= 5000` hardcoded instead of using cfg values
- `expert-overrides.tsx:139` — `btuEff >= 1800` hardcoded BTU threshold (not even from cfg — there is no `BTU_eff_min` in SystemConfig)

**Fix locations:**
1. `phase-details-tab.tsx:85` — Replace `18300` with `cfg.BTU_diesel` and `0.89` with `cfg.eta`
2. `expert-overrides.tsx` — Pass `cfg` (SystemConfig) as a prop to `ExpertOverrides` and through to `PhaseDetailRow`. Replace all hardcoded constants with cfg values.
3. `page.tsx:172` — Update `ExpertOverrides` call to pass config

**Note:** The `ExpertOverrides` component currently receives `result: OptimizationResult` which contains `result.config` (SystemConfig). So cfg is actually available as `result.config`. The `PhaseDetailRow` sub-component just needs to accept and use it.

### BUG-04: Dashboard Crash on Null Result

**Root cause:**
- When optimizer returns `optimized: null` (no feasible blend), `result.optimized` is null
- `phase-details-tab.tsx:226` — `if (!result?.optimized) return <EmptyState />;` — handles null correctly
- `recipe-tab.tsx` — needs verification, likely accesses `result.optimized.phases` without null check
- `operation-tab.tsx` — needs verification

**Additional failure mode:**
- If the Python process crashes (exception, not just no-feasible), the API returns `{error: "...", detail: "..."}` with status 500
- `page.tsx:82-84` handles this: checks `!resp.ok`, reads error data, throws Error
- The error is caught by the catch block and displayed in the error banner
- BUT: if the Python process succeeds but outputs `{optimized: null}`, the API returns 200 with the result. Components must handle `optimized: null`.

**Fix approach:**
- Verify each component handles `result.optimized === null`
- Add a clear user-facing message like "No feasible blend found — all streams will be processed individually (baseline)" when optimized is null
- This message should appear in the recipe tab since that's where the user is redirected after clicking Run

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON infinity handling | Custom JSON encoder class | Recursive dict walker replacing inf/nan with None | Simple, explicit, no magic — a 10-line function covers all cases |
| pH range validation | Separate validation layer | Inline check at existing filter points | Two existing filter locations already check pH_max; adding pH_min is 1 line each |
| TypeScript null safety | Runtime type guards everywhere | Optional chaining (?.) + early return pattern already used in phase-details-tab | Consistent with existing codebase pattern |

## Common Pitfalls

### Pitfall 1: Fixing pH_min in Only One Location
**What goes wrong:** If pH_min is added to `gatekeeper.py:evaluate_phase` but not `search.py:_precompute_templates`, the search still pre-computes templates for low-pH blends, wastes CPU, but they get filtered later. If only added to search.py but not gatekeeper.py, the `evaluate_phase` function used elsewhere (e.g., by reporter or future callers) would still accept low-pH blends.
**How to avoid:** Fix BOTH locations. Verify with a test that creates a stream with pH below pH_min and confirms it returns None/infeasible from both code paths.

### Pitfall 2: Breaking Existing Tests with pH_min Enforcement
**What goes wrong:** The existing test fixtures use Resin with pH=3.0, well below pH_min=6.0. After the fix, `search([resin], cfg)` returns inf cost. If any test asserts `cost < float("inf")` for a Resin-solo search, it will fail.
**How to avoid:** Check all test assertions against the Resin fixture after the pH_min fix. The `test_optimized_beats_solo` test compares `cost_mix < cost_resin + cost_afff` which still holds (inf on right side). The `test_three_streams` test needs careful verification — it asserts `cost < float("inf")` which may fail if no feasible blend exists among {Resin pH=3.0, AFFF pH=7.5, Caustic pH=13.5}.
**Warning signs:** `test_three_streams` fails after pH_min fix.

### Pitfall 3: Incomplete inf Sanitization
**What goes wrong:** Sanitizing only `runtime_min` misses `cost_total`, `cost_diesel`, etc. which are all inf when runtime is inf. The baseline schedule's `total_cost` and `total_runtime_min` are sums including inf, so they are also inf.
**How to avoid:** Apply sanitization recursively to the entire output dict, not just specific fields. Use a recursive walker function.

### Pitfall 4: ExpertOverrides Config Plumbing
**What goes wrong:** `ExpertOverrides` receives `result` which contains `result.config`. But `PhaseDetailRow` (the inner component) doesn't receive config. If you pass `cfg` down, you must update the component interface.
**How to avoid:** Thread `config` from `result.config` through the component hierarchy. The `PhaseDetailsTab` already does this correctly (line 244: `cfg={config}`). Follow the same pattern in `ExpertOverrides`.

## Code Examples

### BUG-01: Recursive inf/nan Sanitizer
```python
# Add to run_optimization.py
import math

def _sanitize(obj):
    """Replace float('inf') and float('nan') with None for JSON compatibility."""
    if isinstance(obj, float):
        if math.isinf(obj) or math.isnan(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {k: _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize(v) for v in obj]
    return obj

# Before json.dumps:
output = _sanitize(output)
print(json.dumps(output))
```

### BUG-02: pH_min Enforcement
```python
# gatekeeper.py line 137 — change from:
if blend.pH > cfg.pH_max:
    return None
# to:
if blend.pH < cfg.pH_min or blend.pH > cfg.pH_max:
    return None

# search.py line 117 — change from:
if blend.pH > cfg.pH_max:
# to:
if blend.pH < cfg.pH_min or blend.pH > cfg.pH_max:
```

### BUG-03: Use cfg Values in Safety Check
```typescript
// phase-details-tab.tsx line 85 — change from:
const btuEff = phase.blend_props.btu_per_lb / (1 + phase.r_water) + phase.r_diesel * 18300 * 0.89;
// to:
const btuEff = phase.blend_props.btu_per_lb / (1 + phase.r_water) + phase.r_diesel * cfg.BTU_diesel * cfg.eta;

// expert-overrides.tsx line 51 — same fix, but needs cfg passed as prop
```

### BUG-04: Null Result Handling
```typescript
// In recipe-tab.tsx (or wherever optimized schedule is accessed):
if (!result?.optimized) {
  return (
    <div className="...">
      <p>No feasible blend found. All streams will be processed individually (baseline).</p>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Python `json.dumps` with `allow_nan=True` (default) | Explicit sanitization before serialization | Best practice | Prevents JavaScript JSON.parse failures |
| Hardcoded constants in frontend | Config-driven from optimization result | This phase | Safety checks reflect actual parameters used |

## Open Questions

1. **BTU effective safety threshold**
   - What we know: `phase-details-tab.tsx:211` uses `btuEff >= 1800` as the safety check threshold. This value is not in `SystemConfig`.
   - What's unclear: Is 1800 BTU/lb a meaningful reactor minimum? Should it be configurable?
   - Recommendation: Leave as hardcoded for now (not part of BUG-03 scope). Note as tech debt for Phase 4 (Chemistry Validation).

2. **test_three_streams fixture compatibility**
   - What we know: After pH_min enforcement, Resin (pH 3.0) solo becomes infeasible. The blend of all three streams may or may not produce a blend with pH in [6.0, 9.0] depending on ratios.
   - What's unclear: Whether any ratio combination of {Resin pH=3.0, AFFF pH=7.5, Caustic pH=13.5} produces a feasible blend.
   - Recommendation: Run the test after the pH_min fix. If it fails, adjust the test fixture (e.g., change Resin pH to 5.5 or add a fourth stream) while keeping the test meaningful.

3. **Baseline handling of infeasible solo streams**
   - What we know: `baseline.py` does NOT call `evaluate_phase` — it directly calls gatekeeper and computes costs with no pH check. A stream with pH=3.0 still gets a baseline cost (possibly huge but finite).
   - What's unclear: Should baseline also enforce pH_min? If so, infeasible solo streams would have `None` results.
   - Recommendation: Do NOT enforce pH_min in baseline. Baseline intentionally shows worst-case costs to demonstrate blending value. The optimizer enforces pH_min for the optimized plan.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest (Python 3.13, conda env `axnano-smartfeed`) |
| Config file | `pyproject.toml` (project root) |
| Quick run command | `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/test_core.py -x -v` |
| Full suite command | `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -v` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | float("inf") in baseline does not crash JSON serialization | unit | `pytest tests/test_core.py::TestBug01InfSerialization -x` | No -- Wave 0 |
| BUG-01 | run_optimization.py outputs valid JSON for infeasible inputs | integration | `echo '...' \| python run_optimization.py \| python -c "import sys,json; json.load(sys.stdin)"` | No -- Wave 0 |
| BUG-02 | Blend with pH < pH_min rejected by evaluate_phase | unit | `pytest tests/test_core.py::TestBug02PhMinEnforcement -x` | No -- Wave 0 |
| BUG-02 | Search templates exclude pH < pH_min blends | unit | `pytest tests/test_core.py::TestBug02PhMinEnforcement::test_search_rejects_low_ph -x` | No -- Wave 0 |
| BUG-03 | Safety check uses cfg.BTU_diesel and cfg.eta | manual-only | Requires browser: change BTU_diesel in config, run optimization, verify Phase Details | N/A |
| BUG-04 | Dashboard shows message when optimized is null | manual-only | Requires browser: run optimization with infeasible-only streams, verify UI message | N/A |

### Sampling Rate
- **Per task commit:** `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/test_core.py -x -v`
- **Per wave merge:** `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -v`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/test_core.py::TestBug01InfSerialization` -- test that _sanitize replaces inf with None and produces valid JSON
- [ ] `tests/test_core.py::TestBug02PhMinEnforcement` -- test evaluate_phase returns None for pH < pH_min; test search excludes low-pH templates
- [ ] Verify `test_three_streams` still passes after pH_min fix (may need fixture adjustment)
- [ ] Integration test: pipe infeasible input through `run_optimization.py` and verify valid JSON output

## Sources

### Primary (HIGH confidence)
- Direct source code inspection of all files listed in the phase description
- `smart_feed_v9/gatekeeper.py` lines 124-167 -- evaluate_phase logic, pH check at line 137
- `smart_feed_v9/search.py` lines 116-119 -- template pre-computation pH filter
- `smart_feed_v9/baseline.py` line 46 -- float("inf") origin
- `run_optimization.py` line 62 -- json.dumps without inf handling
- `dashboard/src/components/dashboard/phase-details-tab.tsx` line 85 -- hardcoded 18300 and 0.89
- `dashboard/src/components/dashboard/expert-overrides.tsx` line 51 -- same hardcoded values
- `.planning/codebase/CONCERNS.md` -- pre-analyzed bug descriptions with file/line references

### Secondary (MEDIUM confidence)
- Python `json` module documentation: `json.dumps` default `allow_nan=True` emits `Infinity`/`NaN` which are not valid JSON per RFC 7159
- JavaScript `JSON.parse` specification: rejects `Infinity` and `NaN` tokens

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all fixes use existing code
- Architecture: HIGH - all bugs precisely located with exact line numbers and root cause chains
- Pitfalls: HIGH - test_three_streams risk identified from direct fixture analysis; all edge cases traced through code

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable codebase, no external dependency changes expected)
