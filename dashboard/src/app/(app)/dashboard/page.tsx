"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Topbar } from "@/components/dashboard/topbar";
import { ImpactHeader } from "@/components/dashboard/impact-header";
import { IntroTab } from "@/components/dashboard/intro-tab";
import { ManifestTab } from "@/components/dashboard/manifest-tab";
import { RecipeTab } from "@/components/dashboard/recipe-tab";
import { OperationTab } from "@/components/dashboard/operation-tab";
import { PhaseDetailsTab } from "@/components/dashboard/phase-details-tab";
import { CostStory } from "@/components/dashboard/cost-story";
import { ExpertOverrides } from "@/components/dashboard/expert-overrides";
import type {
  WasteStream,
  SystemConfig,
  OptimizationResult,
  InputFile,
} from "@/lib/types";
import { DEFAULT_CONFIG } from "@/lib/types";
import {
  BookOpen,
  ClipboardList,
  FlaskConical,
  HardHat,
  Microscope,
} from "lucide-react";

const TABS = [
  { value: "intro",     label: "Introduction",  icon: <BookOpen className="w-3.5 h-3.5" /> },
  { value: "manifest",  label: "Waste Streams", icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { value: "recipe",    label: "Optimization",  icon: <FlaskConical className="w-3.5 h-3.5" /> },
  { value: "operation", label: "Operation",     icon: <HardHat className="w-3.5 h-3.5" /> },
  { value: "details",   label: "Phase Details", icon: <Microscope className="w-3.5 h-3.5" /> },
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [streams, setStreams] = useState<WasteStream[]>([]);
  const [config, setConfig] = useState<Partial<SystemConfig>>(DEFAULT_CONFIG);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [activeTab, setActiveTab] = useState("intro");
  const [error, setError] = useState<string | null>(null);

  // Load input file when selection changes
  useEffect(() => {
    if (!selectedFile) return;
    setResult(null);
    setError(null);
    fetch(`/api/load-input?file=${encodeURIComponent(selectedFile)}`)
      .then((r) => r.json())
      .then((data: InputFile) => {
        setStreams(data.streams ?? []);
        setConfig({ ...DEFAULT_CONFIG, ...(data.config ?? {}) });
        setActiveTab("manifest");
      })
      .catch(() => setError("Failed to load input file."));
  }, [selectedFile]);

  const handleConfigChange = useCallback(
    (key: keyof SystemConfig, value: number) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleRun = useCallback(async () => {
    if (streams.length === 0) return;
    setLoading(true);
    setError(null);
    setActiveTab("recipe");

    try {
      const resp = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streams, config }),
      });
      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.detail ?? errData.error ?? "Optimization failed");
      }
      const data: OptimizationResult = await resp.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Optimization failed");
      setActiveTab("manifest");
    } finally {
      setLoading(false);
    }
  }, [streams, config]);

  // Show Operation/Details tabs only once we have results
  const resultTabs = ["operation", "details"];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky topbar */}
      <Topbar selectedFile={selectedFile} onFileChange={setSelectedFile} />

      {/* Impact KPI header */}
      <ImpactHeader result={result} loading={loading} />

      <Separator className="bg-slate-200" />

      {/* Main content */}
      <div className="flex-1 px-6 py-5 max-w-7xl mx-auto w-full">
        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <span className="font-semibold shrink-0">Error:</span>
            <span className="font-mono text-xs leading-relaxed break-all">{error}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-white border border-slate-200 shadow-sm h-10 p-1 rounded-lg flex gap-0.5">
            {TABS.map((t) => {
              const isResultTab = resultTabs.includes(t.value);
              const isDisabled = isResultTab && !result;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  disabled={isDisabled}
                  className="text-sm gap-1.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md px-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-5">
            <TabsContent value="intro" className="mt-0">
              <IntroTab />
            </TabsContent>

            <TabsContent value="manifest" className="mt-0">
              <ManifestTab
                streams={streams}
                config={config}
                onConfigChange={handleConfigChange}
                onRun={handleRun}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="recipe" className="mt-0">
              <RecipeTab result={result} loading={loading} />
              {/* Cost Story lives below Recipe output */}
              {(result || loading) && (
                <div className="mt-6">
                  <CostStory result={result} loading={loading} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="operation" className="mt-0">
              <OperationTab result={result} loading={loading} />
            </TabsContent>

            <TabsContent value="details" className="mt-0">
              <PhaseDetailsTab result={result} loading={loading} />
              {/* Technical Calibration panel at bottom of Phase Details */}
              {result && (
                <div className="mt-6">
                  <ExpertOverrides
                    result={result}
                    showTechnical={showTechnical}
                    onToggle={setShowTechnical}
                  />
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-slate-400 text-xs">
            AxNano Smart-Feed Algorithm v9 — SCWO Reactor Optimization
          </span>
          <span className="text-slate-300 text-xs font-data">
            MVP Prototype · ≤5 Waste Streams
          </span>
        </div>
      </footer>
    </div>
  );
}
