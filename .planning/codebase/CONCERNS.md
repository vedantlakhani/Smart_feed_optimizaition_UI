# Codebase Concerns

**Analysis Date:** 2026-03-26

---

## Tech Debt

**K-value chemical constants uncalibrated:**
- Issue: Three constants in `smart_feed_v9/models.py` (lines 71–80) are theoretical estimates awaiting operational fitting. `K_F_TO_ACID = 0.053` is derived from stoichiometry, not measured. `K_PH_TO_BASE = 50.0` is described as "linear approximation, needs calibration." `K_ACID_TO_NAOH_VOL = 8.28e-5` is from theoretical 35% NaOH concentration.
- Files: `smart_feed_v9/models.py` (lines 68–80), `smart_feed_v9/gatekeeper.py` (lines 56–67)
- Impact: Every r_naoh calculation, NaOH cost figure, and savings percentage is systematically wrong until these are fitted from operational data. The algorithm produces directionally correct comparisons but quantitatively unreliable absolute cost numbers for NaOH.
- Fix approach: Collect (waste_pH, waste_F_ppm, actual_NaOH_consumed) from ≥10 real runs. Fit K_F_TO_ACID and K_PH_TO_BASE via least-squares regression. Update defaults in `SystemConfig`.

**pH_min is defined but never enforced in the search or baseline:**
- Issue: `SystemConfig.pH_min = 6.0` is defined in `smart_feed_v9/models.py` (line 64) with a comment "pending engineering confirmation." It appears in the reporter and CLI, but `gatekeeper.py` and `search.py` only check `blend.pH > cfg.pH_max`. There is no lower-bound pH feasibility check during template pre-computation or phase evaluation.
- Files: `smart_feed_v9/gatekeeper.py` (line 137), `smart_feed_v9/search.py` (lines 116–127)
- Impact: Highly acidic blends (pH < 6) are treated as feasible. Corrosion risk or reactor damage from low-pH feed is not prevented by the optimizer.
- Fix approach: Add `or blend.pH < cfg.pH_min` to the feasibility check in `evaluate_phase` (gatekeeper.py line 137) and in `_precompute_templates` (search.py line 117).

**Template quota silently drops potentially optimal solutions:**
- Issue: `_MAX_TEMPLATES_PER_SUBSET = 30` in `smart_feed_v9/search.py` (line 42) keeps only the 30 cheapest templates per subset by `cost_per_batch`. Templates ranked 31+ are permanently discarded. This is documented as a heuristic tradeoff but global optimality is not guaranteed.
- Files: `smart_feed_v9/search.py` (lines 42, 153–157)
- Impact: For exotic waste combinations where a mid-ranked ratio is needed in combination with a specific other phase, the global optimum may be pruned silently. No warning is emitted when templates are dropped. Savings percentages shown to users may be suboptimal.
- Fix approach: Add a stat `"templates_dropped_by_quota"` to the search stats dict so users can see how aggressively the quota is applying. Consider making `_MAX_TEMPLATES_PER_SUBSET` a user-tunable `SystemConfig` parameter.

**Depth bound off-by-one allows N+1 phases for N streams:**
- Issue: In `smart_feed_v9/search.py` (line 228), the bound is `if depth > N: return float("inf"), []`. Since depth starts at 0 and N is the stream count, this allows depths 0 through N inclusive, meaning N+1 phases. The docstring says "max N phases for N streams."
- Files: `smart_feed_v9/search.py` (line 228)
- Impact: Minor extra recursion in degenerate cases (e.g., a very small residual stream triggering an extra phase). Does not produce incorrect results in practice because the terminal condition (all inventory depleted) catches it first. But the advertised bound does not match the code.
- Fix approach: Change `if depth > N:` to `if depth >= N:` to enforce the documented max-N-phases constraint.

