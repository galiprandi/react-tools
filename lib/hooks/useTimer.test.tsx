import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from '../main.ts'

describe('useTimer', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should create a timer with setTimeout', () => {
        const callback = vi.fn()
        const onSetTimer = vi.fn()

        const { result } = renderHook(() => useTimer({ onSetTimer }))

        act(() => {
            result.current.setTimeout(callback, 1000)
        })

        expect(onSetTimer).toHaveBeenCalledTimes(1)
        expect(callback).not.toHaveBeenCalled()
        expect(result.current.isActive()).toBe(true)
        expect(result.current.getCurrentTimerId()).not.toBeNull()

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(callback).toHaveBeenCalledTimes(1)
        expect(result.current.isActive()).toBe(false)
        expect(result.current.getCurrentTimerId()).toBeNull()
    })

    it('should clear a timer before it completes', () => {
        const callback = vi.fn()
        const onSetTimer = vi.fn()
        const onCancelTimer = vi.fn()

        const { result } = renderHook(() =>
            useTimer({ onSetTimer, onCancelTimer }),
        )

        let timerId: number | null = null
        act(() => {
            const id = result.current.setTimeout(callback, 1000)
            if (id !== null) timerId = id
        })

        expect(onSetTimer).toHaveBeenCalledTimes(1)
        expect(onSetTimer).toHaveBeenCalledWith(timerId)
        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(500)
            result.current.clearTimer()
        })

        expect(onCancelTimer).toHaveBeenCalledTimes(1)
        expect(onCancelTimer).toHaveBeenCalledWith(timerId)
        expect(callback).not.toHaveBeenCalled()
        expect(result.current.isActive()).toBe(false)
        expect(result.current.getCurrentTimerId()).toBeNull()

        act(() => {
            vi.advanceTimersByTime(500)
        })

        expect(callback).not.toHaveBeenCalled()
    })

    it('should handle timeouts with Date objects', () => {
        const callback = vi.fn()

        const now = new Date(2023, 0, 1, 12, 0, 0)
        vi.setSystemTime(now)

        const futureDate = new Date(2223, 0, 1, 12, 0, 5) // Use a date far in the future for robustness

        const { result } = renderHook(() => useTimer())

        act(() => {
            result.current.setTimeoutDate(callback, futureDate)
        })

        expect(callback).not.toHaveBeenCalled()
        expect(result.current.isActive()).toBe(true)

        const delayMs = futureDate.getTime() - now.getTime()

        act(() => {
            vi.advanceTimersByTime(delayMs)
        })

        expect(callback).toHaveBeenCalledTimes(1)
        expect(result.current.isActive()).toBe(false)

        // Remove vi.setSystemTime(vi.getOriginalDate()) here
    })

    it('should execute setInterval repeatedly', () => {
        const callback = vi.fn()
        const onTimerComplete = vi.fn()

        const { result } = renderHook(() => useTimer({ onTimerComplete }))

        act(() => {
            result.current.setInterval(callback, 1000)
        })

        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(callback).toHaveBeenCalledTimes(1)
        expect(onTimerComplete).toHaveBeenCalledTimes(1)
        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(callback).toHaveBeenCalledTimes(2)
        expect(onTimerComplete).toHaveBeenCalledTimes(2)
        expect(result.current.isActive()).toBe(true)

        act(() => {
            result.current.clearTimer()
        })
        expect(result.current.isActive()).toBe(false)
    })

    it('should report progress for long timeouts', () => {
        const onProgress = vi.fn()

        const { result } = renderHook(() => useTimer({ onProgress }))

        const duration = 10000
        act(() => {
            result.current.setTimeout(() => {}, duration)
        })

        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(3000)
        })

        expect(onProgress).toHaveBeenCalled()

        const calls = onProgress.mock.calls
        const lastCall = calls[calls.length - 1]

        expect(lastCall[0]).toBeGreaterThan(0)
        expect(lastCall[0]).toBeLessThan(1)
        expect(lastCall[1]).toBeGreaterThan(0)
        expect(lastCall[2]).toBe(duration)

        const progressNear30Percent = calls.find((call) => {
            const progress = call[0]
            const elapsed = call[1]
            return (
                Math.abs(progress - 0.3) < 0.05 ||
                Math.abs(elapsed - 3000) < 200
            )
        })
        expect(progressNear30Percent).toBeDefined()

        act(() => {
            vi.advanceTimersByTime(7000)
        })

        expect(result.current.isActive()).toBe(false)

        const completionCall =
            onProgress.mock.calls[onProgress.mock.calls.length - 1]
        expect(completionCall[0]).toBeCloseTo(1, 2)
    })

    it('should execute limited intervals the specified number of times', () => {
        const callback = vi.fn()
        const onTimerComplete = vi.fn()
        const onProgress = vi.fn()

        const { result } = renderHook(() =>
            useTimer({ onTimerComplete, onProgress }),
        )

        const interval = 500
        const iterations = 3
        const totalDuration = interval * iterations

        act(() => {
            result.current.setLimitedInterval(callback, interval, iterations)
        })

        expect(callback).not.toHaveBeenCalled()
        expect(onTimerComplete).not.toHaveBeenCalled()
        expect(result.current.getRemainingIterations()).toBe(iterations)
        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(interval)
        })

        expect(callback).toHaveBeenCalledTimes(1)
        expect(onTimerComplete).toHaveBeenCalledTimes(1)
        expect(result.current.getRemainingIterations()).toBe(iterations - 1)
        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(interval)
        })

        expect(callback).toHaveBeenCalledTimes(2)
        expect(onTimerComplete).toHaveBeenCalledTimes(2)
        expect(result.current.getRemainingIterations()).toBe(iterations - 2)
        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(interval)
        })

        expect(callback).toHaveBeenCalledTimes(3)
        expect(onTimerComplete).toHaveBeenCalledTimes(3)
        expect(result.current.getRemainingIterations()).toBeNull()
        expect(result.current.isActive()).toBe(false)

        act(() => {
            vi.advanceTimersByTime(interval)
        })

        expect(callback).toHaveBeenCalledTimes(3)
        expect(onTimerComplete).toHaveBeenCalledTimes(3)
        expect(result.current.isActive()).toBe(false)

        expect(onProgress).toHaveBeenCalled()
        const progressCalls = onProgress.mock.calls
        expect(progressCalls[progressCalls.length - 1][0]).toBeCloseTo(1, 2)
        expect(progressCalls[progressCalls.length - 1][2]).toBe(totalDuration)
    })

    it('should calculate remaining time correctly for setTimeout', () => {
        const { result } = renderHook(() => useTimer())

        const now = new Date(2023, 0, 1, 12, 0, 0)
        vi.setSystemTime(now)

        const timerDuration = 5000
        act(() => {
            result.current.setTimeout(() => {}, timerDuration)
        })

        expect(result.current.isActive()).toBe(true)
        expect(result.current.getRemainingTime()).toBeGreaterThanOrEqual(0)

        const timeAdvanced = 2000
        act(() => {
            vi.advanceTimersByTime(timeAdvanced)
        })

        const remainingTime = result.current.getRemainingTime()
        const expectedRemaining = timerDuration - timeAdvanced

        expect(remainingTime).toBeGreaterThan(0)
        expect(remainingTime).toBeCloseTo(expectedRemaining, -2)

        act(() => {
            vi.advanceTimersByTime(timerDuration - timeAdvanced)
        })

        expect(result.current.isActive()).toBe(false)
        expect(result.current.getRemainingTime()).toBe(-1)

        // Remove vi.setSystemTime(vi.getOriginalDate()) here
    })

    it('should return -1 for remaining time for non-active states or intervals', () => {
        const { result } = renderHook(() => useTimer())

        expect(result.current.isActive()).toBe(false)
        expect(result.current.getRemainingTime()).toBe(-1)

        act(() => {
            result.current.setInterval(() => {}, 1000)
        })
        expect(result.current.isActive()).toBe(true)
        expect(result.current.getRemainingTime()).toBe(-1)

        act(() => {
            result.current.clearTimer()
        })
        expect(result.current.isActive()).toBe(false)
        expect(result.current.getRemainingTime()).toBe(-1)

        act(() => {
            result.current.setLimitedInterval(() => {}, 1000, 3)
        })
        expect(result.current.isActive()).toBe(true)
        expect(result.current.getRemainingTime()).toBe(-1)

        act(() => {
            vi.advanceTimersByTime(3000)
        })
        expect(result.current.isActive()).toBe(false)
        expect(result.current.getRemainingTime()).toBe(-1)
    })

    it('should clean up all timers on unmount', () => {
        const callback = vi.fn()
        const onCancelTimer = vi.fn()

        const { result, unmount } = renderHook(() =>
            useTimer({ onCancelTimer }),
        )

        let timerId: number | null = null
        act(() => {
            const id = result.current.setTimeout(callback, 5000)
            if (id !== null) timerId = id
        })

        expect(result.current.isActive()).toBe(true)
        expect(onCancelTimer).not.toHaveBeenCalled()

        unmount()

        expect(onCancelTimer).toHaveBeenCalledTimes(1)
        expect(onCancelTimer).toHaveBeenCalledWith(timerId)
        expect(result.current.isActive()).toBe(false)

        act(() => {
            vi.advanceTimersByTime(5000)
        })

        expect(callback).not.toHaveBeenCalled()
    })

    it('should handle setting a new timer while one is already active', () => {
        const callback1 = vi.fn()
        const callback2 = vi.fn()
        const onSetTimer = vi.fn()
        const onCancelTimer = vi.fn()

        const { result } = renderHook(() =>
            useTimer({ onSetTimer, onCancelTimer }),
        )

        let timerId1: number | null = null
        act(() => {
            const id = result.current.setTimeout(callback1, 1000)
            if (id !== null) timerId1 = id
        })
        expect(onSetTimer).toHaveBeenCalledTimes(1)
        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(500)
            result.current.setTimeout(callback2, 2000)
        })

        expect(onCancelTimer).toHaveBeenCalledTimes(1)
        expect(onCancelTimer).toHaveBeenCalledWith(timerId1)

        expect(onSetTimer).toHaveBeenCalledTimes(2)

        act(() => {
            vi.advanceTimersByTime(500)
        })

        expect(callback1).not.toHaveBeenCalled()
        expect(callback2).not.toHaveBeenCalled()
        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(2000)
        })

        expect(callback2).toHaveBeenCalledTimes(1)
        expect(result.current.isActive()).toBe(false)
    })

    it('should warn but still work when providing Date object to setInterval', () => {
        const callback = vi.fn()
        const consoleWarnSpy = vi.spyOn(console, 'warn')

        const { result } = renderHook(() => useTimer())

        act(() => {
            // @ts-expect-error: Date not supported for intervals
            result.current.setInterval(callback, new Date())
        })

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
        expect(consoleWarnSpy.mock.calls[0][0]).toContain(
            'Date objects are not supported for intervals',
        )
        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(callback).toHaveBeenCalledTimes(1)
        expect(result.current.isActive()).toBe(true)

        act(() => {
            result.current.clearTimer()
        })
        expect(result.current.isActive()).toBe(false)

        consoleWarnSpy.mockRestore()
    })

    it('should warn if setLimitedInterval is called with invalid iterations', () => {
        const callback = vi.fn()
        const consoleWarnSpy = vi.spyOn(console, 'warn')

        const { result } = renderHook(() => useTimer())

        act(() => {
            result.current.setLimitedInterval(callback, 1000, 0)
        })

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
        expect(consoleWarnSpy.mock.calls[0][0]).toContain(
            'Invalid iterations count',
        )
        expect(result.current.isActive()).toBe(false)

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(callback).not.toHaveBeenCalled()

        consoleWarnSpy.mockRestore()
    })

    it('should return null for remaining iterations for non-limited intervals/timeouts', () => {
        const { result } = renderHook(() => useTimer())

        act(() => {
            result.current.setTimeout(() => {}, 1000)
        })
        expect(result.current.getRemainingIterations()).toBeNull()

        act(() => {
            result.current.clearTimer()
            result.current.setInterval(() => {}, 1000)
        })
        expect(result.current.getRemainingIterations()).toBeNull()
    })

    it('should not report progress if onProgress callback is not provided', () => {
        const { result } = renderHook(() => useTimer({}))
        const consoleLogSpy = vi.spyOn(console, 'log')

        act(() => {
            result.current.setTimeout(() => {}, 10000)
        })

        expect(result.current.isActive()).toBe(true)

        act(() => {
            vi.advanceTimersByTime(5000)
        })

        expect(consoleLogSpy).not.toHaveBeenCalled()

        act(() => {
            vi.advanceTimersByTime(5000)
        })

        expect(result.current.isActive()).toBe(false)

        consoleLogSpy.mockRestore()
    })
})
