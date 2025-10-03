import { useState, useEffect, useCallback } from "react";

interface UseServerTimerOptions {
  initialDuration?: number;
  syncInterval?: number;
  onTimeUp?: () => void;
}

export const useServerTimer = (
  startTime: string | null,
  options: UseServerTimerOptions = {}
) => {
  const { initialDuration = 15, syncInterval = 5000, onTimeUp } = options;
  
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [serverOffset, setServerOffset] = useState(0);

  // Calculate time left based on server time
  const calculateTimeLeft = useCallback(() => {
    if (!startTime) return initialDuration;
    
    const serverTime = Date.now() + serverOffset;
    const questionStart = new Date(startTime).getTime();
    const elapsed = Math.floor((serverTime - questionStart) / 1000);
    const remaining = Math.max(0, initialDuration - elapsed);
    
    return remaining;
  }, [startTime, serverOffset, initialDuration]);

  // Update timer
  useEffect(() => {
    if (!startTime) {
      setIsActive(false);
      setTimeLeft(initialDuration);
      return;
    }

    setIsActive(true);
    
    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setIsActive(false);
        onTimeUp?.();
      }
    };

    // Initial calculation
    updateTimer();

    // Update every second (instead of 100ms)
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startTime, calculateTimeLeft, onTimeUp, initialDuration]);

  return {
    timeLeft,
    isActive,
    serverOffset,
  };
};
