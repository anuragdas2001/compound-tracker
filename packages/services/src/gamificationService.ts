import { api } from "./api";

export interface GamificationSummary {
  id?: string;
  userId?: string;
  totalXp: number;
  level: number;
  sparksBalance: number;
  shields: number;
  unreadNotifications: number;
}

export const gamificationService = {
  getSummary: (userId?: string) =>
    api.get<GamificationSummary>(`/gamification/summary${userId ? `?userId=${userId}` : ""}`),
};
