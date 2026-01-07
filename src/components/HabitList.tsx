import { Trash2 } from "lucide-react";
import { getTodayKey, getISTDate, getDateKey, parseISTDateKey } from "@/lib/dateUtils";
import HabitCardYesNo from "./HabitCardYesNo";
import HabitCardCounter from "./HabitCardCounter";
import HabitCardTimer from "./HabitCardTimer";

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

interface HabitListProps {
  habits: Habit[];
  onMarkDone: (habitId: string) => void;
  onUpdateValue: (habitId: string, value: number, isCompleted: boolean) => void;
  onDelete: (habitId: string) => void;
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

const calculateCurrentStreak = (completions: Record<string, boolean | number> = {}, type: string, target: number = 1): number => {
  const today = getISTDate();
  const todayKey = getDateKey(today);

  const isCompleted = (value: boolean | number | undefined): boolean => {
    if (value === undefined) return false;
    if (typeof value === "boolean") return value;
    // For counter/timer, check if value >= target
    return value >= target;
  };

  if (!isCompleted(completions[todayKey])) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateKey = getDateKey(currentDate);
    if (isCompleted(completions[dateKey])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

const calculateConsistency = (
  completions: Record<string, boolean | number> = {},
  createdAt: string,
  type: string,
  target: number = 1
): number => {
  const createdDate = parseISTDateKey(createdAt);
  const today = getISTDate();
  
  createdDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysSinceCreation = Math.floor(
    (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  if (daysSinceCreation <= 0) return 0;

  const completedDays = Object.values(completions).filter(value => {
    if (typeof value === "boolean") return value;
    return value >= target;
  }).length;

  return Math.round((completedDays / daysSinceCreation) * 100);
};

const HabitList = ({ habits, onMarkDone, onUpdateValue, onDelete }: HabitListProps) => {
  const todayKey = getTodayKey();

  return (
    <div className="space-y-3">
      {habits.map((habit, index) => {
        const todayValue = habit.completions?.[todayKey];
        const target = habit.target || 1;
        
        // Determine if completed based on type
        const isDoneToday = habit.type === "yes-no" 
          ? todayValue === true
          : typeof todayValue === "number" && todayValue >= target;

        const isDaily = habit.frequency === "daily";
        
        const currentStreak = isDaily
          ? calculateCurrentStreak(habit.completions, habit.type, target)
          : null;
        const bestStreak = isDaily ? habit.bestStreak || 0 : null;
        const consistency = isDaily
          ? calculateConsistency(habit.completions, habit.createdAt, habit.type, target)
          : null;

        // Get current numeric value for counter/timer
        const currentValue = typeof todayValue === "number" ? todayValue : 0;

        return (
          <div
            key={habit.id}
            className={`habit-card ${isDoneToday ? "completed" : ""}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg truncate">{habit.name}</h3>
                  {isDoneToday && (
                    <span className="text-green-400 text-sm flex-shrink-0">✓</span>
                  )}
                </div>
                <div className="flex gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span>{getTypeLabel(habit.type)}</span>
                  <span className="opacity-50">•</span>
                  <span className="capitalize">{habit.frequency}</span>
                </div>

                {isDaily && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
                    {currentStreak === 0 ? (
                      <span className="text-muted-foreground text-xs">
                        Streak reset. Happens. Start again.
                      </span>
                    ) : (
                      <>
                        <span className="text-orange-400">
                          🔥 {currentStreak} day{currentStreak !== 1 ? "s" : ""} run
                        </span>
                        <span className="text-yellow-500">
                          🏆 Best: {bestStreak}
                        </span>
                      </>
                    )}
                    <span className="text-muted-foreground">
                      {consistency}% showing up
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 items-end">
                {/* Render different controls based on habit type */}
                {habit.type === "yes-no" && (
                  <HabitCardYesNo 
                    isDoneToday={isDoneToday}
                    onMarkDone={() => onMarkDone(habit.id)}
                  />
                )}

                {habit.type === "counter" && (
                  <HabitCardCounter
                    currentValue={currentValue}
                    target={target}
                    onIncrement={() => onUpdateValue(habit.id, currentValue + 1, currentValue + 1 >= target)}
                    onDecrement={() => onUpdateValue(habit.id, Math.max(0, currentValue - 1), currentValue - 1 >= target)}
                  />
                )}

                {habit.type === "timer" && (
                  <HabitCardTimer
                    elapsedSeconds={currentValue}
                    targetMinutes={target}
                    onUpdate={(newElapsed, isCompleted) => onUpdateValue(habit.id, newElapsed, isCompleted)}
                  />
                )}

                <button
                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                  onClick={() => onDelete(habit.id)}
                  title="Delete habit"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitList;
