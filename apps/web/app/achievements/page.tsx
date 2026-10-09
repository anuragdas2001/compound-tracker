'use client';

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
  Medal
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

// Mock data for achievements
const achievements = [
  { 
    id: 1, 
    title: 'Bronze Pioneer', 
    description: 'Complete your first habit.', 
    icon: Trophy, 
    unlockedAt: 'Oct 1, 2026', 
    category: 'Milestones',
    rarity: 'Common',
    color: '#CD7F32' // Bronze
  },
  { 
    id: 2, 
    title: 'Silver Streak', 
    description: 'Maintain a 7-day streak on any habit.', 
    icon: Trophy, 
    unlockedAt: 'Oct 5, 2026', 
    category: 'Streaks',
    rarity: 'Uncommon',
    color: '#C0C0C0' // Silver
  },
  { 
    id: 3, 
    title: 'Gold Standard', 
    description: 'Complete all habits for 3 consecutive days.', 
    icon: Trophy, 
    unlockedAt: 'Oct 8, 2026', 
    category: 'Streaks',
    rarity: 'Rare',
    color: '#FFD700' // Gold
  },
  { 
    id: 4, 
    title: 'Platinum Collector', 
    description: 'Earn a total of 1,000 sparks.', 
    icon: Trophy, 
    unlockedAt: 'Oct 9, 2026', 
    category: 'Milestones',
    rarity: 'Epic',
    color: '#E2E8F0' // Platinum
  },
  { 
    id: 5, 
    title: 'Diamond Consistency', 
    description: 'Maintain a 30-day streak on any habit.', 
    icon: Trophy, 
    unlockedAt: null, 
    category: 'Streaks',
    rarity: 'Legendary',
    color: '#B9F2FF' // Diamond
  },
  { 
    id: 6, 
    title: 'Ruby Master', 
    description: 'Complete a habit before 8 AM for 7 days.', 
    icon: Trophy, 
    unlockedAt: null, 
    category: 'Challenges',
    rarity: 'Legendary',
    color: '#E0115F' // Ruby
  },
  { 
    id: 7, 
    title: 'Emerald Perfectionist', 
    description: 'Achieve a 100% completion rate for a week.', 
    icon: Trophy, 
    unlockedAt: null, 
    category: 'Challenges',
    rarity: 'Legendary',
    color: '#50C878' // Emerald
  },
  { 
    id: 8, 
    title: 'Obsidian Champion', 
    description: 'Have 5 active habits with a 14+ day streak.', 
    icon: Trophy, 
    unlockedAt: null, 
    category: 'Milestones',
    rarity: 'Mythic',
    color: '#8B5CF6' // Obsidian/Purple
  },
];

export default function AchievementsPage() {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  // Get the most recently unlocked achievement
  const recentUnlock = [...achievements]
    .filter(a => a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())[0];

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
              Celebrate your consistency. Here lies the gallery of your milestones, streaks, and extraordinary results.
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-[var(--c-muted)] mb-2" style={fontMono}>
              {unlockedCount} / {totalCount} UNLOCKED
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
            {/* Background Glow */}
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
                  <span className="text-xs uppercase tracking-widest text-[var(--c-primary)] font-semibold">Latest Unlock</span>
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
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              const isUnlocked = !!achievement.unlockedAt;
              
              return (
                <div 
                  key={achievement.id} 
                  className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                    isUnlocked 
                      ? 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-primary)]/50 hover:shadow-lg' 
                      : 'border-[var(--c-border)]/50 bg-[var(--c-surface)]/30 opacity-80'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                        isUnlocked ? 'bg-[var(--c-surface-soft)]' : 'bg-[var(--c-surface)]'
                      }`}
                      style={{ 
                        border: isUnlocked ? `1px solid ${achievement.color}40` : '1px solid var(--c-border)',
                        boxShadow: isUnlocked ? `0 0 15px ${achievement.color}15` : 'none'
                      }}
                    >
                      {isUnlocked ? (
                        <Icon size={28} color={achievement.color} />
                      ) : (
                        <Lock size={24} className="text-[var(--c-muted)]" />
                      )}
                    </div>
                    
                    <span 
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${
                        isUnlocked ? 'bg-[var(--c-surface-soft)] text-[var(--c-text)]' : 'bg-transparent text-[var(--c-muted)] border border-[var(--c-border)]'
                      }`}
                    >
                      {achievement.category}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold text-lg ${isUnlocked ? 'text-[var(--c-text)]' : 'text-[var(--c-muted)]'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`mt-2 text-sm leading-snug ${isUnlocked ? 'text-[var(--c-muted)]' : 'text-[var(--c-muted)]/70'}`}>
                      {achievement.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-6">
                    {isUnlocked ? (
                      <p className="text-xs text-[var(--c-muted)] flex items-center gap-1.5" style={fontMono}>
                        <CheckCircle2 size={12} className="text-[var(--c-primary)]" />
                        Unlocked {achievement.unlockedAt}
                      </p>
                    ) : (
                      <div className="h-1.5 w-full bg-[var(--c-border)]/50 rounded-full overflow-hidden">
                        {/* Fake progress for locked items for UI polish */}
                        <div 
                          className="h-full bg-[var(--c-muted)]/30 rounded-full" 
                          style={{ width: `${Math.random() * 60}%` }} 
                        />
                      </div>
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
