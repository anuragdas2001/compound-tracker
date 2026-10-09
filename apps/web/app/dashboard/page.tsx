'use client';

import {
  Activity,
  Award,
  Ban,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Droplet,
  Flame,
  PenLine,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

// Green system, anchored on the brand primary #22c55e.
const COLOR = {
  bg: 'var(--c-bg)',
  surface: 'var(--c-surface)',
  surfaceSoft: 'var(--c-surface-soft)',
  border: 'var(--c-border)',
  borderHover: 'var(--c-border-hover)',
  primary: 'var(--c-primary)',
  light: 'var(--c-light)',
  pale: 'var(--c-pale)',
  deep: 'var(--c-deep)',
  deeper: 'var(--c-deeper)',
  text: 'var(--c-text)',
  muted: 'var(--c-muted)',
};

const habits = [
  { id: 1, title: 'Morning Workout', icon: Target, streak: 24, progress: 100, completed: true },
  { id: 2, title: 'Drink 3L Water', icon: Droplet, streak: 31, progress: 100, completed: true },
  { id: 3, title: 'Plan Tomorrow', icon: CalendarDays, streak: 21, progress: 100, completed: true },
  { id: 4, title: 'Read 20 Pages', icon: BookOpen, streak: 12, progress: 70, completed: false },
  { id: 5, title: 'Journal Before Bed', icon: PenLine, streak: 9, progress: 100, completed: true },
  { id: 6, title: 'No Added Sugar', icon: Ban, streak: 5, progress: 100, completed: true },
  { id: 7, title: 'Stretch 10 Minutes', icon: Activity, streak: 14, progress: 20, completed: false },
  { id: 8, title: 'Meditation', icon: Sparkles, streak: 17, progress: 40, completed: false },
];

const activity = [
  { text: 'Completed Morning Workout', time: 'Just now', color: 'var(--c-primary)' },
  { text: 'Reached water goal', time: '2h ago', color: 'var(--c-light)' },
  { text: 'Logged 15 pages read', time: '5h ago', color: 'var(--c-pale)' },
  { text: 'Started meditation session', time: 'Yesterday', color: 'var(--c-muted)' },
];

// Sun–Fri are fixed history; today (Sat) reflects the live completion rate below.
const weeklyBase = [70, 85, 90, 65, 100, 80];

const GOAL_DAY = 21;
const GOAL_TOTAL = 30;
const RING_RADIUS = 58;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function DashboardPage() {
  const activeCount = habits.length;
  const completedCount = habits.filter((h) => h.completed).length;
  const pendingCount = activeCount - completedCount;
  const successRate = '86%';

  const todayCompletion = Math.round((completedCount / activeCount) * 100);
  const weekly = [...weeklyBase, todayCompletion];

  const goalProgress = Math.round((GOAL_DAY / GOAL_TOTAL) * 100);
  const ringOffset = RING_CIRCUMFERENCE * (1 - goalProgress / 100);

  const todayLabel = new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();

  const stats = [
    { title: 'Active Habits', value: activeCount, icon: Target, accent: 'var(--c-pale)' },
    { title: 'Completed Today', value: `${completedCount} / ${activeCount}`, icon: CheckCircle2, accent: 'var(--c-light)' },
    { title: 'Current Streak', value: `${GOAL_DAY} Days`, icon: Flame, accent: 'var(--c-primary)' },
    { title: 'Success Rate', value: successRate, icon: TrendingUp, accent: '#16A34A' },
  ];

  return (
    <main
      className="min-h-screen text-[var(--c-text)]"
      style={{
        backgroundColor: 'var(--c-bg)',
        backgroundImage:
          'linear-gradient(var(--c-grid) 1px, transparent 1px), linear-gradient(90deg, var(--c-grid) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* Drop-in font import. For production, move these into a <link> in your root layout
          (or load via next/font) so they're fetched alongside the document, not after hydration. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500&display=swap"
      />

      <div className="mx-auto max-w-7xl space-y-8 px-6 pt-16 pb-10 lg:py-10">
        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-muted)]" style={fontMono}>
              {todayLabel}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-[var(--c-text)] sm:text-5xl" style={fontDisplay}>
              Welcome back
            </h1>
            <p className="mt-2 text-[var(--c-muted)]">
              {pendingCount > 0
                ? `${pendingCount} habit${pendingCount === 1 ? '' : 's'} left to keep the chain unbroken.`
                : 'Every link forged today. Well done.'}
            </p>
          </div>

         
        </header>

        {/* Signature: The Chain — today's habits as an unbroken sequence */}
        <section className="rounded-[28px] border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-muted)]" style={fontMono}>
              Current Streak
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-soft)] px-4 py-1.5 text-xs font-medium text-[var(--c-text)]">
              <Flame size={14} className="text-[var(--c-primary)]" />
              On Fire
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-6xl font-semibold leading-none text-[var(--c-text)]" style={fontDisplay}>
              {GOAL_DAY}
              <span className="ml-2 text-2xl font-normal text-[var(--c-primary)]">days</span>
            </p>

            <div className="flex flex-1 items-center justify-end gap-2 overflow-x-auto pb-1">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  title={habit.title}
                  className={`h-10 w-10 flex-none rounded-lg border transition-colors ${
                    habit.completed
                      ? 'border-[var(--c-primary)] bg-[var(--c-primary)]'
                      : 'border-[var(--c-border)] bg-[var(--c-surface-soft)]'
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm text-[var(--c-muted)]">
            <span className="text-[var(--c-text)]" style={fontMono}>
              {completedCount}/{activeCount}
            </span>{' '}
            links forged today.
          </p>
        </section>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)]">
                <div className="h-1 w-full" style={{ background: stat.accent }} />
                <div className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--c-muted)]">{stat.title}</p>
                    <p className="mt-2 text-3xl text-[var(--c-text)]" style={fontMono}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon size={18} className="mt-1 text-[var(--c-muted)]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Habits */}
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl text-[var(--c-text)]" style={fontDisplay}>
                  Today&rsquo;s Habits
                </h2>
                <span className="text-xs text-[var(--c-muted)]" style={fontMono}>
                  {completedCount}/{activeCount}
                </span>
              </div>

              <div className="space-y-3">
                {habits.map((habit) => {
                  const Icon = habit.icon;
                  return (
                    <div
                      key={habit.id}
                      className="rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-soft)] p-4 transition-colors hover:border-[var(--c-border-hover)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[var(--c-surface)] text-[var(--c-primary)]">
                            <Icon size={16} />
                          </div>
                          <div>
                            <h3 className="font-medium text-[var(--c-text)]">{habit.title}</h3>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--c-muted)]">
                              <Flame size={12} className="text-[var(--c-primary)]" />
                              {habit.streak} day streak
                            </p>
                          </div>
                        </div>

                        <span
                          className={`flex-none whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                            habit.completed ? 'bg-[var(--c-deep)]/60 text-[var(--c-light)]' : 'bg-white/5 text-[var(--c-muted)]'
                          }`}
                        >
                          {habit.completed ? 'Done' : 'Pending'}
                        </span>
                      </div>

                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--c-border)]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${habit.progress}%`,
                            background: habit.completed
                              ? 'linear-gradient(90deg, #16A34A, #4ADE80)'
                              : 'var(--c-primary)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
              <h2 className="mb-6 flex items-center gap-2 text-xl text-[var(--c-text)]" style={fontDisplay}>
                <Activity size={18} className="text-[var(--c-primary)]" />
                Recent Activity
              </h2>

              <div className="space-y-5">
                {activity.map((item, i) => (
                  <div key={item.text} className="relative flex gap-4 pl-1">
                    {i !== activity.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-[calc(100%+0.75rem)] w-px bg-[var(--c-border)]" />
                    )}
                    <span
                      className="relative z-10 mt-1.5 h-3 w-3 flex-none rounded-full"
                      style={{ background: item.color }}
                    />
                    <div className="flex flex-1 flex-wrap items-center justify-between gap-x-3">
                      <p className="text-sm text-[#D8E3DC]">{item.text}</p>
                      <p className="text-xs text-[var(--c-muted)]" style={fontMono}>
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Weekly Progress */}
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
              <h2 className="mb-6 flex items-center gap-2 text-lg text-[var(--c-text)]" style={fontDisplay}>
                <CalendarDays size={18} className="text-[var(--c-primary)]" />
                Weekly Progress
              </h2>

              <div className="flex h-36 items-end gap-2">
                {weekly.map((value, index) => {
                  const isToday = index === weekly.length - 1;
                  return (
                    <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div
                        className="w-full rounded-full transition-all"
                        style={{
                          height: `${value}%`,
                          background: isToday
                            ? 'linear-gradient(180deg, #22C55E, #86EFAC)'
                            : 'var(--c-border)',
                        }}
                      />
                      <span
                        className={`text-[10px] ${isToday ? 'text-[var(--c-primary)]' : 'text-[var(--c-muted)]'}`}
                        style={fontMono}
                      >
                        {DAYS[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Goal */}
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
              <h2 className="mb-5 flex items-center gap-2 text-lg text-[var(--c-text)]" style={fontDisplay}>
                <Award size={18} className="text-[var(--c-primary)]" />
                Current Goal
              </h2>

              <div className="flex flex-col items-center gap-5 rounded-xl bg-[var(--c-surface-soft)] p-5 sm:flex-row">
                <div className="relative h-32 w-32 flex-none">
                  <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                    <circle cx="70" cy="70" r={RING_RADIUS} fill="none" stroke='var(--c-border)' strokeWidth="10" />
                    <circle
                      cx="70"
                      cy="70"
                      r={RING_RADIUS}
                      fill="none"
                      stroke='var(--c-primary)'
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl text-[var(--c-text)]" style={fontMono}>
                      {GOAL_DAY}/{GOAL_TOTAL}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-[var(--c-muted)]">days</span>
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="font-medium text-[var(--c-text)]">30 Day Consistency Challenge</h3>
                  <p className="mt-1 text-sm text-[var(--c-muted)]">You&rsquo;re on day {GOAL_DAY}. Keep going.</p>
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div
              className="overflow-hidden rounded-2xl border border-[var(--c-border)] p-6"
              style={{ background: 'linear-gradient(135deg, #16A34A 0%, #052E16 100%)' }}
            >
              <Sparkles className="mb-4 text-[var(--c-pale)]" />
              <p className="text-xl italic leading-snug text-[var(--c-text)]" style={fontDisplay}>
                &ldquo;Small habits, repeated daily, become extraordinary results.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}