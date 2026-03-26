# Domain Pitfalls

**Domain:** SCWO feed optimization demo product for academic/customer audiences
**Researched:** 2026-03-26
**Overall confidence:** MEDIUM-HIGH (based on codebase analysis + domain knowledge; no live web verification available)

---

## Critical Pitfalls

Mistakes that destroy credibility with professors/reviewers, cause live demo failures, or produce misleading results.

### Pitfall 1: Presenting K-value outputs as validated results

**What goes wrong:** The dashboard shows specific dollar savings (e.g., "$2,847 saved") and percentage reductions computed from three uncalibrated K-values (K_F_TO_ACID, K_PH_TO_BASE, K_ACID_TO_NAOH_VOL). A chemistry professor sees a precise number and asks "where does that come from?" The answer -- "theoretical stoichiometry estimates" -- immediately undermines every number on screen. The entire product loses credibility in one question.

**Why it happens:** The algorithm produces precise outputs from imprecise inputs. The UI displays these outputs at face value because it was built for correctness testing, not for communicating uncertainty. Developers naturally display what the algorithm returns.

**Consequences:** Academic reviewers conclude the team does not understand the difference between a model and a calibrated model. Customers who are SCWO operators know from experience that NaOH consumption varies significantly with waste composition -- a precise prediction from uncalibrated constants reads as ignorance, not sophistication.

**Prevention:**
1. Every screen showing NaOH cost or savings must display a visible confidence indicator (e.g., "Estimated -- pending calibration" badge, or a confidence band around the number)
2. Create a dedicated "Model Assumptions" panel that is easy to find (not hidden in expert settings) showing each K-value, its derivation method, and what data would be needed to calibrate it
3. Frame the product narrative as "directional optimization" not "precise cost prediction" -- the value is in the ranking of blend strategies, not the absolute dollar figure
4. In the landing page / intro, proactively state: "Current model uses engineering estimates for chemical constants. Absolute costs are approximate; relative comparisons between strategies are robust."

**Detection:** If any UI screen shows a dollar value without a qualifier about calibration status, this pitfall is active. If a professor can ask "how accurate is this?" and the UI provides no answer, this pitfall is active.

**Phase relevance:** Must be addressed in the dashboard redesign phase and the chemistry validation framework phase simultaneously.

---

### Pitfall 2: Jargon removal that silently changes meaning

**What goes wrong:** Renaming `r_water` to "water added" seems safe, but `r_water` is a dimensionless ratio (liters water per liter waste feed), not an absolute volume. If the UI says "Water Added: 2.3" a non-technical user reads "2.3 liters of water" when it actually means "2.3 liters of water per liter of waste." An operator following this instruction adds the wrong amount of water. Similarly, renaming "BTU/lb" to "energy content" without the unit loses the physical meaning -- energy content could be kJ/kg, cal/g, or MJ/m3.

**Why it happens:** The jargon elimination list in PROJECT.md maps technical terms to plain English without specifying how units and dimensionality will be communicated. The person doing the renaming is a designer or developer, not a chemical engineer, and treats this as a label-swap exercise.

**Consequences:** At best, a professor notices the unit confusion and marks it as sloppy. At worst, an operator makes a real dosing error because the UI said "water added: 2.3" without specifying "per liter of waste feed." In the SCWO context, wrong water dosing changes effective BTU and can cause thermal runaway or flame-out.

**Prevention:**
1. Every renamed label must preserve the unit. "Water Added" becomes "Water ratio (L per L waste)" or "Water: 2.3x feed volume"
2. Create a two-column review table: old label | new label | unit | does a non-expert still understand the physical quantity? Have a chemistry-literate person sign off on each row
3. For operator instructions specifically, convert ratios to absolute volumes using the known batch size: "Add 23L of water to the 10L feed" -- operators need actionable amounts, not ratios
4. Keep the ratio notation available in the Phase Details / expert view as a toggle

