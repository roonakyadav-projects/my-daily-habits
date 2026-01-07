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
      {habits.map((habit, index) => {
        const totalCompletions = Object.values(habit.completions || {}).filter(
          Boolean
        ).length;
        const completionRate = calculateCompletionRate(
          habit.completions,
          habit.createdAt
        );

        return (
          <div
            key={habit.id}
            className="habit-card"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <h4 className="font-medium">{habit.name}</h4>
            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
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
                <div className="font-semibold text-lg">{habit.bestStreak || 0}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitStatsList;
