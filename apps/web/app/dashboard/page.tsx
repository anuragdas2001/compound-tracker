'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Droplet,
  Flame,
  Medal,
  Minus,
  Plus,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useHabits } from '@repo/query/habits/useHabits';
import { useCreateHabit, useToggleHabit, useUpdateProgress } from '@repo/query/habits/useMutations';
import { useGamificationSummary } from '@repo/query/gamification/useGamificationSummary';
import { useShieldUsages } from '@repo/query/gamification/useGamificationMutations';
import { toast } from 'react-hot-toast';

import { getDateValue, habitStreak } from '../../components/habits/utils';

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
  const userId = (session?.user as any)?.id;

  const { data: realHabits = [], isLoading } = useHabits(userId);
  const { data: summary } = useGamificationSummary(userId);
  const { data: shieldUsages = [] } = useShieldUsages(userId);

  const { mutate: createHabit, isPending: isCreating } = useCreateHabit();
  const toggleHabitMutation = useToggleHabit();
  const updateProgressMutation = useUpdateProgress();

  const [optimisticValues, setOptimisticValues] = useState<Record<string, number>>({});

  const activeHabits = useMemo(() => realHabits.filter((h) => !h.archived), [realHabits]);
  const todayDate = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => todayDate.toISOString().split('T')[0] || '', [todayDate]);

  // Level & XP calculations
  const totalXp = summary?.totalXp || 0;
  const level = summary?.level || 1;
  const currentLevelFloorXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const xpNeeded = Math.max(1, nextLevelXp - currentLevelFloorXp);
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelFloorXp);
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));
  const sparksBalance = summary?.sparksBalance ?? 150;
  const shieldsAvailable = summary?.shields ?? 0;

  // Computed habits with interactive status & counter support
  const computedHabits = activeHabits.map((h: any) => {
    const isCount = h.goal === 'count';
    const targetVal = isCount ? h.target || 1 : 1;
    const serverVal = getDateValue(h.logs || [], todayDate);
    const currentVal: number = optimisticValues[h.id] !== undefined ? (optimisticValues[h.id] ?? 0) : serverVal;
    const completed = isCount ? currentVal >= targetVal : currentVal > 0;
    const streak = habitStreak(h.logs || [], shieldUsages, h.id, 0, h);
    const progressPercent = Math.min(100, Math.round((currentVal / Math.max(1, targetVal)) * 100));

    return {
      ...h,
      completed,
      currentVal,
      targetVal,
      isCount,
      streak,
      progress: completed ? 100 : progressPercent,
      icon: Target,
    };
  });

  const activeCount = computedHabits.length;
  const completedCount = computedHabits.filter((h) => h.completed).length;
  const pendingCount = activeCount - completedCount;

  const totalPossible = activeCount * 7;
  const totalLogged = computedHabits.reduce((acc, h) => acc + (h.logs?.length || 0), 0);
  const successRate =
    activeCount > 0 ? Math.min(100, Math.round((totalLogged / Math.max(totalPossible, 1)) * 100)) + '%' : '0%';

  const maxStreak = computedHabits.length > 0 ? Math.max(...computedHabits.map((h) => h.streak)) : 0;

  // Toggle habit directly from dashboard
  const handleToggleHabit = (e: React.MouseEvent, habit: any) => {
    e.stopPropagation();
    const nextVal = habit.completed ? 0 : habit.targetVal;
    setOptimisticValues((prev) => ({ ...prev, [habit.id]: nextVal }));

    if (habit.isCount) {
      updateProgressMutation.mutate(
        { id: habit.id, value: nextVal, completedAt: todayStr },
        {
          onSuccess: () => {
            toast.success(nextVal > 0 ? `Completed ${habit.title}! +5 Sparks` : `Marked ${habit.title} pending`);
          },
          onError: () => toast.error('Failed to update habit status.'),
        }
      );
    } else {
      toggleHabitMutation.mutate(
        { id: habit.id, completedAt: todayStr },
        {
          onSuccess: () => {
            toast.success(habit.completed ? `Marked ${habit.title} pending` : `Completed ${habit.title}! +5 Sparks`);
          },
          onError: () => toast.error('Failed to update habit status.'),
        }
      );
    }
  };

  const handleIncrement = (e: React.MouseEvent, habit: any) => {
    e.stopPropagation();
    const nextVal = habit.currentVal + 1;
    setOptimisticValues((prev) => ({ ...prev, [habit.id]: nextVal }));
    updateProgressMutation.mutate({ id: habit.id, value: nextVal, completedAt: todayStr });
  };

  const handleDecrement = (e: React.MouseEvent, habit: any) => {
    e.stopPropagation();
    if (habit.currentVal <= 0) return;
    const nextVal = Math.max(0, habit.currentVal - 1);
    setOptimisticValues((prev) => ({ ...prev, [habit.id]: nextVal }));
    updateProgressMutation.mutate({ id: habit.id, value: nextVal, completedAt: todayStr });
  };

  // 18-week GitHub-style heatmap calculation
  const { heatmapData, activeDaysCount, totalCompletionsCount } = useMemo(() => {
    const daysMap = new Map<string, number>();
    let totalLogs = 0;

    for (const h of activeHabits) {
      for (const log of h.logs || []) {
        totalLogs++;
        const key = new Date(log.completedAt).toISOString().split('T')[0];
        if (key) {
          daysMap.set(key, (daysMap.get(key) || 0) + 1);
        }
      }
    }

    const weeks = 18;
    const days = 7;
    const totalDays = weeks * days;
    const now = new Date();
    const data: Array<Array<{ level: number; dateStr: string; count: number }>> = [];
    let activeDays = 0;

    for (let w = 0; w < weeks; w++) {
      const week: Array<{ level: number; dateStr: string; count: number }> = [];
      for (let d = 0; d < days; d++) {
        const dayOffset = totalDays - 1 - (w * 7 + d);
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() - dayOffset);
        const dateKey = targetDate.toISOString().split('T')[0] || '';
        const count = daysMap.get(dateKey) || 0;

        if (count > 0) activeDays++;

        let level = 0;
        if (count >= 4) level = 4;
        else if (count === 3) level = 3;
        else if (count === 2) level = 2;
        else if (count === 1) level = 1;

        week.push({ level, dateStr: dateKey, count });
      }
      data.push(week);
    }

    return { heatmapData: data, activeDaysCount: activeDays, totalCompletionsCount: totalLogs };
  }, [activeHabits]);

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 4:
        return '#a8fe43'; // flame fire
      case 3:
        return '#3ae484'; // vibrant green
      case 2:
        return 'rgba(58, 228, 132, 0.6)'; // medium green
      case 1:
        return 'rgba(58, 228, 132, 0.25)'; // soft green
      default:
        return 'var(--c-surface-soft)'; // empty cell
    }
  };

  // Recent Badges for gamification card
  const latestMilestone = useMemo(() => {
    if (maxStreak >= 30) {
      return { title: 'Gold Standard', desc: '30-Day Streak', icon: Trophy, color: '#FFD700', rarity: 'Rare' };
    }
    if (maxStreak >= 7) {
      return { title: 'Silver Streak', desc: '7-Day Streak', icon: Medal, color: '#C0C0C0', rarity: 'Uncommon' };
    }
    if (totalLogged >= 1) {
      return { title: 'Bronze Pioneer', desc: 'First Check-in', icon: Trophy, color: '#CD7F32', rarity: 'Common' };
    }
    return { title: 'Day 1 Explorer', desc: 'Kickoff Routine', icon: Target, color: '#a8fe43', rarity: 'Kickoff' };
  }, [maxStreak, totalLogged]);

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

  const allLogs = activeHabits.flatMap((h) => h.logs?.map((l: any) => ({ ...l, habitTitle: h.title })) || []);
  allLogs.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  const activity = allLogs.slice(0, 4).map((log) => {
    return {
      text: `Completed ${log.habitTitle}`,
      time: new Date(log.completedAt).toLocaleDateString(),
      color: 'var(--c-primary)',
    };
  });

  const handleAddSuggested = (suggested: (typeof SUGGESTED_HABITS)[0]) => {
    if (!userId) return;
    createHabit({
      title: suggested.title,
      description: suggested.description,
      color: '#a8fe43',
      userId,
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
      className="min-h-screen text-[var(--c-text)] pb-24"
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

          {/* Goal Ring Card */}
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
                  <circle cx="70" cy="70" r={RING_RADIUS} fill="none" stroke="var(--c-border)" strokeWidth="10" />
                  <circle
                    cx="70"
                    cy="70"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="url(#goalFlame)"
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
                <p className="mt-1 text-sm text-[var(--c-muted)]">Day {GOAL_DAY} &mdash; Keep compounding!</p>
              </div>
            </div>
          </div>
        </header>

        {/* Max Streak Hero Banner */}
        {activeCount > 0 || isLoading ? (
          <section className="relative overflow-hidden rounded-[28px] border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-8 shadow-sm transition-colors">
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
                  <button
                    key={habit.id}
                    type="button"
                    onClick={(e) => handleToggleHabit(e, habit)}
                    title={`${habit.title}: ${habit.completed ? 'Done (Click to undo)' : 'Pending (Click to complete)'}`}
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
                      habit.completed
                        ? 'border-[#a8fe43] bg-[#a8fe43] text-[#07140c] shadow-[0_0_14px_rgba(168,254,67,0.4)]'
                        : 'border-slate-200 dark:border-[var(--c-border)] bg-slate-100/90 dark:bg-[var(--c-surface-soft)] text-transparent hover:border-[#a8fe43] hover:text-[var(--c-muted)]'
                    }`}
                  >
                    <Check size={18} strokeWidth={2.8} className={habit.completed ? 'opacity-100' : 'opacity-40'} />
                  </button>
                ))}
              </div>
            </div>

            <p className="relative z-10 mt-6 text-sm text-[var(--c-muted)]">
              <span className="font-semibold text-[var(--c-text)]" style={fontMono}>
                {completedCount}/{activeCount}
              </span>{' '}
              links forged today. Tap any node to toggle your progress.
            </p>
          </section>
        ) : null}

        {/* ============================================================== */}
        {/* GAMIFICATION COMMAND ROW: XP, SHIELDS, CHALLENGES, BADGES      */}
        {/* ============================================================== */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Level & XP Progression */}
          <Link
            href="/profile"
            className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 transition-all hover:border-[var(--c-primary)]/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--c-muted)]">Player Rank</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#a8fe43]/15 text-[#a8fe43] border border-[#a8fe43]/30" style={fontMono}>
                LVL {level}
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-[var(--c-text)]" style={fontMono}>
                {totalXp.toLocaleString()} <span className="text-xs text-[var(--c-muted)]">XP</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-400" style={fontMono}>
                <Zap size={14} /> {sparksBalance}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-[var(--c-surface-soft)] rounded-full overflow-hidden border border-[var(--c-border)]/40 mb-2">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[var(--c-primary)] to-[#4ADE80]"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[var(--c-muted)]">
              <span>{levelProgress}% to Level {level + 1}</span>
              <span className="flex items-center gap-0.5 group-hover:text-[var(--c-primary)] transition-colors">
                Profile <ChevronRight size={12} />
              </span>
            </div>
          </Link>

          {/* Card 2: Streak Shields & Protection */}
          <Link
            href="/habits"
            className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 transition-all hover:border-blue-500/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--c-muted)]">Streak Shields</span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30" style={fontMono}>
                <Shield size={12} /> {shieldsAvailable} Ready
              </span>
            </div>
            <p className="text-sm font-semibold text-[var(--c-text)]">
              {shieldsAvailable > 0 ? 'Active protection available' : 'No shields in inventory'}
            </p>
            <p className="text-xs text-[var(--c-muted)] mt-1 leading-relaxed">
              Protects any missed daily habit from resetting streak momentum.
            </p>
            <div className="mt-4 pt-2 border-t border-[var(--c-border)]/40 flex justify-between items-center text-[11px] text-[var(--c-muted)]">
              <span>{shieldUsages.length} shield{shieldUsages.length === 1 ? '' : 's'} used lifetime</span>
              <span className="text-blue-400 font-semibold group-hover:underline flex items-center gap-0.5">
                Vault <ChevronRight size={12} />
              </span>
            </div>
          </Link>

          {/* Card 3: Active Challenges */}
          <Link
            href="/challenges"
            className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 transition-all hover:border-purple-500/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--c-muted)]">Active Quest</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30" style={fontMono}>
                Day {GOAL_DAY}/30
              </span>
            </div>
            <p className="text-sm font-semibold text-[var(--c-text)]">30-Day Consistency Quest</p>
            <div className="h-1.5 w-full bg-[var(--c-surface-soft)] rounded-full overflow-hidden border border-[var(--c-border)]/40 my-2">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-indigo-400"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-[var(--c-muted)]">
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Zap size={11} /> +1,500 Sparks
              </span>
              <span className="text-purple-400 font-semibold group-hover:underline flex items-center gap-0.5">
                Quests <ChevronRight size={12} />
              </span>
            </div>
          </Link>

          {/* Card 4: Milestones & Badges */}
          <Link
            href="/achievements"
            className="group rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5 transition-all hover:border-amber-500/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--c-muted)]">Latest Milestone</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  color: latestMilestone.color,
                  backgroundColor: `${latestMilestone.color}18`,
                  border: `1px solid ${latestMilestone.color}35`,
                  ...fontMono,
                }}
              >
                {latestMilestone.rarity}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                style={{ borderColor: `${latestMilestone.color}40`, backgroundColor: `${latestMilestone.color}15` }}
              >
                <latestMilestone.icon size={20} color={latestMilestone.color} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-[var(--c-text)] truncate">{latestMilestone.title}</h4>
                <p className="text-xs text-[var(--c-muted)] truncate">{latestMilestone.desc}</p>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-[var(--c-border)]/40 flex justify-between items-center text-[11px] text-[var(--c-muted)]">
              <span>View Gallery</span>
              <span className="text-amber-400 font-semibold group-hover:underline flex items-center gap-0.5">
                Badges <ChevronRight size={12} />
              </span>
            </div>
          </Link>
        </section>

        {/* Suggested Habits (if room) */}
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
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#a8fe43] hover:bg-[#9bf336] active:scale-[0.98] text-[#07140c] border border-[#a8fe43] py-2.5 text-sm font-bold transition-all duration-200 shadow-xs cursor-pointer"
                    >
                      <Plus size={16} strokeWidth={2.5} /> Add Habit
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Stats 4-Card Overview */}
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

        {/* Main Grid: Left (Habits & Heatmap) vs Right (Progress & Activity) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column (Span 2) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Habits - Fully Interactive */}
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-sm transition-colors">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-[var(--c-text)]" style={fontDisplay}>
                    Today&rsquo;s Habits
                  </h2>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">Click any habit to check off or update count</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--c-surface-soft)] font-bold text-[var(--c-primary)]" style={fontMono}>
                  {completedCount}/{activeCount} Done
                </span>
              </div>

              <div className="space-y-3">
                {computedHabits.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-[var(--c-muted)]">No habits tracking right now.</p>
                    <Link
                      href="/habits"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[var(--c-primary)] hover:underline"
                    >
                      <Plus size={14} /> Create your first habit
                    </Link>
                  </div>
                ) : (
                  computedHabits.map((habit) => {
                    return (
                      <div
                        key={habit.id}
                        onClick={(e) => handleToggleHabit(e, habit)}
                        className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                          habit.completed
                            ? 'border-[#a8fe43]/80 bg-[#a8fe43]/5 dark:bg-[#a8fe43]/5 shadow-xs'
                            : 'border-[var(--c-border)] bg-slate-50/70 dark:bg-[var(--c-surface-soft)] hover:border-[#a8fe43]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Checkmark Button Trigger */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleHabit(e, habit)}
                              aria-label={`Toggle ${habit.title}`}
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
                                habit.completed
                                  ? 'border-[#a8fe43] bg-[#a8fe43] text-[#07140c] shadow-[0_0_12px_rgba(168,254,67,0.4)]'
                                  : 'border-slate-300 dark:border-[var(--c-border)] bg-white dark:bg-[var(--c-surface)] text-transparent hover:border-[#a8fe43]'
                              }`}
                            >
                              <Check size={16} strokeWidth={3} className={habit.completed ? 'opacity-100' : 'opacity-0'} />
                            </button>

                            <div className="min-w-0 flex-1">
                              <h3
                                className={`font-semibold text-base transition-colors ${
                                  habit.completed ? 'line-through text-slate-400 dark:text-[var(--c-muted)]' : 'text-[var(--c-text)]'
                                }`}
                              >
                                {habit.title}
                              </h3>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--c-muted)]">
                                <span className="flex items-center gap-1">
                                  <Flame size={13} className="text-[#a8fe43] fill-[#a8fe43]" />
                                  {habit.streak} day streak
                                </span>
                                {habit.mode === 'flex' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--c-primary)]/15 text-[var(--c-primary)]">
                                    {habit.perWeek || 3}x / wk
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Controls: Numeric Counters & Badge */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--c-border)]/40">
                            {habit.isCount && (
                              <div
                                className="flex items-center gap-1.5 bg-[var(--c-surface)] p-1 rounded-xl border border-[var(--c-border)]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => handleDecrement(e, habit)}
                                  disabled={habit.currentVal <= 0}
                                  className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--c-surface-soft)] text-[var(--c-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  title="Decrease"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-10 text-center text-xs font-bold" style={fontMono}>
                                  {habit.currentVal}/{habit.targetVal}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleIncrement(e, habit)}
                                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-[var(--c-primary)]/15 text-[var(--c-primary)] hover:bg-[var(--c-primary)]/25 transition-colors font-bold"
                                  title="Increase"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            )}

                            <span
                              className={`flex-none whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
                                habit.completed
                                  ? 'border-[#a8fe43] bg-[#a8fe43] text-[#07140c] shadow-xs dark:border-[#a8fe43]/40 dark:bg-[#a8fe43]/15 dark:text-[#a8fe43]'
                                  : 'border-slate-200 bg-white text-slate-500 dark:border-[var(--c-border)] dark:bg-[var(--c-surface)] dark:text-[var(--c-muted)]'
                              }`}
                            >
                              {habit.completed ? 'Done ✓' : 'Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-[var(--c-border)]">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${habit.progress}%`,
                              background: habit.completed ? 'var(--c-flame)' : 'var(--c-primary)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* GitHub-Style Contribution Heatmap */}
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl text-[var(--c-text)]" style={fontDisplay}>
                    <CalendarDays size={20} className="text-[#a8fe43]" />
                    Consistency Heatmap
                  </h2>
                  <p className="text-xs text-[var(--c-muted)] mt-0.5">
                    18-week continuous habit execution timeline
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium" style={fontMono}>
                  <span className="text-[var(--c-muted)]">
                    <strong className="text-[var(--c-text)]">{activeDaysCount}</strong> active days
                  </span>
                  <span className="text-[var(--c-muted)]">
                    <strong className="text-[var(--c-text)]">{totalCompletionsCount}</strong> check-ins
                  </span>
                  <Link href="/analytics" className="text-[var(--c-primary)] hover:underline flex items-center gap-0.5">
                    Analytics <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Heatmap Grid Container */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-1.5 min-w-[560px]">
                  {heatmapData.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1.5">
                      {week.map((day, dIdx) => (
                        <div
                          key={`${wIdx}-${dIdx}`}
                          className="h-3.5 w-3.5 rounded-[3px] transition-all duration-200 hover:ring-2 hover:ring-[var(--c-primary)] hover:scale-125 cursor-pointer"
                          style={{ backgroundColor: getHeatmapColor(day.level) }}
                          title={`${day.count} check-in${day.count === 1 ? '' : 's'} on ${day.dateStr}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--c-border)]/50 text-[11px] text-[var(--c-muted)]">
                <span>Hover cells for completion details</span>
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className="h-3 w-3 rounded-[2px]"
                      style={{ backgroundColor: getHeatmapColor(lvl) }}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-sm transition-colors">
              <h2 className="mb-6 flex items-center gap-2 text-xl text-[var(--c-text)]" style={fontDisplay}>
                <Activity size={18} className="text-[#a8fe43]" />
                Recent Activity
              </h2>

              <div className="space-y-5">
                {activity.length === 0 ? (
                  <p className="text-sm text-[var(--c-muted)]">No recent activity.</p>
                ) : (
                  activity.map((item, i) => (
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
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Span 1) */}
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
                          background: isToday ? 'var(--c-flame)' : 'var(--c-surface-soft)',
                          border: isToday ? '1.5px solid #a8fe43' : '1px solid var(--c-border)',
                          boxShadow: isToday ? '0 0 16px -2px rgba(168, 254, 67, 0.6)' : 'none',
                        }}
                      />
                      <span
                        className={`text-[10px] font-bold ${
                          isToday
                            ? 'text-[#07140c] bg-[#a8fe43] dark:text-[#a8fe43] dark:bg-transparent px-1.5 py-0.5 rounded-full'
                            : 'text-slate-400 dark:text-[var(--c-muted)]'
                        }`}
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
                <div className="mt-4 pt-4 border-t border-[var(--c-border)]/40 flex items-center justify-between text-xs text-[var(--c-muted)]">
                  <span>Atomic Habit Principle</span>
                  <Link href="/challenges" className="text-[#a8fe43] hover:underline font-semibold flex items-center gap-1">
                    Join Quests &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
