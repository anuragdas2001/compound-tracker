import { useMutation } from '@tanstack/react-query';

import { authService } from '@repo/services/authService';
import { LoginFormValues } from '../../../types/auth/schemas';

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await authService.login(data);

      return response.data;
    },
  });
};
