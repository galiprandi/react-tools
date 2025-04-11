import {
    useEffect,
    useState,
    ReactNode,
    useRef,
    useCallback,
    PropsWithChildren,
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
    const isMounted = useRef(true)

    const run = useCallback(
        (abortController: AbortController) => {
            setState('pending')
            setData(null)
            setErr(null)

            let didTimeOut = false
            let timer: NodeJS.Timeout | null = null
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
    }, deps)

    if (state === 'pending') {
        return typeof pending === 'function' ? <>{pending()}</> : <>{pending}</>
    }

    if (state === 'error') {
        return <>{error?.(err)}</>
    }

    if (state === 'success' && data !== null) {
        return <>{success(data)}</>
    }

    return null
}

/**
 * Props for the AsyncBlock component.
 */
export interface AsyncBlockProps<T> extends PropsWithChildren {
    /**
     * A function that returns a Promise to be executed.
     * Optionally receives an AbortSignal that can be used to cancel the request.
     */
    promiseFn: (signal?: AbortSignal) => Promise<T>
    /**
     * Element or function to render while the promise is pending.
     */
    pending: ReactNode | (() => ReactNode)
    /**
     * Function to render if the promise resolves successfully.
     */
    success: (data: T) => ReactNode
    /**
     * Function to render if the promise is rejected or times out.
     */
    error: (err: unknown) => ReactNode
    /**
     * Optional timeout in milliseconds before failing the promise.
     */
    timeOut?: number
    /**
     * Dependencies to determine when to re-run the promise.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deps?: any[]
    /**
     * Optional side effect to execute on success.
     */
    onSuccess?: (data: T) => void
    /**
     * Optional side effect to execute on error.
     */
    onError?: (err: unknown) => void
}
