"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useGamificationLedger } from "@repo/query/gamification/useGamificationMutations";
import { useGamificationSummary } from "@repo/query/gamification/useGamificationSummary";
import {
  X,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Trophy,
  Flame,
  ShoppingBag,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

interface TransactionLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionLedgerModal({
  isOpen,
  onClose,
}: TransactionLedgerModalProps) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("ALL");

  const { data: summary } = useGamificationSummary(userId);
  const { data: ledgerData, isLoading } = useGamificationLedger(userId, page, 15);

  if (!isOpen) return null;

  const entries = ledgerData?.entries || [];
  const totalPages = ledgerData?.totalPages || 1;

  const filteredEntries = entries.filter((entry) => {
    if (filterType === "ALL") return true;
    return entry.type === filterType;
  });

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "HABIT_COMPLETION":
      case "HABIT_COMPLETION_BOOSTED":
        return <Flame size={14} className="text-[#a8fe43]" />;
      case "STREAK_MILESTONE":
        return <Trophy size={14} className="text-[#F59E0B]" />;
      case "ACHIEVEMENT_UNLOCK":
        return <Trophy size={14} className="text-[#A855F7]" />;
      case "CHALLENGE_REWARD":
        return <Zap size={14} className="text-[#3B82F6]" />;
      case "STORE_PURCHASE":
        return <ShoppingBag size={14} className="text-[#EC4899]" />;
      case "POWER_UP_USAGE":
        return <Shield size={14} className="text-[#38BDF8]" />;
      default:
        return <Clock size={14} className="text-slate-400" />;
    }
  };

  const getSourceLabel = (entry: any) => {
    const meta = entry.metadata || {};
    switch (entry.sourceType) {
      case "HABIT_COMPLETION":
        return "Daily Habit Check-In";
      case "HABIT_COMPLETION_BOOSTED":
        return `Double XP Habit Check-In (${meta.multiplier || 2}×)`;
      case "STREAK_MILESTONE":
        return `${meta.milestoneDays || 7}-Day Streak Milestone Bonus`;
      case "ACHIEVEMENT_UNLOCK":
        return `Achievement: ${meta.achievementTitle || "Badge Unlocked"}`;
      case "CHALLENGE_REWARD":
        return `Challenge: ${meta.challengeTitle || "Challenge Completed"}`;
      case "STORE_PURCHASE":
        return `Store Purchase: ${meta.itemType || "Power-Up"}`;
      case "POWER_UP_USAGE":
        return `Shield Activated for ${meta.missedDate || "protected day"}`;
      default:
        return entry.sourceType.replace(/_/g, " ");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[85vh] rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] p-6 shadow-2xl overflow-hidden"
        style={{ backgroundColor: "var(--c-surface)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--c-border)]/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#a8fe43]/15 text-[#a8fe43] border border-[#a8fe43]/30">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--c-text)]" style={fontDisplay}>
                Sparks & XP Transaction Ledger
              </h2>
              <p className="text-xs text-[var(--c-muted)]">
                Immutable record of all earned rewards, purchases, and power-up activations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--c-muted)] hover:bg-[var(--c-surface-soft)] hover:text-[var(--c-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance Overview Card */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-soft)]/60 p-3">
            <span className="text-[10px] font-semibold text-[var(--c-muted)] uppercase tracking-wider">
              Current Sparks
            </span>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-lg text-[#a8fe43]" style={fontMono}>
              <Zap size={16} className="fill-[#a8fe43]" />
              {summary?.sparksBalance ?? 150}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-soft)]/60 p-3">
            <span className="text-[10px] font-semibold text-[var(--c-muted)] uppercase tracking-wider">
              Cumulative XP
            </span>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-lg text-[var(--c-text)]" style={fontMono}>
              <Trophy size={16} className="text-amber-400" />
              {summary?.totalXp ?? 0}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-soft)]/60 p-3">
            <span className="text-[10px] font-semibold text-[var(--c-muted)] uppercase tracking-wider">
              Player Level
            </span>
            <div className="mt-1 flex items-center gap-1.5 font-bold text-lg text-[var(--c-text)]" style={fontMono}>
              Level {summary?.level ?? 1}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs">
          <span className="text-[var(--c-muted)] flex items-center gap-1 mr-1">
            <Filter size={12} /> Filter:
          </span>
          {["ALL", "EARN", "SPEND", "CONSUME"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilterType(t);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                filterType === t
                  ? "bg-[#a8fe43] text-[#07140c]"
                  : "bg-[var(--c-surface-soft)] text-[var(--c-muted)] hover:text-[var(--c-text)]"
              }`}
            >
              {t === "ALL" ? "All Entries" : t}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-sm text-[var(--c-muted)]">
              Loading ledger events...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-sm text-[var(--c-muted)]">
              <Clock size={28} className="mb-2 opacity-40" />
              No transaction ledger records found.
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isEarn = entry.type === "EARN";
              const isSpend = entry.type === "SPEND";
              const date = new Date(entry.createdAt);

              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-[var(--c-border)]/60 bg-[var(--c-surface-soft)]/40 hover:bg-[var(--c-surface-soft)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                        isEarn
                          ? "border-[#a8fe43]/40 bg-[#a8fe43]/10 text-[#a8fe43]"
                          : isSpend
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                          : "border-blue-400/40 bg-blue-400/10 text-blue-400"
                      }`}
                    >
                      {getSourceIcon(entry.sourceType)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--c-text)] truncate">
                        {getSourceLabel(entry)}
                      </p>
                      <p className="text-[10px] text-[var(--c-muted)] flex items-center gap-1" style={fontMono}>
                        {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} •{" "}
                        {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`flex items-center justify-end gap-0.5 text-xs font-bold ${
                        isEarn
                          ? "text-[#a8fe43]"
                          : isSpend
                          ? "text-rose-400"
                          : "text-blue-400"
                      }`}
                      style={fontMono}
                    >
                      {isEarn ? (
                        <>
                          <ArrowUpRight size={13} />+{entry.amount} Sparks
                        </>
                      ) : isSpend ? (
                        <>
                          <ArrowDownLeft size={13} />-{entry.amount} Sparks
                        </>
                      ) : (
                        <>
                          <Shield size={13} />
                          {entry.amount} Power-Up
                        </>
                      )}
                    </div>
                    {entry.metadata?.xpGained ? (
                      <p className="text-[10px] text-amber-400 font-semibold" style={fontMono}>
                        +{entry.metadata.xpGained} XP
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Pagination */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--c-border)]/50 text-xs">
          <span className="text-[var(--c-muted)]" style={fontMono}>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-soft)] text-[var(--c-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--c-primary)]"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface-soft)] text-[var(--c-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--c-primary)]"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
