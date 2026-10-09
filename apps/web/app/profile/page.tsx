'use client';

import { 
  User, 
  MapPin, 
  CalendarDays, 
  Edit3, 
  Zap, 
  Flame, 
  Target, 
  Trophy,
  Activity,
  CheckCircle2,
  Medal,
  Star,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const userProfile = {
  name: 'Anurag Das',
  username: '@anurag',
  level: 24,
  currentXP: 4850,
  nextLevelXP: 5000,
  bio: 'Building consistent habits. 1% better every day. Striving for absolute perfection in daily routines.',
  location: 'Earth',
  joinedDate: 'Joined Sep 2026',
  avatarInitials: 'AD',
  titles: ['Early Bird', 'Consistency King', 'Unstoppable'],
  stats: [
    { label: 'Total Sparks', value: '4,850', icon: Zap, color: '#F59E0B' },
    { label: 'Longest Streak', value: '45 Days', icon: Flame, color: '#EF4444' },
    { label: 'Habits Done', value: '1,204', icon: Target, color: 'var(--c-primary)' },
    { label: 'Global Rank', value: '#8', icon: Crown, color: '#FFD700' },
  ],
  recentBadges: [
    { title: 'Gold Standard', color: '#FFD700', date: 'Oct 8', icon: Trophy },
    { title: 'Silver Streak', color: '#C0C0C0', date: 'Oct 5', icon: Medal },
    { title: 'Bronze Pioneer', color: '#CD7F32', date: 'Oct 1', icon: Award },
    { title: 'Early Riser', color: '#3B82F6', date: 'Sep 28', icon: Star },
  ],
  recentActivity: [
    { text: 'Completed Morning Workout', time: '2 hours ago', type: 'habit' },
    { text: 'Unlocked Gold Standard Trophy', time: 'Yesterday', type: 'achievement' },
    { text: 'Reached 45 day streak on Reading', time: '2 days ago', type: 'streak' },
    { text: 'Joined 30-Day Consistency Challenge', time: '4 days ago', type: 'challenge' },
    { text: 'Logged 3 liters of water', time: '5 days ago', type: 'habit' },
  ]
};

// Mock 4 weeks of habit data (7 days x 4 weeks = 28 days)
const heatmapData = Array.from({ length: 28 }).map((_, i) => {
  // Weighted towards higher intensity for a "good" looking graph
  const r = Math.random();
  let intensity = 0;
  if (r > 0.8) intensity = 4;
  else if (r > 0.5) intensity = 3;
  else if (r > 0.2) intensity = 2;
  else if (r > 0.05) intensity = 1;
  return { id: i, intensity };
});

function Crown(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}

export default function ProfilePage() {
  const levelProgress = (userProfile.currentXP / userProfile.nextLevelXP) * 100;

  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 4: return 'bg-[var(--c-primary)] shadow-[0_0_8px_rgba(34,197,94,0.6)]';
      case 3: return 'bg-[var(--c-primary)]/80';
      case 2: return 'bg-[var(--c-primary)]/50';
      case 1: return 'bg-[var(--c-primary)]/20';
      default: return 'bg-[var(--c-surface-soft)] border border-[var(--c-border)]/50';
    }
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
      <div className="mx-auto max-w-7xl space-y-6 px-6 pt-12 pb-10 lg:py-12">
        
        {/* HERO SECTION */}
        <div className="relative rounded-[32px] border border-[var(--c-border)]/60 bg-[var(--c-surface)] overflow-hidden shadow-2xl">
          {/* Animated Ambient Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[var(--c-primary)] opacity-10 blur-[100px] animate-pulse" style={{ animationDuration: '7s' }} />
            <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-[#3B82F6] opacity-10 blur-[80px] animate-pulse" style={{ animationDuration: '5s' }} />
            {/* Soft grid overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--c-text) 1px, transparent 1px), linear-gradient(90deg, var(--c-text) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>
          
          <div className="relative p-8 sm:p-12 z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            
            {/* Avatar & Level */}
            <div className="relative shrink-0 group">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[var(--c-primary)] via-[#3B82F6] to-[var(--c-primary)] opacity-40 blur-xl group-hover:opacity-70 transition-opacity duration-700 animate-spin-slow" />
              <div className="relative h-40 w-40 rounded-[2rem] bg-[var(--c-bg)] p-1.5 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="h-full w-full rounded-[1.6rem] bg-gradient-to-br from-[var(--c-surface)] to-[var(--c-surface-soft)] border border-[var(--c-border)] flex items-center justify-center overflow-hidden">
                  <span className="text-5xl font-bold bg-gradient-to-br from-[var(--c-text)] to-[var(--c-muted)] bg-clip-text text-transparent drop-shadow-sm" style={fontDisplay}>
                    {userProfile.avatarInitials}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[var(--c-bg)] p-1.5 rounded-xl shadow-lg border border-[var(--c-border)] z-20">
                <div className="bg-gradient-to-r from-[var(--c-primary)] to-[#4ADE80] px-3 py-1 rounded-lg">
                  <span className="text-[var(--c-bg)] font-bold text-sm tracking-wide" style={fontMono}>LVL {userProfile.level}</span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 mt-4 md:mt-0 flex flex-col items-center md:items-start w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-6">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-4xl sm:text-5xl font-bold text-[var(--c-text)] tracking-tight" style={fontDisplay}>
                      {userProfile.name}
                    </h1>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--c-primary)]/10 text-[var(--c-primary)] border border-[var(--c-primary)]/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-[var(--c-muted)] font-medium">
                    <span className="text-lg">{userProfile.username}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-border)]" />
                    <span className="flex items-center gap-1"><MapPin size={14} />{userProfile.location}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--c-border)] hidden sm:block" />
                    <span className="hidden sm:flex items-center gap-1"><CalendarDays size={14} />{userProfile.joinedDate}</span>
                  </div>
                </div>

                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)]/50 shadow-sm hover:border-[var(--c-primary)]/50 hover:bg-[var(--c-primary)]/5 hover:text-[var(--c-primary)] transition-all duration-300 font-semibold group w-full sm:w-auto shrink-0">
                  <Edit3 size={16} className="group-hover:rotate-12 transition-transform" />
                  Edit Profile
                </button>
              </div>

              <p className="text-[var(--c-text)]/80 text-lg leading-relaxed mt-6 max-w-2xl text-center md:text-left">
                {userProfile.bio}
              </p>

              {/* Progress & Titles */}
              <div className="w-full mt-8 flex flex-col xl:flex-row xl:items-center gap-6 justify-between bg-[var(--c-surface-soft)]/50 p-5 rounded-2xl border border-[var(--c-border)]/40">
                <div className="w-full xl:max-w-md">
                  <div className="flex justify-between text-xs mb-2 font-semibold">
                    <span className="text-[var(--c-primary)] flex items-center gap-1"><Zap size={14} /> Progress to Lv {userProfile.level + 1}</span>
                    <span className="text-[var(--c-text)]" style={fontMono}>{userProfile.currentXP} <span className="text-[var(--c-muted)]">/ {userProfile.nextLevelXP}</span></span>
                  </div>
                  <div className="h-2.5 w-full bg-[var(--c-surface)] rounded-full overflow-hidden border border-[var(--c-border)]/50 shadow-inner">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[var(--c-primary)] to-[#60A5FA] relative" 
                      style={{ width: `${levelProgress}%` }} 
                    >
                      <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {userProfile.titles.map((title, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 bg-[var(--c-surface)] border border-[var(--c-border)]/50 text-[var(--c-text)]/90 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm cursor-default hover:border-[var(--c-primary)]/50 transition-colors">
                      <Star size={12} className="text-[var(--c-primary)]" />
                      {title}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {userProfile.stats.map((stat, idx) => (
            <div key={idx} className="group relative p-6 rounded-[24px] border border-[var(--c-border)]/60 bg-[var(--c-surface)] hover:border-[var(--c-border-hover)] transition-all duration-300 hover:shadow-xl hover:shadow-[var(--c-primary)]/5 cursor-default overflow-hidden flex flex-col justify-between">
              {/* Subtle Glow inside card */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-10 blur-3xl group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundColor: stat.color }} />
              
              <div className="flex justify-between items-start z-10 mb-4">
                <div className="p-3 rounded-2xl bg-[var(--c-surface-soft)] shadow-sm border border-[var(--c-border)]/40 group-hover:scale-110 transition-transform duration-300" style={{ color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <ArrowUpRightIcon />
              </div>
              
              <div className="z-10">
                <p className="text-3xl font-bold text-[var(--c-text)] tracking-tight mb-1" style={fontMono}>{stat.value}</p>
                <p className="text-xs text-[var(--c-muted)] font-semibold uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN LAYOUT: HEATMAP & FEED */}
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* LEFT COL: Heatmap & Badges */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Consistency Heatmap */}
            <div className="rounded-[28px] border border-[var(--c-border)]/60 bg-[var(--c-surface)] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
                    Consistency
                  </h3>
                  <p className="text-sm text-[var(--c-muted)] mt-1">Last 28 days activity</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-[var(--c-surface-soft)] px-3 py-1.5 rounded-lg text-[var(--c-primary)]">
                  <TrendingUp size={14} />
                  +12% vs last month
                </div>
              </div>
              
              <div className="flex gap-2 w-full justify-between items-end bg-[var(--c-surface-soft)]/30 p-4 rounded-2xl border border-[var(--c-border)]/40">
                {/* Simulated Columns for Weeks */}
                {Array.from({ length: 4 }).map((_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-2">
                    {heatmapData.slice(weekIdx * 7, (weekIdx + 1) * 7).map((day) => (
                      <div 
                        key={day.id} 
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] sm:rounded-md transition-colors duration-300 hover:ring-2 hover:ring-[var(--c-text)]/20 ${getHeatmapColor(day.intensity)}`}
                        title={`Activity Level ${day.intensity}`}
                      />
                    ))}
                  </div>
                ))}
                
                {/* Summary Info inside heatmap */}
                <div className="flex flex-col gap-4 ml-4">
                  <div className="bg-[var(--c-surface)] border border-[var(--c-border)]/60 p-4 rounded-xl shadow-sm text-center">
                    <p className="text-3xl font-bold text-[var(--c-text)]" style={fontDisplay}>21</p>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--c-muted)] font-semibold mt-1">Active Days</p>
                  </div>
                  <div className="flex items-center justify-between gap-1 text-[10px] text-[var(--c-muted)] font-medium px-1">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-sm bg-[var(--c-surface-soft)] border border-[var(--c-border)]/50" />
                      <div className="w-2 h-2 rounded-sm bg-[var(--c-primary)]/20" />
                      <div className="w-2 h-2 rounded-sm bg-[var(--c-primary)]/50" />
                      <div className="w-2 h-2 rounded-sm bg-[var(--c-primary)]" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase Badges Grid */}
            <div className="rounded-[28px] border border-[var(--c-border)]/60 bg-[var(--c-surface)] p-6 sm:p-8">
               <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--c-text)]" style={fontDisplay}>
                    Trophy Case
                  </h3>
                  <p className="text-sm text-[var(--c-muted)] mt-1">Rare unlocks</p>
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-[var(--c-primary)] hover:underline bg-[var(--c-primary)]/10 px-3 py-1.5 rounded-lg">
                  View All <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {userProfile.recentBadges.map((badge, idx) => (
                  <div key={idx} className="relative group p-4 rounded-2xl border border-[var(--c-border)]/50 bg-[var(--c-surface-soft)] hover:bg-[var(--c-surface)] hover:border-[var(--c-primary)]/40 transition-all duration-300 text-center flex flex-col items-center justify-center gap-3">
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity blur-md" style={{ backgroundColor: badge.color }} />
                    <div className="relative h-14 w-14 rounded-full bg-[var(--c-surface)] border border-[var(--c-border)] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 group-hover:border-transparent">
                      <div className="absolute inset-0 rounded-full border border-transparent group-hover:border-[var(--c-primary)]/50 transition-colors" />
                      <badge.icon size={24} color={badge.color} className="relative z-10 drop-shadow-sm" />
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--c-text)] text-sm line-clamp-1">{badge.title}</span>
                      <span className="text-[11px] text-[var(--c-muted)] font-medium mt-1" style={fontMono}>{badge.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COL: Activity Timeline */}
          <div className="lg:col-span-7">
            <div className="rounded-[32px] border border-[var(--c-border)]/60 bg-[var(--c-surface)] p-8 sm:p-10 h-full shadow-sm">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--c-border)]/40">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--c-primary)]/10 text-[var(--c-primary)] border border-[var(--c-primary)]/20 shadow-inner">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--c-text)]" style={fontDisplay}>
                      Activity Timeline
                    </h3>
                    <p className="text-sm text-[var(--c-muted)] mt-1 font-medium">Your recent actions across the platform.</p>
                  </div>
                </div>
              </div>

              <div className="relative border-l-2 border-[var(--c-border)]/40 ml-6 space-y-12 pb-4">
                {userProfile.recentActivity.map((activity, idx) => {
                  let iconColor = 'var(--c-muted)';
                  let Icon = CheckCircle2;
                  
                  if (activity.type === 'achievement') {
                    iconColor = '#FFD700';
                    Icon = Trophy;
                  } else if (activity.type === 'streak') {
                    iconColor = '#EF4444';
                    Icon = Flame;
                  } else if (activity.type === 'challenge') {
                    iconColor = '#3B82F6';
                    Icon = Target;
                  } else if (activity.type === 'habit') {
                    iconColor = 'var(--c-primary)';
                  }

                  return (
                    <div key={idx} className="relative pl-12 group cursor-default">
                      {/* Timeline Dot / Icon */}
                      <div className="absolute -left-[25px] top-1 h-12 w-12 rounded-full bg-[var(--c-surface)] border-4 border-[var(--c-surface)] flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-md z-10 ring-1 ring-[var(--c-border)] group-hover:ring-[var(--c-primary)]">
                        <div className="absolute inset-0 rounded-full opacity-10" style={{ backgroundColor: iconColor }} />
                        <Icon size={20} color={iconColor} className="relative z-10" />
                      </div>
                      
                      {/* Content Card */}
                      <div className="flex flex-col gap-2 p-5 rounded-2xl border border-[var(--c-border)]/40 bg-[var(--c-surface-soft)]/50 group-hover:border-[var(--c-primary)]/30 group-hover:bg-[var(--c-surface)] transition-all duration-300 shadow-sm group-hover:shadow-md">
                        <p className="text-lg text-[var(--c-text)] font-semibold leading-snug group-hover:text-[var(--c-primary)] transition-colors duration-300">
                          {activity.text}
                        </p>
                        <span className="text-xs text-[var(--c-muted)] font-medium flex items-center gap-1.5" style={fontMono}>
                          <CalendarDays size={12} />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-12 flex justify-center">
                <button className="flex items-center gap-2 text-sm font-semibold text-[var(--c-text)] px-8 py-3.5 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-soft)] hover:border-[var(--c-primary)]/50 hover:bg-[var(--c-primary)]/10 transition-all duration-300 shadow-sm">
                  View Older History <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%) skewX(-12deg);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}} />
    </main>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--c-muted)] opacity-30 group-hover:opacity-100 group-hover:text-[var(--c-primary)] transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

