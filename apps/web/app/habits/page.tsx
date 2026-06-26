"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  User,
  Target,
  TrendingUp,
  CalendarCheck,
  Trophy,
  Flame,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Zap,
  BarChart3,
  Award,
  Settings,
  X,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Palette,
  Bell,
  Download,
  LogOut,
  Sparkles,
  Lock,
  Unlock,
  MessageSquare,
} from "lucide-react";

/* ----------------------------------------------------------------------- */
/* Types & Initial Data                                                    */
/* ----------------------------------------------------------------------- */

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const navItems = [
  { label: "Today", icon: Zap, id: "Today" },
  { label: "Insights", icon: BarChart3, id: "Insights" },
  { label: "Store", icon: Award, id: "Store" },
  { label: "Settings", icon: Settings, id: "Settings" },
];

type WeekHistory = Record<number, boolean[]>;

type Habit = {
  id: string;
  name: string;
  best: number;
  time?: string;
  history: WeekHistory;
};

const initialHabits: Habit[] = [
  {
    id: "1",
    name: "Meditation",
    best: 12,
    time: "07:00 AM",
    history: { 0: [true, true, false, true, true, true, true] },
  },
  {
    id: "2",
    name: "Workout",
    best: 18,
    time: "06:00 PM",
    history: { 0: [false, true, true, false, true, true, false] },
  },
  {
    id: "3",
    name: "Reading",
    best: 22,
    time: "09:00 PM",
    history: { 0: [true, true, true, true, true, true, false] },
  },
  {
    id: "4",
    name: "Coding",
    best: 41,
    history: { 0: [false, true, false, false, false, true, false] },
  },
];

/* ----------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ----------------------------------------------------------------------- */

function baseMonday(weekOffset: number) {
  const base = new Date();
  const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  base.setDate(diff + weekOffset * 7);
  return base;
}

function formatWeekLabel(weekOffset: number) {
  const start = baseMonday(weekOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

function getWeek(habit: Habit, weekOffset: number) {
  return habit.history[weekOffset] ?? Array(7).fill(false);
}

function currentStreak(days: boolean[]) {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]) streak++;
    else break;
  }
  return streak;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sunrise };
  if (hour < 17) return { text: "Good afternoon", icon: Sun };
  return { text: "Good evening", icon: Moon };
}

/* ----------------------------------------------------------------------- */
/* Main Application Component                                              */
/* ----------------------------------------------------------------------- */