**moisture_pct field collected but ignored in all calculations:**
- Issue: `WasteStream.moisture_pct` is defined in `smart_feed_v9/models.py` (line 31) with comment "display only «A9», not used in calculations." Users enter this value (it appears in input JSON), but it has zero effect on r_water, BTU_eff, or any cost calculation. Real waste moisture content directly affects effective BTU and effective solid content.
- Files: `smart_feed_v9/models.py` (line 31), `input/example_input.json`
- Impact: A waste with 99.5% moisture (AFFF) is treated as having the same solid content as its raw `solid_pct` value, ignoring that moisture already dilutes it. This assumption is labelled «A9» and is intentional for MVP, but users see the field and may assume it affects the result.
- Fix approach: Either remove the field from input forms and models to avoid user confusion, or incorporate it into BTU and solid dilution calculations. Document clearly in the UI that it is display-only.

**Density uniformly assumed 1 kg/L for all waste streams:**
- Issue: Assumption «A8» in CLAUDE.md treats all waste as ρ ≈ 1 kg/L. BTU is in BTU/lb but volume is used for throughput (L). The unit conversion silently assumes 1L = 1kg. High-density sludges or brines may be 1.1–1.4 kg/L; this affects r_water math and cost per liter.
- Files: `smart_feed_v9/gatekeeper.py` (all throughput/cost calculations), `smart_feed_v9/models.py` (no density field)
- Impact: Cost estimates for dense waste streams are systematically understated (fewer liters per kg of waste at higher density). Not exposed to users.
- Fix approach: Add optional `density_kg_L: float = 1.0` field to `WasteStream`. Use it when converting BTU/lb to BTU/L for effective BTU calculations.

**Legacy Streamlit dashboard not removed:**
- Issue: `smartfeed_dashboard.py` (820 lines) is kept "for reference" per CLAUDE.md. It has no tests, duplicates algorithm logic inline, and references an older algorithm interface. It cannot be guaranteed to stay in sync as the algorithm evolves.
- Files: `smartfeed_dashboard.py`
- Impact: Risk of confusion when onboarding new developers. Risk of someone using the Streamlit dashboard and getting different results than the Next.js dashboard. 820 lines of untested, un-maintained code.
- Fix approach: Move it to a `legacy/` directory or delete it if no reference value remains. If kept, add a prominent deprecation notice at the top of the file.

---

## Security Considerations

**No authentication on any Next.js API route:**
- Risk: The three API routes (`/api/optimize`, `/api/input-files`, `/api/load-input`) are open to any request with no auth check, CORS restriction, or rate limiting.
- Files: `dashboard/src/app/api/optimize/route.ts`, `dashboard/src/app/api/input-files/route.ts`, `dashboard/src/app/api/load-input/route.ts`
- Current mitigation: The app is an MVP localhost tool; no production deployment is mentioned in CLAUDE.md.
- Recommendations: If deployed beyond localhost, add at minimum: (1) an API key check via request header, (2) rate limiting on `/api/optimize` since it spawns a subprocess, (3) CORS origin restriction in `next.config.ts`.

**Subprocess spawning from unauthenticated API endpoint:**
- Risk: `/api/optimize` spawns a Python subprocess (`run_optimization.py`) with data received directly from the HTTP request body. If deployed beyond localhost, a malicious actor could send crafted JSON to trigger unexpected Python behavior. No input size limit is enforced on the request body.
- Files: `dashboard/src/app/api/optimize/route.ts` (lines 35–37, 43)
- Current mitigation: MVP localhost context; input is passed to `json.loads()` and then to `WasteStream(**s)` which requires exact field names. The `_validate_streams` function in `smart_feed_v9/__init__.py` (lines 70–96) provides some sanitization.
- Recommendations: Add `Content-Length` or body size limit before parsing. Validate stream count server-side before spawning the subprocess.

**No timeout on the Python subprocess:**
- Risk: The `/api/optimize` API route spawns a Python process with no timeout guard. The 5-stream case takes ~60 seconds per CLAUDE.md benchmarks. Concurrent requests would spawn multiple long-running Python processes. No `proc.kill()` is called if the HTTP connection closes.
- Files: `dashboard/src/app/api/optimize/route.ts` (lines 33–79)
- Current mitigation: None. Next.js default serverless function timeout may apply in deployment but not in local dev.
- Recommendations: Set a `setTimeout` that calls `proc.kill()` after a configurable threshold (e.g., 120s). Return a 504 response to the caller.

