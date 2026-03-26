"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Gauge,
  Clock,
  Droplets,
  Flame,
  FlaskConical,
  CircleDollarSign,
  HardHat,
  AlertTriangle,
} from "lucide-react";
import type { OptimizationResult } from "@/lib/types";

interface OperationTabProps {
  result: OptimizationResult | null;
  loading: boolean;
}

const PHASE_COLORS = [
  { bg: "bg-[#fff7ed]", border: "border-ax-orange", text: "text-ax-orange", badge: "border-ax-orange/40 bg-[#fff7ed] text-ax-orange" },
  { bg: "bg-[#ecfeff]", border: "border-ax-cyan", text: "text-ax-cyan", badge: "border-ax-cyan/40 bg-[#ecfeff] text-ax-cyan" },
  { bg: "bg-[#ecfdf5]", border: "border-[#10b981]", text: "text-[#10b981]", badge: "border-[#10b981]/40 bg-[#ecfdf5] text-[#10b981]" },
  { bg: "bg-[#fef2f2]", border: "border-red-400", text: "text-red-500", badge: "border-red-300 bg-red-50 text-red-600" },
  { bg: "bg-[#f5f3ff]", border: "border-purple-400", text: "text-purple-600", badge: "border-purple-300 bg-purple-50 text-purple-600" },
];

const STREAM_COLORS = ["#ff8c00", "#06b6d4", "#10b981", "#ef4444", "#8b5cf6"];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <HardHat className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-slate-600 font-semibold text-base mb-2">No Work Instructions Yet</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Run optimization to generate per-phase operator instructions with feed rates and pump settings.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
    </div>
  );
}

function MetricRow({ icon, label, value, unit, highlight = false }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-right">
        <span className={`font-data font-semibold text-sm ${highlight ? "text-ax-cyan" : "text-slate-800"}`}>
          {value}
        </span>
        {unit && <span className="text-slate-400 text-xs ml-1">{unit}</span>}
      </div>
    </div>
  );
}

