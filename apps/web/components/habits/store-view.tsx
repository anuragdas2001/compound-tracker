"use client";

import { useState, type Dispatch, SetStateAction } from "react";
import {
  Lock,
  Palette,
  Shield,
  Sparkles,
  Trophy,
  Zap,
  RotateCcw,
  History,
  CheckCircle2,
  ChevronRight,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  usePurchaseItem,
  useInventory,
  useActivateBoost,
} from "@repo/query/gamification/useGamificationMutations";
import { useGamificationSummary } from "@repo/query/gamification/useGamificationSummary";

import { C, fontDisplay, fontMono } from "./constants";
import TransactionLedgerModal from "../transaction-ledger-modal";

type StoreViewProps = {
  sparks: number;
  setSparks: Dispatch<SetStateAction<number>>;
  ownedThemes: string[];
  setOwnedThemes: Dispatch<SetStateAction<string[]>>;
  activeTheme: string;
  setActiveTheme: (id: string, color: string) => void;
};

const themes = [
  { id: "green", name: "Emerald", color: "22, 163, 74", price: 0 },
  { id: "blue", name: "Ocean", color: "59, 130, 246", price: 50 },
  { id: "purple", name: "Amethyst", color: "168, 85, 247", price: 100 },
  { id: "rose", name: "Rose", color: "244, 63, 94", price: 150 },
];

