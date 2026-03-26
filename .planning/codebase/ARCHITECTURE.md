# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Dual-runtime pipeline with subprocess bridge — Python optimization core + Next.js presentation layer

**Key Characteristics:**
- Python algorithm runs as an isolated subprocess; Next.js never imports Python directly
- All state lives in `dashboard/src/app/page.tsx` (React); child components are purely presentational
- Python package `smart_feed_v9` exposes a single public entry point: `run_optimization()` in `smart_feed_v9/__init__.py`
- Config follows a strict priority chain: CLI flags > JSON file overrides > `SystemConfig` defaults

## Layers

**Data Models:**
- Purpose: Define all shared data structures; no logic
- Location: `smart_feed_v9/models.py`
- Contains: `WasteStream`, `SystemConfig`, `BlendProperties`, `PhaseResult`, `Schedule` dataclasses
- Depends on: Python standard library only
- Used by: every other Python module

**Blend Properties:**
- Purpose: Compute mixed waste stream properties from constituent streams and volume ratios
- Location: `smart_feed_v9/blending.py`
- Contains: `blend_linear()`, `blend_pH()`, `calc_blend_properties()`
- Depends on: `models.py`
- Used by: `gatekeeper.py`, `search.py`

**Gatekeeper Engine:**
- Purpose: Compute external input demand rates (r_water, r_diesel, r_naoh) and waste throughput W; calculate per-phase cost
- Location: `smart_feed_v9/gatekeeper.py`
- Contains: `calc_r_water()`, `calc_r_diesel()`, `calc_r_naoh()`, `gatekeeper()`, `calc_throughput()`, `calc_phase_cost()`, `evaluate_phase()`
- Depends on: `models.py`, `blending.py`
- Used by: `baseline.py`, `search.py`

**Ratio Enumerator:**
- Purpose: Generate all valid integer blending ratios (GCD=1, sum ≤ max)
- Location: `smart_feed_v9/ratios.py`
- Contains: `generate_ratios()`, `ratio_stats()`
- Depends on: Python standard library only
- Used by: `search.py`

**Baseline Calculator:**
- Purpose: Compute solo (no-blending) processing cost for each stream as benchmark
- Location: `smart_feed_v9/baseline.py`
- Contains: `calc_baseline()`
- Depends on: `models.py`, `gatekeeper.py`
- Used by: `smart_feed_v9/__init__.py` (run_optimization)

**Search Engine:**
- Purpose: Enumerate all feasible multi-phase feed plans; find globally optimal (minimum cost) schedule via B&B with memoization
- Location: `smart_feed_v9/search.py`
- Contains: `_PhaseTemplate` dataclass, `_precompute_templates()`, `search()`, `build_optimized_schedule()`
- Depends on: `models.py`, `blending.py`, `gatekeeper.py`, `ratios.py`
- Used by: `smart_feed_v9/__init__.py` (run_optimization)

**Reporter:**
- Purpose: Format and print human-readable optimization reports to stdout
- Location: `smart_feed_v9/reporter.py`
- Contains: `full_report()`, `report_streams()`, `report_config()`, `report_baseline()`, `report_optimized()`, `report_comparison()`, `report_safety()`
- Depends on: `models.py`
- Used by: `smart_feed_v9/__init__.py` (run_optimization, verbose=True mode), `smart_feed_v9/__main__.py`

**Public API / Orchestrator:**
- Purpose: Wire all pipeline steps together; expose a single callable to callers
- Location: `smart_feed_v9/__init__.py`
- Contains: `run_optimization()`, `_validate_streams()`
- Depends on: all sub-modules
- Used by: `run_optimization.py` (bridge), `smart_feed_v9/__main__.py` (CLI)

**CLI Entry Point:**
- Purpose: Argparse wrapper; loads JSON input, builds config with priority merge, invokes run_optimization, saves report file
- Location: `smart_feed_v9/__main__.py`
- Contains: `main()`, `resolve_input_path()`, `load_from_json()`, `build_config()`
- Depends on: `smart_feed_v9/__init__.py`
- Used by: `python -m smart_feed_v9`

**Subprocess Bridge:**
- Purpose: JSON stdin → Python optimization → JSON stdout; lets Next.js invoke Python without a persistent server
- Location: `run_optimization.py` (project root)
- Contains: `main()`, `schedule_to_dict()`, `phase_to_dict()`
- Depends on: `smart_feed_v9/__init__.py`
- Used by: `dashboard/src/app/api/optimize/route.ts`

