# Architecture Patterns

**Domain:** Landing page + functional dashboard demo for SCWO waste-stream optimization
**Researched:** 2026-03-26

## Recommended Architecture

### High-Level: Route Group Split with Shared Design System

```
dashboard/src/app/
  layout.tsx                  # Root layout: fonts, metadata, <html>/<body> only
  (marketing)/                # Route group: landing page, NO topbar/dashboard chrome
    layout.tsx                # Marketing layout: full-viewport, scroll-based, no nav shell
    page.tsx                  # Landing page: hero -> problem -> solution -> demo CTA
  (app)/                      # Route group: functional dashboard with topbar + tabs
    layout.tsx                # App layout: sticky topbar, max-width container, tab shell
    page.tsx                  # Dashboard: current page.tsx content (state, tabs, results)
    api/                      # All existing API routes move here unchanged
      optimize/route.ts
      input-files/route.ts
      load-input/route.ts
  (docs)/                     # Route group: model assumptions / methodology (optional, phase 2)
    assumptions/page.tsx      # Progressive disclosure assumptions page
```

**Why route groups:** Next.js App Router route groups `(groupName)` share the URL namespace but allow different layouts. The marketing page gets a full-bleed cinematic layout. The dashboard gets the existing topbar + constrained-width container. Both render at `localhost:3000` paths without `/marketing/` or `/app/` URL prefixes.

**Why NOT separate apps or domains:** Single deployable artifact is a stated constraint. The demo will be shown on a laptop -- one `npm run dev` must serve everything.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Root layout** (`layout.tsx`) | Fonts (Inter + JetBrains Mono), `<html lang>`, global CSS, metadata | All pages inherit |
| **Marketing layout** (`(marketing)/layout.tsx`) | Full-viewport wrapper, no chrome, scroll-snap sections | Landing page only |
| **Landing page** (`(marketing)/page.tsx`) | Problem narrative, value prop, animated stats, CTA to dashboard | Links to `(app)/page.tsx` |
| **App layout** (`(app)/layout.tsx`) | Sticky topbar, file picker, max-w container, tab navigation shell | Dashboard page, API routes |
| **Dashboard page** (`(app)/page.tsx`) | All React state (streams, config, result, loading), tab content rendering | All dashboard components, API routes |
| **Assumptions layer** (new: `components/dashboard/assumptions-panel.tsx`) | Progressive disclosure of model assumptions, K-values, formulas | Reads from static config; receives `showTechnical` toggle |
| **Shared components** (`components/shared/`) | Brand elements used on BOTH landing and dashboard: logo, brand badge, footer | Both marketing and app layouts |
| **Dashboard components** (`components/dashboard/`) | Existing presentational components (manifest-tab, recipe-tab, etc.) | Dashboard page via props |
| **UI primitives** (`components/ui/`, `components/magicui/`) | shadcn/ui + Magic UI -- used everywhere | All components |

### Data Flow

**Landing Page (Static -- No Data Flow)**

```
User opens / (root URL)
  -> (marketing)/layout.tsx renders full-bleed wrapper
  -> (marketing)/page.tsx renders:
     1. Hero section (animated gradient text, brand colors)
     2. Problem section (waste processing costs, pain points)
     3. Solution section (blending concept, complementary pairs visual)
     4. Social proof section (stats: 36-47% savings, 99.99% DRE)
     5. CTA: "Try the Demo" button -> navigates to /dashboard
  -> No API calls, no state, pure presentational
  -> Server Component (no "use client" needed for most sections)
```

**Dashboard (Current Architecture -- Preserved)**

```
User navigates to /dashboard (or clicks CTA from landing)
  -> (app)/layout.tsx renders topbar + container
  -> (app)/page.tsx ("use client") manages all state:
     selectedFile, streams, config, result, loading, showTechnical, activeTab, error
  -> File load: GET /api/load-input -> setStreams + setConfig
  -> Optimization: POST /api/optimize -> spawn Python -> setResult
  -> All child components are presentational (props down, callbacks up)
```

**Assumptions Layer (New -- Embedded in Dashboard)**

