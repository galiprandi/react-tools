import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, cleanup, screen, act, fireEvent } from '@testing-library/react'
import { AsyncBlock } from './index'

describe('<AsyncBlock />', () => {
    beforeEach(cleanup)

    it('should render pending state', () => {
        const pendingContent = 'Loading...'
        render(
            <AsyncBlock
                promiseFn={() => Promise.resolve()}
                pending={pendingContent}
                success={() => null}
                error={() => null}
            />
        )
        expect(screen.getByText(pendingContent)).toBeDefined()
    })

    it('should render success state and call onSuccess', async () => {
        const data = { id: 1, name: 'Test' }
        const onSuccess = vi.fn()
        const successContent = 'Success'

        render(
            <AsyncBlock
                promiseFn={() => Promise.resolve(data)}
                pending={() => null}
                success={() => successContent}
                error={() => null}
                onSuccess={onSuccess}
            />
        )

        await screen.findByText(successContent)
        expect(onSuccess).toHaveBeenCalledWith(data)
    })

    it('should render error state and call onError', async () => {
        const error = new Error('Test error')
        const onError = vi.fn()
        const errorContent = 'Error'

        render(
            <AsyncBlock
                promiseFn={() => Promise.reject(error)}
                pending={() => null}
                success={() => null}
                error={() => errorContent}
                onError={onError}
            />
        )

        await screen.findByText(errorContent)
        expect(onError).toHaveBeenCalledWith(error)
    })

    it('should handle timeout', async () => {
        const errorContent = 'Timeout'
        const timeout = 100

        render(
            <AsyncBlock
                promiseFn={() => new Promise(() => {})}
                pending={() => null}
                success={() => null}
                error={() => errorContent}
                timeOut={timeout}
            />
        )

        await screen.findByText(errorContent)
    })

    it('should clean up properly on unmount', async () => {
        const { unmount } = render(
            <AsyncBlock
                promiseFn={() => new Promise(() => {})}
                pending={() => null}
                success={() => null}
                error={() => null}
            />
        )

        unmount()
        // Test should not hang or fail due to cleanup
    })

    it('should reload the promise when reload is called', async () => {
        let callCount = 0
        let resolvePromise: (value: string) => void

        const promiseFn = vi.fn(() => {
            callCount++
            return new Promise<string>((resolve) => {
                resolvePromise = resolve
            })
        })

        render(
            <AsyncBlock
                promiseFn={promiseFn}
                pending="Loading"
                success={(data, reload) => (
                    <div>
                        <span>{data}</span>
                        <button onClick={reload}>Reload</button>
                    </div>
                )}
                error={() => null}
            />
        )

        expect(screen.getByText('Loading')).toBeDefined()
        act(() => {
            resolvePromise(`Data ${callCount}`)
        })

        await screen.findByText('Data 1')
        expect(promiseFn).toHaveBeenCalledTimes(1)

        const button = screen.getByText('Reload')
        act(() => {
            button.click()
        })

        expect(screen.getByText('Loading')).toBeDefined()
        act(() => {
            resolvePromise(`Data ${callCount}`)
        })

        await screen.findByText('Data 2')
        expect(promiseFn).toHaveBeenCalledTimes(2)
    })

    it('should handle pending state as a function', () => {
        render(
            <AsyncBlock
                promiseFn={() => new Promise(() => {})}
                pending={(reload) => <button onClick={reload}>Reloading</button>}
                success={() => null}
                error={() => null}
            />,
        )
        expect(screen.getByText('Reloading')).toBeDefined()
    })

    it('should handle null as a valid success value', async () => {
        const successContent = 'Resolved to null'
        render(
            <AsyncBlock
                promiseFn={() => Promise.resolve(null)}
                pending="Loading"
                success={(data) => (data === null ? successContent : 'Error')}
                error={() => null}
            />,
        )

        await screen.findByText(successContent)
    })

    it('should not call onSuccess if unmounted before promise resolves', async () => {
        const onSuccess = vi.fn()
        let resolvePromise: (value: string) => void
        const promise = new Promise<string>((resolve) => {
            resolvePromise = resolve
        })

        const { unmount } = render(
            <AsyncBlock
                promiseFn={() => promise}
                pending="Loading"
                success={() => 'Success'}
                error={() => null}
                onSuccess={onSuccess}
            />,
        )

        unmount()

        await act(async () => {
            resolvePromise!('done')
        })

        expect(onSuccess).not.toHaveBeenCalled()
    })

    it('should not call onError if unmounted before timeout expires', async () => {
        vi.useFakeTimers()
        const onError = vi.fn()

        const { unmount } = render(
            <AsyncBlock
                promiseFn={() => new Promise(() => {})}
                pending="Loading"
                success={() => 'Success'}
                error={() => 'Error'}
                timeOut={1000}
                onError={onError}
            />,
        )

        unmount()

        act(() => {
            vi.advanceTimersByTime(1000)
        })

        expect(onError).not.toHaveBeenCalled()
        vi.useRealTimers()
    })

    it('should call reload when pending function is called', async () => {
        let callCount = 0
        const promiseFn = vi.fn(() => {
            callCount++
            return Promise.resolve(`Data ${callCount}`)
        })

        render(
            <AsyncBlock
                promiseFn={promiseFn}
                pending={(reload) => (
                    <button onClick={reload}>Manual Reload</button>
                )}
                success={(data) => <div>{data}</div>}
                error={() => null}
            />,
        )

        expect(promiseFn).toHaveBeenCalledTimes(1)
        const button = screen.getByText('Manual Reload')

        fireEvent.click(button)
        expect(promiseFn).toHaveBeenCalledTimes(2)
    })

    it('should handle timeout error branch when unmounted', async () => {
        vi.useFakeTimers()
        const onError = vi.fn()
        const { unmount } = render(
            <AsyncBlock
                promiseFn={() => new Promise(() => {})}
                pending="Loading"
                success={() => 'Success'}
                error={() => 'Error'}
                timeOut={100}
                onError={onError}
            />,
        )

        // Mock isMounted.current to false manually is not possible via props,
        // but unmount() sets it to false in useEffect cleanup.
        unmount()

        act(() => {
            vi.advanceTimersByTime(100)
        })

        expect(onError).not.toHaveBeenCalled()
        vi.useRealTimers()
    })
})
