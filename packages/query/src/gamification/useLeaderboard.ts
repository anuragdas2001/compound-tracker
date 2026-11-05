import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "@repo/services/gamificationService";
import { gamificationQueryKeys } from "./queryKeys";

export const useLeaderboard = (userId?: string) => {
  return useQuery({
    queryKey: gamificationQueryKeys.leaderboard(userId),
    queryFn: async () => {
      const response = await gamificationService.getLeaderboard(userId);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

