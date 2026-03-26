"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { TrendingDown, Fuel, ShieldCheck } from "lucide-react";
import type { OptimizationResult } from "@/lib/types";

interface ImpactHeaderProps {
  result: OptimizationResult | null;
  loading: boolean;
}

function calcDieselReduction(result: OptimizationResult): number {
  if (!result.baseline || !result.optimized) return 0;
  const baselineDiesel = result.baseline.phases.reduce(
    (sum, p) => sum + p.cost_diesel,
    0
  );
  const optimizedDiesel = result.optimized.phases.reduce(
    (sum, p) => sum + p.cost_diesel,
    0
  );
  if (baselineDiesel === 0) return 0;
  return Math.round(((baselineDiesel - optimizedDiesel) / baselineDiesel) * 100);
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  targetLabel: string;
  value?: number;
  suffix?: string;
  prefix?: string;
  accentClass: string;
  textColor: string;
  bgColor: string;
  loading: boolean;
  hasResult: boolean;
  decimalPlaces?: number;
}

function KpiCard({
  icon,
  label,
  targetLabel,
  value,
  suffix = "%",
  prefix = "",
  accentClass,
  textColor,
  bgColor,
  loading,
  hasResult,
  decimalPlaces = 0,
}: KpiCardProps) {
  return (
    <Card
      className={`relative overflow-hidden shadow-sm border-slate-200 ${accentClass} flex-1 min-w-0`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${bgColor}`}>{icon}</div>
          {!hasResult && !loading && (
            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">
              Estimate
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2 mt-1">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : hasResult && value !== undefined ? (
          <>
            <div className={`text-3xl font-bold font-data ${textColor} flex items-end gap-0.5`}>
              <NumberTicker
                value={value}
                decimalPlaces={decimalPlaces}
                prefix={prefix}
                suffix={suffix}
                className={`text-3xl font-bold font-data ${textColor}`}
              />
            </div>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </>
        ) : (
          <>
            <div className={`text-3xl font-bold font-data ${textColor}`}>
              {targetLabel}
            </div>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ImpactHeader({ result, loading }: ImpactHeaderProps) {
  const hasResult = !!result?.optimized;
  const dieselReduction = result ? calcDieselReduction(result) : 0;

  return (
    <div className="px-6 py-4 flex gap-4">
      <KpiCard
        icon={<TrendingDown className="w-5 h-5 text-ax-orange" />}
        label="Lower OpEx vs. Solo Processing"
        targetLabel="Target: ~47%"
        value={hasResult ? Math.round(result!.savings_pct) : undefined}
        suffix="% Saved"
        accentClass="card-accent-orange"
        textColor="text-ax-orange"
        bgColor="bg-[#fff7ed]"
        loading={loading}
        hasResult={hasResult}
      />
      <KpiCard
        icon={<Fuel className="w-5 h-5 text-ax-cyan" />}
        label="Diesel Cost Offset"
        targetLabel="Target: ~96%"
        value={hasResult ? dieselReduction : undefined}
        suffix="% Reduction"
        accentClass="card-accent-cyan"
        textColor="text-ax-cyan"
        bgColor="bg-[#ecfeff]"
        loading={loading}
        hasResult={hasResult}
      />
      <KpiCard
        icon={<ShieldCheck className="w-5 h-5 text-[#475569]" />}
        label="Optimized Runtime"
        targetLabel="— hr"
        value={
          hasResult ? result!.optimized!.total_runtime_hr : undefined
        }
        suffix=" hr"
        decimalPlaces={1}
        accentClass="card-accent-slate"
        textColor="text-slate-700"
        bgColor="bg-slate-100"
        loading={loading}
        hasResult={hasResult}
      />
    </div>
  );
}
