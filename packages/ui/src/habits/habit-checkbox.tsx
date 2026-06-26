"use client";

import { cn } from "@compound/lib/utils";

interface HabitCheckboxProps {
  checked: boolean;
}

export function HabitCheckbox({
  checked,
}: HabitCheckboxProps) {
  return (
    <button
      className={cn(
        "h-8 w-8 rounded-xl border transition-all duration-300",
        checked
          ? "border-green-500 bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
      )}
    />
  );
}