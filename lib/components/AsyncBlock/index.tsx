import {
    useEffect,
    useState,
    ReactNode,
    useRef,
    useCallback,
} from 'react'

/**
 * AsyncBlock component – Declaratively renders asynchronous content with pending, success, and error states.
 *
 * @param {AsyncBlockProps<T>} props - Props to control the behavior and rendering of the async operation.
 * @returns {JSX.Element | null} - Rendered result based on async state.
 *
 * Example usage:
 *
 * ```tsx
 * <AsyncBlock
 *   promiseFn={(signal) => fetch('/api/user', { signal }).then(res => res.json())}
 *   pending={<p>Loading...</p>}
 *   success={(data) => <UserProfile data={data} />}
 *   error={(err) => <p>Error: {err.message}</p>}
 *   timeOut={5000}
 *   deps={[userId]}
 * />
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

            let didTimeOut = false
            let timer: ReturnType<typeof setTimeout> | null = null
            const signal = abortController.signal

            if (timeOut) {
                timer = setTimeout(() => {
                    didTimeOut = true
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
            promiseFn(signal)
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
                    if (signal.aborted && didTimeOut) return

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

/**
 * Props for the AsyncBlock component.
 */
export interface AsyncBlockProps<T> {
    /**
     * A function that returns a Promise to be executed.
     * Optionally receives an AbortSignal that can be used to cancel the request.
     */
    promiseFn: (signal?: AbortSignal) => Promise<T>
    /**
     * Element or function to render while the promise is pending.
     * Optionally receives a reload function to re-run the async operation.
     */
    pending: ReactNode | ((reload: () => void) => ReactNode)
    /**
     * Function to render if the promise resolves successfully.
     * Receives the data and a reload function.
     */
    success: (data: T, reload: () => void) => ReactNode
    /**
     * Function to render if the promise is rejected or times out.
     * Receives the error and a reload function.
     */
    error: (err: unknown, reload: () => void) => ReactNode
    /**
     * Optional timeout in milliseconds before failing the promise.
     */
    timeOut?: number
    /**
     * Dependencies to determine when to re-run the promise.
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