```
Assumptions data lives as a static TypeScript module:
  lib/assumptions.ts
    -> exports ASSUMPTIONS: Assumption[]
    -> exports K_VALUES: KValue[]
    -> exports FORMULAS: Formula[]

Dashboard page passes showTechnical state to:
  -> AssumptionsPanel component (new, replaces/augments ExpertOverrides)
  -> Each formula card shows:
     Plain-language summary (always visible)
     Mathematical notation (toggle)
     Derivation notes + confidence badge (toggle)
```

## Patterns to Follow

### Pattern 1: Route Groups for Layout Isolation

**What:** Use Next.js `(groupName)` directories to give marketing and dashboard pages different layouts without affecting URL structure.

**When:** You need the landing page at `/` and the dashboard at `/dashboard`, with completely different page chrome.

**Example:**
```
src/app/
  layout.tsx          # Shared: fonts, CSS imports, <html>
  (marketing)/
    layout.tsx        # No topbar, no max-width, full-bleed
    page.tsx          # / (root URL)
  (app)/
    layout.tsx        # Topbar + constrained container
    dashboard/
      page.tsx        # /dashboard
    api/              # API routes stay grouped under (app)
```

The root URL `/` serves the landing page. `/dashboard` serves the app. Both share the same root layout (fonts, global CSS) but have completely different page structures.

### Pattern 2: Progressive Disclosure for Chemistry Assumptions

**What:** A three-tier information architecture for the model assumptions, serving all three audiences simultaneously.

**When:** Displaying K-values, formulas, and model assumptions that must satisfy a chemistry professor, a plant operator, AND a business evaluator.

**Tier structure:**

```
Tier 1 (Always visible): Plain-language summary
  "We estimate how much neutralizer (NaOH) each batch needs based on
   the fluorine content and acidity of the waste."

Tier 2 (Click to expand): Formula + units + visual diagram
  acid_load = fluorine_ppm x 0.053 meq/(L*ppm)
  base_contribution = max(0, pH - 7) x 50 meq/(L*pH_unit)
  neutralizer_needed = max(0, acid_load - base_contribution) x 8.28e-5 L/meq

Tier 3 (Toggle "Show derivation"): Stoichiometric derivation + confidence badge
  "0.053: 1 ppm F- = 1 mg/L, MW(F) = 19, -> 0.053 mmol/L = 0.053 meq/L"
  [Badge: "Theoretical -- awaiting operational calibration"]
```

**Data model:**
```typescript
interface Assumption {
  id: string;                    // "A1" through "A9"
  title: string;                 // Plain language, no jargon
  summary: string;               // Tier 1: one sentence a plant operator understands
  formula?: string;              // Tier 2: mathematical expression
  formula_plain?: string;        // Tier 2: formula in words
  derivation?: string;           // Tier 3: how the value was obtained
  confidence: "validated" | "theoretical" | "pending";
  affects: string[];             // Which outputs this assumption impacts
}

interface KValue {
  key: string;                   // "K_F_TO_ACID"
  display_name: string;          // "Fluorine-to-acid conversion"
  value: number;
  unit: string;
  plain_explanation: string;     // "How much acid 1 ppm of fluorine creates"
  derivation: string;            // Stoichiometric basis
  confidence: "validated" | "theoretical" | "pending";
}
```

### Pattern 3: Shared Brand Component Library

**What:** Extract brand-consistent elements used on both landing page and dashboard into a `components/shared/` directory.

**When:** Logo, color tokens, typography classes, and structural patterns must be identical across marketing and app surfaces.

**Components to share:**
```
components/shared/
  ax-logo.tsx           # AxNano wordmark (used in topbar AND landing hero)
  brand-badge.tsx       # Confidence/status badges with Ax color coding
  section-heading.tsx   # Consistent heading style (uppercase, tracking-wider, slate-500)
  stat-card.tsx         # KPI display card (used in landing stats AND impact-header)
  footer.tsx            # Consistent footer on both surfaces
```

### Pattern 4: Server Components for Landing, Client Components for Dashboard

**What:** The landing page should be a Server Component (fast initial load, no JS hydration needed). The dashboard must be a Client Component (manages interactive state).

