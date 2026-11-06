import { useMutation, useQueryClient } from "@tanstack/react-query";
import { habitService } from "@repo/services/habitService";
import { habitQueryKeys } from "./queryKeys";

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      color?: string;
      userId?: string;
      mode?: string;
      days?: number[];
      perWeek?: number;
      goal?: string;
      target?: number;
      unit?: string;
      why?: string;
      mini?: string;
    }) => {
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
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, value, completedAt }: { id: string; value: number; completedAt?: string }) => {
      const response = await habitService.updateProgress(id, value, completedAt);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
};

export const useArchiveHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await habitService.archiveHabit(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
};

export const useUnarchiveHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await habitService.unarchiveHabit(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        color?: string;
        mode?: string;
        days?: number[];
        perWeek?: number;
        goal?: string;
        target?: number;
        unit?: string;
        why?: string;
        mini?: string;
      };
    }) => {
      const response = await habitService.updateHabit(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
};

export const useSaveDailyNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; dateKey: string; content: string }) => {
      const response = await habitService.saveDailyNote(data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: habitQueryKeys.dailyNote(variables.userId, variables.dateKey),
      });
    },
  });
};
