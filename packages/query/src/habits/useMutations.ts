import { useMutation, useQueryClient } from "@tanstack/react-query";
import { habitService } from "@repo/services/habitService";
import { habitQueryKeys } from "./queryKeys";

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description?: string; color?: string }) => {
      const response = await habitService.createHabit(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await habitService.deleteHabit(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
};

export const useToggleHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completedAt }: { id: string; completedAt?: string }) => {
      const response = await habitService.toggleHabit(id, completedAt);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
};
