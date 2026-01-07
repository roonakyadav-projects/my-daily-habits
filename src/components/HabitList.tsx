interface Habit {
  id: string;
  name: string;
  type: string;
  frequency: string;
}

interface HabitListProps {
  habits: Habit[];
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

const HabitList = ({ habits }: HabitListProps) => {
  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <div key={habit.id} className="habit-card">
          <h3 className="font-medium text-lg">{habit.name}</h3>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span>{getTypeLabel(habit.type)}</span>
            <span>•</span>
            <span className="capitalize">{habit.frequency}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HabitList;
