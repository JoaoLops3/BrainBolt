import { useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  onTimeUp: () => void;
  onTick: (newTime: number) => void;
}

export const GameTimer = ({
  timeLeft,
  totalTime,
  isActive,
  onTimeUp,
  onTick,
}: GameTimerProps) => {
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      const newTime = timeLeft - 1;
      onTick(newTime);

      if (newTime <= 0) {
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp, onTick]);

  const isLowTime = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  return (
    <div className="w-full flex justify-end">
      <div
        className={cn(
          "bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-2 sm:p-3 transition-all inline-flex items-center gap-2",
          isLowTime && "animate-pulse",
          isCritical && "border-red-400/50 bg-red-500/10"
        )}
      >
        <Clock
          className={cn(
            "h-3 w-3 sm:h-4 sm:w-4",
            isCritical
              ? "text-red-400"
              : isLowTime
              ? "text-orange-400"
              : "text-white"
          )}
        />
        <span
          className={cn(
            "text-xs sm:text-sm font-medium",
            isCritical
              ? "text-red-400"
              : isLowTime
              ? "text-orange-400"
              : "text-white"
          )}
        >
          Tempo
        </span>
        <span
          className={cn(
            "tabular-nums font-bold",
            "text-sm sm:text-base",
            isCritical
              ? "text-red-400"
              : isLowTime
              ? "text-orange-400"
              : "text-white"
          )}
        >
          {timeLeft}s
        </span>
        <div
          className={cn(
            "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all",
            isCritical
              ? "bg-red-400 animate-ping"
              : isLowTime
              ? "bg-orange-400 animate-pulse"
              : "bg-green-400"
          )}
        />
      </div>
    </div>
  );
};