**When:** Landing page content is static/presentational. Dashboard has state, effects, and user interactions.

**Implication:** The landing page can use `framer-motion` for animations (client component islands) while keeping the bulk of the page server-rendered. Use the `"use client"` directive only on specific animated sections, not the whole page.

```tsx
// (marketing)/page.tsx -- Server Component (default)
import { HeroSection } from "@/components/marketing/hero";      // "use client" for animation
import { ProblemSection } from "@/components/marketing/problem"; // Server Component
import { SolutionSection } from "@/components/marketing/solution"; // Server Component
import { CTASection } from "@/components/marketing/cta";         // "use client" for shimmer button

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <CTASection />
    </main>
  );
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Monolithic "use client" Landing Page

**What:** Wrapping the entire landing page in `"use client"`.
**Why bad:** Sends unnecessary JavaScript to the browser. Landing page is mostly static content -- the animation library (framer-motion) only needs client rendering for specific interactive elements.
**Instead:** Keep landing page as a Server Component. Use `"use client"` only on animated sub-components (hero, CTA button).

### Anti-Pattern 2: Shared State Between Landing and Dashboard

**What:** Using React Context or a global store that bridges the marketing page and dashboard.
**Why bad:** Landing page has no state. Dashboard state is self-contained. A shared store adds complexity for zero benefit and prevents the landing page from being a Server Component.
**Instead:** Landing page links to `/dashboard` with a regular `<Link>`. Dashboard manages its own state in `page.tsx` exactly as it does now.

### Anti-Pattern 3: Separate `/assumptions` Route

**What:** Putting model assumptions on a standalone page that users must navigate to.
**Why bad:** Context switch. The user is evaluating results -- they need to see assumptions IN CONTEXT with the data, not on a separate page. Forces the user to remember what they were looking at.
**Instead:** Embed assumptions as an expandable panel within the dashboard, adjacent to the results it explains. The current `ExpertOverrides` component has the right idea but needs the progressive disclosure tiers.

### Anti-Pattern 4: Jargon in Component Names Leaking to UI

**What:** Using `r_water`, `BTU_eff`, `Gatekeeper` in user-facing labels because component code uses those names internally.
**Why bad:** PROJECT.md explicitly lists jargon to eliminate. Internal variable names are fine; user-facing strings must use the plain-language mappings.
**Instead:** Create a `lib/labels.ts` mapping: `{ r_water: "Water Added", r_diesel: "Fuel Supplement", r_naoh: "Neutralizer", BTU_eff: "Effective Energy" }`. Components reference the map for display strings while keeping internal prop names aligned with the Python data model.

### Anti-Pattern 5: Duplicating Brand Colors as Inline Strings

**What:** Hardcoding `#06b6d4` and `#ff8c00` throughout component files (currently done everywhere).
**Why bad:** 40+ instances of hardcoded hex codes. One brand color change requires a mass find-replace.
**Instead:** Use the CSS custom properties already defined in `globals.css` (`--color-ax-cyan`, `--color-ax-orange`). Reference as `text-[var(--color-ax-cyan)]` or better, extend Tailwind config with `ax-cyan` and `ax-orange` utility classes.

## User Journey Flow

### Visitor -> Understand -> Try Demo -> Trust Results

