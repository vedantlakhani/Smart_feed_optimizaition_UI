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
    <div className="min-h-screen flex flex-col" style={{ background: "#f0f2f4" }}>
      {/* Sticky topbar */}
      <Topbar selectedFile={selectedFile} onFileChange={setSelectedFile} />

      {/* Impact KPI header */}
      <ImpactHeader result={result} loading={loading} />

      {/* Tab bar — AxNano charcoal chrome */}
      <div style={{ background: "#2b2a2b", borderBottom: "2px solid #2aabe1" }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Error banner */}
          {error && (
            <div className="pt-3 pb-0">
              <div className="px-4 py-2 bg-red-900/40 border border-red-500/50 text-red-300 text-sm flex items-start gap-2">
                <span className="font-bold shrink-0 uppercase tracking-wide text-xs">Error:</span>
                <span className="font-mono text-xs leading-relaxed break-all">{error}</span>
              </div>
            </div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-0 shadow-none h-auto p-0 flex gap-0 rounded-none">
              {TABS.map((t) => {
                const isResultTab = resultTabs.includes(t.value);
                const isDisabled = isResultTab && !result;
                return (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    disabled={isDisabled}
                    className="
                      relative rounded-none border-0 bg-transparent px-5 py-3.5
                      text-xs font-bold uppercase tracking-widest text-white/50
                      gap-1.5 transition-colors duration-150
                      hover:text-white/80
                      data-[state=active]:bg-transparent
                      data-[state=active]:text-white
                      data-[state=active]:shadow-none
                      data-[state=active]:after:absolute
                      data-[state=active]:after:bottom-0
                      data-[state=active]:after:left-0
                      data-[state=active]:after:right-0
                      data-[state=active]:after:h-[2px]
                      data-[state=active]:after:bg-[#2aabe1]
                      disabled:opacity-25 disabled:cursor-not-allowed
                    "
                  >
                    {t.icon}
                    <span className="hidden sm:inline">{t.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Tab content — sits outside the dark bar */}
            <div style={{ background: "#f0f2f4" }}>
              <div className="py-5" style={{ background: "#f0f2f4" }}>
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
            </div>
          </Tabs>
        </div>
      </div>

      {/* Spacer to push footer down */}
      <div className="flex-1" />

      {/* Footer */}
      <footer style={{ background: "#2b2a2b", borderTop: "1px solid #3d3d3d" }} className="px-6 py-3 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2aabe1" }}>
            AxNano SmartFeed v9
          </span>
          <span className="text-xs font-light" style={{ color: "#737373" }}>
            SCWO Reactor Optimization · MVP Prototype · ≤5 Waste Streams
          </span>
        </div>
      </footer>
    </div>
  );
}
