"use client";

import { motion, type Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  Zap,
  FlaskConical,
  TrendingDown,
  ArrowRight,
  Droplets,
  Flame,
  Activity,
  ShieldCheck,
  CircleDollarSign,
  Clock,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Waste Inventory",
    desc: "You provide each stream's ID, volume, BTU value, pH, fluorine, solids, and salt concentration.",
    icon: <FlaskConical className="w-5 h-5 text-ax-orange" />,
    color: "border-l-ax-orange",
  },
  {
    step: "02",
    title: "Baseline Calculation",
    desc: "Each stream is costed solo — diesel, NaOH, water, electricity, and labour — establishing the benchmark.",
    icon: <CircleDollarSign className="w-5 h-5 text-slate-500" />,
    color: "border-l-slate-300",
  },
  {
    step: "03",
    title: "Blend Search",
    desc: "All feasible multi-stream combinations and ratios are evaluated. Branch-and-bound pruning finds the global minimum-cost schedule.",
    icon: <Activity className="w-5 h-5 text-ax-cyan" />,
    color: "border-l-ax-cyan",
  },
  {
    step: "04",
    title: "Optimal Schedule",
    desc: "The lowest-cost multi-phase plan is returned: per-phase blend ratios, additive pump rates, runtimes, and itemised costs.",
    icon: <TrendingDown className="w-5 h-5 text-emerald-500" />,
    color: "border-l-emerald-400",
  },
];

const STATS = [
  { label: "Typical Savings", value: "36–47%", icon: <TrendingDown className="w-4 h-4" />, color: "text-ax-orange", bg: "bg-[#fff7ed]" },
  { label: "Max Streams", value: "5", icon: <FlaskConical className="w-4 h-4" />, color: "text-ax-cyan", bg: "bg-[#ecfeff]" },
  { label: "3-Stream Runtime", value: "0.01s", icon: <Clock className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "DRE Guarantee", value: "99.99%", icon: <ShieldCheck className="w-4 h-4" />, color: "text-slate-600", bg: "bg-slate-100" },
];

const BLENDING_PAIRS = [
  {
    a: { label: "High BTU", icon: <Flame className="w-4 h-4 text-ax-orange" />, color: "border-ax-orange bg-[#fff7ed]" },
    b: { label: "Low BTU", icon: <Droplets className="w-4 h-4 text-ax-cyan" />, color: "border-ax-cyan bg-[#ecfeff]" },
    benefit: "Eliminates supplemental diesel",
  },
  {
    a: { label: "Acidic (low pH)", icon: <FlaskConical className="w-4 h-4 text-red-500" />, color: "border-red-300 bg-red-50" },
    b: { label: "Alkaline (high pH)", icon: <FlaskConical className="w-4 h-4 text-blue-500" />, color: "border-blue-300 bg-blue-50" },
    benefit: "Reduces NaOH neutralisation cost",
  },
  {
    a: { label: "High Solids", icon: <Activity className="w-4 h-4 text-amber-600" />, color: "border-amber-300 bg-amber-50" },
    b: { label: "Aqueous Liquid", icon: <Droplets className="w-4 h-4 text-slate-500" />, color: "border-slate-300 bg-slate-100" },
    benefit: "Dilutes solids within pumpable limit",
  },
];

export function IntroTab() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="text-center pt-2"
      >
        <AnimatedGradientText className="mb-4 text-base font-semibold mx-auto">
          Erasing the Green Premium — One Blend at a Time
        </AnimatedGradientText>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 mb-3">
          Smart-Feed Algorithm v9
        </h1>
        <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
          Multi-phase feed optimisation for SCWO reactors. Reduces operating costs by
          intelligently blending complementary waste streams — turning waste chemistry
          into a cost advantage.
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {STATS.map((s) => (
          <Card key={s.label} className="shadow-sm border-slate-200 text-center">
            <CardContent className="py-4 px-3">
              <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>{s.icon}</div>
              <div className={`text-xl font-bold font-data ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Core Insight */}
      <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
        <Card className="relative overflow-hidden shadow-sm border-slate-200 card-accent-orange">
          <BorderBeam size={400} duration={14} colorFrom="#ff8c00" colorTo="#06b6d4" borderWidth={1.5} />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#fff7ed] shrink-0">
                <Zap className="w-6 h-6 text-ax-orange" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-base font-bold uppercase tracking-widest text-slate-900">Core Insight</h2>
                  <Badge variant="outline" className="border-ax-orange/40 bg-[#fff7ed] text-ax-orange text-xs">
                    Key Value Driver
                  </Badge>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Different wastes have <strong>complementary properties</strong>. Blending a
                  high-BTU resin with a low-BTU aqueous stream eliminates the need for
                  supplemental diesel. Blending an acidic stream with an alkaline one
                  reduces NaOH demand. The algorithm finds the combination that minimises
                  total external input cost across your entire waste inventory.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Complementary Pairs */}
      <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp}>
        <h3 className="text-sm font-bold text-ax-cyan uppercase tracking-widest mb-3">
          Complementary Blending Pairs
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {BLENDING_PAIRS.map((pair, i) => (
            <Card key={i} className="shadow-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${pair.a.color}`}>
                    {pair.a.icon} {pair.a.label}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${pair.b.color}`}>
                    {pair.b.icon} {pair.b.label}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium">{pair.benefit}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}>
        <h3 className="text-sm font-bold text-ax-cyan uppercase tracking-widest mb-3">
          How It Works
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={step.step} initial="hidden" animate="visible" custom={5 + i} variants={fadeUp}>
              <Card className={`shadow-sm border-slate-200 border-l-4 ${step.color}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">{step.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-data text-xs font-bold text-slate-400">{step.step}</span>
                        <span className="text-sm font-semibold text-slate-800">{step.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* MVP note */}
      <motion.div initial="hidden" animate="visible" custom={9} variants={fadeUp}>
        <div className="px-4 py-3 rounded-lg bg-white border border-slate-200 flex items-start gap-2">
          <Badge variant="outline" className="border-slate-300 text-slate-500 text-xs shrink-0 mt-0.5">
            MVP
          </Badge>
          <p className="text-xs text-slate-400 leading-relaxed">
            This prototype supports <strong className="text-slate-600">exact search</strong> for up to 5 waste streams
            with branch-and-bound pruning. Search completes in{" "}
            <span className="font-data text-slate-600">0.01s</span> (3 streams),{" "}
            <span className="font-data text-slate-600">0.8s</span> (4 streams), and{" "}
            <span className="font-data text-slate-600">~60s</span> (5 streams).
            Three K-values (F→acid, pH→base, acid→NaOH vol) are pending calibration from operational data.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
