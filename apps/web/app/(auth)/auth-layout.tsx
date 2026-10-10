'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';

/* ----------------------------------------------------------------------- */
/* Data                                                                    */
/* ----------------------------------------------------------------------- */

// 4 weeks x 7 days. 0 = missed, 1-4 = intensity. Last cell = today.
const HEAT = [
  2, 3, 3, 1, 0, 2, 3,
  3, 2, 2, 3, 3, 1, 2,
  1, 3, 3, 2, 3, 3, 2,
  2, 3, 3, 3, 2, 4, 4,
];

const TAGLINES = [
  'Small actions. Compounded daily.',
  'Never miss twice.',
  'Show up first. Perfect later.',
  'Your streak is a promise to your future self.',
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

/* ----------------------------------------------------------------------- */
/* Backdrop: aurora + grid + "chain" revealed by the cursor + film grain    */
/* ----------------------------------------------------------------------- */

function Backdrop({
  mouseX,
  mouseY,
  reduce,
}: {
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  reduce: boolean;
}) {
  const glow = useMotionTemplate`radial-gradient(640px circle at ${mouseX}px ${mouseY}px, rgba(34,197,94,0.16), transparent 75%)`;
  const reveal = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent 70%)`;

  return (
    <>
      {/* base */}
      <div className="absolute inset-0 bg-[#050b08]" />

      {/* aurora blobs */}
      <motion.div
        aria-hidden
        className="absolute -left-[10%] top-[-10%] h-[620px] w-[620px] rounded-full bg-primary/25 blur-[140px]"
        animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 40, 0], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-[8%] bottom-[-12%] h-[640px] w-[640px] rounded-full bg-sky-500/20 blur-[150px]"
        animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -50, 0], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        aria-hidden
        className="absolute left-[38%] top-[55%] h-[380px] w-[380px] rounded-full bg-emerald-300/10 blur-[120px]"
        animate={reduce ? undefined : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />

      {/* chain links, only visible under the cursor */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ maskImage: reveal, WebkitMaskImage: reveal }}
      >
        <svg className="h-full w-full opacity-35">
          <defs>
            <pattern id="chain-links" width="72" height="36" patternUnits="userSpaceOnUse">
              <rect x="4" y="7" width="38" height="22" rx="11" fill="none" stroke="rgb(74,222,128)" strokeWidth="1.4" />
              <rect x="34" y="7" width="38" height="22" rx="11" fill="none" stroke="rgb(186,230,253)" strokeWidth="1.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chain-links)" />
        </svg>
      </motion.div>

      {/* cursor glow */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glow }} />

      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* Left panel pieces                                                       */
/* ----------------------------------------------------------------------- */

function CountUp({ to }: { to: number }) {
  const v = useMotionValue(0);
  const text = useTransform(v, (n) => Math.round(n).toString());
  useEffect(() => {
    const controls = animate(v, to, { duration: 1.8, delay: 0.9, ease: 'easeOut' });
    return () => controls.stop();
  }, [to, v]);
  return <motion.span>{text}</motion.span>;
}

function FloatChip({
  className,
  delay = 0,
  reduce,
  children,
}: {
  className: string;
  delay?: number;
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`absolute z-20 flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur-xl ${className}`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{
        opacity: { delay: 1.4 + delay, duration: 0.5 },
        scale: { delay: 1.4 + delay, type: 'spring', stiffness: 300, damping: 18 },
        y: { delay: 1.4 + delay, duration: 5 + delay, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {children}
    </motion.div>
  );
}

function StreakCard({ reduce }: { reduce: boolean }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), { stiffness: 140, damping: 16 });
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), { stiffness: 140, damping: 16 });
  const sx = useTransform(px, [-0.5, 0.5], ['0%', '100%']);
  const sy = useTransform(py, [-0.5, 0.5], ['0%', '100%']);
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${sx} ${sy}, rgba(74,222,128,0.18), transparent 70%)`;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div className="relative max-w-[26rem]" style={{ perspective: 1000 }}>
      <FloatChip
        reduce={reduce}
        className="-right-6 -top-5 border-amber-400/30 bg-amber-400/10 text-amber-300"
      >
        <Sparkles className="h-3.5 w-3.5" />
        +5 Sparks
      </FloatChip>
      <FloatChip
        reduce={reduce}
        delay={0.6}
        className="-bottom-5 -left-6 border-primary/30 bg-primary/10 text-green-300"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
          <Check className="h-3 w-3 text-black" strokeWidth={3.5} />
        </span>
        Habit complete
      </FloatChip>

      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1000 }}
        className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
      >
        {/* spotlight + top highlight */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />
        <div
          aria-hidden
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">Current streak</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="bg-gradient-to-br from-white to-white/55 bg-clip-text text-6xl font-black leading-none tracking-tighter text-transparent tabular-nums">
                  <CountUp to={127} />
                </p>
                <span className="text-sm font-medium text-white/40">days</span>
              </div>
            </div>
            <motion.span
              animate={
                reduce
                  ? undefined
                  : {
                      boxShadow: [
                        '0 0 8px rgba(249,115,22,0.2)',
                        '0 0 26px rgba(249,115,22,0.55)',
                        '0 0 8px rgba(249,115,22,0.2)',
                      ],
                    }
              }
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 px-3.5 py-1.5 text-xs font-bold text-orange-400"
            >
              <Flame className="h-3.5 w-3.5" />
              On fire
            </motion.span>
          </div>

          {/* heat grid */}
          <div className="mt-6 grid grid-cols-7 gap-2">
            {HEAT.map((lvl, i) => {
              const isToday = i === HEAT.length - 1;
              const alpha = [0, 0.25, 0.5, 0.78, 1][lvl] ?? 0;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.028, type: 'spring', stiffness: 420, damping: 22 }}
                  whileHover={{ scale: 1.28, transition: { duration: 0.12 } }}
                  className="relative aspect-square rounded-[8px]"
                  style={
                    lvl === 0
                      ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
                      : {
                          background: `linear-gradient(135deg, rgba(74,222,128,${alpha}), rgba(34,197,94,${alpha}))`,
                          boxShadow: lvl >= 3 ? `0 0 ${lvl * 5}px rgba(34,197,94,${alpha * 0.45})` : undefined,
                        }
                  }
                >
                  {isToday && (
                    <span className="absolute inset-0 animate-ping rounded-[8px] bg-primary/50 motion-reduce:animate-none" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* milestone */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-white/45">
              <span>Next milestone</span>
              <span className="text-white/70 tabular-nums">150 days</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-300"
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ delay: 1.5, duration: 1.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Tagline() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % TAGLINES.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative mt-6 flex h-7 items-center gap-3 overflow-hidden">
      <span className="h-px w-8 bg-gradient-to-r from-primary to-transparent" />
      <AnimatePresence mode="wait">
        <motion.p
          key={i}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.38 }}
          className="font-mono text-sm tracking-wide text-green-300/80"
        >
          {TAGLINES[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function AvatarStack() {
  const people = [
    { t: 'AK', g: 'from-emerald-400 to-teal-600' },
    { t: 'MR', g: 'from-sky-400 to-indigo-600' },
    { t: 'SJ', g: 'from-amber-300 to-orange-600' },
    { t: 'LT', g: 'from-fuchsia-400 to-purple-600' },
  ];
  return (
    <div className="flex items-center gap-4">
      <div className="flex -space-x-3">
        {people.map((p, i) => (
          <div
            key={p.t}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#050b08] bg-gradient-to-br ${p.g} text-[11px] font-bold text-white shadow-lg`}
            style={{ zIndex: people.length - i }}
          >
            {p.t}
          </div>
        ))}
      </div>
      <p className="text-sm text-white/50">
        Joined by <strong className="font-semibold text-white">100K+</strong> people building better habits.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Right panel pieces                                                      */
/* ----------------------------------------------------------------------- */

function AuthTabs() {
  const pathname = usePathname() ?? '';
  const isSignup = /sign-?up|register/i.test(pathname);
  const tabs = [
    { href: '/login', label: 'Log in', active: !isSignup },
    { href: '/signup', label: 'Sign up', active: isSignup },
  ];
  return (
    <div className="relative mx-auto mb-6 grid w-full max-w-[280px] grid-cols-2 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`relative z-10 rounded-full py-2 text-center text-sm font-semibold transition-colors ${
            t.active ? 'text-black' : 'text-white/55 hover:text-white'
          }`}
        >
          {t.active && (
            <motion.span
              layoutId="auth-tab-pill"
              className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-300 shadow-[0_6px_20px_-4px_rgba(34,197,94,0.6)]"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          {t.label}
        </Link>
      ))}
    </div>
  );
}

function GlowCard({ children, reduce }: { children: React.ReactNode; reduce: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[30px] bg-white/[0.07] p-px shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)]">
      {/* rotating light along the border */}
      <motion.div
        aria-hidden
        className="absolute -inset-[70%]"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0 52%, rgba(74,222,128,0.95) 72%, rgba(56,189,248,0.75) 88%, transparent 100%)',
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative rounded-[29px] bg-[#08120d]/95 p-7 backdrop-blur-2xl sm:p-9">
        <div
          aria-hidden
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
        {children}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Layout                                                                  */
/* ----------------------------------------------------------------------- */

export default function AuthLayout({
  headline,
  subtext,
  children,
}: {
  headline: React.ReactNode;
  subtext: string;
  children: React.ReactNode;
}) {
  const reduce = !!useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    mouseX.set(window.innerWidth * 0.3);
    mouseY.set(window.innerHeight * 0.4);
  }, [mouseX, mouseY]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden selection:bg-primary/30"
      onMouseMove={handleMouseMove}
    >
      <Backdrop mouseX={mouseX} mouseY={mouseY} reduce={reduce} />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] lg:grid-cols-[1.05fr_1fr]">
        {/* ============ LEFT: BRAND ============ */}
        <motion.div
          className="relative hidden flex-col justify-center px-12 py-8 lg:flex xl:px-20"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Link href="/" className="group mb-9 inline-flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/25 to-primary/5 shadow-[0_0_24px_rgba(34,197,94,0.25)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_38px_rgba(34,197,94,0.5)]">
                <Flame className="h-6 w-6 text-primary transition-transform duration-500 group-hover:rotate-12" />
              </div>
              <span className="text-3xl font-extrabold tracking-tighter text-white">Compound</span>
            </Link>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-6xl [&_.text-primary]:bg-gradient-to-r [&_.text-primary]:from-green-300 [&_.text-primary]:via-primary [&_.text-primary]:to-emerald-400 [&_.text-primary]:bg-clip-text [&_.text-primary]:text-transparent"
          >
            {headline}
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-md text-lg font-light leading-relaxed text-white/55">
            {subtext}
          </motion.p>

          <motion.div variants={item}>
            <Tagline />
          </motion.div>

          <motion.div variants={item} className="mt-9">
            <StreakCard reduce={reduce} />
          </motion.div>

          <motion.div variants={item} className="mt-9">
            <AvatarStack />
          </motion.div>
        </motion.div>

        {/* ============ RIGHT: FORM ============ */}
        <div className="relative z-20 flex flex-col items-center justify-center px-5 py-10 sm:px-10">
          <motion.div
            className="w-full max-w-[470px]"
            initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* mobile brand */}
            <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-primary" />
                <span className="text-2xl font-extrabold tracking-tighter text-white">Compound</span>
              </Link>
              <span className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                <Flame className="h-3 w-3" />
                127-day streak and counting
              </span>
            </div>

            <AuthTabs />
            <GlowCard reduce={reduce}>{children}</GlowCard>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-white/35">
              <ShieldCheck className="h-3.5 w-3.5" />
              Your data stays yours. Always encrypted.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}