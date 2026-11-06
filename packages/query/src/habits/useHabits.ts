import { useQuery } from "@tanstack/react-query";
import { habitService } from "@repo/services/habitService";
import { habitQueryKeys } from "./queryKeys";

export const useHabits = (userId?: string) => {
  return useQuery({
    queryKey: habitQueryKeys.list(userId),
    queryFn: async () => {
      const response = await habitService.getHabits(userId, false);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useArchivedHabits = (userId?: string) => {
  return useQuery({
    queryKey: habitQueryKeys.archived(userId),
    queryFn: async () => {
      const response = await habitService.getArchivedHabits(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useDailyNote = (userId?: string, dateKey?: string) => {
  return useQuery({
    queryKey: habitQueryKeys.dailyNote(userId, dateKey),
    queryFn: async () => {
      if (!userId || !dateKey) return { userId: "", dateKey: "", content: "" };
      const response = await habitService.getDailyNote(userId, dateKey);
      return response.data;
    },
    enabled: !!userId && !!dateKey,
  });
};
