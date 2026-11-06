import { api } from "./api";

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  value?: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  color?: string;
  mode?: string;
  days?: number[];
  perWeek?: number;
  goal?: string;
  target?: number;
  unit?: string;
  why?: string;
  mini?: string;
  archived: boolean;
  userId: string;
  logs: HabitLog[];
  createdAt: string;
}

export interface DailyNote {
  id?: string;
  userId: string;
  dateKey: string;
  content: string;
  updatedAt?: string;
}

export const habitService = {
  getHabits: (userId?: string, archived = false) =>
    api.get<Habit[]>(`/habits?archived=${archived}${userId ? `&userId=${userId}` : ""}`),

  getArchivedHabits: (userId?: string) =>
    api.get<Habit[]>(`/habits?archived=true${userId ? `&userId=${userId}` : ""}`),

  getHabit: (id: string) => api.get<Habit>(`/habits/${id}`),

  createHabit: (data: {
    title: string;
    description?: string;
    color?: string;
    userId?: string;
    mode?: string;
    days?: number[];
    perWeek?: number;
    goal?: string;
    target?: number;
    unit?: string;
    why?: string;
    mini?: string;
  }) => api.post<Habit>("/habits", data),

  deleteHabit: (id: string) => api.delete(`/habits/${id}`),

  toggleHabit: (id: string, completedAt?: string) =>
    api.patch(`/habits/${id}/toggle`, { completedAt }),

  updateProgress: (id: string, value: number, completedAt?: string) =>
    api.patch(`/habits/${id}/progress`, { value, completedAt }),

  archiveHabit: (id: string) => api.patch(`/habits/${id}/archive`),

  unarchiveHabit: (id: string) => api.patch(`/habits/${id}/unarchive`),

  updateHabit: (
    id: string,
    data: {
      title?: string;
      description?: string;
      color?: string;
      mode?: string;
      days?: number[];
      perWeek?: number;
      goal?: string;
      target?: number;
      unit?: string;
      why?: string;
      mini?: string;
    }
  ) => api.patch<Habit>(`/habits/${id}`, data),

  getDailyNote: (userId: string, dateKey: string) =>
    api.get<DailyNote>(`/habits/notes?userId=${userId}&dateKey=${dateKey}`),

  saveDailyNote: (data: { userId: string; dateKey: string; content: string }) =>
    api.post<DailyNote>("/habits/notes", data),
};
