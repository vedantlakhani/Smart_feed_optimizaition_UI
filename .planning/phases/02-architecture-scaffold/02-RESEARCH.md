# Phase 2: Architecture Scaffold - Research

**Researched:** 2026-03-26
**Domain:** Next.js App Router route groups, Tailwind CSS v4 design tokens, auto-load UX pattern
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLSH-01 | Dashboard and landing page use Apple-like premium aesthetic: shadow-based elevation, generous whitespace, smooth cubic-bezier easing via CSS design tokens in globals.css | CSS custom property design token pattern documented; `@theme inline` mapping to Tailwind utilities verified |
| PLSH-02 | All AxNano brand colors applied via Tailwind utilities (ax-cyan, ax-orange) rather than 40+ hardcoded hex values | Tailwind v4 `@theme inline` generates `text-ax-cyan`, `bg-ax-cyan`, `border-ax-cyan`, `text-ax-orange`, etc. from CSS vars already in globals.css; 40+ hardcoded `text-[#06b6d4]` / `text-[#ff8c00]` instances catalogued across 7 component files |
| UX-04 | Dashboard auto-loads example data on first visit so no user ever sees an empty state | `topbar.tsx` already auto-selects `files[0]` when `!selectedFile`; gap is the default file name is not guaranteed to be `demo_3stream.json`; fix is trivial sort-order or explicit seed |
</phase_requirements>

---

## Summary

Phase 2 sets up the structural and styling foundations that every subsequent phase builds on. It has three distinct concerns: (1) route group isolation so the landing page at `/` and the dashboard at `/dashboard` can have separate layouts without affecting API routes at `/api/`; (2) centralizing AxNano brand colors as Tailwind utilities instead of 40+ hardcoded hex values scattered across 7 component files; (3) ensuring the dashboard auto-loads `demo_3stream.json` on first visit so reviewers never see a blank state.

The critical technical question — "do API routes need to move when we add route groups?" — has a definitive answer: No. Route groups only affect `page.tsx` and `layout.tsx` files. `app/api/` routes sit outside any route group and their URL paths (`/api/optimize`, `/api/input-files`, `/api/load-input`) are completely unaffected by adding `(marketing)/` and `(app)/` groups alongside them. The `process.cwd()` paths in the API routes (resolving to `../input/` and `../run_optimization.py`) also remain unchanged because `cwd` is the `dashboard/` directory regardless of route group topology.

The auto-load fix is already 90% done: `topbar.tsx` calls `onFileChange(d.files[0])` when no file is selected, which triggers the `useEffect` in `page.tsx`. The only gap is that `d.files` is sorted alphabetically by the `input-files` API and `demo_3stream.json` sorts before `example_input.json` and `test_*` files — so it already loads first. The fix is simply documenting this behaviour and adding an explicit guard so future file additions don't break it.

**Primary recommendation:** Add route groups `(marketing)` and `(app)` alongside the existing `app/api/` directory. Keep `app/layout.tsx` as the single root layout. Add group-level layouts only for structural markup differences (full-bleed vs. max-width container). Add design tokens and `@theme inline` mapping in `globals.css`. No npm installs required.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.6 (installed) | Route groups, nested layouts | Already in use; route groups are a first-class App Router feature |
| Tailwind CSS | v4 (installed) | `@theme inline` design tokens | v4 CSS-first config; no JS config file needed |
| shadcn/ui | 4.0.7 (installed) | Component primitives | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Framer Motion | 12.x (installed) | Easing animations for landing page | Already in use via magicui; needed for PLSH-01 smooth easing |
| `tw-animate-css` | 1.4.0 (installed) | CSS animation utilities | Already in use |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Route groups `(marketing)/(app)` | Separate `/dashboard` segment without groups | Groups allow each section to have its own layout without adding a URL segment; the dashboard moves to `/dashboard` either way |
| `@theme inline` in globals.css | Separate tailwind.config.ts custom colors | Tailwind v4 has no `tailwind.config.ts` by default in this project — the CSS-first approach is correct for v4 |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure After Phase 2
```
dashboard/src/app/
├── (marketing)/          # Route group — no URL impact
│   ├── layout.tsx        # Full-bleed marketing layout (optional, can be minimal)
│   └── page.tsx          # Landing page at /
├── (app)/                # Route group — no URL impact
│   ├── layout.tsx        # Dashboard layout wrapper (optional)
│   └── dashboard/
│       └── page.tsx      # Dashboard at /dashboard (moved from app/page.tsx)
├── api/                  # STAYS HERE — route groups do not affect /api/* URLs
│   ├── optimize/route.ts
│   ├── input-files/route.ts
│   └── load-input/route.ts
├── globals.css           # Add design tokens here
├── layout.tsx            # Root layout — stays at root, wraps everything
└── favicon.ico
```