**Detection:** Pick any number on any screen. Can a non-expert answer: "2.3 what?" If the answer requires clicking elsewhere or reading documentation, the label is incomplete.

**Phase relevance:** Must be addressed during jargon elimination, before the dashboard redesign is finalized.

---

### Pitfall 3: Demo crashes on live edge cases

**What goes wrong:** During a live presentation to professors or customers, someone enters unusual but realistic waste data (e.g., extremely acidic waste pH=1, or zero-BTU aqueous waste, or all streams identical). The algorithm returns `float("inf")` for runtime, the JSON bridge serializes `Infinity`, JavaScript's `JSON.parse` throws a `SyntaxError`, and the dashboard shows a blank error state or crashes entirely.

**Why it happens:** The CONCERNS.md documents this exact bug: `calc_phase_cost` can return `cost_total = inf` when `W = 0`, and `run_optimization.py` has no `math.isfinite` guard. Additionally, the search can return `(None, stats)` for all-infeasible inputs, and no test verifies the dashboard handles null `optimized` results. The 23 tests cover the happy path but not adversarial or edge-case inputs.

**Consequences:** A live crash in front of professors or customers is the single most damaging demo event. It communicates "this is not production-ready" more powerfully than any feature deficit. Professors will remember the crash, not the 47% savings number.

**Prevention:**
1. Fix the `float("inf")` serialization bug in `run_optimization.py` before any demo -- replace inf/nan with null or a sentinel, add `math.isfinite` guards
2. Add null-safety to every dashboard component that accesses `result.optimized.phases` -- if optimized is null, show a graceful "No feasible blend found" message
3. Build a "demo safety harness": a curated set of 3-4 input files that are pre-tested and known to produce good results. During live demos, use only these inputs
4. Add a pre-flight validation step: before spawning the subprocess, check that at least one stream has BTU > 0, that not all streams exceed pH_max, and that total quantity > W_min
5. Add a subprocess timeout (120s) with a user-facing message: "Optimization is taking longer than expected. Try with fewer streams."
6. Test the exact demo scenario end-to-end on the exact machine that will be used for the presentation, the morning of the presentation

**Detection:** Run `echo '{"streams":[{"id":"X","quantity":100,"btu_per_lb":0,"pH":2.0,"f_ppm":5000,"solid_pct":0.5,"salt_ppm":100,"moisture_pct":99}],"config":{}}' | python run_optimization.py` and see if valid JSON comes back. If it does not, this pitfall is active.

**Phase relevance:** The serialization bugs must be fixed before any demo phase. The safety harness should be part of demo preparation.

---

### Pitfall 4: The 60-second wait kills live demos

**What goes wrong:** A presenter loads 5 waste streams and clicks "Run Optimization." The audience watches a spinner for 60 seconds. In a live setting, 60 seconds of silence is excruciating. The presenter fills time with awkward narration. The audience checks their phones. The demo's momentum is destroyed.

**Why it happens:** The exact search for 5 streams is O(exponential) and takes ~60s on typical hardware. There is no progress indicator, no partial results, no way to cancel, and no pre-computed cache.

**Consequences:** Even if the algorithm produces impressive results, the wait undermines the "smart, modern product" impression the demo is trying to create. Professors evaluating the product's design thinking will note the UX failure.

**Prevention:**
1. Pre-compute results for all demo input files and cache them. When the user loads a demo file and clicks Run, return the cached result instantly. Only fall back to live computation for custom inputs
2. If live computation is needed, show a multi-stage progress indicator: "Analyzing waste properties... Computing baselines... Searching blend strategies... (this may take up to 60 seconds for 5 streams)"
3. For the demo specifically, use 3-stream or 4-stream examples (0.01s and 0.8s respectively) -- the savings percentages are equally impressive
4. Consider adding a "Quick mode" flag that reduces `ratio_sum_max` from 11 to 7 or lowers the template quota, trading optimality for speed