---

## Performance Bottlenecks

**5-stream search takes ~60 seconds:**
- Problem: The recursive search with 5 streams exhausts ~60s of CPU per run.
- Files: `smart_feed_v9/search.py`
- Cause: Even with the 30-template quota, the branching factor for 5 streams produces ~785 templates across all subsets. The memoization key uses `round(qty, 0)` which degrades for small inventories (quantities < 10L produce poor cache reuse). The search is single-threaded with no parallelism.
- Improvement path: (1) Reduce `ratio_sum_max` default from 11 to 7–8 for 5-stream cases. (2) Implement beam search as a fallback beyond 4 streams. (3) Parallelize subset pre-computation using `concurrent.futures`. (4) Add a user-configurable time limit with best-so-far result returned on timeout.

**ratio_sum_max=11 produces combinatorial explosion for large n:**
- Problem: `generate_ratios` in `smart_feed_v9/ratios.py` uses `product(range(1, upper+1), repeat=n_streams)` which is O((max_sum)^n). For n=5 and sum=11, upper=7, yielding 7^5 = 16,807 combinations before GCD filtering. All are evaluated during pre-computation even if most will fail feasibility.
- Files: `smart_feed_v9/ratios.py` (lines 38–44), `smart_feed_v9/search.py` (lines 186–192)
- Cause: No early pruning during ratio generation; all ratios are fully enumerated before feasibility checks.
- Improvement path: Generate ratios lazily with early sum-pruning. Use `itertools.combinations_with_replacement` + permutations approach to generate only GCD=1 tuples directly.

---

## Fragile Areas

**Python subprocess bridge — stdout contamination:**
- Files: `run_optimization.py`, `dashboard/src/app/api/optimize/route.ts`
- Why fragile: The bridge relies on `run_optimization.py` writing exactly one JSON object to stdout and nothing else. Any `print()` statement added to the algorithm (e.g., for debugging) would corrupt the stdout stream and cause `JSON.parse` to fail in the API route. The `__main__.py` tee mechanism (lines 228–243) redirects stdout during optimization, but `run_optimization.py` does not; a `verbose=True` call would break the bridge.
- Safe modification: Always pass `verbose=False` when calling `run_optimization()` from `run_optimization.py`. Never add bare `print()` statements to `smart_feed_v9/` modules without guarding them behind `verbose` checks.
- Test coverage: No integration test covers the full Next.js → subprocess → JSON response pipeline.

**`_Tee` stdout redirect in `__main__.py` is not exception-safe:**
- Files: `smart_feed_v9/__main__.py` (lines 228–243)
- Why fragile: `sys.stdout` is replaced with `_Tee` on line 238 and restored on line 243. If `run_optimization()` raises an exception, `sys.stdout` remains as `_Tee` permanently for the process lifetime, breaking all subsequent output. There is no `try/finally` guard.
- Safe modification: Wrap lines 239–242 in `try/finally` with `sys.stdout = _real_stdout` in the `finally` block.
- Test coverage: No test exercises the exception path through `__main__.py`.

**Memo cache with `round(qty, 0)` breaks for small inventories:**
- Files: `smart_feed_v9/search.py` (lines 232–235)
- Why fragile: Rounding to the nearest liter is documented as "negligible for 100L+ inventories." For test cases or real batches with quantities of 1–50L, rounding to 0 decimal places causes significant state merging errors — two inventory states differing by 0.6L are treated as identical, potentially returning a suboptimal cached result.
- Safe modification: Use `round(qty, 1)` (nearest 0.1L) for small inventories, or make the rounding precision adaptive: `round(qty, 0) if qty > 10 else round(qty, 1)`.
- Test coverage: No test uses small-quantity streams to validate memo correctness.

