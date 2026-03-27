# Phase 4: Chemistry Validation - Research

**Researched:** 2026-03-27
**Domain:** React/Next.js UI — progressive disclosure, confidence badges, sensitivity annotations
**Confidence:** HIGH

## Summary

Phase 4 is a pure frontend UI phase. No new Python logic, no new API routes, no new data. Everything needed already exists in the dashboard's result objects (`OptimizationResult`, `SystemConfig`) and in the Python source comments. The work is entirely about surfacing hidden information — K-values, MVP assumptions, formula derivations, and uncertainty notes — in a way that serves two audiences simultaneously: technical reviewers who need to audit assumptions, and non-technical visitors who must not be confused by chemistry jargon.

The current codebase already has a partial implementation of CHEM-01: `expert-overrides.tsx` shows K-values with "Pending Fit" badges and brief descriptions when the "Technical Calibration" toggle is ON. Phase 4 must promote this to always-visible (not hidden behind a toggle), add proper "theoretical estimate — not yet calibrated" language, add CHEM-02 three-tier progressive disclosure inside the phase details, add CHEM-03 sensitivity notes adjacent to all cost savings figures in `cost-story.tsx` and the KPI strip (`impact-header.tsx`), and add CHEM-04 an MVP Assumptions panel with all 9 «A1»–«A9» statements.

All 9 MVP assumptions are documented inline in the Python source via `«A1»`–`«A9»` code comments. They must be extracted and written as plain-English sentences — this is content authoring work, not engineering.

**Primary recommendation:** Add one new `AssumptionsPanel` component for CHEM-01 + CHEM-04, extend the Phase Details tab with nested accordions for CHEM-02 progressive disclosure, and add a `SensitivityNote` inline component used in every cost figure location for CHEM-03.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHEM-01 | Dashboard shows an assumptions panel with K-values described in plain language with confidence badges ("theoretical estimate — not yet calibrated") | K-values already exist in `expert-overrides.tsx` K_VALUES array; need always-visible panel with updated badge text and plain-English descriptions |
| CHEM-02 | Chemistry details use progressive disclosure: plain language summary always visible, formula expandable, derivation expandable — so both professors and operators are served | Implemented via nested Accordions in `phase-details-tab.tsx` using the existing `Accordion` component (`multiple` prop, @base-ui/react); three tiers per chemistry concept |
| CHEM-03 | Cost savings figures are accompanied by a plain-language sensitivity note explaining they are directional estimates pending K-value calibration | Affects `cost-story.tsx` (cost table + climate cards), `impact-header.tsx` (3 KPI cards); small inline note component placed under each savings figure |
| CHEM-04 | Each of the 9 MVP assumptions (A1–A9) is presented in one plain-English sentence accessible in the dashboard | A9 statements sourced from Python source `«A1»`–`«A9»` inline comments; new section in `AssumptionsPanel` or a dedicated accordion in the Phase Details or a new tab section |
</phase_requirements>

## Standard Stack

### Core (already in project — no new installs)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React / Next.js | 16 (project) | Component framework | Already in use |
| @base-ui/react Accordion | project version | Three-tier progressive disclosure | Already used in `phase-details-tab.tsx` and `expert-overrides.tsx`; `multiple` prop enables multiple open panels |
| shadcn/ui Badge | project version | Confidence badges | Already used for "Pending Fit" in `expert-overrides.tsx` |
| shadcn/ui Card + CardContent | project version | Panel containers | Already used throughout |
| Lucide React | project version | Icons (Info, FlaskConical, AlertTriangle) | Already imported |
| Tailwind CSS utilities | project | Styling | Design system already established |

### No New Installs Required
This phase adds zero new dependencies. Every needed component is already in `src/components/ui/`.

**Installation:**
```bash
# No new packages — all components already present
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/dashboard/
├── assumptions-panel.tsx      # NEW: CHEM-01 + CHEM-04 — K-values + 9 MVP assumptions
├── sensitivity-note.tsx       # NEW: CHEM-03 — reusable inline callout component
├── phase-details-tab.tsx      # MODIFY: add CHEM-02 three-tier progressive disclosure
├── cost-story.tsx             # MODIFY: add CHEM-03 SensitivityNote after savings figures
├── impact-header.tsx          # MODIFY: add CHEM-03 SensitivityNote under KPI cards
└── expert-overrides.tsx       # MODIFY or SUPERSEDE: CHEM-01 always-visible K-value panel
```

