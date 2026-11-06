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
  Edit3
} from 'lucide-react';
import { useUserSettings, useUpdateSettings, useDeleteAccount } from '@repo/query/users/useUserMutations';
import EditProfileModal from '../../components/edit-profile-modal';

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
  const userId = (session?.user as any)?.id;

  const { data: dbSettings } = useUserSettings(userId);
  const updateSettingsMutation = useUpdateSettings();
  const deleteAccountMutation = useDeleteAccount();

  const [activeTab, setActiveTab] = useState('preferences');
  const [theme, setTheme] = useState('dark');
  const [dayCutoffHour, setDayCutoffHour] = useState<number>(3);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Sync from DB settings
  useEffect(() => {
    if (dbSettings) {
      if (typeof dbSettings.dayCutoffHour === 'number') {
        setDayCutoffHour(dbSettings.dayCutoffHour);
      }
    }
  }, [dbSettings]);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/login', redirect: false });
    } catch (err) {
      console.error('Sign out failed:', err);
    }
    window.location.href = '/login';
  };

  const handleCutoffChange = (hour: number) => {
    setDayCutoffHour(hour);
    if (!userId) return;

    updateSettingsMutation.mutate(
      { userId, data: { dayCutoffHour: hour } },
      {
        onSuccess: () => {
          toast.success('Day reset window updated!');
        },
        onError: () => {
          toast.error('Failed to update day reset window.');
        },
      }
    );
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

  const handleToggleSetting = (field: 'emailStreakReminder' | 'emailWeeklyDigest' | 'isPublicProfile') => {
    if (!userId) return;
    const currentVal = dbSettings ? dbSettings[field] : true;
    const nextVal = !currentVal;

    updateSettingsMutation.mutate(
      { userId, data: { [field]: nextVal } },
      {
        onSuccess: () => {
          toast.success('Setting saved to account!');
        },
        onError: () => {
          toast.error('Failed to save setting.');
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    if (!userId) return;

    deleteAccountMutation.mutate(userId, {
      onSuccess: async () => {
        toast.success('Account deleted successfully.');
        await handleSignOut();
      },
      onError: () => {
        toast.error('Failed to delete account. Please try again.');
      },
    });
  };

  const emailStreakReminder = dbSettings?.emailStreakReminder ?? true;
  const emailWeeklyDigest = dbSettings?.emailWeeklyDigest ?? true;
  const isPublicProfile = dbSettings?.isPublicProfile ?? true;

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
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--c-primary)]/10 text-[var(--c-primary)]">
                <Settings size={20} />
              </div>
              <h1 className="mt-2 text-4xl font-semibold text-[var(--c-text)] sm:text-5xl" style={fontDisplay}>
                Settings
              </h1>
            </div>
            <p className="mt-4 text-[var(--c-muted)] max-w-xl">
              Configure your compound habit environment, notification schedule, and account preferences.
            </p>
          </div>
        </header>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-72 shrink-0 space-y-2">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 w-full text-left relative overflow-hidden ${
                    isActive 
                      ? 'border-[var(--c-primary)]/40 bg-[var(--c-surface)] shadow-lg' 
                      : 'border-transparent bg-transparent hover:bg-[var(--c-surface-soft)]/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--c-primary)]/10 to-transparent pointer-events-none" />
                  )}
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-[var(--c-primary)] text-[var(--c-bg)] shadow-md' 
                        : 'bg-[var(--c-surface-soft)] text-[var(--c-muted)] group-hover:text-[var(--c-text)]'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm transition-colors ${isActive ? 'text-[var(--c-text)]' : 'text-[var(--c-muted)] group-hover:text-[var(--c-text)]'}`}>
                        {tab.label}
                      </h4>
                      <p className="text-xs text-[var(--c-muted)] mt-0.5">{tab.desc}</p>
                    </div>
                  </div>
                  
                  <ChevronRight size={18} className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-[var(--c-primary)] translate-x-0 opacity-100' : 'text-[var(--c-muted)] -translate-x-2 opacity-0 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                </button>
              );
            })}

            <div className="mt-8 pt-6 border-t border-[var(--c-border)]/40">
              <button 
                onClick={handleSignOut}
                className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-[#EF4444]/30 bg-transparent hover:bg-[#EF4444]/5 transition-all duration-300 w-full cursor-pointer"
              >
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
                  {/* Day Reset Cutoff Window */}
                  <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)]/50 hover:bg-[var(--c-surface)] transition-all duration-300 gap-6">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-semibold text-lg text-[var(--c-text)]">Day Reset Cutoff Window</h4>
                        <span className="rounded-full bg-[var(--c-primary)]/15 px-2.5 py-0.5 text-xs font-semibold text-[var(--c-primary)]">
                          Database Persisted
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
                        disabled={updateSettingsMutation.isPending}
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
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Streak Warning Reminders</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Receive automated email alerts before your streak resets.</p>
                    </div>
                    <ToggleSwitch 
                      active={emailStreakReminder} 
                      onChange={() => handleToggleSetting('emailStreakReminder')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-6 rounded-[24px] border border-[var(--c-border)]/50 bg-[var(--c-surface)] hover:border-[var(--c-border)] transition-all duration-300">
                    <div>
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Weekly Progress Digest</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Get an analytical compounding summary of your week sent to your email.</p>
                    </div>
                    <ToggleSwitch 
                      active={emailWeeklyDigest} 
                      onChange={() => handleToggleSetting('emailWeeklyDigest')} 
                    />
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
                      <h4 className="font-semibold text-lg text-[var(--c-text)]">Public Profile & Sharing</h4>
                      <p className="text-sm text-[var(--c-muted)] mt-1">Allow peers and friends to view your public profile, badges, and streaks.</p>
                    </div>
                    <ToggleSwitch 
                      active={isPublicProfile} 
                      onChange={() => handleToggleSetting('isPublicProfile')} 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--c-border)]/40">
                   <AlertTriangle className="text-[#EF4444] opacity-80" size={24} />
                   <h3 className="text-3xl font-semibold text-[var(--c-text)]" style={fontDisplay}>Danger Zone</h3>
                 </div>
                 
                 <div className="p-8 rounded-[28px] border-2 border-[#EF4444]/20 bg-[#EF4444]/5 relative overflow-hidden">
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                       <h4 className="font-bold text-xl text-[#EF4444]">Delete Account</h4>
                       <p className="text-[var(--c-muted)] mt-2 font-medium max-w-md">
                         Permanently remove your account, habits, streaks, and transaction ledger. This action cannot be undone.
                       </p>
                     </div>
                     <button 
                       onClick={() => setDeleteConfirmOpen(true)}
                       className="px-6 py-3.5 rounded-[16px] bg-[#EF4444]/10 text-[#EF4444] font-bold shadow-sm hover:bg-[#EF4444] hover:text-white transition-all duration-300 shrink-0 border border-[#EF4444]/20 hover:border-[#EF4444]"
                     >
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

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setEditProfileOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--c-primary)] text-[#07140c] font-bold text-xs hover:brightness-110 transition-all shadow-sm"
                    >
                      <Edit3 size={14} /> Edit Profile & Password
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 font-bold text-xs transition-all duration-300 cursor-pointer"
                    >
                      <LogOut size={14} /> Sign Out
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
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--c-surface-soft)] text-[var(--c-muted)] border border-[var(--c-border)]">Active via Sync API</span>
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

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />

      {/* Delete Account Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-md w-full rounded-3xl border border-red-500/30 bg-[var(--c-surface)] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold text-[var(--c-text)]" style={fontDisplay}>
                Confirm Account Deletion
              </h3>
            </div>
            <p className="text-sm text-[var(--c-muted)] leading-relaxed">
              Are you absolutely sure you want to delete your account? All habits, streaks, power-ups, achievements, and transaction history will be permanently erased.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 active:scale-95 transition-all shadow-md"
              >
                {deleteAccountMutation.isPending ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
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
