import { useRef, useEffect, useCallback } from 'react'

/**
 * Calculates the delay in milliseconds from a number or a Date object.
 *
 * @param delay - The delay as a number (ms) or a Date object.
 * @returns The calculated delay in milliseconds.
 * @internal
 */
function calculateDelay(delay: number | Date): number {
    if (delay instanceof Date) {
        const now = new Date()
        const targetTime = delay.getTime()
        const timeUntilTarget = targetTime - now.getTime()
        return Math.max(0, timeUntilTarget)
    }
    return delay
}

/**
 * A custom hook for managing various types of timers (timeouts, intervals, limited intervals)
 * with support for progress tracking and Date objects.
 *
 * This hook provides a unified interface for browser timers with additional features like
 * remaining time calculation and iteration tracking for intervals.
 *
 * @param options - Configuration options for the timer callbacks.
 * @returns An object containing methods to set and clear timers, and query their status.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { setTimeout, clearTimer, isActive } = useTimer({
 *     onTimerComplete: (id) => console.log(`Timer ${id} finished!`),
 *   });
 *
 *   const startTimer = () => {
 *     setTimeout(() => alert('Hello!'), 3000);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={startTimer}>Start 3s Timer</button>
 *       <button onClick={clearTimer} disabled={!isActive()}>Cancel</button>
 *     </div>
 *   );
 * };
 * ```
 */
export function useTimer(options: UseTimerProps = {}): UseTimerReturn {
    const { onSetTimer, onCancelTimer, onTimerComplete, onProgress } = options

    const timerRef = useRef<TimerRef>({
        id: null,
        type: 'timeout',
        callback: undefined,
        startTime: null,
        totalDuration: null,
        remainingIterations: null,
        progressIntervalId: null,
    })

    const handleTimerComplete = useCallback(
        (id: number) => {
            if (onTimerComplete && id === timerRef.current.id) {
                onTimerComplete(id)
            }
        },
        [onTimerComplete],
    )

    const clearProgressTracking = useCallback(() => {
        if (timerRef.current.progressIntervalId !== null) {
            window.clearInterval(timerRef.current.progressIntervalId)
            timerRef.current.progressIntervalId = null
        }
    }, [])

    const clear = useCallback(() => {
        if (timerRef.current.id !== null) {
            const currentId = timerRef.current.id

            if (timerRef.current.type === 'timeout') {
                window.clearTimeout(currentId)
            } else {
                window.clearInterval(currentId)
            }

            if (onCancelTimer) {
                onCancelTimer(currentId)
            }

            clearProgressTracking()

            timerRef.current.id = null
            timerRef.current.callback = undefined
            timerRef.current.startTime = null
            timerRef.current.totalDuration = null
            timerRef.current.remainingIterations = null
        }
    }, [onCancelTimer, clearProgressTracking])

    const setupProgressTracking = useCallback(
        (totalDuration: number) => {
            if (totalDuration <= 0 || !onProgress) return

            const startTime = timerRef.current.startTime || Date.now()
            if (!timerRef.current.startTime)
                timerRef.current.startTime = startTime

            const progressCheckInterval = Math.max(
                100,
                Math.min(1000, Math.floor(totalDuration / 20)),
            )

            clearProgressTracking()

            const progressIntervalId = window.setInterval(() => {
                if (
                    timerRef.current.id === null ||
                    timerRef.current.startTime === null ||
                    timerRef.current.totalDuration === null
                ) {
                    clearProgressTracking()
                    return
                }

                const elapsed = Date.now() - timerRef.current.startTime
                const currentProgress = Math.min(
                    elapsed / timerRef.current.totalDuration,
                    1,
                )

                if (onProgress) {
                    onProgress(
                        currentProgress,
                        elapsed,
                        timerRef.current.totalDuration,
                    )
                }

                if (currentProgress >= 0.999) {
                    clearProgressTracking()
                }
            }, progressCheckInterval)

            timerRef.current.progressIntervalId = progressIntervalId
        },
        [onProgress, clearProgressTracking],
    )

    const setTimeout = useCallback(
        (callback: () => void, delay: number | Date) => {
            clear()

            const delayMs = calculateDelay(delay)

            timerRef.current.startTime = Date.now()
            timerRef.current.totalDuration = delayMs

            if (delayMs > 0) {
                setupProgressTracking(delayMs)
            }

            const wrappedCallback = () => {
                callback()

                const completedId = timerRef.current.id
                timerRef.current.id = null
                timerRef.current.startTime = null
                timerRef.current.totalDuration = null
                timerRef.current.callback = undefined
                timerRef.current.remainingIterations = null
                clearProgressTracking()

                if (completedId !== null) {
                    handleTimerComplete(completedId)
                }
            }

            timerRef.current.type = 'timeout'
            timerRef.current.callback = callback
            const id = window.setTimeout(wrappedCallback, delayMs)
            timerRef.current.id = id

            if (onSetTimer) {
                onSetTimer(id)
            }

            return id
        },
        [
            clear,
            onSetTimer,
            handleTimerComplete,
            setupProgressTracking,
            clearProgressTracking,
        ],
    )

    const setInterval = useCallback(
        (callback: () => void, delay: number) => {
            clear()

            if ((delay as unknown) instanceof Date) {
                console.warn('Date objects are not supported for intervals.')
                delay = 1000
            }

            timerRef.current.startTime = Date.now()
            timerRef.current.totalDuration = null

            const wrappedCallback = () => {
                callback()

                if (timerRef.current.id !== null) {
                    handleTimerComplete(timerRef.current.id)
                }
            }

            timerRef.current.type = 'interval'
            timerRef.current.callback = callback
            const id = window.setInterval(wrappedCallback, delay)
            timerRef.current.id = id

            if (onSetTimer) {
                onSetTimer(id)
            }

            return id
        },
        [clear, onSetTimer, handleTimerComplete],
    )

    const setTimeoutDate = useCallback(
        (callback: () => void, targetDate: Date) => {
            return setTimeout(callback, targetDate)
        },
        [setTimeout],
    )

    const setLimitedInterval = useCallback(
        (callback: () => void, delay: number, iterations: number) => {
            clear()

            if (iterations <= 0) {
                console.warn('Invalid iterations count, must be greater than 0')
                return null
            }

            if ((delay as unknown) instanceof Date) {
                console.warn('Date objects are not supported for intervals.')
                delay = 1000
            }

            timerRef.current.startTime = Date.now()
            timerRef.current.totalDuration = delay * iterations
            timerRef.current.remainingIterations = iterations

            const estimatedTotalDuration = delay * iterations
            if (estimatedTotalDuration > 0 && onProgress) {
                setupProgressTracking(estimatedTotalDuration)
            }

            const wrappedCallback = () => {
                callback()

                if (timerRef.current.id !== null) {
                    handleTimerComplete(timerRef.current.id)
                }

                if (timerRef.current.remainingIterations !== null) {
                    timerRef.current.remainingIterations--

                    if (timerRef.current.remainingIterations <= 0) {
                        clear()
                    }
                }
            }

            timerRef.current.type = 'interval'
            timerRef.current.callback = callback
            const id = window.setInterval(wrappedCallback, delay)
            timerRef.current.id = id

            if (onSetTimer) {
                onSetTimer(id)
            }

            return id
        },
        [
            clear,
            onSetTimer,
            handleTimerComplete,
            setupProgressTracking,
            clearProgressTracking,
        ],
    )

    useEffect(() => {
        return () => {
            clear()
        }
    }, [clear])

    return {
        setTimeout,
        setInterval,
        setTimeoutDate,
        setLimitedInterval,
        clearTimer: clear,

        isActive: () => timerRef.current.id !== null,
        getCurrentTimerId: () => timerRef.current.id,
        getRemainingIterations: () => timerRef.current.remainingIterations,

        getRemainingTime: () => {
            if (
                timerRef.current.id === null ||
                timerRef.current.type !== 'timeout' ||
                timerRef.current.startTime === null ||
                timerRef.current.totalDuration === null
            ) {
                return -1
            }

            const elapsed = Date.now() - timerRef.current.startTime
            return Math.max(0, timerRef.current.totalDuration - elapsed)
        },
    }
}

