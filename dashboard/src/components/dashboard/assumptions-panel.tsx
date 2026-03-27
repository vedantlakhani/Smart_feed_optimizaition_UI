"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FlaskConical } from "lucide-react";

const K_ASSUMPTIONS = [
  {
    key: "K_F_TO_ACID",
    plainLabel: "Fluoride-to-acid conversion",
    value: "0.053",
    unit: "meq / (L·ppm)",
    plainDesc: "Converts the fluoride concentration in the waste into an acid load the system must neutralize. Calculated from chemistry first principles; not yet measured on the reactor.",
  },
  {
    key: "K_PH_TO_BASE",
    plainLabel: "pH base contribution",
    value: "50.0",
    unit: "meq / (L·pH_unit)",
    plainDesc: "Estimates how much alkalinity a high-pH stream contributes to offset acid neutralization. Calculated from first principles; not yet measured.",
  },
  {
    key: "K_ACID_TO_NAOH_VOL",
    plainLabel: "Acid-to-neutralizer volume",
    value: "8.28e-5",
    unit: "L_NaOH / meq",
    plainDesc: "Converts the net acid load into a volume of NaOH solution to add. Calculated from solution chemistry; not yet measured on the reactor.",
  },
];

const MVP_ASSUMPTIONS = [
  { id: "A1", short: "Stream limit", plainEnglish: "The optimizer works with up to 5 waste streams at a time; larger inventories must be split into batches." },
  { id: "A2", short: "Fixed flow rate", plainEnglish: "The reactor runs at a fixed total flow rate — adding water or fuel supplement displaces an equal volume of waste feed." },
  { id: "A3", short: "Constant throughput", plainEnglish: "The reactor's total throughput capacity is held constant within each processing step." },
  { id: "A4", short: "Linear blending", plainEnglish: "Energy content, fluoride, solids, and salt all blend in direct proportion to the mix volumes — like mixing paint." },
  { id: "A5", short: "Fixed unit costs", plainEnglish: "Unit costs for fuel, neutralizer, water, electricity, and labour are fixed at the values shown and do not change with volume." },
  { id: "A6", short: "Water density", plainEnglish: "All waste streams are treated as water-density fluids (1 kg per litre) for volume-to-mass conversions." },
  { id: "A7", short: "Manifest properties", plainEnglish: "Waste properties are taken directly from the waste manifest without any pre-processing or laboratory adjustment." },
  { id: "A8", short: "Density = 1 kg/L", plainEnglish: "Density is assumed to be 1 kg per litre for all streams, consistent with the water-density assumption above." },
  { id: "A9", short: "Moisture display only", plainEnglish: "Moisture content is shown on the waste manifest for reference only and does not affect any cost or flow calculation in this version." },
];

export function AssumptionsPanel() {
  return (
    <Card className="shadow-card border-slate-200">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-slate-400" />
          <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest">
            Model Assumptions
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-6">

        {/* K-Values section — CHEM-01 */}
        <div>
          <p className="text-xs font-bold text-ax-cyan uppercase tracking-widest mb-3">
            Calibration Parameters
          </p>
          <div className="space-y-2">
            {K_ASSUMPTIONS.map((k) => (
              <div
                key={k.key}
                className="flex items-start justify-between p-3 rounded-lg bg-white border border-slate-200"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">
                      {k.plainLabel}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-50 text-amber-700 text-xs"
                    >
                      Theoretical estimate — not yet calibrated
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{k.plainDesc}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-data text-sm font-bold text-slate-700">{k.value}</div>
                  <div className="text-xs text-slate-400">{k.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* MVP Assumptions section — CHEM-04 */}
        <div>
          <p className="text-xs font-bold text-ax-cyan uppercase tracking-widest mb-3">
            MVP Assumptions
          </p>
          <Accordion multiple className="space-y-1">
            {MVP_ASSUMPTIONS.map((a) => (
              <AccordionItem key={a.id} value={a.id} className="border-slate-200">
                <AccordionTrigger className="px-3 py-2 text-sm hover:bg-slate-50 hover:no-underline rounded-md">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-6 shrink-0">
                      {a.id}
                    </span>
                    <span className="text-xs text-slate-600">{a.short}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-2">
                  <p className="text-xs text-slate-500 leading-relaxed pl-8">{a.plainEnglish}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </CardContent>
    </Card>
  );
}
