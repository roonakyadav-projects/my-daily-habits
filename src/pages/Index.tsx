import { useState, useEffect } from "react";
import AddHabitModal from "@/components/AddHabitModal";
import BottomNav from "@/components/BottomNav";
import HabitList from "@/components/HabitList";

interface Habit {
  id: string;
  name: string;
  type: string;
  frequency: string;
}

const STORAGE_KEY = "habits";

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load habits from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHabits(JSON.parse(stored));
      } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  }, []);

  // Save habits to localStorage whenever they change
  const saveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits));
  };

  const handleAddHabit = (habit: Habit) => {
    const newHabits = [...habits, habit];
    saveHabits(newHabits);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border py-4 px-4">
        <h1 className="text-xl font-semibold text-center">Habit Tracker</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24 max-w-md mx-auto w-full">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
            <p className="text-muted-foreground text-lg mb-6">No habits yet</p>
            <button
              className="btn-primary text-lg px-8 py-4"
              onClick={() => setIsModalOpen(true)}
            >
              Add Habit
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
                Add Habit
              </button>
            </div>
            <HabitList habits={habits} />
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
    </div>
  );
};

export default Index;