Dashboard page tab placement:
```
dashboard/page.tsx
├── "manifest" tab     → unchanged
├── "recipe" tab       → CostStory gains SensitivityNote (CHEM-03)
├── "operation" tab    → unchanged
└── "details" tab      → PhaseDetailsTab gains three-tier chemistry (CHEM-02)
                          AssumptionsPanel added below ExpertOverrides (CHEM-01, CHEM-04)
```

### Pattern 1: AssumptionsPanel (CHEM-01 + CHEM-04)
**What:** A Card component always visible in the Phase Details tab (no toggle required). Two sections: (1) K-Values with amber "Theoretical estimate — not yet calibrated" badge and plain-English description for each; (2) MVP Assumptions accordion listing all 9 in plain English.

**When to use:** Always rendered — no `showTechnical` gate. Target placement: after ExpertOverrides in the "details" tab.

**Example skeleton:**
```typescript
// AssumptionsPanel — no props needed (all content is static)
export function AssumptionsPanel() {
  return (
    <Card className="shadow-sm border-slate-200">
      {/* K-Values section (CHEM-01) */}
      {K_ASSUMPTIONS.map(k => (
        <div key={k.key}>
          <span>{k.plainLabel}</span>
          <Badge className="border-amber-300 bg-amber-50 text-amber-700">
            Theoretical estimate — not yet calibrated
          </Badge>
          <p>{k.plainDesc}</p>
          <span className="font-data">{k.value} {k.unit}</span>
        </div>
      ))}
      {/* MVP Assumptions section (CHEM-04) */}
      <Accordion multiple>
        {MVP_ASSUMPTIONS.map(a => (
          <AccordionItem key={a.id} value={a.id}>
            <AccordionTrigger>{a.id}: {a.short}</AccordionTrigger>
            <AccordionContent>{a.plainEnglish}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
```

### Pattern 2: Three-Tier Progressive Disclosure (CHEM-02)
**What:** Each chemistry concept in the Phase Details tab shows three levels of depth. The outer level (plain summary) is always visible as static text. Level 2 (formula) is an AccordionItem that opens on click. Level 3 (derivation) is a nested AccordionItem inside Level 2's content.

**When to use:** Specifically for NaOH chemistry (r_naoh) and pH blending inside `PhaseDetail` in `phase-details-tab.tsx`. These are the two most formula-heavy areas that confuse non-technical users.

**Example skeleton:**
```typescript
// Inside PhaseDetail component, replace or extend "Gatekeeper Rates" section
<div>
  {/* Tier 1: always visible plain summary */}
  <p className="text-sm text-slate-600">
    Added {(phase.r_naoh * 100).toFixed(2)}% neutralizer to keep pH in safe range.
  </p>
  {/* Tier 2: formula — expandable */}
  <Accordion multiple>
    <AccordionItem value="formula">
      <AccordionTrigger className="text-xs text-slate-400">
        Show formula
      </AccordionTrigger>
      <AccordionContent>
        <code className="font-data text-xs">
          r_naoh = (F_ppm × K_F_TO_ACID − max(0, pH−7) × K_PH_TO_BASE) × K_ACID_TO_NAOH_VOL
        </code>
        {/* Tier 3: derivation — nested expandable */}
        <Accordion multiple>
          <AccordionItem value="derivation">
            <AccordionTrigger className="text-xs text-slate-400">
              Show derivation
            </AccordionTrigger>
            <AccordionContent>
              {/* full derivation text */}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>
```

**Critical:** Nested Accordions with `multiple` prop work correctly in @base-ui/react. The `multiple` prop (not `type="multiple"`) is the correct API for this project's custom Accordion wrapper — confirmed from `expert-overrides.tsx` line 270 and `phase-details-tab.tsx` line 234.

### Pattern 3: SensitivityNote (CHEM-03)
**What:** A small, unobtrusive inline callout placed directly below every cost savings figure. Does not interrupt the reading flow but is always visible (not hidden behind a disclosure).

