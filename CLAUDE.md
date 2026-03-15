# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Multi-phase feed optimization algorithm for SCWO (Supercritical Water Oxidation) reactors. Reduces operating costs by intelligently blending complementary waste streams. Core insight: different wastes have complementary properties (e.g. high BTU + low BTU, acidic + alkaline, solid + liquid); blending significantly reduces external inputs (diesel, NaOH, water), thereby increasing throughput, shortening runtime, and lowering total cost.

MVP prototype, aiming to validate product viability with exact search optimization for ≤5 waste streams.

## Commands

### Python Algorithm (requires `axnano-smartfeed` conda env — Python 3.13)

```bash
# Activate environment
~/miniconda3/bin/conda activate axnano-smartfeed
# Or use the full path: ~/miniconda3/envs/axnano-smartfeed/bin/python

# Run CLI
python -m smart_feed_v9
python -m smart_feed_v9 --input example_input.json
python -m smart_feed_v9 --input example_input.json --F_total 10.5 --eta 0.85

# Run tests
python -m pytest tests/ -v

# Run a single test
python -m pytest tests/test_core.py::test_name -v

# Run the legacy Streamlit dashboard (kept for reference)
streamlit run smartfeed_dashboard.py
```

### Next.js Dashboard (`dashboard/`)

```bash
cd dashboard
npm run dev       # Dev server → http://localhost:3000
npm run build     # Production build (TypeScript check included)
npm run lint      # ESLint
```

### Python → Next.js bridge (used by API route)

```bash
# Test the runner directly
cat input/example_input.json | ~/miniconda3/envs/axnano-smartfeed/bin/python run_optimization.py
```

## Project Structure

```
Smart_feed_optimizaition/          Project root
├── CLAUDE.md
├── pyproject.toml                 pytest configuration
├── environment.yml                conda env: axnano-smartfeed (Python 3.13)
├── run_optimization.py            JSON stdin → optimization → JSON stdout (Next.js bridge)
├── smartfeed_dashboard.py         Legacy Streamlit dashboard (820 lines, kept for reference)
├── input/                         JSON input files (used by both CLI and Next.js)
├── report/                        Auto-generated reports (CLI only)
├── smart_feed_v9/                 Core Python algorithm package
│   ├── models.py                  WasteStream, SystemConfig, BlendProperties, PhaseResult, Schedule
│   ├── blending.py                Blend property calculations
│   ├── gatekeeper.py              Core engine: r_water → r_diesel → r_naoh → W → cost
│   ├── baseline.py                Solo processing cost per stream
│   ├── ratios.py                  Ratio enumeration: GCD=1, sum≤11
│   ├── search.py                  Recursive search with B&B + memoization
│   ├── reporter.py                Formatted report output
│   ├── __init__.py                Public API: run_optimization(), WasteStream, SystemConfig
│   └── __main__.py                CLI entry point
├── tests/
│   ├── conftest.py                pytest path configuration
│   └── test_core.py               23 tests: blending / gatekeeper / search
└── dashboard/                     Next.js 16 + shadcn/ui frontend
    └── src/
        ├── app/
        │   ├── page.tsx           Main page — all state, 5-tab shell
        │   ├── layout.tsx
        │   ├── globals.css        Premium Light theme (slate-50 bg, Ax-Cyan #06B6D4, Ax-Orange #FF8C00)
        │   └── api/
        │       ├── optimize/      POST: spawns run_optimization.py, returns OptimizationResult JSON
        │       ├── input-files/   GET: lists input/*.json
        │       └── load-input/    GET ?file=: reads an input JSON file
        ├── components/
        │   ├── ui/                shadcn/ui components (do not edit manually — regenerate via npx shadcn)
        │   ├── magicui/           Magic UI components (number-ticker, shimmer-button, border-beam, animated-gradient-text)
        │   └── dashboard/
        │       ├── topbar.tsx     Sticky header: wordmark + file picker (fetches /api/input-files)
        │       ├── impact-header.tsx   3 KPI cards: savings %, diesel reduction %, runtime
        │       ├── intro-tab.tsx       Introduction tab: animated hero, blending pairs, how-it-works
        │       ├── manifest-tab.tsx    Waste Streams tab: table + config overrides + Run button
        │       ├── recipe-tab.tsx      Optimization tab: phase cards + cost bar chart
        │       ├── cost-story.tsx      Baseline vs Optimized table + Climate Impact progress bars
        │       ├── operation-tab.tsx   Operation tab: per-phase operator work instructions
        │       ├── phase-details-tab.tsx  Phase Details tab: accordion with blend props, Gatekeeper rates, safety checks
        │       └── expert-overrides.tsx   Technical Calibration section: K-values + phase accordion
        └── lib/
            ├── types.ts           TypeScript mirrors of all Python dataclasses
            └── utils.ts           shadcn cn() utility
```

## Architecture: Python ↔ Next.js Bridge

The Next.js dashboard communicates with the Python algorithm via a subprocess bridge:

