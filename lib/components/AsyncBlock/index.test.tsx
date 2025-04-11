import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, cleanup, screen } from '@testing-library/react'
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
})
