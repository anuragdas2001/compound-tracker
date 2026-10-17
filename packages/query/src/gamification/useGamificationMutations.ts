import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { gamificationService } from "@repo/services/gamificationService";
import { gamificationQueryKeys } from "./queryKeys";
import { habitQueryKeys } from "../habits/queryKeys";

export const useShieldUsages = (userId?: string) => {
  return useQuery({
    queryKey: gamificationQueryKeys.shieldUsages(userId),
    queryFn: async () => {
      const response = await gamificationService.getShieldUsages(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const usePurchaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; itemType: string; cost: number }) =>
      gamificationService.purchaseItem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.summary(variables.userId),
      });
    },
  });
};

export const useUseStreakShield = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; habitId?: string; missedDate: string }) =>
      gamificationService.useStreakShield(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.summary(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.shieldUsages(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: habitQueryKeys.all,
      });
    },
  });
};
