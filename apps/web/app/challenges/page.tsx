'use client';

import { 
  Swords, 
  Shield, 
  Flame, 
  Zap, 
  Target, 
  Users, 
  CalendarDays, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

// Mock Data
const activeChallenge = {
  id: 1,
  title: '30-Day Consistency',
  description: 'Complete all your daily habits for 30 consecutive days without fail.',
  progress: 21,
  total: 30,
  rewardSparks: 1500,
  participants: 4520,
  icon: Shield,
  color: '#3B82F6' // Blue
};

const availableChallenges = [
  {
    id: 2,
    title: 'Morning Routine Master',
    description: 'Complete 3 morning habits before 9 AM for 14 consecutive days.',
    duration: '14 Days',
    difficulty: 'Medium',
    rewardSparks: 500,
    icon: Flame,
    color: '#F59E0B' // Amber
  },
  {
    id: 3,
    title: 'Digital Detox',
    description: 'Track less than 2 hours of recreational screen time daily for a week.',
    duration: '7 Days',
    difficulty: 'Hard',
    rewardSparks: 800,
    icon: Zap,
    color: '#EC4899' // Pink
  },
  {
    id: 4,
    title: 'Monk Mode Month',
    description: 'Strict adherence to all habits. Zero cheat days allowed.',
    duration: '30 Days',
    difficulty: 'Extreme',
    rewardSparks: 3000,
    icon: Target,
    color: '#EF4444' // Red
  }
];

export default function ChallengesPage() {
  const progressPercent = Math.round((activeChallenge.progress / activeChallenge.total) * 100);

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
              Push your limits by joining community challenges. Earn massive sparks, exclusive badges, and forge unbreakable discipline.
            </p>
          </div>
        </header>

        {/* Active Challenge Spotlight */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
              Active Challenge
            </h2>
            <span className="flex items-center gap-2 text-sm text-[var(--c-primary)]" style={fontMono}>
              <Sparkles size={16} />
              {activeChallenge.rewardSparks} Sparks Potential
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 sm:p-10 shadow-sm group hover:border-[var(--c-border-hover)] transition-all">
            {/* Background Glow */}
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
                  <h3 className="text-2xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
                    {activeChallenge.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--c-muted)] max-w-md">
                    {activeChallenge.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 text-xs text-[var(--c-muted)]">
                    <span className="flex items-center gap-1.5 bg-[var(--c-surface-soft)] px-2.5 py-1 rounded-md" style={fontMono}>
                      <CalendarDays size={14} className="text-[var(--c-text)]" />
                      {activeChallenge.total} Days
                    </span>
                    <span className="flex items-center gap-1.5 bg-[var(--c-surface-soft)] px-2.5 py-1 rounded-md" style={fontMono}>
                      <Users size={14} className="text-[var(--c-text)]" />
                      {activeChallenge.participants.toLocaleString()} joined
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="w-full md:w-1/3 flex flex-col gap-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-[var(--c-text)]" style={fontMono}>Day {activeChallenge.progress}</span>
                  <span className="text-[var(--c-muted)]" style={fontMono}>{progressPercent}%</span>
                </div>
                <div className="h-3 w-full bg-[var(--c-surface-soft)] rounded-full overflow-hidden border border-[var(--c-border)]/50">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ 
                      width: `${progressPercent}%`,
                      background: `linear-gradient(90deg, ${activeChallenge.color}, #60A5FA)`,
                      boxShadow: `0 0 10px ${activeChallenge.color}80`
                    }} 
                  />
                </div>
                <p className="text-xs text-right text-[var(--c-muted)] mt-1">Keep it up! You're almost there.</p>
              </div>

            </div>
          </div>
        </div>

        {/* Available Challenges Grid */}
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
              Available Challenges
            </h2>
            <p className="text-sm text-[var(--c-muted)] mt-1">
              Select your next proving ground.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availableChallenges.map((challenge) => {
              const Icon = challenge.icon;
              
              return (
                <div 
                  key={challenge.id} 
                  className="group relative flex flex-col rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 transition-all duration-300 hover:border-[var(--c-primary)]/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.05)] cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--c-surface-soft)] transition-colors group-hover:bg-[var(--c-surface)]"
                      style={{ border: `1px solid ${challenge.color}30` }}
                    >
                      <Icon size={24} color={challenge.color} />
                    </div>
                    
                    <span 
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md text-[var(--c-text)] bg-[var(--c-surface-soft)]"
                      style={fontMono}
                    >
                      <Zap size={14} className="text-[#F59E0B]" />
                      {challenge.rewardSparks}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg text-[var(--c-text)]">
                      {challenge.title}
                    </h3>
                    <p className="mt-2 text-sm leading-snug text-[var(--c-muted)]">
                      {challenge.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--c-muted)] bg-[var(--c-surface-soft)] border border-[var(--c-border)]/50 px-2 py-1 rounded font-medium">
                        {challenge.duration}
                      </span>
                      <span className="text-xs text-[var(--c-muted)] bg-[var(--c-surface-soft)] border border-[var(--c-border)]/50 px-2 py-1 rounded font-medium">
                        {challenge.difficulty}
                      </span>
                    </div>
                    
                    <div className="h-8 w-8 rounded-full bg-[var(--c-primary)]/10 text-[var(--c-primary)] flex items-center justify-center opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                      <ChevronRight size={18} />
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