**Next.js API Routes:**
- Purpose: HTTP surface for the frontend; thin wrappers — no business logic
- Location: `dashboard/src/app/api/`
  - `optimize/route.ts`: POST — spawns `run_optimization.py` subprocess, streams stdin/stdout
  - `input-files/route.ts`: GET — lists `input/*.json` files
  - `load-input/route.ts`: GET `?file=` — reads and returns a named `input/*.json`
- Depends on: Node.js `child_process`, `fs`; Python subprocess
- Used by: `dashboard/src/app/page.tsx`

**Next.js Frontend:**
- Purpose: React UI; all application state owned here; child components are pure/presentational
- Location: `dashboard/src/app/page.tsx`
- Contains: 7 pieces of state (`selectedFile`, `streams`, `config`, `result`, `loading`, `showTechnical`, `activeTab`), `handleRun`, `handleConfigChange`
- Depends on: all dashboard components, `lib/types.ts`
- Used by: Next.js App Router (root page)

**Dashboard Components:**
- Purpose: Presentational — receive props, render UI panels
- Location: `dashboard/src/components/dashboard/`
  - `topbar.tsx`: sticky header; fetches `/api/input-files` on mount; file picker
  - `impact-header.tsx`: 3 KPI cards (savings %, diesel reduction, runtime)
  - `intro-tab.tsx`: animated introduction, blending pairs, how-it-works
  - `manifest-tab.tsx`: waste stream table, config overrides, Run button
  - `recipe-tab.tsx`: phase cards + cost bar chart
  - `cost-story.tsx`: Baseline vs Optimized table + Climate Impact bars
  - `operation-tab.tsx`: per-phase operator instructions
  - `phase-details-tab.tsx`: accordion with blend props, Gatekeeper rates, safety checks
  - `expert-overrides.tsx`: K-value calibration + phase accordion

**TypeScript Types:**
- Purpose: Mirror all Python dataclasses exactly; no logic
- Location: `dashboard/src/lib/types.ts`
- Contains: `WasteStream`, `SystemConfig`, `DEFAULT_CONFIG`, `BlendProperties`, `PhaseResult`, `Schedule`, `OptimizationResult`, `InputFile` interfaces
- Depends on: nothing
- Used by: all dashboard components and API routes

## Data Flow

**File Load Flow:**

1. User selects file in `topbar.tsx` → calls `onFileChange` prop
2. `page.tsx` `useEffect` on `selectedFile` fires → `GET /api/load-input?file=X`
3. `load-input/route.ts` reads `input/X.json` from filesystem, returns JSON
4. `page.tsx` sets `streams` + merges `config` with `DEFAULT_CONFIG`
5. `activeTab` switches to `"manifest"` automatically

**Optimization Run Flow:**

1. User clicks Run in `manifest-tab.tsx` → calls `onRun` prop
2. `page.tsx.handleRun` → `POST /api/optimize` with `{streams, config}` body
3. `optimize/route.ts` locates Python executable (conda env probe), spawns `run_optimization.py`
4. `run_optimization.py` reads stdin JSON → constructs `WasteStream` + `SystemConfig` objects → calls `run_optimization(verbose=False)`
5. Python pipeline: `calc_baseline()` → `build_optimized_schedule()` (pre-compute templates → recursive B&B search) → savings calc
6. `run_optimization.py` serializes result with `dataclasses.asdict()` → prints JSON to stdout
7. `optimize/route.ts` collects stdout, parses JSON, returns `NextResponse.json(result)`
8. `page.tsx` sets `result` state → all result-dependent components re-render

**Python Algorithm Internal Flow:**

1. Input validation (`_validate_streams`)
2. Baseline: each stream processed solo through Gatekeeper → `Schedule`
3. Pre-computation: all (subset × ratio) combos evaluated; infeasible filtered; top-30 per subset kept as `_PhaseTemplate` objects
4. Recursive search (`_search`): inventory state → collect candidate templates → sort by cost → B&B prune → recurse on remaining inventory → memo cache
5. Assemble optimal `Schedule` from `best_phases`
6. Return `{baseline, optimized, stats, savings_pct}`

**Gatekeeper Computation Order (critical, single-pass, no circular deps):**

