import { useRef, useEffect, useCallback } from 'react';

type TimerType = 'timeout' | 'interval';

interface TimerRef {
  id: number | null;
  type: TimerType;
  callback?: () => void;
}

type TimerEventCallback = (timerId: number) => void;

interface UseTimerOptions {
  /** Executed when a new timer is set */
  onSetTimer?: TimerEventCallback;
  /** Executed when a timer is cancelled before completion */
  onCancelTimer?: TimerEventCallback;
  /** Executed when a timer finishes its execution */
  onTimerComplete?: TimerEventCallback;
}

/**
 * Calculates delay in milliseconds based on input
 * @param delay A number of milliseconds or a future Date object
 * @returns Milliseconds until the target time
 */
function calculateDelay(delay: number | Date): number {
  if (delay instanceof Date) {
    const now = new Date();
    const targetTime = delay.getTime();
    const timeUntilTarget = targetTime - now.getTime();
    
    // Return at least 0 to prevent negative delays
    return Math.max(0, timeUntilTarget);
  }
  
  return delay;
}

/**
 * Custom hook for managing timers with event callbacks
 * Handles both setTimeout and setInterval with automatic cleanup
 */
export function useTimer(options: UseTimerOptions = {}) {
  const { onSetTimer, onCancelTimer, onTimerComplete } = options;
  const timerRef = useRef<TimerRef>({ id: null, type: 'timeout' });
  
  // Internal function to notify when a timer completes
  const handleTimerComplete = useCallback((id: number) => {
    if (onTimerComplete && id === timerRef.current.id) {
      onTimerComplete(id);
    }
  }, [onTimerComplete]);

  // Clear any active timer and trigger cancel callback if needed
  const clear = useCallback(() => {
    if (timerRef.current.id !== null) {
      const currentId = timerRef.current.id;
      
      if (timerRef.current.type === 'timeout') {
        window.clearTimeout(currentId);
      } else {
        window.clearInterval(currentId);
      }
      
      // Only notify cancellation if there was an active timer
      if (onCancelTimer && currentId !== null) {
        onCancelTimer(currentId);
      }
      
      timerRef.current.id = null;
      timerRef.current.callback = undefined;
    }
  }, [onCancelTimer]);
  
  /**
   * Sets a timeout with event callbacks
   * @param callback Function to execute when timer completes
   * @param delay Number of milliseconds or a future Date
   */
  const setTimeout = useCallback((callback: () => void, delay: number | Date) => {
    // Clear any existing timer
    clear();
    
    // Calculate milliseconds from number or Date
    const delayMs = calculateDelay(delay);
    
    // Wrap the callback to handle completion notification
    const wrappedCallback = () => {
      callback();
      const completedId = timerRef.current.id;
      timerRef.current.id = null;
      
      if (completedId !== null) {
        handleTimerComplete(completedId);
      }
    };
    
    // Configure the new timer
    timerRef.current.type = 'timeout';
    timerRef.current.callback = callback;
    const id = window.setTimeout(wrappedCallback, delayMs);
    timerRef.current.id = id;
    
    // Notify timer creation
    if (onSetTimer) {
      onSetTimer(id);
    }
    
    return id;
  }, [clear, onSetTimer, handleTimerComplete]);
  
  /**
   * Sets an interval with event callbacks
   * @param callback Function to execute on each interval
   * @param delay Number of milliseconds between executions
   */
  const setInterval = useCallback((callback: () => void, delay: number) => {
    // Clear any existing timer
    clear();
    
    // For intervals, only accept numeric delays (Date objects don't make sense for intervals)
    if (delay instanceof Date) {
      console.warn('Date objects are not supported for intervals. Using 1000ms as default.');
      delay = 1000;
    }
    
    // For intervals, the callback executes repeatedly,
    // but we don't want to reset the id after each execution
    const wrappedCallback = () => {
      callback();
      // For intervals, notify each execution without clearing the id
      if (timerRef.current.id !== null) {
        handleTimerComplete(timerRef.current.id);
      }
    };
    
    // Configure the new interval
    timerRef.current.type = 'interval';
    timerRef.current.callback = callback;
    const id = window.setInterval(wrappedCallback, delay);
    timerRef.current.id = id;
    
    // Notify interval creation
    if (onSetTimer) {
      onSetTimer(id);
    }
    
    return id;
  }, [clear, onSetTimer, handleTimerComplete]);
  
  /**
   * Sets a timeout to execute at a specific future date
   * @param callback Function to execute when date is reached
   * @param targetDate Future date when callback should execute
   */
  const setTimeoutDate = useCallback((callback: () => void, targetDate: Date) => {
    return setTimeout(callback, targetDate);
  }, [setTimeout]);
  
  // Auto-cleanup when component unmounts
  useEffect(() => {
    return clear;
  }, [clear]);
  
  return {
    setTimeout,
    setInterval,
    setTimeoutDate,
    clearTimer: clear,
    isActive: () => timerRef.current.id !== null,
    getCurrentTimerId: () => timerRef.current.id,
    /**
     * Returns the remaining time in milliseconds for an active timeout
     * Not applicable for intervals (returns -1)
     */
    getRemainingTime: () => {
      // This is not possible to implement accurately in browser JavaScript
      // We'd need a reference to when the timer was created and what the delay was
      return -1;
    }
  };
}

// Example usage:
/*
const { setTimeout, setTimeoutDate, clearTimer } = useTimer({
  onSetTimer: (timerId) => console.log(`Timer ${timerId} created`),
  onCancelTimer: (timerId) => console.log(`Timer ${timerId} cancelled`),
  onTimerComplete: (timerId) => console.log(`Timer ${timerId} completed`)
});

// Using with milliseconds:
setTimeout(() => {
  console.log('3 seconds passed');
}, 3000);

// Using with a future date:
const futureDate = new Date();
futureDate.setMinutes(futureDate.getMinutes() + 5);
setTimeoutDate(() => {
  console.log('5 minutes passed');
}, futureDate);
*/
