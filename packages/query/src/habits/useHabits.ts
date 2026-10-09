import { useQuery } from "@tanstack/react-query";
import { habitService } from "@repo/services/habitService";
import { habitQueryKeys } from "./queryKeys";

export const useHabits = (userId?: string) => {
  return useQuery({
    queryKey: habitQueryKeys.list(userId),
    queryFn: async () => {
      const response = await habitService.getHabits(userId);
      return response.data;
    },
  });
};
