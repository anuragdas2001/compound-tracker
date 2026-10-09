import type { Dispatch, SetStateAction } from "react";
import { Lock, Palette, Sparkles, Trophy, Unlock } from "lucide-react";

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
  const handleBuyTheme = (theme: (typeof themes)[number]) => {
    if (ownedThemes.includes(theme.id)) {
      setActiveTheme(theme.id, theme.color);
    } else if (sparks >= theme.price) {
      setSparks(sparks - theme.price);
      setOwnedThemes([...ownedThemes, theme.id]);
      setActiveTheme(theme.id, theme.color);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="mb-10 flex items-center justify-between rounded-[28px] border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        <div>
          <h2 className="mb-1 text-xl font-bold" style={{ color: C.text, ...fontDisplay }}>Rewards Wallet</h2>
          <p className="text-sm" style={{ color: C.muted }}>
            Earn Sparks by checking in daily &amp; hitting milestones.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 px-6 py-3" style={{ backgroundColor: C.surfaceSoft }}>
          <Sparkles className="h-6 w-6 text-amber-400" />
          <span className="text-3xl font-black text-amber-400" style={fontMono}>{sparks}</span>
        </div>
      </div>

      <div className="space-y-12">
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
