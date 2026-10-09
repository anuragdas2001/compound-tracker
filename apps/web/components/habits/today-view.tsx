"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  Check,
  Clock,
  Flame,
  MessageSquare,
  Plus,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { C, fontDisplay, fontMono, weekDays } from "./constants";
import type { Habit } from "./types";
import { baseMonday, getWeek, isDateCompleted } from "./utils";

type TodayViewProps = {
  habits: Habit[];
  todayIndex: number;
  toggleDay: (id: string) => void;
  greeting: string;
  GreetingIcon: LucideIcon;
  dailyNote: string;
  setDailyNote: (value: string) => void;
  onAddHabit?: () => void;
};

const dailyTips = [
  "Never miss twice. One slip is an accident; two is the start of a new habit.",
  "Make it small. A two-minute version of a habit still keeps the chain alive.",
  "Stack it. Attach a new habit to something you already do every day.",
  "Show up first, perfect later. Consistency beats intensity.",
  "Make it obvious. Put the cue where you'll see it, like your water bottle on your desk.",
  "Track it today. The check-in itself is a tiny reward.",
  "Your streak is a promise to your future self. Keep it light, keep it going.",
];

function habitStreak(logs: { completedAt: string }[] = []) {
  const d = new Date();
  if (!isDateCompleted(logs, d)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (isDateCompleted(logs, d) && n < 366) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// 1. TODAY VIEW
export function TodayView({
  habits,
  todayIndex,
  toggleDay,
  greeting,
  GreetingIcon,
  dailyNote,
  setDailyNote,
  onAddHabit,
}: TodayViewProps) {
  // Optimistic UI: tick instantly, then fall back to server truth once it changes
  const [optimistic, setOptimistic] = useState<
    Record<string, { base: boolean; value: boolean }>
  >({});

  const todayHabits = habits.map((h: any) => {
    const serverDone = getWeek(h, 0)[todayIndex] || false;
    const o = optimistic[h.id];
    const done = o && o.base === serverDone ? o.value : serverDone;
    return { ...h, done, serverDone, streak: habitStreak(h.logs) };
  });

  const handleToggle = (habit: any) => {
    setOptimistic((prev) => ({
      ...prev,
      [habit.id]: { base: habit.serverDone, value: !habit.done },
    }));
    toggleDay(habit.id);
  };

  const pending = todayHabits.filter((h: any) => !h.done);
  const completed = todayHabits.filter((h: any) => h.done);
  const completedCount = completed.length;
  const totalCount = todayHabits.length;
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  /* --- Week overview (Mon..Sun) --- */
  const monday = baseMonday(0);
  const weekOverview = weekDays.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const isToday = i === todayIndex;
    const isFuture = i > todayIndex;
    const done = isToday
      ? completedCount
      : habits.filter((h: any) => isDateCompleted(h.logs, date)).length;
    const pct = totalCount === 0 || isFuture ? 0 : Math.round((done / totalCount) * 100);
    return { label, date: date.getDate(), isToday, isFuture, done, pct };
  });

  const weekCheckins = weekOverview.reduce((acc, d) => acc + d.done, 0);
  const weekPossible = totalCount * (todayIndex + 1);
  const weekRate = weekPossible === 0 ? 0 : Math.round((weekCheckins / weekPossible) * 100);
  const perfectDays = weekOverview.filter((d) => !d.isFuture && d.pct === 100).length;
  const bestStreak = todayHabits.reduce((m: number, h: any) => Math.max(m, h.streak), 0);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const dayOfYear = Math.floor(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const tip = dailyTips[dayOfYear % dailyTips.length];

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const headline = isAllDone
    ? "You crushed it."
    : completedCount === 0
    ? "Ready to build?"
    : "Keep going!";

  const subline = isAllDone
    ? "All habits completed for today. Rest up!"
    : `${pending.length} ${pending.length === 1 ? "habit" : "habits"} left today. Tap one to check it off.`;

  const renderRow = (habit: any, isNext = false) => (
    <button
      key={habit.id}
      onClick={() => handleToggle(habit)}
      aria-pressed={habit.done}
      aria-label={`${habit.done ? "Undo" : "Complete"} ${habit.name}`}
      className="group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 hover:border-[var(--c-border-hover)] active:scale-[0.99]"
      style={{
        borderColor: isNext ? `${C.primary}55` : C.border,
        backgroundColor: habit.done ? C.surface : C.surfaceSoft,
      }}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          habit.done ? "" : "group-hover:border-[var(--c-primary)] group-hover:bg-[var(--c-primary)]/10"
        }`}
        style={{
          borderColor: habit.done ? C.primary : C.borderHover,
          backgroundColor: habit.done ? C.primary : "transparent",
        }}
      >
        <Check
          className={`h-4 w-4 transition-all duration-200 ${
            habit.done ? "scale-100 opacity-100" : "scale-75 opacity-0 group-hover:opacity-40"
          }`}
          style={{ color: habit.done ? "#06120B" : C.primary }}
          strokeWidth={3}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={`block truncate font-medium transition-colors ${habit.done ? "line-through" : ""}`}
            style={{ color: habit.done ? C.muted : C.text }}
          >
            {habit.name}
          </span>
          {isNext && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: `${C.primary}1A`, color: C.primary, ...fontMono }}
            >
              Up next
            </span>
          )}
        </span>
        {habit.time && (
          <span className="mt-1 flex items-center gap-1 text-xs" style={{ color: C.muted }}>
            <Clock className="h-3 w-3" />
            {habit.time}
          </span>
        )}
      </span>

      <span className="flex shrink-0 items-center gap-2">
        {habit.streak > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
            style={{ borderColor: `${C.primary}33`, backgroundColor: `${C.primary}1A`, color: C.primary }}
            title={`${habit.streak}-day streak`}
          >
            <Flame className="h-3 w-3" />
            {habit.streak}
          </span>
        )}
        {!habit.done && (
          <span className="hidden items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-400 sm:inline-flex">
            <Sparkles className="h-3 w-3" />+5
          </span>
        )}
      </span>
    </button>
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ================= LEFT COLUMN ================= */}
      <div className="space-y-8">
        {/* SUMMARY CARD */}
        <section
          className="flex items-center justify-between gap-6 rounded-[28px] border p-6 sm:p-8"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2" style={{ color: C.muted }}>
              <GreetingIcon className="h-5 w-5" />
              <span className="text-xs font-medium uppercase tracking-[0.2em]" style={fontMono}>
                {greeting} · {dateLabel}
              </span>
            </div>
            <h1
              className="text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ color: C.text, ...fontDisplay }}
            >
              {headline}
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{ color: C.muted }}>
              {totalCount === 0 ? "Add your first habit to get started." : subline}
            </p>
          </div>

          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle strokeWidth="8" cx="50" cy="50" r={radius} fill="transparent" stroke={C.border} />
              <circle
                strokeWidth="8"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={isAllDone ? C.light : C.primary}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: C.text, ...fontMono }}>
                {progress}%
              </span>
              <span className="text-[10px]" style={{ color: C.muted, ...fontMono }}>
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>
        </section>

        {/* HABITS */}
        <section className="space-y-6">
          {totalCount === 0 ? (
            <div
              className="rounded-2xl border border-dashed p-10 text-center"
              style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted }}
            >
              <Target className="mx-auto mb-3 h-8 w-8" style={{ color: C.primary }} />
              <p style={{ color: C.text }}>No habits yet</p>
              <p className="mt-1 text-sm">Add your first habit to start your routine.</p>
              {onAddHabit && (
                <button
                  onClick={onAddHabit}
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                  style={{ backgroundColor: C.primary, color: "#06120B" }}
                >
                  <Plus className="h-4 w-4" />
                  Add a habit
                </button>
              )}
            </div>
          ) : (
            <>
              {isAllDone ? (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl border p-10 text-center"
                  style={{ borderColor: C.border, backgroundColor: C.surface }}
                >
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${C.primary}1A` }}
                  >
                    <Trophy className="h-8 w-8" style={{ color: C.primary }} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold" style={{ color: C.text, ...fontDisplay }}>
                    Perfect Day
                  </h3>
                  <p className="text-sm" style={{ color: C.muted }}>
                    Everything is done. Come back tomorrow to keep the chain going.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: C.muted, ...fontMono }}
                  >
                    To do · {pending.length}
                  </h3>
                  {pending.map((h: any, i: number) => renderRow(h, i === 0))}
                </div>
              )}

              {completed.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: C.muted, ...fontMono }}
                    >
                      Completed · {completed.length}
                    </h3>
                    <span className="text-xs" style={{ color: `${C.muted}99` }}>
                      Tap to undo
                    </span>
                  </div>
                  {completed.map((h: any) => renderRow(h))}
                </div>
              )}

              {onAddHabit && (
                <button
                  onClick={onAddHabit}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-sm font-medium transition hover:border-[var(--c-border-hover)] hover:text-[var(--c-text)]"
                  style={{ borderColor: C.border, color: C.muted }}
                >
                  <Plus className="h-4 w-4" />
                  Add a habit
                </button>
              )}
            </>
          )}
        </section>

        {/* DAILY REFLECTION */}
        <section>
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: C.border, backgroundColor: C.surface }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" style={{ color: C.primary }} />
                <h3 className="text-sm font-semibold" style={{ color: C.text }}>
                  Daily Reflection
                </h3>
              </div>
              <span className="text-xs" style={{ color: `${C.muted}99`, ...fontMono }}>
                {dailyNote.length}/280
              </span>
            </div>
            <textarea
              value={dailyNote}
              maxLength={280}
              onChange={(e) => setDailyNote(e.target.value)}
              placeholder="How did today feel? Any blockers or wins?"
              className="h-24 w-full resize-none rounded-xl border p-3 text-sm outline-none transition-colors focus:border-[var(--c-primary)]/60"
              style={{ borderColor: C.border, backgroundColor: C.surfaceSoft, color: C.text }}
            />
          </div>
        </section>
      </div>

      {/* ================= RIGHT COLUMN ================= */}
      <aside className="space-y-6">
        {/* THIS WEEK */}
        <section
          className="rounded-2xl border p-5"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: C.muted, ...fontMono }}
            >
              This week
            </h3>
            <span className="text-xs" style={{ color: C.muted, ...fontMono }}>
              {weekRate}%
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekOverview.map((d) => {
              const full = d.pct === 100;
              return (
                <div
                  key={d.label}
                  className={`flex flex-col items-center gap-1.5 ${d.isFuture ? "opacity-40" : ""}`}
                >
                  <span
                    className="text-[10px] uppercase"
                    style={{ color: d.isToday ? C.primary : C.muted, ...fontMono }}
                  >
                    {d.label.slice(0, 1)}
                  </span>
                  <div
                    className="h-9 w-9 rounded-full p-[3px] transition-all"
                    style={{
                      background: `conic-gradient(${C.primary} ${d.pct * 3.6}deg, ${C.border} 0deg)`,
                      boxShadow: d.isToday ? `0 0 0 2px ${C.surface}, 0 0 0 3px ${C.primary}` : "none",
                    }}
                    title={`${d.done}/${totalCount} done`}
                  >
                    <div
                      className="flex h-full w-full items-center justify-center rounded-full text-[11px] font-medium"
                      style={{
                        backgroundColor: full ? C.primary : C.surface,
                        color: full ? "#06120B" : d.isToday ? C.text : C.muted,
                        ...fontMono,
                      }}
                    >
                      {full ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : d.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { label: "Best streak", value: `${bestStreak}d`, icon: Flame, color: C.primary },
            { label: "Perfect days", value: String(perfectDays), icon: Trophy, color: C.light },
            { label: "Week check-ins", value: String(weekCheckins), icon: CalendarCheck, color: C.pale },
            { label: "Sparks today", value: `+${completedCount * 5}`, icon: Sparkles, color: "#FBBF24" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl border p-4"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
              >
                <Icon className="h-4 w-4" style={{ color: s.color }} />
                <p className="mt-3 text-2xl" style={{ color: C.text, ...fontMono }}>
                  {s.value}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide" style={{ color: C.muted }}>
                  {s.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* DAILY TIP */}
        <section
          className="rounded-2xl border p-5"
          style={{ borderColor: `${C.primary}33`, backgroundColor: `${C.primary}0D` }}
        >
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" style={{ color: C.primary }} />
            <h3
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: C.primary, ...fontMono }}
            >
              Tip of the day
            </h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: C.text, ...fontDisplay }}>
            {tip}
          </p>
        </section>
      </aside>
    </div>
  );
}
