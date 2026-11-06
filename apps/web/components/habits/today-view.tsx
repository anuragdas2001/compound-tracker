"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  Check,
  Flame,
  MessageSquare,
  Minus,
  Plus,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { useShieldUsages } from "@repo/query/gamification/useGamificationMutations";
import { useDailyNote } from "@repo/query/habits/useHabits";
import { useSaveDailyNote, useUpdateProgress } from "@repo/query/habits/useMutations";
import { toast } from "react-hot-toast";

import { C, fontDisplay, fontMono, weekDays } from "./constants";
import type { Habit } from "./types";
import {
  baseMonday,
  getDateValue,
  habitStreak,
  isDateCompleted,
  isScheduledToday,
} from "./utils";

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

export function TodayView({
  habits,
  todayIndex,
  toggleDay,
  greeting,
  GreetingIcon,
  onAddHabit,
}: TodayViewProps) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const { data: shieldUsages = [] } = useShieldUsages(userId);

  const todayKey = useMemo(() => {
    return new Date().toISOString().split("T")[0] || "";
  }, []);

  // Persistent Daily Note integration
  const { data: serverNote } = useDailyNote(userId, todayKey);
  const saveNoteMutation = useSaveDailyNote();
  const [noteContent, setNoteContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (serverNote?.content !== undefined) {
      setNoteContent(serverNote.content);
    }
  }, [serverNote]);

  const handleNoteChange = (text: string) => {
    setNoteContent(text);
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (!userId) return;
      saveNoteMutation.mutate(
        { userId, dateKey: todayKey, content: text },
        {
          onSuccess: () => {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2500);
          },
          onError: () => {
            setSaveStatus("idle");
            toast.error("Failed to save reflection note.");
          },
        }
      );
    }, 800);
  };

  // Progress mutation for numeric / counter habits
  const updateProgressMutation = useUpdateProgress();

  // Optimistic UI for counter and toggle states
  const [optimisticValues, setOptimisticValues] = useState<Record<string, number>>({});

  const todayDate = useMemo(() => new Date(), []);

  const todayHabits = habits.map((h: any) => {
    const isCount = h.goal === "count";
    const targetVal = isCount ? h.target || 1 : 1;
    const serverVal = getDateValue(h.logs || [], todayDate);
    const currentVal: number =
      (optimisticValues[h.id] !== undefined ? optimisticValues[h.id] : serverVal) ?? 0;
    const done = isCount ? currentVal >= targetVal : currentVal > 0;
    const scheduled = isScheduledToday(h, todayIndex);

    // Flex calculations
    let flexProgress = "";
    if (h.mode === "flex") {
      const monday = baseMonday(0);
      let weekCount = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        if (isDateCompleted(h.logs || [], d, 0, h.target || 1, h.goal || "done")) {
          weekCount++;
        }
      }
      const targetWeekly = h.perWeek || 3;
      flexProgress = `${weekCount}/${targetWeekly} this wk`;
    }

    return {
      ...h,
      done,
      currentVal,
      targetVal,
      isCount,
      scheduled,
      flexProgress,
      streak: habitStreak(h.logs || [], shieldUsages, h.id, 0, h),
    };
  });

  const handleToggle = (habit: any) => {
    if (!habit.scheduled && !habit.done && habit.mode !== "flex") {
      toast.error(`"${habit.name}" is not scheduled for today.`);
      return;
    }

    const nextVal = habit.done ? 0 : habit.targetVal;
    setOptimisticValues((prev) => ({ ...prev, [habit.id]: nextVal }));

    if (habit.isCount) {
      updateProgressMutation.mutate({ id: habit.id, value: nextVal });
    } else {
      toggleDay(habit.id);
    }
  };

  const handleIncrement = (e: React.MouseEvent, habit: any) => {
    e.stopPropagation();
    const nextVal = habit.currentVal + 1;
    setOptimisticValues((prev) => ({ ...prev, [habit.id]: nextVal }));
    updateProgressMutation.mutate({ id: habit.id, value: nextVal });
  };

  const handleDecrement = (e: React.MouseEvent, habit: any) => {
    e.stopPropagation();
    if (habit.currentVal <= 0) return;
    const nextVal = Math.max(0, habit.currentVal - 1);
    setOptimisticValues((prev) => ({ ...prev, [habit.id]: nextVal }));
    updateProgressMutation.mutate({ id: habit.id, value: nextVal });
  };

  const pending = todayHabits.filter((h: any) => (h.scheduled || h.mode === "flex") && !h.done);
  const completed = todayHabits.filter((h: any) => h.done);
  const restHabits = todayHabits.filter((h: any) => !h.scheduled && h.mode !== "flex" && !h.done);

  const completedCount = completed.length;
  const dueCount = todayHabits.filter((h: any) => h.scheduled || h.mode === "flex" || h.done).length;
  const progress =
    dueCount === 0 ? (todayHabits.length > 0 ? 100 : 0) : Math.round((completedCount / dueCount) * 100);
  const isAllDone = dueCount > 0 && pending.length === 0;

  /* --- Week overview (Mon..Sun) --- */
  const monday = baseMonday(0);
  const weekOverview = weekDays.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const isToday = i === todayIndex;
    const isFuture = i > todayIndex;
    const scheduledForDay = habits.filter((h: any) => {
      if (h.mode === "days" && Array.isArray(h.days) && h.days.length > 0) {
        return h.days.includes(i);
      }
      return true;
    });
    const dayTarget = scheduledForDay.length;
    const done = isToday
      ? completedCount
      : habits.filter((h: any) => isDateCompleted(h.logs || [], date, 0, h.target || 1, h.goal || "done")).length;
    const pct = dayTarget === 0 || isFuture ? 0 : Math.min(100, Math.round((done / dayTarget) * 100));
    return { label, date: date.getDate(), isToday, isFuture, done, dayTarget, pct };
  });

  const weekCheckins = weekOverview.reduce((acc, d) => acc + d.done, 0);
  const pastDaysOverview = weekOverview.slice(0, todayIndex + 1);
  const weekPossible = pastDaysOverview.reduce((acc, d) => acc + d.dayTarget, 0);
  const weekRate = weekPossible === 0 ? 0 : Math.min(100, Math.round((weekCheckins / weekPossible) * 100));
  const perfectDays = pastDaysOverview.filter((d) => d.pct === 100 && d.dayTarget > 0).length;
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

  const headline = habits.length === 0
    ? "Ready to build?"
    : isAllDone
    ? "You crushed it."
    : completedCount === 0
    ? "Ready to build?"
    : "Keep going!";

  const subline = habits.length === 0
    ? "Add your first habit to get started."
    : isAllDone
    ? "All scheduled habits completed for today. Rest up!"
    : `${pending.length} ${pending.length === 1 ? "habit" : "habits"} left today. Tap one to check it off.`;

  const renderRow = (habit: any, isNext = false, isRest = false) => {
    const isCount = habit.isCount;
    const percentDone = Math.min(100, Math.round((habit.currentVal / Math.max(1, habit.targetVal)) * 100));

    return (
      <div
        key={habit.id}
        onClick={() => handleToggle(habit)}
        className={`group relative flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
          isRest && !habit.done
            ? "cursor-not-allowed opacity-60 border-dashed"
            : "hover:border-[var(--c-border-hover)] active:scale-[0.99]"
        }`}
        style={{
          borderColor: isNext ? `${C.primary}55` : C.border,
          backgroundColor: habit.done ? C.surface : isRest ? "transparent" : C.surfaceSoft,
        }}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Completion Checkmark / Circular Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(habit);
            }}
            disabled={isRest && !habit.done}
            aria-label={`${habit.done ? "Undo" : "Complete"} ${habit.name}`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
              habit.done
                ? ""
                : isRest
                ? "border-dashed"
                : "group-hover:border-[var(--c-primary)] group-hover:bg-[var(--c-primary)]/10"
            }`}
            style={{
              borderColor: habit.done ? C.primary : isRest ? `${C.borderHover}80` : C.borderHover,
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
          </button>

          {/* Habit Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`truncate font-medium transition-colors ${habit.done ? "line-through text-[var(--c-muted)]" : "text-[var(--c-text)]"}`}
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

              {habit.mode === "flex" && (
                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                  style={{ borderColor: `${C.primary}40`, backgroundColor: `${C.primary}15`, color: C.primary, ...fontMono }}
                >
                  {habit.flexProgress}
                </span>
              )}

              {isRest && (
                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                  style={{ borderColor: C.border, backgroundColor: C.surface, color: C.muted, ...fontMono }}
                >
                  Rest day
                </span>
              )}
            </div>

            {/* Target & Progress bar for numeric counter habits */}
            {isCount ? (
              <div className="mt-2 space-y-1.5 max-w-xs">
                <div className="flex items-center justify-between text-xs font-medium" style={fontMono}>
                  <span style={{ color: habit.done ? C.primary : C.muted }}>
                    {habit.currentVal} / {habit.targetVal} {habit.unit || "units"}
                  </span>
                  <span style={{ color: C.muted }}>{percentDone}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--c-surface)] rounded-full overflow-hidden border border-[var(--c-border)]/60">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percentDone}%`,
                      backgroundColor: habit.done ? C.primary : "var(--c-primary)",
                    }}
                  />
                </div>
              </div>
            ) : habit.category ? (
              <span className="mt-1 flex items-center gap-1 text-xs" style={{ color: C.muted }}>
                <Zap className="h-3 w-3 text-[var(--c-primary)]" />
                {habit.category}
              </span>
            ) : null}
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--c-border)]/50">
          {/* Numeric Increment / Decrement Counter Buttons */}
          {isCount && !isRest && (
            <div
              className="flex items-center gap-1.5 bg-[var(--c-surface)] p-1 rounded-xl border border-[var(--c-border)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => handleDecrement(e, habit)}
                disabled={habit.currentVal <= 0}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--c-surface-soft)] text-[var(--c-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Decrease count"
              >
                <Minus size={13} />
              </button>
              <span className="w-8 text-center text-xs font-bold" style={fontMono}>
                {habit.currentVal}
              </span>
              <button
                type="button"
                onClick={(e) => handleIncrement(e, habit)}
                className="h-7 w-7 flex items-center justify-center rounded-lg bg-[var(--c-primary)]/15 text-[var(--c-primary)] hover:bg-[var(--c-primary)]/25 transition-colors font-bold"
                title="Increase count"
              >
                <Plus size={13} />
              </button>
            </div>
          )}

          {/* Streak Badge */}
          {habit.streak > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
              style={{ borderColor: `${C.primary}33`, backgroundColor: `${C.primary}1A`, color: C.primary }}
              title={`${habit.streak}-streak`}
            >
              <Flame className="h-3 w-3" />
              {habit.streak}
            </span>
          )}

          {!habit.done && !isRest && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
              <Sparkles className="h-3 w-3" />+5
            </span>
          )}
        </div>
      </div>
    );
  };

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
              {habits.length === 0 ? "Add your first habit to get started." : subline}
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
                {completedCount}/{dueCount}
              </span>
            </div>
          </div>
        </section>

        {/* HABITS */}
        <section className="space-y-6">
          {habits.length === 0 ? (
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
              {isAllDone && (
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
                    Everything scheduled for today is done. Come back tomorrow to keep the chain going.
                  </p>
                </div>
              )}

              {pending.length > 0 && (
                <div className="space-y-3">
                  <h3
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: C.muted, ...fontMono }}
                  >
                    To do · {pending.length}
                  </h3>
                  {pending.map((h: any, i: number) => renderRow(h, i === 0, false))}
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
                      Tap to undo or edit count
                    </span>
                  </div>
                  {completed.map((h: any) => renderRow(h, false, false))}
                </div>
              )}

              {restHabits.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: C.muted, ...fontMono }}
                    >
                      Rest Day · {restHabits.length}
                    </h3>
                    <span className="text-xs" style={{ color: `${C.muted}99` }}>
                      Not scheduled for today
                    </span>
                  </div>
                  {restHabits.map((h: any) => renderRow(h, false, true))}
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

        {/* DAILY REFLECTION - PERSISTED IN DATABASE */}
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
              <div className="flex items-center gap-3">
                {saveStatus === "saving" && (
                  <span className="text-xs text-amber-400 animate-pulse font-medium">Saving...</span>
                )}
                {saveStatus === "saved" && (
                  <span className="text-xs text-[var(--c-primary)] font-medium">Saved to database ✓</span>
                )}
                <span className="text-xs" style={{ color: `${C.muted}99`, ...fontMono }}>
                  {noteContent.length}/280
                </span>
              </div>
            </div>
            <textarea
              value={noteContent}
              maxLength={280}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="How did today feel? Any blockers or wins? (Persisted to your journal)"
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
              const full = d.pct === 100 && d.dayTarget > 0;
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
                    title={`${d.done}/${d.dayTarget} done`}
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
