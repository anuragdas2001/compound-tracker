'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  Dumbbell,
  Icon,
  Moon,
  Plus,
  Sunrise,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };

const DRAFT_KEY = 'habitly_onboarding_draft';
const MAX_HABITS = 3;
const CUSTOM_PALETTE = ['#a8fe43', '#38bdf8', '#f59e0b', '#f43f5e', '#818cf8', '#10b981'];

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-primary)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0d11]';

type Habit = { title: string; category: string; color: string };

type Identity = {
  id: string;
  title: string;
  desc: string;
  pledge: string;
  icon: LucideIcon;
  suggestedHabits: Habit[];
};

type DayCutoff = {
  id: string;
  hour: number;
  name: string;
  clock: string;
  meridiem: string;
  badge: string;
  desc: string;
  icon: LucideIcon | React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
};

const STEPS = [
  { id: 1, title: 'Identity' },
  { id: 2, title: 'Habits' },
  { id: 3, title: 'Rhythm' },
  { id: 4, title: 'Review' },
];

const IDENTITIES: Identity[] = [
  {
    id: 'builder',
    title: 'High Performer & Builder',
    desc: 'Execute with relentless focus, eliminate distractions, and ship meaningful work.',
    pledge: 'I protect my focus and ship meaningful work, one day at a time.',
    icon: Zap,
    suggestedHabits: [
      { title: 'Morning Deep Work (45m)', category: 'Productivity', color: '#a8fe43' },
      { title: 'Plan Day Priorities Night Before', category: 'Productivity', color: '#38bdf8' },
      { title: 'Inbox Zero & Clean Workspace', category: 'Focus', color: '#f59e0b' },
    ],
  },
  {
    id: 'fitness',
    title: 'Iron Discipline & Fitness',
    desc: 'Build unstoppable daily physical vitality, energy, endurance, and strength.',
    pledge: 'I train my body daily and earn my energy, endurance and strength.',
    icon: Dumbbell,
    suggestedHabits: [
      { title: 'Daily 30-min Workout', category: 'Health', color: '#10b981' },
      { title: 'Hydrate 2.5L Water', category: 'Health', color: '#06b6d4' },
      { title: '10,000 Steps Daily', category: 'Movement', color: '#a8fe43' },
    ],
  },
  {
    id: 'learner',
    title: 'Lifelong Learner & Thinker',
    desc: 'Compound knowledge daily through deliberate reading, reflection, and curiosity.',
    pledge: 'I feed my curiosity daily and let knowledge compound.',
    icon: BookOpen,
    suggestedHabits: [
      { title: 'Read 15 Pages Daily', category: 'Wisdom', color: '#38bdf8' },
      { title: 'Daily Gratitude or Journaling', category: 'Mindset', color: '#818cf8' },
      { title: 'Learn 1 New Concept', category: 'Knowledge', color: '#f43f5e' },
    ],
  },
  {
    id: 'mindful',
    title: 'Mindful & Balanced',
    desc: 'Cultivate inner calm, master sleep hygiene, and manage stress proactively.',
    pledge: 'I guard my calm, my sleep and my attention.',
    icon: Brain,
    suggestedHabits: [
      { title: '10-min Morning Meditation', category: 'Mindfulness', color: '#6366f1' },
      { title: 'Digital Sunset (No Screens After 10 PM)', category: 'Sleep', color: '#a8fe43' },
      { title: 'Evening Walk Without Phone', category: 'Recovery', color: '#ec4899' },
    ],
  },
];

const DEFAULT_IDENTITY = IDENTITIES[0]!;

// Lucide Lab Owl iconNode definition
const owl = [
  ['ellipse', { cx: '12', cy: '9', rx: '8', ry: '7' }],
  ['path', { d: 'M12 9a4 4 0 1 1 8 0v12h-4C9.4 21 4 15.6 4 9a4 4 0 1 1 8 0v1' }],
  ['path', { d: 'M8 9h.01' }],
  ['path', { d: 'M16 9h.01' }],
  ['path', { d: 'M20 21a3.9 3.9 0 1 1 0-7.8' }],
  ['path', { d: 'M10 19.4V22' }],
  ['path', { d: 'M14 20.85V22' }],
] as const;

function Owl(props: { size?: number | string; className?: string; strokeWidth?: number }) {
  // @ts-expect-error iconNode accepted by Lucide Icon
  return <Icon iconNode={owl} {...props} />;
}

