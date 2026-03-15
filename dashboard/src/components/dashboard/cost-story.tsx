"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingDown, TrendingUp, Minus, BarChart3, Leaf } from "lucide-react";
import type { OptimizationResult, PhaseResult } from "@/lib/types";

interface CostStoryProps {
  result: OptimizationResult | null;
  loading: boolean;
}

function sumField(phases: PhaseResult[], field: keyof PhaseResult): number {
  return phases.reduce((sum, p) => sum + (p[field] as number), 0);
}

function DeltaCell({ baseline, optimized }: { baseline: number; optimized: number }) {
  if (baseline === 0) return <TableCell className="text-right font-data text-slate-400">—</TableCell>;
  const delta = ((optimized - baseline) / baseline) * 100;
  const isImproved = optimized < baseline;
  const icon = isImproved ? (
    <TrendingDown className="w-3 h-3" />
  ) : delta === 0 ? (
    <Minus className="w-3 h-3" />
  ) : (
    <TrendingUp className="w-3 h-3" />
  );
  const color = isImproved
    ? "text-[#06b6d4]"
    : delta === 0
    ? "text-slate-400"
    : "text-red-500";

  return (
    <TableCell className={`text-right font-data text-sm font-semibold ${color}`}>
      <span className="flex items-center justify-end gap-1">
        {icon}
        {Math.abs(delta).toFixed(1)}%
      </span>
    </TableCell>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <BarChart3 className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-slate-400 text-sm max-w-xs">
        Run optimization to see the cost comparison and climate impact.
      </p>
    </div>
  );
}

export function CostStory({ result, loading }: CostStoryProps) {
  if (loading) return <LoadingState />;
  if (!result?.optimized) return <EmptyState />;

  const { baseline, optimized, savings_pct } = result;

  const baseDiesel = sumField(baseline.phases, "cost_diesel");
  const optDiesel = sumField(optimized.phases, "cost_diesel");
  const dieselReductionPct =
    baseDiesel > 0
      ? Math.round(((baseDiesel - optDiesel) / baseDiesel) * 100)
      : 0;

  const rows = [
    {
      metric: "Total Cost",
      baseline: `$${baseline.total_cost.toFixed(0)}`,
      optimized: `$${optimized.total_cost.toFixed(0)}`,
      bRaw: baseline.total_cost,
      oRaw: optimized.total_cost,
    },
    {
      metric: "Runtime",
      baseline: `${baseline.total_runtime_hr.toFixed(1)} hr`,
      optimized: `${optimized.total_runtime_hr.toFixed(1)} hr`,
      bRaw: baseline.total_runtime_hr,
      oRaw: optimized.total_runtime_hr,
    },
    {
      metric: "Diesel Cost",
      baseline: `$${baseDiesel.toFixed(0)}`,
      optimized: `$${optDiesel.toFixed(0)}`,
      bRaw: baseDiesel,
      oRaw: optDiesel,
    },
    {
      metric: "NaOH Cost",
      baseline: `$${sumField(baseline.phases, "cost_naoh").toFixed(0)}`,
      optimized: `$${sumField(optimized.phases, "cost_naoh").toFixed(0)}`,
      bRaw: sumField(baseline.phases, "cost_naoh"),
      oRaw: sumField(optimized.phases, "cost_naoh"),
    },
    {
      metric: "Labor Cost",
      baseline: `$${sumField(baseline.phases, "cost_labor").toFixed(0)}`,
      optimized: `$${sumField(optimized.phases, "cost_labor").toFixed(0)}`,
      bRaw: sumField(baseline.phases, "cost_labor"),
      oRaw: sumField(optimized.phases, "cost_labor"),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Cost Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Cost Story — Baseline vs. Optimized
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-slate-200">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide pl-5">
                  Metric
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                  Manual Baseline
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#06b6d4] uppercase tracking-wide text-right">
                  Ax Optimized
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right pr-5">
                  Delta
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.metric}
                  className="hover:bg-slate-50/60 border-slate-100"
                >
                  <TableCell className="pl-5 py-3 text-sm font-medium text-slate-700">
                    {row.metric}
                  </TableCell>
                  <TableCell className="text-right font-data text-sm text-slate-500">
                    {row.baseline}
                  </TableCell>
                  <TableCell className="text-right font-data text-sm font-semibold text-[#06b6d4]">
                    {row.optimized}
                  </TableCell>
                  <DeltaCell baseline={row.bRaw} optimized={row.oRaw} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Climate Impact */}
      <Card className="shadow-sm border-slate-200 card-accent-emerald">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Climate Impact
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-slate-600 font-medium">
                Diesel Cost Reduction
              </span>
              <span className="font-data text-sm font-bold text-[#06b6d4]">
                {dieselReductionPct}%
              </span>
            </div>
            <Progress
              value={dieselReductionPct}
              className="h-2.5 bg-slate-100 progress-cyan"
            />
            <p className="text-xs text-slate-400 mt-1">
              Blending complementary waste streams minimises supplemental fuel demand
            </p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-slate-600 font-medium">
                Total Cost Reduction
              </span>
              <span className="font-data text-sm font-bold text-[#ff8c00]">
                {savings_pct.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={savings_pct}
              className="h-2.5 bg-slate-100 progress-orange"
            />
            <p className="text-xs text-slate-400 mt-1">
              Overall OpEx savings from optimal multi-stream blending schedule
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