**When to use:** After `savings_pct` display in `impact-header.tsx`, after the savings row in `cost-story.tsx`, and after the "Total Cost Reduction" progress bar in the Climate Impact section.

**Example skeleton:**
```typescript
// src/components/dashboard/sensitivity-note.tsx
export function SensitivityNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-amber-600/80 flex items-start gap-1 mt-1", className)}>
      <Info className="w-3 h-3 shrink-0 mt-0.5" />
      Directional estimate — savings figures will shift when K-values are calibrated from reactor data.
    </p>
  );
}
```

### Anti-Patterns to Avoid
- **Hiding CHEM-01 behind the showTechnical toggle:** The K-values assumptions panel MUST be always visible. The existing "Plant Manager View" toggle in `expert-overrides.tsx` gates the per-phase technical detail — do not apply the same gate to the new assumptions panel.
- **Using separate badge text for CHEM-01 vs existing:** Current `expert-overrides.tsx` uses "Pending Fit". The requirement specifies "theoretical estimate — not yet calibrated" exactly. Update all K-value badges to use this text, or replace the component entirely.
- **Putting CHEM-04 assumptions in a non-dashboard location:** All 9 assumptions must be accessible from within the dashboard itself (not just in docs or a separate page). The details tab is the right home.
- **Three-tier disclosure for ALL data:** Only chemistry-heavy concepts need three tiers (r_naoh computation, pH blending method). Do not add disclosure wrappers to blend properties (BTU, solid%, salt) — those are simple pass-through values.
- **Accordion `type` prop:** This project's Accordion wraps `@base-ui/react/accordion` which uses `multiple` (boolean), not `type="multiple"` (shadcn radix pattern). Wrong prop silently breaks multi-open behavior.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Progressive disclosure | Custom show/hide state with useState | `Accordion` from `@/components/ui/accordion` | Already handles open/close state, animation, and accessibility |
| Confidence badges | Custom styled div | `Badge` from `@/components/ui/badge` with `variant="outline"` + amber classes | Matches existing "Pending Fit" badge pattern exactly |
| Collapsible sections | Custom CSS transitions | Accordion's built-in `data-open:animate-accordion-down` animation | Already wired in accordion.tsx line 59 |
| Icon + text callout | Custom layout | Small `<p>` with lucide `Info` icon at `w-3 h-3` | Matches existing inline alert patterns in the codebase |

**Key insight:** Every UI primitive needed for CHEM-01 through CHEM-04 already exists in `src/components/ui/`. This phase is content + composition work, not component engineering.

## Common Pitfalls

### Pitfall 1: Toggle-Gated Assumptions
**What goes wrong:** Developer notices the existing K-values display is behind `showTechnical && (...)` in `expert-overrides.tsx` and copies this pattern for the new `AssumptionsPanel`.
**Why it happens:** The toggle exists to reduce noise for non-technical users viewing phase technical detail. But the CHEM-01 requirement says the panel must be visible always.
**How to avoid:** `AssumptionsPanel` is a separate component from `ExpertOverrides`. It renders unconditionally in the "details" tab. Keep `ExpertOverrides` as-is for the per-phase accordion.
**Warning signs:** `AssumptionsPanel` wrapped in `{result && showTechnical && (...)}` — remove the `showTechnical` gate.

### Pitfall 2: Nested Accordion API Mismatch
**What goes wrong:** Three-tier disclosure uses `<Accordion type="multiple">` (Radix API) instead of `<Accordion multiple>` (@base-ui/react API).
**Why it happens:** Common muscle memory from shadcn docs which use Radix under the hood, but this project's accordion.tsx wraps `@base-ui/react/accordion`.
**How to avoid:** Check accordion.tsx line 8 — `AccordionPrimitive.Root.Props` from `@base-ui/react`. The `multiple` boolean prop is correct.
**Warning signs:** TypeScript error on `type` prop, or both accordion items collapsing when one is opened.

