"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import Link from "next/link";

/* ─────────────────────────────────────
   Motion variants
───────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─────────────────────────────────────
   Stat ticker — initial text prevents
   empty-span dimension bug
───────────────────────────────────── */
function StatTicker({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <span
      ref={ref}
      className={`font-data tabular-nums transition-opacity duration-700 ${
        isInView ? "opacity-100" : "opacity-20"
      }`}
    >
      {value}
    </span>
  );
}

/* ─────────────────────────────────────
   Steps data
───────────────────────────────────── */
const STEPS = [
  {
    n: "01",
    title: "LOAD YOUR INVENTORY",
    body: "Enter each waste stream: volume, energy content, acidity, dissolved solids. Under 2 minutes.",
  },
  {
    n: "02",
    title: "OPTIMIZER FINDS THE BLEND",
    body: "Every possible combination evaluated. The lowest-cost mix that keeps the reactor safe rises to the top.",
  },
  {
    n: "03",
    title: "GET A READY-TO-RUN PLAN",
    body: "Operator-ready instructions: which streams to mix, additive quantities, total processing cost.",
  },
];

/* ─────────────────────────────────────
   Stats bar data
───────────────────────────────────── */
const STATS = [
  { value: "47%", label: "COST REDUCTION" },
  { value: "100%", label: "DIESEL OFFSET" },
  { value: "40 kg CO\u2082", label: "AVOIDED PER BATCH" },
  { value: "<1s", label: "DEMO RESULT TIME" },
];

/* ─────────────────────────────────────
   Impact metric cards
───────────────────────────────────── */
const IMPACT = [
  { value: "40 kg CO\u2082", label: "AVOIDED PER BATCH", sub: "per batch (3-stream demo)" },
  { value: "100%", label: "DIESEL OFFSET", sub: "complementary streams supply the energy" },
  { value: "330 km", label: "CAR EQUIVALENT REMOVED", sub: "40 kg CO\u2082 \u2248 taking one car off the road for a week" },
];