export default function MomentumApp() {
  // Global State
  const [activeTab, setActiveTab] = useState("Insights");
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [sparks, setSparks] = useState(150);
  const [primaryColor, setPrimaryColor] = useState("22, 163, 74");

  // UI State
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("");

  // Insights State
  const [weekOffset, setWeekOffset] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Today State
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [dailyNote, setDailyNote] = useState("");

  // Store State
  const [ownedThemes, setOwnedThemes] = useState(["green"]);
  const [activeTheme, setActiveTheme] = useState("green");

  /* --- Actions --- */
  const toggleDay = (habitId: string, dayIndex: number, weekOff: number = weekOffset) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const week = getWeek(habit, weekOff);
        const done = !week[dayIndex];
        const updatedWeek = week.map((d, i) => (i === dayIndex ? done : d));

        if (done) setSparks((s) => s + 5);
        else setSparks((s) => Math.max(0, s - 5));

        return {
          ...habit,
          history: { ...habit.history, [weekOff]: updatedWeek },
        };
      })
    );
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setMenuOpenId(null);
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        best: 0,
        time: newTime.trim() || undefined,
        history: { 0: Array(7).fill(false) },
      },
    ]);
    setNewName("");
    setNewTime("");
    setAddOpen(false);
  };

  /* --- Derived Data --- */
  const habitRows = useMemo(
    () =>
      habits.map((habit) => {
        const week = getWeek(habit, weekOffset);
        const streak = currentStreak(week);
        return { ...habit, week, streak, best: Math.max(habit.best, streak) };
      }),
    [habits, weekOffset]
  );

  const GreetingIcon = getGreeting().icon;

  const renderView = () => {
    switch (activeTab) {
      case "Today":
        return (
          <TodayView
            habits={habits}
            todayIndex={todayIndex}
            toggleDay={(id: string) => toggleDay(id, todayIndex, 0)}
            greeting={getGreeting().text}
            GreetingIcon={GreetingIcon}
            dailyNote={dailyNote}
            setDailyNote={setDailyNote}
          />
        );
      case "Insights":
        return (
          <InsightsView
            habits={habits}
            habitRows={habitRows}
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
            toggleDay={toggleDay}
            deleteHabit={deleteHabit}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            primaryColor={primaryColor}
          />
        );
      case "Store":
        return (
          <StoreView
            sparks={sparks}
            setSparks={setSparks}
            ownedThemes={ownedThemes}
            setOwnedThemes={setOwnedThemes}
            activeTheme={activeTheme}
            setActiveTheme={(id: string, color: string) => {
              setActiveTheme(id);
              setPrimaryColor(color);
            }}
          />
        );
      case "Settings":
        return <SettingsView habits={habits} deleteHabit={deleteHabit} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="relative min-h-screen bg-[#070907] text-zinc-100 overflow-x-hidden font-sans transition-colors duration-500"
      style={{ "--color-primary": primaryColor } as React.CSSProperties}
    >
      {/* 1. Dynamic Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none transition-colors duration-500"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(var(--color-primary), 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--color-primary), 0.08) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* 2. Dynamic Hero Glow */}
      {/* <div
        className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[70%] h-[50%] rounded-full blur-[140px] opacity-[0.15] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: `rgb(${primaryColor})` }}
      /> */}

<div className="hero-glow" />


      <header className="sticky top-0 z-40 border-b border-zinc-800/50 bg-[#070907]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
              <User className="h-5 w-5" style={{ color: `rgb(${primaryColor})` }} />
            </div>
            <span
              className="text-2xl font-extrabold tracking-tighter"
              style={{ color: `rgb(${primaryColor})` }}
            >
              Compound
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-opacity-10 text-opacity-100"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `rgba(${primaryColor}, 0.1)`,
                          color: `rgb(${primaryColor})`,
                        }
                      : {}
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-400">
              <Sparkles className="h-4 w-4" />
              {sparks}
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: `rgb(${primaryColor})`,
                boxShadow: `0 4px 14px 0 rgba(${primaryColor}, 0.2)`,
              }}
            >
              <Plus className="h-4 w-4" />
              Add Habit
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-8 py-10">
        {renderView()}
      </main>

      {/* MODAL */}
      {addOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setAddOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">New Habit</h3>
              <button
                onClick={() => setAddOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Name
                </label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Drink water"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Scheduled Time (Optional)
                </label>
                <input
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 08:00 AM"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>
            </div>

            <button
              onClick={addHabit}
              disabled={!newName.trim()}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: `rgb(${primaryColor})` }}
            >
              Create Habit
            </button>
          </div>
        </div>
      )}

      {/* 3. Liquid Fill Styling preserved from original */}
      <style jsx global>{`
        .liquid-fill {
          position: relative;
          overflow: hidden;
          background: rgba(var(--color-primary), 0.18);
        }
        .liquid-fill::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgb(var(--color-primary)) 0%,
            rgba(var(--color-primary), 0.8) 100%
          );
          box-shadow: inset 0 0 10px rgba(var(--color-primary), 0.6),
            0 0 15px rgba(var(--color-primary), 0.35);
          animation: fill-rise 0.45s ease-out forwards;
        }
        @keyframes fill-rise {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0%);
          }
        }
      `}</style>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* View Components                                                         */
/* ----------------------------------------------------------------------- */

