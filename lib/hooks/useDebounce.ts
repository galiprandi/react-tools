import { useEffect, useState, useRef } from 'react'

/**
 * Custom hook that debounces a value by a specified delay.
 *
 * @template T
 * @param value - The value to debounce.
 * @param delay - The delay in milliseconds to debounce the value.
 * @default 500
 * @returns The debounced value.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *     const [value, setValue] = useState('');
 *     const debouncedValue = useDebounce(value, 500);
 *
 *     useEffect(() => {
 *         // Do something with debouncedValue
 *         console.log(debouncedValue);
 *     }, [debouncedValue]);
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
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)
    const isFirstRun = useRef(true)

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false
            return
        }

        if (!delay || delay <= 0) {
            setDebouncedValue(value)
            return
        }

        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
