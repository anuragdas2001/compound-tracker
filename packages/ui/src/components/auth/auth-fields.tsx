'use client';

import React, { forwardRef, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { GithubLogo, GoogleLogo } from '@phosphor-icons/react';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

type IconType = React.ComponentType<{ className?: string }>;

/* ----------------------------------------------------------------------- */
/* Field (floating label)                                                  */
/* ----------------------------------------------------------------------- */

export interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string;
  icon: IconType;
  error?: string;
  right?: React.ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, icon: Icon, error, right, className, id, ...props },
  ref
) {
  const auto = useId();
  const inputId = id ?? auto;

  return (
    <div>
      <div
        className={cx(
          'group relative rounded-2xl border bg-white/[0.03] transition-all duration-300',
          'focus-within:border-primary/60 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]',
          error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
        )}
      >
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/35 transition-colors group-focus-within:text-primary" />
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          aria-invalid={!!error}
          className={cx(
            'peer h-14 w-full rounded-2xl bg-transparent pb-1 pl-12 pr-12 pt-5 text-[15px] text-white outline-none placeholder:text-transparent',
            className
          )}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cx(
            'pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 text-[15px] text-white/40 transition-all duration-200',
            'peer-focus:top-[17px] peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-primary',
            'peer-[:not(:placeholder-shown)]:top-[17px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium'
          )}
        >
          {label}
        </label>
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-center gap-1.5 overflow-hidden px-1 text-xs text-red-400"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, 'type' | 'right' | 'icon'>>(
  function PasswordField(props, ref) {
    const [show, setShow] = useState(false);
    return (
      <Field
        ref={ref}
        icon={Lock}
        type={show ? 'text' : 'password'}
        right={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/10 hover:text-white"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);

/* ----------------------------------------------------------------------- */
/* Password strength                                                       */
/* ----------------------------------------------------------------------- */

export function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s; // 0..4
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];
const STRENGTH_COLOR = ['#ef4444', '#f97316', '#eab308', '#4ade80', '#22c55e'];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const s = getStrength(password);
  return (
    <div className="mt-3 px-1">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ width: i < s ? '100%' : '0%', backgroundColor: STRENGTH_COLOR[s] }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-xs" style={{ color: STRENGTH_COLOR[s] }}>
        {STRENGTH_LABEL[s]}
        {s < 3 && <span className="text-white/35"> · use 8+ characters, mixed case and a number</span>}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Checkbox                                                                */
/* ----------------------------------------------------------------------- */

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer select-none items-start gap-3 text-sm text-white/60">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={cx(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50',
          checked ? 'border-primary bg-primary' : 'border-white/20 bg-white/[0.03]'
        )}
      >
        <motion.span initial={false} animate={{ scale: checked ? 1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
          <Check className="h-3.5 w-3.5 text-black" strokeWidth={3.5} />
        </motion.span>
      </span>
      <span className="leading-snug">{children}</span>
    </label>
  );
}

/* ----------------------------------------------------------------------- */
/* Buttons & misc                                                          */
/* ----------------------------------------------------------------------- */

export function SubmitButton({ loading, children }: { loading?: boolean; children: React.ReactNode }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileTap={{ scale: 0.98 }}
      className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-green-400 via-primary to-emerald-400 text-[15px] font-bold text-black shadow-[0_12px_36px_-10px_rgba(34,197,94,0.75)] transition hover:shadow-[0_16px_44px_-8px_rgba(34,197,94,0.9)] disabled:opacity-80"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] -skew-x-12 bg-white/40 transition-transform duration-700 ease-out group-hover:translate-x-[450%]"
      />
      <span className="relative flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            {children}
            <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </span>
    </motion.button>
  );
}



export function SocialButtons({
  onGoogle,
  onGithub,
}: {
  onGoogle?: () => void;
  onGithub?: () => void;
}) {
  const base =
    'flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white/80 transition hover:border-white/25 hover:bg-white/[0.09] hover:text-white active:scale-[0.98]';
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={onGoogle} className={base}>
        <GoogleLogo size={24} color="#6ae792" weight="light" />
        Google
      </button>
      <button type="button" onClick={onGithub} className={base}>
        <GithubLogo size={24} color="#6ae792" weight="light" />
        GitHub
      </button>
    </div>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/30">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
      {children}
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
    </div>
  );
}

export function FormHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
      <p className="mt-2 text-[15px] text-white/50">{subtitle}</p>
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
