# Technology Stack

**Project:** AxNano SmartFeed Demo Package — Landing Page, Dashboard Redesign, Data Visualization
**Researched:** 2026-03-26
**Overall Confidence:** MEDIUM (WebSearch unavailable; recommendations based on training data through early 2025 + existing codebase analysis. Versions should be verified against npm before install.)

## Guiding Principle: Extend, Don't Replace

The existing dashboard runs Next.js 16.1.6, React 19, shadcn/ui 4, Framer Motion 12, Recharts 3.8, and Tailwind CSS 4. Every recommendation below either **uses what's already installed** or adds a narrowly-scoped new dependency. Zero framework migrations.

---

## Recommended Stack

### Landing Page (Next.js App Router)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js App Router (existing) | 16.1.6 | Landing page as `app/(landing)/page.tsx` | Already installed. Route groups keep landing layout separate from dashboard layout without a second build. |
| Framer Motion (existing) | ^12.36.0 | Scroll-triggered animations, section reveals, parallax | Already installed and used in `intro-tab.tsx`. `whileInView` + `viewport={{ once: true }}` gives Apple-style scroll reveals with zero new deps. |
| `next/image` (built-in) | -- | Hero imagery, product screenshots | Built into Next.js. Automatic WebP/AVIF, lazy loading, blur placeholder for premium perceived performance. |
| CSS `scroll-snap` + `IntersectionObserver` | native | Full-viewport section snapping | No library needed. Apple.com's signature "one idea per screen" is achievable with `scroll-snap-type: y mandatory` on the container and Framer Motion `whileInView` for fade-in. |

**Confidence:** HIGH for architecture pattern (App Router route groups are stable and well-documented). MEDIUM for Framer Motion 12 API specifics (verify `whileInView` still works as expected with React 19 strict mode).

### Animation & Motion

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Framer Motion (existing) | ^12.36.0 | All animations: scroll reveals, number counters, micro-interactions | Already a dependency. Covers 100% of the animation needs: `motion.div`, `AnimatePresence`, `useScroll`, `useTransform`, `whileInView`. Adding a second animation library would be waste. |
| Magic UI components (existing, hand-written) | -- | Number ticker, shimmer button, border beam, gradient text | Already in `src/components/magicui/`. Extend this pattern for new premium effects (e.g., counting-up savings numbers on the landing page). |
| CSS `@keyframes` (native) | -- | Simple looping animations (pulse, glow, shimmer) | For perpetual animations that don't need JS orchestration. Lighter than Framer Motion for always-on effects. |

**Do NOT add:** GSAP (overkill, licensing complexity for commercial use), React Spring (redundant with Framer Motion), Lottie (no complex vector animations needed in this product).

**Confidence:** HIGH. Framer Motion 12 is the dominant React animation library and already installed.

### Data Visualization (Cost Comparison Storytelling)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Recharts (existing) | ^3.8.0 | Bar charts for baseline-vs-optimized cost breakdown | Already used in `recipe-tab.tsx`. Declarative, composable, good enough for the 4-5 chart types this project needs. |
| Custom SVG components | -- | Animated progress rings, waterfall charts, Sankey-style flow | Recharts lacks waterfall/Sankey. Hand-rolling with SVG + Framer Motion gives full design control and avoids adding a heavy charting dep for 1-2 specialty charts. |
| Framer Motion `useSpring` | ^12.36.0 | Animated number transitions in KPI cards | Already installed. `useSpring` + `useTransform` for smooth counting animations (savings %, cost reductions). Better than a dedicated counter library. |