```
page.tsx (React state)
  ├── onFileSelect → GET /api/load-input?file=X → reads input/X.json → setStreams + setConfig
  └── onRunClick  → POST /api/optimize {streams, config}
                      └── api/optimize/route.ts
                            └── spawn(python, [run_optimization.py])
                                  stdin:  {streams, config} JSON
                                  stdout: {baseline, optimized, savings_pct, stats, streams, config}
                                  → NextResponse.json(result)
```

The API route resolves the Python executable by checking conda env paths in order:
`~/opt/anaconda3/envs/axnano-smartfeed` → `~/anaconda3/envs/...` → `~/miniconda3/envs/...` → `~/miniforge3/envs/...` → `python3`

`run_optimization.py` at the project root is the bridge script. It takes `{streams, config}` JSON from stdin, constructs `WasteStream` and `SystemConfig` objects, calls `run_optimization(..., verbose=False)`, and serialises the result back to stdout.

## Core Algorithm Flow

1. User provides waste inventory (each stream: ID, quantity, BTU, pH, F ppm, Solid%, Salt ppm, Moisture%)
2. Baseline: process each stream solo, compute total cost as benchmark
3. Pre-compute: evaluate all (subset × ratio) blend properties and Gatekeeper results, filter infeasible combos, store as templates
4. Recursive search: enumerate all feasible multi-phase feed plans (templates × inventory → cost-sorted → B&B pruning → recurse)
5. Select the globally lowest-cost schedule
6. Output: optimal plan + baseline comparison + safety report

## Key Design Decisions

- **r_water computed first**: computation order r_water → BTU_eff → r_diesel → r_naoh eliminates circular dependencies
- **BTU_eff dilution**: `BTU_eff = BTU_blend / (1 + r_water)`, all water addition dilutes BTU
- **pH blending**: uses [H⁺] concentration method `pH = -log10(Σ(10^(-pH_i) × r_i) / Σr_i)`, not linear average
- **r_naoh chemical model**: acid_load(F ppm) - base_load(pH>7) = net_acid → NaOH volume
- **Baseline has no W_min floor**: allows extremely high costs to demonstrate blending optimization value
- **Active threshold 0.5L**: inventory < 0.5L treated as depleted, eliminates degenerate phases from floating-point residuals
- **Ratio order-sensitive**: (1,2) ≠ (2,1), representing different blending schemes
- **Parameter priority**: CLI > JSON config > SystemConfig defaults

## Safety Check Formula (Phase Details tab)

Effective values **after ALL additives** (water + diesel + NaOH):
- Solid/Salt dilution: `value / (1 + r_water + r_diesel + r_naoh)`
- BTU effective: `BTU_blend / (1 + r_water) + r_diesel × BTU_diesel × η`
- Checks: `solid_eff ≤ solid_max_pct`, `salt_eff ≤ salt_max_ppm`, `W ≥ W_min`, `pH_min ≤ pH ≤ pH_max`

## Search Strategy

- **Bound 1**: ratio sum ≤ ratio_sum_max (default 11)
- **Bound 2**: GCD = 1 (remove proportionally-scaled duplicates)
- **Bound 3**: depth ≤ N streams
- **Prune 1**: pH > pH_max or W < W_min → filtered during pre-computation
- **Prune 2**: phase.cost ≥ best_sub_cost → local B&B pruning
- **Template quota**: 30 lowest cost_per_batch templates per subset
- **Integer memo**: `round(qty, 0)` merges nearby inventory states

### Performance Benchmarks

| Input | Time | Savings |
|-------|------|---------|
| 3 streams | 0.01s | ~47% |
| 4 streams | 0.8s | ~36% |
| 5 streams | ~60s | ~41% |

## Next.js Dashboard Design System

**Theme:** Premium Light — `bg-slate-50` page, `bg-white` cards, `#E2E8F0` borders.
**Brand colors:** Ax-Cyan `#06B6D4` (success/optimized metrics), Ax-Orange `#FF8C00` (CTA buttons, alerts).
**Typography:** Inter (body), JetBrains Mono for all numeric data values (use `font-data` class).
**shadcn/ui** uses `@base-ui/react` under the hood — the `Accordion` component uses `multiple` (not `type="multiple"`), and `Select.onValueChange` receives `string | null`.
**Magic UI components** in `src/components/magicui/` are hand-written copies, not npm packages — edit them directly.

## Parameters Pending Fitting

Three K values need calibration from operational data (current values are theoretical estimates):
- `K_F_TO_ACID = 0.053` — F ppm → acid equivalent (meq/L·ppm)
- `K_PH_TO_BASE = 50.0` — pH base contribution (meq/L·pH_unit)
- `K_ACID_TO_NAOH_VOL = 8.28e-5` — acid → NaOH volume (L/meq)

## Unit Conventions

- Volume: L | Flow rate: L/min | Time: internal min, output converted to hr
- Heat value: BTU/lb | Mass: assumes ρ ≈ 1 kg/L «A8»
- Cost: $ | Power: kW

## References

- v9 flowchart: smart_feed_flowchart_v9.html (complete algorithm architecture diagram)
- 9 MVP assumptions labeled «A1»–«A9» throughout all code comments
