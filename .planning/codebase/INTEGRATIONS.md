# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**None detected.**

No third-party API integrations exist. The system is fully self-contained: the Python algorithm runs locally and the Next.js dashboard communicates only with the local Python process via subprocess.

## Data Storage

**Databases:**
- None. No database client, ORM, or connection string detected.

**File Storage:**
- Local filesystem only.
- Input JSON files read from `input/` directory (project root), accessed by both CLI and Next.js API routes.
- Output reports written to `report/` directory (CLI mode only, via `smart_feed_v9/reporter.py`).
- File listing endpoint: `dashboard/src/app/api/input-files/route.ts` reads `../input/` relative to Next.js `cwd`.
- File read endpoint: `dashboard/src/app/api/load-input/route.ts` reads `../input/<filename>.json`.

**Input file format:**
```json
{
  "streams": [WasteStream, ...],
  "config": { "F_total": 11.0, ... }
}
```
Example files: `input/example_input.json`, `input/test_4streams.json`, `input/test_5streams.json`

**Caching:**
- In-process memoization only (Python dict keyed on rounded inventory state in `smart_feed_v9/search.py`).
- No external cache (Redis, Memcached, etc.).

## Authentication & Identity

**Auth Provider:** None. No authentication of any kind is implemented.

- The Next.js dashboard has no login, no session management, and no protected routes.
- All API routes (`/api/optimize`, `/api/input-files`, `/api/load-input`) are unauthenticated.

## Python ↔ Next.js Bridge

This is the primary "integration" in the system — a subprocess-based IPC mechanism.

**Flow:**
1. `dashboard/src/app/api/optimize/route.ts` receives POST `{streams, config}` JSON
2. Spawns Python subprocess: `python run_optimization.py` with `cwd = PROJECT_ROOT`
3. Writes JSON to subprocess stdin
4. Reads JSON result from subprocess stdout
5. Returns result as `NextResponse.json(...)`

**Python executable resolution** (in order, `dashboard/src/app/api/optimize/route.ts`):
1. `~/opt/anaconda3/envs/axnano-smartfeed/bin/python`
2. `~/anaconda3/envs/axnano-smartfeed/bin/python`
3. `~/miniconda3/envs/axnano-smartfeed/bin/python`
4. `~/miniforge3/envs/axnano-smartfeed/bin/python`
5. `/usr/bin/python3`
6. `python3` (fallback)

**Bridge script:** `run_optimization.py` (project root)
- Reads stdin → constructs `WasteStream` + `SystemConfig` objects → calls `run_optimization(..., verbose=False)` → serialises result to stdout JSON

**Error handling:** Non-zero exit code returns HTTP 500 with stderr content; JSON parse failure returns HTTP 500.

## Monitoring & Observability

**Error Tracking:** None. No Sentry, Datadog, or similar service.

**Logs:**
- Python: `stderr` output from `run_optimization.py` captured by Next.js API route and returned in error responses only.
- Next.js: Standard Next.js console logging only.
- No structured logging, no log aggregation.

## CI/CD & Deployment

**Hosting:** No deployment configuration detected. Local development only.

**CI Pipeline:** None. No GitHub Actions, CircleCI, or similar.

**Container:** No Dockerfile or docker-compose found.

## Environment Configuration

**Required env vars:** None detected. The system uses no environment variables for configuration.

**Algorithm parameters:** All tunable via `SystemConfig` dataclass defaults (`smart_feed_v9/models.py`) or JSON `config` key in input files, or via CLI flags (`--F_total`, `--eta`).

**Secrets:** None required. No API keys, tokens, or credentials.

## Webhooks & Callbacks

**Incoming:** None.

**Outgoing:** None.

## Fonts

**Google Fonts** (CDN, via Next.js font optimization):
- `Geist` (sans) and `Geist_Mono` loaded in `dashboard/src/app/layout.tsx` via `next/font/google`
- Also referenced in legacy Streamlit dashboard via direct Google Fonts CSS URL (`JetBrains Mono`, `Inter`) in `smartfeed_dashboard.py`

This is the only external network call at runtime — font files fetched from Google CDN during development/build. No API key required.

---

*Integration audit: 2026-03-26*
