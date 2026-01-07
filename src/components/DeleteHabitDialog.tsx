import { useState, useEffect } from "react";

interface DeleteHabitDialogProps {
  isOpen: boolean;
  habitName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteHabitDialog = ({ isOpen, habitName, onClose, onConfirm }: DeleteHabitDialogProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onConfirm();
    }, 150);
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
        className="modal-content max-w-sm"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isClosing ? "modal-exit 0.15s ease-out forwards" : undefined,
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Delete Habit</h2>
        
        <p className="text-muted-foreground mb-2">
          You're about to delete <span className="text-foreground font-medium">"{habitName}"</span>.
        </p>
        
        <p className="text-sm text-muted-foreground mb-6">
          All data, streaks, and history for this habit will be gone forever. No undo.
        </p>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={handleClose}>
            Nah, keep it
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirm}
          >
            Delete it
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHabitDialog;