### Pitfall 3: Sensitivity Note Missing from KPI Strip
**What goes wrong:** SensitivityNote added to `cost-story.tsx` but forgotten in `impact-header.tsx`. The KPI strip's savings percentage is the most prominent cost figure on the page.
**Why it happens:** `impact-header.tsx` is a separate component not visually grouped with the savings table.
**How to avoid:** Treat CHEM-03 as "anywhere savings_pct or dollar savings appears" — the KPI strip, cost table, and climate progress bars all qualify.
**Warning signs:** `grep -r "savings_pct\|savings %" src/components/dashboard/` shows hits in files that don't also have SensitivityNote.

### Pitfall 4: MVP Assumption Text Not in Plain English
**What goes wrong:** Developer copies raw `«A1»`–`«A9»` code comment text verbatim (e.g. "«A4» linear blending: BTU, F ppm, Solid%, Salt ppm") instead of writing a plain-English sentence.
**Why it happens:** The source comments are concise engineering notes, not user-facing prose.
**How to avoid:** Each assumption must be a full sentence that a plant operator can understand. See Code Examples section below for all 9 plain-English drafts.
**Warning signs:** Assumption text contains variable names, angle brackets, or abbreviations like "BTU", "ppm", "meq" without explanation.

### Pitfall 5: CHEM-02 Applied to Wrong Data
**What goes wrong:** Three-tier disclosure added to BTU/lb, pH, solid% raw blend properties (the first column in phase-details-tab.tsx) rather than to the chemistry computation (r_naoh, pH blending method).
**Why it happens:** Phase Details has three columns; developer adds disclosure to all columns uniformly.
**How to avoid:** CHEM-02 targets the *computation* of external inputs (r_naoh especially) and the *pH blending methodology*, not the raw blend property values which have no formula to expose.
**Warning signs:** AccordionItems wrapping simple `{value.toFixed(2)}` displays.

## Code Examples

Verified patterns from existing codebase source:

### Correct Accordion multi-open usage (from expert-overrides.tsx line 270)
```typescript
// Source: dashboard/src/components/dashboard/expert-overrides.tsx
<Accordion multiple className="space-y-1">
  {result.optimized.phases.map((phase, idx) => (
    <PhaseDetailRow key={idx} phase={phase} idx={idx} cfg={result.config} />
  ))}
</Accordion>
```

### Correct amber Badge pattern (from expert-overrides.tsx line 244)
```typescript
// Source: dashboard/src/components/dashboard/expert-overrides.tsx
<Badge
  variant="outline"
  className="border-amber-300 bg-amber-50 text-amber-600 text-xs"
>
  Pending Fit
</Badge>
// For Phase 4: change text to "Theoretical estimate — not yet calibrated"
```

### K_VALUES data structure (from expert-overrides.tsx lines 22–44)
```typescript
// Source: dashboard/src/components/dashboard/expert-overrides.tsx
const K_VALUES = [
  {
    key: "K_F_TO_ACID",
    label: "K_F_TO_ACID",
    value: "0.053",
    unit: "meq / (L·ppm)",
    desc: "F⁻ ppm → acid equivalent. Theoretical estimate; needs lab calibration.",
  },
  // ...
];
// For Phase 4: extend with plainLabel and plainDesc fields:
// plainLabel: "Fluoride-to-acid conversion factor"
// plainDesc: "Converts the fluoride concentration in the waste into an acid load the system must neutralize. This value was calculated from chemistry first principles and has not yet been measured on the actual reactor."
```

### NaOH formula (source: gatekeeper.py lines 46–67)
```python
# Source: smart_feed_v9/gatekeeper.py
acid_load = blend.f_ppm * cfg.K_F_TO_ACID        # meq/L
base_load = max(0.0, (blend.pH - 7.0)) * cfg.K_PH_TO_BASE  # meq/L
net_acid   = max(0.0, acid_load - base_load)
r_naoh     = net_acid * cfg.K_ACID_TO_NAOH_VOL   # L NaOH / L waste
```

### pH blending formula (source: blending.py lines 24–44)
```python
# Source: smart_feed_v9/blending.py
h_concentration = sum(
    (10.0 ** (-pH)) * ratio
    for pH, ratio in zip(pH_values, ratios)
) / total
result_pH = -math.log10(h_concentration)
```

### 9 MVP Assumptions — Plain-English Drafts
These are sourced from inline `«A1»`–`«A9»` comments across all Python source files.

