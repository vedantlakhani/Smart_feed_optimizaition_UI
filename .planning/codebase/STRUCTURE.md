# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
Smart_feed_optimizaition/          Project root
├── CLAUDE.md                      Project instructions for Claude Code
├── pyproject.toml                 pytest configuration
├── environment.yml                conda env: axnano-smartfeed (Python 3.13)
├── run_optimization.py            JSON stdin → optimization → JSON stdout (Next.js bridge)
├── smartfeed_dashboard.py         Legacy Streamlit dashboard (820 lines, reference only)
├── question.md                    Working notes / Q&A
├── input/                         JSON input files shared by CLI and Next.js
│   ├── example_input.json         Default 3-stream example
│   ├── test_4streams.json
│   └── test_5streams.json
├── report/                        Auto-generated .txt reports (CLI only, not committed)
├── smart_feed_v9/                 Core Python algorithm package
│   ├── __init__.py                Public API: run_optimization(), all dataclasses
│   ├── __main__.py                CLI entry point (python -m smart_feed_v9)
│   ├── models.py                  All data structures (WasteStream, SystemConfig, etc.)
│   ├── blending.py                Blend property math
│   ├── gatekeeper.py              Core engine: rates → throughput → cost
│   ├── baseline.py                Solo (no-blend) cost benchmark
│   ├── ratios.py                  Integer ratio enumeration
│   ├── search.py                  Recursive B&B search + memoization
│   └── reporter.py                CLI report formatting and printing
├── tests/
│   ├── conftest.py                pytest path setup
│   └── test_core.py               23 unit + integration tests
├── dashboard/                     Next.js 16 frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── public/                    Static assets
│   └── src/
│       ├── app/
│       │   ├── layout.tsx         Root layout (Inter + JetBrains Mono fonts)
│       │   ├── page.tsx           Root page — all React state, 5-tab shell
│       │   ├── globals.css        Premium Light theme, brand colors
│       │   └── api/
│       │       ├── optimize/
│       │       │   └── route.ts   POST: spawns Python bridge subprocess
│       │       ├── input-files/
│       │       │   └── route.ts   GET: lists input/*.json filenames
│       │       └── load-input/
│       │           └── route.ts   GET ?file=: reads named input JSON
│       ├── components/
│       │   ├── ui/                shadcn/ui components (regenerate, do not hand-edit)
│       │   ├── magicui/           Hand-written Magic UI components (edit directly)
│       │   │   ├── animated-gradient-text.tsx
│       │   │   ├── border-beam.tsx
│       │   │   ├── number-ticker.tsx
│       │   │   └── shimmer-button.tsx
│       │   └── dashboard/         Feature components (all presentational)
│       │       ├── topbar.tsx
│       │       ├── impact-header.tsx
│       │       ├── intro-tab.tsx
│       │       ├── manifest-tab.tsx
│       │       ├── recipe-tab.tsx
│       │       ├── cost-story.tsx
│       │       ├── operation-tab.tsx
│       │       ├── phase-details-tab.tsx
│       │       └── expert-overrides.tsx
│       └── lib/
│           ├── types.ts           TypeScript mirrors of Python dataclasses
│           └── utils.ts           shadcn cn() utility
├── AxNano/                        Business collateral (PDFs, spreadsheets — not code)
└── .planning/                     GSD planning documents
    └── codebase/
```

## Directory Purposes

**`smart_feed_v9/`:**
- Purpose: Self-contained Python package implementing the full optimization algorithm
- Contains: 8 Python modules; importable as `from smart_feed_v9 import run_optimization`
- Key files: `__init__.py` (public API), `models.py` (data structures), `search.py` (core algorithm)

**`dashboard/`:**
- Purpose: Next.js 16 frontend; self-contained npm project
- Contains: React components, API routes, TypeScript types
- Key files: `src/app/page.tsx` (root state), `src/lib/types.ts` (type contracts)

**`input/`:**
- Purpose: Shared JSON input files for both CLI and Next.js
- Contains: `.json` files with `{"streams": [...], "config": {...}}` structure
- Key files: `example_input.json` (3-stream default)

**`tests/`:**
- Purpose: pytest test suite for the Python package
- Contains: single test file `test_core.py` (23 tests), `conftest.py`
- Key files: `test_core.py`

**`report/`:**
- Purpose: Auto-generated text report output from CLI runs
- Generated: Yes (by `__main__.py`)
- Committed: No (should be .gitignored)

**`dashboard/src/components/ui/`:**
- Purpose: shadcn/ui components — do not hand-edit; regenerate via `npx shadcn`
- Generated: Partially (scaffolded via shadcn CLI)
- Committed: Yes

**`dashboard/src/components/magicui/`:**
- Purpose: Hand-written copies of Magic UI components — not npm packages
- Generated: No
- Committed: Yes — edit directly

## Key File Locations

**Entry Points:**
- `smart_feed_v9/__main__.py`: CLI (`python -m smart_feed_v9`)
- `run_optimization.py`: Next.js subprocess bridge (stdin/stdout JSON)
- `dashboard/src/app/page.tsx`: Browser entry (Next.js App Router root page)

**Public Python API:**
- `smart_feed_v9/__init__.py`: `run_optimization()`, all exported dataclasses

**Data Contracts:**
- `smart_feed_v9/models.py`: Python data structures (source of truth)
- `dashboard/src/lib/types.ts`: TypeScript mirrors (must stay in sync with models.py)

**Configuration:**
- `environment.yml`: conda environment definition
- `pyproject.toml`: pytest settings
- `dashboard/package.json`: npm dependencies
- `dashboard/tsconfig.json`: TypeScript config
- `dashboard/tailwind.config.ts`: Tailwind + design tokens

**Styling:**
- `dashboard/src/app/globals.css`: Theme variables, brand colors (Ax-Cyan `#06B6D4`, Ax-Orange `#FF8C00`)

**Testing:**
- `tests/test_core.py`: All Python unit + integration tests
- `tests/conftest.py`: sys.path configuration for pytest

**Algorithm Core (in dependency order):**
- `smart_feed_v9/models.py` → `blending.py` → `gatekeeper.py` → `ratios.py` → `search.py`
- `smart_feed_v9/baseline.py` (parallel to search, both use gatekeeper)
- `smart_feed_v9/reporter.py` (output only)

## Naming Conventions

**Python Files:**
- `snake_case.py` throughout
- Single-responsibility naming: `blending.py`, `gatekeeper.py`, `search.py`

**Python Modules:**
- Public functions: `snake_case` (e.g., `calc_blend_properties`, `build_optimized_schedule`)
- Private functions: `_snake_case` prefix (e.g., `_precompute_templates`, `_search`, `_validate_streams`)
- Private dataclasses: `_PascalCase` prefix (e.g., `_PhaseTemplate`)

**Python Variables:**
- Rates use `r_` prefix: `r_water`, `r_diesel`, `r_naoh`, `r_ext`
- Physical quantities use domain units in name: `quantity_L`, `runtime_min`, `btu_per_lb`, `cost_diesel_per_L`
- Config constants use `UPPER_SNAKE_CASE` for K-values: `K_F_TO_ACID`, `K_PH_TO_BASE`

**TypeScript/React Files:**
- `kebab-case.tsx` for all components and routes
- `camelCase.ts` for lib files
- Components export named functions matching file stem in `PascalCase`: `topbar.tsx` exports `Topbar`

**Input JSON Files:**
- `snake_case.json` (e.g., `example_input.json`, `test_4streams.json`)

**API Routes:**
- Directory-based per Next.js App Router convention: `api/optimize/route.ts`
- Route verbs: POST for mutation (`optimize`), GET for reads (`input-files`, `load-input`)

## Where to Add New Code

**New Python algorithm module:**
- Implementation: `smart_feed_v9/new_module.py`
- Export via: add import to `smart_feed_v9/__init__.py`
- Tests: `tests/test_core.py` (extend existing file) or `tests/test_new_module.py`

**New waste property or calculation:**
- Data field: add to `WasteStream` in `smart_feed_v9/models.py` AND mirror in `dashboard/src/lib/types.ts`
- Calculation logic: add to `smart_feed_v9/blending.py` (blend math) or `smart_feed_v9/gatekeeper.py` (rate/cost)

**New config parameter:**
- Python: add field with default to `SystemConfig` in `smart_feed_v9/models.py`
- TypeScript: add to `SystemConfig` interface AND `DEFAULT_CONFIG` in `dashboard/src/lib/types.ts`
- CLI: add `--param` flag in `smart_feed_v9/__main__.py`

**New dashboard tab:**
- Component: `dashboard/src/components/dashboard/new-tab.tsx`
- Register in `TABS` array and `TabsContent` in `dashboard/src/app/page.tsx`

**New API route:**
- Create: `dashboard/src/app/api/new-route/route.ts`
- Input directory path: resolve relative to `process.cwd(), ".."` (same pattern as existing routes)

**New input JSON file:**
- Place in: `input/` directory
- Format: `{"streams": [...], "config": {...}}` matching `input/example_input.json`

**Shared UI utilities:**
- shadcn components: run `npx shadcn add <component>` from `dashboard/`
- Magic UI components: add directly to `dashboard/src/components/magicui/`
- General utils: `dashboard/src/lib/utils.ts`

## Special Directories

**`.planning/`:**
- Purpose: GSD planning documents (codebase maps, phase plans)
- Generated: By Claude Code GSD commands
- Committed: Yes

**`AxNano/`:**
- Purpose: Business collateral — PDFs, cost spreadsheets, reference documents
- Generated: No
- Committed: Yes

**`dashboard/.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes (`npm run build` or `npm run dev`)
- Committed: No

**`smart_feed_v9/__pycache__/`:**
- Purpose: Python bytecode cache
- Generated: Yes
- Committed: No (or should not be)

---

*Structure analysis: 2026-03-26*
