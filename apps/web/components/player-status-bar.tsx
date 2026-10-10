"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSparksState } from "../store/gamification";
import { Bell, User, Sun, Moon, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { useGamificationSummary } from "@repo/query/gamification/useGamificationSummary";

export default function PlayerStatusBar() {
  const { data: session } = useSession();
  const [sparks, setSparks] = useSparksState();
  const { data: summary } = useGamificationSummary((session?.user as any)?.id);
  
  // Use state to track the current theme
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Check local storage or system preference on mount if desired, defaulting to dark
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  useEffect(() => {
    if (summary?.sparksBalance !== undefined) {
      setSparks(summary.sparksBalance);
    }
  }, [summary, setSparks]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-end gap-4 border-b border-[var(--c-border)] bg-white dark:bg-[#070F0B]/80 px-6 backdrop-blur-md transition-colors duration-300">
      <Link href="/habits">
        <div className="group relative flex h-9 items-center justify-center gap-2 rounded-full border border-emerald-400/50 bg-gradient-to-br from-emerald-50 to-emerald-100/80 px-4 text-sm font-bold text-emerald-700 shadow-sm transition-all duration-300 hover:scale-105 hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-emerald-500/5 dark:text-emerald-400 dark:hover:border-emerald-500/60 dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          {/* Inner animated shine effect */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
             <div className="absolute top-0 left-0 h-full w-full -translate-x-[150%] skew-x-[-20deg] bg-white/40 transition-transform duration-700 ease-out group-hover:translate-x-[150%]" />
          </div>
          
          <Zap className="relative z-10 h-4 w-4 fill-emerald-500 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-400 dark:fill-emerald-400" />
          <span className="relative z-10 tracking-wide font-mono">{sparks} Sparks</span>
        </div>
      </Link>

      {summary?.shields !== undefined && (
        <button className="group relative flex h-9 items-center justify-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 text-sm font-bold text-blue-400 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-blue-500/20">
          <Shield className="h-4 w-4 fill-blue-500/20 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
          <span className="tracking-wide font-mono">{summary.shields}</span>
        </button>
      )}

      {summary?.level !== undefined && (
        <button className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-soft)] px-4 text-sm font-bold text-[var(--c-text)] shadow-sm transition-all duration-300 hover:scale-105 hover:bg-[var(--c-surface)]">
          <span className="text-xs font-black text-[var(--c-muted)] uppercase tracking-wider">LVL</span>
          <span className="font-mono">{summary.level}</span>
        </button>
      )}

      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--c-muted)] transition-all hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.05] hover:text-[var(--c-text)]"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--c-muted)] transition-all hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.05] hover:text-[var(--c-text)]">
        <Bell className="h-5 w-5" />
        {summary?.unreadNotifications ? (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#070F0B]"></span>
        ) : null}
      </button>

      <Link
        href="/profile"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface-soft)] text-[var(--c-primary)] transition-all hover:border-[var(--c-primary)]"
      >
        <User className="h-5 w-5" />
      </Link>
    </div>
  );
}
