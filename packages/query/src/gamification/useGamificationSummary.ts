import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "@repo/services/gamificationService";
import { gamificationQueryKeys } from "./queryKeys";

export const useGamificationSummary = (userId?: string) => {
  return useQuery({
    queryKey: gamificationQueryKeys.summary(userId),
    queryFn: async () => {
      const response = await gamificationService.getSummary(userId);
      return response.data;
    },
    enabled: !!userId,
  });
};
