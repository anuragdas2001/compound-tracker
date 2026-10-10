"use client";

import { useMemo } from "react";
import type { Dispatch, ElementType, SetStateAction } from "react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  MoreHorizontal,
  Pencil,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { C, fontDisplay, fontMono, monthNames, weekDays } from "./constants";
import type { Habit, HabitRow } from "./types";
import { baseMonday, formatWeekLabel, getMonthWeekOffsets, monthStartOffset } from "./utils";

type InsightsViewProps = {
  habits: Habit[];
  habitRows: HabitRow[];
  weekOffset: number;
  setWeekOffset: Dispatch<SetStateAction<number>>;
  toggleDay: (habitId: string, dayIndex: number, weekOff?: number) => void;
  deleteHabit: (habitId: string) => void;
  editHabit: (habitId: string) => void;
  menuOpenId: string | null;
  setMenuOpenId: Dispatch<SetStateAction<string | null>>;
};

export function InsightsView({
  habits,
  habitRows,
  weekOffset,
  setWeekOffset,
  toggleDay,
  deleteHabit,
  editHabit,
  menuOpenId,
  setMenuOpenId,
}: InsightsViewProps) {
  const monthWeeks = useMemo(() => getMonthWeekOffsets(weekOffset), [weekOffset]);

  const { viewedMonth, viewedYear } = useMemo(() => {
    const v = baseMonday(weekOffset);
    return { viewedMonth: v.getMonth(), viewedYear: v.getFullYear() };
  }, [weekOffset]);

  const weekDates = useMemo(() => {
    const start = baseMonday(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const totalCompleted = habitRows.reduce(
    (acc, h) => acc + h.week.filter(Boolean).length,
    0
  );
  const totalPossible = habits.length * 7 || 1;
  const completionRate = Math.round((totalCompleted / totalPossible) * 100);
  const overallBest = habitRows.length
    ? Math.max(...habitRows.map((h) => h.best))
    : 0;

  const dailyCompletion = useMemo(
    () =>
      weekDays.map((_, i) => {
        if (!habits.length) return 0;
        const done = habitRows.filter((h) => h.week[i]).length;
        return Math.round((done / habits.length) * 100);
      }),
    [habitRows, habits.length]
  );

  const peakValue = Math.max(...dailyCompletion);
  const topHabits = [...habitRows].sort((a, b) => b.streak - a.streak).slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: C.muted, ...fontMono }}>
          Global Status
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Active Habits" value={String(habits.length).padStart(2, "0")} icon={Target} accent={C.pale} />
          <StatCard label="Completion" value={`${completionRate}%`} icon={TrendingUp} accent={C.light} />
          <StatCard label="Check-ins" value={String(totalCompleted)} icon={CalendarCheck} accent={C.primary} />
          <StatCard label="Best Streak" value={String(overallBest)} icon={Trophy} accent="#16A34A" />
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight" style={{ color: C.text, ...fontDisplay }}>
              Momentum Board
            </h2>
            <p className="mt-1 text-sm" style={{ color: C.muted }}>
              {formatWeekLabel(weekOffset)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="rounded-lg border p-2 transition-colors"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded-lg border p-2 transition-colors"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="flex flex-col gap-8 border-b px-6 py-6" style={{ borderColor: C.border }}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWeekOffset(monthStartOffset(viewedYear - 1, viewedMonth))}
                  className="rounded-lg border p-1.5 transition-colors"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
                  aria-label="Previous year"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span
                  className="text-xs uppercase tracking-[0.2em]"
                  style={{ color: C.muted, ...fontMono }}
                >
                  {viewedYear}
                </span>
                <button
                  onClick={() => setWeekOffset(monthStartOffset(viewedYear + 1, viewedMonth))}
                  className="rounded-lg border p-1.5 transition-colors"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
                  aria-label="Next year"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {monthNames.map((name, m) => {
                  const isActive = m === viewedMonth;
                  return (
                    <button
                      key={name}
                      onClick={() => setWeekOffset(monthStartOffset(viewedYear, m))}
                      aria-label={`${name} ${viewedYear}`}
                      className="flex items-center justify-center rounded-full font-semibold transition-all duration-300 hover:scale-105"
                      style={{
                        height: isActive ? 56 : 44,
                        width: isActive ? 56 : 44,
                        fontSize: isActive ? 16 : 13,
                        backgroundColor: isActive ? C.primary : C.surfaceSoft,
                        color: isActive ? "#06120B" : C.light,
                        border: `1px solid ${isActive ? C.primary : C.border}`,
                        ...fontMono,
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: C.muted, ...fontMono }}
              >
                {baseMonday(weekOffset).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>

              <div className="flex items-center justify-center gap-3">
                {monthWeeks.map((offset, i) => {
                  const isActive = offset === weekOffset;
                  return (
                    <button
                      key={offset}
                      onClick={() => setWeekOffset(offset)}
                      title={formatWeekLabel(offset)}
                      aria-label={`Week ${i + 1}`}
                      className="flex items-center justify-center rounded-full font-semibold transition-all duration-300 hover:scale-105"
                      style={{
                        height: isActive ? 56 : 44,
                        width: isActive ? 56 : 44,
                        fontSize: isActive ? 18 : 14,
                        backgroundColor: isActive ? C.primary : C.surfaceSoft,
                        color: isActive ? "#06120B" : C.light,
                        border: `1px solid ${isActive ? C.primary : C.border}`,
                        ...fontMono,
                      }}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs" style={{ color: C.muted }}>
                Week {monthWeeks.indexOf(weekOffset) + 1 || "-"} - {formatWeekLabel(weekOffset)}
              </p>
            </div>
          </div>

          {habits.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p style={{ color: C.text }}>No habits yet.</p>
              <p className="mt-1 text-sm" style={{ color: C.muted }}>
                Add your first one to start building a streak.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[240px_1fr] border-b px-6 py-4" style={{ borderColor: C.border }}>
                <div />
                <div className="grid grid-cols-7">
                  {weekDates.map((date, i) => (
                    <div key={i} className="text-center">
                      <div className="text-sm" style={{ color: C.muted }}>{weekDays[i]}</div>
                      <div className="mt-0.5 text-xs" style={{ color: `${C.muted}99` }}>
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {habitRows.map((habit) => (
                <div
                  key={habit.id}
                  className="grid grid-cols-[240px_1fr] items-center border-b px-6 py-5 transition-colors last:border-0 hover:bg-[var(--c-surface-soft)]"
                  style={{ borderColor: C.border }}
                >
                  <div className="flex items-center justify-between pr-6">
                    <div>
                      <h3 className="font-medium" style={{ color: C.text }}>
                        {habit.name}
                      </h3>
                      <div className="mt-2 flex gap-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                          style={{ borderColor: `${C.primary}33`, backgroundColor: `${C.primary}1A`, color: C.primary }}
                        >
                          <Flame className="h-3 w-3" />
                          {habit.streak}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                          style={{ borderColor: C.border, color: C.muted }}
                        >
                          <Trophy className="h-3 w-3" />
                          {habit.best}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === habit.id ? null : habit.id)}
                        className="rounded-lg p-1.5 transition-colors"
                        style={{ color: C.muted }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpenId === habit.id && (
                        <div className="absolute right-0 z-30 mt-2 w-40 rounded-lg border p-1" style={{ borderColor: C.border, backgroundColor: C.surface }}>
                          <button
                            onClick={() => editHabit(habit.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--c-surface-soft)]"
                            style={{ color: C.text }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit habit
                          </button>
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete habit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {habit.week.map((done, dayIndex) => (
                      <div key={dayIndex} className="flex justify-center">
                        <button
                          onClick={() => toggleDay(habit.id, dayIndex, weekOffset)}
                          className="h-12 w-12 rounded-xl border transition hover:scale-105"
                          style={
                            done
                              ? { borderColor: C.primary, backgroundColor: C.primary }
                              : { borderColor: C.border, backgroundColor: C.surfaceSoft }
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <h3 className="text-lg font-semibold" style={{ color: C.text, ...fontDisplay }}>Weekly Progress</h3>
          <div className="relative mt-6 flex h-48 items-end gap-3">
            {dailyCompletion.map((pct, i) => {
              const isPeak = pct === peakValue && pct > 0;
              return (
                <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-full transition-all duration-700"
                    style={{
                      height: `${Math.max(pct, 4)}%`,
                      background: isPeak
                        ? `linear-gradient(180deg, ${C.primary}, ${C.pale})`
                        : C.border,
                    }}
                  />
                  <span
                    className="text-[10px]"
                    style={{ color: isPeak ? C.primary : C.muted, ...fontMono }}
                  >
                    {weekDays[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <h3 className="text-lg font-semibold" style={{ color: C.text, ...fontDisplay }}>Top Habits</h3>
          <div className="mt-4 space-y-4">
            {topHabits.length === 0 && (
              <p className="text-sm" style={{ color: C.muted }}>
                Add a habit to see your top performers.
              </p>
            )}
            {topHabits.map((habit, i) => (
              <div key={habit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold" style={{ color: `${C.muted}99`, ...fontMono }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ color: C.text }}>{habit.name}</span>
                </div>
                <span
                  className="rounded-full border px-3 py-1 text-xs font-medium"
                  style={{ borderColor: `${C.primary}33`, backgroundColor: `${C.primary}1A`, color: C.primary }}
                >
                  {habit.streak} days
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {menuOpenId && (
        <div className="fixed inset-0 z-20" onClick={() => setMenuOpenId(null)} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: ElementType;
  accent?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: C.border, backgroundColor: C.surface }}>
      <div className="h-1 w-full" style={{ background: accent || C.primary }} />
      <div className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: C.muted }}>{label}</p>
          <p className="mt-2 text-3xl" style={{ color: C.text, ...fontMono }}>{value}</p>
        </div>
        <Icon size={18} className="mt-1" style={{ color: C.muted }} />
      </div>
    </div>
  );
}
