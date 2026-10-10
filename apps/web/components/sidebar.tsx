'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  BarChart2,
  Award,
  Swords,
  Trophy,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Flame,
  User,
  BadgeCheck,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'habits', label: 'Habits', href: '/habits', icon: Target },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { id: 'achievements', label: 'Achievements', href: '/achievements', icon: Award },
  { id: 'challenges', label: 'Challenges', href: '/challenges', icon: Swords },
  { id: 'leaderboard', label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { id: 'profile', label: 'Profile', href: '/profile', icon: User },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
  { id: 'pricing', label: 'Pricing', href: '/pricing', icon: CreditCard },
];

export function AppSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, update } = useSession();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    await fetch('/api/auth/verify-email', { method: 'POST' });
    await update();
    window.location.reload();
  };

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500&display=swap"
      />
      {/* MOBILE HEADER BUTTON */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] shadow-lg backdrop-blur-md transition hover:bg-[var(--c-surface-soft)]"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-[var(--c-border)] bg-white/95 dark:bg-[#070F0B]/95 backdrop-blur-3xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* DESKTOP COLLAPSE BUTTON (FLOATING ON RIGHT BORDER) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-6 z-50 h-7 w-7 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-muted)] shadow-[0_0_10px_rgba(0,0,0,0.05)] transition-all hover:border-[var(--c-primary)] hover:bg-[var(--c-primary)]/10 hover:text-[var(--c-primary)] hover:scale-110"
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* LOGO AREA */}
        <div
          className={`flex h-[72px] items-center transition-all px-4 mt-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Link href="/" className="flex items-center gap-3 overflow-hidden rounded-2xl px-2 py-2 transition-all hover:bg-[var(--c-surface-soft)]/50 group">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[14px] bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/30 text-[var(--c-primary)] shadow-[0_0_15px_rgba(34,197,94,0.15)] group-hover:scale-105 transition-transform duration-300">
              <Flame size={22} className="fill-[var(--c-primary)]/20" />
            </div>
            {!isCollapsed && (
              <span className="text-2xl font-bold tracking-tight text-[var(--c-text)] drop-shadow-sm" style={fontDisplay}>
                Compound
              </span>
            )}
          </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center font-semibold transition-all duration-300 rounded-[14px] ${
                  isCollapsed
                    ? 'justify-center h-12 w-12 mx-auto'
                    : 'gap-3.5 px-4 py-3.5 text-[15px]'
                } ${
                  isActive
                    ? 'bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/20 text-[var(--c-primary)] shadow-[0_4px_20px_rgba(34,197,94,0.05)]'
                    : 'border border-transparent text-[var(--c-muted)] hover:bg-[var(--c-surface-soft)]/80 hover:text-[var(--c-text)] hover:border-[var(--c-border)]/50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && !isCollapsed && (
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--c-primary)] rounded-r-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                )}
                
                <Icon
                  size={20}
                  className={`flex-none transition-all duration-300 ${
                    isActive
                      ? 'text-[var(--c-primary)] drop-shadow-[0_0_8px_rgba(34,197,94,0.4)] scale-110'
                      : 'text-[var(--c-muted)] group-hover:text-[var(--c-text)] group-hover:scale-110'
                  }`}
                />
                {!isCollapsed && <span className="truncate tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM USER PROFILE */}
        <div
          className={`px-3 py-4 transition-all border-t border-[var(--c-border)]/50 bg-gradient-to-t from-[var(--c-surface)]/40 to-transparent ${isCollapsed ? 'flex flex-col items-center gap-3' : ''}`}
        >
          {isCollapsed ? (
            <>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[var(--c-surface-soft)] border border-[var(--c-border)] text-[var(--c-primary)] shadow-sm hover:border-[var(--c-primary)]/40 transition-colors"
                title="Explorer (Compound Plan)"
              >
                <User size={20} />
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--c-muted)] hover:bg-[#EF4444]/10 hover:text-[#EF4444] hover:border hover:border-[#EF4444]/20 transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between rounded-[16px] bg-[var(--c-surface-soft)] p-3 border border-[var(--c-border)] hover:border-[var(--c-primary)]/30 transition-colors shadow-sm group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-primary)] shadow-[0_0_10px_rgba(34,197,94,0.05)] group-hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-shadow">
                  <User size={20} />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14px] font-bold text-[var(--c-text)] truncate">
                      {session?.user?.name || 'Explorer'}
                    </p>
                    {(session?.user as any)?.emailVerified ? (
                      <BadgeCheck size={14} className="text-blue-500 flex-none" title="Verified" />
                    ) : null}
                  </div>
                  
                  <p className="text-[11px] font-semibold text-[var(--c-primary)] truncate tracking-wider uppercase mt-0.5">
                    Compound {(session?.user as any)?.plan || 'FREE'}
                  </p>
                  {!(session?.user as any)?.emailVerified && (
                    <button 
                      onClick={handleVerify} 
                      disabled={isVerifying}
                      className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 truncate tracking-wider uppercase mt-0.5 underline transition-colors block"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Email'}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 text-[var(--c-muted)] hover:text-[#EF4444] transition-all rounded-xl hover:bg-[#EF4444]/10"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
