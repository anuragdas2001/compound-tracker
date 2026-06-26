import { useMutation } from "@tanstack/react-query";

import { authService } from "@repo/services/authService";
import { SignupFormValues } from "../../../types/auth/schemas"

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data:SignupFormValues) => {
      const response =
        await authService.register(data);

      return response.data;
    },
  });
};