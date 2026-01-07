interface Habit {
  id: string;
  name: string;
  type: string;
  frequency: string;
  completions?: Record<string, boolean>;
  createdAt: string;
  bestStreak: number;
}

interface HabitStatsListProps {
  habits: Habit[];
}

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateCompletionRate = (
  completions: Record<string, boolean> = {},
  createdAt: string
): number => {
  const createdDate = new Date(createdAt);
  const today = new Date();

  createdDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysSinceCreation =
    Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (daysSinceCreation <= 0) return 0;

  const completedDays = Object.values(completions).filter(Boolean).length;
  return Math.round((completedDays / daysSinceCreation) * 100);
};

const HabitStatsList = ({ habits }: HabitStatsListProps) => {
  return (
    <div className="space-y-3">
      {habits.map((habit) => {
        const totalCompletions = Object.values(habit.completions || {}).filter(
          Boolean
        ).length;
        const completionRate = calculateCompletionRate(
          habit.completions,
          habit.createdAt
        );

        return (
          <div key={habit.id} className="habit-card">
            <h4 className="font-medium">{habit.name}</h4>
            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Completions</div>
                <div className="font-medium text-lg">{totalCompletions}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Rate</div>
                <div className="font-medium text-lg">{completionRate}%</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Best Streak</div>
                <div className="font-medium text-lg">{habit.bestStreak || 0}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitStatsList;
