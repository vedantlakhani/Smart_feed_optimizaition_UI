# Feature Landscape

**Domain:** Industrial optimization demo package (SCWO waste-stream blending) targeting professors, plant managers, and operators
**Researched:** 2026-03-26
**Confidence:** MEDIUM (based on training data patterns for industrial SaaS demos and academic presentation; no live web verification available)

---

## Table Stakes

Features users expect. Missing = product feels incomplete or untrustworthy.

### Landing / First Impression

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Problem-first hero section | Non-technical visitors need context before they care about the solution. Every credible industrial demo starts with "here is the pain." | Low | 1 screen: "Processing waste streams solo wastes fuel, chemicals, and time." Visual of solo vs blended. |
| Before/after cost comparison above the fold | Professors and managers evaluate value in the first 10 seconds. A single dramatic number (e.g., "47% cost reduction") is the hook. | Low | Use the existing `savings_pct` from algorithm output. Animated number ticker already built. |
| Plain-language "How It Works" (3-4 steps) | Builds mental model without jargon. Standard pattern in climate tech and industrial SaaS. | Low | Partially exists in `intro-tab.tsx` but uses terms like "Branch-and-bound pruning" which breaks trust with non-technical audience. |
| Credibility signals | Professors expect to see the team/institution behind it. Customers expect logos, affiliations, or at minimum a professional presentation. | Low | "Built at [university] for Design Climate" + AxNano branding. Not a lengthy about page, just a footer badge. |
| One-click demo with pre-loaded data | If users have to manually enter data to see results, 80% will leave. The demo must work instantly on example data. | Low | File picker exists but requires the user to understand the flow. Need a prominent "See Example" CTA that auto-loads and auto-runs. |

### Dashboard / Results Presentation

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Executive summary card (cost savings, time savings, environmental impact) | The first thing a manager or professor sees after optimization runs. Must answer "so what?" in 3 numbers. | Low | `impact-header.tsx` exists with KPI cards. Needs jargon cleanup and possibly an environmental framing (CO2 proxy from diesel reduction). |
| Baseline vs Optimized side-by-side | The core proof that blending is better. Without explicit comparison, the optimizer output is meaningless. | Low | `cost-story.tsx` exists with a comparison table. Already functional. |
| Per-phase operator instructions in plain language | Operators cannot work from algorithm output. "Pour 3L of Stream A and 7L of Stream B" is expected. "ratio (3,7)" is not. | Med | `operation-tab.tsx` exists but needs audit for jargon. Should read like a recipe card. |
| Safety checks visible and passing | Any industrial tool that touches chemical processing must show safety validation. Without it, no plant manager signs off. | Low | `phase-details-tab.tsx` shows safety checks. Keep them, fix the hardcoded BTU_diesel/eta bug (CONCERNS.md). |
| Loading state with progress indication | 5-stream optimization takes ~60s. A spinner with no context makes users think it crashed. | Med | Currently just a loading boolean. Need at minimum: "Evaluating X combinations..." or a progress bar. Even a fake staged progress ("Calculating baseline... Searching blends... Optimizing schedule...") is better than a blank spinner. |

### Chemistry / Technical Credibility

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Assumptions disclosure panel | Technical reviewers (professors, engineers) will immediately ask "what are your assumptions?" Hiding them destroys credibility. Showing them builds it. | Med | Must list A1-A9 assumptions in plain language. E.g., "We assume all waste has density similar to water (1 kg/L)." Each should state: what is assumed, why, and what changes when real data is available. |
| K-value transparency with "pending calibration" labels | The three uncalibrated constants are the biggest technical vulnerability. Proactively disclosing them signals intellectual honesty. | Low | Show current values, mark as "engineering estimates," state what operational data is needed to calibrate. The `expert-overrides.tsx` component exists but is hidden behind a toggle -- good, keep it expert-only but make it discoverable. |
| Unit labels on every number | Industrial tools without units are immediately distrusted. Every cost, volume, rate, and concentration must have its unit visible. | Low | Audit all dashboard components. "$" for cost, "L" for volume, "L/min" for flow, "BTU/lb" for energy, "ppm" for concentrations. |
| Formula documentation (accessible, not prominent) | Professors reviewing the work need to verify the math. Not on the main dashboard, but accessible via an expandable section or separate page. | Med | The Phase Details tab partially serves this. Consider a "Methodology" expandable section or a linked PDF/page explaining the r_water -> BTU_eff -> r_diesel -> r_naoh chain in plain terms. |

---

## Differentiators

