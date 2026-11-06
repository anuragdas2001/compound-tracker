"use client";

import { Archive, ArchiveRestore, Flame, RotateCcw, Target, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useArchivedHabits } from "@repo/query/habits/useHabits";
import { useUnarchiveHabit, useDeleteHabit } from "@repo/query/habits/useMutations";
import { useSession } from "next-auth/react";

import { C, fontDisplay, fontMono } from "./constants";

export function ArchivedView() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data: archivedHabits = [], isLoading } = useArchivedHabits(userId);
  const unarchiveMutation = useUnarchiveHabit();
  const deleteMutation = useDeleteHabit();

  const handleRestore = (habitId: string, title: string) => {
    unarchiveMutation.mutate(habitId, {
      onSuccess: () => {
        toast.success(`"${title}" restored to active board!`);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to restore habit.");
      },
    });
  };

  const handleDelete = (habitId: string, title: string) => {
    if (confirm(`Permanently delete "${title}" and all its logged history? This action cannot be undone.`)) {
      deleteMutation.mutate(habitId, {
        onSuccess: () => {
          toast.success(`"${title}" deleted permanently.`);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to delete habit.");
        },
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-6"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Archive size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: C.text, ...fontDisplay }}>
              Archived Habits
            </h2>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: C.muted }}>
              Paused routines preserved with their lifetime logging data. Restore them back to active anytime.
            </p>
          </div>
        </div>

        <span
          className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: C.surfaceSoft, color: C.muted, ...fontMono }}
        >
          {archivedHabits.length} {archivedHabits.length === 1 ? "habit" : "habits"}
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--c-primary)] border-t-transparent" />
          <p className="text-xs" style={{ color: C.muted }}>Loading archived habits...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && archivedHabits.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border py-20 px-6 text-center"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--c-surface-soft)] text-[var(--c-muted)] mb-4 border border-[var(--c-border)]">
            <Archive size={28} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: C.text, ...fontDisplay }}>
            No habits in archive
          </h3>
          <p className="text-xs sm:text-sm max-w-md mt-1" style={{ color: C.muted }}>
            When you need to pause a habit without losing its historical check-ins or streaks, click the menu on any habit in Insights and select &ldquo;Archive habit&rdquo;.
          </p>
        </div>
      )}

      {/* List of Archived Habits */}
      {!isLoading && archivedHabits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archivedHabits.map((habit) => {
            const logsCount = habit.logs?.length || 0;
            const streakCount = habit.logs?.length || 0;

            return (
              <div
                key={habit.id}
                className="flex flex-col justify-between rounded-2xl border p-5 transition-all hover:border-[var(--c-border-hover)]"
                style={{ borderColor: C.border, backgroundColor: C.surface }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: habit.color || "var(--c-primary)" }}
                      />
                      <h4 className="font-semibold text-base" style={{ color: C.text }}>
                        {habit.title}
                      </h4>
                    </div>

                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400"
                      style={fontMono}
                    >
                      Archived
                    </span>
                  </div>

                  {habit.description && (
                    <p className="mt-2 text-xs leading-relaxed line-clamp-2" style={{ color: C.muted }}>
                      {habit.description}
                    </p>
                  )}

                  {/* Habit Metrics */}
                  <div className="mt-4 flex items-center gap-3 border-t pt-3" style={{ borderColor: C.border }}>
                    <span className="flex items-center gap-1 text-xs" style={{ color: C.muted, ...fontMono }}>
                      <Target size={13} className="text-[var(--c-primary)]" />
                      {logsCount} check-in{logsCount === 1 ? "" : "s"}
                    </span>
                    {streakCount > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: C.muted, ...fontMono }}>
                        <Flame size={13} className="text-orange-400" />
                        {streakCount} streak
                      </span>
                    )}
                    {habit.goal === "count" && habit.target && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--c-surface-soft)]" style={{ color: C.muted, ...fontMono }}>
                        Target: {habit.target} {habit.unit || "units"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex items-center gap-2 pt-3 border-t" style={{ borderColor: C.border }}>
                  <button
                    type="button"
                    onClick={() => handleRestore(habit.id, habit.title)}
                    disabled={unarchiveMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all hover:bg-[var(--c-primary)]/10 hover:border-[var(--c-primary)]"
                    style={{ borderColor: C.border, color: C.primary, backgroundColor: C.surfaceSoft }}
                  >
                    <RotateCcw size={14} />
                    Restore Habit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(habit.id, habit.title)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

