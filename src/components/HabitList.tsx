interface Habit {
  id: string;
  name: string;
  type: string;
  frequency: string;
  completions?: Record<string, boolean>;
  createdAt: string;
  bestStreak: number;
}

interface HabitListProps {
  habits: Habit[];
  onMarkDone: (habitId: string) => void;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "yes-no":
      return "Yes / No";
    case "counter":
      return "Counter";
    case "timer":
      return "Timer";
    default:
      return type;
  }
};

const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateCurrentStreak = (completions: Record<string, boolean> = {}): number => {
  const today = new Date();
  const todayKey = getDateKey(today);

  // If today is not completed, streak is 0
  if (!completions[todayKey]) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(today);

  // Count backwards from today
  while (true) {
    const dateKey = getDateKey(currentDate);
    if (completions[dateKey]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

const calculateConsistency = (
  completions: Record<string, boolean> = {},
  createdAt: string
): number => {
  const createdDate = new Date(createdAt);
  const today = new Date();
  
  // Reset time to midnight for accurate day counting
  createdDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Calculate days since creation (including today)
  const daysSinceCreation = Math.floor(
    (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  if (daysSinceCreation <= 0) return 0;

  // Count completed days
  const completedDays = Object.values(completions).filter(Boolean).length;

  return Math.round((completedDays / daysSinceCreation) * 100);
};

const HabitList = ({ habits, onMarkDone }: HabitListProps) => {
  const todayKey = getTodayKey();

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const isDoneToday = habit.completions?.[todayKey] === true;
        const isDaily = habit.frequency === "daily";
        
        // Only calculate streaks for daily habits
        const currentStreak = isDaily
          ? calculateCurrentStreak(habit.completions)
          : null;
        const bestStreak = isDaily ? habit.bestStreak || 0 : null;
        const consistency = isDaily
          ? calculateConsistency(habit.completions, habit.createdAt)
          : null;

        return (
          <div
            key={habit.id}
            className={`habit-card ${isDoneToday ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg">{habit.name}</h3>
                  {isDoneToday && (
                    <span className="text-green-500 text-sm">✓</span>
                  )}
                </div>
                <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{getTypeLabel(habit.type)}</span>
                  <span>•</span>
                  <span className="capitalize">{habit.frequency}</span>
                </div>

                {/* Streak & Consistency Stats - Only for daily habits */}
                {isDaily && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
                    <span className="text-orange-400">
                      🔥 {currentStreak} day{currentStreak !== 1 ? "s" : ""}
                    </span>
                    <span className="text-yellow-500">
                      🏆 {bestStreak} day{bestStreak !== 1 ? "s" : ""}
                    </span>
                    <span className="text-muted-foreground">
                      {consistency}% consistent
                    </span>
                  </div>
                )}
              </div>

              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors shrink-0 ${
                  isDoneToday
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                onClick={() => !isDoneToday && onMarkDone(habit.id)}
                disabled={isDoneToday}
              >
                {isDoneToday ? "Done ✓" : "Mark Done"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitList;
