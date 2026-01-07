import { getISTDate, parseISTDateKey } from "@/lib/dateUtils";

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

interface HabitStatsListProps {
  habits: Habit[];
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "yes-no":
      return "Done / Not Done";
    case "counter":
      return "Count-based";
    case "timer":
      return "Time-based";
    default:
      return type;
  }
};

const calculateCompletionRate = (
  completions: Record<string, boolean | number> = {},
  createdAt: string,
  frequency: string,
  target: number = 1
): number => {
  const createdDate = parseISTDateKey(createdAt);
  const today = getISTDate();

  createdDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Helper to check completion
  const isCompleted = (value: boolean | number | undefined): boolean => {
    if (value === undefined) return false;
    if (typeof value === "boolean") return value;
    return value >= target;
  };

  let expectedCompletions = 0;
  
  if (frequency === "daily") {
    expectedCompletions = Math.max(1, Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  } else {
    // Weekly: count weeks since creation
    const weeks = Math.max(1, Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    expectedCompletions = weeks;
  }

  if (expectedCompletions <= 0) return 0;

  const completedCount = Object.values(completions).filter(v => isCompleted(v)).length;
  const rate = Math.round((completedCount / expectedCompletions) * 100);
  
  // Clamp between 0-100
  return Math.min(100, Math.max(0, rate));
};

const HabitStatsList = ({ habits }: HabitStatsListProps) => {
  return (
    <div className="space-y-3">
      {habits.map((habit, index) => {
        const target = habit.target || 1;
        
        // Helper to check completion
        const isCompleted = (value: boolean | number | undefined): boolean => {
          if (value === undefined) return false;
          if (typeof value === "boolean") return value;
          return value >= target;
        };
        
        const totalCompletions = Object.values(habit.completions || {}).filter(v => isCompleted(v)).length;
        const completionRate = calculateCompletionRate(
          habit.completions,
          habit.createdAt,
          habit.frequency,
          target
        );

        return (
          <div
            key={habit.id}
            className="habit-card"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium">{habit.name}</h4>
              <span className="text-xs text-muted-foreground capitalize">
                {habit.frequency}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              {getTypeLabel(habit.type)}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Times Done</div>
                <div className="font-semibold text-lg">{totalCompletions}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Showing Up</div>
                <div className="font-semibold text-lg">{completionRate}%</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Best Run</div>
                <div className="font-semibold text-lg">
                  {habit.frequency === "daily" ? (habit.bestStreak || 0) : "—"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitStatsList;