```
LANDING PAGE (/)
  |
  |  1. HOOK (3 seconds)
  |     Hero: "Cut waste processing costs 36-47%"
  |     Animated gradient text, premium feel
  |
  |  2. PROBLEM (scroll)
  |     "Each waste stream processed alone wastes fuel, chemicals, and time"
  |     Visual: 3 solo waste streams, each with high cost bars
  |
  |  3. INSIGHT (scroll)
  |     "Complementary wastes cancel each other's expensive properties"
  |     Visual: blending pairs (high BTU + low BTU, acidic + alkaline)
  |     [Reuse existing BLENDING_PAIRS data from intro-tab.tsx]
  |
  |  4. PROOF (scroll)
  |     Stats bar: 36-47% savings | 5 streams | 0.01s optimization | 99.99% DRE
  |     [Reuse existing STATS data from intro-tab.tsx]
  |
  |  5. CTA
  |     "See It Work" shimmer button -> /dashboard
  |
  v
DASHBOARD (/dashboard)
  |
  |  6. ORIENT (auto-load example data)
  |     Topbar shows loaded file name
  |     Waste Streams tab auto-selected with pre-loaded 3-stream example
  |     User sees the input data immediately -- no blank state
  |
  |  7. RUN (one click)
  |     "Optimize" button (Ax-Orange, prominent)
  |     Loading shimmer during Python execution (~0.01s for 3 streams)
  |
  |  8. IMPACT (results appear)
  |     Impact header: savings %, diesel reduction %, runtime
  |     Optimization tab auto-selected: phase cards + cost breakdown
  |
  |  9. TRUST (dig deeper)
  |     Cost Story: side-by-side baseline vs optimized
  |     Operation tab: plain-language step-by-step for operators
  |     Assumptions panel (progressive disclosure):
  |       Tier 1: "Here's what we assumed" (plain language)
  |       Tier 2: Formulas (expandable)
  |       Tier 3: Derivations + confidence badges (expandable)
  |
  |  10. CREDIBILITY (for professors/technical reviewers)
  |      All K-values flagged "Theoretical -- awaiting calibration"
  |      Assumption IDs (A1-A9) traceable through documentation
  |      Safety checks with pass/fail indicators per phase
```

## Chemistry Validation / Assumptions Layer Architecture

### Data Architecture

All assumption metadata lives in a single TypeScript module. This is the source of truth for what the UI displays about model confidence.

```typescript
// lib/assumptions.ts

export const ASSUMPTIONS: Assumption[] = [
  {
    id: "A1",
    title: "Fixed reactor capacity",
    summary: "The reactor processes a fixed total flow of 11 L/min, shared between waste and all additives.",
    formula: "F_total = 11.0 L/min",
    formula_plain: "Total flow into reactor is always 11 liters per minute",
    confidence: "validated",
    affects: ["throughput", "runtime", "all costs"],
  },
  {
    id: "A2",
    title: "Synchronous flow equation",
    summary: "Waste throughput = total capacity divided by (1 + all additive ratios). More additives means less waste processed per minute.",
    formula: "W = F_total / (1 + r_water + r_diesel + r_naoh)",
    formula_plain: "Waste flow = 11 / (1 + water ratio + fuel ratio + neutralizer ratio)",
    confidence: "validated",
    affects: ["throughput", "runtime"],
  },
  // ... A3 through A9
];

export const K_VALUES: KValue[] = [
  {
    key: "K_F_TO_ACID",
    display_name: "Fluorine-to-acid conversion",
    value: 0.053,
    unit: "meq / (L * ppm)",
    plain_explanation: "Each ppm of fluorine in the waste creates this much acid that needs to be neutralized",
    derivation: "Stoichiometric: 1 ppm F- = 1 mg/L, molecular weight of F = 19 g/mol, so 1 ppm = 0.053 mmol/L = 0.053 meq/L (monovalent)",
    confidence: "theoretical",
  },
  // ... K_PH_TO_BASE, K_ACID_TO_NAOH_VOL
];
```

### Component Architecture

```
AssumptionsPanel (replaces ExpertOverrides)
  |
  +-- AssumptionCard (one per A1-A9)
  |     Tier 1: summary (always visible)
  |     Tier 2: formula (expandable)
  |     Tier 3: derivation + confidence badge (expandable)
  |
  +-- KValueCard (one per K-value)
  |     Current value + unit
  |     Plain explanation
  |     "Pending Calibration" badge
  |     Expandable: stoichiometric derivation
  |
  +-- FormulaCard (key formulas: r_water, r_diesel, r_naoh, W, cost)
        Plain-language explanation
        Mathematical formula
        Expandable: step-by-step walkthrough
```

### Confidence Badge System

| Badge | Color | Meaning |
|-------|-------|---------|
| Validated | `bg-cyan-50 text-cyan-700 border-cyan-300` | Confirmed with operational data |
| Theoretical | `bg-amber-50 text-amber-700 border-amber-300` | Based on chemistry/physics, not yet field-tested |
| Pending | `bg-red-50 text-red-700 border-red-300` | Placeholder value, needs real data |

