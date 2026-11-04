"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instrument_Sans, Outfit } from "next/font/google";
import {
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  Download,
  Flame,
} from "lucide-react";

import "./habitly.css";

const display = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/* -------------------------------------------------------------------------
   Data
   ------------------------------------------------------------------------- */

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Analytics", href: "/analytics" },
  { label: "Pricing", href: "/pricing" },
];

const HABITS = [
  { id: "run", label: "Morning run", detail: "5 km" },
  { id: "read", label: "Read", detail: "20 pages" },
  { id: "code", label: "Write code", detail: "1 hour" },
  { id: "sleep", label: "Lights out", detail: "Before 11 pm" },
];

const STATS = [
  { value: "100K+", label: "People building better routines" },
  { value: "1M+", label: "Habits completed" },
  { value: "4.9/5", label: "Average app rating" },
];

const STEPS = [
  {
    title: "Pick what you want to build",
    text: "Add the habits that matter to you and set how often you want to do each one.",
  },
  {
    title: "Check in once a day",
    text: "Tap to log a habit in a second. Reminders arrive at the times you choose, and only then.",
  },
  {
    title: "Watch it add up",
    text: "Streaks, heatmaps, and weekly trends show how small days turn into months of progress.",
  },
];

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

const WEEKLY_COMPLETION = [30, 60, 40, 80, 65, 100];

/* A fixed pseudo-random sequence, so server and client render the same cells. */
function heatLevels(count: number, seed: number) {
  let s = seed;
  return Array.from({ length: count }, () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const r = s / 4294967296;
    return r < 0.1 ? 0 : r < 0.24 ? 1 : r < 0.46 ? 2 : r < 0.76 ? 3 : 4;
  });
}

const YEAR_HEAT = heatLevels(84, 21);

/* -------------------------------------------------------------------------
   Small pieces
   ------------------------------------------------------------------------- */

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 0c.8 6.2 5.8 11.2 12 12-6.2.8-11.2 5.8-12 12-.8-6.2-5.8-11.2-12-12C6.2 11.2 11.2 6.2 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const markH = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const textH = size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Compound home">
      <div className={`relative ${markH} flex-none overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105`}>
        <Image
          src="/brand_logo.png"
          alt="Compound Logo"
          width={120}
          height={120}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <span className={`font-bold tracking-tight text-[color:var(--hb-text)] drop-shadow-sm ${textH}`}>
        Compound
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------
   Hero card: a small working demo of the product
   ------------------------------------------------------------------------- */

const BASE_STREAK = 126;

