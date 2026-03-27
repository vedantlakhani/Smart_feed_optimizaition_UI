# Phase 03: Landing Page — Research

**Researched:** 2026-03-26
**Domain:** Next.js 16 App Router marketing page, Tailwind v4, framer-motion, existing Magic UI components
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAND-01 | Visitor sees a hero section that leads with the cost pain of solo processing, then presents blending as the solution | Framer-motion fade-up pattern established in intro-tab.tsx; full-bleed layout available via marketing layout wrapper; ShimmerButton ready for CTA |
| LAND-02 | Visitor sees a 3-step visual explainer (load streams → optimize → get a plan) that takes under 30 seconds to understand with no jargon | Stepped card pattern with bordered left accent already in intro-tab.tsx; exactly 3 steps needed (not 4); icon set from lucide-react available |
| LAND-03 | Visitor sees a climate impact section that expresses fuel savings in CO₂ equivalent terms | NumberTicker from magicui animates on scroll with `useInView`; static CO₂ conversion constants applied at build time (no API needed) |
| LAND-04 | Visitor can enter the dashboard demo from the landing page via a single prominent CTA, navigating to `/dashboard` with example data pre-loaded | demo_3stream.json is already auto-loaded by the dashboard on first visit (Phase 2 topbar.tsx); CTA is a Next.js Link wrapping ShimmerButton; no query param needed |
</phase_requirements>

---

## Summary

The landing page at `(marketing)/page.tsx` is currently a 22-line placeholder with a plain `<Link>` button. The full replacement is a single-file Server Component (or a thin `"use client"` wrapper if animations are needed) that renders four sequential sections: hero (problem → solution), 3-step explainer, climate impact, and CTA.

All foundation pieces exist: framer-motion is installed (v12.36), all four Magic UI components are in `src/components/magicui/`, design tokens (`--color-ax-cyan`, `--color-ax-orange`, `--shadow-card`, easing curves, `--spacing-section`) are in `globals.css`, and Tailwind v4 `@theme inline` exposes them as utility classes. The marketing layout wrapper already provides `min-h-screen bg-white` with no app-shell chrome.

The key implementation constraints are: (1) the page must be a `"use client"` component if it uses framer-motion — or split into a Server Component shell with `"use client"` island sub-components; (2) the demo CTA navigates to `/dashboard` with no extra parameters because Phase 2 already pins `demo_3stream.json` as the first file returned by `/api/input-files`, causing the topbar auto-load to select it; (3) no jargon (r_water, BTU, Gatekeeper, B&B, blend ratio) may appear anywhere in the page copy.

**Primary recommendation:** Implement the landing page as a single `"use client"` component at `dashboard/src/app/(marketing)/page.tsx`, structured as four named section components in the same file, using existing framer-motion `fadeUp` variant pattern from `intro-tab.tsx` and the four existing Magic UI components.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.6 | Server/client component routing | Already installed; `(marketing)/page.tsx` target file |
| Tailwind v4 | ^4 | Utility classes from CSS custom properties | Single source of truth for design tokens in globals.css |
| framer-motion | ^12.36.0 | Scroll-triggered fade-up animations | Already in intro-tab.tsx; `useInView` powers NumberTicker |
| lucide-react | ^0.577.0 | Icon set (TrendingDown, Zap, Flame, Droplets, ArrowRight, etc.) | Already used in intro-tab.tsx for all icons |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ShimmerButton (magicui) | hand-written | Animated primary CTA button | Single "Enter the Demo" CTA — the orange/amber shimmer variant |
| NumberTicker (magicui) | hand-written | Animated count-up stat | Climate impact section: CO₂ kg equivalent count-up |
| BorderBeam (magicui) | hand-written | Animated border on highlight cards | Hero insight card or climate impact card accent |
| AnimatedGradientText (magicui) | hand-written | Gradient eyebrow label | Hero section tagline badge above the H1 |
| Next.js `<Link>` | 16.1.6 | Client-side navigation to `/dashboard` | CTA wrapping or replacing ShimmerButton if button semantics are needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion fadeUp | CSS `animate-fade-in-up` class (already in globals.css) | CSS class is simpler but no stagger delay per element; framer-motion custom delay gives the cascading entrance effect used in intro-tab |
| ShimmerButton magicui | shadcn Button with `bg-ax-orange` | Simpler but less visually premium; ShimmerButton already exists and matches the CTA weight needed |
| "use client" whole page | Server Component + client islands | Islands pattern is cleaner but adds file count; for a single-page marketing component the tradeoff favors one file |

