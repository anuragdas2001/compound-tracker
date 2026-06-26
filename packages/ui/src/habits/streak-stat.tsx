interface StreakStatProps {
  icon: string;
  value: number;
  color?: string;
}

export function StreakStat({
  icon,
  value,
  color,
}: StreakStatProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-sm">
      <span className={color}>{icon}</span>

      <span className="font-medium">
        {value}
      </span>
    </div>
  );
}