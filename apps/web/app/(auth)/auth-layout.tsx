'use client';
import Link from 'next/link';
import { Flame } from 'lucide-react';

const heatmap = Array.from({ length: 28 }, (_, i) => i % 5 !== 0);

export function AuthLayout({
  headline,
  subtext,
  children,
}: {
  headline: React.ReactNode;
  subtext: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="grid-background" />
      <div className="hero-glow" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* LEFT — BRAND PANEL */}
        <div className="hidden flex-col justify-center px-16 py-12 lg:flex">
          <Link href="/" className="mb-12 flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" />
            <span className="text-2xl font-extrabold tracking-tighter text-primary">
              Compound
            </span>
          </Link>

          <h1 className="text-5xl font-extrabold tracking-tight text-on-surface">
            {headline}
          </h1>
          <p className="mt-6 max-w-md text-lg text-on-surface-variant">
            {subtext}
          </p>

          <div className="mt-12 max-w-md rounded-2xl border border-outline-variant/20 bg-surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">
                  Current Streak
                </p>
                <p className="mt-1 text-5xl font-extrabold tracking-tight text-on-surface">
                  127
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm text-primary">
                🔥 On Fire
              </span>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1.5">
              {heatmap.map((on, i) => (
                <div
                  key={i}
                  className={
                    on
                      ? 'liquid-fill aspect-square rounded-md'
                      : 'aspect-square rounded-md bg-on-surface/10'
                  }
                />
              ))}
            </div>
          </div>

          <p className="mt-10 text-sm text-on-surface-variant/70">
            Joined by 100K+ people building better habits, one day at a time.
          </p>
        </div>

        {/* RIGHT — FORM */}
        <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-2xl">
            <Link
              href="/"
              className="mb-10 flex items-center justify-center gap-2 lg:hidden"
            >
              <Flame className="h-6 w-6 text-primary" />
              <span className="text-2xl font-extrabold tracking-tighter text-primary">
                Compound
              </span>
            </Link>
            {children}
          </div>
        </div>
      </div>

      <style jsx>{`
        .liquid-fill {
          position: relative;
          overflow: hidden;
          background: rgba(34, 197, 94, 0.18);
        }
        .liquid-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            var(--color-primary) 0%,
            #00a572 100%
          );
          box-shadow:
            inset 0 0 10px rgba(75, 226, 119, 0.6),
            0 0 15px rgba(75, 226, 119, 0.35);
        }
      `}</style>
    </div>
  );
}