function TodayCard() {
  const [done, setDone] = useState<Record<string, boolean>>({
    run: true,
    read: true,
    code: false,
    sleep: false,
  });
  const [touched, setTouched] = useState(false);

  const count = HABITS.filter((h) => done[h.id]).length;
  const allDone = count === HABITS.length;
  const streak = BASE_STREAK + (allDone ? 1 : 0);
  const remaining = HABITS.length - count;

  function toggle(id: string) {
    setTouched(true);
    setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="hb-today p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src="/brand_logo.png"
            alt="Streak flame"
            width={120}
            height={120}
            className="hb-flame h-14 w-14 object-contain"
            data-lit={allDone}
            data-bump={touched && allDone}
          />
          <div>
            <p className="text-sm text-[color:var(--hb-muted)]">Current streak</p>
            <p className="flex items-baseline gap-2">
              <span
                key={streak}
                className="hb-streak-num hb-display text-6xl font-bold leading-none"
                data-bump={touched}
              >
                {streak}
              </span>
              <span className="text-base text-[color:var(--hb-muted)]">days</span>
            </p>
          </div>
        </div>

        <span
          className="hidden rounded-full border px-3.5 py-1.5 text-sm font-medium sm:inline-block"
          style={{
            borderColor: allDone ? "rgba(168,254,67,0.4)" : "var(--hb-line-strong)",
            color: allDone ? "var(--hb-lime)" : "var(--hb-muted)",
            background: allDone ? "rgba(168,254,67,0.08)" : "transparent",
          }}
        >
          {allDone ? "Streak extended" : "Today"}
        </span>
      </div>

      <div
        className="mt-7 grid grid-cols-4 gap-1.5"
        role="progressbar"
        aria-label="Habits completed today"
        aria-valuemin={0}
        aria-valuemax={HABITS.length}
        aria-valuenow={count}
      >
        {HABITS.map((h, i) => (
          <div key={h.id} className="hb-seg" data-on={i < count} />
        ))}
      </div>

      <ul className="mt-5 space-y-2.5">
        {HABITS.map((h) => (
          <li key={h.id}>
            <label className="hb-habit">
              <input
                type="checkbox"
                className="sr-only"
                checked={done[h.id]}
                onChange={() => toggle(h.id)}
              />
              <span className="hb-box" aria-hidden="true">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <span className="hb-habit-text flex flex-1 items-baseline justify-between gap-3">
                <strong className="font-semibold">{h.label}</strong>
                <span className="text-sm text-[color:var(--hb-faint)]">{h.detail}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <p
        className="mt-5 min-h-6 text-sm text-[color:var(--hb-muted)]"
        aria-live="polite"
      >
        {allDone
          ? "All done. Day 127 is in the books."
          : `Finish the last ${remaining === 1 ? "habit" : `${remaining} habits`} to make it day 127.`}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="hb-inset p-4">
          <p className="text-sm text-[color:var(--hb-faint)]">Completion rate</p>
          <p className="hb-display mt-1 text-3xl font-semibold">92%</p>
        </div>
        <div className="hb-inset p-4">
          <p className="text-sm text-[color:var(--hb-faint)]">Consistency score</p>
          <p className="hb-display mt-1 text-3xl font-semibold text-[color:var(--hb-lime)]">
            A+
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Page
   ------------------------------------------------------------------------- */

export default function Page() {
  return (
    <main className={`hb ${display.variable} ${body.variable}`}>
      <div className="hb-grid" aria-hidden="true" />
      <div className="hb-glow" aria-hidden="true" />

      {/* Header */}
      <header className="hb-header">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-9 text-[15px] lg:flex">
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} className="hb-navlink">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hb-navlink hidden px-3 py-2 text-[15px] font-medium sm:inline-block"
            >
              Sign in
            </Link>
            <Link href="/signup" className="hb-btn hb-btn-primary px-5 py-3 text-[15px]">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <h1 className="text-[2.9rem] font-semibold leading-[1.02] sm:text-6xl lg:text-[4.6rem]">
                Master your habits.
                <br />
                Compound your success.
              </h1>

              <p className="mt-8 max-w-lg text-lg leading-8 text-[color:var(--hb-muted)] sm:text-xl sm:leading-9">
                Track your progress, build discipline, and turn small daily actions into
                long-term results.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/signup" className="hb-btn hb-btn-primary px-7 py-4 text-base">
                  Get started free
                </Link>
                <Link href="/dashboard" className="hb-btn hb-btn-ghost px-7 py-4 text-base">
                  <Download size={18} aria-hidden="true" />
                  View Dashboard
                </Link>
              </div>

              <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[color:var(--hb-muted)]">
                {["Free forever", "No credit card", "Cross platform"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2
                      className="h-5 w-5 text-[color:var(--hb-lime)]"
                      aria-hidden="true"
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none">
              <Sparkle className="hb-sparkle -left-4 -top-6 h-6 w-6 text-[color:var(--hb-emerald)] opacity-80" />
              <Sparkle className="hb-sparkle -right-3 top-1/3 h-4 w-4 text-[color:var(--hb-lime)] opacity-70" />
              <TodayCard />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Habitly in numbers" className="border-y border-[color:var(--hb-line)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid sm:grid-cols-3">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col py-9 sm:px-8 ${i === 0 ? "sm:pl-0" : "sm:border-l sm:border-[color:var(--hb-line)]"} ${
                  i > 0 ? "border-t border-[color:var(--hb-line)] sm:border-t-0" : ""
                }`}
              >
                <dt className="order-2 mt-1 text-[color:var(--hb-muted)]">{s.label}</dt>
                <dd className="hb-display text-4xl font-semibold sm:text-5xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-semibold leading-[1.08] sm:text-5xl">
              Everything you need to stay consistent
            </h2>
            <p className="mt-5 text-lg leading-8 text-[color:var(--hb-muted)]">
              Streaks keep you honest, reminders keep you on time, and the charts show you
              what is working.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            {/* Streaks */}
            <article className="hb-tile p-8 sm:p-10 lg:col-span-7">
              <h3 className="flex items-center gap-2.5 text-2xl font-semibold">
                <Flame className="h-6 w-6 text-[color:var(--hb-lime)]" aria-hidden="true" />
                Daily streaks
              </h3>
              <p className="mt-3 max-w-md leading-7 text-[color:var(--hb-muted)]">
                Every check-in adds a day to your chain. Watching it grow makes you think
                twice before breaking it.
              </p>

              <ol className="mt-10 grid grid-cols-7 gap-2 sm:gap-3" aria-label="This week">
                {WEEK.map((d, i) => {
                  const isToday = i === 6;
                  return (
                    <li key={i} className="flex flex-col items-center gap-3">
                      <span
                        className="grid aspect-square w-full max-w-[60px] place-items-center rounded-full border"
                        style={
                          isToday
                            ? {
                                borderColor: "rgba(168,254,67,0.55)",
                                background: "rgba(168,254,67,0.08)",
                              }
                            : {
                                borderColor: "transparent",
                                background: "var(--hb-flame)",
                                color: "#07140c",
                              }
                        }
                      >
                        {isToday ? (
                          <Image
                            src="/brand_logo.png"
                            alt="Today"
                            width={80}
                            height={80}
                            className="hb-flame h-[65%] w-[65%] object-contain"
                            data-lit="true"
                          />
                        ) : (
                          <Check className="h-5 w-5" strokeWidth={3} aria-label="Done" />
                        )}
                      </span>
                      <span className="text-sm text-[color:var(--hb-faint)]">{d}</span>
                    </li>
                  );
                })}
              </ol>
            </article>

            {/* Reminders */}
            <article className="hb-tile p-8 sm:p-10 lg:col-span-5">
              <h3 className="flex items-center gap-2.5 text-2xl font-semibold">
                <Bell className="h-6 w-6 text-[color:var(--hb-lime)]" aria-hidden="true" />
                Smart reminders
              </h3>
              <p className="mt-3 leading-7 text-[color:var(--hb-muted)]">
                Notifications that nudge you at the right moment, then get out of the way.
              </p>

              <div className="mt-8 space-y-3">
                <div className="hb-note">
                  <Image
                    src="/brand_logo.png"
                    alt="Compound"
                    width={80}
                    height={80}
                    className="mt-0.5 h-8 w-8 object-contain flex-none rounded-lg"
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold">Compound</span>
                      <span className="text-[color:var(--hb-faint)]">7:30 pm</span>
                    </div>
                    <p className="mt-0.5 text-[15px] leading-6 text-[color:var(--hb-muted)]">
                      One habit left today. Finish reading to keep day 127.
                    </p>
                  </div>
                </div>

                <div className="hb-note ml-4 sm:ml-8">
                  <Image
                    src="/brand_logo.png"
                    alt="Compound"
                    width={80}
                    height={80}
                    className="mt-0.5 h-8 w-8 object-contain flex-none rounded-lg"
                  />
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold">Compound</span>
                      <span className="text-[color:var(--hb-faint)]">10:15 pm</span>
                    </div>
                    <p className="mt-0.5 text-[15px] leading-6 text-[color:var(--hb-muted)]">
                      Lights out in 45 minutes. Wind down now?
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Heatmap */}
            <article className="hb-tile p-8 sm:p-10 lg:col-span-5">
              <h3 className="text-2xl font-semibold">Heatmap tracking</h3>
              <p className="mt-3 leading-7 text-[color:var(--hb-muted)]">
                See your consistency across the year and spot the weak days at a glance.
              </p>

              <div
                className="hb-heatgrid mt-8"
                role="img"
                aria-label="Heatmap of 12 weeks of habit completion"
              >
                {YEAR_HEAT.map((l, i) => (
                  <span key={i} className="hb-cell" data-l={l} />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 text-sm text-[color:var(--hb-faint)]">
                Less
                {[0, 1, 2, 3, 4].map((l) => (
                  <span key={l} className="hb-cell w-3.5" data-l={l} />
                ))}
                More
              </div>
            </article>

            {/* Analytics */}
            <article id="analytics" className="hb-tile p-8 sm:p-10 lg:col-span-7">
              <h3 className="flex items-center gap-2.5 text-2xl font-semibold">
                <BarChart3 className="h-6 w-6 text-[color:var(--hb-lime)]" aria-hidden="true" />
                Progress analytics
              </h3>
              <p className="mt-3 max-w-md leading-7 text-[color:var(--hb-muted)]">
                Track completion rates, trends, and consistency scores over time, and see
                where you are getting better.
              </p>

              <figure
                className="relative mt-10"
                role="img"
                aria-label="Weekly completion rate rising from 30 percent to 100 percent over six weeks"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 flex h-48 flex-col justify-between" aria-hidden="true">
                  <div className="hb-gridline" />
                  <div className="hb-gridline" />
                  <div className="hb-gridline" />
                  <div className="hb-gridline" />
                </div>

                <div className="relative flex h-48 items-end gap-3 sm:gap-5">
                  {WEEKLY_COMPLETION.map((v, i) => (
                    <div
                      key={i}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-sm font-medium text-[color:var(--hb-muted)]">{v}%</span>
                      <div
                        className="hb-bar"
                        style={{ height: `${v * 0.82}%` }}
                        data-peak={i === WEEKLY_COMPLETION.length - 1}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex gap-3 sm:gap-5" aria-hidden="true">
                  {WEEKLY_COMPLETION.map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 text-center text-sm text-[color:var(--hb-faint)]"
                    >
                      Wk {i + 1}
                    </span>
                  ))}
                </div>
              </figure>
            </article>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="pb-24 lg:pb-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
          <div>
            <h2 className="text-4xl font-semibold leading-[1.08] sm:text-5xl">
              Three steps, then it runs itself
            </h2>
            <p className="mt-5 max-w-sm text-lg leading-8 text-[color:var(--hb-muted)]">
              Setup takes a couple of minutes. After that, your only job is the daily
              check-in.
            </p>
          </div>

          <ol>
            {STEPS.map((s, i) => (
              <li key={s.title} className="hb-step">
                <span className="hb-step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-2xl font-semibold">{s.title}</h3>
                  <p className="mt-2 max-w-lg leading-7 text-[color:var(--hb-muted)]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="hb-cta px-8 py-14 sm:px-14 sm:py-20">
            <Sparkle className="hb-sparkle right-[38%] top-10 hidden h-5 w-5 text-[color:var(--hb-lime)] opacity-70 md:block" />

            <Image
              src="/brand_logo.png"
              alt=""
              width={400}
              height={400}
              className="hb-flame pointer-events-none absolute -bottom-10 -right-6 hidden h-[320px] w-auto object-contain opacity-95 md:block lg:right-10"
              data-lit="true"
              aria-hidden="true"
            />

            <div className="relative max-w-xl">
              <h2 className="text-4xl font-semibold leading-[1.06] sm:text-5xl">
                Start your streak today
              </h2>
              <p className="mt-5 text-lg leading-8 text-[color:var(--hb-muted)]">
                Join thousands of people who check in every day. Day one takes about thirty
                seconds.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/signup" className="hb-btn hb-btn-primary px-7 py-4 text-base">
                  Create free account
                </Link>
                <Link href="/dashboard" className="hb-btn hb-btn-ghost px-7 py-4 text-base">
                  <Download size={18} aria-hidden="true" />
                  Try live demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[color:var(--hb-line)] py-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <Logo size="lg" />

            <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
              {["Privacy", "Terms", "Support", "Contact"].map((l) => (
                <Link key={l} href="#" className="hb-footlink">
                  {l}
                </Link>
              ))}
            </nav>
          </div>

          <p className="text-sm text-[color:var(--hb-faint)]">
            © {new Date().getFullYear()} Compound. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}