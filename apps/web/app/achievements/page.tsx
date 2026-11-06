'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useHabits } from '@repo/query/habits/useHabits';
import { useGamificationSummary } from '@repo/query/gamification/useGamificationSummary';
import { useShieldUsages, useAchievements } from '@repo/query/gamification/useGamificationMutations';
import { habitStreak } from '../../components/habits/utils';

import { 
  Award, 
  Target, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Star, 
  Lock, 
  Medal, 
  Shield,
  Sparkles,
  Crown
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const ICON_MAP: Record<string, any> = {
  Trophy,
  Medal,
  Star,
  Zap,
  Crown,
  Shield,
  Sparkles,
  Target,
  Award,
};

export default function AchievementsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data: habits = [] } = useHabits(userId);
  const { data: summary } = useGamificationSummary(userId);
  const { data: shieldUsages = [] } = useShieldUsages(userId);
  const { data: serverAchievements = [] } = useAchievements(userId);

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

  // Combined real achievements (preferred from server with database UserAchievement unlocks)
  const achievements = useMemo(() => {
    if (serverAchievements.length > 0) {
      return serverAchievements.map((item) => ({
        id: item.key,
        title: item.title,
        description: item.description,
        icon: ICON_MAP[item.icon] || Trophy,
        unlockedAt: item.isUnlocked ? (item.unlockedAt ? new Date(item.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unlocked') : null,
        category: item.category,
        rarity: item.rarity,
        color: item.color,
        xpReward: item.xpReward,
        sparksReward: item.sparksReward,
        progress: item.progress,
      }));
    }

    // Client-side fallback while loading initial query
    const playerLevel = summary?.level ?? 1;
    const hasShield = (summary?.shields ?? 0) > 0 || shieldUsages.length > 0;

    return [
      { 
        id: 'FIRST_HABIT', 
        title: 'Bronze Pioneer', 
        description: 'Complete your first habit in the platform.', 
        icon: Trophy, 
        unlockedAt: totalLogs >= 1 ? (firstLogDate || 'Unlocked') : null, 
        category: 'Milestones',
        rarity: 'Common',
        color: '#CD7F32',
        xpReward: 50,
        sparksReward: 25,
        progress: `${Math.min(1, totalLogs)} / 1`,
      },
      { 
        id: 'STREAK_7', 
        title: 'Silver Streak', 
        description: 'Maintain a 7-day streak on any habit.', 
        icon: Medal, 
        unlockedAt: maxStreak >= 7 ? 'Unlocked' : null, 
        category: 'Streaks',
        rarity: 'Uncommon',
        color: '#C0C0C0',
        xpReward: 100,
        sparksReward: 50,
        progress: `${Math.min(7, maxStreak)} / 7 days`,
      },
      { 
        id: 'STREAK_30', 
        title: 'Gold Standard', 
        description: 'Reach a 30-day streak of compounding habits.', 
        icon: Trophy, 
        unlockedAt: maxStreak >= 30 ? 'Unlocked' : null, 
        category: 'Streaks',
        rarity: 'Rare',
        color: '#FFD700',
        xpReward: 250,
        sparksReward: 100,
        progress: `${Math.min(30, maxStreak)} / 30 days`,
      },
      { 
        id: 'CENTURION_100', 
        title: 'Centurion Master', 
        description: 'Log 100 total habit check-in sessions.', 
        icon: Target, 
        unlockedAt: totalLogs >= 100 ? 'Unlocked' : null, 
        category: 'Volume',
        rarity: 'Epic',
        color: '#A855F7',
        xpReward: 500,
        sparksReward: 250,
        progress: `${Math.min(100, totalLogs)} / 100`,
      },
      { 
        id: 'LEVEL_5', 
        title: 'Ascending Habitier', 
        description: 'Advance your player progression to Level 5.', 
        icon: Zap, 
        unlockedAt: playerLevel >= 5 ? 'Unlocked' : null, 
        category: 'Level',
        rarity: 'Uncommon',
        color: '#3B82F6',
        xpReward: 100,
        sparksReward: 50,
        progress: `${Math.min(5, playerLevel)} / 5`,
      },
      { 
        id: 'SHIELD_PROTECTOR', 
        title: 'Aegis Defender', 
        description: 'Protect a habit streak using a Streak Shield or Freeze.', 
        icon: Shield, 
        unlockedAt: hasShield ? 'Unlocked' : null, 
        category: 'Shields',
        rarity: 'Common',
        color: '#38BDF8',
        xpReward: 50,
        sparksReward: 25,
        progress: hasShield ? '1 / 1' : '0 / 1',
      },
    ];
  }, [serverAchievements, totalLogs, firstLogDate, maxStreak, summary, shieldUsages]);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / Math.max(1, totalCount)) * 100);

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
                Achievements & Badges
              </h1>
            </div>
            <p className="mt-4 text-[var(--c-muted)] max-w-xl">
              Celebrate your consistency. Permanent database badges with automatic XP & Sparks bonuses earned through your compounding routines.
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
                <div className="mt-3 flex items-center gap-3 text-xs" style={fontMono}>
                  <span className="text-amber-400 font-semibold">+{recentUnlock.xpReward} XP</span>
                  <span className="text-[var(--c-primary)] font-semibold">+{recentUnlock.sparksReward} Sparks</span>
                </div>
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
                    <div className="mt-2 flex items-center gap-2 text-[11px]" style={fontMono}>
                      <span className="text-amber-400 font-semibold">+{item.xpReward} XP</span>
                      <span className="text-[var(--c-primary)] font-semibold">+{item.sparksReward} Sparks</span>
                    </div>
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