| ID | Python source location | Plain-English sentence |
|----|----------------------|------------------------|
| A1 | models.py, SystemConfig comment "≤5 streams" | The optimizer is designed for up to 5 waste streams at a time; larger inventories require splitting into batches. |
| A2 | gatekeeper.py `calc_throughput` docstring "Synchronous equation «A2»" | The reactor runs at a fixed total flow rate — adding more water or diesel pushes out an equal volume of waste feed. |
| A3 | models.py SystemConfig "«A1, A3»" F_total comment | The reactor's total capacity (11 L/min) is treated as constant during each processing step. |
| A4 | blending.py module docstring "«A4»" | Energy content, fluoride, solids, and salt all blend in simple proportion to the mix ratio — like mixing paint colours. |
| A5 | models.py cost section "«A5»" | Unit prices for diesel, NaOH, water, electricity, and labour are fixed at the values shown — they don't vary by volume or contract. |
| A6 | (deduced from density assumption in CLAUDE.md «A8» note; A6 referenced in code) | All waste streams are treated as water-density liquids (1 kg/L) for volume-to-mass conversions. |
| A7 | models.py WasteStream docstring "«A7»" | Waste properties are taken directly from the waste manifest without any pre-processing or lab adjustment. |
| A8 | CLAUDE.md Unit Conventions "ρ ≈ 1 kg/L «A8»" | Density is assumed to be 1 kg per litre for all streams, consistent with the water-density assumption. |
| A9 | models.py moisture_pct field "display only «A9», not used in calculations" | Moisture content is shown for reference only and does not affect any cost or flow calculation in this version. |

*Note: A3 and A6 are inferred from context. Verify exact location of «A3» and «A6» tags in full Python codebase during implementation; adjust plain-English text if the assumption differs from the above.*

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| "Pending Fit" badge in ExpertOverrides (hidden behind toggle) | Always-visible AssumptionsPanel with "Theoretical estimate — not yet calibrated" (CHEM-01) | Phase 4 | Technical reviewers can audit assumptions without toggling |
| No formula disclosure — raw variable names visible in Gatekeeper Rates table (r_naoh, r_water) | Three-tier: plain summary → formula → derivation (CHEM-02) | Phase 4 | Serves operators (tier 1) and engineers (tier 2/3) from one component |
| Cost savings figures with no qualification | SensitivityNote inline callout below every savings figure (CHEM-03) | Phase 4 | Sets accurate expectations for demo reviewers |
| No MVP assumptions documentation in UI | 9-item plain-English assumptions accordion (CHEM-04) | Phase 4 | Technical credibility for investor/engineering review |

## Open Questions

1. **Location of «A3» and «A6» tags**
   - What we know: A1, A2, A4, A5, A7, A8, A9 have confirmed source locations from code reading
   - What's unclear: The exact wording attached to «A3» (believed to be F_total constant assumption) and «A6» (believed to be density assumption) needs verification by searching the full Python source
   - Recommendation: During implementation, `grep -r "«A" smart_feed_v9/` to confirm all 9 tag locations before writing plain-English text

2. **Where to place AssumptionsPanel in the tab layout**
   - What we know: CHEM-01 and CHEM-04 are both static content (no result dependency); current details tab only renders ExpertOverrides when `result` exists
   - What's unclear: Should AssumptionsPanel render even before a run (useful for pre-run transparency) or only post-run alongside ExpertOverrides?
   - Recommendation: Render AssumptionsPanel unconditionally in the details tab (no `result` guard needed). It contains static content that is always valid.

3. **CHEM-02 scope: how many concepts get three-tier treatment**
   - What we know: r_naoh and pH blending are the two most formula-heavy concepts; BTU dilution (r_water) has a simpler formula
   - What's unclear: Does r_water / r_diesel computation also warrant three-tier treatment, or just r_naoh and pH?
   - Recommendation: Apply three-tier to r_naoh (most complex, K-value dependent) and pH blending (chemically non-obvious). Apply two-tier (plain + formula) to r_water and r_diesel. Keeps disclosure scope proportional to complexity.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest (Python); no JS test framework detected |
