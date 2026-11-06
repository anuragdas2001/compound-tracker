export const gamificationQueryKeys = {
  all: ["gamification"] as const,
  summary: (userId?: string) => [...gamificationQueryKeys.all, "summary", userId] as const,
  shieldUsages: (userId?: string) => [...gamificationQueryKeys.all, "shieldUsages", userId] as const,
  inventory: (userId?: string) => [...gamificationQueryKeys.all, "inventory", userId] as const,
  ledger: (userId?: string, page: number = 1, limit: number = 50) =>
    [...gamificationQueryKeys.all, "ledger", userId, page, limit] as const,
  achievements: (userId?: string) => [...gamificationQueryKeys.all, "achievements", userId] as const,
  challenges: (userId?: string) => [...gamificationQueryKeys.all, "challenges", userId] as const,
  leaderboard: (userId?: string) => [...gamificationQueryKeys.all, "leaderboard", userId] as const,
  notifications: (userId?: string) => [...gamificationQueryKeys.all, "notifications", userId] as const,
};
