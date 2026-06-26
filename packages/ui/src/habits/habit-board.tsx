import { HabitRow } from "./habit-row";

const habits = [
  {
    name: "Meditation",
    color: "#3B82F6",
    longest: 12,
    current: 7,
    days: [
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
  },
  {
    name: "Exercise",
    color: "#22C55E",
    longest: 14,
    current: 5,
    days: [
      true,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
    ],
  },
  {
    name: "Reading",
    color: "#EF4444",
    longest: 11,
    current: 2,
    days: [
      true,
      true,
      false,
      true,
      true,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ],
  },
];

export function HabitsBoard() {
  const totalHabits = habits.length;

  const longestStreak = Math.max(
    ...habits.map((h) => h.longest)
  );

  const currentStreak = Math.max(
    ...habits.map((h) => h.current)
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="text-sm text-zinc-500">
            Habits
          </div>

          <div className="mt-2 text-3xl font-bold">
            {totalHabits}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="text-sm text-zinc-500">
            Longest Streak
          </div>

          <div className="mt-2 text-3xl font-bold text-green-500">
            {longestStreak}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="text-sm text-zinc-500">
            Current Best
          </div>

          <div className="mt-2 text-3xl font-bold text-orange-500">
            {currentStreak}
          </div>
        </div>
      </div>

      {/* Board */}
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-zinc-800
          bg-zinc-900/60
          backdrop-blur-xl
          shadow-[0_0_80px_rgba(34,197,94,0.05)]
        "
      >
        <div className="border-b border-zinc-800 p-6">
          <h2 className="font-semibold">
            Dec 30 - Jan 13, 2025
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Track consistency and build momentum.
          </p>
        </div>

        <div className="p-6">
          {habits.map((habit) => (
            <HabitRow
              key={habit.name}
              {...habit}
            />
          ))}
        </div>
      </div>
    </div>
  );
}