**Detection:** Time the Run button click-to-result on the demo machine with the demo input file. If it exceeds 5 seconds, this pitfall will manifest.

**Phase relevance:** Pre-computed cache should be part of the demo preparation phase. Progress indicators belong in the dashboard redesign phase.

---

### Pitfall 5: pH_min not enforced -- corrosive blends pass safety checks

**What goes wrong:** The algorithm declares a blend of highly acidic wastes (e.g., pH 2-3) as "feasible" and produces operating instructions for it. An operator following these instructions feeds corrosive material into the reactor. A professor reviewing the Phase Details tab notices the blend pH is 3.5 but the safety check shows a green checkmark.

**Why it happens:** CONCERNS.md documents this: `gatekeeper.py` and `search.py` only check `blend.pH > cfg.pH_max` (upper bound). The lower bound `pH_min = 6.0` defined in `SystemConfig` is never enforced. The safety check display in `phase-details-tab.tsx` may or may not check the lower bound.

**Consequences:** If shown to a chemistry professor or SCWO operator, a "safe" label on a pH-3.5 feed is a credibility-destroying error. It signals the team does not understand SCWO corrosion chemistry. In a real deployment scenario, this is a physical safety hazard.

**Prevention:**
1. Add `or blend.pH < cfg.pH_min` to the feasibility check in `gatekeeper.py` line 137 and `search.py` line 117 -- this is a one-line fix
2. Add a test case with all-acidic streams (pH < 6) and verify the search returns no feasible phases or adds sufficient NaOH
3. Ensure the Phase Details safety check UI shows pH with both min and max bounds: "pH 7.2 [6.0 - 9.0] PASS"

**Detection:** Create an input file with all streams at pH 3.0. If the algorithm returns feasible phases, this pitfall is active.

**Phase relevance:** Must be fixed before any demo. This is a correctness bug, not a UX issue.

---

## Moderate Pitfalls

### Pitfall 6: Savings percentages imply precision the model cannot deliver

**What goes wrong:** The KPI header shows "47% cost savings" as a large, prominent number. A customer reads this as a promise. A professor asks for the confidence interval. Neither gets a satisfying answer because the 47% is computed from uncalibrated K-values and assumption A8 (density = 1 kg/L for all wastes).

**Prevention:**
1. Show savings as a range: "35-55% estimated savings" rather than a single number, or qualify with "based on engineering estimates"
2. Separate the savings components: diesel savings (HIGH confidence -- driven by BTU blending which is well-modeled) vs NaOH savings (LOW confidence -- driven by uncalibrated K-values). This is more honest and actually more impressive -- the diesel savings alone tell a compelling story
3. In the landing page narrative, lead with the mechanism ("blending reduces external inputs") not the number

**Detection:** If any KPI shows an unqualified percentage, this pitfall is active.

**Phase relevance:** Dashboard redesign and landing page phases.

---

### Pitfall 7: The "story-first" redesign loses the verification layer

**What goes wrong:** The current dashboard exposes algorithm internals (r_water, BTU_eff, Gatekeeper) which is bad UX for non-experts, but it IS what a technical reviewer needs to verify the algorithm is correct. The redesign strips all of this in favor of a clean narrative. A professor who wants to check the math cannot. A customer's process engineer cannot verify the plan is safe.

**Prevention:**
1. Implement progressive disclosure: the default view is story-first (problem, solution, savings). A "Technical Details" toggle reveals the full algorithm output
2. The Phase Details tab should remain in the dashboard but be reachable, not the default landing
3. For the Expert Overrides / Technical Calibration section, keep all K-values visible and editable -- this is a feature for the professor audience, not a bug
4. Ensure every formula used in the algorithm is documented in an accessible place (an "About the Model" page or expandable section)

**Detection:** After the redesign, can a chemical engineer verify the r_water, r_diesel, r_naoh values for each phase? If not, the verification layer has been lost.

**Phase relevance:** Dashboard redesign phase -- must be designed in, not bolted on after.

