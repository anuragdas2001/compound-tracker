"use client";

import { useEffect, useState } from "react";
import { useSparksState } from "../store/gamification";
import { Bell, User, Sparkles, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { useGamificationSummary } from "@repo/query/gamification/useGamificationSummary";

export default function PlayerStatusBar() {
  const [sparks, setSparks] = useSparksState();
  const { data: summary } = useGamificationSummary();
  
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
        <Badge
          variant="outline"
          className="h-9 cursor-pointer gap-2 rounded-full border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 text-sm font-semibold text-amber-600 dark:text-amber-400 transition hover:bg-amber-100 dark:hover:bg-amber-500/20"
        >
          <Sparkles className="h-4 w-4" />
          <span>{sparks} Sparks</span>
        </Badge>
      </Link>

      <button
        onClick={toggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--c-muted)] transition-all hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.05] hover:text-[var(--c-text)]"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <button className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--c-muted)] transition-all hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.05] hover:text-[var(--c-text)]">
        <Bell className="h-5 w-5" />
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
