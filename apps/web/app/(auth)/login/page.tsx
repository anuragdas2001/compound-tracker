"use client"
import AuthLayout from '../auth-layout';
import { useRouter } from 'next/navigation';
import { LoginForm, type LoginValues } from '@repo/ui/components/auth/login-form';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // If already authenticated, redirect to onboarding if incomplete, else dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const hasCompleted = Boolean(session.user.hasCompletedOnboarding);
      if (!hasCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [status, session, router]);

  const handleLogin = async (values: LoginValues) => {
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      throw new Error(res.error);
    }

    // Check if the user has abandoned onboarding
    try {
      const prefRes = await fetch('/api/user/preferences');
      if (prefRes.ok) {
        const prefData = await prefRes.json();
        if (prefData && !prefData.hasCompletedOnboarding) {
          router.push('/onboarding');
          return;
        }
      }
    } catch {
      // ignore
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