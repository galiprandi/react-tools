import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

describe('useTimer', () => {
  // Setup fakes for timer functions
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a timer with setTimeout', () => {
    const callback = vi.fn();
    const onSetTimer = vi.fn();
    
    const { result } = renderHook(() => useTimer({ onSetTimer }));
    
    act(() => {
      result.current.setTimeout(callback, 1000);
    });
    
    expect(onSetTimer).toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isActive()).toBe(true);
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isActive()).toBe(false);
  });

  it('should clear a timer before it completes', () => {
    const callback = vi.fn();
    const onSetTimer = vi.fn();
    const onCancelTimer = vi.fn();
    
    const { result } = renderHook(() => useTimer({ onSetTimer, onCancelTimer }));
    
    let timerId: number;
    act(() => {
      timerId = result.current.setTimeout(callback, 1000);
    });
    
    expect(onSetTimer).toHaveBeenCalledWith(timerId);
    
    // Clear before completion
    act(() => {
      vi.advanceTimersByTime(500);
      result.current.clearTimer();
    });
    
    expect(onCancelTimer).toHaveBeenCalledWith(timerId);
    expect(callback).not.toHaveBeenCalled();
    
    // Ensure callback doesn't fire after original time
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle timeouts with Date objects', () => {
    const callback = vi.fn();
    
    // Mock current date
    const now = new Date(2023, 0, 1, 12, 0, 0);
    vi.setSystemTime(now);
    
    // Set a date 5 minutes in the future
    const futureDate = new Date(2023, 0, 1, 12, 5, 0);
    
    const { result } = renderHook(() => useTimer());
    
    act(() => {
      result.current.setTimeoutDate(callback, futureDate);
    });
    
    expect(callback).not.toHaveBeenCalled();
    
    // Advance 5 minutes (300000ms)
    act(() => {
      vi.advanceTimersByTime(300000);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should execute setInterval repeatedly', () => {
    const callback = vi.fn();
    const onTimerComplete = vi.fn();
    
    const { result } = renderHook(() => useTimer({ onTimerComplete }));
    
    act(() => {
      result.current.setInterval(callback, 1000);
    });
    
    // After 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(onTimerComplete).toHaveBeenCalledTimes(1);
    
    // After another second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).toHaveBeenCalledTimes(2);
    expect(onTimerComplete).toHaveBeenCalledTimes(2);
  });

  it('should report progress for long timeouts', () => {
    const onProgress = vi.fn();
    
    const { result } = renderHook(() => useTimer({ onProgress }));
    
    act(() => {
      result.current.setTimeout(() => {}, 10000);
    });
    
    // Advance partially through the timer
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Progress should have been reported (checking for at least one call)
    expect(onProgress).toHaveBeenCalled();
    
    // Get the last progress report
    const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1];
    expect(lastCall[0]).toBeGreaterThan(0); // progress
    expect(lastCall[0]).toBeLessThan(1); // progress less than 100%
    expect(lastCall[1]).toBeCloseTo(3000, -2); // elapsed time ~3000ms
    expect(lastCall[2]).toBe(10000); // total time
  });

  it('should execute limited intervals the specified number of times', () => {
    const callback = vi.fn();
    const onTimerComplete = vi.fn();
    
    const { result } = renderHook(() => useTimer({ onTimerComplete }));
    
    act(() => {
      result.current.setLimitedInterval(callback, 1000, 3);
    });
    
    expect(result.current.getRemainingIterations()).toBe(3);
    
    // First iteration
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.getRemainingIterations()).toBe(2);
    expect(result.current.isActive()).toBe(true);
    
    // Second iteration
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).toHaveBeenCalledTimes(2);
    expect(result.current.getRemainingIterations()).toBe(1);
    expect(result.current.isActive()).toBe(true);
    
    // Third and final iteration
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).toHaveBeenCalledTimes(3);
    expect(result.current.getRemainingIterations()).toBe(null);
    expect(result.current.isActive()).toBe(false);
    
    // Ensure it doesn't execute beyond the limit
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should calculate remaining time correctly', () => {
    const { result } = renderHook(() => useTimer());
    
    // Set current time
    const now = new Date(2023, 0, 1, 12, 0, 0);
    vi.setSystemTime(now);
    
    act(() => {
      result.current.setTimeout(() => {}, 5000);
    });
    
    // Advance partially (2 seconds)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Should have ~3000ms remaining
    const remainingTime = result.current.getRemainingTime();
    expect(remainingTime).toBeGreaterThan(2900);
    expect(remainingTime).toBeLessThan(3100);
    
    // After completion, should return -1
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(result.current.getRemainingTime()).toBe(-1);
  });

  it('should clean up all timers on unmount', () => {
    const callback = vi.fn();
    const onCancelTimer = vi.fn();
    
    const { result, unmount } = renderHook(() => useTimer({ onCancelTimer }));
    
    let timerId: number;
    act(() => {
      timerId = result.current.setTimeout(callback, 5000);
    });
    
    // Unmount should trigger cleanup
    unmount();
    
    expect(onCancelTimer).toHaveBeenCalledWith(timerId);
    
    // Advancing time should not trigger callback
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle setting a new timer while one is already active', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const onCancelTimer = vi.fn();
    
    const { result } = renderHook(() => useTimer({ onCancelTimer }));
    
    // Set first timer
    let timerId1: number;
    act(() => {
      timerId1 = result.current.setTimeout(callback1, 1000);
    });
    
    // Set second timer before first completes
    act(() => {
      result.current.setTimeout(callback2, 2000);
    });
    
    // First timer should be cancelled
    expect(onCancelTimer).toHaveBeenCalledWith(timerId1);
    
    // Advance past first timer's intended completion
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // First callback should not be called
    expect(callback1).not.toHaveBeenCalled();
    
    // Advance to second timer's completion
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Second callback should be called
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should warn but still work when providing Date object to setInterval', () => {
    const callback = vi.fn();
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    
    const { result } = renderHook(() => useTimer());
    
    act(() => {
      // @ts-expect-error - Intentionally passing incorrect type for test
      result.current.setInterval(callback, new Date());
    });
    
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('Date objects are not supported for intervals');
    
    // Should still work with default 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should warn if setLimitedInterval is called with invalid iterations', () => {
    const callback = vi.fn();
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    
    const { result } = renderHook(() => useTimer());
    
    act(() => {
      result.current.setLimitedInterval(callback, 1000, 0);
    });
    
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toContain('Invalid iterations count');
    
    // Ensure callback isn't called
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(callback).not.toHaveBeenCalled();
  });
});
