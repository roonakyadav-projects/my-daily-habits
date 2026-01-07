import { useState } from "react";

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: {
    id: string;
    name: string;
    type: string;
    frequency: string;
  }) => void;
}

const AddHabitModal = ({ isOpen, onClose, onSave }: AddHabitModalProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("yes-no");
  const [frequency, setFrequency] = useState("daily");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;

    const habit = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      frequency,
    };

    onSave(habit);
    setName("");
    setType("yes-no");
    setFrequency("daily");
  };

  const handleCancel = () => {
    setName("");
    setType("yes-no");
    setFrequency("daily");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-6">Add New Habit</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Habit Name
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter habit name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Habit Type
            </label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="yes-no">Yes / No</option>
              <option value="counter">Counter</option>
              <option value="timer">Timer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Frequency
            </label>
            <select
              className="form-select"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button className="btn-secondary flex-1" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Create Habit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHabitModal;