| Config file | `pyproject.toml` (pytest config) |
| Quick run command | `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -v --tb=short` |
| Full suite command | `~/miniconda3/envs/axnano-smartfeed/bin/python -m pytest tests/ -v` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHEM-01 | AssumptionsPanel renders K-values with "theoretical estimate — not yet calibrated" badge | manual-only | N/A — visual/text verification | ❌ Wave 0: verify via `npm run build` (TypeScript check) |
| CHEM-02 | Phase details show three-tier disclosure; accordion opens/closes correctly | manual-only | N/A — React component interaction | ❌ Wave 0: verify via `npm run build` |
| CHEM-03 | SensitivityNote appears in CostStory, ImpactHeader; text matches spec | manual-only | N/A — visual verification | ❌ Wave 0: grep-based text check |
| CHEM-04 | All 9 assumptions present in AssumptionsPanel; each is plain English | manual-only | N/A — content verification | ❌ Wave 0: count + text review |

**Note:** All 4 CHEM requirements are UI text/layout — there is no server-side logic or Python change in this phase. Automated testing is limited to TypeScript compilation (`npm run build`) and a grep-based content check to confirm all 9 assumption IDs appear in the component source. Functional interaction testing is manual.

### Automated Checks Available
```bash
# TypeScript compilation — catches missing props, wrong types
cd /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition/dashboard && npm run build

# Content presence check — all 9 assumption IDs in source
grep -n "A1\|A2\|A3\|A4\|A5\|A6\|A7\|A8\|A9" \
  /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition/dashboard/src/components/dashboard/assumptions-panel.tsx

# Sensitivity note usage — confirm it appears in cost-story and impact-header
grep -rn "SensitivityNote" \
  /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition/dashboard/src/components/dashboard/

# Badge text verification — confirm correct wording
grep -n "not yet calibrated" \
  /Users/vedantlakhani/Desktop/AxNano/Smart_feed_optimizaition/dashboard/src/components/dashboard/assumptions-panel.tsx
```

### Sampling Rate
- **Per task commit:** `npm run build` (TypeScript clean)
- **Per wave merge:** `npm run build` + manual visual review of details tab and recipe tab
- **Phase gate:** `npm run build` green + all 4 CHEM success criteria verified visually before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `dashboard/src/components/dashboard/assumptions-panel.tsx` — covers CHEM-01, CHEM-04 (new file)
- [ ] `dashboard/src/components/dashboard/sensitivity-note.tsx` — covers CHEM-03 (new file)
- Framework install: none needed — framework already present

## Sources

### Primary (HIGH confidence)
- Direct source read: `smart_feed_v9/gatekeeper.py` — all K-value formulas, r_naoh derivation confirmed
- Direct source read: `smart_feed_v9/blending.py` — pH blending formula confirmed
- Direct source read: `smart_feed_v9/models.py` — all «A1»–«A9» tag locations and SystemConfig defaults
- Direct source read: `dashboard/src/components/dashboard/expert-overrides.tsx` — existing K_VALUES array, Badge pattern, Accordion `multiple` prop usage confirmed
- Direct source read: `dashboard/src/components/ui/accordion.tsx` — @base-ui/react wrapper, `multiple` prop API confirmed
- Direct source read: `dashboard/src/lib/types.ts` — SystemConfig interface with all K-value fields confirmed
- Direct source read: `CLAUDE.md` — «A8» density assumption, K-value parameter descriptions, design system conventions

### Secondary (MEDIUM confidence)
- Direct source read: `dashboard/src/components/dashboard/phase-details-tab.tsx` — three-column grid structure; nested Accordion patterns confirmed compatible
- Direct source read: `dashboard/src/components/dashboard/cost-story.tsx` — exact location of savings_pct and dollar figures for SensitivityNote placement
- Direct source read: `dashboard/src/app/(app)/dashboard/page.tsx` — tab layout, ExpertOverrides placement, showTechnical state flow

### Tertiary (LOW confidence)
- «A3» and «A6» tag exact text: inferred from context; not confirmed by direct grep. Flag for validation during implementation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all components confirmed present in project source
- Architecture: HIGH — component locations and API patterns verified from live source
- Pitfalls: HIGH — derived from direct inspection of existing component code
- Assumption text: MEDIUM — 7/9 confirmed from source; 2 inferred (A3, A6)

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable UI codebase; only risk is if Phase 3 landing page work changes tab structure)
