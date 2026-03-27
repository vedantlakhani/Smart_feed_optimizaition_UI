"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { TrendingDown, Fuel, Clock } from "lucide-react";
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
  valueColor: string;
  loading: boolean;
  hasResult: boolean;
  decimalPlaces?: number;
  isLast?: boolean;
}

function KpiCard({
  icon,
  label,
  targetLabel,
  value,
  suffix = "%",
  prefix = "",
  valueColor,
  loading,
  hasResult,
  decimalPlaces = 0,
  isLast = false,
}: KpiCardProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-5 px-6 flex-1 min-w-0"
      style={!isLast ? { borderRight: "1px solid #3d3d3d" } : {}}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "#737373" }}
        >
          {label}
        </span>
        {!hasResult && !loading && (
          <span
            className="text-xs font-medium px-1.5 py-0.5 uppercase tracking-wide"
            style={{ color: "#2aabe1", border: "1px solid #2aabe1", fontSize: "9px" }}
          >
            EST
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="h-9 w-28" style={{ background: "#3d3d3d" }} />
      ) : hasResult && value !== undefined ? (
        <div className="font-data text-3xl font-bold" style={{ color: valueColor }}>
          <NumberTicker
            value={value}
            decimalPlaces={decimalPlaces}
            prefix={prefix}
            suffix={suffix}
            className="font-data text-3xl font-bold"
          />
        </div>
      ) : (
        <div className="font-data text-3xl font-bold" style={{ color: valueColor }}>
          {targetLabel}
        </div>
      )}
    </div>
  );
}

export function ImpactHeader({ result, loading }: ImpactHeaderProps) {
  const hasResult = !!result?.optimized;
  const dieselReduction = result ? calcDieselReduction(result) : 0;

  return (
    <div
      className="px-6"
      style={{ background: "#222222", borderBottom: "1px solid #3d3d3d" }}
    >
      <div className="max-w-7xl mx-auto flex divide-x" style={{ borderColor: "#3d3d3d" }}>
        <KpiCard
          icon={<TrendingDown className="w-4 h-4" style={{ color: "#ff8c00" }} />}
          label="Cost Reduction"
          targetLabel="~47%"
          value={hasResult ? Math.round(result!.savings_pct) : undefined}
          suffix="% Saved"
          valueColor="#ff8c00"
          loading={loading}
          hasResult={hasResult}
        />
        <KpiCard
          icon={<Fuel className="w-4 h-4" style={{ color: "#2aabe1" }} />}
          label="Diesel Offset"
          targetLabel="~96%"
          value={hasResult ? dieselReduction : undefined}
          suffix="% Reduction"
          valueColor="#2aabe1"
          loading={loading}
          hasResult={hasResult}
        />
        <KpiCard
          icon={<Clock className="w-4 h-4" style={{ color: "#a3a3a3" }} />}
          label="Optimized Runtime"
          targetLabel="— hr"
          value={hasResult ? result!.optimized!.total_runtime_hr : undefined}
          suffix=" hr"
          decimalPlaces={1}
          valueColor="#ffffff"
          loading={loading}
          hasResult={hasResult}
          isLast
        />
      </div>
    </div>
  );
}
