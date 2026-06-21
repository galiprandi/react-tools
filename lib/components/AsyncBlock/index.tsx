import { useEffect, useState, ReactNode, useRef, useCallback } from 'react'

/**
 * AsyncBlock component – Declaratively renders asynchronous content with pending, success, and error states.
 *
 * This component manages the lifecycle of an asynchronous operation (e.g., a fetch request),
 * automatically handling pending, success, and error states. It also supports timeouts,
 * dependency-based re-execution, and manual reloads.
 *
 * @template T - The type of data returned by the async operation.
 * @param {AsyncBlockProps<T>} props - Props to control the behavior and rendering of the async operation.
 * @returns {JSX.Element | null} Rendered result based on async state.
 *
 * @example
 * ```tsx
 * import { AsyncBlock } from '@galiprandi/react-tools';
 *
 * const UserProfileWrapper = ({ userId }) => (
 *   <AsyncBlock
 *     promiseFn={(signal) => fetch(`/api/user/${userId}`, { signal }).then(res => res.json())}
 *     pending={(reload) => (
 *       <div>
 *         <p>Loading user...</p>
 *         <button onClick={reload}>Cancel and Retry</button>
 *       </div>
 *     )}
 *     success={(user, reload) => (
 *       <div>
 *         <h1>{user.name}</h1>
 *         <button onClick={reload}>Refresh Data</button>
 *       </div>
 *     )}
 *     error={(err, reload) => (
 *       <div>
 *         <p>Error: {(err as Error).message}</p>
 *         <button onClick={reload}>Try Again</button>
 *       </div>
 *     )}
 *     timeOut={5000}
 *     deps={[userId]}
 *     onSuccess={(data) => console.log('Loaded:', data)}
 *     onError={(err) => console.error('Failed:', err)}
 *   />
 * );
 * ```
 */
export const AsyncBlock = <T,>({
    promiseFn,
    pending,
    success,
    error,
    timeOut,
    deps = [],
    onSuccess,
    onError,
}: AsyncBlockProps<T>): JSX.Element | null => {
    const [state, setState] = useState<'pending' | 'success' | 'error'>(
        'pending',
    )
    const [data, setData] = useState<T | null>(null)
    const [err, setErr] = useState<unknown>(null)
    const [tick, setTick] = useState(0)
    const isMounted = useRef(true)

    const reload = useCallback(() => {
        setTick((t) => t + 1)
    }, [])

    const run = useCallback(
        (abortController: AbortController) => {
            setState('pending')
            setData(null)
            setErr(null)

            let timer: ReturnType<typeof setTimeout> | null = null
            const signal = abortController.signal

            if (timeOut) {
                timer = setTimeout(() => {
                    abortController.abort('Timeout')
                    if (isMounted.current) {
                        setState('error')
                        const timeoutError = new Error('Request timed out')
                        setErr(timeoutError)
                        onError?.(timeoutError)
                    }
                }, timeOut)
            }

            // Pass the signal to the promise function, but make it optional
            let promise: Promise<T>
            try {
                promise = promiseFn(signal)
            } catch (e) {
                promise = Promise.reject(e)
            }

            promise
                .then((result) => {
                    if (signal.aborted) return

                    if (isMounted.current) {
                        if (timer) clearTimeout(timer)
                        setData(result)
                        setState('success')
                        onSuccess?.(result)
                    }
                })
                .catch((e) => {
                    if (signal.aborted && signal.reason !== 'Timeout') return

                    if (isMounted.current) {
                        if (timer) clearTimeout(timer)
                        setErr(e)
                        setState('error')
                        onError?.(e)
                    }
                })
        },
        [promiseFn, timeOut, onSuccess, onError],
    )

    useEffect(() => {
        isMounted.current = true
        const controller = new AbortController()

        run(controller)

        return () => {
            isMounted.current = false
            controller.abort('Component unmounted')

            // This ensures any in-flight requests are canceled when
            // the component unmounts or dependencies change
        }
    }, [...deps, tick])

    if (state === 'pending') {
        return typeof pending === 'function' ? (
            <>{pending(reload)}</>
        ) : (
            <>{pending}</>
        )
    }

    if (state === 'error') {
        return <>{error?.(err, reload)}</>
    }

    if (state === 'success') {
        return <>{success(data as T, reload)}</>
    }

    return null
}

AsyncBlock.displayName = 'AsyncBlock'

/**
 * Props for the AsyncBlock component.
 */
export interface AsyncBlockProps<T> {
    /**
     * A function that returns a Promise to be executed.
     * Optionally receives an AbortSignal that can be used to cancel the request.
     *
     * @param signal - An AbortSignal to handle request cancellation.
     */
    promiseFn: (signal?: AbortSignal) => Promise<T>
    /**
     * Element or function to render while the promise is pending.
     * Optionally receives a reload function to re-run the async operation.
     *
     * @param reload - Function to re-run the async operation.
     */
    pending: ReactNode | ((reload: () => void) => ReactNode)
    /**
     * Function to render if the promise resolves successfully.
     * Receives the data and a reload function.
     *
     * @param data - The data returned by the promise.
     * @param reload - Function to re-run the async operation.
     */
    success: (data: T, reload: () => void) => ReactNode
    /**
     * Function to render if the promise is rejected or times out.
     * Receives the error and a reload function.
     *
     * @param err - The error returned by the promise or the timeout error.
     * @param reload - Function to re-run the async operation.
     */
    error?: (err: unknown, reload: () => void) => ReactNode
    /**
     * Optional timeout in milliseconds before failing the promise.
     *
     * @default undefined
     */
    timeOut?: number
    /**
     * Dependencies to determine when to re-run the promise.
     *
     * @default []
     */
    deps?: unknown[]
    /**
     * Optional side effect to execute when the promise resolves successfully.
     *
     * @param data - The data returned by the promise.
     */
    onSuccess?: (data: T) => void
    /**
     * Optional side effect to execute when the promise is rejected or times out.
     *
     * @param err - The error that occurred.
     */
    onError?: (err: unknown) => void
}
