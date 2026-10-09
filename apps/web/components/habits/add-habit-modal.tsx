import { X, Brain, Heart, Zap, Shield, Flame, Leaf, Skull } from "lucide-react";
import { useState } from "react";
import { C, fontDisplay } from "./constants";

type AddHabitModalProps = {
  newName: string;
  setNewName: (value: string) => void;
  newTime: string;
  setNewTime: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
};

const STATS = [
  { id: "intelligence", label: "Intelligence", icon: Brain, color: "#3B82F6" },
  { id: "vitality", label: "Vitality", icon: Heart, color: "#EF4444" },
  { id: "charisma", label: "Charisma", icon: Zap, color: "#EAB308" },
  { id: "discipline", label: "Discipline", icon: Shield, color: "#8B5CF6" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", xp: "1x XP", icon: Leaf, color: "#22C55E" },
  { id: "medium", label: "Medium", xp: "2x XP", icon: Flame, color: "#F97316" },
  { id: "epic", label: "Epic", xp: "3x XP", icon: Skull, color: "#EF4444" },
];

export function AddHabitModal({
  newName,
  setNewName,
  newTime,
  setNewTime,
  onClose,
  onCreate,
}: AddHabitModalProps) {
  const [selectedStat, setSelectedStat] = useState("discipline");
  const [selectedDiff, setSelectedDiff] = useState("medium");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border p-6"
        style={{ borderColor: C.border, backgroundColor: C.surface }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold" style={{ color: C.text, ...fontDisplay }}>
            New Habit
          </h3>
          <button onClick={onClose} style={{ color: C.muted }} className="transition-colors hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: C.muted }}>
                Name
              </label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Drink 2L of water"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--c-primary)]"
                style={{ borderColor: C.border, backgroundColor: C.surfaceSoft, color: C.text }}
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: C.muted }}>
                Scheduled Time (Optional)
              </label>
              <input
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 08:00 AM"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--c-primary)]"
                style={{ borderColor: C.border, backgroundColor: C.surfaceSoft, color: C.text }}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider" style={{ color: C.muted }}>
              Level Up Attribute
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                const isSelected = selectedStat === stat.id;
                return (
                  <button
                    key={stat.id}
                    onClick={() => setSelectedStat(stat.id)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                      isSelected ? "border-transparent" : "hover:border-white/20"
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${stat.color}20` : C.surfaceSoft,
                      borderColor: isSelected ? stat.color : C.border,
                      color: isSelected ? stat.color : C.muted,
                    }}
                  >
                    <Icon className="mb-1.5 h-5 w-5" />
                    <span className="text-[10px] font-semibold">{stat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider" style={{ color: C.muted }}>
              Difficulty & Rewards
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((diff) => {
                const Icon = diff.icon;
                const isSelected = selectedDiff === diff.id;
                return (
                  <button
                    key={diff.id}
                    onClick={() => setSelectedDiff(diff.id)}
                    className={`flex flex-1 flex-col items-center rounded-xl border p-2 transition-all ${
                      isSelected ? "border-transparent" : "hover:border-white/20"
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${diff.color}20` : C.surfaceSoft,
                      borderColor: isSelected ? diff.color : C.border,
                      color: isSelected ? diff.color : C.muted,
                    }}
                  >
                    <Icon className="mb-1 h-4 w-4" />
                    <span className="text-xs font-medium">{diff.label}</span>
                    <span className="mt-0.5 text-[9px] font-bold opacity-80">{diff.xp}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onCreate}
          disabled={!newName.trim()}
          className="w-full rounded-lg py-3 text-sm font-bold transition-all hover:bg-[var(--c-light)] active:scale-[0.98] disabled:scale-100 disabled:opacity-40"
          style={{ backgroundColor: C.primary, color: "#06120B" }}
        >
          Create Habit
        </button>
      </div>
    </div>
  );
}
