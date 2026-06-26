interface DayCircleProps {
    completed: boolean;
    color: string;
    isToday?: boolean;
  }
  
  export function DayCircle({
    completed,
    color,
    isToday,
  }: DayCircleProps) {
    return (
      <div
        className={`
          relative
          h-10
          w-10
          rounded-full
          border
          transition-all
          ${
            completed
              ? "border-transparent"
              : "border-zinc-700"
          }
        `}
        style={{
          backgroundColor: completed
            ? color
            : "transparent",
        }}
      >
        {isToday && (
          <div
            className="
              absolute
              inset-[-4px]
              rounded-full
              border-2
              border-blue-400
            "
          />
        )}
      </div>
    );
  }