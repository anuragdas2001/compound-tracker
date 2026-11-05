import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamificationService } from "@repo/services/gamificationService";
import { gamificationQueryKeys } from "./queryKeys";

export const useNotifications = (userId?: string) => {
  return useQuery({
    queryKey: gamificationQueryKeys.notifications(userId),
    queryFn: async () => {
      const response = await gamificationService.getNotifications(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await gamificationService.markNotificationsAsRead(userId);
      return response.data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: gamificationQueryKeys.notifications(userId) });
      queryClient.invalidateQueries({ queryKey: gamificationQueryKeys.summary(userId) });
    },
  });
};

