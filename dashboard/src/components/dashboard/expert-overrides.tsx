"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SlidersHorizontal, AlertTriangle, CheckCircle } from "lucide-react";
import type { OptimizationResult, PhaseResult } from "@/lib/types";

interface ExpertOverridesProps {
  result: OptimizationResult | null;
  showTechnical: boolean;
  onToggle: (val: boolean) => void;
}

const K_VALUES = [
  {
    key: "K_F_TO_ACID",
    label: "K_F_TO_ACID",
    value: "0.053",
    unit: "meq / (L·ppm)",
    desc: "F⁻ ppm → acid equivalent. Theoretical estimate; needs lab calibration.",
  },
  {
    key: "K_PH_TO_BASE",
    label: "K_PH_TO_BASE",
    value: "50.0",
    unit: "meq / (L·pH_unit)",
    desc: "pH alkaline contribution coefficient. Linear approximation; pending operational fit.",
  },
  {
    key: "K_ACID_TO_NAOH_VOL",
    label: "K_ACID_TO_NAOH_VOL",
    value: "8.28e-5",
    unit: "L_NaOH / meq",
    desc: "Volume of 35% NaOH per meq acid. Derived from stoichiometry (12075 meq/L).",
  },
];

function PhaseDetailRow({ phase, idx }: { phase: PhaseResult; idx: number }) {
  const W_MIN = 0.5;
  const wOk = phase.W >= W_MIN;
  const solidEff = phase.blend_props.solid_pct / (1 + phase.r_water + phase.r_diesel + phase.r_naoh);
  const saltEff = phase.blend_props.salt_ppm / (1 + phase.r_water + phase.r_diesel + phase.r_naoh);
  const btuEff = phase.blend_props.btu_per_lb / (1 + phase.r_water) + phase.r_diesel * 18300 * 0.89;

  return (
    <AccordionItem value={`phase-${idx}`} className="border-slate-200">
      <AccordionTrigger className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:no-underline rounded-lg">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-xs font-data font-semibold">
            Phase {idx + 1}
          </span>
          <span className="text-slate-500 text-xs font-normal">
            {Object.entries(phase.streams)
              .map(([s, r]) => `${s}×${r}`)
              .join(" + ")}
          </span>
          {wOk ? (
            <CheckCircle className="w-3.5 h-3.5 text-[#06b6d4]" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Blend Properties */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Blend Properties
            </p>
            <dl className="space-y-1.5">
              {[
                { label: "BTU/lb", value: phase.blend_props.btu_per_lb.toFixed(0) },
                { label: "pH", value: phase.blend_props.pH.toFixed(2) },
                { label: "F ppm", value: phase.blend_props.f_ppm.toFixed(0) },
                { label: "Solid %", value: phase.blend_props.solid_pct.toFixed(1) + "%" },
                { label: "Salt ppm", value: phase.blend_props.salt_ppm.toFixed(0) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="font-data text-xs text-slate-700 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Gatekeeper Rates */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Gatekeeper Rates
            </p>
            <dl className="space-y-1.5">
              {[
                { label: "r_water", value: phase.r_water.toFixed(4) + " L/L", color: "text-blue-500" },
                { label: "r_diesel", value: phase.r_diesel.toFixed(4) + " L/L", color: "text-[#ff8c00]" },
                { label: "r_naoh", value: phase.r_naoh.toFixed(4) + " L/L", color: "text-emerald-600" },
                { label: "r_ext (total)", value: phase.r_ext.toFixed(4) + " L/L", color: "text-slate-700" },
                { label: "W (throughput)", value: phase.W.toFixed(3) + " L/min", color: wOk ? "text-[#06b6d4]" : "text-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-xs text-slate-400 font-data">{label}</dt>
                  <dd className={`font-data text-xs font-semibold ${color}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Safety Check */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Safety Check
            </p>
            <dl className="space-y-1.5">
              {[
                {
                  label: "Effective Solid %",
                  value: solidEff.toFixed(2) + "%",
                  ok: solidEff <= 15,
                  limit: "≤15%",
                },
                {
                  label: "Effective Salt ppm",
                  value: saltEff.toFixed(0),
                  ok: saltEff <= 5000,
                  limit: "≤5000",
                },
                {
                  label: "Effective BTU/lb",
                  value: btuEff.toFixed(0),
                  ok: btuEff >= 1800,
                  limit: "≥1800",
                },
                {
                  label: "W ≥ W_min",
                  value: phase.W.toFixed(3) + " L/min",
                  ok: wOk,
                  limit: "≥0.5",
                },
              ].map(({ label, value, ok, limit }) => (
                <div key={label} className="flex justify-between items-center">
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="flex items-center gap-1">
                    <span className="font-data text-xs text-slate-700">{value}</span>
                    {ok ? (
                      <CheckCircle className="w-3 h-3 text-[#06b6d4]" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Itemised costs */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Itemised Costs
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {[
              { label: "Diesel", value: phase.cost_diesel, color: "text-[#ff8c00]" },
              { label: "NaOH", value: phase.cost_naoh, color: "text-emerald-600" },
              { label: "Water", value: phase.cost_water, color: "text-blue-500" },
              { label: "Electricity", value: phase.cost_electricity, color: "text-indigo-500" },
              { label: "Labor", value: phase.cost_labor, color: "text-slate-600" },
              { label: "Total", value: phase.cost_total, color: "text-[#06b6d4] font-bold" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">{label}:</span>
                <span className={`font-data text-xs ${color}`}>
                  ${value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ExpertOverrides({
  result,
  showTechnical,
  onToggle,
}: ExpertOverridesProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Technical Calibration
            </CardTitle>
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-700 text-xs"
            >
              Plant Manager View
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="tech-toggle" className="text-sm text-slate-500">
              Show Details
            </Label>
            <Switch
              id="tech-toggle"
              checked={showTechnical}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-[#ff8c00]"
            />
          </div>
        </div>
      </CardHeader>

      {showTechnical && (
        <CardContent className="px-5 pb-5 space-y-5">
          {/* K-Values */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Chemical Constants (K-Values)
            </p>
            <div className="space-y-2">
              {K_VALUES.map((kv) => (
                <div
                  key={kv.key}
                  className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-data text-sm font-semibold text-slate-800">
                        {kv.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-amber-300 bg-amber-50 text-amber-600 text-xs"
                      >
                        Pending Fit
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{kv.desc}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="font-data text-sm font-bold text-slate-700">
                      {kv.value}
                    </div>
                    <div className="text-xs text-slate-400">{kv.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-phase technical detail */}
          {result?.optimized && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Phase Technical Detail
              </p>
              <Accordion multiple className="space-y-1">
                {result.optimized.phases.map((phase, idx) => (
                  <PhaseDetailRow key={idx} phase={phase} idx={idx} />
                ))}
              </Accordion>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
