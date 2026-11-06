export type HabitLog = {
  id?: string;
  completedAt: string;
  value?: number;
};

export type Habit = {
  id: string;
  name: string;
  best: number;
  category?: string;
  logs: HabitLog[];
  color?: string;
  mode?: string;
  days?: number[];
  perWeek?: number;
  goal?: string;
  target?: number;
  unit?: string;
  why?: string;
  mini?: string;
  archived?: boolean;
};

export type HabitRow = Habit & {
  week: boolean[];
  streak: number;
};
