"use client";

import { useState } from "react";
import { Bell, Download, LogOut, Target, Trash2, User } from "lucide-react";

import { C, fontDisplay } from "./constants";
import type { Habit } from "./types";

type SettingsViewProps = {
  habits: Habit[];
  deleteHabit: (habitId: string) => void;
};

export function SettingsView({ habits, deleteHabit }: SettingsViewProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="flex items-center gap-6 rounded-[28px] border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4" style={{ backgroundColor: C.surfaceSoft, borderColor: C.bg }}>
          <User className="h-8 w-8" style={{ color: C.muted }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text, ...fontDisplay }}>Explorer</h2>
          <p className="text-sm" style={{ color: C.muted }}>explorer@compound.app</p>
          <button className="mt-3 rounded-full px-4 py-1.5 text-xs font-semibold transition" style={{ backgroundColor: C.surfaceSoft, color: C.text }}>
            Edit Profile
          </button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-6 rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="mb-4 flex items-center gap-3 border-b pb-4" style={{ borderColor: C.border }}>
            <Bell className="h-5 w-5" style={{ color: C.primary }} />
            <h3 className="font-semibold" style={{ color: C.text }}>Notifications</h3>
          </div>
          <ToggleRow label="Daily Summary" desc="Get a morning brief of your tasks." defaultOn={true} />
          <ToggleRow label="Streak Alerts" desc="Reminders before you lose a streak." defaultOn={true} />
        </div>

        <div className="space-y-6 rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
          <div className="mb-4 flex items-center gap-3 border-b pb-4" style={{ borderColor: C.border }}>
            <Download className="h-5 w-5" style={{ color: C.primary }} />
            <h3 className="font-semibold" style={{ color: C.text }}>Data &amp; Sync</h3>
          </div>
          <button className="flex w-full items-center justify-between rounded-xl p-3 transition" style={{ backgroundColor: C.surfaceSoft, color: C.text }}>
            <span className="text-sm font-medium">Export as CSV</span>
            <Download className="h-4 w-4" style={{ color: C.muted }} />
          </button>
          <button className="flex w-full items-center justify-between rounded-xl p-3 transition" style={{ backgroundColor: C.surfaceSoft, color: C.text }}>
            <span className="text-sm font-medium">Export as JSON</span>
            <Download className="h-4 w-4" style={{ color: C.muted }} />
          </button>
        </div>
      </section>

      <section className="rounded-2xl border p-6" style={{ borderColor: C.border, backgroundColor: C.surface }}>
        <div className="mb-4 flex items-center gap-3 border-b pb-4" style={{ borderColor: C.border }}>
          <Target className="h-5 w-5" style={{ color: C.primary }} />
          <h3 className="font-semibold" style={{ color: C.text }}>Habit Management</h3>
        </div>
        <div className="space-y-2">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between rounded-xl border p-3"
              style={{ borderColor: C.border, backgroundColor: C.surfaceSoft }}
            >
              <span className="font-medium" style={{ color: C.text }}>{habit.name}</span>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
                title="Delete Habit"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {habits.length === 0 && (
            <p className="py-2 text-sm" style={{ color: C.muted }}>
              No active habits to manage.
            </p>
          )}
        </div>
      </section>

      <section className="flex justify-center pt-4">
        <button className="flex items-center gap-2 text-sm transition" style={{ color: C.muted }}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc: string;
  defaultOn: boolean;
}) {
  const [isOn, setIsOn] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium" style={{ color: C.text }}>{label}</h4>
        <p className="text-xs" style={{ color: C.muted }}>{desc}</p>
      </div>
      <button
        onClick={() => setIsOn(!isOn)}
        className="flex h-6 w-11 items-center rounded-full px-1 transition-colors"
        style={{ backgroundColor: isOn ? C.primary : C.border }}
      >
        <div
          className={`h-4 w-4 rounded-full bg-white transition-transform ${
            isOn ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