**`calc_phase_cost` returns a wrong `cost_total` if called with `runtime_min = float("inf")`:**
- Files: `smart_feed_v9/gatekeeper.py` (lines 96–121), `smart_feed_v9/baseline.py` (line 46)
- Why fragile: `baseline.py` can produce `runtime_min = float("inf")` when `W = 0`. If this reaches `calc_phase_cost`, the returned dict contains `cost_total = inf`. Python's `json.dumps` serializes `inf` as the non-standard `Infinity` token, which JavaScript's `JSON.parse` rejects with a `SyntaxError`, crashing the API route response. The `run_optimization.py` bridge has no `math.isfinite` guard before serializing.
- Safe modification: In `run_optimization.py`, replace any `float("inf")` values with `null` or a sentinel like `9.99e15` before `json.dumps`. Add a `F_total > 0` validation in `_validate_streams`.
- Test coverage: No test covers the `W = 0` or `runtime = inf` edge case.

---

## Known Bugs

**`phase_to_dict` has dead code comment:**
- Symptoms: `run_optimization.py` function `phase_to_dict` (lines 20–23) contains `# Convert BlendProperties nested dataclass` as a comment but performs no conversion — it just returns `asdict(phase)` which already handles nested dataclasses.
- Files: `run_optimization.py` (lines 20–23)
- Trigger: Not a runtime bug; the code works correctly. The comment is misleading.
- Workaround: Delete the comment or the function entirely and call `asdict(phase)` directly in `schedule_to_dict`.

**Safety check in `phase-details-tab.tsx` hardcodes BTU_diesel and eta:**
- Symptoms: `btuEff` calculation on line 85 of `dashboard/src/components/dashboard/phase-details-tab.tsx` uses literal `18300` and `0.89` instead of `cfg.BTU_diesel` and `cfg.eta`. If a user changes `BTU_diesel` or `eta` via ExpertOverrides, the safety check display will show a different BTU value than what the algorithm actually computed.
- Files: `dashboard/src/components/dashboard/phase-details-tab.tsx` (line 85)
- Trigger: Change `BTU_diesel` or `eta` in the Technical Calibration panel, run optimization, then view Phase Details — the Effective BTU/lb safety check will use the wrong constants.
- Workaround: Replace `18300` with `cfg.BTU_diesel` and `0.89` with `cfg.eta` (both are available from the passed `cfg` prop).

---

## Test Coverage Gaps

**No integration test for the Python ↔ Next.js bridge:**
- What's not tested: The full pipeline from `run_optimization.py` stdin → stdout → JSON.parse in the API route. No test verifies that `asdict()` output matches the TypeScript `OptimizationResult` interface structure.
- Files: `run_optimization.py`, `dashboard/src/app/api/optimize/route.ts`, `dashboard/src/lib/types.ts`
- Risk: Silent type drift between Python dataclasses and TypeScript interfaces causes runtime errors in the dashboard that are invisible until manual testing.
- Priority: High

**No tests for edge cases: single-stream infeasible, all-alkaline input, zero-BTU all streams:**
- What's not tested: Scenarios where all streams have `pH > pH_max` (search returns no feasible phases), or all streams have zero BTU requiring maximum diesel. `build_optimized_schedule` returns `(None, stats)` in these cases — the dashboard displays nothing, but no test verifies this graceful failure path.
- Files: `smart_feed_v9/search.py` (lines 324–327), `tests/test_core.py`
- Risk: UI crash if `result.optimized` is null and a component doesn't null-check before accessing `.phases`.
- Priority: High

**No tests for `ratios.py` GCD deduplication correctness:**
- What's not tested: That `generate_ratios` correctly excludes all non-GCD=1 tuples, and that the ratio count matches expected values for each stream count.
- Files: `smart_feed_v9/ratios.py`, `tests/test_core.py`
- Risk: A regression in ratio generation could silently include duplicate ratios, increasing search time or producing incorrect cost comparisons.
- Priority: Medium

**No tests for `reporter.py`:**
- What's not tested: The 259-line `reporter.py` has zero test coverage. It formats text output using f-strings and arithmetic. A divide-by-zero in `_pct_change` or a formatting bug would only surface during manual CLI runs.
- Files: `smart_feed_v9/reporter.py`, `tests/test_core.py`
- Risk: Report output silently broken after algorithm changes. Low severity since reporter is not in the critical path for the Next.js dashboard.
- Priority: Low