### Where It Lives in the Dashboard

The assumptions panel is NOT a separate tab. It is embedded in two places:

1. **Bottom of Optimization tab** -- collapsed by default, "How did we calculate this?" expand trigger
2. **Phase Details tab** -- each phase card includes a "View assumptions" link that scrolls to the relevant assumption

This keeps assumptions in context with results rather than isolated on a separate page.

## Suggested Build Order

Build in this order to maximize unblocking:

### Phase 1: Route Group Scaffold + Shared Components

1. Create route group directories: `(marketing)/`, `(app)/`
2. Move existing `page.tsx` to `(app)/dashboard/page.tsx`
3. Move API routes into `(app)/api/`
4. Create root `layout.tsx` (fonts + global CSS only)
5. Create `(marketing)/layout.tsx` (full-bleed) and `(app)/layout.tsx` (topbar + container)
6. Extract shared components: `ax-logo.tsx`, `brand-badge.tsx`, `stat-card.tsx`
7. Create `lib/labels.ts` jargon-to-plain-language mapping
8. Verify dashboard still works at `/dashboard`

**Unblocks:** Everything else. This is the structural foundation.

### Phase 2: Landing Page

1. Create `(marketing)/page.tsx` as Server Component
2. Build marketing sections: `hero.tsx`, `problem.tsx`, `solution.tsx`, `cta.tsx`
3. Reuse BLENDING_PAIRS and STATS data from existing `intro-tab.tsx`
4. CTA links to `/dashboard`
5. Existing `intro-tab.tsx` in the dashboard can be simplified (it currently duplicates what the landing page will cover)

**Unblocks:** The complete visitor-to-demo journey.

### Phase 3: Assumptions Layer

1. Create `lib/assumptions.ts` with all A1-A9 and K-value metadata
2. Build `AssumptionsPanel`, `AssumptionCard`, `KValueCard` components
3. Replace `ExpertOverrides` with the new progressive-disclosure panel
4. Add "How did we calculate this?" expandable section to Optimization tab
5. Extend Tailwind config with `ax-cyan`, `ax-orange` utility classes (eliminate hardcoded hex)

**Unblocks:** Trust layer for professors and technical reviewers.

### Phase 4: Dashboard UX Polish (Jargon Elimination)

1. Apply `lib/labels.ts` mappings throughout all dashboard components
2. Rename tabs: "Phase Details" -> "Technical Detail" (or remove tab, fold into assumptions)
3. Ensure all user-facing text passes the "plant operator can read this" test
4. Auto-load example data on first visit to `/dashboard` (no blank state)

**Unblocks:** Non-technical audience readiness.

## Scalability Considerations

| Concern | Demo (now) | 10 Customers | Production |
|---------|------------|--------------|------------|
| State management | useState in page.tsx | useState in page.tsx (still fine) | Consider Zustand if >15 state atoms |
| API | Subprocess bridge | Subprocess bridge | Persistent Python server (FastAPI) |
| Data persistence | File-based JSON | File-based JSON | Database + user auth |
| Deployment | `npm run dev` on laptop | Vercel + Python on Railway/Fly | Vercel + containerized Python |
| Landing page | Static, no CMS | Static, no CMS | CMS-backed if marketing team needs edits |

For the demo prototype, the current architecture (subprocess bridge, file-based input, useState) is appropriate. Do not over-engineer.

## Sources

- Next.js App Router Route Groups: based on Next.js 14-16 App Router documentation pattern. Route groups with `(groupName)` syntax provide layout isolation without affecting URL paths. **MEDIUM confidence** -- based on training data; could not verify against live docs due to WebSearch being unavailable.
- Existing codebase analysis: direct code inspection of `dashboard/src/app/`, `smart_feed_v9/`, and all component files. **HIGH confidence**.
- Progressive disclosure pattern for technical documentation: established UX pattern widely documented in information architecture literature. **HIGH confidence**.
- shadcn/ui v4 + @base-ui/react patterns: confirmed from `package.json` versions and existing component usage. **HIGH confidence**.

---

*Architecture research: 2026-03-26*