/* ─────────────────────────────────────
   Page
───────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen antialiased" style={{ fontFamily: "'Open Sans', system-ui, sans-serif", background: "#1a1a1a" }}>

      {/* ── Accent bar ────────────────────────────────── */}
      <div
        style={{ background: "#2aabe1" }}
        className="px-6 py-2 text-center text-white text-xs font-semibold tracking-widest uppercase"
      >
        Pioneering Complex Waste Destruction &nbsp;·&nbsp; SCWO Optimization Technology &nbsp;·&nbsp; axnano.com
      </div>

      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50" style={{ background: "#2b2a2b" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <span
              className="text-xl font-extrabold uppercase tracking-wider text-white"
              style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}
            >
              Ax<span style={{ color: "#2aabe1" }}>Nano</span>
            </span>
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "#2aabe1" }}
            >
              SmartFeed
            </span>
          </div>
          {/* CTA */}
          <Link href="/dashboard">
            <button
              className="px-5 py-2 text-sm font-bold uppercase tracking-widest text-white transition-colors duration-200"
              style={{
                border: "2px solid #2aabe1",
                background: "transparent",
                borderRadius: 0,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#2aabe1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              ENTER DEMO →
            </button>
          </Link>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden flex flex-col items-center justify-center px-6 py-32 text-center min-h-screen"
        style={{ background: "#1a1a1a" }}
      >
        {/* Geometric grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(42,171,225,0.03) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(42,171,225,0.03) 80px)",
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto max-w-4xl"
        >
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-6 text-xs font-bold uppercase tracking-widest"
            style={{ color: "#2aabe1" }}
          >
            WASTE STREAM OPTIMIZATION
          </motion.p>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mb-8 text-5xl font-extrabold uppercase leading-tight text-white sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Open Sans', system-ui, sans-serif", fontWeight: 800 }}
          >
            STOP PROCESSING WASTE
            <br />
            ONE STREAM AT A TIME.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-light sm:text-xl"
            style={{ color: "#737373" }}
          >
            Complementary waste streams cancel each other&apos;s costs. AxNano SmartFeed finds the blend that cuts fuel, chemicals, and reactor time — up to 47% cheaper.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <button
                className="px-8 py-4 text-base font-bold uppercase tracking-widest text-white transition-colors duration-200"
                style={{
                  background: "#2aabe1",
                  border: "2px solid #2aabe1",
                  borderRadius: 0,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#27aae1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#2aabe1";
                }}
              >
                ENTER DEMO →
              </button>
            </Link>
            <a href="#how-it-works">
              <button
                className="px-8 py-4 text-base font-bold uppercase tracking-widest text-white transition-colors duration-200"
                style={{
                  background: "transparent",
                  border: "2px solid white",
                  borderRadius: 0,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#2aabe1";
                  (e.currentTarget as HTMLButtonElement).style.color = "#2aabe1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "white";
                  (e.currentTarget as HTMLButtonElement).style.color = "white";
                }}
              >
                HOW IT WORKS ↓
              </button>
            </a>
          </motion.div>

          {/* Sub-note */}
          <motion.p
            variants={fadeUp}
            custom={4}
            className="mt-8 text-sm"
            style={{ color: "#737373" }}
          >
            No sign-up required &nbsp;·&nbsp; 3-stream demo &nbsp;·&nbsp; Results in under 1 second
          </motion.p>
        </motion.div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section style={{ background: "#2b2a2b" }}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: "#3d3d3d" }}>
            {STATS.map(({ value, label }, i) => (
              <div
                key={label}
                className="flex flex-col items-center py-6 px-4"
                style={i > 0 ? { borderLeft: "1px solid #3d3d3d" } : {}}
              >
                <span
                  className="font-data text-3xl font-bold text-white mb-1"
                >
                  <StatTicker value={value} />
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#2aabe1" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how-it-works" style={{ background: "#111111" }} className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="mb-4 text-center text-xs font-bold uppercase tracking-widest"
              style={{ color: "#2aabe1" }}
            >
              THE PROCESS
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mb-16 text-center text-3xl font-extrabold uppercase text-white sm:text-4xl"
              style={{ fontFamily: "'Open Sans', system-ui, sans-serif", fontWeight: 800 }}
            >
              THREE STEPS TO AN OPTIMIZED PLAN.
            </motion.h2>

            <div className="grid gap-6 sm:grid-cols-3">
              {STEPS.map(({ n, title, body }, i) => (
                <motion.div
                  key={n}
                  variants={fadeUp}
                  custom={i}
                  className="p-8"
                  style={{
                    background: "#1e1e1e",
                    border: "1px solid #333",
                    borderRadius: 0,
                  }}
                >
                  <div
                    className="font-data text-5xl font-bold mb-4"
                    style={{ color: "#2aabe1" }}
                  >
                    {n}
                  </div>
                  <h3
                    className="mb-3 text-sm font-bold uppercase tracking-widest text-white"
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed font-light" style={{ color: "#737373" }}>
                    {body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Impact ────────────────────────────────────────── */}
      <section style={{ background: "#ffffff" }} className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="mb-4 text-center text-xs font-bold uppercase tracking-widest"
              style={{ color: "#2aabe1" }}
            >
              ENVIRONMENTAL IMPACT
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mb-4 text-center text-3xl font-extrabold uppercase sm:text-4xl"
              style={{ fontFamily: "'Open Sans', system-ui, sans-serif", fontWeight: 800, color: "#2b2a2b" }}
            >
              FEWER EMISSIONS. NOT JUST LOWER COSTS.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mx-auto mb-14 max-w-xl text-center font-light"
              style={{ color: "#737373" }}
            >
              Blending reduces supplemental fuel burned per batch — and the CO₂ that goes with it.
            </motion.p>

            <div className="grid gap-5 sm:grid-cols-3">
              {IMPACT.map(({ value, label, sub }, i) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  custom={i}
                  className="p-8"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e1e1e1",
                    borderRadius: 0,
                  }}
                >
                  <div
                    className="font-data text-4xl font-bold mb-2"
                    style={{ color: "#2b2a2b" }}
                  >
                    <StatTicker value={value} />
                  </div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: "#2aabe1" }}
                  >
                    {label}
                  </p>
                  <p className="text-sm font-light" style={{ color: "#737373" }}>
                    {sub}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.p
              variants={fadeUp}
              className="mt-8 text-center text-xs italic"
              style={{ color: "#737373" }}
            >
              Estimated from the representative 3-stream demo scenario (15 L supplemental fuel × 2.68 kg CO₂/L). Actual savings vary by waste profile.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section style={{ background: "#2b2a2b" }} className="px-6 py-28 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="mx-auto max-w-2xl"
        >
          <motion.h2
            variants={fadeUp}
            className="mb-5 text-4xl font-extrabold uppercase text-white sm:text-5xl"
            style={{ fontFamily: "'Open Sans', system-ui, sans-serif", fontWeight: 800 }}
          >
            SEE IT WORK ON REAL DATA.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mb-10 text-lg font-light"
            style={{ color: "#737373" }}
          >
            Pre-configured 3-stream scenario. No setup. Open and run.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/dashboard">
              <button
                className="px-12 py-5 text-base font-bold uppercase tracking-widest text-white transition-colors duration-200"
                style={{
                  background: "#2aabe1",
                  border: "2px solid #2aabe1",
                  borderRadius: 0,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#27aae1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#2aabe1";
                }}
              >
                ENTER DEMO →
              </button>
            </Link>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-sm font-light"
            style={{ color: "#737373" }}
          >
            No sign-up &nbsp;·&nbsp; No configuration &nbsp;·&nbsp; Just open and run
          </motion.p>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        style={{ background: "#2b2a2b", borderTop: "1px solid #3d3d3d" }}
        className="px-6 py-8"
      >
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-lg font-extrabold uppercase tracking-wider text-white"
            style={{ fontFamily: "'Open Sans', system-ui, sans-serif" }}
          >
            Ax<span style={{ color: "#2aabe1" }}>Nano</span>{" "}
            <span className="text-white font-light text-base">SmartFeed</span>
          </span>
          <span className="text-sm" style={{ color: "#737373" }}>
            © 2026 AxNano. All Rights Reserved.
          </span>
        </div>
        <div className="mx-auto max-w-6xl mt-4 text-center">
          <span className="text-xs" style={{ color: "#555" }}>
            Waste Stream Optimization for SCWO Reactors
          </span>
        </div>
      </footer>
    </div>
  );
}
