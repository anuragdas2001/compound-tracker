import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";

export function HabitsHeader() {
  return (
    <div className="mb-10 flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-green-500">
          Compound
        </span>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Your Habits
        </h1>

        <p className="mt-2 text-zinc-400">
          Track the habits that compound your future.
        </p>
      </div>

      <Button
        className="
          rounded-full
          bg-green-500
          text-black
          hover:bg-green-400
          font-medium
        "
      >
        <Plus className="mr-2 h-4 w-4" />
        New Habit
      </Button>
    </div>
  );
}