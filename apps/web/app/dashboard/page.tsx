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
import { useSession } from 'next-auth/react';
import { useHabits } from '@repo/query/habits/useHabits';
import { useCreateHabit } from '@repo/query/habits/useMutations';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const SUGGESTED_HABITS = [
  { title: 'Morning Workout', description: 'Exercise for at least 30 minutes', icon: Target },
  { title: 'Drink 3L Water', description: 'Stay hydrated throughout the day', icon: Droplet },
  { title: 'Read 20 Pages', description: 'Read a book before bed', icon: BookOpen },
  { title: 'Meditation', description: '10 minutes of mindfulness', icon: Sparkles },
];

const GOAL_DAY = 21;
const GOAL_TOTAL = 30;
const RING_RADIUS = 58;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: realHabits = [], isLoading } = useHabits((session?.user as any)?.id);
  const { mutate: createHabit, isPending: isCreating } = useCreateHabit();

  const activeHabits = realHabits.filter((h) => !h.archived);
  
  // Calculate today's string in local time
  const todayStr = new Date().toISOString().split('T')[0];

  const computedHabits = activeHabits.map(h => {
    const completedToday = h.logs?.some(l => (l.completedAt as string).startsWith(todayStr)) || false;
    const streak = h.logs?.length || 0;
    
    return {
      ...h,
      completed: completedToday,
      streak,
      progress: completedToday ? 100 : 0,
      icon: Target,
    };
  });

  const activeCount = computedHabits.length;
  const completedCount = computedHabits.filter((h) => h.completed).length;
  const pendingCount = activeCount - completedCount;
  
  const totalPossible = activeCount * 7; 
  const totalLogged = computedHabits.reduce((acc, h) => acc + h.streak, 0); 
  const successRate = activeCount > 0 ? Math.min(100, Math.round((totalLogged / Math.max(totalPossible, 1)) * 100)) + '%' : '0%';

  const todayCompletion = activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0;
  
  // For now, keep visual dummy history if logs aren't spanning a full week yet
  const weeklyBase = [70, 85, 90, 65, 100, 80];
  const weekly = [...weeklyBase, todayCompletion];

  const goalProgress = Math.round((GOAL_DAY / GOAL_TOTAL) * 100);
  const ringOffset = RING_CIRCUMFERENCE * (1 - goalProgress / 100);

  const todayLabel = new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();

  const maxStreak = computedHabits.length > 0 ? Math.max(...computedHabits.map(h => h.streak)) : 0;

  const stats = [
    { title: 'Active Habits', value: activeCount, icon: Target, accent: 'var(--c-pale)' },
    { title: 'Completed Today', value: `${completedCount} / ${activeCount}`, icon: CheckCircle2, accent: 'var(--c-light)' },
    { title: 'Max Streak', value: `${maxStreak} Days`, icon: Flame, accent: 'var(--c-primary)' },
    { title: 'Success Rate', value: successRate, icon: TrendingUp, accent: '#16A34A' },
  ];

  const allLogs = realHabits.flatMap(h => h.logs?.map(l => ({ ...l, habitTitle: h.title })) || []);
  allLogs.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  
  const activity = allLogs.slice(0, 4).map(log => {
    return {
      text: `Completed ${log.habitTitle}`,
      time: new Date(log.completedAt).toLocaleDateString(),
      color: 'var(--c-primary)'
    };
  });

  const handleAddSuggested = (suggested: typeof SUGGESTED_HABITS[0]) => {
    const userId = (session?.user as any)?.id;
    console.log("Adding suggested habit", suggested.title, "for user", userId);

    createHabit({
      title: suggested.title,
      description: suggested.description,
      color: '#22c55e',
      userId
    });
  };

  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';

  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : '';
  const greetingText = firstName ? `${greeting}, ${firstName}` : 'Welcome back';

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
      <div className="mx-auto max-w-7xl space-y-8 px-6 pt-16 pb-10 lg:py-10">
        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-muted)]" style={fontMono}>
              {todayLabel}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-[var(--c-text)] sm:text-5xl" style={fontDisplay}>
              {greetingText}
            </h1>
            <p className="mt-2 text-[var(--c-muted)]">
              {pendingCount > 0
                ? `${pendingCount} habit${pendingCount === 1 ? '' : 's'} left to keep the chain unbroken.`
                : activeCount === 0 
                  ? 'Ready to build some new habits?'
                  : 'Every link forged today. Well done.'}
            </p>
          </div>
        </header>

        {activeCount > 0 || isLoading ? (
          <section className="rounded-[28px] border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-muted)]" style={fontMono}>
                Max Streak
              </p>
              {maxStreak > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-soft)] px-4 py-1.5 text-xs font-medium text-[var(--c-text)]">
                  <Flame size={14} className="text-[var(--c-primary)]" />
                  On Fire
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-6xl font-semibold leading-none text-[var(--c-text)]" style={fontDisplay}>
                {maxStreak}
                <span className="ml-2 text-2xl font-normal text-[var(--c-primary)]">days</span>
              </p>

              <div className="flex flex-1 items-center justify-end gap-2 overflow-x-auto pb-1">
                {computedHabits.map((habit) => (
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
        ) : null}

        {(() => {
          const availableSuggestions = SUGGESTED_HABITS.filter(
            (sh) => !computedHabits.some((ch) => ch.title === sh.title)
          );

          if (availableSuggestions.length === 0 || isLoading) return null;

          return (
            <section className="rounded-[28px] border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-8">
              <h2 className="mb-6 text-xl text-[var(--c-text)]" style={fontDisplay}>
                Suggested Habits
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {availableSuggestions.map((suggested) => (
                  <div
                    key={suggested.title}
                    className="flex flex-col justify-between rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-soft)] p-5"
                  >
                    <div>
                      <suggested.icon className="mb-3 text-[var(--c-primary)]" size={24} />
                      <h3 className="font-semibold text-[var(--c-text)]">{suggested.title}</h3>
                      <p className="mt-1 text-sm text-[var(--c-muted)]">{suggested.description}</p>
                    </div>
                    <button
                      onClick={() => handleAddSuggested(suggested)}
                      disabled={isCreating}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--c-primary)]/10 py-2 text-sm font-medium text-[var(--c-primary)] transition-colors hover:bg-[var(--c-primary)]/20"
                    >
                      <Plus size={16} /> Add Habit
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

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
                {computedHabits.length === 0 ? (
                  <p className="text-sm text-[var(--c-muted)]">No habits tracking right now.</p>
                ) : computedHabits.map((habit) => {
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
                {activity.length === 0 ? (
                  <p className="text-sm text-[var(--c-muted)]">No recent activity.</p>
                ) : activity.map((item, i) => (
                  <div key={i} className="relative flex gap-4 pl-1">
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