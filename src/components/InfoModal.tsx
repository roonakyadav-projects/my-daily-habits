import { X } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">How It Works</h2>
          <button
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Discipline Score */}
          <section>
            <h3 className="font-medium text-foreground mb-2">Discipline Score (0–100)</h3>
            <p className="text-muted-foreground mb-3">
              A weighted measure of your habit discipline across four factors:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Completion Rate</span>
                <span className="text-foreground">40%</span>
              </div>
              <p className="text-xs pl-4 border-l border-border">
                Days completed ÷ Expected days
              </p>
              
              <div className="flex justify-between mt-3">
                <span>Streak Strength</span>
                <span className="text-foreground">30%</span>
              </div>
              <p className="text-xs pl-4 border-l border-border">
                Current streak capped at 21 days (habit formation threshold)
              </p>
              
              <div className="flex justify-between mt-3">
                <span>Consistency</span>
                <span className="text-foreground">20%</span>
              </div>
              <p className="text-xs pl-4 border-l border-border">
                Active days ÷ Days since first habit created
              </p>
              
              <div className="flex justify-between mt-3">
                <span>Recovery</span>
                <span className="text-foreground">10%</span>
              </div>
              <p className="text-xs pl-4 border-l border-border">
                Successful comebacks after missed days
              </p>
            </div>
          </section>

          {/* Habit Types */}
          <section>
            <h3 className="font-medium text-foreground mb-2">Habit Types</h3>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <span className="text-foreground">Done / Not Done</span>
                <p className="text-xs mt-1">Binary completion. You either did it or you didn't.</p>
              </div>
              <div>
                <span className="text-foreground">Count-based</span>
                <p className="text-xs mt-1">Track quantity. Completed when you hit your target number.</p>
              </div>
              <div>
                <span className="text-foreground">Time-based</span>
                <p className="text-xs mt-1">Track duration. Auto-completes when target time is reached.</p>
              </div>
            </div>
          </section>

          {/* Frequency */}
          <section>
            <h3 className="font-medium text-foreground mb-2">Daily vs Weekly</h3>
            <div className="space-y-2 text-muted-foreground text-xs">
              <p>
                <span className="text-foreground">Daily habits</span> track streaks and consistency. 
                Missing a day resets your current streak.
              </p>
              <p>
                <span className="text-foreground">Weekly habits</span> are more flexible. 
                No streak tracking—just completion status.
              </p>
            </div>
          </section>

          {/* Timezone */}
          <section>
            <h3 className="font-medium text-foreground mb-2">Time Handling</h3>
            <p className="text-muted-foreground text-xs">
              All dates, streaks, and analytics are locked to <span className="text-foreground">IST (Asia/Kolkata)</span>. 
              Day resets at 00:00 IST regardless of your local timezone. 
              This ensures consistent tracking across sessions.
            </p>
          </section>

          {/* Completion States */}
          <section>
            <h3 className="font-medium text-foreground mb-2">Completion States</h3>
            <div className="space-y-2 text-muted-foreground text-xs">
              <p><span className="text-foreground">Completed</span> — Target reached for today</p>
              <p><span className="text-foreground">In progress</span> — Started but not finished (counter/timer only)</p>
              <p><span className="text-foreground">Not started</span> — Nothing logged yet today</p>
            </div>
          </section>
        </div>

        <button
          className="btn-secondary w-full mt-6"
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default InfoModal;
