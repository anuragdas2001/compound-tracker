import { api } from "./api";

export interface GamificationSummary {
  id?: string;
  userId?: string;
  totalXp: number;
  level: number;
  sparksBalance: number;
  shields: number;
  unreadNotifications: number;
  isBoostActive?: boolean;
  boostMultiplier?: number;
  boostExpiresAt?: string | null;
}

export interface ShieldUsage {
  id: string;
  userId: string;
  powerUpType: string;
  relatedHabitId?: string | null;
  missedDate: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  powerUpType: string;
  quantity: number;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  type: "EARN" | "SPEND" | "CONSUME" | "REVOKE";
  amount: number;
  sourceType: string;
  sourceId: string;
  metadata?: any;
  createdAt: string;
}

export interface LedgerResponse {
  entries: LedgerEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AchievementItem {
  key: string;
  title: string;
  description: string;
  category: string;
  rarity: string;
  icon: string;
  color: string;
  xpReward: number;
  sparksReward: number;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  progress: string;
}

export interface ChallengeItem {
  key: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  duration: string;
  difficulty: string;
  icon: string;
  color: string;
  sparksReward: number;
  xpReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  claimedAt?: string | null;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar?: string | null;
  sparks: number;
  totalXp: number;
  weeklyXp: number;
  level: number;
  streak: number;
  trend: "up" | "down" | "same";
  isUser: boolean;
}

export interface LeaderboardResponse {
  global: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
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
  activateBoost: (data: { userId: string; powerUpType: string; durationHours?: number; multiplier?: number }) =>
    api.post<{ success: boolean; message: string; summary: GamificationSummary }>("/gamification/boost/activate", data),
  useStreakShield: (data: { userId: string; habitId?: string; missedDate: string; itemType?: string }) =>
    api.post<{ success: boolean; message: string; summary: GamificationSummary }>("/gamification/shields/use", data),
  recoverStreak: (data: { userId: string; habitId: string; missedDate: string }) =>
    api.post<{ success: boolean; message: string; summary: GamificationSummary }>("/gamification/streak/recover", data),
  autoProtectStreaks: (userId: string) =>
    api.post<{ success: boolean; protected: boolean; count: number }>("/gamification/shields/auto-protect", { userId }),
  getShieldUsages: (userId?: string) =>
    api.get<ShieldUsage[]>(`/gamification/shields/usage${userId ? `?userId=${userId}` : ""}`),
  getInventory: (userId?: string) =>
    api.get<InventoryItem[]>(`/gamification/inventory${userId ? `?userId=${userId}` : ""}`),
  getLedger: (userId?: string, page: number = 1, limit: number = 50) =>
    api.get<LedgerResponse>(`/gamification/ledger?userId=${userId || ""}&page=${page}&limit=${limit}`),
  getAchievements: (userId?: string) =>
    api.get<AchievementItem[]>(`/gamification/achievements${userId ? `?userId=${userId}` : ""}`),
  getChallenges: (userId?: string) =>
    api.get<ChallengeItem[]>(`/gamification/challenges${userId ? `?userId=${userId}` : ""}`),
  claimChallenge: (data: { userId: string; challengeKey: string }) =>
    api.post<{ success: boolean; message: string; summary: GamificationSummary }>("/gamification/challenges/claim", data),
  getLeaderboard: (userId?: string) =>
    api.get<LeaderboardResponse>(`/gamification/leaderboard${userId ? `?userId=${userId}` : ""}`),
  getNotifications: (userId?: string) =>
    api.get<NotificationItem[]>(`/gamification/notifications${userId ? `?userId=${userId}` : ""}`),
  markNotificationsAsRead: (userId: string) =>
    api.post<{ success: boolean }>("/gamification/notifications/read", { userId }),
};