### Pattern 1: Route Groups with Shared Root Layout
**What:** Route groups `(name)` are folder-only organization — parentheses are stripped from URLs. The root `app/layout.tsx` continues to wrap all routes. Group-specific `layout.tsx` files add section-specific structural markup (e.g. full-bleed wrapper for marketing vs. max-width container for dashboard) without replacing the root layout.

**When to use:** When two sections need different page-level structure (full-bleed hero vs. constrained-width dashboard) but share fonts, global CSS, and metadata.

**Critical verified fact (HIGH confidence):** Route groups at `app/(marketing)/` and `app/(app)/` do NOT affect routes at `app/api/`. The `/api/*` paths remain exactly as-is. Source: Next.js official docs — "This convention indicates the folder is for organizational purposes and should not be included in the route's URL path."

**Example structure:**
```
app/layout.tsx          → wraps html/body, fonts, global CSS (unchanged)
app/(marketing)/page.tsx → serves /
app/(app)/dashboard/page.tsx → serves /dashboard
app/api/optimize/route.ts → serves /api/optimize (unchanged, outside any group)
```

### Pattern 2: Tailwind v4 Design Token Registration via `@theme inline`
**What:** In Tailwind CSS v4, custom CSS properties declared in `:root` become Tailwind utilities only when explicitly registered in a `@theme` or `@theme inline` block. The `inline` modifier resolves the CSS variable at build time so the utility value is inlined (avoids scope resolution issues with `var()` references).

**When to use:** Any time you want `text-ax-cyan`, `bg-ax-cyan`, `border-ax-cyan`, `text-ax-orange`, etc. as first-class utilities rather than arbitrary-value `text-[#06b6d4]` hacks.

**Current state:** `globals.css` already has:
```css
@theme inline {
  --color-ax-cyan: #06b6d4;
  --color-ax-cyan-light: #ecfeff;
  --color-ax-orange: #ff8c00;
  --color-ax-orange-light: #fff7ed;
}
```
These four CSS variables are already registered in `@theme inline`. This means `text-ax-cyan`, `bg-ax-cyan`, `border-ax-cyan`, `text-ax-orange`, `bg-ax-orange`, `border-ax-orange`, `bg-ax-cyan-light`, `bg-ax-orange-light` utilities already exist in the build. The component files just aren't using them yet — they use hardcoded `text-[#06b6d4]` etc.

**PLSH-02 is therefore a pure find-and-replace task, not a configuration task.**

### Pattern 3: Design Token Addition for PLSH-01 (Elevation + Easing)
**What:** Add shadow, spacing, and easing tokens to the `@theme inline` block in `globals.css`. Tailwind v4 maps `--shadow-*` to `shadow-*` utilities and `--ease-*` to `ease-*` utilities.

