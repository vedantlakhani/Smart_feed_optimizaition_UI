import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
          AxNano SmartFeed
        </h1>
        <p className="text-lg text-slate-500 mb-8">
          Cut SCWO reactor operating costs by intelligently blending complementary waste streams.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