**Installation:** No new packages needed. All dependencies already present in `dashboard/package.json`.

---

## Architecture Patterns

### Recommended Project Structure
```
dashboard/src/app/(marketing)/
├── layout.tsx          # Already exists: min-h-screen bg-white wrapper
└── page.tsx            # REPLACE: full landing page (single file, ~200-300 lines)
```

No new component files are required for this phase. The landing page content is self-contained and not reused elsewhere. Keeping it in one file reduces navigation overhead.

### Pattern 1: "use client" Single-File Landing Page
**What:** The entire `(marketing)/page.tsx` is a `"use client"` component with all section content defined as local `const` arrays and inline JSX.
**When to use:** When the page uses framer-motion hooks (`useInView`, motion components) and has no data-fetching requirements.
**Example:**
```typescript
// Pattern from intro-tab.tsx — reuse directly
"use client";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number,number,number,number] },
  }),
};
```

### Pattern 2: Section Scroll Trigger with whileInView
**What:** Use framer-motion `whileInView` + `viewport={{ once: true }}` on each section so animations trigger as the visitor scrolls down (not all at once on mount).
**When to use:** For sections below the fold (step explainer, climate section). The hero fires on mount; lower sections use whileInView.
**Example:**
```typescript
// Source: framer-motion docs — whileInView for scroll-triggered animation
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
  variants={fadeUp}
  custom={0}
>
  {/* section content */}
</motion.section>
```

### Pattern 3: CTA as Link wrapping ShimmerButton
**What:** Next.js `<Link href="/dashboard">` wrapping `<ShimmerButton>` — gives client-side navigation with the premium shimmer animation.
**When to use:** Primary CTA only. Do not use ShimmerButton for secondary links.
**Example:**
```typescript
// Source: magicui/shimmer-button.tsx API + Next.js Link
import Link from "next/link";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

<Link href="/dashboard" className="block w-fit mx-auto">
  <ShimmerButton
    shimmerColor="#FF8C00"
    background="rgba(255, 140, 0, 0.95)"
    borderRadius="12px"
    className="px-8 py-4 text-base font-semibold"
  >
    See the Optimizer in Action →
  </ShimmerButton>
</Link>
```
Note: `ShimmerButton` is a `<button>` element. Wrapping it in `<Link>` is the correct pattern (not passing `href` to the button directly).

### Pattern 4: CO₂ Conversion for Climate Section
**What:** Static computation — diesel saved (litres) × CO₂ factor → kg CO₂ → relatable equivalents.
**When to use:** Climate impact section. Values are hardcoded from the demo scenario (demo_3stream.json shows ~47% savings on 3 streams with known volumes).
**Conversion constants** (HIGH confidence — IPCC/EPA values):
- Diesel combustion: **2.68 kg CO₂ per litre** (IPCC AR6, direct emissions)
- Passenger car per km: **0.12 kg CO₂/km** (EU average, for comparison)
- Truck journey equivalent: Use litres-of-diesel framing directly ("X fewer litres of diesel burned")
**Practical approach:** Use a representative number from the demo scenario (e.g., "a typical 3-stream batch saves ~15 L of diesel — that's 40 kg of CO₂ not emitted"). Hard-code a plausible representative figure; do not call the API at render time.