**Do NOT add:** D3.js directly (too low-level for this project's chart needs; Recharts wraps D3 internals already), Nivo (heavy bundle, overlapping with Recharts), Chart.js (canvas-based, harder to style to match shadcn/ui aesthetic), Plotly.js (500KB+ bundle, legacy dashboard only).

**Key visualization components to build:**

1. **Before/After bar chart** (Recharts) -- Baseline cost vs. Optimized cost, stacked by cost component (fuel, chemicals, labor, electricity). Already partially exists.
2. **Savings waterfall** (custom SVG + Framer Motion) -- Shows how each optimization step reduces cost. Apple-like: clean lines, animated segments dropping from baseline to optimized.
3. **KPI number tickers** (existing Magic UI `number-ticker.tsx`) -- Animate from 0 to final value on scroll-into-view. Already built.
4. **Environmental impact rings** (custom SVG + Framer Motion) -- Circular progress showing diesel reduction %, CO2 equivalent. More visual than the current `<Progress>` bars.

**Confidence:** HIGH for Recharts (proven in codebase). MEDIUM for custom SVG approach (requires implementation effort but avoids dependency bloat).

### UI Component System (Apple-like Premium Aesthetic)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn/ui (existing) | 4.0.7 | All UI primitives: cards, tables, badges, buttons, accordion | Already configured with `base-nova` style. Unstyled primitives mean we control the premium look entirely through CSS variables and Tailwind classes. |
| Tailwind CSS (existing) | ^4 | Utility-first styling, design tokens | Already installed. Tailwind 4's CSS-first config means all brand tokens (Ax-Cyan, Ax-Orange) live in `globals.css`. |
| `@base-ui/react` (existing) | ^1.3.0 | Headless primitives under shadcn | Already installed. No action needed. |
| Inter + JetBrains Mono (existing) | -- | Typography: Inter for body, JetBrains Mono for numeric data | Already loaded via Google Fonts in `globals.css`. The `font-data` class is already defined. |

**Apple-like design tokens to add (CSS variables in `globals.css`):**

```css
/* Add to :root in globals.css */
--shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
--shadow-card-hover: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
--shadow-hero: 0 24px 48px rgba(0,0,0,0.12);
--transition-default: 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
--backdrop-blur: blur(12px);
```

**Design principles (not libraries):**
- **Generous whitespace:** `py-24` to `py-32` between landing sections. Cards with `p-8` minimum.
- **Subtle shadows over borders:** Apple uses elevation (shadow) not outlines. Replace `border` cards with `shadow-card` + `hover:shadow-card-hover`.
- **Motion as meaning:** Every animation communicates something (savings counting up = value, waterfall dropping = cost reduction). No gratuitous animation.
- **One accent per section:** Either Ax-Cyan or Ax-Orange, never both competing.

**Confidence:** HIGH. This is styling guidance, not library choices. shadcn/ui is explicitly designed for this kind of customization.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` (existing) | ^0.577.0 | Icons throughout | Already used everywhere. Continue using. |
| `clsx` + `tailwind-merge` (existing) | ^2.1.1 / ^3.5.0 | Class merging via `cn()` | Already in `lib/utils.ts`. |
| `tw-animate-css` (existing) | ^1.4.0 | CSS animation utilities | Already installed for Tailwind animation classes. |

**No new npm dependencies recommended.** The existing stack covers all needs.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Animation | Framer Motion (existing) | GSAP | Commercial license required for AxNano. Framer Motion already installed and sufficient. |
| Animation | Framer Motion (existing) | React Spring | Redundant. Two animation libraries = bundle bloat + API inconsistency. |
| Charts | Recharts (existing) + custom SVG | Nivo | 200KB+ additional bundle. Recharts already handles bar/line. Custom SVG handles specialty charts with more design control. |
| Charts | Recharts (existing) | Tremor | Tremor is opinionated about visual style. Harder to match the specific Ax brand and Apple aesthetic. |
| Charts | Custom SVG | Victory | Victory's API is verbose. For 2-3 specialty charts, raw SVG + Framer Motion is simpler and lighter. |
| Landing animations | CSS scroll-snap + Framer Motion | Locomotive Scroll / Lenis | Smooth scroll libraries add complexity for minimal gain on a demo prototype. Native CSS scroll-snap is sufficient. |
| UI primitives | shadcn/ui (existing) | Radix UI directly | shadcn wraps base-ui already. Going lower adds work without benefit. |
| UI primitives | shadcn/ui (existing) | Material UI | Completely different design language. Would fight the existing Premium Light theme. |

---

## Installation

**No new packages required.** All recommended technologies are already in `dashboard/package.json`.

If the waterfall/specialty chart needs grow beyond what custom SVG can handle (unlikely for this project), the fallback would be:

```bash
cd /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition/dashboard
npm install recharts  # already installed, just noting it's the ceiling
```

### Optional (only if scroll-driven animations prove insufficient with Framer Motion alone):

```bash
# NOT recommended unless needed — evaluate first
# npm install @motionone/dom   # lightweight scroll timeline polyfill
```

---

## Landing Page Architecture Pattern

```
dashboard/src/app/
  (landing)/              # Route group — separate layout, no dashboard chrome
    layout.tsx            # Minimal layout: just <html><body>, no sidebar/tabs
    page.tsx              # Landing page — scroll-snap sections
    components/
      hero-section.tsx    # Full-viewport hero with tagline + CTA
      problem-section.tsx # "The problem" — cost pain of solo processing
      solution-section.tsx # "The solution" — blending visual
      demo-section.tsx    # Embedded mini-demo or screenshot
      cta-section.tsx     # Final call-to-action → link to /dashboard
  (dashboard)/            # Route group — existing dashboard layout
    layout.tsx            # Existing layout with topbar/tabs
    page.tsx              # Existing dashboard (renamed from current page.tsx)
```

**Why route groups:** The landing page needs a completely different layout (full-bleed, no navigation chrome) while the dashboard needs the existing topbar + tab structure. Route groups (`(landing)` and `(dashboard)`) achieve this without duplicating the Next.js app or adding complexity. Both share `globals.css`, components, and the same build.

**Confidence:** HIGH. This is a standard Next.js App Router pattern.

---

## Design System Tokens Summary

These tokens extend the existing `globals.css` theme for the landing page and redesigned dashboard:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-ax-cyan` | `#06B6D4` | Existing. Success states, optimized metrics, CTA backgrounds on landing. |
| `--color-ax-orange` | `#FF8C00` | Existing. Alerts, baseline/before metrics, secondary CTAs. |
| `--color-ax-cyan-light` | `#ecfeff` | Existing. Light cyan backgrounds for cards. |
| `--color-ax-orange-light` | `#fff7ed` | Existing. Light orange backgrounds for cards. |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.04)` | New. Replace border-based cards with shadow-based. |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.08)` | New. Hover elevation. |
| `--shadow-hero` | `0 24px 48px rgba(0,0,0,0.12)` | New. Hero section floating elements. |
| `--transition-default` | `200ms cubic-bezier(0.25,0.1,0.25,1)` | New. All interactive transitions. Apple's signature easing. |
| `font-data` class | JetBrains Mono | Existing. All numeric values in charts and KPIs. |

---

## Sources

- Codebase analysis: `dashboard/package.json`, `dashboard/src/app/globals.css`, existing component implementations
- Next.js App Router route groups: documented in Next.js docs (standard pattern since Next.js 13.4+)
- Framer Motion `whileInView`: stable API since Framer Motion 7+, confirmed used in existing `intro-tab.tsx`
- Recharts: confirmed working in `recipe-tab.tsx` with the current React 19 setup
- shadcn/ui base-nova style: confirmed in `dashboard/components.json`

**Note:** WebSearch was unavailable during this research session. All version recommendations are based on what's already installed in the codebase (verified via `package.json`) plus training data through early 2025. Before starting implementation, verify that no major breaking changes have occurred in Framer Motion or Recharts by checking their changelogs.

---

*Stack research: 2026-03-26*
