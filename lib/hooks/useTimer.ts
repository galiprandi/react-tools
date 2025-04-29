// src/hooks/useTimer.ts
import { useRef, useEffect, useCallback } from 'react';

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
 * 
 * Features:
 * - Timer events (set, cancel, complete)
 * - Date-based scheduling
 * - Progress reporting for long timers
 * - Limited recurrence timers
 * 
 * @param options Configuration options for timer events and behavior
 * @returns Timer control methods and status information
 */
export function useTimer(options: UseTimerOptions = {}) {
  const { 
    onSetTimer, 
    onCancelTimer, 
    onTimerComplete, 
    onProgress 
  } = options;
  
  const timerRef = useRef<TimerRef>({
    id: null,
    type: 'timeout',
    startTime: null,
    totalDuration: null,
    remainingIterations: null,
    progressIntervalId: null
  });
  
  // Internal function to notify when a timer completes
  const handleTimerComplete = useCallback((id: number) => {
    if (onTimerComplete && id === timerRef.current.id) {
      onTimerComplete(id);
    }
  }, [onTimerComplete]);

  // Clear progress tracking interval if exists
  const clearProgressTracking = useCallback(() => {
    if (timerRef.current.progressIntervalId !== null) {
      window.clearInterval(timerRef.current.progressIntervalId);
      timerRef.current.progressIntervalId = null;
    }
  }, []);

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
      
      clearProgressTracking();
      
      timerRef.current.id = null;
      timerRef.current.callback = undefined;
      timerRef.current.startTime = null;
      timerRef.current.totalDuration = null;
      timerRef.current.remainingIterations = null;
    }
  }, [onCancelTimer, clearProgressTracking]);
  
  // Setup progress tracking for a long timer
  const setupProgressTracking = useCallback((totalDuration: number) => {
    if (!onProgress || totalDuration <= 0) return;
    
    const startTime = Date.now();
    timerRef.current.startTime = startTime;
    timerRef.current.totalDuration = totalDuration;
    
    // Calculate how often to report progress (aim for ~10 updates)
    const progressCheckInterval = Math.max(100, Math.floor(totalDuration / 10));
    
    const progressIntervalId = window.setInterval(() => {
      if (timerRef.current.id === null) {
        clearProgressTracking();
        return;
      }
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      if (onProgress) {
        onProgress(progress, elapsed, totalDuration);
      }
      
      // Clear the progress tracking once we reach 100% or close to it
      if (progress >= 0.999) {
        clearProgressTracking();
      }
    }, progressCheckInterval);
    
    timerRef.current.progressIntervalId = progressIntervalId;
  }, [onProgress, clearProgressTracking]);
  
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
    
    // Setup progress tracking for longer timers
    if (delayMs > 1000) {
      setupProgressTracking(delayMs);
    }
    
    // Wrap the callback to handle completion notification
    const wrappedCallback = () => {
      callback();
      const completedId = timerRef.current.id;
      timerRef.current.id = null;
      timerRef.current.startTime = null;
      timerRef.current.totalDuration = null;
      
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
  }, [clear, onSetTimer, handleTimerComplete, setupProgressTracking]);
  
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
  
  /**
   * Sets an interval that executes a limited number of times
   * @param callback Function to execute on each interval
   * @param delay Number of milliseconds between executions
   * @param iterations Maximum number of times to execute the callback
   */
  const setLimitedInterval = useCallback((
    callback: () => void, 
    delay: number, 
    iterations: number
  ) => {
    // Clear any existing timer
    clear();
    
    if (iterations <= 0) {
      console.warn('Invalid iterations count, must be greater than 0');
      return null;
    }
    
    // For intervals, only accept numeric delays
    if (delay instanceof Date) {
      console.warn('Date objects are not supported for intervals. Using 1000ms as default.');
      delay = 1000;
    }
    
    timerRef.current.remainingIterations = iterations;
    
    const wrappedCallback = () => {
      // Execute the callback
      callback();
      
      // Decrement remaining iterations
      if (timerRef.current.remainingIterations !== null) {
        timerRef.current.remainingIterations--;
        
        // If we've reached the limit, clear the interval
        if (timerRef.current.remainingIterations <= 0) {
          const completedId = timerRef.current.id;
          clear();
          
          if (completedId !== null) {
            handleTimerComplete(completedId);
          }
        } else {
          // Otherwise just notify about this execution
          if (timerRef.current.id !== null) {
            handleTimerComplete(timerRef.current.id);
          }
        }
      }
    };
    
    // Configure the new limited interval
    timerRef.current.type = 'interval';
    timerRef.current.callback = callback;
    const id = window.setInterval(wrappedCallback, delay);
    timerRef.current.id = id;
    
    // Notify timer creation
    if (onSetTimer) {
      onSetTimer(id);
    }
    
    return id;
  }, [clear, onSetTimer, handleTimerComplete]);
  
  // Auto-cleanup when component unmounts
  useEffect(() => {
    return clear;
  }, [clear]);
  
  return {
    setTimeout,
    setInterval,
    setTimeoutDate,
    setLimitedInterval,
    clearTimer: clear,
    isActive: () => timerRef.current.id !== null,
    getCurrentTimerId: () => timerRef.current.id,
    getRemainingIterations: () => timerRef.current.remainingIterations,
    /**
     * Returns the remaining time in milliseconds for an active timeout
     * Not applicable for intervals (returns -1)
     */
    getRemainingTime: () => {
      if (timerRef.current.id === null || 
          timerRef.current.type !== 'timeout' || 
          timerRef.current.startTime === null || 
          timerRef.current.totalDuration === null) {
        return -1;
      }
      
      const elapsed = Date.now() - timerRef.current.startTime;
      return Math.max(0, timerRef.current.totalDuration - elapsed);
    }
  };
}

// Interfaces and types definitions
type TimerType = 'timeout' | 'interval';

interface TimerRef {
  id: number | null;
  type: TimerType;
  callback?: () => void;
  startTime: number | null;
  totalDuration: number | null;
  remainingIterations: number | null;
  progressIntervalId: number | null;
}

type TimerEventCallback = (timerId: number) => void;
type ProgressCallback = (progress: number, elapsedMs: number, totalMs: number) => void;

interface UseTimerOptions {
  /** Executed when a new timer is set */
  onSetTimer?: TimerEventCallback;
  /** Executed when a timer is cancelled before completion */
  onCancelTimer?: TimerEventCallback;
  /** Executed when a timer finishes its execution */
  onTimerComplete?: TimerEventCallback;
  /** Executed periodically to report progress for long timers */
  onProgress?: ProgressCallback;
}

// Example usage:
/*
const { 
  setTimeout, 
  setTimeoutDate, 
  setLimitedInterval,
  clearTimer
} = useTimer({
  onSetTimer: (timerId) => console.log(`Timer ${timerId} created`),
  onCancelTimer: (timerId) => console.log(`Timer ${timerId} cancelled`),
  onTimerComplete: (timerId) => console.log(`Timer ${timerId} completed`),
  onProgress: (progress, elapsed, total) => {
    console.log(`Progress: ${Math.round(progress * 100)}% (${elapsed}ms / ${total}ms)`);
  }
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

// Using limited interval (executes 5 times):
setLimitedInterval(() => {
  console.log('Executing limited interval');
}, 2000, 5);
*/
