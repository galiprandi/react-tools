import { useRef, useEffect, useCallback } from 'react' // Eliminado useState

function calculateDelay(delay: number | Date): number {
    if (delay instanceof Date) {
        const now = new Date()
        const targetTime = delay.getTime()
        const timeUntilTarget = targetTime - now.getTime()
        return Math.max(0, timeUntilTarget)
    }
    return delay
}

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
                        // Eliminada la asignación a completedId aquí
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

export interface UseTimerProps {
    onSetTimer?: (timerId: number) => void
    onCancelTimer?: (timerId: number) => void
    onTimerComplete?: (timerId: number) => void
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

export interface UseTimerReturn {
    setTimeout: (callback: () => void, delay: number | Date) => number | null
    setInterval: (callback: () => void, delay: number) => number | null
    setTimeoutDate: (callback: () => void, targetDate: Date) => number | null
    setLimitedInterval: (
        callback: () => void,
        delay: number,
        iterations: number,
    ) => number | null
    clearTimer: () => void

    isActive: () => boolean
    getCurrentTimerId: () => number | null
    getRemainingIterations: () => number | null
    getRemainingTime: () => number
}