---

### Pitfall 8: Hardcoded constants in the UI diverge from algorithm

**What goes wrong:** The phase-details-tab.tsx already has this bug: `btuEff` is computed with hardcoded `18300` and `0.89` instead of using `cfg.BTU_diesel` and `cfg.eta`. When the Expert Overrides panel lets users change these values, the safety check display shows wrong numbers. A professor tweaks BTU_diesel to 17000, sees the algorithm adapt, but the safety check still shows 18300-based values.

**Prevention:**
1. Fix the existing hardcoded values (line 85 of phase-details-tab.tsx) to use cfg properties
2. Establish a rule: the UI must NEVER perform its own physics calculations with hardcoded constants. All displayed values must either come from the algorithm's JSON output or use config values passed from the same source
3. Add an integration test that changes BTU_diesel in config, runs the optimization, and verifies the frontend safety check formula produces the same result as the algorithm

**Detection:** Change any K-value or config parameter in Expert Overrides, run optimization, and compare the Phase Details display against the algorithm's raw output. Any mismatch means hardcoded constants are present.

**Phase relevance:** Should be fixed during the chemistry validation framework phase, before the demo.

---

### Pitfall 9: Moisture field creates false confidence

**What goes wrong:** The input form collects `moisture_pct` for each waste stream. Users carefully enter accurate moisture data (e.g., AFFF at 99.5%). The algorithm completely ignores this field (assumption A9 -- "display only"). A knowledgeable user expects moisture to affect BTU calculations (wet waste has lower effective BTU) and dilution calculations. When it does not, they either conclude the algorithm is wrong or they distrust all the other inputs too.

**Prevention:**
1. If moisture is not used in calculations, do not collect it in the input form. Remove it from the waste stream table
2. If it must be shown for informational purposes, gray it out with a tooltip: "Recorded for reference. Not currently used in optimization calculations."
3. If it is shown, do NOT place it alongside BTU, pH, and other calculation-driving fields -- visually separate it

**Detection:** Look at the input form. Can a user tell which fields affect the optimization and which are display-only? If all fields look the same, this pitfall is active.

**Phase relevance:** Manifest tab redesign, part of the jargon elimination phase.

---

### Pitfall 10: Demo only works on the developer's machine

**What goes wrong:** The Python-Next.js bridge depends on a specific conda environment path (`~/miniconda3/envs/axnano-smartfeed/bin/python`). The API route tries four conda distribution paths. On the demo laptop (which might be a different machine, or freshly set up), the conda environment is missing or at a different path. The Run button returns a 500 error.

**Prevention:**
1. Test the full pipeline on the exact machine and user account that will be used for the demo
2. Add a health-check endpoint (`/api/health`) that verifies the Python path resolves, the conda env has the right packages, and `import smart_feed_v9` succeeds
3. On dashboard load, silently call the health check and show a warning banner if the Python backend is not available
4. Document a "demo setup checklist" that includes: install conda env, verify `echo '{}' | python run_optimization.py` works, run `npm run build` successfully

**Detection:** Open the dashboard on a different machine or user account. Click Run. If it fails, this pitfall is active.

**Phase relevance:** Demo preparation phase -- must be verified before every presentation.

---

## Minor Pitfalls

### Pitfall 11: Baseline "no W_min floor" produces misleadingly high solo costs

**What goes wrong:** The baseline (solo processing) has no W_min floor, which means solo processing of a bad stream can produce an astronomically high cost. This inflates the savings percentage, making the optimization look more impressive than it is. A savvy reviewer notices that the baseline cost for a single stream is unrealistically high and questions the entire comparison.

**Prevention:**
1. Add a note in the cost comparison view: "Baseline assumes each waste processed individually without blending. Some solo costs are very high because the waste requires significant supplementation."
2. Consider adding W_min to baseline calculations as an option, so the comparison is more conservative (and more credible)

