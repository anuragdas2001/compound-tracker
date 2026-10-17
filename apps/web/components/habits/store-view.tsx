"use client";

import type { Dispatch, SetStateAction } from "react";
import { Lock, Palette, Shield, Sparkles, Trophy, Unlock, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { usePurchaseItem } from "@repo/query/gamification/useGamificationMutations";

import { C, fontDisplay, fontMono } from "./constants";

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
        onSuccess: (res: any) => {
          setSparks((s) => s - cost);
          toast.success(`${itemName} added to your inventory! 🛡️`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || `Failed to purchase ${itemName}.`);
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* WALLET BANNER */}
      <div className="mb-10 flex items-center justify-between rounded-[28px] border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        <div>
          <h2 className="mb-1 text-xl font-bold" style={{ color: C.text, ...fontDisplay }}>Rewards Wallet</h2>
          <p className="text-sm" style={{ color: C.muted }}>
            Earn Sparks by checking in daily &amp; hit milestones to unlock power-ups and themes.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 px-6 py-3" style={{ backgroundColor: C.surfaceSoft }}>
          <Sparkles className="h-6 w-6 text-amber-400" />
          <span className="text-3xl font-black text-amber-400" style={fontMono}>{sparks}</span>
        </div>
      </div>

      <div className="space-y-12">
        {/* POWER-UPS SECTION */}
        <section>
          <div className="mb-6 flex items-center justify-between border-b pb-2" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" style={{ color: C.primary }} />
              <h3 className="text-lg font-semibold" style={{ color: C.text, ...fontDisplay }}>
                Power-Ups &amp; Shields
              </h3>
            </div>
            <span className="text-xs uppercase tracking-wider" style={{ color: C.muted, ...fontMono }}>
              Streak Protection
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

        {/* ACHIEVEMENT GALLERY */}
        <section>
          <div className="mb-6 flex items-center gap-2 border-b pb-2" style={{ borderColor: C.border }}>
            <Trophy className="h-5 w-5" style={{ color: C.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: C.text, ...fontDisplay }}>
              Achievement Gallery
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {[7, 14, 30, 50, 100, 365].map((days, i) => {
              const unlocked = i < 2;
              return (
                <div
                  key={days}
                  className="flex flex-col items-center justify-center rounded-2xl border p-4"
                  style={{ borderColor: C.border, backgroundColor: C.surface }}
                >
                  <div
                    className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-all ${
                      unlocked ? "" : "opacity-40"
                    }`}
                    style={{ backgroundColor: unlocked ? C.surfaceSoft : C.bg }}
                  >
                    {unlocked ? (
                      <Unlock className="h-6 w-6" style={{ color: C.primary }} />
                    ) : (
                      <Lock className="h-6 w-6" style={{ color: C.muted }} />
                    )}
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: unlocked ? C.text : C.muted, ...fontMono }}
                  >
                    {days} Days
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
