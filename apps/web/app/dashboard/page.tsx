'use client';

import {
  Activity,
  Award,
  Ban,
  BookOpen,
  CalendarDays,
  Check,
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
import { useMemo } from 'react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const SUGGESTED_HABITS = [
  { title: 'Morning Workout', description: 'Exercise for at least 30 minutes', icon: Target },
  { title: 'Drink 3L Water', description: 'Stay hydrated throughout the day', icon: Droplet },
  { title: 'Read 20 Pages', description: 'Read a book before bed', icon: BookOpen },
  { title: 'Meditation', description: '10 minutes of mindfulness', icon: Sparkles },
];

const RING_RADIUS = 58;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: realHabits = [], isLoading } = useHabits((session?.user as any)?.id);
  const { mutate: createHabit, isPending: isCreating } = useCreateHabit();

  const activeHabits = realHabits.filter((h) => !h.archived);
  
  // Calculate today's string in local time
  const todayStr = new Date().toISOString().split('T')[0] || '';

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

  const maxStreak = computedHabits.length > 0 ? Math.max(...computedHabits.map(h => h.streak)) : 0;

  // Real 7-day completion rates
  const weekly = useMemo(() => {
    const daysArr: number[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0] || '';
      
      let completedOnDay = 0;
      for (const h of activeHabits) {
        const hasLog = h.logs?.some((l: any) => (l.completedAt as string).startsWith(dayKey));
        if (hasLog) completedOnDay++;
      }
      
      const rate = activeCount > 0 ? Math.min(100, Math.round((completedOnDay / activeCount) * 100)) : 0;
      daysArr.push(rate);
    }
    return daysArr;
  }, [activeHabits, activeCount]);

  const weekDayLabels = useMemo(() => {
    const labels: string[] = [];
    const dayChars = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      labels.push(dayChars[d.getDay()] || 'D');
    }
    return labels;
  }, []);

  // Real 30-Day Goal Ring based on user's longest streak
  const GOAL_DAY = Math.min(30, maxStreak);
  const GOAL_TOTAL = 30;
  const goalProgress = Math.round((GOAL_DAY / GOAL_TOTAL) * 100);
  const ringOffset = RING_CIRCUMFERENCE * (1 - goalProgress / 100);

  const todayLabel = new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();

  const stats = [
    { title: 'Active Habits', value: activeCount, icon: Target, accent: 'var(--c-pale)' },
    { title: 'Completed Today', value: `${completedCount} / ${activeCount}`, icon: CheckCircle2, accent: 'var(--c-light)' },
    { title: 'Max Streak', value: `${maxStreak} Days`, icon: Flame, accent: 'var(--c-primary)' },
    { title: 'Success Rate', value: successRate, icon: TrendingUp, accent: 'var(--c-teal)' },
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
      color: '#a8fe43',
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
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
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
           {/* Goal */}
            <div className="w-full shrink-0 sm:w-auto sm:-mt-2">
              <h2 className="mb-4 flex items-center gap-2 text-lg text-[var(--c-text)]" style={fontDisplay}>
                <Award size={20} className="text-[#a8fe43]" />
                Current Goal
              </h2>

              <div className="flex flex-row items-center gap-6 rounded-2xl bg-white dark:bg-[var(--c-surface-soft)] p-4 pr-8 border border-[var(--c-border)] shadow-sm">
                <div className="relative h-20 w-20 flex-none">
                  <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90 filter drop-shadow-sm">
                    <defs>
                      <linearGradient id="goalFlame" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a8fe43" />
                        <stop offset="60%" stopColor="#3ae484" />
                        <stop offset="100%" stopColor="#10a271" />
                      </linearGradient>
                    </defs>
                    <circle cx="70" cy="70" r={RING_RADIUS} fill="none" stroke='var(--c-border)' strokeWidth="10" />
                    <circle
                      cx="70"
                      cy="70"
                      r={RING_RADIUS}
                      fill="none"
                      stroke='url(#goalFlame)'
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
                    <span className="text-xl font-bold text-[var(--c-text)] leading-none" style={fontMono}>
                      {GOAL_DAY}
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--c-muted)] mt-1">days</span>
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-base font-semibold text-[var(--c-text)]">30 Day Challenge</h3>
                  <p className="mt-1 text-sm text-[var(--c-muted)]">Day {GOAL_DAY} &mdash; Keep going!</p>
                </div>
              </div>
            </div>
        </header>
                
        {activeCount > 0 || isLoading ? (
          <section className="relative overflow-hidden rounded-[28px] border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-8 shadow-sm transition-colors">
            {/* Subtle top ambient glow from Habitly */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-36 opacity-20 dark:opacity-20"
              style={{
                background:
                  'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(168, 254, 67, 0.35), transparent 70%)',
              }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[var(--c-muted)]" style={fontMono}>
                Max Streak
              </p>
              {maxStreak > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#a8fe43] bg-[#a8fe43] px-4 py-1.5 text-xs font-bold text-[#07140c] shadow-xs dark:border-[#a8fe43]/30 dark:bg-[#a8fe43]/15 dark:text-[#a8fe43]">
                  <Flame size={14} className="text-[#07140c] fill-[#07140c]/20 dark:text-[#a8fe43] dark:fill-[#a8fe43]/40" />
                  On Fire
                </span>
              )}
            </div>

            <div className="relative z-10 mt-4 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-6xl font-semibold leading-none" style={fontDisplay}>
                <span className="bg-gradient-to-r from-[#8ce41a] via-[#2ec975] to-[#10a271] dark:from-[#b4ff3a] dark:via-[#3ae484] dark:to-[#14b87e] bg-clip-text text-transparent">
                  {maxStreak}
                </span>
                <span className="ml-2 text-2xl font-normal text-[#07140c] dark:text-[#a8fe43]">days</span>
              </p>

              <div className="flex flex-1 items-center justify-end gap-2 overflow-x-auto pb-1">
                {computedHabits.map((habit) => (
                  <div
                    key={habit.id}
                    title={habit.title}
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl border transition-all duration-200 ${
                      habit.completed
                        ? 'border-[#a8fe43] bg-[#a8fe43] text-[#07140c] shadow-[0_0_14px_rgba(168,254,67,0.4)]'
                        : 'border-slate-200 dark:border-[var(--c-border)] bg-slate-100/90 dark:bg-[var(--c-surface-soft)] text-transparent hover:border-[#a8fe43]'
                    }`}
                  >
                    <Check size={18} strokeWidth={2.8} className={habit.completed ? 'opacity-100' : 'opacity-0'} />
                  </div>
                ))}
              </div>
            </div>

            <p className="relative z-10 mt-6 text-sm text-[var(--c-muted)]">
              <span className="font-semibold text-[var(--c-text)]" style={fontMono}>
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
            <section className="rounded-[28px] border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-8 shadow-sm transition-colors">
              <h2 className="mb-6 text-xl text-[var(--c-text)]" style={fontDisplay}>
                Suggested Habits
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {availableSuggestions.map((suggested) => (
                  <div
                    key={suggested.title}
                    className="flex flex-col justify-between rounded-2xl border border-[var(--c-border)] bg-slate-50/70 dark:bg-[var(--c-surface-soft)] p-5 transition-all hover:border-[#a8fe43] hover:shadow-sm"
                  >
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a8fe43] text-[#07140c] dark:bg-[#a8fe43]/15 dark:text-[#a8fe43] mb-3 shadow-xs">
                        <suggested.icon size={20} />
                      </div>
                      <h3 className="font-semibold text-[var(--c-text)]">{suggested.title}</h3>
                      <p className="mt-1 text-sm text-[var(--c-muted)]">{suggested.description}</p>
                    </div>
                    <button
                      onClick={() => handleAddSuggested(suggested)}
                      disabled={isCreating}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#a8fe43] hover:bg-[#9bf336] active:scale-[0.98] text-[#07140c] border border-[#a8fe43] py-2.5 text-sm font-bold transition-all duration-200 shadow-xs"
                    >
                      <Plus size={16} strokeWidth={2.5} /> Add Habit
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
              <div
                key={stat.title}
                className="overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] shadow-xs transition-all hover:shadow-sm hover:border-[#a8fe43]"
              >
                <div className="h-1.5 w-full" style={{ background: stat.accent }} />
                <div className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-[var(--c-muted)]">{stat.title}</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--c-text)]" style={fontMono}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a8fe43] text-[#07140c] dark:bg-[#a8fe43]/15 dark:text-[#a8fe43] shadow-xs">
                    <Icon size={16} />
                  </div>
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
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-sm transition-colors">
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
                      className="rounded-xl border border-[var(--c-border)] bg-slate-50/70 dark:bg-[var(--c-surface-soft)] p-4 transition-all hover:border-[#a8fe43] hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#a8fe43]/60 dark:border-[var(--c-border)] bg-[#a8fe43] text-[#07140c] dark:bg-[var(--c-surface)] dark:text-[#a8fe43] shadow-xs">
                            <Icon size={17} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--c-text)]">{habit.title}</h3>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--c-muted)]">
                              <Flame size={13} className="text-[#a8fe43] fill-[#a8fe43] dark:text-[#a8fe43]" />
                              {habit.streak} day streak
                            </p>
                          </div>
                        </div>

                        <span
                          className={`flex-none whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
                            habit.completed
                              ? 'border-[#a8fe43] bg-[#a8fe43] text-[#07140c] shadow-xs dark:border-[#a8fe43]/40 dark:bg-[#a8fe43]/15 dark:text-[#a8fe43]'
                              : 'border-slate-200 bg-white text-slate-500 dark:border-[var(--c-border)] dark:bg-[var(--c-surface)] dark:text-[var(--c-muted)]'
                          }`}
                        >
                          {habit.completed ? 'Done' : 'Pending'}
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-[var(--c-border)]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${habit.progress}%`,
                            background: habit.completed
                              ? 'var(--c-flame)'
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
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-sm transition-colors">
              <h2 className="mb-6 flex items-center gap-2 text-xl text-[var(--c-text)]" style={fontDisplay}>
                <Activity size={18} className="text-[#a8fe43]" />
                Recent Activity
              </h2>

              <div className="space-y-5">
                {activity.length === 0 ? (
                  <p className="text-sm text-[var(--c-muted)]">No recent activity.</p>
                ) : activity.map((item, i) => (
                  <div key={i} className="relative flex gap-4 pl-1">
                    {i !== activity.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-[calc(100%+0.75rem)] w-px bg-slate-200 dark:bg-[var(--c-border)]" />
                    )}
                    <span
                      className="relative z-10 mt-1.5 h-3 w-3 flex-none rounded-full shadow-[0_0_8px_rgba(168,254,67,0.7)]"
                      style={{ background: '#a8fe43' }}
                    />
                    <div className="flex flex-1 flex-wrap items-center justify-between gap-x-3">
                      <p className="text-sm font-medium text-slate-800 dark:text-[var(--c-text)]">{item.text}</p>
                      <p className="text-xs text-slate-400 dark:text-[var(--c-muted)]" style={fontMono}>
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
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-sm transition-colors">
              <h2 className="mb-6 flex items-center gap-2 text-lg text-[var(--c-text)]" style={fontDisplay}>
                <CalendarDays size={18} className="text-[#a8fe43]" />
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
                            ? 'var(--c-flame)'
                            : 'var(--c-surface-soft)',
                          border: isToday
                            ? '1.5px solid #a8fe43'
                            : '1px solid var(--c-border)',
                          boxShadow: isToday
                            ? '0 0 16px -2px rgba(168, 254, 67, 0.6)'
                            : 'none',
                        }}
                      />
                      <span
                        className={`text-[10px] font-bold ${isToday ? 'text-[#07140c] bg-[#a8fe43] dark:text-[#a8fe43] dark:bg-transparent px-1.5 py-0.5 rounded-full' : 'text-slate-400 dark:text-[var(--c-muted)]'}`}
                        style={fontMono}
                      >
                        {weekDayLabels[index]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Motivation Card */}
            <div
              className="relative overflow-hidden rounded-2xl border border-[#a8fe43]/40 dark:border-[var(--c-border-strong)] p-6 shadow-sm transition-colors"
              style={{
                background:
                  'radial-gradient(ellipse 70% 90% at 100% 100%, rgba(168, 254, 67, 0.22), transparent 70%), radial-gradient(ellipse 50% 60% at 85% 20%, rgba(58, 228, 132, 0.12), transparent 70%), var(--c-surface)',
              }}
            >
              <div className="relative z-10">
                <Sparkles className="mb-4 text-[#a8fe43]" />
                <p className="text-xl italic leading-snug text-slate-800 dark:text-[var(--c-text)]" style={fontDisplay}>
                  &ldquo;Small habits, repeated daily, become extraordinary results.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}