'use client';

import { useRouter } from 'next/navigation';

import { LoginForm } from '@repo/ui/components/auth/login-form';
import { useLogin } from '@repo/query/auth/useLogin';
import { useSetAuth } from '@repo/store/hooks/useSetAuth';

import type { LoginFormValues } from '@repo/types/auth/schemas';

export function LoginClient() {
  const router = useRouter();

  const loginMutation = useLogin();

  const setAuth = useSetAuth();

  async function handleSubmit(values: LoginFormValues) {
    try {
      const user = await loginMutation.mutateAsync(values);

      setAuth(user);

      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    }
  }

  return (
      <LoginForm
        onSubmit={handleSubmit}
        isPending={loginMutation.isPending}
        error={
          loginMutation.isError
            ? loginMutation.error instanceof Error
              ? loginMutation.error.message
              : 'Something went wrong'
            : undefined
        }
      />
  );
}
