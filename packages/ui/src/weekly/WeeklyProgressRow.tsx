import { Trophy, Flame } from "lucide-react";
import { DayCircle } from "./DayCircle";
import type { WeeklyProgress } from "@repo/types/weekly";
interface WeeklyProgressRowProps {
  habit: WeeklyProgress;
  todayIndex?: number;
}

export function WeeklyProgressRow({
  habit,
  todayIndex,
}: WeeklyProgressRowProps) {
  return (
    <div
      className="
      grid
      grid-cols-[250px_80px_80px_1fr]
      items-center
      py-4
      border-b
      border-zinc-800
    "
    >
      <div className="flex items-center gap-3">
        <div
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: habit.color,
          }}
        />

        <span>{habit.name}</span>
      </div>

      <div className="flex items-center gap-2 text-zinc-300">
        <Trophy size={16} />
        {habit.longestStreak}
      </div>

      <div className="flex items-center gap-2 text-orange-400">
        <Flame size={16} />
        {habit.currentStreak}
      </div>

      <div className="flex gap-3">
        {habit.days.map((day, index) => (
          <DayCircle
            key={index}
            completed={day.completed}
            color={habit.color}
            isToday={index === todayIndex}
          />
        ))}
      </div>
    </div>
  );
}