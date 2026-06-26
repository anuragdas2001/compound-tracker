"use client";

import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Bell,
  BarChart3,
  Download,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Daily Streaks",
    description:
      "Build unstoppable momentum. Visualizing your streak makes breaking a habit painful.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Never miss a beat with contextual notifications designed to nudge, not annoy.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Track completion rates, trends, heatmaps, and consistency scores over time.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-on-surface relative overflow-hidden">
      {/* Grid */}
      <div className="grid-background" />

      {/* Glow */}
      <div className="hero-glow" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold text-primary">
              Compound
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-white/70">
            <Link href="#">Features</Link>
            <Link href="#">Analytics</Link>
            <Link href="#">Pricing</Link>
            <Link href="#">About</Link>
          </nav>

          <Link
            href="#"
            className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:scale-[1.02] transition"
          >
            Join Now
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* LEFT */}
            <div>
              <h1 className="text-6xl lg:text-8xl font-extrabold tracking-tight leading-[0.9]">
                Master your habits.
                <span className="block text-primary relative mt-2">
                  Compound your success.

                  <svg
                    className="absolute -bottom-5 left-0 w-full text-primary/60"
                    viewBox="0 0 200 20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,10 Q100,20 200,5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-xl text-white/70 mt-10 max-w-xl leading-9">
                Track your progress, build discipline, and transform
                small daily actions into extraordinary long-term
                results.
              </p>

              <div className="flex flex-wrap gap-4 mt-12">
                <Link
                  href="#"
                  className="bg-primary text-black px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="#"
                  className="border border-white/10 bg-[#0c1511] px-8 py-4 rounded-xl inline-flex items-center gap-2"
                >
                  <Download size={18} />
                  Download App
                </Link>
              </div>

              <div className="flex flex-wrap gap-8 mt-12 text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-5 w-5" />
                  Free Forever
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-5 w-5" />
                  No Credit Card
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-primary h-5 w-5" />
                  Cross Platform
                </div>
              </div>
            </div>

            {/* RIGHT PRODUCT MOCKUP */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 blur-3xl" />

              <div className="relative bg-[#08120d] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-white/50 text-sm">
                      Current Streak
                    </p>

                    <h3 className="text-5xl font-extrabold text-primary">
                      127
                    </h3>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    🔥 On Fire
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-8">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-md ${
                        i % 5 === 0
                          ? "bg-white/10"
                          : "bg-primary"
                      }`}
                    />
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5">
                    <p className="text-white/50 text-sm">
                      Completion Rate
                    </p>

                    <h4 className="text-4xl font-bold mt-2">
                      92%
                    </h4>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-2xl p-5">
                    <p className="text-white/50 text-sm">
                      Consistency Score
                    </p>

                    <h4 className="text-4xl font-bold mt-2 text-primary">
                      A+
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3">
            <div className="py-12 text-center">
              <div className="text-primary text-6xl font-extrabold">
                100K+
              </div>

              <p className="text-white/60 mt-3">
                Users Building Better Lives
              </p>
            </div>

            <div className="py-12 text-center border-x border-white/5">
              <div className="text-primary text-6xl font-extrabold">
                1M+
              </div>

              <p className="text-white/60 mt-3">
                Habits Completed
              </p>
            </div>

            <div className="py-12 text-center">
              <div className="text-primary text-6xl font-extrabold">
                4.9
                <span className="text-3xl">/5</span>
              </div>

              <p className="text-white/60 mt-3">
                Average App Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-primary uppercase tracking-[0.3em] text-sm">
              Features
            </span>

            <h2 className="text-5xl font-bold mt-4">
              Everything needed for consistency
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="bg-[#08120d] border border-white/5 rounded-3xl p-8 hover:border-primary/30 transition"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${feature.bg} ${feature.border}`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>

                  <h3 className="text-2xl font-semibold mt-6">
                    {feature.title}
                  </h3>

                  <p className="text-white/60 mt-4 leading-8">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-[#08120d] border border-white/5 rounded-3xl p-10">
              <h3 className="text-3xl font-bold mb-4">
                Heatmap Tracking
              </h3>

              <p className="text-white/60 mb-8">
                Visualize consistency and identify weak spots
                instantly.
              </p>

              <div className="grid grid-cols-12 gap-2">
                {Array.from({ length: 84 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded ${
                      i % 4 === 0
                        ? "bg-white/10"
                        : "bg-primary/80"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-[#08120d] border border-white/5 rounded-3xl p-10">
              <h3 className="text-3xl font-bold mb-4">
                Deep Analytics
              </h3>

              <p className="text-white/60 mb-8">
                Understand patterns, trends and long-term
                growth.
              </p>

              <div className="flex items-end gap-3 h-64">
                {[30, 60, 40, 80, 65, 100].map((v) => (
                  <div
                    key={v}
                    className="flex-1 bg-primary rounded-t-xl"
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-[#08120d] border border-white/5 rounded-[32px] p-12 text-center">
            <h2 className="text-5xl font-bold">
              Start building better habits today
            </h2>

            <p className="text-white/60 mt-6 text-lg">
              Join thousands of users already compounding
              their success.
            </p>

            <Link
              href="#"
              className="inline-flex mt-10 bg-primary text-black px-8 py-4 rounded-xl font-bold items-center gap-2"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-primary text-2xl font-bold">
            Compound
          </div>

          <div className="flex gap-8 text-white/60">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Support</Link>
            <Link href="#">Contact</Link>
          </div>

          <div className="text-white/30 text-sm">
            © 2024 Compound Performance Systems
          </div>
        </div>
      </footer>
    </main>
  );
}