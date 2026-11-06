"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSparksState } from "../store/gamification";
import { Bell, User, Sun, Moon, Zap, Shield, Sparkles, X, ChevronRight, RotateCcw, Calendar, Snowflake, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useGamificationSummary } from "@repo/query/gamification/useGamificationSummary";
import {
  useUseStreakShield,
  useInventory,
  useRecoverStreak,
} from "@repo/query/gamification/useGamificationMutations";
import { useNotifications, useMarkNotificationsAsRead } from "@repo/query/gamification/useNotifications";
import { useHabits } from "@repo/query/habits/useHabits";
import { toast } from "react-hot-toast";
import TransactionLedgerModal from "./transaction-ledger-modal";

export default function PlayerStatusBar() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [sparks, setSparks] = useSparksState();
  const { data: summary } = useGamificationSummary(userId);
  const { data: habits = [] } = useHabits(userId);
  const { data: notifications = [] } = useNotifications(userId);
  const { data: inventory = [] } = useInventory(userId);
  const markReadMutation = useMarkNotificationsAsRead();
  const useShieldMutation = useUseStreakShield();
  const recoverStreakMutation = useRecoverStreak();

  const [shieldModalOpen, setShieldModalOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Power-Up counts
  const getInvCount = (type: string) =>
    inventory.find((i: any) => i.powerUpType === type)?.quantity || 0;
  const shieldCount = summary?.shields ?? getInvCount("STREAK_SHIELD");
  const freezeCount = getInvCount("STREAK_FREEZE");
  const recoveryCount = getInvCount("STREAK_RECOVERY");

  // Protection Modal Sub-tabs & Historical Date Selection
  const [protectionTab, setProtectionTab] = useState<"SHIELD" | "FREEZE" | "RECOVERY">("SHIELD");
  const [selectedDateOption, setSelectedDateOption] = useState<string>("yesterday");
  const [customDate, setCustomDate] = useState<string>("");

  const getTargetDate = (): Date => {
    const d = new Date();
    if (selectedDateOption === "yesterday") {
      d.setDate(d.getDate() - 1);
    } else if (selectedDateOption === "2days") {
      d.setDate(d.getDate() - 2);
    } else if (selectedDateOption === "3days") {
      d.setDate(d.getDate() - 3);
    } else if (selectedDateOption === "custom" && customDate) {
      return new Date(customDate);
    }
    return d;
  };

  // Theme tracking - default is dark
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (next === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  // Level & XP calculations
  const totalXp = summary?.totalXp || 0;
  const level = summary?.level || 1;
  const currentLevelFloorXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const xpNeeded = Math.max(1, nextLevelXp - currentLevelFloorXp);
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelFloorXp);
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));

  // Handle manual shield activation for a habit on chosen date
  const handleUseShield = (habitId: string) => {
    if (!userId) return;
    const targetDate = getTargetDate();

    useShieldMutation.mutate(
      {
        userId,
        habitId,
        missedDate: targetDate.toISOString(),
        itemType: "STREAK_SHIELD",
      },
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

  // Handle global 24-hr streak freeze
  const handleUseFreeze = () => {
    if (!userId) return;
    if (freezeCount <= 0) {
      toast.error("You do not have any Streak Freezes in your inventory.");
      return;
    }
    const today = new Date();
    useShieldMutation.mutate(
      {
        userId,
        missedDate: today.toISOString(),
        itemType: "STREAK_FREEZE",
      },
      {
        onSuccess: () => {
          toast.success("Streak Freeze activated! All routines paused for 24h ❄️");
          setShieldModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Could not activate Streak Freeze.");
        },
      }
    );
  };

  // Handle broken streak recovery
  const handleRecoverStreak = (habitId: string) => {
    if (!userId) return;
    if (recoveryCount <= 0 && shieldCount <= 0) {
      toast.error("You need a Streak Recovery Kit or Streak Shield to restore broken streaks.");
      return;
    }
    const targetDate = getTargetDate();

    recoverStreakMutation.mutate(
      {
        userId,
        habitId,
        missedDate: targetDate.toISOString(),
      },
      {
        onSuccess: (res: any) => {
          toast.success(res.data?.message || "Broken streak successfully restored! 🔄");
          setShieldModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Could not restore streak.");
        },
      }
    );
  };

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-end gap-3 sm:gap-4 border-b border-[var(--c-border)] bg-white/95 dark:bg-[#0c0d11]/85 px-6 backdrop-blur-md transition-colors duration-300">
        {/* DOUBLE XP ACTIVE INDICATOR */}
        {summary?.isBoostActive && (
          <div
            title="Double XP Power-Up Active! All habits award 2× XP"
            className="flex h-9 items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-3 text-xs font-bold text-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.25)]"
          >
            <Zap size={14} className="fill-amber-400 text-amber-400" />
            <span className="font-mono">2× XP</span>
          </div>
        )}

        {/* SPARKS BUTTON - Opens Ledger Audit */}
        <button
          type="button"
          onClick={() => setLedgerModalOpen(true)}
          title="Click to view Sparks & XP transaction ledger"
          className="group relative flex h-9 items-center justify-center gap-2 rounded-full border border-[#a8fe43] bg-[#a8fe43] px-3.5 sm:px-4 text-sm font-bold text-[#07140c] shadow-xs transition-all duration-300 hover:scale-105 hover:brightness-105 dark:border-[#a8fe43]/30 dark:from-[#a8fe43]/15 dark:to-[#3ae484]/5 dark:text-[#a8fe43] dark:hover:border-[#a8fe43]/60 dark:hover:shadow-[0_0_15px_rgba(168,254,67,0.25)]"
        >
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute top-0 left-0 h-full w-full -translate-x-[150%] skew-x-[-20deg] bg-white/40 transition-transform duration-700 ease-out group-hover:translate-x-[150%]" />
          </div>
          
          <Zap className="relative z-10 h-4 w-4 fill-[#07140c] text-[#07140c] transition-transform duration-300 group-hover:scale-110" />
          <span className="relative z-10 font-mono tracking-wide text-[#07140c]">
            {summary?.sparksBalance ?? sparks} Sparks
          </span>
        </button>

        {/* STREAK SHIELDS BUTTON */}
        <button
          type="button"
          onClick={() => setShieldModalOpen(true)}
          title="Streak Shield Inventory"
          className="group relative flex h-9 items-center justify-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 sm:px-4 text-sm font-bold text-blue-500 dark:text-blue-400 shadow-xs transition-all duration-300 hover:scale-105 hover:bg-blue-500/20"
        >
          <Shield className="h-4 w-4 fill-blue-500/20 text-blue-500 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110" />
          <span className="font-mono tracking-wide">{summary?.shields ?? 0}</span>
        </button>

        {/* LEVEL BUTTON */}
        <button
          type="button"
          onClick={() => setLevelModalOpen(true)}
          title="Player Level & Progression"
          className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 sm:px-4 text-sm font-bold text-slate-800 shadow-xs transition-all duration-300 hover:scale-105 hover:bg-slate-100 dark:border-[var(--c-border)] dark:bg-[var(--c-surface-soft)] dark:text-[var(--c-text)] dark:hover:bg-[var(--c-surface)]"
        >
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-[var(--c-muted)]">LVL</span>
          <span className="font-mono">{level}</span>
        </button>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-[var(--c-muted)] dark:hover:bg-white/[0.05] dark:hover:text-[var(--c-text)]"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              if (userId && summary?.unreadNotifications) {
                markReadMutation.mutate(userId);
              }
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-[var(--c-muted)] dark:hover:bg-white/[0.05] dark:hover:text-[var(--c-text)]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {summary?.unreadNotifications ? (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#0c0d11]"></span>
            ) : null}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div 
              className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ backgroundColor: 'var(--c-surface)' }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--c-border)]/50">
                <span className="font-bold text-sm text-[var(--c-text)]">Notifications</span>
                {notifications.length > 0 && userId && (
                  <button 
                    onClick={() => markReadMutation.mutate(userId)}
                    className="text-xs text-[var(--c-primary)] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[var(--c-muted)]">
                    No new notifications. Keep compounding your daily habits!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        n.readAt 
                          ? 'border-[var(--c-border)]/40 bg-[var(--c-surface-soft)]/40 text-[var(--c-muted)]' 
                          : 'border-[var(--c-primary)]/30 bg-[var(--c-primary)]/5 text-[var(--c-text)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{n.title}</span>
                        <span className="text-[10px] text-[var(--c-muted)]">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="mt-1 text-[var(--c-muted)] leading-relaxed">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* AVATAR */}
        <Link
          href="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[#07140c] transition-all hover:border-[#a8fe43] hover:text-[#07140c] dark:border-[var(--c-border)] dark:bg-[var(--c-surface-soft)] dark:text-[#a8fe43] dark:hover:border-[var(--c-primary)]"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>

      {/* ================= STREAK SHIELD & PROTECTION MODAL ================= */}
      {shieldModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShieldModalOpen(false)}
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="relative w-full max-w-[480px] overflow-hidden rounded-[28px] text-white"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(165deg, #0F1D17 0%, #0A1410 40%, #0D1A14 100%)",
              border: "1px solid rgba(59,130,246,0.2)",
              boxShadow: "0 0 80px rgba(59,130,246,0.1), 0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Decorative top gradient */}
            <div
              style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "130px",
                background: "radial-gradient(ellipse 70% 80% at 30% 0%, rgba(59,130,246,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setShieldModalOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <X className="h-4 w-4 text-white/50" />
            </button>

            {/* Header */}
            <div className="relative px-7 pt-7 pb-2">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.08) 100%)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      boxShadow: "0 0 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}
                  >
                    <Shield className="h-7 w-7 text-blue-400" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-[18px] font-bold tracking-tight text-white">Streak Defense Center</h3>
                  <p className="text-[12px] text-white/50">
                    Defend, freeze, or restore habits to protect your compounding streaks.
                  </p>
                </div>
              </div>

              {/* AUTO-PROTECTION STATUS PILL */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2 text-[11px] text-emerald-300">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>
                  <strong>Auto-Streak Defense Active:</strong> Available shields will automatically step in if an active streak (&ge;2 days) misses a day.
                </span>
              </div>

              {/* SUB-TABS */}
              <div className="mt-4 flex rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setProtectionTab("SHIELD")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                    protectionTab === "SHIELD"
                      ? "bg-blue-500/30 text-blue-300 shadow-xs border border-blue-500/40"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Shield ({shieldCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProtectionTab("FREEZE")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                    protectionTab === "FREEZE"
                      ? "bg-emerald-500/30 text-emerald-300 shadow-xs border border-emerald-500/40"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Snowflake className="h-3.5 w-3.5" />
                  <span>Freeze ({freezeCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProtectionTab("RECOVERY")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                    protectionTab === "RECOVERY"
                      ? "bg-purple-500/30 text-purple-300 shadow-xs border border-purple-500/40"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Recover ({recoveryCount})</span>
                </button>
              </div>
            </div>

            {/* HISTORICAL DATE PICKER (for Shield & Recovery tabs) */}
            {protectionTab !== "FREEZE" && (
              <div className="px-7 pt-2 pb-1">
                <div className="mb-2 flex items-center justify-between text-[11px] text-white/50">
                  <span className="flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <Calendar className="h-3 w-3" /> Select Target Date
                  </span>
                  <span className="font-mono text-white/70">
                    {getTargetDate().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDateOption("yesterday")}
                    className={`rounded-lg py-1.5 text-[11px] font-medium border transition-all ${
                      selectedDateOption === "yesterday"
                        ? "border-blue-400 bg-blue-500/20 text-blue-200"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDateOption("2days")}
                    className={`rounded-lg py-1.5 text-[11px] font-medium border transition-all ${
                      selectedDateOption === "2days"
                        ? "border-blue-400 bg-blue-500/20 text-blue-200"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    2 Days Ago
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDateOption("3days")}
                    className={`rounded-lg py-1.5 text-[11px] font-medium border transition-all ${
                      selectedDateOption === "3days"
                        ? "border-blue-400 bg-blue-500/20 text-blue-200"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    3 Days Ago
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDateOption("custom")}
                    className={`rounded-lg py-1.5 text-[11px] font-medium border transition-all ${
                      selectedDateOption === "custom"
                        ? "border-blue-400 bg-blue-500/20 text-blue-200"
                        : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    Custom...
                  </button>
                </div>

                {selectedDateOption === "custom" && (
                  <div className="mt-2">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white outline-hidden focus:border-blue-400"
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT */}
            <div className="px-7 pt-3 pb-2">
              {protectionTab === "FREEZE" ? (
                /* FREEZE TAB */
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-400/15 text-emerald-300">
                    <Snowflake className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">24-Hour Streak Freeze</h4>
                  <p className="mt-1 text-xs text-emerald-200/80 leading-relaxed">
                    Going on vacation, feeling unwell, or traveling? A Streak Freeze halts all routines for 24 hours. Your streaks will not break even with 0 check-ins.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleUseFreeze}
                      disabled={freezeCount <= 0 || useShieldMutation.isPending}
                      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                        freezeCount > 0
                          ? "border border-emerald-400/50 bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md"
                          : "cursor-not-allowed border border-white/10 bg-white/5 text-white/40"
                      }`}
                    >
                      <Snowflake className="h-4 w-4" />
                      {useShieldMutation.isPending ? "Freezing..." : `Freeze All Routines (${freezeCount} Available)`}
                    </button>
                  </div>
                </div>
              ) : (
                /* SHIELD / RECOVERY HABIT LIST */
                <div>
                  <div className="mb-2 text-[10px] uppercase font-bold tracking-wider text-white/40">
                    {protectionTab === "SHIELD" ? "Select habit to protect:" : "Select habit streak to recover:"}
                  </div>

                  {habits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl py-8 border border-dashed border-white/10 bg-white/5">
                      <Shield className="h-8 w-8 mb-2 text-white/20" />
                      <p className="text-xs text-white/40">No active habits found</p>
                    </div>
                  ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-0.5">
                      {habits.map((h: any) => (
                        <div
                          key={h.id}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white/70">
                              {(h.title || h.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate text-xs font-medium text-white/90">
                              {h.title || h.name}
                            </span>
                          </div>

                          {protectionTab === "SHIELD" ? (
                            <button
                              type="button"
                              onClick={() => handleUseShield(h.id)}
                              disabled={shieldCount <= 0 || useShieldMutation.isPending}
                              className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                shieldCount > 0
                                  ? "border border-blue-500/40 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                                  : "cursor-not-allowed border border-white/10 bg-white/5 text-white/30"
                              }`}
                            >
                              {useShieldMutation.isPending ? "..." : "Protect"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRecoverStreak(h.id)}
                              disabled={(recoveryCount <= 0 && shieldCount <= 0) || recoverStreakMutation.isPending}
                              className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                recoveryCount > 0 || shieldCount > 0
                                  ? "border border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                                  : "cursor-not-allowed border border-white/10 bg-white/5 text-white/30"
                              }`}
                            >
                              {recoverStreakMutation.isPending ? "..." : "Recover"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="mt-3 flex items-center justify-between px-7 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}
            >
              <Link
                href="/habits"
                onClick={() => setShieldModalOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Shop Power-Ups</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setShieldModalOpen(false)}
                className="rounded-xl border border-white/10 bg-white/10 px-5 py-2 text-xs font-semibold text-white/80 hover:bg-white/15 transition-all"
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
                      <stop offset="50%" stopColor="#34D399" />
                      <stop offset="100%" stopColor="#a8fe43" />
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
                    style={{ color: "#a8fe43", textShadow: "0 0 20px rgba(168,254,67,0.35)" }}
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
                    style={{ color: "#a8fe43" }}
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
                      background: "linear-gradient(90deg, #059669 0%, #10B981 35%, #34D399 70%, #a8fe43 100%)",
                      boxShadow: "0 0 12px rgba(168,254,67,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
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
      <TransactionLedgerModal
        isOpen={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}} />
    </>
  );
}
