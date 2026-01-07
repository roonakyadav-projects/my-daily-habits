import { useEffect, useState, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import { getTodayKey, getISTDate, getDateKey, parseISTDateKey, getFullMonthName, isInYear } from "@/lib/dateUtils";

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
const YEAR = 2026;

const YearReview = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((habit: Habit) => ({
          ...habit,
          createdAt: habit.createdAt || getTodayKey(),
          bestStreak: habit.bestStreak || 0,
        }));
        setHabits(migrated);
      } catch {
        setHabits([]);
      }
    }
  }, []);

  const yearData = useMemo(() => {
    const today = getISTDate();
    const currentYear = today.getFullYear();
    
    // Filter completions for 2026 only
    const yearCompletions: Record<string, number> = {};
    let totalCompletions = 0;
    
    habits.forEach((habit) => {
      Object.entries(habit.completions || {}).forEach(([date, completed]) => {
        if (completed && isInYear(date, YEAR)) {
          yearCompletions[date] = (yearCompletions[date] || 0) + 1;
          totalCompletions++;
        }
      });
    });

    const daysTracked = Object.keys(yearCompletions).length;

    // Monthly breakdown
    const monthlyData: { month: string; productivity: number; completed: number; possible: number }[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(YEAR, m, 1);
      const monthEnd = new Date(YEAR, m + 1, 0);
      
      // Skip future months
      if (monthStart > today) break;
      
      let completed = 0;
      let possible = 0;
      
      for (let d = new Date(monthStart); d <= monthEnd && d <= today; d.setDate(d.getDate() + 1)) {
        const dateKey = getDateKey(d);
        habits.forEach((habit) => {
          const createdDate = parseISTDateKey(habit.createdAt);
          if (d >= createdDate && isInYear(dateKey, YEAR)) {
            if (habit.frequency === "daily") {
              possible++;
              if (habit.completions?.[dateKey]) completed++;
            }
          }
        });
      }
      
      const productivity = possible > 0 ? Math.round((completed / possible) * 100) : 0;
      monthlyData.push({
        month: monthNames[m],
        productivity,
        completed,
        possible,
      });
    }

    // Best and worst months
    const monthsWithData = monthlyData.filter(m => m.possible > 0);
    const bestMonth = monthsWithData.reduce((best, m) => m.productivity > best.productivity ? m : best, monthsWithData[0] || { month: "N/A", productivity: 0 });
    const worstMonth = monthsWithData.reduce((worst, m) => m.productivity < worst.productivity ? m : worst, monthsWithData[0] || { month: "N/A", productivity: 0 });

    // Habit analysis
    const habitStats = habits.map((habit) => {
      const yearCompletionsForHabit = Object.entries(habit.completions || {}).filter(
        ([date, completed]) => completed && isInYear(date, YEAR)
      ).length;

      const createdDate = parseISTDateKey(habit.createdAt);
      const startDate = createdDate.getFullYear() < YEAR ? new Date(YEAR, 0, 1) : createdDate;
      const endDate = today > new Date(YEAR, 11, 31) ? new Date(YEAR, 11, 31) : today;
      
      let possibleDays = 0;
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (habit.frequency === "daily") possibleDays++;
      }
      
      const rate = possibleDays > 0 ? Math.round((yearCompletionsForHabit / possibleDays) * 100) : 0;
      
      return {
        name: habit.name,
        completions: yearCompletionsForHabit,
        rate,
        bestStreak: habit.bestStreak,
      };
    });

    const mostConsistent = habitStats.reduce((best, h) => h.rate > best.rate ? h : best, habitStats[0] || { name: "N/A", rate: 0 });
    const mostStruggled = habitStats.reduce((worst, h) => h.rate < worst.rate ? h : worst, habitStats[0] || { name: "N/A", rate: 0 });

    // Longest streak in 2026
    let longestStreak = 0;
    habits.forEach((habit) => {
      if (habit.bestStreak > longestStreak) {
        longestStreak = habit.bestStreak;
      }
    });

    // Average showing up %
    const totalPossible = monthlyData.reduce((sum, m) => sum + m.possible, 0);
    const totalCompleted = monthlyData.reduce((sum, m) => sum + m.completed, 0);
    const avgShowingUp = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // Discipline score calculation
    // Based on: consistency (40%), streak behavior (30%), recovery (30%)
    const consistencyScore = avgShowingUp * 0.4;
    
    // Streak score - based on longest streak relative to days tracked
    const streakScore = daysTracked > 0 ? Math.min(100, (longestStreak / Math.min(daysTracked, 30)) * 100) * 0.3 : 0;
    
    // Recovery score - how well they bounce back after slumps
    let recoveryScore = 50; // Default middle ground
    if (monthsWithData.length >= 2) {
      let recoveries = 0;
      let slumps = 0;
      for (let i = 1; i < monthsWithData.length; i++) {
        if (monthsWithData[i - 1].productivity < 50 && monthsWithData[i].productivity > monthsWithData[i - 1].productivity) {
          recoveries++;
        }
        if (monthsWithData[i - 1].productivity < 40) {
          slumps++;
        }
      }
      if (slumps > 0) {
        recoveryScore = Math.min(100, (recoveries / slumps) * 100);
      } else if (avgShowingUp > 60) {
        recoveryScore = 80; // No slumps, consistent
      }
    }
    recoveryScore *= 0.3;
    
    const disciplineScore = Math.round(consistencyScore + streakScore + recoveryScore);

    return {
      daysTracked,
      totalCompletions,
      avgShowingUp,
      longestStreak,
      monthlyData,
      bestMonth,
      worstMonth,
      mostConsistent,
      mostStruggled,
      disciplineScore,
      hasData: habits.length > 0 && totalCompletions > 0,
    };
  }, [habits]);

  const getSummaryText = () => {
    if (!yearData.hasData) return null;
    
    const { daysTracked, bestMonth, worstMonth, avgShowingUp } = yearData;
    
    let conclusion = "";
    if (avgShowingUp >= 70) {
      conclusion = "Overall: you showed up more than you didn't. Respect.";
    } else if (avgShowingUp >= 50) {
      conclusion = "Overall: room to grow, but you're not out.";
    } else if (avgShowingUp >= 30) {
      conclusion = "Overall: progress > excuses. Keep building.";
    } else {
      conclusion = "Overall: rough year. But you're still here. That counts.";
    }

    return (
      <>
        You showed up on <span className="text-foreground font-medium">{daysTracked} days</span> this year.
        {bestMonth.month !== worstMonth.month && (
          <>
            {" "}You were most locked in during <span className="text-green-400 font-medium">{bestMonth.month}</span>.
            {worstMonth.productivity < bestMonth.productivity && (
              <> You fell off during <span className="text-red-400 font-medium">{worstMonth.month}</span>, but you came back.</>
            )}
          </>
        )}
        {" "}{conclusion}
      </>
    );
  };

  const getDisciplineLabel = (score: number) => {
    if (score >= 80) return "Elite. You showed up.";
    if (score >= 60) return "Solid. Room to push harder.";
    if (score >= 40) return "Mid. You know you can do better.";
    if (score >= 20) return "Struggling. But aware. That's step one.";
    return "Reset. 2027 is yours if you want it.";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="app-header">
        <h1 className="text-xl font-semibold text-center">Your {YEAR}</h1>
      </header>

      {/* Main Content */}
      <main className="page-container flex-1 px-4 py-6 pb-24 max-w-md mx-auto w-full overflow-y-auto">
        {!yearData.hasData ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
            <p className="text-muted-foreground text-lg">No {YEAR} data yet.</p>
            <p className="text-muted-foreground text-sm mt-2">
              Start tracking. Then come back.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div>
              <h2 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">Overview</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card">
                  <div className="text-2xl font-bold">{yearData.daysTracked}</div>
                  <div className="text-xs text-muted-foreground mt-1">Days Tracked</div>
                </div>
                <div className="stat-card">
                  <div className="text-2xl font-bold">{yearData.totalCompletions}</div>
                  <div className="text-xs text-muted-foreground mt-1">Times Showed Up</div>
                </div>
                <div className="stat-card">
                  <div className="text-2xl font-bold">{yearData.avgShowingUp}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Showing Up %</div>
                </div>
                <div className="stat-card">
                  <div className="text-2xl font-bold text-orange-400">🔥 {yearData.longestStreak}</div>
                  <div className="text-xs text-muted-foreground mt-1">Longest Run</div>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">Highlights</h2>
              <div className="habit-card space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Best Month</span>
                  <span className="font-medium text-green-400">
                    {yearData.bestMonth.month} ({yearData.bestMonth.productivity}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Worst Slump</span>
                  <span className="font-medium text-red-400">
                    {yearData.worstMonth.month} ({yearData.worstMonth.productivity}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Most Consistent</span>
                  <span className="font-medium">{yearData.mostConsistent.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Struggled With</span>
                  <span className="font-medium text-muted-foreground">{yearData.mostStruggled.name}</span>
                </div>
              </div>
            </div>

            {/* Monthly Timeline */}
            <div>
              <h2 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">Timeline</h2>
              <div className="habit-card">
                <div className="flex items-end justify-between gap-1 h-24 mb-2">
                  {yearData.monthlyData.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full rounded-t transition-all duration-300"
                        style={{ 
                          height: `${Math.max(4, m.productivity)}%`,
                          backgroundColor: m.productivity >= 60 
                            ? 'rgb(74, 222, 128)' 
                            : m.productivity >= 40 
                              ? 'rgb(250, 204, 21)' 
                              : 'rgb(248, 113, 113)'
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {yearData.monthlyData.map((m, i) => (
                    <span key={i} className="flex-1 text-center">{m.month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Raw Summary */}
            <div>
              <h2 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">The Summary</h2>
              <div className="habit-card">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {getSummaryText()}
                </p>
              </div>
            </div>

            {/* Discipline Score */}
            <div>
              <h2 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">Discipline Score ({YEAR})</h2>
              <div className="habit-card text-center">
                <div className="text-5xl font-bold mb-2">
                  {yearData.disciplineScore}
                </div>
                <div className="text-sm text-muted-foreground">
                  {getDisciplineLabel(yearData.disciplineScore)}
                </div>
                <div className="mt-4 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${yearData.disciplineScore}%`,
                      backgroundColor: yearData.disciplineScore >= 60 
                        ? 'rgb(74, 222, 128)' 
                        : yearData.disciplineScore >= 40 
                          ? 'rgb(250, 204, 21)' 
                          : 'rgb(248, 113, 113)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default YearReview;