**Tokens needed:**
```css
@theme inline {
  /* Existing ax-brand colors (already present, no change needed) */
  --color-ax-cyan: #06b6d4;
  --color-ax-cyan-light: #ecfeff;
  --color-ax-orange: #ff8c00;
  --color-ax-orange-light: #fff7ed;

  /* NEW: Elevation shadows (Apple-like) */
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07);
  --shadow-card-hover: 0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.08);
  --shadow-topbar: 0 1px 0 0 #e2e8f0;

  /* NEW: Smooth cubic-bezier easing */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

  /* NEW: Whitespace scale additions */
  --spacing-section: 5rem;      /* 80px section padding */
  --spacing-card: 1.5rem;       /* 24px card internal padding */
}
```

These tokens then become: `shadow-card`, `shadow-card-hover`, `shadow-topbar`, `ease-smooth`, `ease-spring`, `ease-out-expo` as Tailwind utilities. Framer Motion components can reference them via `transition={{ ease: [0.4, 0, 0.2, 1] }}`.

### Pattern 4: Auto-Load on First Visit (UX-04)
**What:** `topbar.tsx` already implements auto-select via `onFileChange(d.files[0])` when `!selectedFile`. The `input-files` route sorts files alphabetically, so `demo_3stream.json` is always first (d < e < t alphabetically).

**Current code in `topbar.tsx` (lines 26-28):**
```typescript
if (!selectedFile && d.files?.length > 0) {
  onFileChange(d.files[0]);
}
```

**Gap:** This works today because `demo_3stream.json` sorts first. To make this robust and intentional, the `input-files` API should either (a) pin `demo_3stream.json` to the top explicitly, or (b) the topbar should request a specific default. Option (a) is simpler.

**Preferred fix:** In `input-files/route.ts`, sort files with `demo_3stream.json` first:
```typescript
const sorted = files.sort((a, b) => {
  if (a === 'demo_3stream.json') return -1;
  if (b === 'demo_3stream.json') return 1;
  return a.localeCompare(b);
});
```

### Anti-Patterns to Avoid
- **Moving `app/api/` inside a route group:** Unnecessary and breaks nothing to leave it at root. API routes do not need to be inside a route group.
- **Creating a new root `layout.tsx` inside a route group:** A group-level layout is nested below the root layout, not a replacement. Only add group layouts when you need structural markup differences.
- **Hardcoding hex in group layouts:** The whole point of PLSH-02 is to stop doing this — use `text-ax-cyan` etc.
- **Using `tailwind.config.ts` for v4 customization:** This project uses Tailwind v4's CSS-first configuration. Do not add a `tailwind.config.ts` — use `@theme` in `globals.css`.
- **Conflicting root paths:** Do not have both `app/page.tsx` and `app/(marketing)/page.tsx` — both resolve to `/` and Next.js will error. The existing `app/page.tsx` must be deleted when `(marketing)/page.tsx` is created.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color token system | Custom CSS class generator | Tailwind v4 `@theme inline` | Already present in globals.css; just needs components updated |
| Route isolation | Middleware-based redirects | Next.js route groups `(name)/` | First-class App Router feature; zero runtime cost |
| Dashboard URL | Build a `/dashboard` folder from scratch | Move existing `page.tsx` into `(app)/dashboard/page.tsx` | All state, components, and API calls are unchanged |
| Shadow scale | Custom `.elevation-*` CSS classes | Tailwind v4 `--shadow-*` tokens | Generates `shadow-card` etc. natively |

**Key insight:** The required infrastructure already exists — globals.css has the color tokens registered, topbar already auto-selects the first file, and Next.js route groups require zero npm installs. Phase 2 is reorganization + registration, not greenfield construction.

---

## Common Pitfalls

### Pitfall 1: Forgetting to Delete `app/page.tsx` When Adding `(marketing)/page.tsx`
**What goes wrong:** Two pages resolving to `/` causes a Next.js build error: "Conflicting paths."
**Why it happens:** Route groups strip the `(name)` prefix, so `(marketing)/page.tsx` and `app/page.tsx` both resolve to `/`.
**How to avoid:** Delete `app/page.tsx` as part of the same task that creates `(marketing)/page.tsx`.
**Warning signs:** `next build` exits with "Conflicting paths" error.

