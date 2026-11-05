export const gamificationQueryKeys = {
  all: ["gamification"] as const,
  summary: (userId?: string) => [...gamificationQueryKeys.all, "summary", userId] as const,
  shieldUsages: (userId?: string) => [...gamificationQueryKeys.all, "shieldUsages", userId] as const,
  leaderboard: (userId?: string) => [...gamificationQueryKeys.all, "leaderboard", userId] as const,
  notifications: (userId?: string) => [...gamificationQueryKeys.all, "notifications", userId] as const,
};
