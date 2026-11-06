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

export function getDateLog(logs: HabitLog[] = [], targetDate: Date, dayCutoffHour: number = 0): HabitLog | undefined {
  const targetLogical = getLogicalDate(targetDate, dayCutoffHour);
  return logs.find((log) => {
    const logDate = getLogicalDate(new Date(log.completedAt), dayCutoffHour);
    return (
      logDate.getFullYear() === targetLogical.getFullYear() &&
      logDate.getMonth() === targetLogical.getMonth() &&
      logDate.getDate() === targetLogical.getDate()
    );
  });
}

export function getDateValue(logs: HabitLog[] = [], targetDate: Date, dayCutoffHour: number = 0): number {
  const log = getDateLog(logs, targetDate, dayCutoffHour);
  return log?.value ?? (log ? 1 : 0);
}

export function isDateCompleted(
  logs: HabitLog[] = [],
  targetDate: Date,
  dayCutoffHour: number = 0,
  target: number = 1,
  goal: string = "done"
) {
  const log = getDateLog(logs, targetDate, dayCutoffHour);
  if (!log) return false;
  if (goal === "count") {
    return (log.value ?? 1) >= (target || 1);
  }
  return true;
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
  dayCutoffHour: number = 0,
  target: number = 1,
  goal: string = "done"
) {
  return isDateCompleted(logs, targetDate, dayCutoffHour, target, goal) || isDateShielded(shields, targetDate, habitId, dayCutoffHour);
}

export function getWeek(
  habit: { logs: HabitLog[]; target?: number; goal?: string },
  weekOffset: number,
  dayCutoffHour: number = 0
) {
  const start = baseMonday(weekOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + i);
    return isDateCompleted(habit.logs, targetDate, dayCutoffHour, habit.target || 1, habit.goal || "done");
  });
}

export function getWeekValues(
  habit: { logs: HabitLog[] },
  weekOffset: number,
  dayCutoffHour: number = 0
) {
  const start = baseMonday(weekOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + i);
    return getDateValue(habit.logs, targetDate, dayCutoffHour);
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

export function isScheduledToday(
  habit: { mode?: string; days?: number[]; perWeek?: number; logs?: HabitLog[] },
  todayIndex: number,
  dayCutoffHour: number = 0
): boolean {
  if (habit.mode === "days" && Array.isArray(habit.days) && habit.days.length > 0) {
    return habit.days.includes(todayIndex);
  }
  if (habit.mode === "flex") {
    // Count completions this current week
    const monday = baseMonday(0);
    let completionsThisWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      if (isDateCompleted(habit.logs || [], d, dayCutoffHour)) {
        completionsThisWeek++;
      }
    }
    const targetPerWeek = habit.perWeek || 3;
    // Scheduled if target not yet reached this week, or already completed today
    const doneToday = isDateCompleted(habit.logs || [], new Date(), dayCutoffHour);
    return completionsThisWeek < targetPerWeek || doneToday;
  }
  return true;
}

export function habitStreak(
  logs: HabitLog[] = [],
  shields: Array<{ missedDate: string; relatedHabitId?: string | null }> = [],
  habitId?: string,
  dayCutoffHour: number = 0,
  habitMeta?: { mode?: string; days?: number[]; perWeek?: number; target?: number; goal?: string }
) {
  const target = habitMeta?.target || 1;
  const goal = habitMeta?.goal || "done";

  // Flex mode streak: count consecutive completed weeks
  if (habitMeta?.mode === "flex") {
    const perWeek = habitMeta.perWeek || 3;
    let weeksStreak = 0;

    // Check week 0 (this week)
    let thisWeekCount = 0;
    const mondayThisWeek = baseMonday(0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayThisWeek);
      d.setDate(mondayThisWeek.getDate() + i);
      if (isDateActive(logs, shields, d, habitId, dayCutoffHour, target, goal)) {
        thisWeekCount++;
      }
    }

    if (thisWeekCount >= perWeek) {
      weeksStreak++;
    }

    // Check prior consecutive weeks
    for (let w = 1; w < 52; w++) {
      let weekCount = 0;
      const mon = baseMonday(-w);
      for (let i = 0; i < 7; i++) {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        if (isDateActive(logs, shields, d, habitId, dayCutoffHour, target, goal)) {
          weekCount++;
        }
      }
      if (weekCount >= perWeek) {
        weeksStreak++;
      } else {
        break;
      }
    }
    return weeksStreak;
  }

  // Days mode streak: unbroken chain of scheduled days
  if (habitMeta?.mode === "days" && Array.isArray(habitMeta.days) && habitMeta.days.length > 0) {
    const scheduledDays = habitMeta.days;
    const d = getLogicalDate(new Date(), dayCutoffHour);
    const todayDayIndex = (d.getDay() + 6) % 7;

    // If today is scheduled and not active, start from the previous scheduled day
    if (scheduledDays.includes(todayDayIndex) && !isDateActive(logs, shields, d, habitId, dayCutoffHour, target, goal)) {
      d.setDate(d.getDate() - 1);
    } else if (!scheduledDays.includes(todayDayIndex)) {
      d.setDate(d.getDate() - 1);
    }

    let n = 0;
    let safety = 0;
    while (safety < 366) {
      safety++;
      const dayIdx = (d.getDay() + 6) % 7;
      if (scheduledDays.includes(dayIdx)) {
        if (isDateActive(logs, shields, d, habitId, dayCutoffHour, target, goal)) {
          n++;
        } else {
          break;
        }
      }
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  // Daily mode streak: standard daily continuity
  const d = getLogicalDate(new Date(), dayCutoffHour);
  if (!isDateActive(logs, shields, d, habitId, dayCutoffHour, target, goal)) d.setDate(d.getDate() - 1);

  let n = 0;
  while (isDateActive(logs, shields, d, habitId, dayCutoffHour, target, goal) && n < 366) {
    n++;
    d.setDate(d.getDate() - 1);
  }

  return n;
}
