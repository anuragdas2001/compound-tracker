"use client"
import AuthLayout from "../auth-layout";
import { useRouter } from 'next/navigation';
import { SignupForm, type SignupValues } from "@repo/ui/components/auth/signup-form";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const handleSignup = async (values: SignupValues) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to register');
    }

    const signInRes = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInRes?.error) {
      throw new Error(signInRes.error);
    }

    router.push('/onboarding');
  };

  return (
    <AuthLayout
      headline={
        <>
          Start your streak
          <br />
          <span className="text-primary">today.</span>
        </>
      }
      subtext="Every habit tracked here starts on day one. Yours can too."
    >
      <SignupForm 
        onSubmit={handleSignup} 
        onGoogle={() => signIn('google', { callbackUrl: '/onboarding' })}
        onGithub={() => signIn('github', { callbackUrl: '/onboarding' })}
      />
    </AuthLayout>
  );
}