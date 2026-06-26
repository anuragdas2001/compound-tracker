import { WeeklyProgress } from "@repo/types/weekly";
import { WeeklyProgressHeader } from "@repo/ui/weekly/WeeklyProgressHeader";
import { WeeklyProgressRow } from "@repo/ui/weekly/WeeklyProgressRow";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface WeeklyProgressBoardProps {
  habits: WeeklyProgress[];
  dates: Date[];
}

export function WeeklyProgressBoard({
  habits,
  dates,
}: WeeklyProgressBoardProps) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/60
        backdrop-blur-xl
        overflow-hidden
      "
    >
      {/* Top Bar */}

      <div
        className="
          flex
          items-center
          justify-between
          px-8
          py-6
          border-b
          border-zinc-800
        "
      >
        <button
          className="
            rounded-full
            bg-blue-400
            px-5
            py-3
            text-black
            font-medium
          "
        >
          + Track Habit
        </button>

        <div className="flex items-center gap-8">
          <ChevronLeft />

          <span className="font-medium">
            Dec 30 - Jan 13, 2025
          </span>

          <ChevronRight />
        </div>
      </div>

      {/* Days */}

      <div className="px-8 pt-6">
        <div className="grid grid-cols-[250px_80px_80px_1fr]">
          <div />

          <div />

          <div />

          <WeeklyProgressHeader
            dates={dates}
          />
        </div>
      </div>

      {/* Rows */}

      <div className="p-8">
        {habits.map((habit) => (
          <WeeklyProgressRow
            key={habit.id}
            habit={habit}
            todayIndex={10}
          />
        ))}
      </div>
    </div>
  );
}