Features that set AxNano's demo apart. Not expected by default, but create "this is impressive" moments.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Animated blend visualization | Show streams visually combining (colored bars merging, proportions animating). Makes the abstract concept of "blending" tangible. Most industrial tools are tables-only. | Med | Could be a simple bar chart animation showing stream proportions flowing into a reactor. Framer Motion is already in the stack. Not a 3D simulation -- a tasteful 2D animation. |
| "What if" scenario comparison | Let users modify one stream's quantity or properties and instantly see the cost impact. Demonstrates the algorithm's sensitivity analysis implicitly. | High | Requires re-running optimization. With 3-4 streams this is fast (<1s). Could disable for 5-stream cases or use cached results. Powerful for professors evaluating the algorithm's behavior. |
| Environmental impact framing | Convert diesel reduction to CO2 equivalent, NaOH reduction to chemical waste avoided. Climate tech framing resonates with Design Climate course. | Low | Simple math: diesel gallons * EPA emission factor = kg CO2. Already partially in `cost-story.tsx` (Climate Impact progress bars). Make it more prominent. |
| PDF/shareable report export | After running optimization, export a one-page summary as PDF. Plant managers share these with executives. Professors can include them in evaluations. | Med | Use browser print CSS or a library like `html2canvas` + `jsPDF`. Focus on the executive summary + phase plan, not the full dashboard. |
| Guided walkthrough / tour | On first visit, a 4-step tooltip tour: "This is your waste inventory" -> "Click Run" -> "Here are your savings" -> "Here are operator instructions." Eliminates any need for external explanation. | Med | Libraries like `driver.js` or `react-joyride`. Aligns with PROJECT.md goal: "no explanation from the AxNano team required." |
| Interactive blending explainer | A small interactive widget on the landing page where the user can drag two stream sliders (e.g., high-BTU + low-BTU) and see in real-time how the blend's effective energy changes. Teaches the core insight viscerally. | Med | Client-side only, no API call needed. Just the BTU dilution formula animated. Makes the "why blending works" click for non-technical audiences. |
| Methodology confidence badge | A visible badge on results: "Optimization method: Exact search (globally optimal for this input)" -- distinguishes from heuristic tools. Communicates rigor to technical reviewers. | Low | The exact search guarantee is a genuine differentiator. Most industrial optimizers use heuristics. State this clearly. |

---

## Anti-Features

Features to explicitly NOT build. Would undermine credibility, confuse users, or waste time.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Exposing algorithm internals (r_water, B&B, Gatekeeper) in the main UI | These terms mean nothing to the target audience and actively signal "this wasn't built for you." | Use the jargon mapping from PROJECT.md: "water added," "fuel supplement," "neutralizer." Keep algorithm terms in the expert panel only. |
| Editable waste stream properties in the demo | Letting non-technical users change BTU, pH, F ppm values without understanding them leads to nonsensical inputs and "broken" results. Destroys trust. | Provide 2-3 pre-loaded example datasets with a file picker. Let experts override via the existing Technical Calibration panel. |
| Real-time reactor integration claims | The tool is advisory. Claiming real-time control would be dishonest and raise safety concerns that kill credibility with engineers. | Label clearly: "Advisory optimization tool. Operator judgment and safety protocols always apply." |
| Authentication / user accounts | Adds complexity with zero demo value. Professors don't want to create accounts. | Keep it open. Single-user prototype. If deployed, add a simple shared password at most. |
| Mobile-responsive dashboard | The demo will be shown on laptops/projectors. Mobile optimization is wasted effort for this milestone. | Design for 1280px+ screens. Ensure it doesn't break on tablet but don't optimize for phone. |
| Overly polished marketing copy | Professors see through hype. "Revolutionary AI-powered optimization" language damages credibility in academic settings. | Use precise, honest language. "Exact combinatorial search" not "AI." "Engineering estimates" not "proven." Let the numbers speak. |
| Complex onboarding flows | Multi-step wizards, tooltips-on-tooltips, tutorial videos. For a demo shown in 5-10 minutes, complexity in the entry path is fatal. | One page that loads, one button to run, results appear. The guided tour (differentiator above) is optional, not mandatory. |
| Showing >2 decimal places on cost numbers | False precision on uncalibrated K-values undermines trust with technical reviewers who know better. | Round costs to nearest dollar. Round percentages to 1 decimal. Round volumes to 1 decimal. |

---

## Feature Dependencies

```
Pre-loaded example data → One-click demo (needs data to auto-run)
Jargon elimination audit → All dashboard features (prerequisite for non-technical audiences)
Assumptions disclosure panel → K-value transparency (disclosure panel is the container)
Executive summary card → Environmental impact framing (CO2 calc extends existing KPI cards)
Per-phase operator instructions → PDF export (export needs clean operator view to render)
Loading state improvement → "What if" scenario comparison (re-runs need clear loading feedback)
Safety check bug fix (hardcoded values) → Safety checks visible (must be correct before showcasing)
```

---

## MVP Recommendation

### Must Have (Phase 1 -- Demo Package)

Prioritize in this order:

