"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { FlaskConical, Activity, TrendingDown, Flame, ArrowRight } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { BorderBeam } from "@/components/magicui/border-beam";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
};

const STEPS = [
  {
    step: "01",
    icon: <FlaskConical className="w-5 h-5 text-ax-orange" />,
    title: "Load your waste inventory",
    desc: "Enter each waste stream — volume, energy content, acidity, and solids. Takes under 2 minutes.",
    accent: "border-l-ax-orange",
  },
  {
    step: "02",
    icon: <Activity className="w-5 h-5 text-ax-cyan" />,
    title: "Optimizer finds the best blend",
    desc: "The algorithm evaluates every possible combination and mix proportion to find the lowest-cost processing plan.",
    accent: "border-l-ax-cyan",
  },
  {
    step: "03",
    icon: <TrendingDown className="w-5 h-5 text-emerald-500" />,
    title: "Get a ready-to-run plan",
    desc: "Receive step-by-step operator instructions: which streams to mix, how much of each additive to add, and the total cost.",
    accent: "border-l-emerald-400",
  },
];

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      {/* Section 1 — Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
        {/* Animated eyebrow badge */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <AnimatedGradientText className="mb-6 border border-slate-200 bg-white/80">
            Cut waste processing costs by up to 47%
          </AnimatedGradientText>
        </motion.div>

        {/* H1 — problem statement */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight"
        >
          Processing waste streams one at a time is expensive.
        </motion.h1>

        {/* Sub — solution statement */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Every batch run alone demands supplemental fuel, neutralising chemicals, and hours of reactor time.
          AxNano SmartFeed finds the right blend of your waste streams so complementary wastes cancel out
          their costs instead of doubling them.
        </motion.p>

        {/* Hero CTA — duplicate for above-fold conversion; main CTA repeated in section 4 */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <Link href="/dashboard" className="block w-fit mx-auto">
            <ShimmerButton
              shimmerColor="#FF8C00"
              background="rgba(255,140,0,0.95)"
              borderRadius="12px"
              className="px-8 py-4 text-base font-semibold"
            >
              See the Optimizer in Action <ArrowRight className="inline ml-2 w-4 h-4" />
            </ShimmerButton>
          </Link>
        </motion.div>
      </section>

      {/* Section 2 — How It Works / 3-step explainer */}
      <section className="px-6 py-16 bg-slate-50">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl font-bold text-slate-900 text-center mb-2"
          >
            How it works
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-center mb-10">
            Three steps from waste inventory to optimized processing plan.
          </motion.p>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} custom={i + 2}>
                <Card
                  className={`shadow-card hover:shadow-card-hover transition-shadow duration-300 border-l-4 ${s.accent}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {s.icon}
                      <span className="text-xs font-semibold text-slate-400 font-data">STEP {s.step}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 3 — Climate Impact */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl font-bold text-slate-900 text-center mb-2"
          >
            Fewer emissions, not just lower costs
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-slate-500 text-center mb-10">
            Blending reduces the supplemental fuel burned per batch.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="relative max-w-sm mx-auto">
            <Card className="shadow-card-hover text-center overflow-hidden">
              <BorderBeam colorFrom="#FF8C00" colorTo="#06B6D4" duration={8} />
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-6 h-6 text-ax-orange" />
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    CO₂ avoided per batch
                  </span>
                </div>
                <div className="my-4">
                  <NumberTicker
                    value={40}
                    suffix=" kg CO₂"
                    className="text-5xl font-bold text-ax-cyan font-data"
                  />
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  equivalent to taking a car off the road for ~330 km
                </p>
                <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 pt-3">
                  Estimated from representative 3-stream scenario (15 L diesel × 2.68 kg CO₂/L).
                  Actual savings vary by waste profile.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Section 4 — Final CTA */}
      <section className="px-6 py-20 text-center bg-slate-900">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl mx-auto"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-4xl font-bold text-white mb-4"
          >
            See it work on real data
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-slate-400 text-lg mb-10">
            The demo loads a pre-configured 3-stream scenario — results in under a second.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link href="/dashboard" className="block w-fit mx-auto">
              <ShimmerButton
                shimmerColor="#FF8C00"
                background="rgba(255,140,0,0.95)"
                borderRadius="12px"
                className="px-10 py-4 text-base font-semibold"
              >
                Open the Demo <ArrowRight className="inline ml-2 w-4 h-4" />
              </ShimmerButton>
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} custom={3} className="text-slate-500 text-sm mt-6">
            No sign-up. No configuration. Just open and run.
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}
