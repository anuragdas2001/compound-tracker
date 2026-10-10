'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import {
  Checkbox,
  Divider,
  Field,
  FormError,
  FormHeader,
  PasswordField,
  SocialButtons,
  SubmitButton,
} from './auth-fields';

export type LoginValues = { email: string; password: string; remember: boolean };

export interface LoginFormProps {
  /** Throw an Error (message is shown to the user) to signal a failed login. */
  onSubmit?: (values: LoginValues) => Promise<void> | void;
  onGoogle?: () => void;
  onGithub?: () => void;
}

export function LoginForm({ onSubmit, onGoogle, onGithub }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Enter your password';
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setFormError(null);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      // TODO: call your existing login logic here (or pass it in as `onSubmit`)
      await onSubmit?.({ email, password, remember });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormHeader title="Welcome back" subtitle="Log in to keep your chain alive." />

      <SocialButtons onGoogle={onGoogle} onGithub={onGithub} />
      <Divider>or with email</Divider>

      <FormError message={formError} />

      <div className="space-y-4">
        <Field
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((p) => ({ ...p, email: undefined }));
          }}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((p) => ({ ...p, password: undefined }));
          }}
          error={errors.password}
        />
      </div>

      <div className="mb-6 mt-5 flex items-center justify-between">
        <Checkbox checked={remember} onChange={setRemember}>
          Remember me
        </Checkbox>
        <Link href="/forgot-password" className="text-sm font-medium text-primary transition hover:text-green-300">
          Forgot password?
        </Link>
      </div>

      <SubmitButton loading={loading}>Log in</SubmitButton>

      <p className="mt-6 text-center text-sm text-white/50">
        New to Compound?{' '}
        <Link href="/signup" className="font-semibold text-primary transition hover:text-green-300">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;