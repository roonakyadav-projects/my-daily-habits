import { Minus, Plus } from "lucide-react";

interface HabitCardCounterProps {
  currentValue: number;
  target: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const HabitCardCounter = ({ 
  currentValue, 
  target, 
  onIncrement, 
  onDecrement 
}: HabitCardCounterProps) => {
  const isCompleted = currentValue >= target;
  const progress = Math.min((currentValue / target) * 100, 100);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-accent transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onDecrement}
          disabled={currentValue <= 0}
        >
          <Minus size={16} />
        </button>
        
        <div className="min-w-[60px] text-center">
          <span className={`font-semibold ${isCompleted ? 'text-green-400' : 'text-foreground'}`}>
            {currentValue}
          </span>
          <span className="text-muted-foreground"> / {target}</span>
        </div>

        <button
          className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-accent transition-all duration-200 active:scale-95"
          onClick={onIncrement}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full min-w-[120px] h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ease-out rounded-full ${
            isCompleted ? 'bg-green-500' : 'bg-primary/60'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {isCompleted && (
        <span className="text-xs text-green-400 font-medium">Completed</span>
      )}
    </div>
  );
};

export default HabitCardCounter;
