export const userQueryKeys = {
  all: ["users"] as const,
  profile: (userId?: string) => [...userQueryKeys.all, "profile", userId] as const,
  settings: (userId?: string) => [...userQueryKeys.all, "settings", userId] as const,
  friends: (userId?: string) => [...userQueryKeys.all, "friends", userId] as const,
  publicProfile: (usernameOrId?: string) => [...userQueryKeys.all, "publicProfile", usernameOrId] as const,
};

