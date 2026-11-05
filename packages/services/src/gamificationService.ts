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

export interface ShieldUsage {
  id: string;
  userId: string;
  powerUpType: string;
  relatedHabitId?: string | null;
  missedDate: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar?: string | null;
  sparks: number;
  totalXp: number;
  level: number;
  streak: number;
  trend: "up" | "down" | "same";
  isUser: boolean;
}

export interface LeaderboardResponse {
  global: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  friends: LeaderboardEntry[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export const gamificationService = {
  getSummary: (userId?: string) =>
    api.get<GamificationSummary>(`/gamification/summary${userId ? `?userId=${userId}` : ""}`),
  purchaseItem: (data: { userId: string; itemType: string; cost: number }) =>
    api.post<{ success: boolean; message: string; summary: GamificationSummary }>("/gamification/store/purchase", data),
  useStreakShield: (data: { userId: string; habitId?: string; missedDate: string }) =>
    api.post<{ success: boolean; message: string; summary: GamificationSummary }>("/gamification/shields/use", data),
  getShieldUsages: (userId?: string) =>
    api.get<ShieldUsage[]>(`/gamification/shields/usage${userId ? `?userId=${userId}` : ""}`),
  getLeaderboard: (userId?: string) =>
    api.get<LeaderboardResponse>(`/gamification/leaderboard${userId ? `?userId=${userId}` : ""}`),
  getNotifications: (userId?: string) =>
    api.get<NotificationItem[]>(`/gamification/notifications${userId ? `?userId=${userId}` : ""}`),
  markNotificationsAsRead: (userId: string) =>
    api.post<{ success: boolean }>("/gamification/notifications/read", { userId }),
};
