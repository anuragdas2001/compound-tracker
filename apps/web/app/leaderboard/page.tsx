'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLeaderboard } from '@repo/query/gamification/useLeaderboard';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Medal, 
  Crown,
  ChevronUp,
  ChevronDown,
  Minus,
  Globe,
  MapPin,
  Users,
  Loader2
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

type TabId = 'global' | 'weekly' | 'friends';

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const { data: leaderboardData, isLoading } = useLeaderboard(userId);

  const [activeTab, setActiveTab] = useState<TabId>('global');

  const leaderboard = leaderboardData?.[activeTab] || [];
  const topThree = leaderboard.slice(0, 3);
  const restOfBoard = leaderboard.slice(3);

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <ChevronUp size={16} className="text-[#4ADE80]" />;
      case 'down': return <ChevronDown size={16} className="text-[#EF4444]" />;
      default: return <Minus size={16} className="text-[var(--c-muted)]" />;
    }
  };

  const tabs = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'weekly', label: 'Weekly', icon: MapPin },
    { id: 'friends', label: 'Your Circle', icon: Users },
  ] as const;

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
      <div className="mx-auto max-w-5xl space-y-8 px-6 pt-16 pb-10 lg:py-10">
        
        {/* Header & Tabs */}
        <header className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between text-center sm:text-left">
          <div className="mx-auto sm:mx-0">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--c-primary)]/10 text-[var(--c-primary)]">
                <Trophy size={20} />
              </div>
              <h1 className="mt-2 text-4xl font-semibold text-[var(--c-text)] sm:text-5xl" style={fontDisplay}>
                Leaderboard
              </h1>
            </div>
            <p className="mt-4 text-[var(--c-muted)] max-w-xl mx-auto sm:mx-0">
              Compete with the most consistent users globally, nationally, or in your custom groups.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-[var(--c-surface)] p-1.5 rounded-full border border-[var(--c-border)] self-center sm:self-auto w-full sm:w-auto overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--c-primary)] text-[var(--c-bg)] shadow-sm'
                      : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface-soft)]'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--c-primary)]" />
            <p className="text-sm font-medium text-[var(--c-muted)]">Loading live leaderboard rankings...</p>
          </div>
        )}

        {!isLoading && leaderboard.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] p-8">
            <Trophy className="h-12 w-12 text-[var(--c-muted)] mb-3 opacity-40" />
            <h3 className="text-xl font-bold text-[var(--c-text)]">No rankings yet</h3>
            <p className="text-sm text-[var(--c-muted)] mt-1 max-w-md">
              Complete your scheduled habits today to earn XP, collect Sparks, and take the #1 podium!
            </p>
          </div>
        )}

        {/* Top 3 Podium */}
        {!isLoading && leaderboard.length > 0 && (
          <div className="mt-16 flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 lg:gap-10 pb-8 border-b border-[var(--c-border)]/50 min-h-[250px]">
          
          {/* Rank 2 - Silver */}
          {topThree[1] && (
            <div className="flex flex-col items-center order-2 sm:order-1 w-full sm:w-1/3 max-w-[200px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative mb-4">
                <div className="h-20 w-20 rounded-full bg-[var(--c-surface)] border-4 border-[#C0C0C0] flex items-center justify-center shadow-[0_0_20px_rgba(192,192,192,0.3)]">
                  <span className="text-2xl font-bold text-[#C0C0C0]" style={fontDisplay}>2</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#C0C0C0] p-1.5 rounded-full text-[var(--c-bg)]">
                  <Medal size={16} />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-[var(--c-text)] line-clamp-1 text-center px-2">{topThree[1].name}</h3>
              <span className="text-xs text-[var(--c-muted)] mb-3">{topThree[1].username}</span>
              <div className="w-full bg-[var(--c-surface-soft)] border-t-4 border-[#C0C0C0] rounded-t-xl h-24 flex flex-col items-center justify-start pt-4">
                <span className="flex items-center gap-1.5 text-[#F59E0B] font-semibold" style={fontMono}>
                  <Zap size={16} />
                  {topThree[1].sparks.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Rank 1 - Gold */}
          {topThree[0] && (
            <div className="flex flex-col items-center order-1 sm:order-2 w-full sm:w-1/3 max-w-[220px] -mt-10 sm:-mt-0 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="relative mb-4">
                <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" size={36} />
                <div className="h-28 w-28 rounded-full bg-[var(--c-surface)] border-4 border-[#FFD700] flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                  <span className="text-4xl font-bold text-[#FFD700]" style={fontDisplay}>1</span>
                </div>
              </div>
              <h3 className="font-semibold text-xl text-[var(--c-text)] line-clamp-1 text-center px-2">{topThree[0].name}</h3>
              <span className="text-xs text-[var(--c-muted)] mb-3">{topThree[0].username}</span>
              <div className="w-full bg-gradient-to-b from-[#FFD700]/20 to-[var(--c-surface-soft)] border-t-4 border-[#FFD700] rounded-t-2xl h-32 flex flex-col items-center justify-start pt-5 shadow-[0_-10px_20px_rgba(255,215,0,0.1)]">
                <span className="flex items-center gap-1.5 text-[#FFD700] font-bold text-lg drop-shadow-md" style={fontMono}>
                  <Zap size={20} />
                  {topThree[0].sparks.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Rank 3 - Bronze */}
          {topThree[2] && (
            <div className="flex flex-col items-center order-3 sm:order-3 w-full sm:w-1/3 max-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="relative mb-4">
                <div className="h-20 w-20 rounded-full bg-[var(--c-surface)] border-4 border-[#CD7F32] flex items-center justify-center shadow-[0_0_20px_rgba(205,127,50,0.3)]">
                  <span className="text-2xl font-bold text-[#CD7F32]" style={fontDisplay}>3</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#CD7F32] p-1.5 rounded-full text-[var(--c-bg)]">
                  <Medal size={16} />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-[var(--c-text)] line-clamp-1 text-center px-2">{topThree[2].name}</h3>
              <span className="text-xs text-[var(--c-muted)] mb-3">{topThree[2].username}</span>
              <div className="w-full bg-[var(--c-surface-soft)] border-t-4 border-[#CD7F32] rounded-t-xl h-20 flex flex-col items-center justify-start pt-3">
                <span className="flex items-center gap-1.5 text-[#F59E0B] font-semibold" style={fontMono}>
                  <Zap size={16} />
                  {topThree[2].sparks.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
        )}

        {/* List Rankings */}
        {!isLoading && restOfBoard.length > 0 && (
        <div className="mt-8 space-y-3">
          {restOfBoard.map((user, index) => {
            const rank = index + 4;
            const isUser = user.isUser;
            
            return (
              <div 
                key={user.id}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 ${
                  isUser 
                    ? 'border-[var(--c-primary)] bg-[var(--c-primary)]/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
                    : 'border-[var(--c-border)] bg-[var(--c-surface)] hover:border-[var(--c-border-hover)]'
                }`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Rank & Trend */}
                  <div className="flex flex-col items-center justify-center w-8">
                    <span className={`text-lg font-bold ${isUser ? 'text-[var(--c-primary)]' : 'text-[var(--c-muted)]'}`} style={fontDisplay}>
                      #{rank}
                    </span>
                    {getTrendIcon(user.trend)}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-4">
                    <div className={`hidden sm:flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg ${
                      isUser ? 'bg-[var(--c-primary)] text-[var(--c-bg)]' : 'bg-[var(--c-surface-soft)] text-[var(--c-text)]'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-base sm:text-lg ${isUser ? 'text-[var(--c-primary)]' : 'text-[var(--c-text)]'}`}>
                        {user.name} {isUser && '(You)'}
                      </h4>
                      <p className="text-xs text-[var(--c-muted)]">{user.username}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 sm:gap-10">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-[var(--c-muted)] uppercase tracking-wider mb-1">Streak</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--c-text)]" style={fontMono}>
                      <Flame size={14} className="text-[#EF4444]" />
                      {user.streak}
                    </span>
                  </div>
                  <div className="flex flex-col items-end min-w-[80px]">
                    <span className="text-xs text-[var(--c-muted)] uppercase tracking-wider mb-1">Sparks</span>
                    <span className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-[#F59E0B]" style={fontMono}>
                      <Zap size={18} className={isUser ? "animate-pulse" : ""} />
                      {user.sparks.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {restOfBoard.length === 0 && topThree.length > 0 && (
            <div className="text-center py-10 text-[var(--c-muted)]">
              No more players to display in this leaderboard.
            </div>
          )}
        </div>
        )}

      </div>
    </main>
  );
}