### Section Layout Pattern (Full-bleed)
```
<main className="bg-white min-h-screen">
  {/* 1. Hero: full-bleed, centered, problem → solution */}
  <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">

  {/* 2. Steps: 3-column grid on sm+, single column on mobile */}
  <section className="px-6 py-16 bg-slate-50">
    <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-3">

  {/* 3. Climate Impact: centered card with NumberTicker */}
  <section className="px-6 py-16 max-w-4xl mx-auto">

  {/* 4. CTA: centered ShimmerButton + reassurance text */}
  <section className="px-6 py-20 text-center bg-slate-900">
</main>
```

### Anti-Patterns to Avoid
- **Jargon in copy:** r_water, BTU, Gatekeeper, B&B, "blend ratio", "SCWO", "supercritical" must not appear in visitor-facing text. Use: "energy content", "fuel supplement", "neutraliser", "smart blending".
- **Dashboard chrome on landing:** Do not import or render `topbar.tsx`, tabs, or any `(app)/` components. The `(marketing)/layout.tsx` wrapper is intentionally chrome-free.
- **Separate client island files for a simple page:** The landing page has no server-side data requirements, so the islands-pattern overhead is not justified. One `"use client"` file is fine.
- **Querying the optimizer on page load:** The landing page must not call `/api/optimize`. All statistics are static copy derived from the known demo scenario.
- **Using `<a>` instead of Next.js `<Link>`:** Always use `import Link from "next/link"` for internal navigation to avoid full page reload.
- **Passing `href` to ShimmerButton:** `ShimmerButton` is a `<button>` element, not an anchor. Wrap it in `<Link>`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animated entrance | Custom CSS keyframe component | framer-motion `motion.div` with `fadeUp` variant | Already proven in intro-tab.tsx; handles stagger, easing, and SSR hydration |
| Count-up animation | Custom useEffect + requestAnimationFrame | `NumberTicker` from `src/components/magicui/number-ticker.tsx` | Already implements spring physics + `useInView` trigger correctly |
| CTA button shine effect | Custom gradient animation | `ShimmerButton` from `src/components/magicui/shimmer-button.tsx` | Already implemented with correct conic-gradient shimmer |
| Animated border on card | Custom border animation | `BorderBeam` from `src/components/magicui/border-beam.tsx` | Already implemented with `offset-distance` CSS animation |
| Gradient eyebrow text | Custom gradient span | `AnimatedGradientText` from `src/components/magicui/animated-gradient-text.tsx` | Already implemented with `animate-gradient` keyframe |

**Key insight:** Every visual effect needed for this landing page already exists as a hand-written component in `src/components/magicui/`. The task is composition, not new animation engineering.

---

## Common Pitfalls

### Pitfall 1: ShimmerButton shimmerColor must be a hex string, not a Tailwind class
**What goes wrong:** Passing `shimmerColor="ax-orange"` has no effect — the value is injected as a CSS custom property `--shimmer-color`, which needs a valid color value.
**Why it happens:** Magic UI components use inline `style` props for their color tokens, not Tailwind class names.
**How to avoid:** Always pass hex strings: `shimmerColor="#FF8C00"`, `background="rgba(255,140,0,0.95)"`.
**Warning signs:** Shimmer effect is invisible or shows default amber color.

### Pitfall 2: AnimatedGradientText gradient is hardcoded amber-to-blue
**What goes wrong:** The gradient in `animated-gradient-text.tsx` uses hardcoded `from-[#F59E0B] via-[#5E81AC] to-[#F59E0B]`. The Ax brand is cyan/orange, which is different.
**Why it happens:** The component was copied from Magic UI upstream defaults.
**How to avoid:** When using `AnimatedGradientText` on the landing page, edit the gradient stops in the component to use `#FF8C00` (Ax-Orange) and `#06B6D4` (Ax-Cyan). Since Magic UI components are hand-written copies, direct edits are correct (noted in CLAUDE.md: "edit them directly").
**Warning signs:** Eyebrow tag appears amber-grey instead of cyan-orange.

