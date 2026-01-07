import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ProductivityGraph from "@/components/ProductivityGraph";
import CalendarHeatmap from "@/components/CalendarHeatmap";
import HabitStatsList from "@/components/HabitStatsList";

interface Habit {
  id: string;
  name: string;
  type: string;
  frequency: string;
  completions?: Record<string, boolean>;
  createdAt: string;
  bestStreak: number;
}

const STORAGE_KEY = "habits";

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Stats = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((habit: Habit) => ({
          ...habit,
          createdAt: habit.createdAt || getDateKey(new Date()),
          bestStreak: habit.bestStreak || 0,
        }));
        setHabits(migrated);
      } catch {
        setHabits([]);
      }
    }
  }, []);

  const calculateStats = () => {
    if (habits.length === 0) {
      return {
        totalDaysTracked: 0,
        totalCompletions: 0,
        averageConsistency: 0,
        longestStreak: 0,
      };
    }

    const allDates = new Set<string>();
    let totalCompletions = 0;
    let longestStreak = 0;

    habits.forEach((habit) => {
      Object.entries(habit.completions || {}).forEach(([date, completed]) => {
        if (completed) {
          allDates.add(date);
          totalCompletions++;
        }
      });
      if (habit.bestStreak > longestStreak) {
        longestStreak = habit.bestStreak;
      }
    });

    let totalConsistency = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    habits.forEach((habit) => {
      const createdDate = new Date(habit.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      const daysSinceCreation =
        Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const completedDays = Object.values(habit.completions || {}).filter(Boolean).length;
      const consistency = daysSinceCreation > 0 ? (completedDays / daysSinceCreation) * 100 : 0;
      totalConsistency += consistency;
    });

    const averageConsistency = Math.round(totalConsistency / habits.length);

    return {
      totalDaysTracked: allDates.size,
      totalCompletions,
      averageConsistency,
      longestStreak,
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="app-header">
        <h1 className="text-xl font-semibold text-center">The Truth</h1>
      </header>

      {/* Main Content */}
      <main className="page-container flex-1 px-4 py-6 pb-24 max-w-md mx-auto w-full overflow-y-auto">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
            <p className="text-muted-foreground text-lg">No data yet.</p>
            <p className="text-muted-foreground text-sm mt-2">
              That's on you. Build something.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-card">
                <div className="text-2xl font-bold">{stats.totalDaysTracked}</div>
                <div className="text-xs text-muted-foreground mt-1">Days Tracked</div>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold">{stats.totalCompletions}</div>
                <div className="text-xs text-muted-foreground mt-1">Times You Showed Up</div>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold">{stats.averageConsistency}%</div>
                <div className="text-xs text-muted-foreground mt-1">Showing Up %</div>
              </div>
              <div className="stat-card">
                <div className="text-2xl font-bold text-orange-400">
                  🔥 {stats.longestStreak}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Best You Ever Did</div>
              </div>
            </div>

            {/* Productivity Trend Graph */}
            <ProductivityGraph habits={habits} />

            {/* Calendar Heatmap */}
            <div className="habit-card">
              <CalendarHeatmap habits={habits} />
            </div>

            {/* Per-Habit Stats */}
            <div>
              <h3 className="text-lg font-medium mb-4">The Breakdown</h3>
              <HabitStatsList habits={habits} />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Stats;
