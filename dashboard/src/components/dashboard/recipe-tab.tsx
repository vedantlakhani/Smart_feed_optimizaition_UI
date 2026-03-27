"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Layers, Clock, Gauge, Beaker, AlertTriangle } from "lucide-react";
import type { OptimizationResult } from "@/lib/types";

interface RecipeTabProps {
  result: OptimizationResult | null;
  loading: boolean;
}

// AxNano brand palette — charcoal, cyan, navy, slate, gray
const STREAM_COLORS = ["#2b2a2b", "#2aabe1", "#11415c", "#64748b", "#94a3b8"];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
        <Beaker className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-slate-900 font-bold uppercase tracking-wide text-base mb-2">
        No Feed Recipe Yet
      </h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Go to the Manifest tab, review your waste streams, then click{" "}
        <span className="text-ax-orange font-medium">Run Optimization</span> to
        generate the blending schedule.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

export function RecipeTab({ result, loading }: RecipeTabProps) {
  if (loading) return <LoadingState />;
  if (!result) return <EmptyState />;
  if (!result.optimized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-slate-900 font-bold uppercase tracking-wide text-base mb-2">
          No Feasible Blend Found
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mb-4">
          The optimizer could not find a blend that meets all safety constraints
          (pH range, solids limit, salt limit, minimum throughput).
          All streams will be processed individually at baseline cost.
        </p>
        {result.baseline && (
          <div className="px-4 py-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-600">
            Baseline cost (solo processing):{" "}
            <span className="font-data font-bold text-slate-800">
              {result.baseline.total_cost != null
                ? `$${result.baseline.total_cost.toFixed(0)}`
                : "N/A (infeasible streams)"}
            </span>
          </div>
        )}
      </div>
    );
  }

  const { optimized } = result;

  // Build chart data
  const chartData = optimized.phases.map((p, i) => ({
    name: `Phase ${i + 1}`,
    Diesel: parseFloat(p.cost_diesel.toFixed(2)),
    NaOH: parseFloat(p.cost_naoh.toFixed(2)),
    Water: parseFloat(p.cost_water.toFixed(2)),
    Electricity: parseFloat(p.cost_electricity.toFixed(2)),
    Labor: parseFloat(p.cost_labor.toFixed(2)),
  }));

  // Build all stream IDs from result for color mapping
  const allStreamIds = result.streams.map((s) => s.stream_id);

  return (
    <div className="space-y-5">
      {/* Phase Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
            Optimized Feed Schedule — {optimized.phases.length} Phase
            {optimized.phases.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-data font-medium text-slate-700">
              {optimized.total_runtime_hr.toFixed(1)} hr
            </span>
            <span>total runtime</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span>Total:</span>
            <span className="font-data font-bold text-ax-cyan">
              ${optimized.total_cost.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="grid gap-3">
        {optimized.phases.map((phase, idx) => {
          const streamEntries = Object.entries(phase.streams);

          return (
            <Card
              key={idx}
              className="relative overflow-hidden shadow-sm border-slate-200 border-l-4 border-l-[#2b2a2b] hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  {/* Phase label + streams */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-2 py-0.5 bg-[#2b2a2b] text-white text-xs font-bold uppercase tracking-widest font-data">
                        Phase {idx + 1}
                      </div>
                      {streamEntries.map(([sid, ratio]) => {
                        const si = allStreamIds.indexOf(sid);
                        const dotColor = STREAM_COLORS[si % STREAM_COLORS.length];
                        return (
                          <Badge
                            key={sid}
                            variant="outline"
                            className="text-xs font-data border-slate-300 text-slate-600 bg-white gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: dotColor }} />
                            {sid} ×{ratio}
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400">
                      Blend ratio:{" "}
                      <span className="font-data text-slate-600">
                        {streamEntries.map(([sid, r]) => `${sid}:${r}`).join(" + ")}
                      </span>
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-right">
                    <div>
                      <div className="flex items-center justify-end gap-1 text-slate-400 text-xs mb-0.5">
                        <Gauge className="w-3 h-3" />
                        Throughput
                      </div>
                      <div className="font-data font-semibold text-slate-800 text-sm">
                        {phase.W.toFixed(2)}{" "}
                        <span className="text-slate-400 font-normal text-xs">L/min</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-end gap-1 text-slate-400 text-xs mb-0.5">
                        <Clock className="w-3 h-3" />
                        Runtime
                      </div>
                      <div className="font-data font-semibold text-slate-800 text-sm">
                        {(phase.runtime_min / 60).toFixed(1)}{" "}
                        <span className="text-slate-400 font-normal text-xs">hr</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-0.5">Phase Cost</div>
                      <div className="font-data font-bold text-ax-cyan text-sm">
                        ${phase.cost_total.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additive rates */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-4 flex-wrap">
                  {[
                    {
                      label: "Water",
                      value: phase.r_water,
                      color: "text-blue-500",
                    },
                    {
                      label: "Diesel",
                      value: phase.r_diesel,
                      color: "text-ax-orange",
                    },
                    {
                      label: "NaOH",
                      value: phase.r_naoh,
                      color: "text-emerald-600",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">{label}:</span>
                      <span className={`font-data text-xs font-semibold ${color}`}>
                        {value.toFixed(3)} L/L
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-xs text-slate-400">Consumed:</span>
                    <span className="font-data text-xs font-semibold text-slate-600">
                      {phase.Q_phase.toFixed(0)} L
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cost Breakdown Chart */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-xs font-bold text-ax-cyan uppercase tracking-widest">
            Phase Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, undefined]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="Diesel" stackId="a" fill="#ff8c00" radius={[0, 0, 0, 0]} />
              <Bar dataKey="NaOH" stackId="a" fill="#10b981" />
              <Bar dataKey="Water" stackId="a" fill="#06b6d4" />
              <Bar dataKey="Electricity" stackId="a" fill="#6366f1" />
              <Bar dataKey="Labor" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