// 1. TODAY VIEW
function TodayView({
  habits,
  todayIndex,
  toggleDay,
  greeting,
  GreetingIcon,
  dailyNote,
  setDailyNote,
}: any) {
  const todayHabits = habits.map((h: any) => ({
    ...h,
    done: h.history[0]?.[todayIndex] || false,
  }));

  const completedCount = todayHabits.filter((h: any) => h.done).length;
  const totalCount = todayHabits.length;
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  const sortedHabits = [...todayHabits].sort(
    (a, b) => Number(a.done) - Number(b.done)
  );

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="mb-10 flex items-center justify-between rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-8 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <GreetingIcon className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              {greeting}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100">
            {progress === 100 ? "You crushed it." : "Ready to build?"}
          </h1>
          <p className="mt-2 text-zinc-400">
            {progress === 100
              ? "All habits completed for today. Rest up!"
              : `You've completed ${completedCount} out of ${totalCount} habits today.`}
          </p>
        </div>

        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className="text-zinc-800 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
            />
            <circle
              className="stroke-current transition-all duration-1000 ease-out"
              style={{ color: `rgb(var(--color-primary))` }}
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-zinc-100">{progress}%</span>
          </div>
        </div>
      </section>

      <section className="space-y-3 mb-10">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4">
          Your Action Plan
        </h3>

        {totalCount === 0 ? (
          <div className="text-center p-10 border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/20 backdrop-blur-md">
            <p className="text-zinc-400">
              No habits added yet. Start building your routine!
            </p>
          </div>
        ) : isAllDone ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
            <div
              className="h-16 w-16 mb-4 rounded-full flex items-center justify-center bg-opacity-10"
              style={{ backgroundColor: `rgba(var(--color-primary), 0.1)` }}
            >
              <Trophy
                className="h-8 w-8"
                style={{ color: `rgb(var(--color-primary))` }}
              />
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Perfect Day</h3>
            <p className="text-zinc-400 text-sm">
              You earned bonus Sparks for completing everything.
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          {sortedHabits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => toggleDay(habit.id)}
              className={`w-full group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 backdrop-blur-sm ${
                habit.done
                  ? "border-zinc-800/50 bg-zinc-900/20 opacity-60 scale-[0.98]"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                    habit.done
                      ? "border-transparent text-white"
                      : "border-zinc-700 text-zinc-600 group-hover:border-zinc-500"
                  }`}
                  style={
                    habit.done
                      ? { backgroundColor: `rgb(var(--color-primary))` }
                      : {}
                  }
                >
                  <CheckCircle
                    className={`h-5 w-5 ${
                      habit.done ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
                <div className="text-left">
                  <h4
                    className={`font-semibold ${
                      habit.done
                        ? "text-zinc-500 line-through decoration-zinc-600"
                        : "text-zinc-100"
                    }`}
                  >
                    {habit.name}
                  </h4>
                  {habit.time && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {habit.time}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md p-6">
          <div className="flex items-center gap-2 mb-4 text-zinc-300">
            <MessageSquare className="h-4 w-4 text-zinc-500" />
            <h3 className="font-semibold text-sm">Daily Reflection</h3>
          </div>
          <textarea
            value={dailyNote}
            onChange={(e) => setDailyNote(e.target.value)}
            placeholder="How did today feel? Any blockers or wins?"
            className="w-full h-24 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
          />
        </div>
      </section>
    </div>
  );
}

// 2. INSIGHTS VIEW
function InsightsView({
  habits,
  habitRows,
  weekOffset,
  setWeekOffset,
  toggleDay,
  deleteHabit,
  menuOpenId,
  setMenuOpenId,
}: any) {
  const weekDates = useMemo(() => {
    const start = baseMonday(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const totalCompleted = habitRows.reduce(
    (acc: number, h: any) => acc + h.week.filter(Boolean).length,
    0
  );
  const totalPossible = habits.length * 7 || 1;
  const completionRate = Math.round((totalCompleted / totalPossible) * 100);
  const overallBest = habitRows.length
    ? Math.max(...habitRows.map((h: any) => h.best))
    : 0;

  const dailyCompletion = useMemo(
    () =>
      weekDays.map((_, i) => {
        if (!habits.length) return 0;
        const done = habitRows.filter((h: any) => h.week[i]).length;
        return Math.round((done / habits.length) * 100);
      }),
    [habitRows, habits.length]
  );

  const peakValue = Math.max(...dailyCompletion);
  const topHabits = [...habitRows].sort((a, b) => b.streak - a.streak).slice(0, 3);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Global Status
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Active Habits"
            value={String(habits.length).padStart(2, "0")}
            icon={Target}
          />
          <StatCard
            label="Completion"
            value={`${completionRate}%`}
            icon={TrendingUp}
          />
          <StatCard
            label="Check-ins"
            value={String(totalCompleted)}
            icon={CalendarCheck}
          />
          <StatCard
            label="Best Streak"
            value={String(overallBest)}
            icon={Trophy}
          />
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-100">
              Momentum Board
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {formatWeekLabel(weekOffset)}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWeekOffset((w: number) => w - 1)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 hover:text-zinc-200 backdrop-blur-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setWeekOffset((w: number) => w + 1)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 hover:text-zinc-200 backdrop-blur-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#070907]/60 backdrop-blur-md shadow-2xl">
          {habits.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-zinc-300">No habits yet.</p>
              <p className="mt-1 text-sm text-zinc-500">
                Add your first one to start building a streak.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[240px_1fr] border-b border-zinc-800/50 px-6 py-4">
                <div />
                <div className="grid grid-cols-7">
                  {weekDates.map((date, i) => (
                    <div key={i} className="text-center">
                      <div className="text-sm text-zinc-500">{weekDays[i]}</div>
                      <div className="mt-0.5 text-xs text-zinc-600">
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {habitRows.map((habit: any) => (
                <div
                  key={habit.id}
                  className="grid grid-cols-[240px_1fr] items-center border-b border-zinc-800/30 px-6 py-5 transition-colors last:border-0 hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between pr-6">
                    <div>
                      <h3 className="font-semibold text-zinc-200">
                        {habit.name}
                      </h3>
                      <div className="mt-2 flex gap-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-opacity-20 bg-opacity-10 px-2 py-0.5 text-xs font-medium"
                          style={{
                            borderColor: `rgba(var(--color-primary), 0.2)`,
                            backgroundColor: `rgba(var(--color-primary), 0.1)`,
                            color: `rgb(var(--color-primary))`,
                          }}
                        >
                          <Flame className="h-3 w-3" />
                          {habit.streak}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          <Trophy className="h-3 w-3" />
                          {habit.best}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setMenuOpenId(
                            menuOpenId === habit.id ? null : habit.id
                          )
                        }
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuOpenId === habit.id && (
                        <div className="absolute right-0 z-30 mt-2 w-40 rounded-lg border border-zinc-800 bg-zinc-900 p-1 shadow-2xl">
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
                    {habit.week.map((done: boolean, dayIndex: number) => (
                      <div key={dayIndex} className="flex justify-center">
                        <button
                          onClick={() =>
                            toggleDay(habit.id, dayIndex, weekOffset)
                          }
                          className={
                            done
                              ? "liquid-fill h-12 w-12 rounded-xl border border-transparent transition hover:scale-105"
                              : "h-12 w-12 rounded-xl border border-zinc-800/80 bg-[#121412]/50 transition hover:scale-105 hover:bg-zinc-800"
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
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6">
          <h3 className="font-semibold text-zinc-200">Weekly Progress</h3>
          <div className="relative mt-6 flex h-48 items-end gap-3">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between opacity-10">
              <div className="w-full border-t border-zinc-500" />
              <div className="w-full border-t border-zinc-500" />
              <div className="w-full border-t border-zinc-500" />
              <div className="w-full border-t border-zinc-500" />
            </div>
            {dailyCompletion.map((pct, i) => {
              const isPeak = pct === peakValue && pct > 0;
              return (
                <div
                  key={i}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full rounded-t-lg transition-all duration-700"
                    style={{
                      height: `${Math.max(pct, 4)}%`,
                      backgroundColor: isPeak
                        ? `rgb(var(--color-primary))`
                        : `rgba(var(--color-primary), 0.3)`,
                      boxShadow: isPeak
                        ? `0 0 15px rgba(var(--color-primary), 0.3)`
                        : "none",
                    }}
                  />
                  <span
                    className={`text-[11px] ${
                      isPeak ? "text-opacity-100 font-bold" : "text-zinc-500"
                    }`}
                    style={
                      isPeak ? { color: `rgb(var(--color-primary))` } : {}
                    }
                  >
                    {weekDays[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6">
          <h3 className="font-semibold text-zinc-200">Top Habits</h3>
          <div className="mt-4 space-y-4">
            {topHabits.length === 0 && (
              <p className="text-sm text-zinc-500">
                Add a habit to see your top performers.
              </p>
            )}
            {topHabits.map((habit: any, i: number) => (
              <div key={habit.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-zinc-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-zinc-300">{habit.name}</span>
                </div>
                <span
                  className="rounded-full border border-opacity-20 bg-opacity-10 px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: `rgba(var(--color-primary), 0.2)`,
                    backgroundColor: `rgba(var(--color-primary), 0.1)`,
                    color: `rgb(var(--color-primary))`,
                  }}
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

// 3. STORE VIEW
function StoreView({
  sparks,
  setSparks,
  ownedThemes,
  setOwnedThemes,
  activeTheme,
  setActiveTheme,
}: any) {
  const themes = [
    { id: "green", name: "Emerald", color: "22, 163, 74", price: 0 },
    { id: "blue", name: "Ocean", color: "59, 130, 246", price: 50 },
    { id: "purple", name: "Amethyst", color: "168, 85, 247", price: 100 },
    { id: "rose", name: "Rose", color: "244, 63, 94", price: 150 },
  ];

  const handleBuyTheme = (theme: any) => {
    if (ownedThemes.includes(theme.id)) {
      setActiveTheme(theme.id, theme.color);
    } else if (sparks >= theme.price) {
      setSparks(sparks - theme.price);
      setOwnedThemes([...ownedThemes, theme.id]);
      setActiveTheme(theme.id, theme.color);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 mb-10 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 mb-1">Rewards Wallet</h2>
          <p className="text-sm text-zinc-500">
            Earn Sparks by checking in daily & hitting milestones.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-950 px-6 py-3 rounded-xl border border-amber-500/20">
          <Sparkles className="h-6 w-6 text-amber-400" />
          <span className="text-3xl font-black text-amber-400">{sparks}</span>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-2">
            <Palette className="h-5 w-5 text-zinc-400" />
            <h3 className="text-lg font-semibold text-zinc-200">Themes</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {themes.map((t) => {
              const isOwned = ownedThemes.includes(t.id);
              const isActive = activeTheme === t.id;
              const canAfford = sparks >= t.price;

              return (
                <button
                  key={t.id}
                  onClick={() => handleBuyTheme(t)}
                  disabled={!isOwned && !canAfford}
                  className={`relative flex flex-col items-center p-6 rounded-2xl border transition-all backdrop-blur-md ${
                    isActive
                      ? "border-zinc-500 bg-zinc-800/70 scale-105"
                      : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                  } ${
                    !isOwned && !canAfford
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full mb-4 shadow-lg border-2 border-zinc-950"
                    style={{ backgroundColor: `rgb(${t.color})` }}
                  />
                  <span className="font-medium text-zinc-200 mb-2">{t.name}</span>

                  {isOwned ? (
                    <span className="text-xs font-semibold text-zinc-500 bg-zinc-950 px-3 py-1 rounded-full">
                      {isActive ? "Active" : "Owned"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
                      <Sparkles className="h-3 w-3" /> {t.price}
                    </span>
                  )}

                  {!isOwned && !canAfford && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 rounded-2xl backdrop-blur-[1px]">
                      <Lock className="h-6 w-6 text-zinc-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-2">
            <Trophy className="h-5 w-5 text-zinc-400" />
            <h3 className="text-lg font-semibold text-zinc-200">
              Achievement Gallery
            </h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[7, 14, 30, 50, 100, 365].map((days, i) => {
              const unlocked = i < 2;
              return (
                <div
                  key={days}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${
                      unlocked
                        ? "bg-zinc-800 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        : "bg-zinc-950 opacity-40"
                    }`}
                  >
                    {unlocked ? (
                      <Unlock className="h-6 w-6 text-zinc-300" />
                    ) : (
                      <Lock className="h-6 w-6 text-zinc-700" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      unlocked ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    {days} Days
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

// 4. SETTINGS VIEW
function SettingsView({ habits, deleteHabit }: any) {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <section className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-zinc-950">
          <User className="h-8 w-8 text-zinc-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Explorer</h2>
          <p className="text-sm text-zinc-500">explorer@compound.app</p>
          <button className="mt-3 text-xs font-semibold px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition">
            Edit Profile
          </button>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-6">
        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
            <Bell className="h-5 w-5 text-zinc-400" />
            <h3 className="font-semibold text-zinc-200">Notifications</h3>
          </div>
          <ToggleRow
            label="Daily Summary"
            desc="Get a morning brief of your tasks."
            defaultOn={true}
          />
          <ToggleRow
            label="Streak Alerts"
            desc="Reminders before you lose a streak."
            defaultOn={true}
          />
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
            <Download className="h-5 w-5 text-zinc-400" />
            <h3 className="font-semibold text-zinc-200">Data & Sync</h3>
          </div>
          <button className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition">
            <span className="text-sm font-medium text-zinc-200">
              Export as CSV
            </span>
            <Download className="h-4 w-4 text-zinc-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition">
            <span className="text-sm font-medium text-zinc-200">
              Export as JSON
            </span>
            <Download className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </section>

      <section className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
          <Target className="h-5 w-5 text-zinc-400" />
          <h3 className="font-semibold text-zinc-200">Habit Management</h3>
        </div>
        <div className="space-y-2">
          {habits.map((habit: any) => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <span className="font-medium text-zinc-300">{habit.name}</span>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                title="Delete Habit"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {habits.length === 0 && (
            <p className="text-sm text-zinc-500 py-2">
              No active habits to manage.
            </p>
          )}
        </div>
      </section>

      <section className="flex justify-center pt-4">
        <button className="flex items-center gap-2 text-sm text-zinc-600 hover:text-red-400 transition">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc: string;
  defaultOn: boolean;
}) {
  const [isOn, setIsOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-zinc-200">{label}</h4>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
      <button
        onClick={() => setIsOn(!isOn)}
        className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${
          isOn ? "bg-green-500" : "bg-zinc-700"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform ${
            isOn ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <span className="text-[11px] uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        <Icon
          className="h-4 w-4"
          style={{ color: `rgb(var(--color-primary))` }}
        />
      </div>
      <p className="text-3xl font-extrabold text-zinc-100">{value}</p>
    </div>
  );
}