### Pitfall 2: `process.cwd()` in API Routes After Restructuring
**What goes wrong:** `route.ts` files use `path.resolve(process.cwd(), "..", "input")` and `path.resolve(process.cwd(), "..", "run_optimization.py")`. These paths assume `cwd` is `dashboard/`.
**Why it happens:** `cwd` in Next.js API routes is the Next.js project root (the `dashboard/` folder). Moving route files into a route group subfolder does NOT change `cwd` — it remains the project root.
**How to avoid:** API routes at `app/api/` do not move. Verified: route group topology has no effect on `process.cwd()` in route handlers.
**Warning signs:** 500 errors on `/api/optimize` or empty file lists from `/api/input-files`.

### Pitfall 3: `@theme inline` Self-Reference Loop
**What goes wrong:** Writing `--color-ax-cyan: var(--color-ax-cyan)` inside `@theme inline` creates a self-reference that may not resolve.
**Why it happens:** Attempting to reference the very variable being defined.
**How to avoid:** Use literal values (hex strings) in `@theme inline`, not `var()` self-references. Current globals.css already does this correctly: `--color-ax-cyan: #06b6d4`.
**Warning signs:** `bg-ax-cyan` compiles to `background-color: var(--color-ax-cyan)` but the CSS property has no value; page renders with no color applied.

### Pitfall 4: Recharts `STREAM_COLORS` Array Cannot Use Tailwind Utilities
**What goes wrong:** `recipe-tab.tsx` and `operation-tab.tsx` have `const STREAM_COLORS = ["#ff8c00", "#06b6d4", ...]` passed directly to Recharts `<Bar fill={color}>`. Recharts requires literal CSS color strings, not Tailwind class names.
**Why it happens:** Recharts applies colors via inline style attributes, not class names.
**How to avoid:** Keep the `STREAM_COLORS` hex array for Recharts props. Use Tailwind utilities only in `className` attributes. This is correct behaviour, not a bug — these hex values in JS arrays are explicitly excluded from the PLSH-02 "40+ hardcoded hex" count.
**Warning signs:** Recharts bars appear colorless if you attempt to pass Tailwind class names as `fill` values.

### Pitfall 5: `magicui` Props Accept Hex Strings Directly
**What goes wrong:** `<BorderBeam colorFrom="#ff8c00" colorTo="#06b6d4">` and `<ShimmerButton shimmerColor="#ff8c00">` use hex string props, not classNames.
**Why it happens:** These are hand-written Magic UI components (`src/components/magicui/`) that accept raw CSS color values as props.
**How to avoid:** Either update the component prop types to accept CSS variables (`var(--color-ax-orange)`) or leave these as-is. The PLSH-02 requirement targets className-based hardcoding — prop-based color values in animation components are a separate concern. Recommend leaving Recharts + magicui props untouched in Phase 2.
**Warning signs:** If you change these props to Tailwind class names, animations break visually.

### Pitfall 6: Multiple Root Layouts Trigger Full Page Reload
**What goes wrong:** If `(marketing)/layout.tsx` contains `<html>` and `<body>` tags (making it a root layout), navigating from `/` to `/dashboard` causes a full page reload.
**Why it happens:** Two competing root layouts force a full document reload on cross-group navigation.
**How to avoid:** Keep `app/layout.tsx` as the single root layout (with `<html>` and `<body>`). Group layouts (`(marketing)/layout.tsx`, `(app)/layout.tsx`) should render only structural wrappers like `<div className="...">`.
**Warning signs:** Browser shows a full page reload (no soft navigation) when clicking the CTA from landing to dashboard.

---

## Code Examples

Verified patterns from official sources:

### Route Group Coexisting with API Routes (HIGH confidence)
```
Source: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
```
```
app/
├── (marketing)/
│   └── page.tsx        → serves /
├── (app)/
│   └── dashboard/
│       └── page.tsx    → serves /dashboard
├── api/                → serves /api/* (UNCHANGED — groups do not affect this)
│   ├── optimize/route.ts
│   ├── input-files/route.ts
│   └── load-input/route.ts
└── layout.tsx          → root layout (single, wraps all groups)
```

### Adding Design Token Tailwind Utilities in v4 (HIGH confidence)
```
Source: https://tailwindcss.com/docs/theme
```
```css
/* In globals.css — extend the existing @theme inline block */
@theme inline {
  /* Already present — generates bg-ax-cyan, text-ax-cyan, border-ax-cyan etc. */
  --color-ax-cyan: #06b6d4;
  --color-ax-cyan-light: #ecfeff;
  --color-ax-orange: #ff8c00;
  --color-ax-orange-light: #fff7ed;

  /* Add: shadow elevation tokens */
  --shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07);
  --shadow-card-hover: 0 4px 12px 0 rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.08);

  /* Add: easing tokens */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Auto-Load Default File (robust sort in route handler)
```typescript
// dashboard/src/app/api/input-files/route.ts
const files = fs
  .readdirSync(INPUT_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort((a, b) => {
    if (a === "demo_3stream.json") return -1;
    if (b === "demo_3stream.json") return 1;
    return a.localeCompare(b);
  });
```

### Group-Level Layout (structural wrapper only, NOT a root layout)
```tsx
// app/(app)/layout.tsx — wraps dashboard section
// NOTE: No <html> or <body> tags — root layout handles those
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {children}
    </div>
  );
}
```

### Replacing Hardcoded Hex with Tailwind Utilities (PLSH-02)
```tsx
// Before (hardcoded hex — found in 7 component files):
<Zap className="w-4 h-4 text-[#06b6d4]" />
<span className="text-[#06b6d4] font-bold">Optimize</span>

// After (Tailwind utility):
<Zap className="w-4 h-4 text-ax-cyan" />
<span className="text-ax-cyan font-bold">Optimize</span>
```

---

## Hardcoded Hex Audit (PLSH-02 Scope)

Files with `className`-based hardcoded hex that must be replaced:

| File | `#06b6d4` instances | `#ff8c00` instances | Notes |
|------|--------------------|--------------------|-------|
| `topbar.tsx` | 2 | 0 | Wordmark icon + text |
| `impact-header.tsx` | 2 | 2 | KPI card icons + text colors |
| `intro-tab.tsx` | 4 | 7 | Stream pair cards, stat badges, hero badge |
| `manifest-tab.tsx` | 2 | 2 | Stream color table + shimmer prop |
| `operation-tab.tsx` | 5 | 6 | Step colors, cost spans, stream color objects |
| `cost-story.tsx` | 4 | 2 | Table headers, savings values |
| `recipe-tab.tsx` | 2 | 2 | Phase card borders, empty-state text |

