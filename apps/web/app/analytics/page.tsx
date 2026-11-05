'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useHabits } from '@repo/query/habits/useHabits';
import { useGamificationSummary } from '@repo/query/gamification/useGamificationSummary';
import { useShieldUsages } from '@repo/query/gamification/useGamificationMutations';
import { habitStreak } from '../../components/habits/utils';

import {
  Activity,
  Award,
  CalendarDays,
  Flame,
  Target,
  TrendingUp,
  BarChart2,
  Zap
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data: habits = [] } = useHabits(userId);
  const { data: summary } = useGamificationSummary(userId);
  const { data: shieldUsages = [] } = useShieldUsages(userId);

  const activeHabits = useMemo(() => habits.filter((h: any) => !h.archived), [habits]);

  // Compute real 20-week (140-day) heatmap data
  const heatmapData = useMemo(() => {
    const daysMap = new Map<string, number>();
    for (const h of habits) {
      for (const log of h.logs || []) {
        const key = new Date(log.completedAt).toISOString().split('T')[0];
        if (key) {
          daysMap.set(key, (daysMap.get(key) || 0) + 1);
        }
      }
    }

    const weeks = 20;
    const days = 7;
    const totalDays = weeks * days;
    const now = new Date();
    const data: number[][] = [];

    for (let w = 0; w < weeks; w++) {
      const week: number[] = [];
      for (let d = 0; d < days; d++) {
        const dayOffset = totalDays - 1 - (w * 7 + d);
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() - dayOffset);
        const dateKey = targetDate.toISOString().split('T')[0] || '';
        const count = daysMap.get(dateKey) || 0;

        let level = 0;
        if (count >= 4) level = 4;
        else if (count === 3) level = 3;
        else if (count === 2) level = 2;
        else if (count === 1) level = 1;

        week.push(level);
      }
      data.push(week);
    }
    return data;
  }, [habits]);

  // Real top habits calculated from streaks & completions
  const topHabits = useMemo(() => {
    if (activeHabits.length === 0) return [];

    const computed = activeHabits.map((h: any) => {
      const streak = habitStreak(h.logs || [], shieldUsages, h.id);
      const logsCount = h.logs?.length || 0;
      const consistency = Math.min(100, Math.round((logsCount / Math.max(1, 30)) * 100));
      return {
        name: h.title || 'Habit',
        streak,
        consistency,
      };
    });

    computed.sort((a, b) => b.consistency - a.consistency || b.streak - a.streak);
    return computed.slice(0, 4);
  }, [activeHabits, shieldUsages]);

  // Real monthly trend (last 6 months)
  const monthlyProgress = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthName = monthNames[month];

      // Count completions in this month
      let completedInMonth = 0;
      for (const h of habits) {
        for (const log of h.logs || []) {
          const lDate = new Date(log.completedAt);
          if (lDate.getFullYear() === year && lDate.getMonth() === month) {
            completedInMonth++;
          }
        }
      }

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const possibleCompletions = Math.max(1, activeHabits.length * daysInMonth);
      const completionRate = Math.min(100, Math.round((completedInMonth / possibleCompletions) * 100));

      result.push({
        month: monthName,
        completion: completionRate,
      });
    }

    return result;
  }, [habits, activeHabits]);

  // Statistics
  const longestStreakData = useMemo(() => {
    let best = 0;
    let habitName = 'None';
    for (const h of activeHabits) {
      const s = habitStreak(h.logs || [], shieldUsages, h.id);
      if (s > best) {
        best = s;
        habitName = h.title || 'Habit';
      }
    }
    return { best, habitName };
  }, [activeHabits, shieldUsages]);

  const successRate = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    const totalPossible = activeHabits.length * 30;
    const totalLogged = activeHabits.reduce((acc: number, h: any) => acc + (h.logs?.length || 0), 0);
    return Math.min(100, Math.round((totalLogged / totalPossible) * 100));
  }, [activeHabits]);

  const perfectDaysCount = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    const dateCountMap = new Map<string, number>();
    for (const h of activeHabits) {
      for (const log of h.logs || []) {
        const key = new Date(log.completedAt).toISOString().split('T')[0];
        if (key) {
          dateCountMap.set(key, (dateCountMap.get(key) || 0) + 1);
        }
      }
    }
    let perfect = 0;
    dateCountMap.forEach((count) => {
      if (count >= activeHabits.length) perfect++;
    });
    return perfect;
  }, [activeHabits]);

  const getIntensityColor = (value: number) => {
    switch (value) {
      case 0: return 'var(--c-surface-soft)';
      case 1: return 'color-mix(in srgb, var(--c-primary) 30%, var(--c-surface-soft))';
      case 2: return 'color-mix(in srgb, var(--c-primary) 60%, var(--c-surface-soft))';
      case 3: return 'color-mix(in srgb, var(--c-primary) 85%, var(--c-surface-soft))';
      case 4: return 'var(--c-primary)';
      default: return 'var(--c-surface-soft)';
    }
  };

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
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      <div className="mx-auto max-w-7xl space-y-8 px-6 pt-16 pb-10 lg:py-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--c-primary)]/10 text-[var(--c-primary)]">
                <BarChart2 size={20} />
              </div>
              <h1 className="mt-2 text-4xl font-semibold text-[var(--c-text)] sm:text-5xl" style={fontDisplay}>
                Analytics
              </h1>
            </div>
            <p className="mt-4 text-[var(--c-muted)] max-w-xl">
              Understand your journey, spot patterns in your behavior, and visualize the compound effect of your daily habits.
            </p>
          </div>
        </header>

        {/* Top Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 transition-all hover:border-[var(--c-primary)]/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--c-muted)]">Total Sparks Balance</p>
              <Zap size={18} className="text-[#F59E0B]" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-[var(--c-text)]" style={fontMono}>
              {(summary?.sparksBalance ?? 150).toLocaleString()}
            </p>
            <p className="mt-1 flex items-center text-xs text-[var(--c-primary)]">
              <TrendingUp size={12} className="mr-1" />
              Live rewards wallet
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 transition-all hover:border-[var(--c-primary)]/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--c-muted)]">Longest Streak</p>
              <Award size={18} className="text-[var(--c-primary)]" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-[var(--c-text)]" style={fontMono}>
              {longestStreakData.best} Days
            </p>
            <p className="mt-1 text-xs text-[var(--c-muted)]">
              {longestStreakData.habitName}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 transition-all hover:border-[var(--c-primary)]/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--c-muted)]">Consistency Rate</p>
              <Target size={18} className="text-[var(--c-primary)]" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-[var(--c-text)]" style={fontMono}>
              {successRate}%
            </p>
            <p className="mt-1 text-xs text-[var(--c-muted)]">
              Across {activeHabits.length} active habits
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 transition-all hover:border-[var(--c-primary)]/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--c-muted)]">Perfect Days</p>
              <CalendarDays size={18} className="text-[var(--c-primary)]" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-[var(--c-text)]" style={fontMono}>
              {perfectDaysCount}
            </p>
            <p className="mt-1 text-xs text-[var(--c-muted)]">
              All scheduled habits completed
            </p>
          </div>
        </div>

        {/* Main Charts Area */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Consistency Heatmap */}
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl text-[var(--c-text)]" style={fontDisplay}>Consistency Heatmap</h2>
                <p className="text-sm text-[var(--c-muted)] mt-1">Your habit completion intensity over the last 140 days.</p>
              </div>
              <Activity className="text-[var(--c-muted)]" size={20} />
            </div>
            
            <div className="flex overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex gap-1.5 min-w-max">
                {heatmapData.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-1.5">
                    {week.map((dayValue, dIndex) => (
                      <div 
                        key={`${wIndex}-${dIndex}`}
                        className="w-4 h-4 rounded-sm transition-all hover:ring-2 hover:ring-[var(--c-primary)] hover:ring-offset-1 hover:ring-offset-[var(--c-surface)] cursor-pointer"
                        style={{ backgroundColor: getIntensityColor(dayValue) }}
                        title={`Activity level: ${dayValue}/4 completions`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-[var(--c-muted)]">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((v) => (
                <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getIntensityColor(v) }} />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* Top Habits */}
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6">
            <div className="mb-6">
              <h2 className="text-xl text-[var(--c-text)]" style={fontDisplay}>Top Performing Habits</h2>
              <p className="text-sm text-[var(--c-muted)] mt-1">Your most consistent habits.</p>
            </div>
            
            {topHabits.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--c-muted)]">
                No active habits found. Create a habit to start tracking consistency!
              </div>
            ) : (
              <div className="space-y-5">
                {topHabits.map((habit, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[var(--c-text)] text-sm">{habit.name}</span>
                      <span className="text-xs font-medium text-[var(--c-muted)] bg-[var(--c-surface-soft)] px-2 py-1 rounded-md" style={fontMono}>
                        {habit.consistency}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--c-surface-soft)] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[var(--c-primary)] to-[#4ADE80]" 
                        style={{ width: `${habit.consistency}%` }} 
                      />
                    </div>
                    <p className="mt-2 text-xs text-[var(--c-muted)] flex items-center gap-1">
                      <Flame size={12} className="text-[#F59E0B]" />
                      {habit.streak} day streak
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Trend Bar Chart */}
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 lg:col-span-3">
             <div className="mb-8">
              <h2 className="text-xl text-[var(--c-text)]" style={fontDisplay}>Completion Trend</h2>
              <p className="text-sm text-[var(--c-muted)] mt-1">Average monthly habit completion rate over the last 6 months.</p>
            </div>

            <div className="h-64 w-full flex items-end justify-between gap-2 px-2 sm:px-8">
              {monthlyProgress.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full flex justify-center h-[200px] items-end relative">
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--c-surface-soft)] border border-[var(--c-border)] text-[var(--c-text)] text-xs py-1 px-2 rounded font-medium shadow-sm" style={fontMono}>
                      {item.completion}%
                    </div>
                    <div 
                      className="w-full max-w-[60px] rounded-t-xl transition-all duration-500 ease-out group-hover:brightness-110"
                      style={{ 
                        height: `${Math.max(4, item.completion)}%`,
                        background: 'linear-gradient(180deg, var(--c-primary) 0%, rgba(34,197,94,0.2) 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)'
                      }}
                    />
                  </div>
                  <span className="text-sm text-[var(--c-muted)] uppercase tracking-wider font-medium">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
