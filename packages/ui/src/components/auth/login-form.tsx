'use client';

import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  loginSchema,
  type LoginFormValues,
} from '@repo/types/auth/schemas';

import { Button } from '../../button';
import { Card, CardContent } from '../../card';
import { Field, FieldError, FieldGroup, FieldLabel } from '../../field';
import { Input } from '../../input';

import { PasswordInput } from './password-input';
import { SocialLogin } from './social-login';

const inputClasses =
  'h-12 rounded-xl border border-white/10 bg-white/[0.03] text-[15px] ' +
  'text-foreground placeholder:text-muted-foreground/40 ' +
  'shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] transition-colors duration-200 ' +
  'hover:border-white/20 ' +
  'focus-visible:border-primary/50 focus-visible:bg-white/[0.05] ' +
  'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0';

const labelClasses =
  'text-xs font-semibold uppercase tracking-wider text-muted-foreground/70';

const iconInputStyle = {
  paddingLeft: '3.5rem',
  paddingRight: '1rem',
};

const plainInputStyle = {
  paddingLeft: '1rem',
  paddingRight: '1rem',
};

const iconWrapClasses =
  'pointer-events-none absolute inset-y-0 left-5 z-10 flex items-center ' +
  'text-muted-foreground/40 transition-colors group-focus-within:text-primary';

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void> | void;
  isPending?: boolean;
  error?: string;
}

export function LoginForm({
  onSubmit,
  isPending = false,
  error,
}: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Card className="w-full rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/40 backdrop-blur-xl">
      <CardContent className="p-10">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Welcome back
          </h2>

          <p className="text-muted-foreground">
            Log in to keep your streak alive.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FieldGroup className="gap-6">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  className="gap-2.5"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel
                    className={labelClasses}
                    htmlFor="login-email"
                  >
                    Email
                  </FieldLabel>

                  <div className="group relative">
                    <span className={iconWrapClasses}>
                      <Mail
                        className="h-[18px] w-[18px]"
                        strokeWidth={2}
                      />
                    </span>

                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      aria-invalid={fieldState.invalid}
                      className={inputClasses}
                      style={iconInputStyle}
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  className="gap-2.5"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel
                    className={labelClasses}
                    htmlFor="login-password"
                  >
                    Password
                  </FieldLabel>

                  <PasswordInput
                    {...field}
                    id="login-password"
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                    className={inputClasses}
                    style={plainInputStyle}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="space-y-6">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
            >
              {isPending ? 'Logging In...' : 'Log In'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {error ? (
              <p className="text-center text-sm text-red-500">
                {error}
              </p>
            ) : null}

            <SocialLogin />

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}