**Excluded from replacement (keep as hex):**
- `const STREAM_COLORS = ["#ff8c00", "#06b6d4", ...]` — Recharts `fill` props require literal CSS colors
- `<BorderBeam colorFrom="#ff8c00" colorTo="#06b6d4">` — magicui animation component props
- `<ShimmerButton shimmerColor="#ff8c00">` — magicui prop
- `globals.css` CSS-in-JS `.card-accent-*`, `.stream-*`, `.progress-*` classes — these are utility classes, not component code; leave as-is or convert to CSS vars in a later phase

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` `extend.colors` | `@theme inline` in CSS | Tailwind v4 (this project already uses v4) | No JS config file; tokens live in globals.css |
| `pages/` directory | App Router (`app/`) | Next.js 13+ | Already migrated; route groups are App Router-only |
| Separate repos for landing + app | Route groups in single Next.js app | Next.js 13+ | Same build, same deploy, different layouts |

---

## Open Questions

1. **Does the landing page (Phase 3) need to be a Server Component?**
   - What we know: Current `page.tsx` is `"use client"` with React state. The landing page has no interactive optimization state.
   - What's unclear: Whether Framer Motion animations on the landing page require client boundary.
   - Recommendation: Make `(marketing)/page.tsx` a Server Component; wrap animated sections in `"use client"` sub-components. This is a Phase 3 concern — Phase 2 only creates the scaffold.

2. **Should `(app)/dashboard/page.tsx` keep `"use client"` at the page level?**
   - What we know: The current `page.tsx` owns all state and must be a Client Component.
   - What's unclear: Nothing — it must remain `"use client"` since it uses `useState`, `useEffect`, `useCallback`.
   - Recommendation: Keep `"use client"` at the top of the moved file. No change needed.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.0+ |
| Config file | `pyproject.toml` (`[tool.pytest.ini_options]`) |
| Quick run command | `cd /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition && ~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -q` |
| Full suite command | `cd /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition && ~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -v` |
| Next.js build check | `cd /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition/dashboard && npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLSH-01 | Design tokens present in globals.css | manual-only | Visual inspection + CSS grep | N/A |
| PLSH-02 | No `text-[#06b6d4]` or `text-[#ff8c00]` in component className strings | automated grep | `grep -r "text-\[#06b6d4\]\|text-\[#ff8c00\]" dashboard/src/components/ --include="*.tsx"` (expect 0 results) | N/A |
| UX-04 | Dashboard loads demo data on first visit | manual smoke | Open `http://localhost:3000/dashboard` with no prior session, verify streams table is populated | N/A |
| Build integrity | No TypeScript or route conflicts | automated | `cd dashboard && npm run build` | ✅ |
| Existing Python tests | Algorithm unaffected by scaffold changes | automated | `python -m pytest tests/ -v` | ✅ `tests/test_core.py` |

### Sampling Rate
- **Per task commit:** `npm run build` (TypeScript + route conflict check)
- **Per wave merge:** `npm run build` + grep for hardcoded hex
- **Phase gate:** Build green + manual smoke test of `/` and `/dashboard` routes + zero hex grep hits in components before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure (pytest for Python, `npm run build` for TypeScript) covers all phase requirements. No new test files required for Phase 2.

---

## Sources

### Primary (HIGH confidence)
- Next.js official docs (fetched 2026-03-25) — Route groups: URL transparency, API route isolation, multiple layouts caveat
  - https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- Next.js official docs (fetched 2026-03-25) — Layouts and nested layouts: group layout vs root layout distinction
  - https://nextjs.org/docs/app/getting-started/layouts-and-pages
- Tailwind CSS official docs — `@theme inline` directive, `--color-*` and `--shadow-*` token registration
  - https://tailwindcss.com/docs/theme

### Secondary (MEDIUM confidence)
- Direct code inspection: `dashboard/src/app/globals.css` — confirmed `@theme inline` already has `--color-ax-cyan` and `--color-ax-orange` registered as literal hex values
- Direct code inspection: `dashboard/src/app/api/*/route.ts` — confirmed `process.cwd()` usage; `PROJECT_ROOT = path.resolve(process.cwd(), "..")` is filesystem-based, unaffected by route group topology
- Direct code inspection: `dashboard/src/components/dashboard/topbar.tsx` — confirmed auto-select logic already present at lines 26-28

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Route group isolation: HIGH — verified against Next.js 16.x official docs fetched 2026-03-25
- API route URL invariance: HIGH — official docs explicit; confirmed by route.ts code inspection
- Tailwind v4 `@theme inline` token generation: HIGH — official Tailwind docs + existing globals.css confirms pattern already in use
- Hardcoded hex audit: HIGH — direct grep across all component files
- Auto-load behaviour: HIGH — direct code inspection of topbar.tsx and input-files/route.ts

**Research date:** 2026-03-26
**Valid until:** 2026-06-26 (stable Next.js + Tailwind APIs; route group spec is stable)
