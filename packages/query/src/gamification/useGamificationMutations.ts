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

export const useInventory = (userId?: string) => {
  return useQuery({
    queryKey: gamificationQueryKeys.inventory(userId),
    queryFn: async () => {
      const response = await gamificationService.getInventory(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useGamificationLedger = (userId?: string, page: number = 1, limit: number = 50) => {
  return useQuery({
    queryKey: gamificationQueryKeys.ledger(userId, page, limit),
    queryFn: async () => {
      const response = await gamificationService.getLedger(userId, page, limit);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useAchievements = (userId?: string) => {
  return useQuery({
    queryKey: gamificationQueryKeys.achievements(userId),
    queryFn: async () => {
      const response = await gamificationService.getAchievements(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useChallenges = (userId?: string) => {
  return useQuery({
    queryKey: gamificationQueryKeys.challenges(userId),
    queryFn: async () => {
      const response = await gamificationService.getChallenges(userId);
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
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.inventory(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.ledger(variables.userId),
      });
    },
  });
};

export const useActivateBoost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; powerUpType: string; durationHours?: number; multiplier?: number }) =>
      gamificationService.activateBoost(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.summary(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.inventory(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.ledger(variables.userId),
      });
    },
  });
};

export const useUseStreakShield = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; habitId?: string; missedDate: string; itemType?: string }) =>
      gamificationService.useStreakShield(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.summary(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.shieldUsages(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.inventory(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.ledger(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: habitQueryKeys.all,
      });
    },
  });
};

export const useAutoProtectStreaks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => gamificationService.autoProtectStreaks(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.summary(userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.shieldUsages(userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.inventory(userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.ledger(userId),
      });
      queryClient.invalidateQueries({
        queryKey: habitQueryKeys.all,
      });
    },
  });
};

export const useRecoverStreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; habitId: string; missedDate: string }) =>
      gamificationService.recoverStreak(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.summary(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.shieldUsages(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.inventory(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.ledger(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: habitQueryKeys.all,
      });
    },
  });
};

export const useClaimChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; challengeKey: string }) =>
      gamificationService.claimChallenge(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.summary(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.challenges(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: gamificationQueryKeys.ledger(variables.userId),
      });
    },
  });
};
