"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useSparksState } from "../../store/gamification";
import { Plus, Sparkles } from "lucide-react";
import { useHabits } from "@repo/query/habits/useHabits";
import { useCreateHabit, useDeleteHabit, useToggleHabit } from "@repo/query/habits/useMutations";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";

import { AddHabitModal } from "../../components/habits/add-habit-modal";
import { C } from "../../components/habits/constants";
import type { HabitTabId } from "../../components/habits/constants";
import { HabitTabs } from "../../components/habits/habit-tabs";
import { InsightsView } from "../../components/habits/insights-view";
import { SettingsView } from "../../components/habits/settings-view";
import { StoreView } from "../../components/habits/store-view";
import { TodayView } from "../../components/habits/today-view";
import type { Habit, HabitRow } from "../../components/habits/types";
import { baseMonday, currentStreak, getGreeting, getWeek } from "../../components/habits/utils";

type FetchedHabit = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  time?: string | null;
  logs?: Habit["logs"] | null;
};

export default function MomentumApp() {
  const [activeTab, setActiveTab] = useState<HabitTabId>("Insights");
  const { data: fetchedHabits = [] } = useHabits();
  const createHabitMutation = useCreateHabit();
  const deleteHabitMutation = useDeleteHabit();
  const toggleHabitMutation = useToggleHabit();

  const habits: Habit[] = useMemo(() => {
    return (fetchedHabits as FetchedHabit[]).map((h) => ({
      id: h.id,
      name: h.title || h.name || "",
      category: h.description || h.time || undefined,
      best: 0,
      logs: h.logs || [],
    }));
  }, [fetchedHabits]);

  const [sparks, setSparks] = useSparksState();
  const [primaryColor, setPrimaryColor] = useState("22, 163, 74");

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [weekOffset, setWeekOffset] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const todayIndex = (new Date().getDay() + 6) % 7;
  const [dailyNote, setDailyNote] = useState("");

  const [ownedThemes, setOwnedThemes] = useState(["green"]);
  const [activeTheme, setActiveTheme] = useState("green");

  const toggleDay = (habitId: string, dayIndex: number, weekOff: number = weekOffset) => {
    const start = baseMonday(weekOff);
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + dayIndex);

    toggleHabitMutation.mutate(
      { id: habitId, completedAt: targetDate.toISOString() },
      {
        onSuccess: (data: unknown) => {
          const status =
            typeof data === "object" && data !== null && "status" in data
              ? data.status
              : undefined;

          if (status === "completed") setSparks((s) => s + 5);
          else setSparks((s) => Math.max(0, s - 5));
        },
      }
    );
  };

  const deleteHabit = (habitId: string) => {
    deleteHabitMutation.mutate(habitId);
    setMenuOpenId(null);
  };

  const addHabit = () => {
    if (!newName.trim()) return;

    createHabitMutation.mutate(
      {
        title: newName.trim(),
        description: newCategory.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewCategory("");
          setAddOpen(false);
        },
      }
    );
  };

  const habitRows = useMemo<HabitRow[]>(
    () =>
      habits.map((habit) => {
        const week = getWeek(habit, weekOffset);
        const streak = currentStreak(week);
        return { ...habit, week, streak, best: Math.max(habit.best, streak) };
      }),
    [habits, weekOffset]
  );

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const habitViews = {
    Today: (
      <TodayView
        habits={habits}
        todayIndex={todayIndex}
        toggleDay={(id) => toggleDay(id, todayIndex, 0)}
        greeting={greeting.text}
        GreetingIcon={GreetingIcon}
        dailyNote={dailyNote}
        setDailyNote={setDailyNote}
        onAddHabit={() => setAddOpen(true)}
      />
    ),
    Insights: (
      <InsightsView
        habits={habits}
        habitRows={habitRows}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        toggleDay={toggleDay}
        deleteHabit={deleteHabit}
        menuOpenId={menuOpenId}
        setMenuOpenId={setMenuOpenId}
      />
    ),
    Store: (
      <StoreView
        sparks={sparks}
        setSparks={setSparks}
        ownedThemes={ownedThemes}
        setOwnedThemes={setOwnedThemes}
        activeTheme={activeTheme}
        setActiveTheme={(id, color) => {
          setActiveTheme(id);
          setPrimaryColor(color);
        }}
      />
    ),
    Settings: <SettingsView habits={habits} deleteHabit={deleteHabit} />,
  } satisfies Record<HabitTabId, ReactNode>;

  return (
    <div
      className="min-h-screen font-sans text-[var(--c-text)] transition-colors duration-500"
      style={{
        "--color-primary": primaryColor,
        backgroundColor: C.bg,
        backgroundImage:
          "linear-gradient(var(--c-grid) 1px, transparent 1px), linear-gradient(90deg, var(--c-grid) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      } as CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500&display=swap"
      />

      <main className="mx-auto max-w-7xl space-y-8 px-6 pt-16 pb-10 lg:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-muted)]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              HABIT MANAGEMENT
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-[var(--c-text)] sm:text-5xl" style={{ fontFamily: "'Fraunces', serif" }}>
              Your Chain
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Button
              type="button"
              onClick={() => setAddOpen(true)}
              className="group h-12 rounded-full bg-[#22C55E] px-5 font-medium text-[#06120B] transition hover:bg-[#4ADE80] active:scale-95"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>New Habit</span>
            </Button>
          </div>
        </div>

        <HabitTabs activeTab={activeTab} onTabChange={setActiveTab} views={habitViews} />
      </main>

      {addOpen && (
        <AddHabitModal
          newName={newName}
          setNewName={setNewName}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          onClose={() => setAddOpen(false)}
          onCreate={addHabit}
        />
      )}
    </div>
  );
}