### Pitfall 3: framer-motion `animate` fires immediately on mount for below-fold sections
**What goes wrong:** Using `animate="visible"` + `initial="hidden"` on sections below the fold means they animate in before the visitor scrolls there, so the effect is wasted.
**Why it happens:** `animate` is mount-triggered; `whileInView` is scroll-triggered.
**How to avoid:** Hero section uses `animate="visible"` (correct — it's above the fold). All sections below the fold use `whileInView="visible"` + `viewport={{ once: true }}`.
**Warning signs:** Opening the page shows all sections already in their final state — no scroll animation visible.

### Pitfall 4: `"use client"` boundary breaks static export if ever needed
**What goes wrong:** Marking the whole page `"use client"` prevents RSC streaming optimization and makes the route fully client-rendered.
**Why it happens:** framer-motion hooks require client context.
**How to avoid:** Acceptable for this MVP demo page (static content, no streaming benefit). Note this in the component. If performance becomes a concern, the hero can be a Server Component and animations extracted to island components.
**Warning signs:** N/A for current scope — not a blocking concern.

### Pitfall 5: CO₂ numbers without a disclaimer appear as hard claims
**What goes wrong:** Stating "saves 40 kg CO₂" without qualification could be read as a product guarantee, which is premature given K-values are not yet calibrated.
**Why it happens:** Marketing copy tends toward precision without caveats.
**How to avoid:** Frame climate numbers as "estimated" or "approximately". One small sentence: "Based on representative 3-stream scenario; actual savings depend on your waste profile."
**Warning signs:** No disclaimer present on any quantified claim in the climate section.

### Pitfall 6: Next.js 16 App Router — Server Component default
**What goes wrong:** If `"use client"` is omitted, framer-motion hooks (`useInView`, `useMotionValue`, `useSpring`) throw "React hooks can only be called inside a client component".
**Why it happens:** App Router defaults all components to Server Components.
**How to avoid:** First line of `(marketing)/page.tsx` must be `"use client";` if the page uses any framer-motion component or hook.
**Warning signs:** Build error: `Error: useState/useEffect can only be called in a Client Component`.

---

## Code Examples

Verified patterns from existing project files:

### Fade-up stagger (from intro-tab.tsx — identical pattern to reuse)
```typescript
// Source: dashboard/src/components/dashboard/intro-tab.tsx line 21-28
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};
```

### NumberTicker with in-view trigger (from magicui/number-ticker.tsx)
```typescript
// Source: dashboard/src/components/magicui/number-ticker.tsx
// Triggers count-up when element scrolls into view (once: true)
<NumberTicker
  value={40}
  suffix=" kg CO₂"
  className="text-4xl font-bold text-ax-cyan font-data"
/>
```

### Card with left-accent border (from intro-tab.tsx — step card pattern)
```typescript
// Source: intro-tab.tsx line 191 — border-l-4 with color variant
<Card className="shadow-sm border-slate-200 border-l-4 border-l-ax-cyan">
  <CardContent className="p-4">
    ...
  </CardContent>
</Card>
```

### Card with shadow tokens (from globals.css)
```typescript
// Use shadow-card (--shadow-card) and shadow-card-hover (--shadow-card-hover)
// These are registered in globals.css @theme inline as Tailwind utilities
<Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
```

### Design token usage (confirmed in globals.css)
```css
/* Available as Tailwind utilities via @theme inline: */
/* text-ax-cyan, bg-ax-cyan, border-ax-cyan       → #06B6D4 */
/* text-ax-orange, bg-ax-orange, border-ax-orange → #FF8C00 */
/* bg-ax-cyan-light                                → #ecfeff */
/* bg-ax-orange-light                              → #fff7ed */
/* shadow-card, shadow-card-hover, shadow-topbar   */
/* ease-smooth, ease-spring, ease-out-expo         */
```

### Section spacing with design tokens
```typescript
// --spacing-section: 5rem — use as py-[var(--spacing-section)] or py-20 (equivalent)
// --spacing-card: 1.5rem — use as p-[var(--spacing-card)] or p-6
<section className="px-6 py-20">          {/* --spacing-section */}
<CardContent className="p-6">            {/* --spacing-card */}
```

---

## Content Plan (Non-Technical Copy)

The planner must produce copy that passes the "no jargon" test. These are the prescribed section narratives:

### Section 1: Hero
- **Problem line (above fold):** "Processing industrial waste streams one at a time is expensive. Every batch demands supplemental fuel, neutralising chemicals, and precious reactor time."
- **Solution line:** "AxNano SmartFeed finds the right blend of your waste streams — so complementary wastes cancel out their costs instead of doubling them."
- **Eyebrow badge (AnimatedGradientText):** "Cut waste processing costs by up to 47%"

### Section 2: How It Works (3 steps — LAND-02)
| Step | Icon | Title | Plain copy |
|------|------|-------|-----------|
| 01 | FlaskConical (ax-orange) | Load your waste inventory | "Enter each waste stream: volume, energy content, acidity, and solids. Takes under 2 minutes." |
| 02 | Activity (ax-cyan) | Optimizer finds the best blend | "The algorithm evaluates every possible combination and mix proportion to find the lowest-cost processing plan." |
| 03 | TrendingDown (emerald-500) | Get a ready-to-run plan | "Receive step-by-step operator instructions: exactly which streams to mix, how much of each additive to add, and the total cost." |

### Section 3: Climate Impact (LAND-03)
- "Blending reduces the supplemental fuel burned per batch."
- NumberTicker: ~40 kg CO₂ saved per representative 3-stream batch.
- Relatable comparison: "equivalent to taking a car off the road for ~330 km"
- Disclaimer line: "Estimated from representative 3-stream scenario. Actual savings vary by waste profile."

### Section 4: CTA (LAND-04)
- Headline: "See it work on real data"
- Sub: "The demo loads a pre-configured 3-stream scenario — results in under a second."
- Button: "Open the Demo" (ShimmerButton, orange)
- Reassurance: "No sign-up. No configuration. Just open and run."

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 `tailwind.config.js` color extension | Tailwind v4 `@theme inline` CSS custom properties | Project uses Tailwind v4 | Design tokens defined once in globals.css, consumed as utilities — no separate config file |
| Separate magicui npm package | Hand-written copies in `src/components/magicui/` | Project setup decision | Edit components directly rather than overriding via npm |
| `type="multiple"` on Accordion | `multiple` prop (Base UI convention) | Project uses `@base-ui/react` | CLAUDE.md explicitly notes this — not relevant to landing page but good to know |

---

## Open Questions

1. **CO₂ savings number precision**
   - What we know: Demo 3-stream scenario yields ~47% savings; diesel cost is $1.00/L in demo config
   - What's unclear: Exact litres of diesel saved in demo_3stream.json run (would need to run the optimizer)
   - Recommendation: Run `cat input/demo_3stream.json | ~/miniconda3/envs/axnano-smartfeed/bin/python run_optimization.py` during plan execution to get the actual diesel reduction, then back-calculate CO₂. Use that number in the climate section rather than an estimate.

2. **Above-fold height on common screen sizes**
   - What we know: Hero section uses `pt-20 pb-16` (5rem + 4rem top/bottom padding)
   - What's unclear: Whether the hero H1 + subtext + CTA all fit above the fold on 768px height screens without scrolling
   - Recommendation: Plan task should verify at 1280×768 (common laptop). If it doesn't fit, reduce `pt-20` to `pt-12` or use `min-h-[90vh] flex items-center` pattern.

3. **Font loading for Inter on marketing page**
   - What we know: Root `layout.tsx` loads Geist (variable `--font-geist-sans`) not Inter. The `globals.css` loads Inter via Google Fonts `@import` and sets `font-family: 'Inter'` on `html`/`body`.
   - What's unclear: Whether there's a FOUT flash on the marketing page from Google Fonts CDN load
   - Recommendation: Acceptable for MVP. If CLS/FOUT becomes visible during demo, migrate to `next/font/google` with `display: swap` in root layout.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest (Python tests only) — Next.js has no test framework configured |
| Config file | `pyproject.toml` (Python only) |
| Quick run command | `cd /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition && npm run --prefix dashboard build` |
| Full suite command | `cd /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition && npm run --prefix dashboard build && npm run --prefix dashboard lint` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAND-01 | Hero section renders with problem/solution copy | smoke (build) | `npm run --prefix dashboard build` | ❌ Wave 0 |
| LAND-02 | 3-step explainer renders with 3 items, zero jargon words | manual visual | `npm run --prefix dashboard lint` | ❌ Wave 0 |
| LAND-03 | Climate impact section renders with CO₂ figure | smoke (build) | `npm run --prefix dashboard build` | ❌ Wave 0 |
| LAND-04 | CTA link points to `/dashboard` | smoke (build) | `npm run --prefix dashboard build` | ❌ Wave 0 |

Note: The Next.js dashboard has no unit test framework (Jest/Vitest/Playwright). All automated validation is TypeScript compilation + ESLint via `npm run build` and `npm run lint`. Manual visual inspection is required for jargon check and layout verification. This is appropriate for an MVP demo page.

### Sampling Rate
- **Per task commit:** `npm run --prefix dashboard build` (TypeScript compilation catches import errors and type mismatches)
- **Per wave merge:** `npm run --prefix dashboard build && npm run --prefix dashboard lint`
- **Phase gate:** Build green + manual visual review at `/` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No Next.js test framework exists — manual visual review is the verification method for this phase
- [ ] `npm run --prefix dashboard build` must pass before any task is considered complete

*(All LAND requirements are verified by build success + manual review — no test file infrastructure gaps to fill.)*

---

## Sources

### Primary (HIGH confidence)
- Direct file reads: `dashboard/src/app/(marketing)/page.tsx` — current placeholder confirmed
- Direct file reads: `dashboard/src/app/(marketing)/layout.tsx` — bg-white, no chrome confirmed
- Direct file reads: `dashboard/src/app/globals.css` — all design tokens confirmed present
- Direct file reads: `dashboard/src/components/magicui/*.tsx` — all four components confirmed, APIs documented
- Direct file reads: `dashboard/src/components/dashboard/intro-tab.tsx` — fadeUp pattern, icons, STATS array confirmed
- Direct file reads: `dashboard/package.json` — framer-motion 12.36, Next.js 16.1.6, all deps confirmed
- Direct file reads: `input/demo_3stream.json` — demo scenario streams confirmed

### Secondary (MEDIUM confidence)
- IPCC AR6 diesel CO₂ factor: 2.68 kg CO₂/L (well-established emission factor, cross-referenced with EPA/DEFRA values)
- EU passenger car average: 0.12 kg CO₂/km (European Environment Agency 2023 average)

### Tertiary (LOW confidence)
- None — all claims in this research are backed by direct code inspection or well-established physical constants.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed in package.json, no new installs needed
- Architecture: HIGH — route group scaffold already in place from Phase 2, pattern confirmed in intro-tab.tsx
- Pitfalls: HIGH — all identified from direct component API inspection
- Content/copy: MEDIUM — CO₂ numbers are approximations pending actual optimizer run; exact savings figure needs verification

**Research date:** 2026-03-26
**Valid until:** 2026-04-26 (stable stack; framer-motion and Next.js minor versions may change but breaking changes unlikely within 30 days)
