export const gamificationQueryKeys = {
  all: ["gamification"] as const,
  summary: (userId?: string) => [...gamificationQueryKeys.all, "summary", userId] as const,
};
