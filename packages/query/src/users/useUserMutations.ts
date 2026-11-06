import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService, UserSettingsData } from "@repo/services/userService";
import { userQueryKeys } from "./queryKeys";

export const useUserSettings = (userId?: string) => {
  return useQuery({
    queryKey: userQueryKeys.settings(userId),
    queryFn: async () => {
      if (!userId) return null;
      const res = await userService.getSettings(userId);
      return res.data;
    },
    enabled: !!userId,
  });
};

export const useUserFriends = (userId?: string) => {
  return useQuery({
    queryKey: userQueryKeys.friends(userId),
    queryFn: async () => {
      if (!userId) return [];
      const res = await userService.getFriends(userId);
      return res.data;
    },
    enabled: !!userId,
  });
};

export const usePublicProfile = (usernameOrId?: string) => {
  return useQuery({
    queryKey: userQueryKeys.publicProfile(usernameOrId),
    queryFn: async () => {
      if (!usernameOrId) return null;
      const res = await userService.getPublicProfile(usernameOrId);
      return res.data;
    },
    enabled: !!usernameOrId,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<UserSettingsData> }) =>
      userService.updateSettings(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.settings(variables.userId),
      });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { name?: string; image?: string; currentPassword?: string; newPassword?: string } }) =>
      userService.updateProfile(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.profile(variables.userId),
      });
    },
  });
};

export const useAddFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, friendEmailOrUsername }: { userId: string; friendEmailOrUsername: string }) =>
      userService.addFriend(userId, friendEmailOrUsername),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.friends(variables.userId),
      });
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, friendId }: { userId: string; friendId: string }) =>
      userService.removeFriend(userId, friendId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.friends(variables.userId),
      });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: (userId: string) => userService.deleteAccount(userId),
  });
};

