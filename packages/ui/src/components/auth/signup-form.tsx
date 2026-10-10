'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, User } from 'lucide-react';
import {
  Checkbox,
  Divider,
  Field,
  FormError,
  FormHeader,
  PasswordField,
  PasswordStrength,
  SocialButtons,
  SubmitButton,
  getStrength,
} from './auth-fields';

export type SignupValues = { name: string; email: string; password: string };

export interface SignupFormProps {
  /** Throw an Error (message is shown to the user) to signal a failed signup. */
  onSubmit?: (values: SignupValues) => Promise<void> | void;
  onGoogle?: () => void;
  onGithub?: () => void;
}

const PERKS = ['Free forever', 'No card needed', '2-minute setup'];

export function SignupForm({ onSubmit, onGoogle, onGithub }: SignupFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; agree?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Tell us what to call you';
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address';
    if (password.length < 8) e.password = 'Use at least 8 characters';
    else if (getStrength(password) < 2) e.password = 'Make it a little stronger';
    if (!agree) e.agree = 'Please accept the terms to continue';
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
      // TODO: call your existing signup logic here (or pass it in as `onSubmit`)
      await onSubmit?.({ name: name.trim(), email, password });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormHeader title="Create your account" subtitle="Day one starts the moment you sign up." />

      <div className="-mt-3 mb-6 flex flex-wrap gap-2">
        {PERKS.map((p) => (
          <span
            key={p}
            className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-green-300"
          >
            {p}
          </span>
        ))}
      </div>

      <SocialButtons onGoogle={onGoogle} onGithub={onGithub} />
      <Divider>or with email</Divider>

      <FormError message={formError} />

      <div className="space-y-4">
        <Field
          label="Full name"
          icon={User}
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((p) => ({ ...p, name: undefined }));
          }}
          error={errors.name}
        />
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
        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => ({ ...p, password: undefined }));
            }}
            error={errors.password}
          />
          <PasswordStrength password={password} />
        </div>
      </div>

      <div className="mb-6 mt-5">
        <Checkbox
          checked={agree}
          onChange={(v) => {
            setAgree(v);
            setErrors((p) => ({ ...p, agree: undefined }));
          }}
        >
          I agree to the{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </Checkbox>
        {errors.agree && <p className="mt-1.5 px-1 text-xs text-red-400">{errors.agree}</p>}
      </div>

      <SubmitButton loading={loading}>Start my streak</SubmitButton>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary transition hover:text-green-300">
          Log in
        </Link>
      </p>
    </form>
  );
}

export default SignupForm;