const DAY_CUTOFFS: DayCutoff[] = [
  {
    id: 'midnight',
    hour: 0,
    name: 'Midnight',
    clock: '12:00',
    meridiem: 'AM',
    badge: 'Standard',
    desc: 'Classic 24-hr day. Best if you sleep before midnight.',
    icon: Moon,
  },
  {
    id: 'night_owl',
    hour: 3,
    name: 'Night Owl',
    clock: '3:00',
    meridiem: 'AM',
    badge: 'Recommended',
    desc: 'Read or work late? Your streak stays alive until 3:00 AM.',
    icon: Owl,
  },
  {
    id: 'deep_night',
    hour: 4,
    name: 'Late Shift',
    clock: '4:00',
    meridiem: 'AM',
    badge: 'Extended',
    desc: 'For night shift workers and late-night builders.',
    icon: Sunrise,
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers & small components                                                */
/* -------------------------------------------------------------------------- */

function sanitizeHabits(input: unknown): Habit[] {
  if (!Array.isArray(input)) return [];
  const out: Habit[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const { title, category, color } = item as Record<string, unknown>;
    if (
      typeof title === 'string' &&
      title.trim() &&
      typeof category === 'string' &&
      typeof color === 'string' &&
      /^#[0-9a-f]{6}$/i.test(color) &&
      !out.some(h => h.title === title)
    ) {
      out.push({ title, category, color });
    }
  }
  return out.slice(0, MAX_HABITS);
}

function Ambience({ step, reduce }: { step: number; reduce: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute left-1/2 top-[-260px] h-[480px] w-[900px] rounded-full bg-[var(--c-primary)] blur-[150px]"
        style={{ marginLeft: -450, opacity: 0.07 }}
        initial={false}
        animate={{ x: (step - 2.5) * 90 }}
        transition={{ duration: reduce ? 0 : 1.1, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 sm:mb-8">
      <h1
        className="text-balance text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] text-white sm:text-[2.6rem]"
        style={fontDisplay}
      >
        {title}
      </h1>
      <p className="mt-2.5 max-w-lg text-sm sm:text-base leading-relaxed text-[var(--c-muted)]">{subtitle}</p>
    </div>
  );
}


/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const reduceMotion = useReducedMotion() ?? false;

  const [alreadyOnboarded, setAlreadyOnboarded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [selectedIdentity, setSelectedIdentity] = useState(DEFAULT_IDENTITY.id);
  const [selectedHabits, setSelectedHabits] = useState<Habit[]>(DEFAULT_IDENTITY.suggestedHabits.slice(0, 2));
  const [customHabit, setCustomHabit] = useState('');
  const [dayCutoff, setDayCutoff] = useState('night_owl');
  const [hydrated, setHydrated] = useState(false);

  const [isFinishing, setIsFinishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outcome, setOutcome] = useState<'idle' | 'success' | 'error'>('idle');

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ----------------------------- Derived state ----------------------------- */

  const activeIdentity = IDENTITIES.find(i => i.id === selectedIdentity) ?? DEFAULT_IDENTITY;
  const activeCutoff = DAY_CUTOFFS.find(r => r.id === dayCutoff) ?? DAY_CUTOFFS[1]!;
  const ActiveIdentityIcon = activeIdentity.icon;
  const ActiveCutoffIcon = activeCutoff.icon;
  const currentStepMeta = STEPS[currentStep - 1];
  const stepPercent = Math.round((currentStep / STEPS.length) * 100);
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] ?? '';

  // Curated habits for the identity, plus anything else the person picked
  // (custom habits or carry-overs) so every selected habit is visible and removable.
  const habitRows = useMemo(() => {
    const extras = selectedHabits.filter(h => !activeIdentity.suggestedHabits.some(s => s.title === h.title));
    return [...activeIdentity.suggestedHabits, ...extras];
  }, [activeIdentity, selectedHabits]);

  /* ------------------------------ Guard: Prevent Re-entry ------------------------------ */

  useEffect(() => {
    if (status === 'authenticated') {
      const hasCompletedOnboarding = Boolean(session?.user?.hasCompletedOnboarding);
      console.log("hasCompletedOnboarding",hasCompletedOnboarding)
      if (hasCompletedOnboarding) {
        setAlreadyOnboarded(true);
        router.replace('/dashboard');
        return;
      }

      // Also verify with server preferences in case session is cached
      fetch('/api/user/preferences')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.hasCompletedOnboarding) {
            setAlreadyOnboarded(true);
            router.replace('/dashboard');
          }
        })
        .catch(() => {});
    }
  }, [status, session, router]);

  /* ------------------------------ Persistence ------------------------------ */

  // Restore draft
  useEffect(() => {
    if (alreadyOnboarded) return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const d = parsed as Record<string, unknown>;
          if (typeof d.identity === 'string' && IDENTITIES.some(i => i.id === d.identity)) {
            setSelectedIdentity(d.identity);
          }
          const habits = sanitizeHabits(d.habits);
          if (habits.length > 0) setSelectedHabits(habits);
          if (typeof d.dayCutoff === 'string' && DAY_CUTOFFS.some(r => r.id === d.dayCutoff)) {
            setDayCutoff(d.dayCutoff);
          }
          if (typeof d.step === 'number' && Number.isInteger(d.step) && d.step >= 1 && d.step <= STEPS.length) {
            setCurrentStep(d.step);
          }
        }
      }
    } catch {
      // ignore corrupted drafts
    }
    setHydrated(true);
  }, [alreadyOnboarded]);

  // Save draft (only after restore, so defaults never overwrite a saved draft)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          identity: selectedIdentity,
          habits: selectedHabits,
          dayCutoff,
          step: currentStep,
        })
      );
    } catch {
      // ignore
    }
  }, [hydrated, selectedIdentity, selectedHabits, dayCutoff, currentStep]);

  // Abandoned onboarding recovery tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isFinishing && session?.user?.email) {
        const payload = JSON.stringify({ email: session.user.email, name: session.user.name });
        navigator.sendBeacon('/api/onboarding/abandoned', new Blob([payload], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFinishing, session]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  /* ------------------------------- Navigation ------------------------------ */

  const goToStep = (stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > STEPS.length || stepNumber === currentStep) return;
    setDirection(stepNumber > currentStep ? 1 : -1);
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const handleNext = () => {
    if (currentStep === 2 && selectedHabits.length === 0) {
      toast.error('Please pick at least 1 starter habit.', { id: 'habit-min' });
      return;
    }
    goToStep(currentStep + 1);
  };

  const handleBack = () => goToStep(currentStep - 1);

  /* -------------------------------- Handlers ------------------------------- */

  const handleSelectIdentity = (identity: Identity) => {
    if (identity.id === selectedIdentity) return;
    setSelectedIdentity(identity.id);
    // Keep any custom habits the person already wrote, fill the rest with curated ones.
    const customs = selectedHabits.filter(h => h.category === 'Custom');
    setSelectedHabits([...customs, ...identity.suggestedHabits.slice(0, 2)].slice(0, MAX_HABITS));
  };

  const handleToggleHabit = (habit: Habit) => {
    const exists = selectedHabits.some(h => h.title === habit.title);
    if (exists) {
      if (selectedHabits.length <= 1) {
        toast.error('Keep at least 1 starter habit for your compounding streak!', { id: 'habit-min' });
        return;
      }
      setSelectedHabits(prev => prev.filter(h => h.title !== habit.title));
    } else {
      if (selectedHabits.length >= MAX_HABITS) {
        toast.error('Starter plan includes up to 3 daily habits. Upgrade to Pro for unlimited!', {
          id: 'habit-limit',
        });
        return;
      }
      setSelectedHabits(prev => [...prev, habit]);
    }
  };

  const handleAddCustomHabit = () => {
    const title = customHabit.trim();
    if (!title) return;
    if (selectedHabits.some(h => h.title.toLowerCase() === title.toLowerCase())) {
      toast.error('That habit is already in your blueprint.', { id: 'habit-dupe' });
      return;
    }
    if (selectedHabits.length >= MAX_HABITS) {
      toast.error('Starter plan includes up to 3 daily habits. Upgrade to Pro for unlimited!', {
        id: 'habit-limit',
      });
      return;
    }
    const customCount = selectedHabits.filter(h => h.category === 'Custom').length;
    const newHabit: Habit = {
      title,
      category: 'Custom',
      color: CUSTOM_PALETTE[customCount % CUSTOM_PALETTE.length] ?? '#a8fe43',
    };
    setSelectedHabits(prev => [...prev, newHabit]);
    setCustomHabit('');
    toast.success(`"${newHabit.title}" added to your blueprint!`);
  };

  const stopProgressTimer = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const redirectLater = (href: string, delay: number) => {
    redirectTimer.current = setTimeout(() => router.replace(href), delay);
  };

  const handleComplete = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setOutcome('idle');
    setProgress(0);

    progressTimer.current = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 120);

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityGoal: activeIdentity.title,
          habits: selectedHabits,
          dayCutoffHour: activeCutoff.hour,
        }),
      });

      stopProgressTimer();
      setProgress(100);

      if (res.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore
        }
        if (typeof update === 'function') {
          try {
            await update();
          } catch {
            // ignore
          }
        }
        setOutcome('success');
        toast.success('🎉 Your compounding routine is live!');
        redirectLater('/dashboard?onboarded=true', 1400);
      } else {
        setOutcome('error');
        toast.error('Could not finalize onboarding. Redirecting to dashboard...');
        redirectLater('/dashboard', 1200);
      }
    } catch {
      stopProgressTimer();
      setProgress(100);
      setOutcome('error');
      toast.error('Could not finalize onboarding. Redirecting to dashboard...');
      redirectLater('/dashboard', 1200);
    }
  };

  /* ------------------------------- Animation ------------------------------- */

  const offset = reduceMotion ? 0 : 32;
  const slideVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? offset : -offset, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -offset : offset, opacity: 0 }),
  };

  const panelProps = {
    custom: direction,
    variants: slideVariants,
    initial: 'enter',
    animate: 'center',
    exit: 'exit',
    transition: { duration: reduceMotion ? 0 : 0.25, ease: 'easeInOut' },
  } as const;

  const launchStatus =
    outcome === 'success'
      ? 'Your routine is live.'
      : outcome === 'error'
        ? 'Taking you to your dashboard'
        : progress < 30
          ? 'Saving your habits…'
          : progress < 60
            ? 'Crediting your Sparks…'
            : 'Sending your welcome email…';

  const launchDetail =
    outcome === 'success'
      ? 'Day 1 starts now. Your Sparks and kickoff XP are waiting.'
      : outcome === 'error'
        ? 'We could not finish setup just now. Your choices are saved on this device.'
        : null;

  /* --------------------------------- Render -------------------------------- */

  if (alreadyOnboarded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0d11]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--c-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0c0d11] text-[#e5e7eb] selection:bg-[var(--c-primary)] selection:text-black">
      <Ambience step={isFinishing ? STEPS.length : currentStep} reduce={reduceMotion} />

      {/* Progress line */}
      {!isFinishing && (
        <div className="fixed inset-x-0 top-0 z-30 h-[2px] bg-white/5" aria-hidden>
          <motion.div
            className="h-full bg-[var(--c-primary)]"
            initial={false}
            animate={{ width: `${stepPercent}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4">
        <Link href="/" className={`group inline-flex items-center gap-2.5 rounded-xl ${focusRing}`} aria-label="Habitly home">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--c-primary)]/20 bg-[var(--c-primary)]/10 p-1 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/habitly-mark.png"
              alt="Habitly Mark"
              width={28}
              height={28}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <Image
            src="/habitly-wordmark.png"
            alt="Habitly"
            width={110}
            height={25}
            className="h-6 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
            priority
          />
        </Link>

        {!isFinishing && (
          <span className="text-xs sm:text-sm font-normal text-white/50 tracking-wide">
            Step {currentStep} of {STEPS.length}
          </span>
        )}
      </header>

      <main
        className={`relative z-10 mx-auto w-full max-w-3xl flex-1 px-5 pt-1 sm:px-6 sm:pt-3 ${
          isFinishing ? 'pb-12' : 'pb-24'
        }`}
      >
        <p className="sr-only" aria-live="polite">
          Step {currentStep} of {STEPS.length}: {currentStepMeta?.title}
        </p>

        {isFinishing ? (
          /* ============================ LAUNCH ============================ */
          <motion.div
            key="launch"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
            className="flex min-h-[60vh] flex-col items-center justify-center text-center"
          >
            {outcome === 'success' ? (
              <svg viewBox="0 0 52 52" className="h-28 w-28" fill="none" aria-hidden>
                <motion.circle
                  cx="26"
                  cy="26"
                  r="24"
                  stroke="var(--c-primary)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.6, ease: 'easeOut' }}
                />
                <motion.path
                  d="M15 27.5 L23 35 L38 18"
                  stroke="var(--c-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
                />
              </svg>
            ) : (
              <div className="flex items-start justify-center" aria-hidden>
                <span
                  className="text-[6.5rem] font-medium leading-none tracking-[-0.04em] text-white tabular-nums sm:text-[9rem]"
                  style={fontDisplay}
                >
                  {progress}
                </span>
                <span className="mt-3 text-2xl text-white/40 sm:mt-5 sm:text-4xl" style={fontDisplay}>
                  %
                </span>
              </div>
            )}

            <div className="mt-8 min-h-[4.5rem]" role="status">
              <AnimatePresence mode="wait" initial={false}>
                <motion.h2
                  key={launchStatus}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                  className="text-2xl font-medium tracking-tight text-white sm:text-3xl"
                  style={fontDisplay}
                >
                  {launchStatus}
                </motion.h2>
              </AnimatePresence>
              {launchDetail && <p className="mx-auto mt-3 max-w-sm text-base text-[var(--c-muted)]">{launchDetail}</p>}
            </div>

            {outcome === 'idle' && (
              <div className="mt-6 h-[3px] w-56 overflow-hidden rounded-full bg-white/10" aria-hidden>
                <motion.div
                  className="h-full rounded-full bg-[var(--c-primary)]"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )}
          </motion.div>
        ) : (
          /* ============================= STEPS ============================ */
          <AnimatePresence mode="wait" custom={direction}>
            {/* ---------------------- 1. Identity ---------------------- */}
            {currentStep === 1 && (
              <motion.div key="step-1" {...panelProps}>
                <Heading
                  title="Who are you compounding into?"
                  subtitle={`${firstName ? `Welcome, ${firstName}. ` : ''}Habits stick when they belong to an identity, not a to-do list.`}
                />

                <div role="radiogroup" aria-label="Core identity" className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                  {IDENTITIES.map(identity => {
                    const Icon = identity.icon;
                    const isSelected = selectedIdentity === identity.id;
                    const [first, second] = identity.suggestedHabits;

                    return (
                      <button
                        key={identity.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectIdentity(identity)}
                        className={`group relative flex w-full cursor-pointer items-start justify-between py-3.5 sm:py-4 px-2 text-left transition-all duration-300 ${focusRing} ${
                          isSelected ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                        }`}
                      >
                        <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1 pr-4">
                          <Icon
                            size={24}
                            strokeWidth={1.5}
                            className={`mt-1 shrink-0 transition-colors duration-300 ${
                              isSelected ? 'text-[var(--c-primary)]' : 'text-white/25 group-hover:text-white/50'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <span
                              className={`block text-balance text-xl sm:text-2xl font-medium tracking-tight transition-colors duration-300 ${
                                isSelected ? 'text-white' : 'text-white/35 group-hover:text-white/70'
                              }`}
                              style={fontDisplay}
                            >
                              {identity.title}
                            </span>
                            <AnimatePresence initial={false}>
                              {isSelected && (
                                <motion.div
                                  key="detail"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <p className="mt-1 text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">
                                    {identity.desc}
                                  </p>
                                  {first && second && (
                                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/70">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-primary)]" />
                                      <span>Starter habits: <span className="text-white font-medium">{first.title}</span> &amp; <span className="text-white font-medium">{second.title}</span></span>
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="mt-1 shrink-0 flex items-center">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
                              isSelected
                                ? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-black shadow-[0_0_10px_rgba(168,254,67,0.35)]'
                                : 'border-white/20 group-hover:border-white/40'
                            }`}
                          >
                            {isSelected && <Check size={11} strokeWidth={3.5} />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ----------------------- 2. Habits ----------------------- */}
            {currentStep === 2 && (
              <motion.div key="step-2" {...panelProps}>
                <Heading
                  title="Pick your first micro-habits"
                  subtitle="Choose up to 3 daily habits. Start small so you never miss twice."
                />

                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-white/50">
                    Curated for <span className="text-white font-semibold">{activeIdentity.title}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1" aria-hidden>
                      {Array.from({ length: MAX_HABITS }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                            i < selectedHabits.length
                              ? 'bg-[var(--c-primary)] shadow-[0_0_6px_rgba(168,254,67,0.5)]'
                              : 'bg-white/15'
                          }`}
                        />
                      ))}
                    </span>
                    <span className="font-semibold text-white/80">
                      {selectedHabits.length} of {MAX_HABITS} selected
                    </span>
                  </div>
                </div>

                <div
                  role="group"
                  aria-label="Starter habits"
                  className="divide-y divide-white/[0.08] border-y border-white/[0.08]"
                >
                  {habitRows.map(habit => {
                    const isSelected = selectedHabits.some(h => h.title === habit.title);
                    const isCustom = habit.category === 'Custom';
                    const isLocked = !isSelected && selectedHabits.length >= MAX_HABITS;

                    return (
                      <button
                        key={habit.title}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={isLocked}
                        onClick={() => handleToggleHabit(habit)}
                        className={`group relative flex w-full cursor-pointer items-center justify-between py-3 sm:py-3.5 px-2 text-left transition-all duration-200 ${focusRing} ${
                          isSelected ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                        } ${isLocked ? 'cursor-not-allowed opacity-35' : ''}`}
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1 pr-3">
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                              isSelected
                                ? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-black shadow-[0_0_10px_rgba(168,254,67,0.35)]'
                                : 'border-white/20 group-hover:border-white/40'
                            }`}
                          >
                            {isSelected && <Check size={11} strokeWidth={3.5} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <span
                              className={`block text-sm sm:text-base font-medium transition-colors duration-200 ${
                                isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                              }`}
                            >
                              {habit.title}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white/50 bg-white/[0.03] border border-white/[0.06]">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            {habit.category}
                          </span>

                          {isSelected && isCustom && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={e => {
                                e.stopPropagation();
                                handleToggleHabit(habit);
                              }}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  handleToggleHabit(habit);
                                }
                              }}
                              className="cursor-pointer text-xs text-rose-400 hover:text-rose-300 p-1"
                              aria-label={`Remove ${habit.title}`}
                            >
                              <X size={14} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 transition-all focus-within:border-[var(--c-primary)]/40 focus-within:bg-white/[0.03]">
                    <Plus size={16} className="shrink-0 text-white/40" aria-hidden />
                    <input
                      id="custom-habit"
                      type="text"
                      value={customHabit}
                      maxLength={60}
                      onChange={e => setCustomHabit(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomHabit();
                        }
                      }}
                      placeholder="Add custom habit (e.g. 10 pull-ups, 15m reading)..."
                      className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomHabit}
                      disabled={!customHabit.trim() || selectedHabits.length >= MAX_HABITS}
                      className={`cursor-pointer rounded-lg bg-[var(--c-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--c-primary)] transition hover:bg-[var(--c-primary)] hover:text-black disabled:cursor-not-allowed disabled:opacity-30 ${focusRing}`}
                    >
                      Add
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/40">
                    Free tier supports up to {MAX_HABITS} starter habits. Upgrade anytime for unlimited compounding.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ---------------------- 3. Rhythm & Reset ---------------------- */}
            {currentStep === 3 && (
              <motion.div key="step-3" {...panelProps}>
                <Heading
                  title="When does your day reset?"
                  subtitle="Complete habits anytime on your schedule. Choose your reset cutoff so late nights never break your streak."
                />

                <div role="radiogroup" aria-label="Daily cutoff time" className="grid grid-cols-3 gap-4 sm:gap-8">
                  {DAY_CUTOFFS.map(slot => {
                    const SlotIcon = slot.icon;
                    const isSelected = dayCutoff === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setDayCutoff(slot.id)}
                        className={`group relative cursor-pointer pb-5 text-left transition-colors ${focusRing}`}
                      >
                        <div className="flex items-center justify-between">
                          <SlotIcon
                            size={22}
                            strokeWidth={1.5}
                            className={`transition-colors duration-300 ${
                              isSelected ? 'text-[var(--c-primary)]' : 'text-white/25 group-hover:text-white/50'
                            }`}
                          />
                          {slot.badge && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                                isSelected
                                  ? 'bg-[var(--c-primary)] text-black'
                                  : 'bg-white/10 text-white/50'
                              }`}
                            >
                              {slot.badge}
                            </span>
                          )}
                        </div>

                        <span
                          className={`mt-4 flex items-baseline gap-1.5 transition-colors duration-300 ${
                            isSelected ? 'text-white' : 'text-white/30 group-hover:text-white/60'
                          }`}
                        >
                          <span
                            className="text-[1.85rem] font-medium leading-none tracking-[-0.02em] sm:text-[2.6rem]"
                            style={fontDisplay}
                          >
                            {slot.clock}
                          </span>
                          <span className="text-xs font-medium sm:text-sm">{slot.meridiem}</span>
                        </span>

                        <span className="mt-2 block text-xs sm:text-sm font-medium text-white/80">{slot.name}</span>

                        {/* Animated underline */}
                        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10" aria-hidden />
                        <motion.span
                          aria-hidden
                          className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[var(--c-primary)]"
                          initial={false}
                          animate={{ scaleX: isSelected ? 1 : 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-start gap-2.5 text-xs sm:text-sm text-[var(--c-muted)] leading-relaxed">
                  <Zap size={16} className="mt-0.5 shrink-0 text-[var(--c-primary)]" aria-hidden />
                  <p>
                    <strong className="text-white font-medium">{activeCutoff.name} cutoff:</strong> {activeCutoff.desc} You have complete freedom to log habits anytime before {activeCutoff.clock} {activeCutoff.meridiem}.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ----------------------- 4. Review ----------------------- */}
            {currentStep === 4 && (
              <motion.div key="step-4" {...panelProps}>
                <Heading
                  title="Ready to lock in Day 1?"
                  subtitle="Your compounding blueprint is ready. Review your system or tap to adjust."
                />

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm">
                  {/* Identity & Pledge */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--c-primary)]">
                        <ActiveIdentityIcon size={14} strokeWidth={2} />
                        <span className="uppercase tracking-wider">{activeIdentity.title}</span>
                      </div>
                      <p
                        className="mt-1.5 text-base sm:text-lg font-medium leading-snug text-white"
                        style={fontDisplay}
                      >
                        &ldquo;{activeIdentity.pledge}&rdquo;
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className={`shrink-0 rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors ${focusRing}`}
                    >
                      Edit
                    </button>
                  </div>

                  {/* Day Reset Cutoff */}
                  <div className="flex items-center justify-between py-3.5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-[var(--c-primary)]">
                        <ActiveCutoffIcon size={16} strokeWidth={1.75} />
                      </div>
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-white/40">Daily Reset</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {activeCutoff.clock} {activeCutoff.meridiem} · {activeCutoff.name}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(3)}
                      className={`rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors ${focusRing}`}
                    >
                      Edit
                    </button>
                  </div>

                  {/* Selected Habits */}
                  <div className="pt-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] uppercase tracking-wider text-white/40">
                        Starter Blueprint ({selectedHabits.length} habits)
                      </span>
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className={`rounded-full bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors ${focusRing}`}
                      >
                        Edit
                      </button>
                    </div>
                    <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
                      {selectedHabits.map(h => (
                        <div
                          key={h.title}
                          className="flex items-center justify-between py-2 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: h.color }}
                              aria-hidden
                            />
                            <span className="truncate text-xs sm:text-sm font-medium text-white">{h.title}</span>
                          </div>
                          <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white/50 bg-white/[0.03] border border-white/[0.06]">
                            {h.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Kickoff Bonus Strip */}
                <div className="mt-3.5 flex items-center justify-between rounded-xl border border-[var(--c-primary)]/20 bg-[var(--c-primary)]/[0.04] px-4 py-2.5">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Zap size={14} className="text-[var(--c-primary)]" />
                    <span>Starter Kickoff Reward upon launch:</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-[var(--c-primary)]/15 px-2.5 py-0.5 text-[var(--c-primary)]">
                      +150 Sparks
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-white">
                      +50 XP
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Action bar */}
      {!isFinishing && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.06] bg-[#0c0d11]/90 backdrop-blur-xl">
          <div
            className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3 sm:px-6"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          >
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm text-white/70 transition-colors hover:text-white ${focusRing} ${
                currentStep === 1 ? 'pointer-events-none invisible' : ''
              }`}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <p className="hidden items-center gap-1.5 text-xs text-[var(--c-muted)] sm:inline-flex">
              <span className={`h-1.5 w-1.5 rounded-full ${hydrated ? 'bg-emerald-400' : 'bg-white/20'}`} aria-hidden />
              Draft saved
            </p>

            <button
              type="button"
              onClick={currentStep < STEPS.length ? handleNext : handleComplete}
              className={`inline-flex cursor-pointer items-center rounded-full bg-[var(--c-primary)] px-7 py-2.5 text-sm sm:text-base font-semibold text-black shadow-[0_4px_20px_rgba(168,254,67,0.25)] transition hover:brightness-110 active:scale-[0.98] ${focusRing}`}
            >
              {currentStep < STEPS.length ? 'Continue' : 'Launch Day 1'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}