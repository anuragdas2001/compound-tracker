import { useQuery } from "@tanstack/react-query";

import { authService } from "@repo/services/authService";

import { queryKeys } from "./queryKeys";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,

    queryFn: async () => {
      const response =
        await authService.me();

      return response.data;
    },
  });
};