export function OperationTab({ result, loading }: OperationTabProps) {
  if (loading) return <LoadingState />;
  if (!result?.optimized) return <EmptyState />;

  const { optimized, streams } = result;
  const allStreamIds = streams.map((s) => s.stream_id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <HardHat className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Operator Work Instructions — {optimized.phases.length} Phase{optimized.phases.length !== 1 ? "s" : ""}
        </span>
        <Badge variant="outline" className="border-ax-orange/40 bg-[#fff7ed] text-ax-orange text-xs ml-auto">
          Print-Ready
        </Badge>
      </div>

      {/* Safety banner */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Before starting:</strong> verify all safety systems are active, PPE is worn, and
          waste drums match the manifest. Confirm pump calibration before each phase.
        </p>
      </div>

      {/* Phase cards */}
      {optimized.phases.map((phase, idx) => {
        const col = PHASE_COLORS[idx % PHASE_COLORS.length];
        const streamEntries = Object.entries(phase.streams);
        const totalRatioSum = streamEntries.reduce((s, [, r]) => s + r, 0);

        // Per-stream waste feed rates
        const streamRates = streamEntries.map(([sid, ratio]) => ({
          sid,
          ratio,
          rate_L_per_min: (phase.W * ratio) / totalRatioSum,
        }));

        // Additive pump rates (L/min)
        const wasteFlow = phase.W;
        const waterRate = phase.r_water * wasteFlow;
        const dieselRate = phase.r_diesel * wasteFlow;
        const naohRate = phase.r_naoh * wasteFlow;
        const runtimeHr = phase.runtime_min / 60;

        return (
          <Card
            key={idx}
            className={`shadow-sm border-slate-200 border-l-4 ${col.border}`}
          >
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`px-2.5 py-1 rounded-lg ${col.bg} border ${col.border}`}>
                    <span className={`font-data font-bold text-sm ${col.text}`}>
                      Phase {idx + 1}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-800">
                      {streamEntries.map(([s, r]) => `${s} × ${r}`).join(" + ")}
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Blend ratio:{" "}
                      <span className="font-data">
                        {streamEntries.map(([s, r]) => `${s}:${r}`).join(" + ")}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-data text-lg font-bold ${col.text}`}>
                    ${phase.cost_total.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">phase cost</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Waste Feed Rates */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Waste Feed Rates
                    </span>
                  </div>
                  <div className="space-y-0">
                    {streamRates.map(({ sid, ratio, rate_L_per_min }) => {
                      const si = allStreamIds.indexOf(sid);
                      const sc = STREAM_COLORS[si % STREAM_COLORS.length];
                      return (
                        <div
                          key={sid}
                          className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: sc }}
                            />
                            <span className="text-sm text-slate-700 font-medium">{sid}</span>
                            <span className="text-xs text-slate-400">(×{ratio})</span>
                          </div>
                          <div>
                            <span className="font-data font-semibold text-sm text-slate-800">
                              {rate_L_per_min.toFixed(3)}
                            </span>
                            <span className="text-slate-400 text-xs ml-1">L/min</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-semibold text-slate-600">Total waste W</span>
                      <div>
                        <span className="font-data font-bold text-sm text-ax-cyan">
                          {phase.W.toFixed(3)}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">L/min</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden md:block bg-slate-100 h-auto" />

                {/* Additive Pump Rates */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Additive Pump Rates
                    </span>
                  </div>
                  <MetricRow
                    icon={<Droplets className="w-3.5 h-3.5 text-blue-400" />}
                    label="Water pump"
                    value={waterRate.toFixed(4)}
                    unit="L/min"
                  />
                  <MetricRow
                    icon={<Flame className="w-3.5 h-3.5 text-ax-orange" />}
                    label="Diesel pump"
                    value={dieselRate.toFixed(4)}
                    unit="L/min"
                    highlight={dieselRate > 0.001}
                  />
                  <MetricRow
                    icon={<FlaskConical className="w-3.5 h-3.5 text-emerald-500" />}
                    label="NaOH pump"
                    value={naohRate.toFixed(4)}
                    unit="L/min"
                  />
                  <div className="mt-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">r_ext = </span>
                      <span className="font-data">{phase.r_ext.toFixed(4)}</span>
                      {" "}L external / L waste
                    </p>
                  </div>
                </div>

                <Separator orientation="vertical" className="hidden md:block bg-slate-100 h-auto" />

                {/* Runtime & Cost */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CircleDollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Runtime & Cost
                    </span>
                  </div>
                  <MetricRow
                    icon={<Clock className="w-3.5 h-3.5 text-slate-400" />}
                    label="Runtime"
                    value={runtimeHr.toFixed(2)}
                    unit="hr"
                    highlight
                  />
                  <MetricRow
                    icon={<Clock className="w-3.5 h-3.5 text-slate-400" />}
                    label="Runtime"
                    value={phase.runtime_min.toFixed(0)}
                    unit="min"
                  />
                  <MetricRow
                    icon={<FlaskConical className="w-3.5 h-3.5 text-slate-400" />}
                    label="Waste consumed"
                    value={phase.Q_phase.toFixed(0)}
                    unit="L"
                  />
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Diesel</span>
                      <span className="font-data text-ax-orange">${phase.cost_diesel.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>NaOH</span>
                      <span className="font-data text-emerald-600">${phase.cost_naoh.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Water</span>
                      <span className="font-data text-blue-500">${phase.cost_water.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Electricity</span>
                      <span className="font-data text-indigo-500">${phase.cost_electricity.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>Labour</span>
                      <span className="font-data text-slate-600">${phase.cost_labor.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                      <span className="text-slate-700">Phase Total</span>
                      <span className={`font-data font-bold ${col.text}`}>
                        ${phase.cost_total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary footer */}
      <Card className="shadow-sm border-slate-200 bg-slate-50">
        <CardContent className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Total Optimized Runtime:</span>
            <span className="font-data font-bold text-slate-800">
              {optimized.total_runtime_hr.toFixed(2)} hr
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Total Optimized Cost:</span>
            <span className="font-data font-bold text-ax-cyan text-lg">
              ${optimized.total_cost.toFixed(0)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
