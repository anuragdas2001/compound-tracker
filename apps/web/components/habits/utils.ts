import { Moon, Sun, Sunrise } from "lucide-react";

import type { HabitLog } from "./types";

export function baseMonday(weekOffset: number) {
  const base = new Date();
  const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  base.setDate(diff + weekOffset * 7);
  return base;
}

export function formatWeekLabel(weekOffset: number) {
  const start = baseMonday(weekOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
}

export function monthStartOffset(year: number, month: number) {
  const first = new Date(year, month, 1);
  const day = first.getDay();
  const add = (8 - day) % 7;
  const firstMonday = new Date(year, month, 1 + add);

  const currentMonday = baseMonday(0);
  currentMonday.setHours(0, 0, 0, 0);

  return Math.round(
    (firstMonday.getTime() - currentMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
}

export function getMonthWeekOffsets(weekOffset: number, count = 4) {
  const viewed = baseMonday(weekOffset);
  const start = monthStartOffset(viewed.getFullYear(), viewed.getMonth());
  return Array.from({ length: count }, (_, i) => start + i);
}

export function getLogicalDate(date: Date = new Date(), dayCutoffHour: number = 0): Date {
  const adjusted = new Date(date);
  if (dayCutoffHour > 0 && adjusted.getHours() < dayCutoffHour) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  return adjusted;
}

export function isDateCompleted(logs: HabitLog[] = [], targetDate: Date, dayCutoffHour: number = 0) {
  const targetLogical = getLogicalDate(targetDate, dayCutoffHour);
  return logs.some((log) => {
    const logDate = getLogicalDate(new Date(log.completedAt), dayCutoffHour);
    return (
      logDate.getFullYear() === targetLogical.getFullYear() &&
      logDate.getMonth() === targetLogical.getMonth() &&
      logDate.getDate() === targetLogical.getDate()
    );
  });
}

export function isDateShielded(
  shields: Array<{ missedDate: string; relatedHabitId?: string | null }> = [],
  targetDate: Date,
  habitId?: string,
  dayCutoffHour: number = 0
) {
  const targetLogical = getLogicalDate(targetDate, dayCutoffHour);
  return shields.some((shield) => {
    if (shield.relatedHabitId && habitId && shield.relatedHabitId !== habitId) {
      return false;
    }
    const sDate = getLogicalDate(new Date(shield.missedDate), dayCutoffHour);
    return (
      sDate.getFullYear() === targetLogical.getFullYear() &&
      sDate.getMonth() === targetLogical.getMonth() &&
      sDate.getDate() === targetLogical.getDate()
    );
  });
}

export function isDateActive(
  logs: HabitLog[] = [],
  shields: Array<{ missedDate: string; relatedHabitId?: string | null }> = [],
  targetDate: Date,
  habitId?: string,
  dayCutoffHour: number = 0
) {
  return isDateCompleted(logs, targetDate, dayCutoffHour) || isDateShielded(shields, targetDate, habitId, dayCutoffHour);
}

export function getWeek(habit: { logs: HabitLog[] }, weekOffset: number, dayCutoffHour: number = 0) {
  const start = baseMonday(weekOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + i);
    return isDateCompleted(habit.logs, targetDate, dayCutoffHour);
  });
}

export function currentStreak(days: boolean[]) {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]) streak++;
    else break;
  }
  return streak;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sunrise };
  if (hour < 17) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
}

export function habitStreak(
  logs: HabitLog[] = [],
  shields: Array<{ missedDate: string; relatedHabitId?: string | null }> = [],
  habitId?: string,
  dayCutoffHour: number = 0
) {
  const d = getLogicalDate(new Date(), dayCutoffHour);
  if (!isDateActive(logs, shields, d, habitId, dayCutoffHour)) d.setDate(d.getDate() - 1);

  let n = 0;
  while (isDateActive(logs, shields, d, habitId, dayCutoffHour) && n < 366) {
    n++;
    d.setDate(d.getDate() - 1);
  }

  return n;
}