/**
 * Configuration options for the useTimer hook.
 */
export interface UseTimerProps {
    /**
     * Callback triggered when a new timer is set.
     * @param timerId - The ID of the newly set timer.
     */
    onSetTimer?: (timerId: number) => void
    /**
     * Callback triggered when a timer is manually canceled.
     * @param timerId - The ID of the canceled timer.
     */
    onCancelTimer?: (timerId: number) => void
    /**
     * Callback triggered when a timer (timeout or interval iteration) completes.
     * @param timerId - The ID of the completed timer.
     */
    onTimerComplete?: (timerId: number) => void
    /**
     * Callback triggered periodically to report timer progress.
     * @param progress - A value between 0 and 1 representing the completion ratio.
     * @param elapsedMs - Time elapsed since the timer started in milliseconds.
     * @param totalMs - Total expected duration of the timer in milliseconds.
     */
    onProgress?: (progress: number, elapsedMs: number, totalMs: number) => void
}

type TimerType = 'timeout' | 'interval'

interface TimerRef {
    id: number | null
    type: TimerType
    callback?: () => void
    startTime: number | null
    totalDuration: number | null
    remainingIterations: number | null
    progressIntervalId: number | null
}

/**
 * Return value of the useTimer hook.
 */
export interface UseTimerReturn {
    /**
     * Sets a timeout that executes the callback after the specified delay.
     * @param callback - The function to execute.
     * @param delay - The delay in milliseconds or a Date object.
     * @returns The timer ID.
     */
    setTimeout: (callback: () => void, delay: number | Date) => number | null
    /**
     * Sets an interval that executes the callback repeatedly.
     * @param callback - The function to execute.
     * @param delay - The delay between executions in milliseconds.
     * @returns The timer ID.
     */
    setInterval: (callback: () => void, delay: number) => number | null
    /**
     * Sets a timeout that executes the callback at the specified target Date.
     * @param callback - The function to execute.
     * @param targetDate - The Date object when the callback should run.
     * @returns The timer ID.
     */
    setTimeoutDate: (callback: () => void, targetDate: Date) => number | null
    /**
     * Sets an interval that executes the callback a limited number of times.
     * @param callback - The function to execute.
     * @param delay - The delay between executions in milliseconds.
     * @param iterations - The number of times to execute the callback.
     * @returns The timer ID.
     */
    setLimitedInterval: (
        callback: () => void,
        delay: number,
        iterations: number,
    ) => number | null
    /**
     * Clears the currently active timer.
     */
    clearTimer: () => void

    /**
     * Checks if there is an active timer.
     * @returns True if a timer is active, false otherwise.
     */
    isActive: () => boolean
    /**
     * Gets the ID of the currently active timer.
     * @returns The timer ID or null if no timer is active.
     */
    getCurrentTimerId: () => number | null
    /**
     * Gets the number of iterations remaining for a limited interval.
     * @returns The number of iterations or null if not applicable.
     */
    getRemainingIterations: () => number | null
    /**
     * Gets the remaining time in milliseconds for the current timeout.
     * @returns The remaining time in ms, or -1 if no timeout is active.
     */
    getRemainingTime: () => number
}
