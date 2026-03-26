# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Python Files:**
- `snake_case` for all module names: `blending.py`, `gatekeeper.py`, `ratios.py`
- Module-level private helpers prefixed with underscore: `_precompute_templates`, `_search`, `_Tee`
- Module-level constants in `UPPER_SNAKE_CASE`: `_MAX_TEMPLATES_PER_SUBSET = 30`, `_ACTIVE_THRESHOLD_L = 0.5`

**Python Functions:**
- `snake_case` for all functions: `calc_r_water`, `blend_linear`, `evaluate_phase`
- Calculation functions prefixed with `calc_`: `calc_blend_properties`, `calc_r_diesel`, `calc_phase_cost`
- Report functions prefixed with `report_`: `report_streams`, `report_baseline`, `report_comparison`
- Private helpers prefixed with `_fmt_`: `_fmt_cost`, `_fmt_time`, `_fmt_rate`
- Formatter helpers prefixed with `print_`: `print_separator`, `print_header`

**Python Variables:**
- `snake_case` for all local variables: `r_water`, `r_diesel`, `blend_props`, `stream_ids`
- Domain-specific abbreviations kept consistent: `r_` prefix for rate values, `cfg` for config, `inv` for inventory
- Algorithm parameters in `UPPER_SNAKE_CASE` matching physics notation: `BTU_target`, `BTU_diesel`, `F_total`, `K_F_TO_ACID`
- Iteration variables stay short and meaningful: `s` for stream, `sid` for stream_id, `t`/`tmpl` for template

**Python Classes/Types:**
- `PascalCase` for all dataclasses: `WasteStream`, `SystemConfig`, `BlendProperties`, `PhaseResult`, `Schedule`
- Internal/private dataclasses prefixed with underscore: `_PhaseTemplate` in `search.py`

**TypeScript Files:**
- `kebab-case` for all component files: `manifest-tab.tsx`, `recipe-tab.tsx`, `phase-details-tab.tsx`, `impact-header.tsx`
- `camelCase` for utility files: `utils.ts`, `types.ts`

**TypeScript Functions/Variables:**
- `camelCase` for all functions and variables: `handleRun`, `handleConfigChange`, `getPythonPath`, `selectedFile`
- `UPPER_SNAKE_CASE` for module-level constants: `STREAM_COLORS`, `STREAM_BG`, `STREAM_BORDER`, `TABS`
- `PascalCase` for all React components: `ManifestTab`, `RecipeTab`, `PhBadge`, `BtuBadge`, `ConfigField`

**TypeScript Interfaces:**
- `PascalCase` for all interfaces: `WasteStream`, `SystemConfig`, `ManifestTabProps`, `RecipeTabProps`
- Props interfaces named `[ComponentName]Props`: `ManifestTabProps`, `RecipeTabProps`, `TopbarProps`

## Code Style

**Python Formatting:**
- No formatter config found (no `.prettierrc`, no `black` config, no `ruff.toml`)
- PEP 8 style used throughout: 4-space indentation, blank lines between top-level definitions
- Max line length appears to be ~100 characters; long lines broken with parentheses
- Inline comments aligned in columns for related constants (see `models.py` `SystemConfig` fields)

**Python Linting:**
- No linting config detected (no `.flake8`, no `pylint.rc`, no `ruff.toml`)

**TypeScript/ESLint:**
- ESLint config: `dashboard/eslint.config.mjs`
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- TypeScript strict mode enabled in `tsconfig.json` (`"strict": true`)
- No Prettier config detected

**Tailwind:**
- Tailwind v4 with PostCSS: `dashboard/postcss.config.mjs`
- No `prettier-plugin-tailwindcss` detected

## Import Organization

**Python:**
- Standard library imports first, then relative imports (no third-party deps in algo package)
- Relative imports used exclusively within `smart_feed_v9/`: `from .models import ...`, `from .blending import ...`
- Lazy import inside a function body in one place: `from .blending import calc_blend_properties` inside `evaluate_phase` in `gatekeeper.py` (to break a circular import)
- No `__all__` defined in submodules; `__init__.py` explicitly re-exports the public API

