"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSparksState } from "../store/gamification";
import { Bell, User, Sun, Moon, Zap, Shield, Sparkles, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useGamificationSummary } from "@repo/query/gamification/useGamificationSummary";
import { useUseStreakShield } from "@repo/query/gamification/useGamificationMutations";
import { useHabits } from "@repo/query/habits/useHabits";
import { toast } from "react-hot-toast";

export default function PlayerStatusBar() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [sparks, setSparks] = useSparksState();
  const { data: summary } = useGamificationSummary(userId);
  const { data: habits = [] } = useHabits(userId);
  const useShieldMutation = useUseStreakShield();

  const [shieldModalOpen, setShieldModalOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  // Theme tracking
  const [theme, setTheme] = useState("light");

  useEffect(() => {
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

  // Level & XP calculations
  const totalXp = summary?.totalXp || 0;
  const level = summary?.level || 1;
  const currentLevelFloorXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const xpNeeded = Math.max(1, nextLevelXp - currentLevelFloorXp);
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelFloorXp);
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

  // Handle manual shield activation for a habit
  const handleUseShield = (habitId: string) => {
    if (!userId) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    useShieldMutation.mutate(
      { userId, habitId, missedDate: yesterday.toISOString() },
      {
        onSuccess: (res: any) => {
          toast.success(res.data?.message || "Streak Shield activated!");
          setShieldModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Could not apply Streak Shield.");
        },
      }
    );
  };

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-end gap-3 sm:gap-4 border-b border-[var(--c-border)] bg-white dark:bg-[#070F0B]/80 px-6 backdrop-blur-md transition-colors duration-300">
        {/* SPARKS BUTTON */}
        <Link href="/habits" title="View Rewards Store">
          <div className="group relative flex h-9 items-center justify-center gap-2 rounded-full border border-emerald-400/50 bg-gradient-to-br from-emerald-50 to-emerald-100/80 px-3.5 sm:px-4 text-sm font-bold text-emerald-700 shadow-sm transition-all duration-300 hover:scale-105 hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-emerald-500/5 dark:text-emerald-400 dark:hover:border-emerald-500/60 dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 h-full w-full -translate-x-[150%] skew-x-[-20deg] bg-white/40 transition-transform duration-700 ease-out group-hover:translate-x-[150%]" />
            </div>
            
            <Zap className="relative z-10 h-4 w-4 fill-emerald-500 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-400 dark:fill-emerald-400" />
            <span className="relative z-10 font-mono tracking-wide">{sparks} Sparks</span>
          </div>
        </Link>

        {/* STREAK SHIELDS BUTTON */}
        <button
          type="button"
          onClick={() => setShieldModalOpen(true)}
          title="Streak Shield Inventory"
          className="group relative flex h-9 items-center justify-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 sm:px-4 text-sm font-bold text-blue-400 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-blue-500/20"
        >
          <Shield className="h-4 w-4 fill-blue-500/20 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
          <span className="font-mono tracking-wide">{summary?.shields ?? 0}</span>
        </button>

        {/* LEVEL BUTTON */}
        <button
          type="button"
          onClick={() => setLevelModalOpen(true)}
          title="Player Level & Progression"
          className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-soft)] px-3 sm:px-4 text-sm font-bold text-[var(--c-text)] shadow-sm transition-all duration-300 hover:scale-105 hover:bg-[var(--c-surface)]"
        >
          <span className="text-xs font-black uppercase tracking-wider text-[var(--c-muted)]">LVL</span>
          <span className="font-mono">{level}</span>
        </button>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--c-muted)] transition-all hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.05] hover:text-[var(--c-text)]"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* NOTIFICATIONS */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--c-muted)] transition-all hover:bg-[var(--c-primary)]/10 dark:hover:bg-white/[0.05] hover:text-[var(--c-text)]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {summary?.unreadNotifications ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#070F0B]"></span>
          ) : null}
        </button>

        {/* AVATAR */}
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface-soft)] text-[var(--c-primary)] transition-all hover:border-[var(--c-primary)]"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>

      {/* ================= STREAK SHIELD POPUP MODAL ================= */}
      {shieldModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShieldModalOpen(false)}
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="relative w-full max-w-[420px] overflow-hidden rounded-[24px] text-white"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(165deg, #0F1D17 0%, #0A1410 40%, #0D1A14 100%)",
              border: "1px solid rgba(59,130,246,0.15)",
              boxShadow: "0 0 80px rgba(59,130,246,0.08), 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            {/* Decorative top gradient */}
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "120px",
                background: "radial-gradient(ellipse 60% 80% at 30% 0%, rgba(59,130,246,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setShieldModalOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              <X className="h-4 w-4 text-white/50" />
            </button>

            {/* Header */}
            <div className="relative px-7 pt-7 pb-0">
              <div className="flex items-start gap-4">
                {/* Glowing Shield Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      boxShadow: "0 0 20px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    <Shield className="h-7 w-7 text-blue-400" style={{ filter: "drop-shadow(0 0 6px rgba(59,130,246,0.4))" }} />
                  </div>
                  {/* Pulse ring */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      border: "1px solid rgba(59,130,246,0.15)",
                      animation: "pulse 3s ease-in-out infinite",
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-[17px] font-bold tracking-tight text-white">Streak Shields</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        background: (summary?.shields ?? 0) > 0
                          ? "rgba(59,130,246,0.15)"
                          : "rgba(255,255,255,0.05)",
                        color: (summary?.shields ?? 0) > 0 ? "#60A5FA" : "rgba(255,255,255,0.4)",
                        border: `1px solid ${(summary?.shields ?? 0) > 0 ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <Shield className="h-3 w-3" />
                      {summary?.shields ?? 0} {(summary?.shields ?? 0) === 1 ? "Shield" : "Shields"} Available
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                Protect your streaks when you miss a scheduled day. Shields keep your chain alive without changing completion records.
              </p>
            </div>

            {/* Divider */}
            <div className="mx-7 mt-5" style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent)" }} />

            {/* Habit list */}
            <div className="px-7 pt-4 pb-2">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Apply to Yesterday
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              {habits.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl py-8"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}
                >
                  <Shield className="h-8 w-8 mb-2" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>No active habits found</p>
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Create a habit to get started</p>
                </div>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto pr-0.5" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
                  {habits.map((h: any) => (
                    <div
                      key={h.id}
                      className="group flex items-center justify-between rounded-xl px-3.5 py-3 transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(59,130,246,0.06)";
                        e.currentTarget.style.borderColor = "rgba(59,130,246,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[13px]"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
                        >
                          {(h.title || h.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-[13px] font-medium text-white/80">{h.title || h.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUseShield(h.id)}
                        disabled={(summary?.shields ?? 0) <= 0 || useShieldMutation.isPending}
                        className="flex-shrink-0 transition-all duration-200"
                        style={{
                          padding: "5px 14px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: (summary?.shields ?? 0) > 0 ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                          color: (summary?.shields ?? 0) > 0 ? "#60A5FA" : "rgba(255,255,255,0.2)",
                          border: `1px solid ${(summary?.shields ?? 0) > 0 ? "rgba(59,130,246,0.25)" : "rgba(255,255,255,0.06)"}`,
                          cursor: (summary?.shields ?? 0) > 0 ? "pointer" : "not-allowed",
                        }}
                        onMouseEnter={(e) => {
                          if ((summary?.shields ?? 0) > 0) {
                            e.currentTarget.style.background = "rgba(59,130,246,0.25)";
                            e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((summary?.shields ?? 0) > 0) {
                            e.currentTarget.style.background = "rgba(59,130,246,0.15)";
                            e.currentTarget.style.borderColor = "rgba(59,130,246,0.25)";
                          }
                        }}
                      >
                        {useShieldMutation.isPending ? "..." : "Protect"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="mt-3 flex items-center justify-between px-7 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}
            >
              <Link
                href="/habits"
                onClick={() => setShieldModalOpen(false)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-200"
                style={{ color: "#34D399" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#6EE7B7"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#34D399"; }}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Get more in Store</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setShieldModalOpen(false)}
                className="transition-all duration-200"
                style={{
                  padding: "7px 20px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LEVEL & XP POPUP MODAL ================= */}
      {levelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setLevelModalOpen(false)}
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="relative w-full max-w-[420px] overflow-hidden rounded-[24px] text-white"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(165deg, #0F1D17 0%, #0A1410 40%, #0D1A14 100%)",
              border: "1px solid rgba(16,185,129,0.12)",
              boxShadow: "0 0 80px rgba(16,185,129,0.06), 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            {/* Decorative top gradient */}
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "140px",
                background: "radial-gradient(ellipse 50% 70% at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setLevelModalOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              <X className="h-4 w-4 text-white/50" />
            </button>

            {/* Header with Circular Level Badge */}
            <div className="relative flex flex-col items-center px-7 pt-8 pb-0">
              {/* Circular progress ring */}
              <div className="relative mb-4">
                <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
                  {/* Background ring */}
                  <circle
                    cx="48" cy="48" r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="5"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="48" cy="48" r="42"
                    fill="none"
                    stroke="url(#levelGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - levelProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                  <defs>
                    <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Level number inside ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    LVL
                  </span>
                  <span
                    className="text-[28px] font-black leading-none"
                    style={{ color: "#34D399", textShadow: "0 0 20px rgba(52,211,153,0.3)" }}
                  >
                    {level}
                  </span>
                </div>
              </div>

              <h3 className="text-[18px] font-bold tracking-tight text-white">Player Progression</h3>
              <p className="mt-1 text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                {totalXp.toLocaleString()} Lifetime XP earned
              </p>
            </div>

            {/* XP Progress section */}
            <div className="mx-7 mt-6">
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Progress to Level {level + 1}
                  </span>
                  <span
                    className="text-[13px] font-bold tabular-nums"
                    style={{ color: "#34D399" }}
                  >
                    {levelProgress}%
                  </span>
                </div>

                {/* XP Bar */}
                <div
                  className="relative h-3 w-full overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${levelProgress}%`,
                      background: "linear-gradient(90deg, #059669 0%, #10B981 40%, #34D399 100%)",
                      boxShadow: "0 0 12px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                      transition: "width 1s ease-out",
                    }}
                  />
                  {/* Shimmer effect */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${levelProgress}%`,
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s linear infinite",
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] font-medium tabular-nums" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {xpInCurrentLevel.toLocaleString()} XP
                  </span>
                  <span className="text-[11px] font-medium tabular-nums" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {xpNeeded.toLocaleString()} XP needed
                  </span>
                </div>
              </div>
            </div>

            {/* Rewards Info */}
            <div className="mx-7 mt-4 grid grid-cols-2 gap-3">
              <div
                className="flex items-center gap-3 rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)" }}
                >
                  <Sparkles className="h-4 w-4 text-amber-400" style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.3))" }} />
                </div>
                <div>
                  <span className="block text-[14px] font-bold text-white">+10 XP</span>
                  <span className="block text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>per habit</span>
                </div>
              </div>

              <div
                className="flex items-center gap-3 rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.15)" }}
                >
                  <Zap className="h-4 w-4 text-emerald-400" style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.3))" }} />
                </div>
                <div>
                  <span className="block text-[14px] font-bold text-white">+5 Sparks</span>
                  <span className="block text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>per completion</span>
                </div>
              </div>
            </div>

            {/* Level milestones */}
            <div className="mx-7 mt-4 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Level Roadmap
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <div className="flex items-center justify-between px-1">
                {[1, 5, 10, 25, 50].map((milestone) => (
                  <div key={milestone} className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold"
                      style={{
                        background: level >= milestone ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${level >= milestone ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.06)"}`,
                        color: level >= milestone ? "#34D399" : "rgba(255,255,255,0.2)",
                        boxShadow: level >= milestone ? "0 0 8px rgba(16,185,129,0.1)" : "none",
                      }}
                    >
                      {milestone}
                    </div>
                    <span className="text-[9px] font-medium" style={{ color: level >= milestone ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.15)" }}>
                      {milestone === 1 ? "Start" : milestone === 5 ? "Rising" : milestone === 10 ? "Solid" : milestone === 25 ? "Elite" : "Legend"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="mt-4 flex justify-end px-7 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}
            >
              <button
                type="button"
                onClick={() => setLevelModalOpen(false)}
                className="transition-all duration-200"
                style={{
                  padding: "7px 24px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "#34D399",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(16,185,129,0.2)";
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(16,185,129,0.12)";
                  e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)";
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}} />
    </>
  );
}
