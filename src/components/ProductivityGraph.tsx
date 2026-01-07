import { useState, useMemo } from "react";
import { getISTDate, getDateKey, parseISTDateKey } from "@/lib/dateUtils";

interface Habit {
  id: string;
  name: string;
  type: string;
  frequency: string;
  completions?: Record<string, boolean | number>;
  createdAt: string;
  bestStreak: number;
  target?: number;
}

interface ProductivityGraphProps {
  habits: Habit[];
}

interface DataPoint {
  label: string;
  productivity: number;
  completed: number;
  possible: number;
  startDate: Date;
  endDate: Date;
}

const ProductivityGraph = ({ habits }: ProductivityGraphProps) => {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Helper to check completion
  const isCompleted = (value: boolean | number | undefined, target: number = 1): boolean => {
    if (value === undefined) return false;
    if (typeof value === "boolean") return value;
    return value >= target;
  };

  const data = useMemo(() => {
    if (habits.length === 0) return [];

    const today = getISTDate();
    today.setHours(0, 0, 0, 0);
    const points: DataPoint[] = [];

    if (viewMode === "weekly") {
      // Last 8 weeks
      for (let weekOffset = 7; weekOffset >= 0; weekOffset--) {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() - weekOffset * 7);
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - 6);

        let completed = 0;
        let possible = 0;

        for (let d = new Date(weekStart); d <= weekEnd && d <= today; d.setDate(d.getDate() + 1)) {
          const dateKey = getDateKey(d);
          habits.forEach((habit) => {
            const createdDate = parseISTDateKey(habit.createdAt);
            createdDate.setHours(0, 0, 0, 0);
            const target = habit.target || 1;
            
            if (d >= createdDate) {
              if (habit.frequency === "daily") {
                possible++;
                if (isCompleted(habit.completions?.[dateKey], target)) completed++;
              } else if (habit.frequency === "weekly" && d.getDay() === 0) {
                // Weekly habits: only count on Sundays
                possible++;
                if (isCompleted(habit.completions?.[dateKey], target)) completed++;
              }
            }
          });
        }

        const productivity = possible > 0 
          ? Math.min(100, Math.max(0, Math.round((completed / possible) * 100))) 
          : 0;
        points.push({
          label: `W${8 - weekOffset}`,
          productivity,
          completed,
          possible,
          startDate: new Date(weekStart),
          endDate: new Date(weekEnd),
        });
      }
    } else {
      // Last 6 months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const monthStart = new Date(monthDate);

        let completed = 0;
        let possible = 0;

        for (let d = new Date(monthStart); d <= monthEnd && d <= today; d.setDate(d.getDate() + 1)) {
          const dateKey = getDateKey(d);
          habits.forEach((habit) => {
            const createdDate = parseISTDateKey(habit.createdAt);
            createdDate.setHours(0, 0, 0, 0);
            const target = habit.target || 1;
            
            if (d >= createdDate) {
              if (habit.frequency === "daily") {
                possible++;
                if (isCompleted(habit.completions?.[dateKey], target)) completed++;
              } else if (habit.frequency === "weekly" && d.getDay() === 0) {
                possible++;
                if (isCompleted(habit.completions?.[dateKey], target)) completed++;
              }
            }
          });
        }

        const productivity = possible > 0 
          ? Math.min(100, Math.max(0, Math.round((completed / possible) * 100))) 
          : 0;
        points.push({
          label: monthNames[monthDate.getMonth()],
          productivity,
          completed,
          possible,
          startDate: monthStart,
          endDate: monthEnd,
        });
      }
    }

    return points;
  }, [habits, viewMode]);

  const insights = useMemo(() => {
    if (data.length < 2) return null;

    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    const change = current.productivity - previous.productivity;

    let trend: "up" | "down" | "stable" = "stable";
    if (change > 2) trend = "up";
    else if (change < -2) trend = "down";

    const bestPeriod = data.reduce((best, point, index) => 
      point.productivity > best.productivity ? { ...point, index: index + 1 } : best, 
      { ...data[0], index: 1 }
    );

    return {
      trend,
      change: Math.min(100, Math.max(-100, change)),
      current: current.productivity,
      bestPeriod,
      periodType: viewMode === "weekly" ? "week" : "month",
    };
  }, [data, viewMode]);

  // SVG dimensions
  const width = 320;
  const height = 160;
  const padding = { top: 20, right: 15, bottom: 30, left: 35 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Generate path
  const generatePath = () => {
    if (data.length === 0) return "";
    
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * graphWidth;
      const y = padding.top + graphHeight - (d.productivity / 100) * graphHeight;
      return { x, y };
    });

    // Create smooth curve
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  const handlePointHover = (point: DataPoint, index: number) => {
    const x = padding.left + (index / (data.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (point.productivity / 100) * graphHeight;
    setHoveredPoint(point);
    setTooltipPos({ x, y });
  };

  if (habits.length === 0) return null;

  return (
    <div className="habit-card">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Are You Locking In?</h3>
        <div className="flex bg-secondary/50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("weekly")}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
              viewMode === "weekly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${
              viewMode === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Graph */}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Y-axis grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + graphHeight - (val / 100) * graphHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                  strokeDasharray="4,4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="currentColor"
                  fillOpacity={0.5}
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Gradient fill */}
          <defs>
            <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Fill area */}
          {data.length > 0 && (
            <path
              d={`${generatePath()} L ${padding.left + graphWidth} ${padding.top + graphHeight} L ${padding.left} ${padding.top + graphHeight} Z`}
              fill="url(#graphGradient)"
            />
          )}

          {/* Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, i) => {
            const x = padding.left + (i / (data.length - 1)) * graphWidth;
            const y = padding.top + graphHeight - (point.productivity / 100) * graphHeight;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={hoveredPoint === point ? 6 : 4}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => handlePointHover(point, i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, i) => {
            const x = padding.left + (i / (data.length - 1)) * graphWidth;
            return (
              <text
                key={i}
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                fillOpacity={0.5}
              >
                {point.label}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="tooltip"
            style={{
              left: `${(tooltipPos.x / width) * 100}%`,
              top: `${(tooltipPos.y / height) * 100}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="font-medium">{hoveredPoint.label}</div>
            <div className="text-primary">{hoveredPoint.productivity}%</div>
            <div className="text-xs opacity-70">
              {hoveredPoint.completed}/{hoveredPoint.possible} done
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
          <div className="text-sm">
            {insights.trend === "up" && (
              <span className="text-green-400">Momentum looks good. Don't break it.</span>
            )}
            {insights.trend === "down" && (
              <span className="text-red-400">You slipped. Not the end. Lock back in.</span>
            )}
            {insights.trend === "stable" && (
              <span className="text-muted-foreground">Holding steady. Push harder.</span>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            This {insights.periodType}:{" "}
            <span className={insights.change >= 0 ? "text-green-400" : "text-red-400"}>
              {insights.change >= 0 ? "+" : ""}{insights.change}%
            </span>{" "}
            vs last
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityGraph;
