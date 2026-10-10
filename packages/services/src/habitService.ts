import { api } from "./api";

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  color?: string;
  archived: boolean;
  userId: string;
  logs: HabitLog[];
  createdAt: string;
}

export const habitService = {
  getHabits: (userId?: string) =>
    api.get<Habit[]>(`/habits${userId ? `?userId=${userId}` : ""}`),

  getHabit: (id: string) => api.get<Habit>(`/habits/${id}`),

  createHabit: (data: { title: string; description?: string; color?: string; userId?: string; mode?: string; days?: number[]; perWeek?: number; goal?: string; target?: number; unit?: string; why?: string; mini?: string; }) =>
    api.post<Habit>("/habits", data),

  deleteHabit: (id: string) => api.delete(`/habits/${id}`),

  toggleHabit: (id: string, completedAt?: string) =>
    api.patch(`/habits/${id}/toggle`, { completedAt }),
  
  updateHabit: (id: string, data: { title?: string; description?: string; color?: string; mode?: string; days?: number[]; perWeek?: number; goal?: string; target?: number; unit?: string; why?: string; mini?: string; }) =>
    api.patch<Habit>(`/habits/${id}`, data),
};