1. **Jargon elimination audit** -- Prerequisite for everything else. Replace all algorithm terms in user-facing UI with plain language per PROJECT.md mapping. Without this, every other feature is undermined.
2. **Problem-first landing page** -- Hero section with cost pain, before/after number, "How it works" in 4 steps, CTA to enter dashboard. This is the first thing professors see.
3. **One-click demo with pre-loaded data** -- Prominent "See Example Results" button that auto-loads the 3-stream example and runs optimization. Zero friction entry.
4. **Assumptions disclosure panel** -- Expandable section listing A1-A9 in plain language with calibration status. Builds trust with technical reviewers.
5. **Loading state with staged progress** -- Replace blank spinner with staged messages during the 5-60 second wait.
6. **Unit labels audit** -- Every number gets its unit. Fast to implement, high trust impact.
7. **Environmental impact framing** -- Convert diesel savings to CO2 equivalent. Low effort, high resonance with Design Climate course.
8. **Safety check bug fix** -- Fix hardcoded BTU_diesel/eta in phase-details-tab.tsx before showcasing safety validation.

### Should Have (Phase 2 -- Polish)

9. **Interactive blending explainer** on landing page
10. **Guided walkthrough tour** for first-time visitors
11. **PDF export** of executive summary + phase plan
12. **Methodology confidence badge** ("Exact search: globally optimal")

### Defer

- **"What if" scenario comparison** -- High complexity, requires careful UX to not confuse users. Good for a later product version, not the demo.
- **Animated blend visualization** -- Nice to have but the effort-to-impact ratio is worse than the items above.

---

## Jargon Translation Strategy

This is central enough to the demo package that it deserves its own section.

### Principles

1. **Default to plain language everywhere.** Technical terms only appear in the expert panel.
2. **Use familiar analogies.** "Think of it like a recipe -- combining ingredients in the right proportions."
3. **Numbers speak louder than jargon.** "$2,400 saved" beats "47% cost reduction from optimized r_water."
4. **Explain once, use consistently.** If "processing step" replaces "phase," use it everywhere without exception.

### Translation Table (from PROJECT.md, extended)

| Algorithm Term | User-Facing Term | Context |
|---------------|-----------------|---------|
| Phase | Processing Step | "Step 1: Blend streams A and B" |
| r_water | Water Added | "2.3 liters of water added per liter of feed" |
| r_diesel | Fuel Supplement | "0.8 liters of diesel fuel supplement per liter of feed" |
| r_naoh | Neutralizer | "0.05 liters of neutralizer (NaOH) per liter of feed" |
| BTU / BTU_eff | Energy Content | "Energy content after dilution: 8,400 BTU/lb" |
| Blend ratio (3,7) | Mix Proportion | "Mix 3 parts Stream A with 7 parts Stream B" |
| Gatekeeper | (never shown) | Internal engine name, no user equivalent needed |
| B&B pruning | (never shown) | Describe as "exhaustive search" if methodology is discussed |
| W (throughput) | Processing Rate | "Processing rate: 4.2 liters per minute" |
| F_total | Total Feed Volume | "Total volume per batch: 10.5 liters" |
| cost_per_batch | Cost per Batch | Keep as-is, already plain |
| Template | (never shown) | Internal optimization concept |
| Baseline | Processing Solo | "Cost of processing each stream individually" |

### Chemistry Assumption Disclosure Pattern

For the assumptions panel, each assumption should follow this template:

```
[A1] Maximum 5 waste streams per optimization
  What this means: The tool evaluates every possible combination exactly.
                   More streams would require approximate methods.
  Status: Design constraint (not a limitation of the chemistry)
```

```
[A8] All waste assumed to have water-like density (1 kg/L)
  What this means: Heavy sludges or brines may have slightly different
                   volume-to-weight ratios, affecting cost estimates by 5-15%.
  Status: Engineering estimate. Add per-stream density when data available.
```

Pattern: name it, explain in one sentence what it means for the user, state its calibration status honestly.

---

## Landing Page Section Inventory

Based on patterns from credible climate tech and industrial optimization products:

| Section | Purpose | Priority |
|---------|---------|----------|
| Hero: Problem statement + dramatic number | Hook. "Waste processing costs 40% more than it should." | Must have |
| How It Works (3-4 steps with icons) | Mental model. Reduces "how does this work?" anxiety. | Must have |
| Live demo embed or CTA to dashboard | Proof. Let them see it working, not just read about it. | Must have |
| Assumptions & Methodology (collapsible) | Trust. Shows rigor. Professors click this first. | Must have |
| Team / Course / Affiliation footer | Context. "Who built this and why should I trust it?" | Must have |
| Example results showcase (static) | For visitors who won't click into the dashboard. Show 1 optimized plan visually. | Should have |
| Blending explainer (interactive widget) | Education. Makes the core insight tangible. | Should have |
| FAQ (3-5 questions) | Handles objections: "Is this accurate?" "What about safety?" "How many streams?" | Should have |

---

## Sources

- PROJECT.md and CONCERNS.md from this repository (primary context)
- Current dashboard codebase analysis (intro-tab.tsx, impact-header.tsx, cost-story.tsx, page.tsx)
- Training data patterns for industrial SaaS demos, climate tech landing pages, and academic presentation of engineering tools (LOW confidence -- not web-verified for this session)

---

*Note: Web search was unavailable during this research session. Recommendations are based on established patterns in industrial SaaS, climate tech, and academic demo presentation from training data. Confidence is MEDIUM overall -- the patterns are well-established but specific examples and current trends could not be verified.*