export function StoreView({
  sparks,
  setSparks,
  ownedThemes,
  setOwnedThemes,
  activeTheme,
  setActiveTheme,
}: StoreViewProps) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const purchaseItemMutation = usePurchaseItem();
  const activateBoostMutation = useActivateBoost();
  const { data: inventory = [] } = useInventory(userId);
  const { data: summary } = useGamificationSummary(userId);

  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);

  // Power-up counts in inventory
  const getInventoryCount = (type: string): number => {
    const item = inventory.find((i: any) => i.powerUpType === type);
    return item?.quantity || 0;
  };

  const shieldCount = getInventoryCount("STREAK_SHIELD");
  const freezeCount = getInventoryCount("STREAK_FREEZE");
  const boostCount = getInventoryCount("DOUBLE_XP");
  const recoveryCount = getInventoryCount("STREAK_RECOVERY");

  const isBoostActive = summary?.isBoostActive;
  const boostExpiresAt = summary?.boostExpiresAt;

  const handleBuyTheme = (theme: (typeof themes)[number]) => {
    if (ownedThemes.includes(theme.id)) {
      setActiveTheme(theme.id, theme.color);
    } else if (sparks >= theme.price) {
      if (theme.price > 0 && userId) {
        purchaseItemMutation.mutate(
          { userId, itemType: `THEME_${theme.id.toUpperCase()}`, cost: theme.price },
          {
            onSuccess: () => {
              setSparks((s) => s - theme.price);
              setOwnedThemes([...ownedThemes, theme.id]);
              setActiveTheme(theme.id, theme.color);
              toast.success(`${theme.name} theme unlocked!`);
            },
            onError: (err: any) => {
              toast.error(err.response?.data?.message || "Failed to purchase theme.");
            },
          }
        );
      } else {
        setSparks(sparks - theme.price);
        setOwnedThemes([...ownedThemes, theme.id]);
        setActiveTheme(theme.id, theme.color);
      }
    }
  };

  const handleBuyPowerUp = (itemType: string, itemName: string, cost: number) => {
    if (!userId) {
      toast.error("Please sign in to purchase power-ups.");
      return;
    }
    if (sparks < cost) {
      toast.error(`Not enough Sparks. You need ${cost} Sparks for ${itemName}.`);
      return;
    }

    purchaseItemMutation.mutate(
      { userId, itemType, cost },
      {
        onSuccess: () => {
          setSparks((s) => s - cost);
          toast.success(`${itemName} added to your inventory! 🛡️`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || `Failed to purchase ${itemName}.`);
        },
      }
    );
  };

  const handleActivateBoost = () => {
    if (!userId) return;
    if (boostCount <= 0) {
      toast.error("You don't have any Double XP power-ups in your inventory.");
      return;
    }

    activateBoostMutation.mutate(
      { userId, powerUpType: "DOUBLE_XP", durationHours: 24, multiplier: 2 },
      {
        onSuccess: () => {
          toast.success("Double XP Boost activated! All habit completions award 2× XP for 24 hours ⚡");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to activate Double XP.");
        },
      }
    );
  };

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* WALLET BANNER */}
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[28px] border p-6"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <div>
            <h2 className="mb-1 text-xl font-bold" style={{ color: C.text, ...fontDisplay }}>
              Rewards Wallet &amp; Store
            </h2>
            <p className="text-sm" style={{ color: C.muted }}>
              Earn Sparks by checking in daily &amp; hit milestones to unlock shields, Double XP, and themes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-3 rounded-2xl border border-amber-500/30 px-5 py-3"
              style={{ backgroundColor: C.surfaceSoft }}
            >
              <Sparkles className="h-6 w-6 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-amber-400" style={fontMono}>
                  {sparks}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: C.muted }}>
                  Sparks Balance
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLedgerModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-xs font-semibold text-slate-200 transition-all shadow-sm"
              title="Open audit ledger recording all earned and spent Sparks/XP"
            >
              <History className="h-4 w-4 text-emerald-400" />
              <span>Audit Ledger</span>
            </button>
          </div>
        </div>

        {/* INVENTORY & ACTIVE POWER-UPS */}
        <section className="rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-3" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold" style={{ color: C.text, ...fontDisplay }}>
                Your Inventory &amp; Active Power-Ups
              </h3>
            </div>
            {isBoostActive && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 animate-pulse">
                <Flame className="h-3.5 w-3.5 fill-amber-400" />
                <span>
                  2× XP Boost Active {boostExpiresAt ? `(until ${new Date(boostExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Streak Shield */}
            <div className="flex flex-col justify-between rounded-xl border p-4" style={{ borderColor: C.border, backgroundColor: C.surfaceSoft }}>
              <div className="flex items-center justify-between">
                <Shield className="h-5 w-5 text-blue-400" />
                <span className="text-xl font-black text-blue-400" style={fontMono}>
                  {shieldCount}
                </span>
              </div>
              <span className="mt-2 text-xs font-medium" style={{ color: C.text }}>Streak Shield</span>
              <span className="text-[10px]" style={{ color: C.muted }}>Protects missed days</span>
            </div>

            {/* Streak Freeze */}
            <div className="flex flex-col justify-between rounded-xl border p-4" style={{ borderColor: C.border, backgroundColor: C.surfaceSoft }}>
              <div className="flex items-center justify-between">
                <Zap className="h-5 w-5 text-emerald-400" />
                <span className="text-xl font-black text-emerald-400" style={fontMono}>
                  {freezeCount}
                </span>
              </div>
              <span className="mt-2 text-xs font-medium" style={{ color: C.text }}>Streak Freeze</span>
              <span className="text-[10px]" style={{ color: C.muted }}>Pause chain for 24h</span>
            </div>

            {/* Double XP Boost */}
            <div className="flex flex-col justify-between rounded-xl border p-4" style={{ borderColor: isBoostActive ? "rgba(251, 191, 36, 0.4)" : C.border, backgroundColor: C.surfaceSoft }}>
              <div className="flex items-center justify-between">
                <Flame className="h-5 w-5 text-amber-400" />
                <span className="text-xl font-black text-amber-400" style={fontMono}>
                  {boostCount}
                </span>
              </div>
              <span className="mt-2 text-xs font-medium" style={{ color: C.text }}>Double XP Boost</span>
              {boostCount > 0 && !isBoostActive ? (
                <button
                  type="button"
                  onClick={handleActivateBoost}
                  disabled={activateBoostMutation.isPending}
                  className="mt-2 rounded-lg bg-amber-400 px-2 py-1 text-[11px] font-bold text-slate-950 hover:bg-amber-300 transition-colors"
                >
                  {activateBoostMutation.isPending ? "Activating..." : "Activate (24h)"}
                </button>
              ) : isBoostActive ? (
                <span className="mt-2 text-[10px] font-bold text-amber-400">ACTIVE ✓</span>
              ) : (
                <span className="text-[10px]" style={{ color: C.muted }}>None in inventory</span>
              )}
            </div>

            {/* Streak Recovery */}
            <div className="flex flex-col justify-between rounded-xl border p-4" style={{ borderColor: C.border, backgroundColor: C.surfaceSoft }}>
              <div className="flex items-center justify-between">
                <RotateCcw className="h-5 w-5 text-purple-400" />
                <span className="text-xl font-black text-purple-400" style={fontMono}>
                  {recoveryCount}
                </span>
              </div>
              <span className="mt-2 text-xs font-medium" style={{ color: C.text }}>Streak Recovery</span>
              <span className="text-[10px]" style={{ color: C.muted }}>Restore broken streaks</span>
            </div>
          </div>
        </section>

        {/* POWER-UPS SHOP SECTION */}
        <section>
          <div className="mb-6 flex items-center justify-between border-b pb-2" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" style={{ color: C.primary }} />
              <h3 className="text-lg font-semibold" style={{ color: C.text, ...fontDisplay }}>
                Power-Up Shop
              </h3>
            </div>
            <span className="text-xs uppercase tracking-wider" style={{ color: C.muted, ...fontMono }}>
              Streak &amp; Progression Arsenal
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Streak Shield Card */}
            <div
              className="flex flex-col justify-between rounded-2xl border p-6 transition-all hover:border-[var(--c-border-hover)]"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    <Shield className="h-6 w-6" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                    <Sparkles className="h-3 w-3" /> 100 Sparks
                  </span>
                </div>
                <h4 className="text-base font-bold" style={{ color: C.text }}>
                  Streak Shield
                </h4>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: C.muted }}>
                  Protects one active habit streak when you miss a scheduled day. Prevents your chain from breaking back to 0.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleBuyPowerUp("STREAK_SHIELD", "Streak Shield", 100)}
                disabled={sparks < 100 || purchaseItemMutation.isPending}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  sparks >= 100
                    ? "border border-blue-500/40 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                    : "cursor-not-allowed border border-neutral-700 bg-neutral-800/40 text-neutral-500"
                }`}
              >
                <Shield className="h-4 w-4" />
                {purchaseItemMutation.isPending ? "Purchasing..." : "Get Streak Shield"}
              </button>
            </div>

            {/* Streak Freeze Card */}
            <div
              className="flex flex-col justify-between rounded-2xl border p-6 transition-all hover:border-[var(--c-border-hover)]"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                    <Sparkles className="h-3 w-3" /> 75 Sparks
                  </span>
                </div>
                <h4 className="text-base font-bold" style={{ color: C.text }}>
                  Streak Freeze
                </h4>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: C.muted }}>
                  Freezes your routine in place for 24 hours during travel, illness, or emergency without forfeiting streak momentum.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleBuyPowerUp("STREAK_FREEZE", "Streak Freeze", 75)}
                disabled={sparks < 75 || purchaseItemMutation.isPending}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  sparks >= 75
                    ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    : "cursor-not-allowed border border-neutral-700 bg-neutral-800/40 text-neutral-500"
                }`}
              >
                <Zap className="h-4 w-4" />
                {purchaseItemMutation.isPending ? "Purchasing..." : "Get Streak Freeze"}
              </button>
            </div>

            {/* Double XP Boost Card */}
            <div
              className="flex flex-col justify-between rounded-2xl border p-6 transition-all hover:border-[var(--c-border-hover)]"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    <Flame className="h-6 w-6" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                    <Sparkles className="h-3 w-3" /> 150 Sparks
                  </span>
                </div>
                <h4 className="text-base font-bold" style={{ color: C.text }}>
                  Double XP 24-Hour Boost
                </h4>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: C.muted }}>
                  Supercharge your leveling journey. All habit check-ins award 2× XP for a full 24-hour period after activation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleBuyPowerUp("DOUBLE_XP", "Double XP Boost", 150)}
                disabled={sparks < 150 || purchaseItemMutation.isPending}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  sparks >= 150
                    ? "border border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    : "cursor-not-allowed border border-neutral-700 bg-neutral-800/40 text-neutral-500"
                }`}
              >
                <Flame className="h-4 w-4" />
                {purchaseItemMutation.isPending ? "Purchasing..." : "Get Double XP Boost"}
              </button>
            </div>

            {/* Streak Recovery Kit Card */}
            <div
              className="flex flex-col justify-between rounded-2xl border p-6 transition-all hover:border-[var(--c-border-hover)]"
              style={{ borderColor: C.border, backgroundColor: C.surface }}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                    <Sparkles className="h-3 w-3" /> 200 Sparks
                  </span>
                </div>
                <h4 className="text-base font-bold" style={{ color: C.text }}>
                  Streak Recovery Kit
                </h4>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: C.muted }}>
                  Repair a broken streak from past missed dates. Recovers streak continuity and preserves your compounding trajectory.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleBuyPowerUp("STREAK_RECOVERY", "Streak Recovery Kit", 200)}
                disabled={sparks < 200 || purchaseItemMutation.isPending}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  sparks >= 200
                    ? "border border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                    : "cursor-not-allowed border border-neutral-700 bg-neutral-800/40 text-neutral-500"
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                {purchaseItemMutation.isPending ? "Purchasing..." : "Get Streak Recovery Kit"}
              </button>
            </div>
          </div>
        </section>

        {/* THEMES SECTION */}
        <section>
          <div className="mb-6 flex items-center gap-2 border-b pb-2" style={{ borderColor: C.border }}>
            <Palette className="h-5 w-5" style={{ color: C.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: C.text, ...fontDisplay }}>Themes</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {themes.map((t) => {
              const isOwned = ownedThemes.includes(t.id);
              const isActive = activeTheme === t.id;
              const canAfford = sparks >= t.price;

              return (
                <button
                  key={t.id}
                  onClick={() => handleBuyTheme(t)}
                  disabled={!isOwned && !canAfford}
                  className={`relative flex flex-col items-center rounded-2xl border p-6 transition-all ${
                    isActive ? "scale-105" : ""
                  } ${!isOwned && !canAfford ? "cursor-not-allowed opacity-50" : ""}`}
                  style={{
                    borderColor: isActive ? C.borderHover : C.border,
                    backgroundColor: isActive ? C.surfaceSoft : C.surface,
                  }}
                >
                  <div
                    className="mb-4 h-12 w-12 rounded-full border-2"
                    style={{ backgroundColor: `rgb(${t.color})`, borderColor: C.bg }}
                  />
                  <span className="mb-2 font-medium" style={{ color: C.text }}>{t.name}</span>

                  {isOwned ? (
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: C.muted, backgroundColor: C.bg }}>
                      {isActive ? "Active" : "Owned"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-400">
                      <Sparkles className="h-3 w-3" /> {t.price}
                    </span>
                  )}

                  {!isOwned && !canAfford && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl backdrop-blur-[1px]" style={{ backgroundColor: `${C.bg}99` }}>
                      <Lock className="h-6 w-6" style={{ color: C.muted }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* MILESTONE & ACHIEVEMENTS CALLOUT */}
        <section className="rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: C.text, ...fontDisplay }}>
                  Streak Milestones &amp; Badges
                </h3>
                <p className="text-xs" style={{ color: C.muted }}>
                  Reach 7, 14, 30, 50, 100, and 365-day streaks to automatically unlock XP bonuses, Sparks rewards, and trophies.
                </p>
              </div>
            </div>
            <Link
              href="/achievements"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold text-white transition-colors"
            >
              <span>View Badges &amp; Trophy Gallery</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* TRANSACTION LEDGER AUDIT MODAL */}
      <TransactionLedgerModal
        isOpen={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
      />
    </>
  );
}
