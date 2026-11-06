'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useHabits } from '@repo/query/habits/useHabits';
import { useShieldUsages, useChallenges, useClaimChallenge } from '@repo/query/gamification/useGamificationMutations';
import { habitStreak } from '../../components/habits/utils';
import { toast } from 'react-hot-toast';

import { 
  Swords, 
  Shield, 
  Flame, 
  Zap, 
  Target, 
  CalendarDays, 
  Sparkles,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const ICON_MAP: Record<string, any> = {
  Flame,
  Shield,
  Target,
  Users,
  Sparkles,
  Zap,
};

export default function ChallengesPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data: habits = [] } = useHabits(userId);
  const { data: shieldUsages = [] } = useShieldUsages(userId);
  const { data: serverChallenges = [] } = useChallenges(userId);
  const claimChallengeMutation = useClaimChallenge();

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

  // Challenges list (from server or initial computed fallback)
  const challengesList = useMemo(() => {
    if (serverChallenges.length > 0) {
      return serverChallenges.map((ch) => ({
        id: ch.key,
        key: ch.key,
        title: ch.title,
        description: ch.description,
        duration: ch.duration,
        difficulty: ch.difficulty,
        current: ch.progress,
        total: ch.target,
        rewardSparks: ch.sparksReward,
        rewardXp: ch.xpReward,
        icon: ICON_MAP[ch.icon] || Flame,
        color: ch.color,
        isCompleted: ch.isCompleted,
        isClaimed: ch.isClaimed,
        claimedAt: ch.claimedAt,
      }));
    }

    return [
      {
        id: 'SPRINT_7',
        key: 'SPRINT_7',
        title: '7-Day Momentum Sprint',
        description: 'Complete all scheduled habits for 7 consecutive days without breaking your chain.',
        duration: '7 Days',
        difficulty: 'Medium',
        current: Math.min(7, maxStreak),
        total: 7,
        rewardSparks: 500,
        rewardXp: 200,
        icon: Flame,
        color: '#F59E0B',
        isCompleted: maxStreak >= 7,
        isClaimed: false,
        claimedAt: null,
      },
      {
        id: 'CONSISTENCY_30',
        key: 'CONSISTENCY_30',
        title: '30-Day Consistency Challenge',
        description: 'Build an unbroken streak of at least 30 consecutive compounding days.',
        duration: '30 Days',
        difficulty: 'Hard',
        current: Math.min(30, maxStreak),
        total: 30,
        rewardSparks: 1500,
        rewardXp: 750,
        icon: Shield,
        color: '#3B82F6',
        isCompleted: maxStreak >= 30,
        isClaimed: false,
        claimedAt: null,
      },
      {
        id: 'CENTURION_100',
        key: 'CENTURION_100',
        title: 'Centurion Milestone',
        description: 'Log 100 total habit completion sessions across your active routines.',
        duration: '100 Sessions',
        difficulty: 'Hard',
        current: Math.min(100, totalLogs),
        total: 100,
        rewardSparks: 1000,
        rewardXp: 500,
        icon: Target,
        color: '#EC4899',
        isCompleted: totalLogs >= 100,
        isClaimed: false,
        claimedAt: null,
      },
      {
        id: 'COMMUNITY_COLLECTIVE',
        key: 'COMMUNITY_COLLECTIVE',
        title: 'Global Community Momentum',
        description: 'Contribute to the collective Compound community goal of 50 total habits completed.',
        duration: 'Community Quest',
        difficulty: 'Legendary',
        current: Math.min(50, totalLogs),
        total: 50,
        rewardSparks: 750,
        rewardXp: 350,
        icon: Users,
        color: '#10B981',
        isCompleted: totalLogs >= 50,
        isClaimed: false,
        claimedAt: null,
      },
    ];
  }, [serverChallenges, maxStreak, totalLogs]);

  const activeMain = challengesList[1] || challengesList[0]!;

  const handleClaimReward = (challengeKey: string) => {
    if (!userId) {
      toast.error('Please sign in to claim rewards.');
      return;
    }

    claimChallengeMutation.mutate(
      { userId, challengeKey },
      {
        onSuccess: (res: any) => {
          toast.success(res.data?.message || 'Challenge reward claimed successfully! 🎉');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Could not claim challenge reward.');
        },
      }
    );
  };

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
                Challenges & Quests
              </h1>
            </div>
            <p className="mt-4 text-[var(--c-muted)] max-w-xl">
              Push your discipline to the limit. Complete structured quests and claim real Sparks & XP directly into your ledger.
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
              +{activeMain.rewardSparks} Sparks & +{activeMain.rewardXp} XP
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-10 shadow-sm group hover:border-[var(--c-border-hover)] transition-all">
            <div 
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
              style={{ backgroundColor: activeMain.color }}
            />
            
            <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <div 
                  className="flex h-20 w-20 flex-none items-center justify-center rounded-2xl bg-[var(--c-surface-soft)] shadow-inner"
                  style={{ border: `1px solid ${activeMain.color}40` }}
                >
                  <activeMain.icon size={40} color={activeMain.color} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase tracking-widest text-[var(--c-primary)] font-semibold">Active Goal</span>
                    {activeMain.isCompleted && (
                      <span className="flex items-center gap-1 text-xs text-[#4ADE80] font-semibold bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
                    {activeMain.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--c-muted)] max-w-md">
                    {activeMain.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 text-xs text-[var(--c-muted)]">
                    <span className="flex items-center gap-1.5 bg-[var(--c-surface-soft)] px-2.5 py-1 rounded-md" style={fontMono}>
                      <CalendarDays size={14} className="text-[var(--c-text)]" />
                      Target: {activeMain.total}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[var(--c-surface-soft)] px-2.5 py-1 rounded-md" style={fontMono}>
                      <Flame size={14} className="text-[#EF4444]" />
                      Progress: {activeMain.current}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Claim Section */}
              <div className="w-full md:w-1/3 flex flex-col gap-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-[var(--c-text)]" style={fontMono}>
                    {activeMain.current} / {activeMain.total}
                  </span>
                  <span className="text-[var(--c-muted)]" style={fontMono}>
                    {Math.min(100, Math.round((activeMain.current / activeMain.total) * 100))}%
                  </span>
                </div>
                <div className="h-3 w-full bg-[var(--c-surface-soft)] rounded-full overflow-hidden border border-[var(--c-border)]/50">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ 
                      width: `${Math.min(100, Math.round((activeMain.current / activeMain.total) * 100))}%`,
                      background: `linear-gradient(90deg, ${activeMain.color}, #60A5FA)`,
                      boxShadow: `0 0 10px ${activeMain.color}80`
                    }} 
                  />
                </div>

                {/* Claim Button */}
                {activeMain.isCompleted ? (
                  activeMain.isClaimed ? (
                    <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#a8fe43]/15 text-[#a8fe43] font-bold text-xs border border-[#a8fe43]/30">
                      <CheckCircle2 size={16} /> Reward Claimed ✓
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClaimReward(activeMain.key)}
                      disabled={claimChallengeMutation.isPending}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#a8fe43] text-[#07140c] font-bold text-sm shadow-[0_0_20px_rgba(168,254,67,0.4)] hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Sparkles size={16} /> Claim +{activeMain.rewardSparks} Sparks & +{activeMain.rewardXp} XP
                    </button>
                  )
                ) : (
                  <p className="text-xs text-right text-[var(--c-muted)]">
                    {activeMain.total - activeMain.current} units remaining to unlock rewards.
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Tracked Challenges Grid */}
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
              Active & Community Quests
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Live progression tracked automatically from your database habit logs.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {challengesList.map((challenge) => {
              const Icon = challenge.icon;
              const percent = Math.min(100, Math.round((challenge.current / challenge.total) * 100));
              
              return (
                <div 
                  key={challenge.id} 
                  className="group relative flex flex-col justify-between rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 transition-all duration-300 hover:border-[var(--c-primary)]/40 hover:shadow-lg"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--c-surface-soft)] transition-colors"
                        style={{ border: `1px solid ${challenge.color}30` }}
                      >
                        <Icon size={24} color={challenge.color} />
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span 
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md text-[var(--c-text)] bg-[var(--c-surface-soft)]"
                          style={fontMono}
                        >
                          <Zap size={14} className="text-[#F59E0B]" />
                          +{challenge.rewardSparks} Sparks
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold" style={fontMono}>
                          +{challenge.rewardXp} XP
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-[var(--c-text)]">
                          {challenge.title}
                        </h3>
                        {challenge.isCompleted ? (
                          challenge.isClaimed ? (
                            <span className="flex items-center gap-1 text-xs text-[#a8fe43] font-semibold bg-[#a8fe43]/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={12} /> Claimed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-[#4ADE80] font-semibold bg-[#4ADE80]/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={12} /> Ready to Claim
                            </span>
                          )
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
                  </div>

                  {/* Progress & Claim CTA */}
                  <div className="mt-6 pt-4 border-t border-[var(--c-border)]/40 space-y-3">
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

                    {challenge.isCompleted && !challenge.isClaimed && (
                      <button
                        type="button"
                        onClick={() => handleClaimReward(challenge.key)}
                        disabled={claimChallengeMutation.isPending}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#a8fe43] text-[#07140c] font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all"
                      >
                        <Sparkles size={14} /> Claim +{challenge.rewardSparks} Sparks & +{challenge.rewardXp} XP
                      </button>
                    )}
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
