"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Loader2, Play, FlaskConical } from "lucide-react";
import type { WasteStream, SystemConfig } from "@/lib/types";

interface ManifestTabProps {
  streams: WasteStream[];
  config: Partial<SystemConfig>;
  onConfigChange: (key: keyof SystemConfig, value: number) => void;
  onRun: () => void;
  loading: boolean;
}

const STREAM_COLORS = [
  { border: "border-[#ff8c00]", bg: "bg-[#fff7ed]", text: "text-[#ff8c00]" },
  { border: "border-[#06b6d4]", bg: "bg-[#ecfeff]", text: "text-[#06b6d4]" },
  { border: "border-[#10b981]", bg: "bg-[#ecfdf5]", text: "text-[#10b981]" },
  { border: "border-[#ef4444]", bg: "bg-[#fef2f2]", text: "text-[#ef4444]" },
  { border: "border-[#8b5cf6]", bg: "bg-[#f5f3ff]", text: "text-[#8b5cf6]" },
];

function PhBadge({ ph }: { ph: number }) {
  if (ph < 6)
    return (
      <Badge variant="outline" className="border-red-300 bg-red-50 text-red-600 font-data text-xs">
        {ph.toFixed(1)} Acid
      </Badge>
    );
  if (ph > 9)
    return (
      <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-600 font-data text-xs">
        {ph.toFixed(1)} Base
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 font-data text-xs">
      {ph.toFixed(1)} Neutral
    </Badge>
  );
}

function BtuBadge({ btu }: { btu: number }) {
  if (btu > 5000)
    return (
      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 font-data text-xs">
        {btu.toLocaleString()} High
      </Badge>
    );
  return (
    <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-500 font-data text-xs">
      {btu.toLocaleString()} Low
    </Badge>
  );
}

function ConfigField({
  label,
  value,
  field,
  onChange,
  unit,
  step = 0.1,
}: {
  label: string;
  value: number;
  field: keyof SystemConfig;
  onChange: (k: keyof SystemConfig, v: number) => void;
  unit: string;
  step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-slate-500 font-medium">{label}</Label>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(field, parseFloat(e.target.value) || 0)}
          className="h-8 text-sm font-data w-28 bg-white border-slate-200"
        />
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

export function ManifestTab({
  streams,
  config,
  onConfigChange,
  onRun,
  loading,
}: ManifestTabProps) {
  return (
    <div className="space-y-5">
      {/* Waste Streams Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 pt-4 px-5">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-slate-400" />
            <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Waste Manifest — {streams.length} Stream{streams.length !== 1 ? "s" : ""}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-slate-200">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide pl-5">
                  Stream ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                  Qty (L)
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                  BTU/lb
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  pH
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                  F (ppm)
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                  Solids %
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right pr-5">
                  Salt (ppm)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {streams.map((s, i) => {
                const color = STREAM_COLORS[i % STREAM_COLORS.length];
                return (
                  <TableRow
                    key={s.stream_id}
                    className="hover:bg-slate-50/60 border-slate-100"
                  >
                    <TableCell className="pl-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${color.bg} border ${color.border}`}
                        />
                        <span className={`font-semibold text-sm ${color.text}`}>
                          {s.stream_id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-data text-sm text-slate-700">
                      {s.quantity_L.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <BtuBadge btu={s.btu_per_lb} />
                    </TableCell>
                    <TableCell>
                      <PhBadge ph={s.pH} />
                    </TableCell>
                    <TableCell className="text-right font-data text-sm text-slate-600">
                      {s.f_ppm.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-data text-sm text-slate-600">
                      {s.solid_pct.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right font-data text-sm text-slate-600 pr-5">
                      {s.salt_ppm.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Config Overrides */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Reactor Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <ConfigField
              label="Feed Capacity"
              value={config.F_total ?? 11.0}
              field="F_total"
              onChange={onConfigChange}
              unit="L/min"
            />
            <ConfigField
              label="Thermal Efficiency"
              value={config.eta ?? 0.89}
              field="eta"
              onChange={onConfigChange}
              unit="η"
              step={0.01}
            />
            <ConfigField
              label="BTU Target"
              value={config.BTU_target ?? 2200}
              field="BTU_target"
              onChange={onConfigChange}
              unit="BTU/lb"
              step={50}
            />
            <ConfigField
              label="Diesel Cost"
              value={config.cost_diesel_per_L ?? 1.0}
              field="cost_diesel_per_L"
              onChange={onConfigChange}
              unit="$/L"
              step={0.01}
            />
            <ConfigField
              label="NaOH Cost"
              value={config.cost_naoh_per_L ?? 1.51}
              field="cost_naoh_per_L"
              onChange={onConfigChange}
              unit="$/L"
              step={0.01}
            />
          </div>
        </CardContent>
      </Card>

      {/* Run Button */}
      {streams.length > 0 && (
        <ShimmerButton
          onClick={onRun}
          disabled={loading}
          shimmerColor="#ff8c00"
          background="rgba(15, 23, 42, 0.95)"
          className="w-full h-12 text-sm font-semibold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing Feed Schedule…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run Optimization
            </span>
          )}
        </ShimmerButton>
      )}
    </div>
  );
}
