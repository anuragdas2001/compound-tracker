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
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Shield,
  History,
  XCircle,
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  // Day of Week Distribution (Best & Worst Performing Days)
  const dayOfWeekStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    let totalLogs = 0;

    for (const h of habits) {
      for (const log of h.logs || []) {
        const d = new Date(log.completedAt);
        const dayIdx = d.getDay();
        counts[dayIdx] = (counts[dayIdx] || 0) + 1;
        totalLogs++;
      }
    }

    const stats = DAY_NAMES.map((name, idx) => {
      const count = counts[idx] || 0;
      const percent = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
      return { name, short: name.slice(0, 3), count, percent, idx };
    });

    // Sort to find best and worst
    const sorted = [...stats].sort((a, b) => b.count - a.count);
    const best = sorted[0] || { name: 'Monday', percent: 0, count: 0 };
    const worst = sorted[sorted.length - 1] || { name: 'Sunday', percent: 0, count: 0 };

    return { stats, best, worst, totalLogs };
  }, [habits]);

  // Cross-Habit Correlations (habit pairs completed together)
  const correlations = useMemo(() => {
    if (activeHabits.length < 2) return [];

    const dateHabitsMap = new Map<string, Set<string>>();
    for (const h of activeHabits) {
      for (const log of h.logs || []) {
        const dateKey = new Date(log.completedAt).toISOString().split('T')[0];
        if (dateKey) {
          if (!dateHabitsMap.has(dateKey)) {
            dateHabitsMap.set(dateKey, new Set());
          }
          dateHabitsMap.get(dateKey)!.add(h.id);
        }
      }
    }

    const pairResults: { habitA: string; habitB: string; correlation: number }[] = [];
    for (let i = 0; i < activeHabits.length; i++) {
      for (let j = i + 1; j < activeHabits.length; j++) {
        const hA = activeHabits[i]!;
        const hB = activeHabits[j]!;

        let bothCount = 0;
        let aCount = 0;

        dateHabitsMap.forEach((set) => {
          if (set.has(hA.id)) {
            aCount++;
            if (set.has(hB.id)) {
              bothCount++;
            }
          }
        });

        if (aCount > 0) {
          const rate = Math.round((bothCount / aCount) * 100);
          pairResults.push({
            habitA: hA.title,
            habitB: hB.title,
            correlation: rate,
          });
        }
      }
    }

    pairResults.sort((a, b) => b.correlation - a.correlation);
    return pairResults.slice(0, 3);
  }, [activeHabits]);

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

  // Historical Streak Timeline & Failure Logs (Trailing 21 days)
  const streakTimelineEvents = useMemo(() => {
    const events: Array<{
      id: string;
      date: Date;
      type: 'PROTECTED' | 'MISSED' | 'MILESTONE';
      title: string;
      description: string;
      habitTitle: string;
      dateStr: string;
    }> = [];

    // Protected events from shield usages
    for (const s of shieldUsages) {
      const d = new Date(s.missedDate || s.createdAt);
      events.push({
        id: s.id,
        date: d,
        dateStr: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        type: 'PROTECTED',
        title: 'Streak Protected with Shield',
        description: 'Scheduled routine was missed, but Streak Shield prevented momentum loss.',
        habitTitle: habits.find((h: any) => h.id === s.relatedHabitId)?.title || 'All Routines',
      });
    }

    // Historical failures and missed logs across recent 21 days
    const now = new Date();
    for (let i = 1; i <= 21; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const isoDate = d.toISOString().split('T')[0];

      for (const h of activeHabits) {
        const hasLog = (h.logs || []).some((l: any) => {
          const ld = new Date(l.completedAt);
          ld.setHours(0, 0, 0, 0);
          return ld.getTime() === d.getTime();
        });

        const isShielded = shieldUsages.some((s: any) => {
          if (!s.missedDate) return false;
          if (s.relatedHabitId && s.relatedHabitId !== h.id) return false;
          const sd = new Date(s.missedDate);
          sd.setHours(0, 0, 0, 0);
          return sd.getTime() === d.getTime();
        });

        if (!hasLog && !isShielded) {
          let isScheduled = true;
          if (h.mode === 'days' && h.days && h.days.length > 0) {
            const dayIdx = (d.getDay() + 6) % 7;
            isScheduled = h.days.includes(dayIdx);
          }

          if (isScheduled) {
            events.push({
              id: `missed_${h.id}_${isoDate}`,
              date: d,
              dateStr: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
              type: 'MISSED',
              title: 'Missed Scheduled Check-In',
              description: `Routine scheduled for ${d.toLocaleDateString([], { weekday: 'short' })} was skipped without a shield.`,
              habitTitle: h.title,
            });
          }
        }
      }
    }

    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    return events.slice(0, 8);
  }, [activeHabits, shieldUsages, habits]);

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
                Analytics & Behavioral Insights
              </h1>
            </div>
            <p className="mt-4 text-[var(--c-muted)] max-w-xl">
              Understand your journey, spot day-of-week drop-offs, habit pairings, and leverage the compound effect.
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

        {/* Day-of-Week Behavioral Performance & AI Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Day of Week Consistency */}
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 lg:col-span-2">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl text-[var(--c-text)]" style={fontDisplay}>Day-of-Week Performance</h2>
                <p className="text-sm text-[var(--c-muted)] mt-1">
                  Identify your most productive days and high-risk weekend drop-off zones.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-[#a8fe43]/15 text-[#a8fe43] font-bold">
                  Peak: {dayOfWeekStats.best.name}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 font-bold">
                  Drop-off: {dayOfWeekStats.worst.name}
                </span>
              </div>
            </div>

            {/* Day of Week Bar Distribution */}
            <div className="grid grid-cols-7 gap-2 pt-4 items-end h-48">
              {dayOfWeekStats.stats.map((day) => {
                const isBest = day.name === dayOfWeekStats.best.name && day.count > 0;
                const isWorst = day.name === dayOfWeekStats.worst.name && day.count > 0;

                return (
                  <div key={day.name} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-semibold text-[var(--c-muted)]" style={fontMono}>
                      {day.percent}%
                    </span>
                    <div className="w-full flex justify-center items-end h-32 relative">
                      <div
                        className="w-full max-w-[36px] rounded-t-xl transition-all duration-500 ease-out group-hover:brightness-125"
                        style={{
                          height: `${Math.max(8, day.percent * 2.5)}%`,
                          background: isBest
                            ? 'linear-gradient(180deg, #a8fe43 0%, rgba(168,254,67,0.3) 100%)'
                            : isWorst
                            ? 'linear-gradient(180deg, #f43f5e 0%, rgba(244,63,94,0.3) 100%)'
                            : 'linear-gradient(180deg, var(--c-primary) 0%, rgba(34,197,94,0.2) 100%)',
                          boxShadow: isBest ? '0 0 12px rgba(168,254,67,0.3)' : 'none',
                        }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${isBest ? 'text-[#a8fe43]' : isWorst ? 'text-rose-400' : 'text-[var(--c-muted)]'}`}>
                      {day.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Behavioral Insights Card */}
          <div className="rounded-2xl border border-[var(--c-primary)]/30 bg-[var(--c-surface)] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} className="text-[var(--c-primary)]" />
                <h3 className="text-lg font-bold text-[var(--c-text)]" style={fontDisplay}>
                  Behavioral Insights
                </h3>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-[var(--c-muted)]">
                <div className="p-3 rounded-xl bg-[var(--c-surface-soft)]/60 border border-[var(--c-border)]/50">
                  <div className="flex items-center gap-2 font-semibold text-[var(--c-text)] mb-1">
                    <CheckCircle2 size={14} className="text-[#a8fe43]" />
                    Peak Momentum on {dayOfWeekStats.best.name}s
                  </div>
                  <p>
                    Your check-in volume peaks on {dayOfWeekStats.best.name}s ({dayOfWeekStats.best.percent}% of all logs). Use this day for demanding habits!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--c-surface-soft)]/60 border border-[var(--c-border)]/50">
                  <div className="flex items-center gap-2 font-semibold text-[var(--c-text)] mb-1">
                    <AlertTriangle size={14} className="text-amber-400" />
                    Weekend Friction Warning
                  </div>
                  <p>
                    Consistency drops by {Math.max(10, dayOfWeekStats.best.percent - dayOfWeekStats.worst.percent)}% on {dayOfWeekStats.worst.name}s. Consider using Streak Shields or setting minimum flex targets on weekends.
                  </p>
                </div>

                {correlations[0] && (
                  <div className="p-3 rounded-xl bg-[var(--c-surface-soft)]/60 border border-[var(--c-border)]/50">
                    <div className="flex items-center gap-2 font-semibold text-[var(--c-text)] mb-1">
                      <Lightbulb size={14} className="text-blue-400" />
                      Habit Stacking Synergy
                    </div>
                    <p>
                      Completing &quot;{correlations[0].habitA}&quot; triggers &quot;{correlations[0].habitB}&quot; with a {correlations[0].correlation}% correlation rate. Stack them consecutively!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--c-border)]/50 text-[10px] text-[var(--c-muted)]" style={fontMono}>
              Compound Behavioral Engine v2.0 • Live
            </div>
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

          {/* Historical Streak Timeline & Failure Logs */}
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 lg:col-span-3">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-400" />
                  <h2 className="text-xl text-[var(--c-text)]" style={fontDisplay}>
                    Historical Streak Timeline &amp; Failure Logs
                  </h2>
                </div>
                <p className="text-sm text-[var(--c-muted)] mt-1">
                  Chronological audit of recent habit breaks, missed dates, and streak shield interventions.
                </p>
              </div>
              <span className="text-xs font-mono text-[var(--c-muted)]" style={fontMono}>
                Trailing 21 Days
              </span>
            </div>

            {streakTimelineEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl py-12 border border-dashed border-white/10 bg-white/5 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white">Flawless Streak Momentum</h4>
                <p className="text-xs text-[var(--c-muted)] mt-1 max-w-sm">
                  No broken streaks or missed scheduled days recorded in your recent compounding cycle!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {streakTimelineEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                          event.type === 'PROTECTED'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {event.type === 'PROTECTED' ? (
                          <Shield className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{event.habitTitle}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              event.type === 'PROTECTED'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {event.type === 'PROTECTED' ? 'Shielded' : 'Missed Day'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--c-muted)] mt-0.5 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--c-muted)] sm:self-center self-end" style={fontMono}>
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{event.dateStr}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
