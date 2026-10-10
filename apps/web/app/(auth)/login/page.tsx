"use client"
import AuthLayout from '../auth-layout';
import { useRouter } from 'next/navigation';
import { LoginForm, type LoginValues } from '@repo/ui/components/auth/login-form';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (values: LoginValues) => {
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      throw new Error(res.error);
    }

    router.push('/dashboard');
  };

  return (
    <AuthLayout
      headline={
        <>
          Your streak
          <br />
          is <span className="text-primary">waiting.</span>
        </>
      }
      subtext="Pick up where you left off. Every day you show up makes the chain stronger."
    >
      <LoginForm 
        onSubmit={handleLogin} 
        onGoogle={() => signIn('google', { callbackUrl: '/dashboard' })}
        onGithub={() => signIn('github', { callbackUrl: '/dashboard' })}
      />
    </AuthLayout>
  );
}