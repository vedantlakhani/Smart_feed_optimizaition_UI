# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- Python 3.13 — Core algorithm package (`smart_feed_v9/`), CLI, bridge script (`run_optimization.py`), legacy dashboard (`smartfeed_dashboard.py`)
- TypeScript 5.x — Next.js dashboard (`dashboard/src/`)

**Secondary:**
- JSON — Input/output data format for both CLI (`input/`) and the Python↔Next.js bridge

## Runtime

**Python Environment:**
- Conda environment: `axnano-smartfeed` (defined in `environment.yml`)
- Python 3.13 required
- Managed via miniconda/anaconda/miniforge (auto-detected at runtime by `dashboard/src/app/api/optimize/route.ts`)

**Node.js Environment:**
- Next.js 16.1.6 (requires Node compatible with React 19)
- Package manager: npm
- Lockfile: `dashboard/package-lock.json` (present)

## Frameworks

**Core:**
- Pure Python stdlib + dataclasses — Algorithm package `smart_feed_v9/` (no third-party runtime deps; only `math`, `itertools`, `dataclasses`)
- Next.js 16.1.6 — Dashboard frontend and API routes (`dashboard/`)

**UI Component Layer:**
- shadcn/ui 4.0.7 — Component system, style `base-nova`, CSS variables, configured via `dashboard/components.json`
- `@base-ui/react` 1.3.0 — Primitive headless components underpinning shadcn (Accordion uses `multiple` prop, Select.onValueChange receives `string | null`)
- Tailwind CSS 4.x — Utility styling, PostCSS pipeline (`dashboard/postcss.config.mjs`)
- Framer Motion 12.x — Animation (`dashboard/src/components/magicui/`)

**Visualization:**
- Recharts 3.8.0 — Cost bar charts in `dashboard/src/components/dashboard/recipe-tab.tsx`
- Plotly 5.20+ — Used in legacy Streamlit dashboard only (`smartfeed_dashboard.py`)

**Legacy Dashboard:**
- Streamlit 1.40+ — `smartfeed_dashboard.py` (820 lines, kept for reference, not used by Next.js flow)
- pandas 2.0+ — Used by legacy Streamlit dashboard only

**Testing:**
- pytest 8.0+ — Python test runner, config in `pyproject.toml`, tests in `tests/`

**Build/Dev:**
- `next dev` / `next build` — Dev server and production build
- `@tailwindcss/postcss` 4.x — Tailwind PostCSS integration
- ESLint 9 + `eslint-config-next` 16.1.6 — Linting, configured in `dashboard/eslint.config.mjs`

## Key Dependencies

**Critical (Python):**
- `dataclasses` (stdlib) — All Python data models: `WasteStream`, `SystemConfig`, `BlendProperties`, `PhaseResult`, `Schedule` in `smart_feed_v9/models.py`
- `math`, `itertools` (stdlib) — Core algorithm calculations in `smart_feed_v9/blending.py`, `smart_feed_v9/ratios.py`
- `json`, `sys` (stdlib) — stdin/stdout bridge in `run_optimization.py`

**Critical (Next.js):**
- `next` 16.1.6 — App Router, API Routes (`/api/optimize`, `/api/input-files`, `/api/load-input`)
- `react` 19.2.3 + `react-dom` 19.2.3 — UI rendering
- `child_process` (Node stdlib) — Subprocess spawn in `dashboard/src/app/api/optimize/route.ts` to call Python
- `fs`, `path`, `os` (Node stdlib) — File I/O in API routes and Python path resolution

**UI/UX:**
- `lucide-react` 0.577.0 — Icons throughout dashboard components
- `class-variance-authority` 0.7.1 + `clsx` 2.1.1 + `tailwind-merge` 3.5.0 — Utility for shadcn `cn()` helper in `dashboard/src/lib/utils.ts`
- `tw-animate-css` 1.4.0 — CSS animation utilities

**Magic UI (hand-written, not npm):**
- `dashboard/src/components/magicui/number-ticker.tsx`
- `dashboard/src/components/magicui/shimmer-button.tsx`
- `dashboard/src/components/magicui/border-beam.tsx`
- `dashboard/src/components/magicui/animated-gradient-text.tsx`

## Configuration

**Python Environment:**
- Defined in `environment.yml` (conda env: `axnano-smartfeed`)
- Channels: `defaults`, `conda-forge`
- No `.env` file for Python — all algorithm parameters passed via `SystemConfig` dataclass or JSON input files

**pytest:**
- Config: `pyproject.toml` (`[tool.pytest.ini_options]`, `testpaths = ["tests"]`)
- Path setup: `tests/conftest.py` inserts project root into `sys.path`

**TypeScript:**
- Config: `dashboard/tsconfig.json`
- Target: `ES2017`, strict mode on
- Path alias: `@/*` → `./src/*`
- Module resolution: `bundler`

**Next.js:**
- Config: `dashboard/next.config.ts` (minimal, no custom options set)
- No `NEXT_PUBLIC_*` env vars detected; no `.env` files in `dashboard/`

**Tailwind / shadcn:**
- Tailwind CSS source: `dashboard/src/app/globals.css`
- shadcn config: `dashboard/components.json` (style: `base-nova`, base color: `neutral`, icon library: `lucide`)
- CSS variables pattern used for theming

**Build:**
- PostCSS config: `dashboard/postcss.config.mjs`
- ESLint config: `dashboard/eslint.config.mjs` (extends `next/core-web-vitals` + `next/typescript`)

## Platform Requirements

**Development:**
- macOS (primary — conda path detection hardcoded for macOS home dirs in `route.ts`)
- Conda installed at `~/miniconda3`, `~/anaconda3`, `~/opt/anaconda3`, or `~/miniforge3`
- `axnano-smartfeed` conda env activated for Python execution
- Node.js compatible with React 19 / Next.js 16

**Production:**
- No deployment configuration detected
- Python subprocess architecture requires Python and conda env co-located with the Next.js server process
- Not suited for containerised or serverless deployment without modification to `run_optimization.py` bridge and Python path resolution in `route.ts`

---

*Stack analysis: 2026-03-26*
