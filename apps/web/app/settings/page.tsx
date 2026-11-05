'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Smartphone,
  LogOut,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Zap
} from 'lucide-react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const SETTINGS_TABS = [
  { id: 'preferences', label: 'Preferences', icon: Palette, desc: 'Themes & UI' },
  { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alerts & Emails' },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield, desc: 'Data control' },
  { id: 'account', label: 'Account Info', icon: User, desc: 'Personal details' },
  { id: 'integrations', label: 'Integrations', icon: Smartphone, desc: 'Connect apps' },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('preferences');
  const [theme, setTheme] = useState('dark');
  const [dayCutoffHour, setDayCutoffHour] = useState<number>(3);
  const [savingCutoff, setSavingCutoff] = useState(false);

  useEffect(() => {
    fetch('/api/user/preferences')
      .then(res => res.json())
      .then(data => {
        if (typeof data.dayCutoffHour === 'number') {
          setDayCutoffHour(data.dayCutoffHour);
        }
      })
      .catch(() => {});
  }, []);

  const handleCutoffChange = async (hour: number) => {
    setDayCutoffHour(hour);
    setSavingCutoff(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayCutoffHour: hour }),
      });
      if (res.ok) {
        toast.success('Day reset window updated!');
      } else {
        toast.error('Failed to update day reset window');
      }
    } catch {
      toast.error('Network error updating day reset window');
    } finally {
      setSavingCutoff(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) {
      setTheme(stored);
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.removeItem('theme');
    }
  };
  
  // Dummy toggle states
  const [toggles, setToggles] = useState({
    emailNotif: true,
    pushNotif: true,
    weeklyReport: false,
    publicProfile: true,
    showRank: true
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main
      className="min-h-screen text-[var(--c-text)] pb-24 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--c-bg)',
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(var(--c-grid) 1px, transparent 1px), linear-gradient(90deg, var(--c-grid) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--c-primary)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-[#3B82F6] opacity-[0.02] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-6 pt-12 pb-10 lg:py-12 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between pb-8 border-b border-[var(--c-border)]/40 relative">
          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--c-primary)] to-transparent rounded-r-md" />
          <div>
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--c-surface)] border border-[var(--c-border)] shadow-xl group">
                <div className="absolute inset-0 rounded-2xl bg-[var(--c-primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Settings size={28} className="text-[var(--c-primary)] group-hover:animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-[var(--c-text)] tracking-tight drop-shadow-sm" style={fontDisplay}>
                  Settings
                </h1>
                <p className="mt-1 text-[var(--c-muted)] font-medium text-lg">
                  Configure your workspace.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pt-4">
          
          {/* Sidebar Nav */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
            {SETTINGS_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                    isActive 
                      ? 'bg-[var(--c-surface)] border border-[var(--c-primary)]/30 shadow-[0_0_20px_rgba(34,197,94,0.05)]'
                      : 'border border-[var(--c-border)]/40 bg-[var(--c-surface-soft)]/30 hover:border-[var(--c-border)] hover:bg-[var(--c-surface)]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--c-primary)]/10 to-transparent" />
                  )}
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`flex items-center justify-center h-10 w-10 rounded-xl transition-colors duration-300 ${isActive ? 'bg-[var(--c-primary)] text-[var(--c-bg)] shadow-md shadow-[var(--c-primary)]/20' : 'bg-[var(--c-surface)] text-[var(--c-muted)] group-hover:text-[var(--c-text)] border border-[var(--c-border)]/50'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold transition-colors ${isActive ? 'text-[var(--c-text)]' : 'text-[var(--c-muted)] group-hover:text-[var(--c-text)]'}`}>
                        {tab.label}
                      </p>
                      <p className={`text-[11px] uppercase tracking-wider font-semibold mt-0.5 ${isActive ? 'text-[var(--c-primary)]' : 'text-[var(--c-muted)]/60'}`}>
                        {tab.desc}
                      </p>
                    </div>
                  </div>
                  
                  <ChevronRight size={18} className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-[var(--c-primary)] translate-x-0 opacity-100' : 'text-[var(--c-muted)] -translate-x-2 opacity-0 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                </button>
              );
            })}

            <div className="mt-8 pt-6 border-t border-[var(--c-border)]/40">
              <button className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-[#EF4444]/30 bg-transparent hover:bg-[#EF4444]/5 transition-all duration-300 w-full">
                <div className="flex items-center gap-4 text-[#EF4444]/80 group-hover:text-[#EF4444]">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-transparent border border-[#EF4444]/20 group-hover:bg-[#EF4444]/10 transition-colors duration-300">
                    <LogOut size={18} />
                  </div>
                  <span className="font-semibold">Sign Out</span>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Preferences Tab Content */}
            <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ${activeTab !== 'preferences' ? 'hidden' : 'block'}`}>
              
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--c-border)]/40">
                  <Palette className="text-[var(--c-primary)] opacity-80" size={24} />
                  <h3 className="text-3xl font-semibold text-[var(--c-text)]" style={fontDisplay}>Appearance</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { id: 'light', icon: Sun, label: 'Light Theme' },
                    { id: 'dark', icon: Moon, label: 'Dark Theme' },
                    { id: 'system', icon: Monitor, label: 'System Sync' }
                  ].map(t => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleThemeChange(t.id)}
                        className={`group relative flex flex-col justify-between h-40 p-6 rounded-[28px] border transition-all duration-500 overflow-hidden ${
                          isSelected 
                            ? 'border-[var(--c-primary)]/50 bg-[var(--c-surface)] shadow-[0_10px_30px_rgba(34,197,94,0.1)] -translate-y-1' 
                            : 'border-[var(--c-border)]/50 bg-[var(--c-surface-soft)]/50 hover:border-[var(--c-border)] hover:bg-[var(--c-surface)]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-br from-[var(--c-primary)]/5 to-transparent pointer-events-none" />
                        )}
                        
                        <div className="flex justify-between w-full relative z-10">
                          <div className={`p-3 rounded-[16px] transition-colors duration-500 ${isSelected ? 'bg-[var(--c-primary)] text-[var(--c-bg)] shadow-md shadow-[var(--c-primary)]/30' : 'bg-[var(--c-surface)] text-[var(--c-muted)] border border-[var(--c-border)]/50'}`}>
                            <t.icon size={22} />
                          </div>
                          
                          <div className={`flex items-center justify-center h-6 w-6 rounded-full border-2 transition-colors duration-500 ${isSelected ? 'border-[var(--c-primary)] bg-[var(--c-primary)] text-[var(--c-bg)]' : 'border-[var(--c-border)] bg-transparent'}`}>
                             {isSelected && <CheckCircle2 size={14} />}
                          </div>
                        </div>
                        
                        <span className={`text-left font-semibold text-lg relative z-10 transition-colors duration-300 ${isSelected ? 'text-[var(--c-text)]' : 'text-[var(--c-muted)] group-hover:text-[var(--c-text)]'}`}>
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--c-border)]/40">
                  <Settings className="text-[var(--c-primary)] opacity-80" size={24} />
                  <h3 className="text-3xl font-semibold text-[var(--c-text)]" style={fontDisplay}>General</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Dropdown 1 */}
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)]/50 hover:bg-[var(--c-surface)] transition-all duration-300 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Start of the week</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Determines when your weekly streaks reset.</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-[var(--c-surface-soft)] border border-[var(--c-border)] text-[var(--c-text)] rounded-[16px] pl-5 pr-12 py-3.5 outline-none focus:border-[var(--c-primary)]/50 focus:ring-1 focus:ring-[var(--c-primary)]/50 transition-all min-w-[180px] font-semibold cursor-pointer shadow-sm group-hover:border-[var(--c-border-hover)]">
                        <option>Monday</option>
                        <option>Sunday</option>
                      </select>
                      <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--c-muted)] pointer-events-none rotate-90" />
                    </div>
                  </div>
                  
                  {/* Day Reset Cutoff Window */}
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)]/50 hover:bg-[var(--c-surface)] transition-all duration-300 gap-6">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-semibold text-lg text-[var(--c-text)]">Day Reset Cutoff Window</h4>
                        <span className="rounded-full bg-[var(--c-primary)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--c-primary)]">
                          Streak Safety
                        </span>
                      </div>
                      <p className="text-sm text-[var(--c-muted)] mt-1 max-w-xl">
                        When does your day end? Habits completed anytime before this hour count towards your daily streak without resetting at midnight.
                      </p>
                    </div>
                    <div className="relative">
                      <select
                        value={dayCutoffHour}
                        onChange={(e) => handleCutoffChange(Number(e.target.value))}
                        disabled={savingCutoff}
                        className="appearance-none bg-[var(--c-surface-soft)] border border-[var(--c-border)] text-[var(--c-text)] rounded-[16px] pl-5 pr-12 py-3.5 outline-none focus:border-[var(--c-primary)]/50 focus:ring-1 focus:ring-[var(--c-primary)]/50 transition-all min-w-[240px] font-semibold cursor-pointer shadow-sm group-hover:border-[var(--c-border-hover)] disabled:opacity-50"
                      >
                        <option value={0}>12:00 AM (Midnight Standard)</option>
                        <option value={3}>3:00 AM (Night Owl — Recommended)</option>
                        <option value={4}>4:00 AM (Late Shift)</option>
                        <option value={5}>5:00 AM (Early Riser)</option>
                      </select>
                      <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--c-muted)] pointer-events-none rotate-90" />
                    </div>
                  </div>

                  {/* Dropdown 2 */}
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)]/50 hover:bg-[var(--c-surface)] transition-all duration-300 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Timezone</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Used to accurately track daily habits.</p>
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-[var(--c-surface-soft)] border border-[var(--c-border)] text-[var(--c-text)] rounded-[16px] pl-5 pr-12 py-3.5 outline-none focus:border-[var(--c-primary)]/50 focus:ring-1 focus:ring-[var(--c-primary)]/50 transition-all min-w-[180px] font-semibold cursor-pointer shadow-sm group-hover:border-[var(--c-border-hover)]">
                        <option>Auto (UTC -8:00)</option>
                        <option>UTC +0:00</option>
                        <option>UTC +5:30</option>
                      </select>
                      <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--c-muted)] pointer-events-none rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Notifications Tab Content */}
            <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ${activeTab !== 'notifications' ? 'hidden' : 'block'}`}>
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--c-border)]/40">
                  <Bell className="text-[var(--c-primary)] opacity-80" size={24} />
                  <h3 className="text-3xl font-semibold text-[var(--c-text)]" style={fontDisplay}>Notifications</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)] hover:border-[var(--c-border)] transition-all duration-300">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Push Notifications</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Receive alerts for reminders and streak warnings.</p>
                    </div>
                    <ToggleSwitch active={toggles.pushNotif} onChange={() => handleToggle('pushNotif')} />
                  </div>
                  
                  <div className="flex items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)] hover:border-[var(--c-border)] transition-all duration-300">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Email Updates</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Receive news about new challenges and features.</p>
                    </div>
                    <ToggleSwitch active={toggles.emailNotif} onChange={() => handleToggle('emailNotif')} />
                  </div>
                  
                  <div className="flex items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)] hover:border-[var(--c-border)] transition-all duration-300">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Weekly Report</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Get a summary of your week sent to your email.</p>
                    </div>
                    <ToggleSwitch active={toggles.weeklyReport} onChange={() => handleToggle('weeklyReport')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Tab Content */}
            <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ${activeTab !== 'privacy' ? 'hidden' : 'block'}`}>
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--c-border)]/40">
                  <Shield className="text-[var(--c-primary)] opacity-80" size={24} />
                  <h3 className="text-3xl font-semibold text-[var(--c-text)]" style={fontDisplay}>Privacy Controls</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)] hover:border-[var(--c-border)] transition-all duration-300">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Public Profile</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Allow others to view your profile and habit history.</p>
                    </div>
                    <ToggleSwitch active={toggles.publicProfile} onChange={() => handleToggle('publicProfile')} />
                  </div>
                  
                  <div className="flex items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)] hover:border-[var(--c-border)] transition-all duration-300">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Leaderboard Visibility</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Show your username and stats on global rankings.</p>
                    </div>
                    <ToggleSwitch active={toggles.showRank} onChange={() => handleToggle('showRank')} />
                  </div>
                </div>
              </div>
              
              <div>
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--c-border)]/40">
                   <AlertTriangle className="text-[#EF4444] opacity-80" size={24} />
                   <h3 className="text-3xl font-semibold text-[var(--c-text)]" style={fontDisplay}>Danger Zone</h3>
                 </div>
                 
                 <div className="p-8 rounded-[28px] border-2 border-[#EF4444]/20 bg-[#EF4444]/5 relative overflow-hidden">
                   {/* Striped background danger effect */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ background: 'repeating-linear-gradient(45deg, #EF4444, #EF4444 10px, transparent 10px, transparent 20px)' }} />
                   
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                       <h4 className="font-bold text-xl text-[#EF4444]">Delete Account</h4>
                       <p className="text-[var(--c-muted)] mt-2 font-medium max-w-md">
                         Permanently remove your account and all associated data. This action cannot be undone.
                       </p>
                     </div>
                     <button className="px-6 py-3.5 rounded-[16px] bg-[#EF4444]/10 text-[#EF4444] font-bold shadow-sm hover:bg-[#EF4444] hover:text-white transition-all duration-300 shrink-0 border border-[#EF4444]/20 hover:border-[#EF4444]">
                       Delete my account
                     </button>
                   </div>
                 </div>
              </div>
            </div>

            {/* Account Info Tab */}
            {activeTab === 'account' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--c-border)]/40">
                  <User className="text-[var(--c-primary)] opacity-80" size={24} />
                  <h3 className="text-3xl font-semibold text-[var(--c-text)]" style={fontDisplay}>Account Information</h3>
                </div>

                <div className="p-8 rounded-[28px] border border-[var(--c-border)]/60 bg-[var(--c-surface)] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--c-border)]/40 gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--c-muted)]">Full Name</span>
                      <p className="text-xl font-bold text-[var(--c-text)] mt-1">{session?.user?.name || 'Habit Explorer'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--c-muted)]">Membership Plan</span>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--c-primary)]/15 text-[var(--c-primary)] border border-[var(--c-primary)]/30">
                          {((session?.user as any)?.plan || 'STARTER')} PLAN
                        </span>
                        {((session?.user as any)?.plan || 'STARTER') !== 'ELITE' && (
                          <Link href="/pricing" className="text-xs font-bold text-[var(--c-primary)] hover:underline flex items-center gap-1">
                            Upgrade Plan &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--c-border)]/40 gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--c-muted)]">Email Address</span>
                      <p className="text-lg font-medium text-[var(--c-text)] mt-1 flex items-center gap-2">
                        <Mail size={16} className="text-[var(--c-muted)]" />
                        {session?.user?.email || 'explorer@compound.app'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--c-muted)]">Account ID</span>
                      <p className="text-xs font-mono text-[var(--c-muted)] mt-1">{(session?.user as any)?.id || 'local-session'}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 font-bold transition-all duration-300"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--c-border)]/40">
                  <Smartphone className="text-[var(--c-primary)] opacity-80" size={24} />
                  <h3 className="text-3xl font-semibold text-[var(--c-text)]" style={fontDisplay}>Integrations & Sync</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)]">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Google Calendar Sync</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Sync daily habit completion blocks into Google Calendar.</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--c-surface-soft)] text-[var(--c-muted)] border border-[var(--c-border)]">Coming Soon</span>
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)]">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Data Export (JSON / CSV)</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Export your complete habit logging history anytime.</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--c-primary)]/10 text-[var(--c-primary)] border border-[var(--c-primary)]/20">Available in Habits &gt; Settings</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}} />
    </main>
  );
}

function ToggleSwitch({ active, onChange }: { active: boolean, onChange: () => void }) {
  return (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-500 ease-in-out focus:outline-none border ${
        active ? 'bg-gradient-to-r from-[var(--c-primary)] to-[#4ADE80] border-transparent shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-[var(--c-surface-soft)] border-[var(--c-border)]/80 hover:border-[var(--c-border)]'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-500 ease-in-out ${
          active ? 'translate-x-[26px]' : 'translate-x-1 opacity-70'
        }`}
      />
    </button>
  );
}
