"use client"
import AuthLayout from '../layout';

import { LoginForm } from '@repo/ui/components/auth/login-form';

export default function LoginPage() {
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
      <LoginForm />
    </AuthLayout>
  );
}