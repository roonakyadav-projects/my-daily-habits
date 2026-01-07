import { useState, useEffect, useRef } from "react";

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
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setName("");
      setType("yes-no");
      setFrequency("daily");
      onClose();
    }, 150);
  };

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

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
      style={{
        animation: isClosing ? "overlay-exit 0.15s ease-out forwards" : undefined,
      }}
    >
      <style>{`
        @keyframes overlay-exit {
          to { opacity: 0; }
        }
        @keyframes modal-exit {
          to { opacity: 0; transform: scale(0.95) translateY(10px); }
        }
      `}</style>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isClosing ? "modal-exit 0.15s ease-out forwards" : undefined,
        }}
      >
        <h2 className="text-xl font-semibold mb-6">Add New Habit</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Habit Name
            </label>
            <input
              ref={inputRef}
              type="text"
              className="form-input"
              placeholder="Enter habit name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
              <option value="yes-no">✓ Done / Not Done</option>
              <option value="counter"># Count-based</option>
              <option value="timer">⏱ Time-based</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {type === "yes-no" && "For habits you either do or skip (e.g. Workout, DSA practice)"}
              {type === "counter" && "For habits where quantity matters (e.g. 10 problems, 20 pages)"}
              {type === "timer" && "For habits measured in time (e.g. 60 minutes study)"}
            </p>
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
          <button className="btn-secondary flex-1" onClick={handleClose}>
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
