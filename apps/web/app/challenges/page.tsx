'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useHabits } from '@repo/query/habits/useHabits';
import { useGamificationSummary } from '@repo/query/gamification/useGamificationSummary';
import { useShieldUsages } from '@repo/query/gamification/useGamificationMutations';
import { habitStreak } from '../../components/habits/utils';

import { 
  Swords, 
  Shield, 
  Flame, 
  Zap, 
  Target, 
  CalendarDays, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

export default function ChallengesPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data: habits = [] } = useHabits(userId);
  const { data: summary } = useGamificationSummary(userId);
  const { data: shieldUsages = [] } = useShieldUsages(userId);

  const activeHabits = useMemo(() => habits.filter((h: any) => !h.archived), [habits]);

  // Total completed check-in logs
  const totalLogs = useMemo(() => {
    return habits.reduce((acc: number, h: any) => acc + (h.logs?.length || 0), 0);
  }, [habits]);

  // Max streak across all user habits
  const maxStreak = useMemo(() => {
    let best = 0;
    for (const h of activeHabits) {
      const s = habitStreak(h.logs || [], shieldUsages, h.id);
      if (s > best) best = s;
    }
    return best;
  }, [activeHabits, shieldUsages]);

  // Real Active 30-Day Challenge
  const activeChallenge = useMemo(() => {
    const currentProgress = Math.min(30, maxStreak);
    const progressPercent = Math.round((currentProgress / 30) * 100);
    const isCompleted = maxStreak >= 30;

    return {
      title: '30-Day Consistency Challenge',
      description: 'Build an unbroken streak of at least 30 consecutive compounding days.',
      progress: currentProgress,
      total: 30,
      progressPercent,
      isCompleted,
      rewardSparks: 1500,
      color: '#3B82F6',
      icon: Shield,
    };
  }, [maxStreak]);

  // Real Tracked Challenges
  const challengesList = useMemo(() => {
    return [
      {
        id: 'sprint',
        title: '7-Day Momentum Sprint',
        description: 'Complete all scheduled habits for 7 consecutive days without breaking your chain.',
        duration: '7 Days',
        difficulty: 'Medium',
        current: Math.min(7, maxStreak),
        total: 7,
        rewardSparks: 500,
        icon: Flame,
        color: '#F59E0B',
        isCompleted: maxStreak >= 7,
      },
      {
        id: 'centurion',
        title: 'Centurion Milestone',
        description: 'Log 100 total habit completion sessions across your active routines.',
        duration: '100 Sessions',
        difficulty: 'Hard',
        current: Math.min(100, totalLogs),
        total: 100,
        rewardSparks: 1000,
        icon: Target,
        color: '#EC4899',
        isCompleted: totalLogs >= 100,
      },
      {
        id: 'architect',
        title: 'Habit System Architect',
        description: 'Design and sustain a daily system of 5 or more active habits.',
        duration: '5 Habits',
        difficulty: 'Medium',
        current: Math.min(5, activeHabits.length),
        total: 5,
        rewardSparks: 400,
        icon: Sparkles,
        color: '#10B981',
        isCompleted: activeHabits.length >= 5,
      },
      {
        id: 'vault',
        title: 'Sparks Treasury Challenge',
        description: 'Amass a reward balance of 300 or more Sparks in your rewards wallet.',
        duration: '300 Sparks',
        difficulty: 'Hard',
        current: Math.min(300, summary?.sparksBalance ?? 150),
        total: 300,
        rewardSparks: 600,
        icon: Zap,
        color: '#F59E0B',
        isCompleted: (summary?.sparksBalance ?? 150) >= 300,
      },
    ];
  }, [maxStreak, totalLogs, activeHabits, summary]);

  return (
    <main
      className="min-h-screen text-[var(--c-text)] pb-24"
      style={{
        backgroundColor: 'var(--c-bg)',
        backgroundImage:
          'linear-gradient(var(--c-grid) 1px, transparent 1px), linear-gradient(90deg, var(--c-grid) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      <div className="mx-auto max-w-7xl space-y-8 px-6 pt-16 pb-10 lg:py-10">
        
        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--c-primary)]/10 text-[var(--c-primary)]">
                <Swords size={20} />
              </div>
              <h1 className="mt-2 text-4xl font-semibold text-[var(--c-text)] sm:text-5xl" style={fontDisplay}>
                Challenges
              </h1>
            </div>
            <p className="mt-4 text-[var(--c-muted)] max-w-xl">
              Push your limits and test your consistency. Complete real-time challenges to earn massive Sparks and level up.
            </p>
          </div>
        </header>

        {/* Active Challenge Spotlight */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
              Active Main Challenge
            </h2>
            <span className="flex items-center gap-2 text-sm text-[var(--c-primary)]" style={fontMono}>
              <Sparkles size={16} />
              {activeChallenge.rewardSparks} Sparks Potential
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-10 shadow-sm group hover:border-[var(--c-border-hover)] transition-all">
            <div 
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
              style={{ backgroundColor: activeChallenge.color }}
            />
            
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <div 
                  className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl bg-[var(--c-surface-soft)] shadow-inner"
                  style={{ border: `1px solid ${activeChallenge.color}40` }}
                >
                  <activeChallenge.icon size={40} color={activeChallenge.color} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-widest text-[var(--c-primary)] font-semibold">Active Goal</span>
                    {activeChallenge.isCompleted && (
                      <span className="flex items-center gap-1 text-xs text-[#4ADE80] font-semibold bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
                    {activeChallenge.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--c-muted)] max-w-md">
                    {activeChallenge.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 text-xs text-[var(--c-muted)]">
                    <span className="flex items-center gap-1.5 bg-[var(--c-surface-soft)] px-2.5 py-1 rounded-md" style={fontMono}>
                      <CalendarDays size={14} className="text-[var(--c-text)]" />
                      Target: {activeChallenge.total} Days
                    </span>
                    <span className="flex items-center gap-1.5 bg-[var(--c-surface-soft)] px-2.5 py-1 rounded-md" style={fontMono}>
                      <Flame size={14} className="text-[#EF4444]" />
                      Current Streak: {activeChallenge.progress} Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="w-full md:w-1/3 flex flex-col gap-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-[var(--c-text)]" style={fontMono}>Day {activeChallenge.progress} / {activeChallenge.total}</span>
                  <span className="text-[var(--c-muted)]" style={fontMono}>{activeChallenge.progressPercent}%</span>
                </div>
                <div className="h-3 w-full bg-[var(--c-surface-soft)] rounded-full overflow-hidden border border-[var(--c-border)]/50">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ 
                      width: `${activeChallenge.progressPercent}%`,
                      background: `linear-gradient(90deg, ${activeChallenge.color}, #60A5FA)`,
                      boxShadow: `0 0 10px ${activeChallenge.color}80`
                    }} 
                  />
                </div>
                <p className="text-xs text-right text-[var(--c-muted)] mt-1">
                  {activeChallenge.isCompleted ? 'Challenge accomplished!' : `${activeChallenge.total - activeChallenge.progress} days remaining to achieve goal.`}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Tracked Challenges Grid */}
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
              Tracked Challenges
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Live progression tracked automatically from your habit entries.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {challengesList.map((challenge) => {
              const Icon = challenge.icon;
              const percent = Math.min(100, Math.round((challenge.current / challenge.total) * 100));
              
              return (
                <div 
                  key={challenge.id} 
                  className="group relative flex flex-col rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 transition-all duration-300 hover:border-[var(--c-primary)]/40 hover:shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--c-surface-soft)] transition-colors"
                      style={{ border: `1px solid ${challenge.color}30` }}
                    >
                      <Icon size={24} color={challenge.color} />
                    </div>
                    
                    <span 
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md text-[var(--c-text)] bg-[var(--c-surface-soft)]"
                      style={fontMono}
                    >
                      <Zap size={14} className="text-[#F59E0B]" />
                      +{challenge.rewardSparks} Sparks
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-[var(--c-text)]">
                        {challenge.title}
                      </h3>
                      {challenge.isCompleted ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--c-primary)] font-semibold">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-[var(--c-muted)] font-medium">
                          <Clock size={12} /> In Progress
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-snug text-[var(--c-muted)]">
                      {challenge.description}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-6 pt-4 border-t border-[var(--c-border)]/40">
                    <div className="flex justify-between text-xs font-semibold mb-1.5" style={fontMono}>
                      <span className="text-[var(--c-muted)]">{challenge.current} / {challenge.total}</span>
                      <span className="text-[var(--c-text)]">{percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--c-surface-soft)] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${percent}%`,
                          backgroundColor: challenge.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
