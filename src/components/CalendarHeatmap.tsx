import { useState } from "react";
import { getLastNDays, getDateKey } from "@/lib/dateUtils";

interface CalendarHeatmapProps {
  habits: Array<{
    id: string;
    name: string;
    completions?: Record<string, boolean | number>;
    target?: number;
  }>;
}

const formatDate = (dateKey: string) => {
  const date = new Date(dateKey + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const getIntensityClass = (count: number, maxCount: number) => {
  if (count === 0) return "bg-secondary";
  const ratio = count / Math.max(maxCount, 1);
  if (ratio <= 0.25) return "bg-green-900";
  if (ratio <= 0.5) return "bg-green-700";
  if (ratio <= 0.75) return "bg-green-500";
  return "bg-green-400";
};

const CalendarHeatmap = ({ habits }: CalendarHeatmapProps) => {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const days = getLastNDays(90);

  // Helper to check completion
  const isCompleted = (value: boolean | number | undefined, target: number = 1): boolean => {
    if (value === undefined) return false;
    if (typeof value === "boolean") return value;
    return value >= target;
  };

  // Calculate completions per day
  const completionsPerDay: Record<string, number> = {};
  let maxCompletions = 0;

  days.forEach((day) => {
    let count = 0;
    habits.forEach((habit) => {
      const target = habit.target || 1;
      if (isCompleted(habit.completions?.[day], target)) {
        count++;
      }
    });
    completionsPerDay[day] = count;
    if (count > maxCompletions) maxCompletions = count;
  });

  const handleMouseEnter = (day: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  // Group days into weeks (columns)
  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  days.forEach((day, index) => {
    const date = new Date(day + "T00:00:00");
    const dayOfWeek = date.getDay();

    if (index === 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push("");
      }
    }

    currentWeek.push(day);

    if (dayOfWeek === 6 || index === days.length - 1) {
      while (currentWeek.length < 7) {
        currentWeek.push("");
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getTooltipText = (count: number) => {
    if (count === 0) return "Nothing done.";
    if (count === 1) return "1 habit done.";
    return `${count} habits done.`;
  };

  return (
    <div className="relative">
      <h3 className="text-sm text-muted-foreground mb-4">Last 90 Days</h3>
      
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground mr-2 pt-0.5">
          <span className="h-3 leading-3">S</span>
          <span className="h-3 leading-3">M</span>
          <span className="h-3 leading-3">T</span>
          <span className="h-3 leading-3">W</span>
          <span className="h-3 leading-3">T</span>
          <span className="h-3 leading-3">F</span>
          <span className="h-3 leading-3">S</span>
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`heatmap-cell ${
                    day
                      ? getIntensityClass(completionsPerDay[day] || 0, maxCompletions)
                      : "bg-transparent"
                  } ${day ? "cursor-pointer" : ""}`}
                  onMouseEnter={(e) => day && handleMouseEnter(day, e)}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-secondary" />
        <div className="w-3 h-3 rounded-sm bg-green-900" />
        <div className="w-3 h-3 rounded-sm bg-green-700" />
        <div className="w-3 h-3 rounded-sm bg-green-500" />
        <div className="w-3 h-3 rounded-sm bg-green-400" />
        <span>More</span>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="tooltip"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
          }}
        >
          <div className="font-medium">{formatDate(hoveredDay)}</div>
          <div className="text-muted-foreground">
            {getTooltipText(completionsPerDay[hoveredDay] || 0)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarHeatmap;