**Phase relevance:** Cost story tab redesign.

---

### Pitfall 12: Number formatting inconsistency erodes perceived quality

**What goes wrong:** Some numbers show 2 decimal places, others show 6. Dollars show cents but ratios show many digits. In a "premium Apple-like aesthetic," inconsistent number formatting signals a student project, not a professional product.

**Prevention:**
1. Define a formatting standard: dollars to 2 decimals, percentages to 1 decimal, ratios to 2 decimals, volumes to 1 decimal
2. Use a single formatting utility function across all dashboard components
3. Apply `font-data` (JetBrains Mono) consistently to all numeric values

**Phase relevance:** Dashboard redesign phase.

---

### Pitfall 13: Template quota silently hides suboptimality

**What goes wrong:** The 30-template-per-subset quota silently drops solutions. The search reports savings of 41% but might have found 44% without the quota. If a professor asks "is this the global optimum?" the honest answer is "probably, but we cannot guarantee it" -- but the UI implies certainty.

**Prevention:**
1. Add a "templates evaluated" / "templates pruned" stat to the results output
2. If templates were pruned, show a subtle indicator: "Near-optimal result (785 of 1,200 strategies evaluated)"
3. Do NOT claim "optimal" in the UI -- use "best found" or "recommended"

**Phase relevance:** Dashboard redesign and landing page copy.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Landing page | Overpromising savings precision (Pitfall 6) | Frame as "directional optimization," lead with mechanism not numbers |
| Dashboard redesign | Losing verification layer (Pitfall 7), unit confusion from jargon removal (Pitfall 2) | Progressive disclosure pattern, unit-aware label review |
| Jargon elimination | Changing meaning while changing words (Pitfall 2), moisture field confusion (Pitfall 9) | Chemistry-literate sign-off on every renamed label |
| Chemistry validation framework | K-value presentation to professors (Pitfall 1), hardcoded constants (Pitfall 8) | Assumption badges on every derived number, eliminate all hardcoded physics constants from UI |
| Operator view | Ratios instead of absolute volumes (Pitfall 2) | Convert all ratios to batch-specific absolute volumes in operator instructions |
| Demo preparation | 60-second wait (Pitfall 4), edge case crash (Pitfall 3), machine portability (Pitfall 10) | Pre-computed cache, curated inputs, health check, rehearsal on demo machine |
| pH safety enforcement | Corrosive blends passing safety (Pitfall 5) | One-line code fix, must be done before any demo |

---

## Pre-Demo Checklist (Synthesized from all pitfalls)

These items must be verified true before any live demo:

- [ ] pH_min enforcement fix applied (Pitfall 5)
- [ ] `float("inf")` serialization bug fixed (Pitfall 3)
- [ ] Null optimized result handled gracefully in all dashboard components (Pitfall 3)
- [ ] Hardcoded BTU_diesel/eta in phase-details-tab.tsx fixed (Pitfall 8)
- [ ] Demo input files pre-tested and cached (Pitfall 4)
- [ ] Full pipeline tested on demo machine (Pitfall 10)
- [ ] All displayed K-value-dependent numbers have calibration status indicators (Pitfall 1)
- [ ] No label says a bare number without a unit (Pitfall 2)

---

## Sources

- Codebase analysis: `smart_feed_v9/models.py`, `smart_feed_v9/gatekeeper.py`, `smart_feed_v9/search.py`
- `.planning/codebase/CONCERNS.md` (2026-03-26 audit) -- documented bugs and fragile areas
- `.planning/PROJECT.md` -- audience requirements and jargon elimination list
- `CLAUDE.md` -- algorithm design decisions, assumptions A1-A9, performance benchmarks
- `dashboard/src/components/dashboard/phase-details-tab.tsx` line 85 -- confirmed hardcoded constants
- Domain knowledge: SCWO reactor operation, academic review conventions, industrial demo best practices (MEDIUM confidence -- based on training data, not verified against live sources)
