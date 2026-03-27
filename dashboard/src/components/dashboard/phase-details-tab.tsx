"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, AlertTriangle, Microscope, ShieldCheck } from "lucide-react";
import type { OptimizationResult, PhaseResult, SystemConfig } from "@/lib/types";

interface PhaseDetailsTabProps {
  result: OptimizationResult | null;
  loading: boolean;
}


function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
        <Microscope className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-slate-600 font-semibold text-base mb-2">No Phase Data Yet</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Run optimization to view per-phase blend properties, Gatekeeper rates, and safety checks.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
    </div>
  );
}

function SafetyCheck({ label, value, ok, limit, unit = "" }: {
  label: string; value: number; ok: boolean; limit: string; unit?: string;
}) {
  const displayVal = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(3);
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        {ok
          ? <CheckCircle className="w-3.5 h-3.5 text-ax-cyan shrink-0" />
          : <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
        }
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-xs text-slate-400">({limit})</span>
      </div>
      <span className={`font-data text-sm font-semibold ${ok ? "text-ax-cyan" : "text-red-500"}`}>
        {displayVal}{unit}
      </span>
    </div>
  );
}

function PhaseDetail({ phase, idx, cfg }: { phase: PhaseResult; idx: number; cfg: SystemConfig }) {
  const dilution = 1 + phase.r_water + phase.r_diesel + phase.r_naoh;
  const solidEff = phase.blend_props.solid_pct / dilution;
  const saltEff = phase.blend_props.salt_ppm / dilution;
  const btuEff = phase.blend_props.btu_per_lb / (1 + phase.r_water) + phase.r_diesel * cfg.BTU_diesel * cfg.eta;
  const wOk = phase.W >= cfg.W_min;

  const costRows = [
    { label: "Diesel", value: phase.cost_diesel, color: "text-slate-700" },
    { label: "NaOH", value: phase.cost_naoh, color: "text-slate-700" },
    { label: "Water", value: phase.cost_water, color: "text-slate-700" },
    { label: "Electricity", value: phase.cost_electricity, color: "text-slate-700" },
    { label: "Labour", value: phase.cost_labor, color: "text-slate-700" },
  ];
  const costTotal = costRows.reduce((s, r) => s + r.value, 0);

  return (
    <AccordionItem value={`phase-${idx}`} className="border-slate-200 mb-2 last:mb-0">
      <Card className="shadow-sm border-slate-200 border-l-4 border-l-[#2b2a2b] overflow-hidden">
        <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-slate-50 [&>svg]:text-slate-400 w-full">
          <div className="flex items-center gap-3 text-left w-full">
            <div className="px-2.5 py-1 bg-[#2b2a2b]">
              <span className="font-data font-bold text-sm uppercase tracking-widest text-white">Phase {idx + 1}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {Object.entries(phase.streams).map(([s, r]) => `${s} × ${r}`).join(" + ")}
              </p>
              <p className="text-xs text-slate-400 font-data">
                W = {phase.W.toFixed(3)} L/min · {(phase.runtime_min / 60).toFixed(2)} hr · ${phase.cost_total.toFixed(0)}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 mr-2">
              {wOk
                ? <Badge variant="outline" className="border-ax-cyan/40 bg-[#ecfeff] text-ax-cyan text-xs">Feasible</Badge>
                : <Badge variant="outline" className="border-red-300 bg-red-50 text-red-600 text-xs">W below min</Badge>
              }
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-0 pb-0">
          <div className="border-t border-slate-100 px-5 py-4 space-y-5">

            {/* 3-column grid: blend props | gatekeeper | costs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* Blend Properties */}
              <div>
                <p className="text-xs font-bold text-ax-cyan uppercase tracking-widest mb-2">
                  Blend Properties
                </p>
                <Table>
                  <TableBody>
                    {[
                      { label: "BTU/lb", value: phase.blend_props.btu_per_lb.toFixed(0) },
                      { label: "pH", value: phase.blend_props.pH.toFixed(3) },
                      { label: "F (ppm)", value: phase.blend_props.f_ppm.toFixed(1) },
                      { label: "Solid %", value: phase.blend_props.solid_pct.toFixed(2) + "%" },
                      { label: "Salt (ppm)", value: phase.blend_props.salt_ppm.toFixed(0) },
                    ].map(({ label, value }) => (
                      <TableRow key={label} className="border-slate-100 hover:bg-slate-50/40">
                        <TableCell className="text-xs text-slate-500 py-1.5 pl-0">{label}</TableCell>
                        <TableCell className="text-right font-data text-xs text-slate-800 font-semibold pr-0">{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Gatekeeper Rates — progressive disclosure */}
              <div>
                <p className="text-xs font-bold text-ax-cyan uppercase tracking-widest mb-2">
                  Additive Rates
                </p>
                <div className="space-y-3">

                  {/* r_water — two-tier: plain + formula */}
                  <div>
                    <p className="text-sm text-slate-600">
                      Added {(phase.r_water * 100).toFixed(2)}% water to reach reaction temperature.
                    </p>
                    <Accordion multiple>
                      <AccordionItem value="r_water_formula" className="border-0">
                        <AccordionTrigger className="text-xs text-slate-400 hover:text-slate-600 py-1 hover:no-underline [&>svg]:w-3 [&>svg]:h-3">
                          Show formula
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <code className="font-data text-xs text-slate-600 block">
                            r_water = max(0, (BTU_min − BTU_blend) / (BTU_eff_water − BTU_blend))
                          </code>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* r_diesel — two-tier: plain + formula */}
                  <div>
                    <p className="text-sm text-slate-600">
                      Added {(phase.r_diesel * 100).toFixed(2)}% fuel supplement to boost energy.
                    </p>
                    <Accordion multiple>
                      <AccordionItem value="r_diesel_formula" className="border-0">
                        <AccordionTrigger className="text-xs text-slate-400 hover:text-slate-600 py-1 hover:no-underline [&>svg]:w-3 [&>svg]:h-3">
                          Show formula
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <code className="font-data text-xs text-slate-600 block">
                            r_diesel = max(0, (BTU_min×(1+r_water) − BTU_blend) / (BTU_diesel×η − BTU_min))
                          </code>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* r_naoh — three-tier: plain + formula + derivation */}
                  <div>
                    <p className="text-sm text-slate-600">
                      Added {(phase.r_naoh * 100).toFixed(2)}% neutralizer to keep pH in the safe operating range.
                    </p>
                    <Accordion multiple>
                      <AccordionItem value="r_naoh_formula" className="border-0">
                        <AccordionTrigger className="text-xs text-slate-400 hover:text-slate-600 py-1 hover:no-underline [&>svg]:w-3 [&>svg]:h-3">
                          Show formula
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <code className="font-data text-xs text-slate-600 block">
                            r_naoh = (F_ppm × K_F_TO_ACID − max(0, pH−7) × K_PH_TO_BASE) × K_ACID_TO_NAOH_VOL
                          </code>
                          {/* Tier 3 — derivation nested inside Tier 2 content */}
                          <Accordion multiple className="mt-1">
                            <AccordionItem value="r_naoh_derivation" className="border-0">
                              <AccordionTrigger className="text-xs text-slate-400 hover:text-slate-600 py-1 hover:no-underline [&>svg]:w-3 [&>svg]:h-3">
                                Show derivation
                              </AccordionTrigger>
                              <AccordionContent className="pb-1">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  The neutralizer volume is computed in three steps: (1) convert fluoride concentration to an acid load using K_F_TO_ACID — a theoretical factor from chemistry first principles; (2) subtract any base load contributed by an alkaline-pH stream using K_PH_TO_BASE; (3) convert the net acid load to a NaOH solution volume using K_ACID_TO_NAOH_VOL (derived from the stoichiometry of 35% NaOH at 12 075 meq/L). Both K_F_TO_ACID and K_PH_TO_BASE are theoretical estimates that have not yet been measured on the reactor.
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* pH blending — three-tier: plain + formula + derivation */}
                  <div>
                    <p className="text-sm text-slate-600">
                      Blended pH: {phase.blend_props.pH.toFixed(3)} — computed from hydrogen-ion concentrations, not a simple average.
                    </p>
                    <Accordion multiple>
                      <AccordionItem value="ph_formula" className="border-0">
                        <AccordionTrigger className="text-xs text-slate-400 hover:text-slate-600 py-1 hover:no-underline [&>svg]:w-3 [&>svg]:h-3">
                          Show formula
                        </AccordionTrigger>
                        <AccordionContent className="pb-1">
                          <code className="font-data text-xs text-slate-600 block">
                            pH = −log₁₀( Σ(10^(−pHᵢ) × rᵢ) / Σrᵢ )
                          </code>
                          {/* Tier 3 — derivation */}
                          <Accordion multiple className="mt-1">
                            <AccordionItem value="ph_derivation" className="border-0">
                              <AccordionTrigger className="text-xs text-slate-400 hover:text-slate-600 py-1 hover:no-underline [&>svg]:w-3 [&>svg]:h-3">
                                Show derivation
                              </AccordionTrigger>
                              <AccordionContent className="pb-1">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  pH is a logarithmic scale of hydrogen-ion (H⁺) concentration. A simple average of two pH values would be physically wrong — mixing equal volumes of pH 3 and pH 11 produces near-neutral pH, not pH 7. The correct method converts each stream&apos;s pH to H⁺ concentration (10^(−pH)), averages the concentrations weighted by mix volume, then converts back to pH. This matches laboratory measurements to within the accuracy of the linear-blending assumption (A4).
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* r_ext and W — plain only, no disclosure needed */}
                  <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-data">r_ext (total)</span>
                    <span className="font-data font-semibold text-slate-700">{phase.r_ext.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-data">W (L/min)</span>
                    <span className={`font-data font-semibold ${wOk ? "text-ax-cyan" : "text-red-500"}`}>{phase.W.toFixed(4)}</span>
                  </div>

                </div>
              </div>

              {/* Itemised Costs */}
              <div>
                <p className="text-xs font-bold text-ax-cyan uppercase tracking-widest mb-2">
                  Itemised Costs
                </p>
                <div className="space-y-1.5">
                  {costRows.map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">{label}</span>
                        <span className={`font-data font-semibold ${color}`}>${value.toFixed(2)}</span>
                      </div>
                      <Progress
                        value={costTotal > 0 ? (value / costTotal) * 100 : 0}
                        className="h-1.5 bg-slate-100"
                      />
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-sm font-semibold text-slate-700">Total</span>
                    <span className="font-data text-sm font-bold text-ax-cyan">${phase.cost_total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Check */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-xs font-bold text-ax-cyan uppercase tracking-widest">
                  Safety Check — Effective Values After All Additives
                </p>
              </div>
              <Card className="border-slate-200 shadow-none bg-white">
                <CardContent className="px-4 py-1">
                  <SafetyCheck label="Effective Solid %" value={solidEff} ok={solidEff <= cfg.solid_max_pct} limit={`≤${cfg.solid_max_pct}%`} unit="%" />
                  <SafetyCheck label="Effective Salt (ppm)" value={saltEff} ok={saltEff <= cfg.salt_max_ppm} limit={`≤${cfg.salt_max_ppm}`} unit=" ppm" />
                  <SafetyCheck label="Effective BTU/lb" value={btuEff} ok={btuEff >= 1800} limit="≥1800" unit=" BTU/lb" />
                  <SafetyCheck label="W ≥ W_min" value={phase.W} ok={wOk} limit={`≥${cfg.W_min} L/min`} unit=" L/min" />
                  <SafetyCheck label="pH in range" value={phase.blend_props.pH} ok={phase.blend_props.pH >= cfg.pH_min && phase.blend_props.pH <= cfg.pH_max} limit={`${cfg.pH_min}–${cfg.pH_max}`} />
                </CardContent>
              </Card>
            </div>
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

export function PhaseDetailsTab({ result, loading }: PhaseDetailsTabProps) {
  if (loading) return <LoadingState />;
  if (!result?.optimized) return <EmptyState />;

  const { optimized, config } = result;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Microscope className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
          Phase Technical Deep-Dive
        </span>
        <Badge variant="outline" className="border-slate-300 text-slate-500 text-xs ml-auto">
          {optimized.phases.length} Phase{optimized.phases.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <Accordion multiple className="space-y-0">
        {optimized.phases.map((phase, idx) => (
          <PhaseDetail key={idx} phase={phase} idx={idx} cfg={config} />
        ))}
      </Accordion>
    </div>
  );
}
