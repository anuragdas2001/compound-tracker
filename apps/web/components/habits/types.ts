export type HabitLog = {
  completedAt: string;
};

export type Habit = {
  id: string;
  name: string;
  best: number;
  time?: string;
  logs: HabitLog[];
};

export type HabitRow = Habit & {
  week: boolean[];
  streak: number;
};