1. `r_water` = max(solid dilution requirement, salt dilution requirement)
2. `BTU_eff` = `BTU_blend / (1 + r_water)` — water dilutes heat value
3. `r_diesel` = max(0, (BTU_target - BTU_eff) / (BTU_diesel × η))
4. `r_naoh` = (F_ppm × K_F_TO_ACID − max(0, pH−7) × K_PH_TO_BASE) × K_ACID_TO_NAOH_VOL
5. `W` = `F_total / (1 + r_water + r_diesel + r_naoh)`

**State Management:**
- All React state lives in `page.tsx` and flows down via props; no context or global store
- Python state is purely functional; no global mutable state; memoization dict scoped per `search()` call

## Key Abstractions

**WasteStream:**
- Purpose: Raw user-provided waste properties — the problem input
- Examples: `smart_feed_v9/models.py` line 19, `dashboard/src/lib/types.ts` line 4
- Pattern: Python dataclass / TypeScript interface mirror

**SystemConfig:**
- Purpose: All tunable reactor parameters with defaults; separates concerns from waste data
- Examples: `smart_feed_v9/models.py` line 39, `dashboard/src/lib/types.ts` line 15
- Pattern: Python dataclass with grouped fields and comments; TypeScript interface + `DEFAULT_CONFIG` constant

**PhaseResult:**
- Purpose: Complete result for a single feed phase — blend props, all rates, runtime, itemized costs
- Examples: `smart_feed_v9/models.py` line 109
- Pattern: Python dataclass; TypeScript interface mirrors it exactly

**Schedule:**
- Purpose: Ordered list of PhaseResults representing a complete feed plan
- Examples: `smart_feed_v9/models.py` line 130
- Pattern: Python dataclass with `total_runtime_hr` computed property

**_PhaseTemplate (internal):**
- Purpose: Inventory-independent pre-computed phase data enabling O(1) cost lookup during search
- Examples: `smart_feed_v9/search.py` line 51
- Pattern: Private dataclass; `cost_per_batch` allows search cost = `num_batches × cost_per_batch`

## Entry Points

**CLI:**
- Location: `smart_feed_v9/__main__.py`
- Triggers: `python -m smart_feed_v9 [--input FILE] [--param VALUE ...]`
- Responsibilities: parse args, load JSON, build config, run optimization, print + save report

**Subprocess Bridge:**
- Location: `run_optimization.py`
- Triggers: spawned by `dashboard/src/app/api/optimize/route.ts` with JSON on stdin
- Responsibilities: deserialize input, run optimization silently, serialize all results to stdout as JSON

**Next.js Root Page:**
- Location: `dashboard/src/app/page.tsx`
- Triggers: browser HTTP request → Next.js App Router
- Responsibilities: own all UI state, coordinate file loading and optimization requests, render tab layout

**Next.js API Routes:**
- Location: `dashboard/src/app/api/optimize/route.ts`, `input-files/route.ts`, `load-input/route.ts`
- Triggers: HTTP POST/GET from `page.tsx`
- Responsibilities: filesystem access (input files), Python subprocess management

## Error Handling

**Strategy:** Fail-fast with explicit error propagation; no silent suppression

**Patterns:**
- Python: `ValueError`/`TypeError` raised in `_validate_streams`; propagates through bridge as non-zero exit code + stderr
- Bridge: non-zero exit → `NextResponse.json({error, detail}, {status: 500})`
- Frontend: try/catch in `handleRun`; sets `error` state string; shown in red banner in `page.tsx`; reverts `activeTab` to `"manifest"` on failure
- Infeasible phases: `evaluate_phase()` returns `None` (not an exception); filtered silently during pre-computation
- Baseline intentionally allows `W → 0` (extremely high cost) to demonstrate blending value

## Cross-Cutting Concerns

**Logging:** Python uses `print()` to stdout for CLI reports; bridge uses `verbose=False` so no stdout pollution
**Validation:** Input validation in `smart_feed_v9/__init__.py:_validate_streams()`; API route does no independent validation (delegates to Python)
**Authentication:** None — local-use MVP prototype
**Config priority:** Enforced in `smart_feed_v9/__main__.py:build_config()`: CLI > JSON > SystemConfig defaults; bridge applies JSON overrides only via `SystemConfig(**cfg_overrides)`

---

*Architecture analysis: 2026-03-26*
