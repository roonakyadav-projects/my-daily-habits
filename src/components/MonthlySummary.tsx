import { useMemo } from "react";
import { getISTDate, getDateKey, parseISTDateKey } from "@/lib/dateUtils";

const getMonthName = (monthIndex: number): string => {
  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  return months[monthIndex] || "";
};

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

interface MonthlySummaryProps {
  habits: Habit[];
}

const MonthlySummary = ({ habits }: MonthlySummaryProps) => {
  const summary = useMemo(() => {
    if (habits.length === 0) return null;

    const today = getISTDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Helper to check completion
    const isCompleted = (value: boolean | number | undefined, target: number = 1): boolean => {
      if (value === undefined) return false;
      if (typeof value === "boolean") return value;
      return value >= target;
    };

    // Calculate stats for this month
    let totalCompleted = 0;
    let totalPossible = 0;
    const daysWithCompletions = new Set<string>();
    const habitStats: { name: string; completed: number; possible: number; rate: number }[] = [];

    habits.forEach((habit) => {
      const createdDate = parseISTDateKey(habit.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      const target = habit.target || 1;
      
      let habitCompleted = 0;
      let habitPossible = 0;

      for (let d = new Date(monthStart); d <= monthEnd && d <= today; d.setDate(d.getDate() + 1)) {
        if (d < createdDate) continue;
        
        const dateKey = getDateKey(d);
        
        if (habit.frequency === "daily") {
          habitPossible++;
          if (isCompleted(habit.completions?.[dateKey], target)) {
            habitCompleted++;
            daysWithCompletions.add(dateKey);
          }
        } else if (habit.frequency === "weekly") {
          // Weekly: only count Sundays (week boundaries) within this month
          if (d.getDay() === 0) {
            habitPossible++;
            if (isCompleted(habit.completions?.[dateKey], target)) {
              habitCompleted++;
              daysWithCompletions.add(dateKey);
            }
          }
        }
      }

      totalCompleted += habitCompleted;
      totalPossible += habitPossible;

      const rate = habitPossible > 0 
        ? Math.min(100, Math.max(0, Math.round((habitCompleted / habitPossible) * 100)))
        : 0;

      habitStats.push({
        name: habit.name,
        completed: habitCompleted,
        possible: habitPossible,
        rate,
      });
    });

    const completionRate = totalPossible > 0 
      ? Math.min(100, Math.max(0, Math.round((totalCompleted / totalPossible) * 100)))
      : 0;

    // Find best and worst habits
    const sortedByRate = [...habitStats].sort((a, b) => b.rate - a.rate);
    const bestHabit = sortedByRate[0];
    const worstHabit = sortedByRate[sortedByRate.length - 1];

    return {
      monthName: getMonthName(currentMonth),
      completionRate,
      daysShowedUp: daysWithCompletions.size,
      totalDaysInMonth: Math.min(today.getDate(), monthEnd.getDate()),
      bestHabit: bestHabit ? { name: bestHabit.name, rate: bestHabit.rate } : null,
      worstHabit: worstHabit && sortedByRate.length > 1 ? { name: worstHabit.name, rate: worstHabit.rate } : null,
    };
  }, [habits]);

  if (!summary) return null;

  return (
    <div className="habit-card">
      <h3 className="text-base font-medium mb-4">{summary.monthName} So Far</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold">{summary.completionRate}%</div>
          <div className="text-xs text-muted-foreground">Completion Rate</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{summary.daysShowedUp}</div>
          <div className="text-xs text-muted-foreground">Days Active</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${summary.completionRate}%`,
            backgroundColor: summary.completionRate >= 60 
              ? 'rgb(74, 222, 128)' 
              : summary.completionRate >= 40 
                ? 'rgb(250, 204, 21)' 
                : 'rgb(248, 113, 113)'
          }}
        />
      </div>

      <div className="space-y-2 text-sm">
        {summary.bestHabit && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Best this month</span>
            <span className="text-green-400 font-medium">
              {summary.bestHabit.name} ({summary.bestHabit.rate}%)
            </span>
          </div>
        )}
        {summary.worstHabit && summary.bestHabit?.name !== summary.worstHabit.name && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Needs work</span>
            <span className="text-muted-foreground">
              {summary.worstHabit.name} ({summary.worstHabit.rate}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlySummary;
