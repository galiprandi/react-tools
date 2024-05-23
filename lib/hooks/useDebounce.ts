import { useEffect, useState } from 'react'

/**
 * Custom hook that debounces a value by a specified delay.
 *
 * @template T
 * @param {T} value - The value to debounce.
 * @param {number} delay - The delay in milliseconds to debounce the value.
 * @returns {T} - Returns the debounced value.
 *
 * Example usage:
 *
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
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        if (!delay) return setDebouncedValue(value)

        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}
