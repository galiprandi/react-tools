import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook that throttles a value by a specified limit.
 * Ensuring the value updates at most once every specified limit.
 *
 * @template T
 * @param value - The value to throttle.
 * @param limit - The limit in milliseconds to throttle the value.
 * @default 500
 * @returns The throttled value.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *     const [value, setValue] = useState('');
 *     const throttledValue = useThrottle(value, 500);
 *
 *     useEffect(() => {
 *         // Do something with throttledValue
 *         console.log(throttledValue);
 *     }, [throttledValue]);
 *
 *     return (
 *         <input
 *             type="text"
 *             value={value}
 *             onChange={(e) => setValue(e.target.value)}
 *         />
 *     );
 * };
 * ```
 */
export function useThrottle<T>(value: T, limit: number = 500): T {
    const [throttledValue, setThrottledValue] = useState<T>(value)
    const lastRan = useRef<number>(Date.now())
    const isFirstRun = useRef(true)

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false
            return
        }

        if (!limit || limit <= 0) {
            setThrottledValue(value)
            return
        }

        const now = Date.now()
        const timeElapsed = now - lastRan.current

        if (timeElapsed >= limit) {
            setThrottledValue(value)
            lastRan.current = now
        } else {
            const handler = setTimeout(() => {
                setThrottledValue(value)
                lastRan.current = Date.now()
            }, limit - timeElapsed)

            return () => {
                clearTimeout(handler)
            }
        }
    }, [value, limit])

    return throttledValue
}
