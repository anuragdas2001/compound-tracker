import { GripVertical } from "lucide-react";
import { HabitCheckbox } from "./habit-checkbox";
import { StreakStat } from "./streak-stat";

interface HabitRowProps {
  name: string;
  color: string;
  longest: number;
  current: number;
  days: boolean[];
}

export function HabitRow({
  name,
  color,
  longest,
  current,
  days,
}: HabitRowProps) {
  return (
    <div className="grid grid-cols-[280px_120px_120px_1fr] items-center border-b border-zinc-800 py-5 last:border-b-0">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-zinc-600" />

        <div
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: color,
          }}
        />

        <span className="font-medium">
          {name}
        </span>
      </div>

      <StreakStat
        icon="🏆"
        value={longest}
      />

      <StreakStat
        icon="🔥"
        value={current}
        color="text-orange-500"
      />

      <div className="flex flex-wrap gap-2">
        {days.map((day, index) => (
          <HabitCheckbox
            key={index}
            checked={day}
          />
        ))}
      </div>
    </div>
  );
}