**No tests for `__main__.py` CLI entry point:**
- What's not tested: Argument parsing, config priority (CLI > JSON > defaults), file path resolution, the `_Tee` stdout redirect, and report file saving.
- Files: `smart_feed_v9/__main__.py` (260 lines), `tests/test_core.py`
- Risk: CLI regressions are invisible. The `_Tee` exception-safety bug (see Fragile Areas) would only be caught by a test that exercises the exception path.
- Priority: Medium

---

## Scaling Limits

**Hard limit of 5 waste streams:**
- Current capacity: `_validate_streams` in `smart_feed_v9/__init__.py` (line 75) raises `ValueError` for >5 streams. The 5-stream case already takes ~60 seconds.
- Limit: Exact search becomes computationally infeasible beyond 5 streams.
- Scaling path: For 6+ streams, heuristic approaches are needed: greedy phase construction, simulated annealing, or a genetic algorithm. The current exact search architecture cannot scale without a fundamental algorithm change.

**No request queue or concurrency control on the Next.js API:**
- Current capacity: Each `/api/optimize` request spawns one Python process synchronously (wrapped in a `Promise`).
- Limit: Two concurrent 5-stream optimizations would run two 60-second Python processes simultaneously, consuming ~100% CPU with potential OOM on resource-constrained machines.
- Scaling path: Add a server-side queue (e.g., Redis + BullMQ) or a simple mutex that rejects concurrent optimization requests with a 429 response.

---

## Dependencies at Risk

**No `package-lock.json` version pinning for shadcn/ui components:**
- Risk: shadcn/ui components in `dashboard/src/components/ui/` are hand-installed copies that must be manually regenerated via `npx shadcn`. If the shadcn CLI output changes between regenerations, the existing components (using `@base-ui/react` with non-standard prop names like `multiple` on `Accordion`) may silently break.
- Impact: UI components break after `npx shadcn` regeneration if prop APIs change upstream.
- Migration plan: Document current shadcn version used when components were installed. Treat `src/components/ui/` as a versioned snapshot.

**`axnano-smartfeed` conda environment not reproducible without environment.yml validation:**
- Risk: The entire Python algorithm depends on the `axnano-smartfeed` conda environment. The `getPythonPath()` function in `route.ts` tries four conda distribution paths in order (opt/anaconda3, anaconda3, miniconda3, miniforge3), falling back to system `python3`. If none match and system Python lacks the right packages, optimization silently fails with a 500 error showing a Python import error in `detail`.
- Impact: New developer setup failures. The conda env path lookup is not tested.
- Migration plan: Add a health-check endpoint (e.g., `/api/health`) that verifies the Python path resolves and can `import smart_feed_v9` successfully, returning a clear error message.

---

## Missing Critical Features

**No input validation in the Next.js API before spawning subprocess:**
- Problem: `/api/optimize/route.ts` passes the raw request body directly to `run_optimization.py` stdin without checking stream count, required fields, or value ranges at the HTTP layer. Validation only happens inside Python after subprocess spawn.
- Blocks: Appropriate HTTP 400 responses for bad input; avoids spawning a Python process for clearly invalid requests.

**No way to cancel a running optimization from the UI:**
- Problem: Once the "Run" button is clicked in `manifest-tab.tsx`, there is no cancel mechanism. The `loading` state can only clear on completion or error. For 5-stream cases (~60s), users are blocked with no feedback other than the loading spinner.
- Blocks: User experience for the longest-running inputs; also means the spawned Python process runs to completion even if the browser tab is closed.

**No persistence of optimization results:**
- Problem: Results exist only in React state (`useState` in `page.tsx`). Refreshing the page or navigating away loses all results. There is no export to PDF, CSV, or even JSON from the dashboard.
- Blocks: Sharing results with clients; audit trail for regulatory compliance use cases.

---

*Concerns audit: 2026-03-26*
