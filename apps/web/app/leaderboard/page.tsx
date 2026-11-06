'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLeaderboard } from '@repo/query/gamification/useLeaderboard';
import { useAddFriend } from '@repo/query/users/useUserMutations';
import { toast } from 'react-hot-toast';
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
  Loader2,
  UserPlus,
  X,
  Search,
  Sparkles
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar?: string | null;
  sparks: number;
  totalXp: number;
  weeklyXp: number;
  monthlyXp?: number;
  level: number;
  streak: number;
  trend: 'up' | 'down' | 'same';
  isUser: boolean;
}

type TabId = 'global' | 'weekly' | 'monthly' | 'friends';

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const { data: leaderboardData, isLoading, refetch } = useLeaderboard(userId);
  const addFriendMutation = useAddFriend();

  const [activeTab, setActiveTab] = useState<TabId>('global');
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [friendInput, setFriendInput] = useState('');

  const leaderboard: LeaderboardEntry[] = (leaderboardData as any)?.[activeTab] || [];
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
    { id: 'global', label: 'Global (All-Time)', icon: Globe },
    { id: 'weekly', label: 'Weekly Sprint (7D)', icon: MapPin },
    { id: 'monthly', label: 'Monthly (30D)', icon: Trophy },
    { id: 'friends', label: 'Your Circle', icon: Users },
  ] as const;

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Please sign in first.');
      return;
    }
    if (!friendInput.trim()) {
      toast.error('Please enter an email or username.');
      return;
    }

    addFriendMutation.mutate(
      { userId, friendEmailOrUsername: friendInput.trim() },
      {
        onSuccess: (res: any) => {
          toast.success(res.data?.message || 'Friend connected successfully! 👥');
          setFriendInput('');
          setAddFriendOpen(false);
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Could not find or add user.');
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
      <div className="mx-auto max-w-5xl space-y-8 px-6 pt-16 pb-10 lg:py-10">
        
        {/* Header & Tabs */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between text-center sm:text-left">
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
              Ranked competition across cumulative discipline, weekly XP sprints, and personal circles.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Add Friend CTA */}
            <button
              onClick={() => setAddFriendOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] text-xs font-semibold text-[var(--c-text)] hover:border-[var(--c-primary)] transition-all shadow-sm"
            >
              <UserPlus size={15} className="text-[var(--c-primary)]" />
              Add Friend
            </button>

            {/* Tab Navigation */}
            <div className="flex bg-[var(--c-surface)] p-1.5 rounded-full border border-[var(--c-border)] w-full sm:w-auto overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--c-primary)] text-[var(--c-bg)] shadow-sm'
                        : 'text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface-soft)]'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
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
            <Users className="h-12 w-12 text-[var(--c-muted)] mb-3 opacity-40" />
            <h3 className="text-xl font-bold text-[var(--c-text)]">
              {activeTab === 'friends' ? 'Your Circle is Empty' : 'No rankings yet'}
            </h3>
            <p className="text-sm text-[var(--c-muted)] mt-1 max-w-md">
              {activeTab === 'friends'
                ? 'Add friends using their email or username to compete together in your private circle!'
                : 'Complete your scheduled habits today to earn XP, collect Sparks, and take the #1 podium!'}
            </p>
            {activeTab === 'friends' && (
              <button
                onClick={() => setAddFriendOpen(true)}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-primary)] text-[#07140c] text-xs font-bold shadow-md hover:brightness-110 transition-all"
              >
                <UserPlus size={15} /> Connect First Friend
              </button>
            )}
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
              <Link href={`/u/${topThree[1].username.replace('@', '')}`} className="font-semibold text-lg text-[var(--c-text)] hover:text-[#a8fe43] line-clamp-1 text-center px-2 transition-colors">
                {topThree[1].name}
              </Link>
              <span className="text-xs text-[var(--c-muted)] mb-3">{topThree[1].username}</span>
              <div className="w-full bg-[var(--c-surface-soft)] border-t-4 border-[#C0C0C0] rounded-t-xl h-24 flex flex-col items-center justify-start pt-4">
                <span className="flex items-center gap-1.5 text-[#F59E0B] font-semibold" style={fontMono}>
                  <Zap size={16} />
                  {activeTab === 'weekly'
                    ? `${topThree[1].weeklyXp} XP`
                    : activeTab === 'monthly'
                    ? `${topThree[1].monthlyXp || 0} XP`
                    : `${topThree[1].sparks.toLocaleString()} Sparks`}
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
              <Link href={`/u/${topThree[0].username.replace('@', '')}`} className="font-semibold text-xl text-[var(--c-text)] hover:text-[#a8fe43] line-clamp-1 text-center px-2 transition-colors">
                {topThree[0].name}
              </Link>
              <span className="text-xs text-[var(--c-muted)] mb-3">{topThree[0].username}</span>
              <div className="w-full bg-gradient-to-b from-[#FFD700]/20 to-[var(--c-surface-soft)] border-t-4 border-[#FFD700] rounded-t-2xl h-32 flex flex-col items-center justify-start pt-5 shadow-[0_-10px_20px_rgba(255,215,0,0.1)]">
                <span className="flex items-center gap-1.5 text-[#FFD700] font-bold text-lg drop-shadow-md" style={fontMono}>
                  <Zap size={20} />
                  {activeTab === 'weekly'
                    ? `${topThree[0].weeklyXp} XP`
                    : activeTab === 'monthly'
                    ? `${topThree[0].monthlyXp || 0} XP`
                    : `${topThree[0].sparks.toLocaleString()} Sparks`}
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
              <Link href={`/u/${topThree[2].username.replace('@', '')}`} className="font-semibold text-lg text-[var(--c-text)] hover:text-[#a8fe43] line-clamp-1 text-center px-2 transition-colors">
                {topThree[2].name}
              </Link>
              <span className="text-xs text-[var(--c-muted)] mb-3">{topThree[2].username}</span>
              <div className="w-full bg-[var(--c-surface-soft)] border-t-4 border-[#CD7F32] rounded-t-xl h-20 flex flex-col items-center justify-start pt-3">
                <span className="flex items-center gap-1.5 text-[#F59E0B] font-semibold" style={fontMono}>
                  <Zap size={16} />
                  {activeTab === 'weekly'
                    ? `${topThree[2].weeklyXp} XP`
                    : activeTab === 'monthly'
                    ? `${topThree[2].monthlyXp || 0} XP`
                    : `${topThree[2].sparks.toLocaleString()} Sparks`}
                </span>
              </div>
            </div>
          )}
        </div>
        )}

        {/* List Rankings */}
        {!isLoading && restOfBoard.length > 0 && (
        <div className="mt-8 space-y-3">
          {restOfBoard.map((user: LeaderboardEntry, index: number) => {
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
                      <Link href={`/u/${user.username.replace('@', '')}`} className={`font-semibold text-base sm:text-lg hover:underline transition-all ${isUser ? 'text-[var(--c-primary)]' : 'text-[var(--c-text)]'}`}>
                        {user.name} {isUser && '(You)'}
                      </Link>
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
                    <span className="text-xs text-[var(--c-muted)] uppercase tracking-wider mb-1">
                      {activeTab === 'weekly' ? 'Weekly XP' : activeTab === 'monthly' ? 'Monthly XP' : 'Sparks'}
                    </span>
                    <span className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-[#F59E0B]" style={fontMono}>
                      <Zap size={18} className={isUser ? "animate-pulse" : ""} />
                      {activeTab === 'weekly'
                        ? `${user.weeklyXp.toLocaleString()} XP`
                        : activeTab === 'monthly'
                        ? `${((user as any).monthlyXp || 0).toLocaleString()} XP`
                        : user.sparks.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

      </div>

      {/* Add Friend Modal */}
      {addFriendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--c-border)]/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--c-primary)]/15 text-[var(--c-primary)]">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--c-text)]" style={fontDisplay}>
                    Connect with a Friend
                  </h3>
                  <p className="text-xs text-[var(--c-muted)]">Add a peer to your private leaderboard circle</p>
                </div>
              </div>
              <button
                onClick={() => setAddFriendOpen(false)}
                className="rounded-full p-2 text-[var(--c-muted)] hover:bg-[var(--c-surface-soft)] hover:text-[var(--c-text)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFriend} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--c-muted)] mb-1.5 uppercase tracking-wider">
                  Friend Email or Username
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
                  <input
                    type="text"
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    placeholder="e.g. friend@example.com or username"
                    className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-soft)] pl-10 pr-4 py-2.5 text-sm text-[var(--c-text)] outline-none focus:border-[var(--c-primary)]"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--c-border)]/50">
                <button
                  type="button"
                  onClick={() => setAddFriendOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addFriendMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#a8fe43] text-[#07140c] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {addFriendMutation.isPending ? 'Connecting...' : 'Connect Friend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
