interface Habit {
  id: string;
  name: string;
  type: string;
  frequency: string;
  completions?: Record<string, boolean>;
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

const HabitList = ({ habits, onMarkDone }: HabitListProps) => {
  const todayKey = getTodayKey();

  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const isDoneToday = habit.completions?.[todayKey] === true;

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
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{getTypeLabel(habit.type)}</span>
                  <span>•</span>
                  <span className="capitalize">{habit.frequency}</span>
                </div>
              </div>

              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
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
