"use client";

import { use } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  usePublicProfile,
  useAddFriend,
} from "@repo/query/users/useUserMutations";
import {
  Shield,
  Zap,
  Flame,
  Trophy,
  Share2,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  Calendar,
  Award,
} from "lucide-react";

const fontDisplay = { fontFamily: "'Fraunces', ui-serif, Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

export default function PublicProfilePage() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = decodeURIComponent(rawUsername || "");

  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;

  const { data: profile, isLoading, error } = usePublicProfile(username);
  const addFriendMutation = useAddFriend();

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `${profile?.name || username}'s Habit Profile on Compound`;
    const text = `Check out ${profile?.name || username}'s discipline journey and habits on Compound! Level ${profile?.level || 1} • ${profile?.totalXp?.toLocaleString() || 0} XP`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied to clipboard! 📋");
    }
  };

  const handleAddFriend = () => {
    if (!currentUserId) {
      toast.error("Please sign in to connect with friends.");
      return;
    }

    addFriendMutation.mutate(
      { userId: currentUserId, friendEmailOrUsername: username },
      {
        onSuccess: (res: any) => {
          toast.success(res.data?.message || "Friend connected successfully! 👥");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Could not connect with user.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <main
        className="min-h-screen text-[var(--c-text)] flex items-center justify-center p-6"
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-[var(--c-muted)]" style={fontMono}>
            Loading player profile...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main
        className="min-h-screen text-[var(--c-text)] flex items-center justify-center p-6"
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        <div className="max-w-md rounded-3xl border border-white/10 bg-[var(--c-surface)] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold" style={fontDisplay}>
            Profile Not Found
          </h2>
          <p className="mt-2 text-sm text-[var(--c-muted)] leading-relaxed">
            We couldn't find a public profile for &ldquo;{username}&rdquo;. The user may have updated their username or set their profile to private.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Leaderboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (profile.isPrivate) {
    return (
      <main
        className="min-h-screen text-[var(--c-text)] flex items-center justify-center p-6"
        style={{ backgroundColor: "var(--c-bg)" }}
      >
        <div className="max-w-md rounded-3xl border border-white/10 bg-[var(--c-surface)] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold" style={fontDisplay}>
            Private Profile
          </h2>
          <p className="mt-2 text-sm text-[var(--c-muted)] leading-relaxed">
            {profile.name}&apos;s profile is currently private.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Leaderboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isSelf = currentUserId === profile.id;

  return (
    <main
      className="min-h-screen text-[var(--c-text)] pb-24"
      style={{
        backgroundColor: "var(--c-bg)",
        backgroundImage:
          "linear-gradient(var(--c-grid) 1px, transparent 1px), linear-gradient(90deg, var(--c-grid) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500&display=swap"
      />

      <div className="mx-auto max-w-4xl px-6 pt-12 pb-20 space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Leaderboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition-all shadow-xs"
            >
              <Share2 className="h-4 w-4 text-emerald-400" />
              <span>Share Profile</span>
            </button>

            {!isSelf && currentUserId && (
              <button
                type="button"
                onClick={handleAddFriend}
                disabled={addFriendMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-300 transition-all shadow-xs"
              >
                <UserPlus className="h-4 w-4" />
                <span>{addFriendMutation.isPending ? "Connecting..." : "Add Friend"}</span>
              </button>
            )}
          </div>
        </div>

        {/* PROFILE HERO CARD */}
        <div className="relative overflow-hidden rounded-[32px] border border-[var(--c-border)] bg-[var(--c-surface)] p-8 sm:p-10 shadow-lg">
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ backgroundColor: "#a8fe43" }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-emerald-400/40 bg-emerald-500/10 text-3xl font-black text-emerald-300 shadow-xl overflow-hidden">
                  {profile.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                  {profile.level || 1}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--c-text)]" style={fontDisplay}>
                    {profile.name}
                  </h1>
                </div>
                <p className="text-sm font-mono text-emerald-400 mt-1">
                  {profile.emailPrefix || `@${username}`}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--c-muted)]">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Compounding since {profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString([], { month: "short", year: "numeric" }) : "2024"}
                  </span>
                </div>
              </div>
            </div>

            {/* Level Pill */}
            <div className="flex flex-col items-start sm:items-end rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--c-muted)]">
                Rank Classification
              </span>
              <span className="text-xl font-black text-[#a8fe43] mt-1" style={fontMono}>
                Level {profile.level || 1} Explorer
              </span>
              <span className="text-xs text-[var(--c-muted)] mt-0.5">
                {(profile.totalXp || 0).toLocaleString()} Lifetime XP
              </span>
            </div>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Zap className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Lifetime XP</span>
            </div>
            <span className="text-2xl font-black text-[var(--c-text)]" style={fontMono}>
              {(profile.totalXp || 0).toLocaleString()}
            </span>
            <p className="mt-1 text-[11px] text-[var(--c-muted)]">Total earned experience</p>
          </div>

          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Sparks</span>
            </div>
            <span className="text-2xl font-black text-amber-400" style={fontMono}>
              {(profile.sparks || 0).toLocaleString()}
            </span>
            <p className="mt-1 text-[11px] text-[var(--c-muted)]">Rewards wallet balance</p>
          </div>

          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Flame className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Active Routines</span>
            </div>
            <span className="text-2xl font-black text-[var(--c-text)]" style={fontMono}>
              {profile.totalHabits ?? 0}
            </span>
            <p className="mt-1 text-[11px] text-[var(--c-muted)]">Configured habit tracks</p>
          </div>

          <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-5">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Check-Ins</span>
            </div>
            <span className="text-2xl font-black text-emerald-400" style={fontMono}>
              {profile.totalCheckIns ?? 0}
            </span>
            <p className="mt-1 text-[11px] text-[var(--c-muted)]">Total logged completions</p>
          </div>
        </div>

        {/* UNLOCKED ACHIEVEMENTS & TROPHIES */}
        <section className="rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)] p-8">
          <div className="mb-6 flex items-center justify-between border-b border-[var(--c-border)] pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-[var(--c-text)]" style={fontDisplay}>
                Unlocked Badges &amp; Trophies ({profile.achievementsCount ?? profile.achievements?.length ?? 0})
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--c-muted)]">
              Verified on Database
            </span>
          </div>

          {(!profile.achievements || profile.achievements.length === 0) ? (
            <div className="flex flex-col items-center justify-center rounded-2xl py-12 border border-dashed border-white/10 bg-white/5">
              <Trophy className="h-10 w-10 text-white/20 mb-3" />
              <p className="text-sm font-semibold text-white/60">No badges unlocked yet</p>
              <p className="text-xs text-white/40 mt-1">Badges unlock automatically as routines and streaks compound.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.achievements.map((ach) => (
                <div
                  key={ach.key}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-all"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate">{ach.title}</h3>
                    <p className="text-xs text-[var(--c-muted)] mt-0.5 line-clamp-2 leading-relaxed">
                      {ach.description}
                    </p>
                    <span className="inline-block text-[10px] text-emerald-400 font-mono mt-2">
                      Unlocked on {new Date(ach.unlockedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CALL TO ACTION FOR VISITORS */}
        {!session && (
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-transparent p-8 sm:p-10 text-center">
            <h3 className="text-2xl font-bold text-white" style={fontDisplay}>
              Build Your Own Compounding Journey
            </h3>
            <p className="mt-2 text-sm text-emerald-200/80 max-w-xl mx-auto leading-relaxed">
              Track your daily routines, protect streaks with shields, level up, and unlock rewards alongside {profile.name}.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-2xl bg-[#a8fe43] px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-[#97ea36] transition-all shadow-lg"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

