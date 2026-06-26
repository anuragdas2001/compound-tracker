"use client"
import { RecoilRoot } from 'recoil';
import { AuthLayout } from '../auth-layout';
import { LoginClient } from './login-client';

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
      <RecoilRoot>
        <LoginClient />
      </RecoilRoot>
    </AuthLayout>
  );
}