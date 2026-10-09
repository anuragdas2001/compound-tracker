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
} from 'lucide-react';

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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
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
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-[var(--c-border)] bg-white dark:bg-[#070F0B]/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* DESKTOP COLLAPSE BUTTON (FLOATING ON RIGHT BORDER) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-6 z-50 h-7 w-7 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface-soft)] text-[var(--c-muted)] shadow-md transition-all hover:border-[var(--c-primary)] hover:bg-[var(--c-surface)] hover:text-[var(--c-primary)]"
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* LOGO AREA */}
        <div
          className={`flex h-20 items-center border-b border-[var(--c-border)] transition-all ${
            isCollapsed ? 'justify-center px-0' : 'px-6'
          }`}
        >
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[var(--c-primary)]/10 border border-[var(--c-primary)]/30 text-[var(--c-primary)] shadow-[0_0_15px_rgba(34,197,94,0.15)]">
              <Flame size={22} />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-extrabold tracking-tight text-[var(--c-text)]">
                Compound
              </span>
            )}
          </Link>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center font-medium transition-all duration-200 ${
                  isCollapsed
                    ? 'justify-center h-12 w-12 mx-auto'
                    : 'gap-3.5 px-3.5 py-3 text-sm'
                } ${
                  isActive
                    ? 'bg-[var(--c-primary)]/15 text-[var(--c-primary)] border-l-4'
                    : 'text-[var(--c-muted)] hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.04] hover:text-[var(--c-text)]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={`flex-none transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? 'text-[var(--c-primary)]'
                      : 'text-[var(--c-muted)] group-hover:text-[var(--c-text)]'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM USER PROFILE */}
        <div
          className={`border-t border-[var(--c-border)] transition-all ${isCollapsed ? 'py-4 flex flex-col items-center gap-3' : 'p-4'}`}
        >
          {isCollapsed ? (
            <>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--c-surface-soft)] border border-[var(--c-border)] text-[var(--c-primary)] shadow-sm"
                title="Explorer (Compound Plan)"
              >
                <User size={18} />
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--c-muted)] hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.05] hover:text-red-400 transition"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-[var(--c-surface-soft)]/60 p-2.5 border border-[var(--c-border)]/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)] text-[var(--c-primary)]">
                  <User size={18} />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-[var(--c-text)] truncate">
                    Explorer
                  </p>
                  <p className="text-[10px] text-[var(--c-muted)] truncate">
                    Compound Plan
                  </p>
                </div>
              </div>

              <button
                className="p-1.5 text-[var(--c-muted)] hover:text-red-400 transition rounded-lg hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.05]"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
