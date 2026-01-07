import { useState, useEffect } from "react";
import AddHabitModal from "@/components/AddHabitModal";
import DeleteHabitDialog from "@/components/DeleteHabitDialog";
import BottomNav from "@/components/BottomNav";
import HabitList from "@/components/HabitList";
import { getTodayKey, getISTDate, getDateKey } from "@/lib/dateUtils";

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

const calculateCurrentStreak = (completions: Record<string, boolean> = {}): number => {
  const today = getISTDate();
  const todayKey = getDateKey(today);

  if (!completions[todayKey]) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(today);

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

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, []);

  const saveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits));
  };

  const handleAddHabit = (habit: { id: string; name: string; type: string; frequency: string }) => {
    const newHabit: Habit = {
      ...habit,
      completions: {},
      createdAt: getTodayKey(),
      bestStreak: 0,
    };
    const newHabits = [...habits, newHabit];
    saveHabits(newHabits);
    setIsModalOpen(false);
  };

  const handleMarkDone = (habitId: string) => {
    const todayKey = getTodayKey();
    const newHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        const newCompletions = {
          ...habit.completions,
          [todayKey]: true,
        };

        const newCurrentStreak = calculateCurrentStreak(newCompletions);
        const newBestStreak = Math.max(habit.bestStreak || 0, newCurrentStreak);

        return {
          ...habit,
          completions: newCompletions,
          bestStreak: newBestStreak,
        };
      }
      return habit;
    });
    saveHabits(newHabits);
  };

  const handleDeleteClick = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      setDeleteTarget(habit);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      const newHabits = habits.filter((h) => h.id !== deleteTarget.id);
      saveHabits(newHabits);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="app-header">
        <h1 className="text-xl font-semibold text-center">Habit Tracker</h1>
      </header>

      {/* Main Content */}
      <main className="page-container flex-1 px-4 py-6 pb-24 max-w-md mx-auto w-full">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
            <p className="text-muted-foreground text-lg">Nothing tracked yet.</p>
            <p className="text-muted-foreground text-sm mt-2 mb-6">You know what that means. Start.</p>
            <button
              className="btn-primary text-lg px-8 py-4"
              onClick={() => setIsModalOpen(true)}
            >
              Add a Habit
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Your Habits</h2>
              <button
                className="btn-primary text-sm px-4 py-2"
                onClick={() => setIsModalOpen(true)}
              >
                Add a Habit
              </button>
            </div>
            <HabitList 
              habits={habits} 
              onMarkDone={handleMarkDone} 
              onDelete={handleDeleteClick}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddHabit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHabitDialog
        isOpen={deleteTarget !== null}
        habitName={deleteTarget?.name || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Index;
