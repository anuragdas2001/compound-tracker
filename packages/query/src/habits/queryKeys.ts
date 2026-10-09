export const habitQueryKeys = {
  all: ["habits"] as const,
  list: (userId?: string) => [...habitQueryKeys.all, { userId }] as const,
  detail: (id: string) => [...habitQueryKeys.all, id] as const,
};