**TypeScript:**
- Order: `"use client"` directive → React hooks → shadcn/ui components → magic-ui components → lucide-react → local types
- Path alias `@/*` maps to `dashboard/src/*`; use it for all non-relative imports
- Types imported with `import type { ... }` (separate from value imports)
- Component imports use named exports (no default exports for components)

## Error Handling

**Python:**
- `ValueError` raised for invalid input data: duplicate stream IDs, out-of-range values, empty streams list
- `TypeError` raised for wrong argument type: non-`WasteStream` objects in `_validate_streams`
- `FileNotFoundError` raised and caught in `__main__.py` for missing input files; exits with `sys.exit(1)`
- `json.JSONDecodeError` / `KeyError` caught in `__main__.py` for malformed JSON; exits with `sys.exit(1)`
- Infeasible phases return `None` (not exceptions): `evaluate_phase` returns `None` if `W < W_min` or `pH > pH_max`
- No custom exception classes; built-in exceptions used throughout

**TypeScript:**
- Async fetch errors caught with `try/catch` in `page.tsx`; error stored in React state and displayed as inline banner
- API route errors returned as `NextResponse.json({ error, detail }, { status: 500 })` — never throw
- `e instanceof Error ? e.message : "Optimization failed"` pattern for unknown catch types (TypeScript strict mode)
- Python subprocess non-zero exit code surfaced as HTTP 500 with `stderr` in `detail` field

## Logging

**Python:**
- No logging framework; `print()` used throughout for output
- `print(..., file=sys.stderr)` used for error conditions in `__main__.py`
- Unicode symbols used in CLI output: `✓` for success, `✗` for errors, `⏳` for in-progress, `⚠` for warnings
- `reporter.py` provides structured formatted output with box-drawing characters for report sections

**TypeScript:**
- No logging framework; browser console not used in production paths
- Errors surfaced via React state → UI banner (no `console.error` calls observed)

## Comments

**When to Comment:**
- Every module has a top-level docstring explaining its role and contents
- Every public function has a docstring explaining: purpose, algorithm/formula used, parameters, return value
- Inline comments explain non-obvious math: `# solid 30%, max 15% → r = 30/15 - 1 = 1.0`
- Algorithm step numbers noted in comments: `# Step A:`, `# Step B:`, `# Step C:`
- MVP design assumption tags used throughout: `«A1»`–`«A9»` linking code to documented assumptions
- Performance optimization notes inline in search engine (`search.py`)

**Docstrings:**
- All public Python functions have docstrings; private helpers (`_fmt_*`) have brief one-liners or none
- Docstrings include formulas in plain text/LaTeX style: `P_blend = Σ(P_i * ratio_i) / Σ(ratio_i)`
- TypeScript components have no JSDoc; types are self-documenting through interfaces

## Function Design

**Python:**
- Pure functions preferred: most calculation functions take only value arguments and return a result
- No mutation of input arguments; new objects returned or new dicts created
- Single responsibility: `calc_r_water`, `calc_r_diesel`, `calc_r_naoh` each handle exactly one calculation step
- Closures used for recursive search inner function `_search` in `search.py` to capture `stats`, `memo`, `all_templates`

**TypeScript:**
- `useCallback` used for event handlers that are passed as props: `handleRun`, `handleConfigChange`
- `useEffect` used for side effects (file loading) triggered by state changes
- Sub-components extracted for isolated rendering logic: `PhBadge`, `BtuBadge`, `ConfigField`, `EmptyState`, `LoadingState`

## Module Design

**Python Exports:**
- `smart_feed_v9/__init__.py` defines the full public API via explicit re-exports
- Public API: `run_optimization()`, `WasteStream`, `SystemConfig`, `BlendProperties`, `PhaseResult`, `Schedule`, `calc_baseline`, `search`, `build_optimized_schedule`, `full_report`
- No barrel files in submodules; only `__init__.py` serves as the public face

**TypeScript Exports:**
- Named exports for all components (no default component exports except `page.tsx` and `layout.tsx` which Next.js requires)
- `DEFAULT_CONFIG` constant exported from `dashboard/src/lib/types.ts` alongside type definitions
- `cn()` utility exported from `dashboard/src/lib/utils.ts`
- shadcn/ui components in `dashboard/src/components/ui/` re-export their own named exports; do not edit manually — regenerate via `npx shadcn`

---

*Convention analysis: 2026-03-26*
