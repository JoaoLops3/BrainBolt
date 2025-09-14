import { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameTimerProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  onTimeUp: () => void;
  onTick: (newTime: number) => void;
}

export const GameTimer = ({ timeLeft, totalTime, isActive, onTimeUp, onTick }: GameTimerProps) => {
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

  const percentage = (timeLeft / totalTime) * 100;
  const isLowTime = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  return (
    <div className={cn(
      "bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 transition-all",
      isLowTime && "animate-pulse",
      isCritical && "border-red-400/50 bg-red-500/10"
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className={cn(
            "h-4 w-4",
            isCritical ? "text-red-400" : isLowTime ? "text-orange-400" : "text-white"
          )} />
          <span className={cn(
            "text-sm font-medium",
            isCritical ? "text-red-400" : isLowTime ? "text-orange-400" : "text-white"
          )}>
            Tempo
          </span>
        </div>
        
        <span className={cn(
          "text-lg font-bold tabular-nums",
          isCritical ? "text-red-400" : isLowTime ? "text-orange-400" : "text-white"
        )}>
          {timeLeft}s
        </span>
      </div>
      
      <Progress
        value={percentage}
        className="h-2 bg-white/10"
      />
      
      <div className="flex justify-center mt-2">
        <div className={cn(
          "w-2 h-2 rounded-full transition-all",
          isCritical ? "bg-red-400 animate-ping" :
          isLowTime ? "bg-orange-400 animate-pulse" : 
          "bg-green-400"
        )} />
      </div>
    </div>
  );
};