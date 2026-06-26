interface WeeklyProgressHeaderProps {
    dates: Date[];
  }
  
  export function WeeklyProgressHeader({
    dates,
  }: WeeklyProgressHeaderProps) {
    return (
      <div className="flex gap-3">
        {dates.map((date) => (
          <div
            key={date.toISOString()}
            className="w-10 text-center"
          >
            <div className="text-xs text-zinc-500">
              {date.toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </div>
  
            <div className="mt-1 text-sm">
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>
    );
  }