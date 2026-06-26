"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, User } from "lucide-react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  signupSchema,
  type SignupFormValues,
} from "@repo/types/auth/schemas";

import { Button } from "../../button";
import { Checkbox } from "../../checkbox";
import { Input } from "../../input";
import { Card, CardContent } from "../../card";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../field";

import { PasswordInput } from "./password-input";
import { SocialLogin } from "./social-login";
import { useRegister } from "@repo/query/auth/useRegister";
import { useSetAuth } from "@repo/store/hooks/useSetAuth";
// Padding is set via inline `style`, not Tailwind padding classes — the
// shared Input/PasswordInput components apply their own default padding
// internally, and inline styles always win the cascade regardless of class
// order, so this is the one approach guaranteed not to get silently
// overridden by their defaults.
const inputClasses =
  "h-12 rounded-xl border border-white/10 bg-white/[0.03] text-[15px] " +
  "text-foreground placeholder:text-muted-foreground/40 " +
  "shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] transition-colors duration-200 " +
  "hover:border-white/20 " +
  "focus-visible:border-primary/50 focus-visible:bg-white/[0.05] " +
  "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0";

const labelClasses =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground/70";

// Icon sits 20px from the left edge and is 18px wide, so it ends at 38px.
// 3.5rem (56px) of left padding leaves an 18px gap before the text starts.
const iconInputStyle = { paddingLeft: "3.5rem", paddingRight: "1rem" };
const plainInputStyle = { paddingLeft: "1rem", paddingRight: "1rem" };

// `inset-y-0` + `flex items-center` centers the icon against the wrapper's
// *actual* rendered height, whatever that turns out to be — unlike
// `top-1/2` + `-translate-y-1/2`, which only looks centered if our assumed
// height (h-12) matches the shared Input's real height exactly. That
// mismatch is what pushed the icon toward the bottom last time.
const iconWrapClasses =
  "pointer-events-none absolute inset-y-0 left-5 z-10 flex items-center " +
  "text-muted-foreground/40 transition-colors group-focus-within:text-primary";

export function SignupForm() {
  const router = useRouter();
  const registerMutation = useRegister();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      agreed: false,
    },
  });

  async function onSubmit(
    values: SignupFormValues,
  ) {
    try {
      await registerMutation.mutateAsync(values);
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Card className="w-full rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/40 backdrop-blur-xl">
      <CardContent className="p-10">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Create your account
          </h2>

          <p className="text-muted-foreground">
            Free forever. No credit card required.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <FieldGroup className="gap-6">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  className="gap-2.5"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel className={labelClasses}>
                    Name
                  </FieldLabel>

                  <div className="group relative">
                    <span className={iconWrapClasses}>
                      <User className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <Input
                      {...field}
                      placeholder="Jordan Lee"
                      aria-invalid={fieldState.invalid}
                      className={inputClasses}
                      style={iconInputStyle}
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  className="gap-2.5"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel className={labelClasses}>
                    Email
                  </FieldLabel>

                  <div className="group relative">
                    <span className={iconWrapClasses}>
                      <Mail className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      aria-invalid={fieldState.invalid}
                      className={inputClasses}
                      style={iconInputStyle}
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
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
                  <FieldLabel className={labelClasses}>
                    Password
                  </FieldLabel>

                  <PasswordInput
                    {...field}
                    placeholder="At least 6 characters"
                    aria-invalid={fieldState.invalid}
                    className={inputClasses}
                    style={plainInputStyle}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="agreed"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  className="items-start gap-3"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />

                  <div className="space-y-1">
                    <FieldLabel className="text-sm font-normal leading-5 text-muted-foreground">
                      I agree to the{" "}
                      <Link
                        href="#"
                        className="font-medium text-primary hover:underline"
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="#"
                        className="font-medium text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </FieldLabel>

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          <div className="space-y-6">
            <Button
              type="submit"
              size="lg"
              disabled={registerMutation.isPending}
              className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
            >
              {registerMutation.isPending
                ? "Creating Account..."
                : "Create Account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {registerMutation.isError && (
              <p className="text-center text-sm text-red-500">
                {registerMutation.error instanceof Error
                  ? registerMutation.error.message
                  : "Something went wrong"}
              </p>
            )}

            {/* <SocialLogin /> */}

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}