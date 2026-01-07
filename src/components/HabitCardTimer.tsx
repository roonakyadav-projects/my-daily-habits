import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface HabitCardTimerProps {
  elapsedSeconds: number;
  targetMinutes: number;
  onUpdate: (newElapsed: number, isCompleted: boolean) => void;
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const HabitCardTimer = ({ 
  elapsedSeconds, 
  targetMinutes, 
  onUpdate 
}: HabitCardTimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [localElapsed, setLocalElapsed] = useState(elapsedSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetSeconds = targetMinutes * 60;
  const isCompleted = localElapsed >= targetSeconds;
  const progress = Math.min((localElapsed / targetSeconds) * 100, 100);

  // Sync with prop changes
  useEffect(() => {
    setLocalElapsed(elapsedSeconds);
  }, [elapsedSeconds]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setLocalElapsed(prev => {
          const newValue = prev + 1;
          const nowCompleted = newValue >= targetSeconds;
          
          // Auto-complete when target reached
          if (nowCompleted) {
            setIsRunning(false);
            onUpdate(newValue, true);
          }
          
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isCompleted, targetSeconds, onUpdate]);

  // Save progress when paused
  const handlePause = () => {
    setIsRunning(false);
    onUpdate(localElapsed, isCompleted);
  };

  const handleReset = () => {
    setIsRunning(false);
    setLocalElapsed(0);
    onUpdate(0, false);
  };

  // Circular progress indicator
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      {/* Circular progress */}
      <div className="relative w-16 h-16">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="hsl(var(--secondary))"
            strokeWidth="4"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={isCompleted ? "hsl(142, 76%, 36%)" : "hsl(var(--primary) / 0.7)"}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
          />
        </svg>
        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-mono ${isCompleted ? 'text-green-400' : 'text-foreground'}`}>
            {formatTime(localElapsed)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* Target display */}
        <span className="text-xs text-muted-foreground">
          Target: {targetMinutes} min
        </span>

        {/* Controls */}
        <div className="flex gap-1.5">
          {isCompleted ? (
            <span className="text-xs text-green-400 font-medium py-1">Done ✓</span>
          ) : (
            <>
              <button
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  isRunning 
                    ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
                onClick={isRunning ? handlePause : () => setIsRunning(true)}
              >
                {isRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground hover:bg-accent transition-all duration-200 active:scale-95"
                onClick={handleReset}
                disabled={localElapsed === 0}
              >
                <RotateCcw size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitCardTimer;
