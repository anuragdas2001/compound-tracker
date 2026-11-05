'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useHabits } from '@repo/query/habits/useHabits';
import { useGamificationSummary } from '@repo/query/gamification/useGamificationSummary';
import { useShieldUsages } from '@repo/query/gamification/useGamificationMutations';
import { habitStreak } from '../../components/habits/utils';

import { 
  Award, 
  Flame, 
  Target, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Star,
  Lock,
  Medal,
  Shield
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

export default function AchievementsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data: habits = [] } = useHabits(userId);
  const { data: summary } = useGamificationSummary(userId);
  const { data: shieldUsages = [] } = useShieldUsages(userId);

  const activeHabits = useMemo(() => habits.filter((h: any) => !h.archived), [habits]);

  // Total completed logs
  const { totalLogs, firstLogDate } = useMemo(() => {
    let count = 0;
    let earliest: Date | null = null;
    for (const h of habits) {
      for (const log of h.logs || []) {
        count++;
        const d = new Date(log.completedAt);
        if (!earliest || d.getTime() < earliest.getTime()) {
          earliest = d;
        }
      }
    }
    return {
      totalLogs: count,
      firstLogDate: earliest ? earliest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
    };
  }, [habits]);

  // Max streak
  const maxStreak = useMemo(() => {
    let best = 0;
    for (const h of activeHabits) {
      const s = habitStreak(h.logs || [], shieldUsages, h.id);
      if (s > best) best = s;
    }
    return best;
  }, [activeHabits, shieldUsages]);

  // Dynamic real achievements evaluated from actual database state
  const achievements = useMemo(() => {
    const sparksBalance = summary?.sparksBalance ?? 150;
    const playerLevel = summary?.level ?? 1;
    const hasShield = (summary?.shields ?? 0) > 0 || shieldUsages.length > 0;

    return [
      { 
        id: 1, 
        title: 'Bronze Pioneer', 
        description: 'Complete your first habit in the platform.', 
        icon: Trophy, 
        unlockedAt: totalLogs >= 1 ? (firstLogDate || 'Unlocked') : null, 
        category: 'Milestones',
        rarity: 'Common',
        color: '#CD7F32',
        progress: `${Math.min(1, totalLogs)} / 1`,
      },
      { 
        id: 2, 
        title: 'Silver Streak', 
        description: 'Maintain a 7-day streak on any habit.', 
        icon: Medal, 
        unlockedAt: maxStreak >= 7 ? 'Unlocked' : null, 
        category: 'Streaks',
        rarity: 'Uncommon',
        color: '#C0C0C0',
        progress: `${Math.min(7, maxStreak)} / 7 days`,
      },
      { 
        id: 3, 
        title: 'Gold Standard', 
        description: 'Reach a 30-day streak of compounding habits.', 
        icon: Trophy, 
        unlockedAt: maxStreak >= 30 ? 'Unlocked' : null, 
        category: 'Streaks',
        rarity: 'Rare',
        color: '#FFD700',
        progress: `${Math.min(30, maxStreak)} / 30 days`,
      },
      { 
        id: 4, 
        title: 'Sparks Vault', 
        description: 'Accumulate a balance of 250 or more Sparks.', 
        icon: Zap, 
        unlockedAt: sparksBalance >= 250 ? 'Unlocked' : null, 
        category: 'Milestones',
        rarity: 'Epic',
        color: '#F59E0B',
        progress: `${Math.min(250, sparksBalance)} / 250 Sparks`,
      },
      { 
        id: 5, 
        title: 'Centurion', 
        description: 'Log 100 total habit check-in sessions.', 
        icon: Target, 
        unlockedAt: totalLogs >= 100 ? 'Unlocked' : null, 
        category: 'Milestones',
        rarity: 'Legendary',
        color: '#B9F2FF',
        progress: `${Math.min(100, totalLogs)} / 100 check-ins`,
      },
      { 
        id: 6, 
        title: 'Habit Architect', 
        description: 'Build a system of 5 or more active habits.', 
        icon: Star, 
        unlockedAt: activeHabits.length >= 5 ? 'Unlocked' : null, 
        category: 'Challenges',
        rarity: 'Uncommon',
        color: '#50C878',
        progress: `${Math.min(5, activeHabits.length)} / 5 habits`,
      },
      { 
        id: 7, 
        title: 'Shield Guardian', 
        description: 'Acquire or activate a Streak Shield to preserve consistency.', 
        icon: Shield, 
        unlockedAt: hasShield ? 'Unlocked' : null, 
        category: 'Milestones',
        rarity: 'Rare',
        color: '#3B82F6',
        progress: hasShield ? '1 / 1' : '0 / 1',
      },
      { 
        id: 8, 
        title: 'Level 5 Master', 
        description: 'Reach Player Level 5 through consistent habit tracking.', 
        icon: Award, 
        unlockedAt: playerLevel >= 5 ? 'Unlocked' : null, 
        category: 'Milestones',
        rarity: 'Mythic',
        color: '#8B5CF6',
        progress: `Level ${playerLevel} / 5`,
      },
    ];
  }, [totalLogs, firstLogDate, maxStreak, summary, shieldUsages, activeHabits]);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  const recentUnlock = achievements.find(a => a.unlockedAt);

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
                <Award size={20} />
              </div>
              <h1 className="mt-2 text-4xl font-semibold text-[var(--c-text)] sm:text-5xl" style={fontDisplay}>
                Achievements
              </h1>
            </div>
            <p className="mt-4 text-[var(--c-muted)] max-w-xl">
              Celebrate your consistency. Real-time milestones and badges unlocked through your actual daily compounding actions.
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-[var(--c-muted)] mb-2" style={fontMono}>
              {unlockedCount} / {totalCount} UNLOCKED ({progress}%)
            </span>
            <div className="h-2 w-48 bg-[var(--c-surface-soft)] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[var(--c-primary)] to-[#4ADE80] transition-all duration-1000" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </header>

        {/* Latest Achievement Spotlight */}
        {recentUnlock && (
          <div className="relative overflow-hidden rounded-3xl border border-[var(--c-primary)]/30 bg-[var(--c-surface)] p-8 sm:p-10 shadow-[0_0_40px_rgba(34,197,94,0.05)] group">
            <div 
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
              style={{ backgroundColor: recentUnlock.color }}
            />
            
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div 
                className="flex h-24 w-24 flex-none items-center justify-center rounded-2xl bg-[var(--c-surface-soft)] shadow-lg"
                style={{ border: `1px solid ${recentUnlock.color}40` }}
              >
                <recentUnlock.icon size={48} color={recentUnlock.color} className="drop-shadow-md" />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs uppercase tracking-widest text-[var(--c-primary)] font-semibold">Active Milestone</span>
                  <span className="text-xs text-[var(--c-muted)] bg-[var(--c-surface-soft)] px-2 py-0.5 rounded-full" style={fontMono}>
                    {recentUnlock.unlockedAt}
                  </span>
                </div>
                <h2 className="text-3xl font-semibold text-[var(--c-text)] mt-2" style={fontDisplay}>
                  {recentUnlock.title}
                </h2>
                <p className="mt-2 text-lg text-[var(--c-muted)]">
                  {recentUnlock.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-[var(--c-text)] mb-6" style={fontDisplay}>
            Badge Gallery
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((item) => {
              const isUnlocked = !!item.unlockedAt;
              const Icon = item.icon;

              return (
                <div 
                  key={item.id}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                    isUnlocked 
                      ? 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-primary)]/50 hover:shadow-lg' 
                      : 'border-[var(--c-border)]/40 bg-[var(--c-surface-soft)]/20 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
                        isUnlocked ? 'bg-[var(--c-surface-soft)] shadow-inner' : 'bg-[var(--c-surface-soft)]/40'
                      }`}
                      style={{ border: `1px solid ${isUnlocked ? item.color + '40' : 'var(--c-border)'}` }}
                    >
                      {isUnlocked ? (
                        <Icon size={24} color={item.color} />
                      ) : (
                        <Lock size={20} className="text-[var(--c-muted)]" />
                      )}
                    </div>
                    
                    <span 
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{ 
                        color: isUnlocked ? item.color : 'var(--c-muted)',
                        backgroundColor: isUnlocked ? `${item.color}15` : 'transparent',
                        border: `1px solid ${isUnlocked ? item.color + '30' : 'var(--c-border)'}`
                      }}
                    >
                      {item.rarity}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-[var(--c-text)]">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-[var(--c-muted)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[var(--c-border)]/40 pt-4 text-xs">
                    <span className="text-[var(--c-muted)]" style={fontMono}>
                      {item.progress}
                    </span>
                    {isUnlocked ? (
                      <span className="flex items-center gap-1 font-semibold text-[var(--c-primary)]">
                        <CheckCircle2 size={14} />
                        {item.unlockedAt}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[var(--c-muted)]">
                        <Clock size={14} />
                        Locked
                      </span>
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
