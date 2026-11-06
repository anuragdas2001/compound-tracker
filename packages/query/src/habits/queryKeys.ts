export const habitQueryKeys = {
  all: ["habits"] as const,
  list: (userId?: string) => [...habitQueryKeys.all, "active", { userId }] as const,
  archived: (userId?: string) => [...habitQueryKeys.all, "archived", { userId }] as const,
  detail: (id: string) => [...habitQueryKeys.all, id] as const,
  dailyNote: (userId?: string, dateKey?: string) => ["dailyNote", { userId, dateKey }] as const,
};
