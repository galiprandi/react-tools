import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { LazyRender } from './index'

const mockIntersectionObserver = vi.fn()

describe('LazyRender Component', () => {
    beforeEach(() => {
        mockIntersectionObserver.mockImplementation(() => ({
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
            takeRecords: vi.fn(),
            root: null,
            rootMargin: '',
            thresholds: [0],
        }))

        window.IntersectionObserver = mockIntersectionObserver
    })

    afterEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    it('should render placeholder by default (when not visible)', () => {
        render(
            <LazyRender placeholder={<div data-testid="placeholder">Loading...</div>}>
                <div data-testid="child">Content</div>
            </LazyRender>,
        )

        expect(screen.queryByTestId('child')).toBeNull()
        expect(screen.getByTestId('placeholder')).toBeTruthy()
    })

    it('should render children when it appears in view', async () => {
        render(
            <LazyRender>
                <div data-testid="child">Content</div>
            </LazyRender>,
        )

        // Get the callback function passed to IntersectionObserver
        const callback = mockIntersectionObserver.mock.calls[0][0]

        // Simulate intersection
        await act(async () => {
            callback([{ isIntersecting: true }])
        })

        expect(await screen.findByTestId('child')).toBeTruthy()
    })

    it('should unrender children and show placeholder when it disappears from view', async () => {
        render(
            <LazyRender placeholder={<div data-testid="placeholder">Loading...</div>}>
                <div data-testid="child">Content</div>
            </LazyRender>,
        )

        const callback = mockIntersectionObserver.mock.calls[0][0]

        // Appear
        await act(async () => {
            callback([{ isIntersecting: true }])
        })
        expect(await screen.findByTestId('child')).toBeTruthy()
        expect(screen.queryByTestId('placeholder')).toBeNull()

        // Disappear
        await act(async () => {
            callback([{ isIntersecting: false }])
        })
        expect(screen.queryByTestId('child')).toBeNull()
        expect(screen.getByTestId('placeholder')).toBeTruthy()
    })

    it('should use the default div wrapper when not specified', () => {
        const { container } = render(
            <LazyRender>
                <div>Content</div>
            </LazyRender>,
        )

        expect(container.firstChild?.nodeName).toBe('DIV')
    })

    it('should use the specified wrapper element', () => {
        const { container } = render(
            <LazyRender wrapper="section">
                <div>Content</div>
            </LazyRender>,
        )

        expect(container.firstChild?.nodeName).toBe('SECTION')
    })

    it('should pass IntersectionObserver options correctly', () => {
        const options = {
            rootMargin: '20px',
            threshold: 0.1,
        }

        render(
            <LazyRender {...options}>
                <div>Content</div>
            </LazyRender>,
        )

        expect(mockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining(options),
        )
    })

    it('should pass root prop to IntersectionObserver', () => {
        const mockRoot = document.createElement('div')
        render(
            <LazyRender root={mockRoot}>
                <div>Content</div>
            </LazyRender>
        )

        expect(mockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({ root: mockRoot })
        )
    })

    it('should pass rootMargin prop to IntersectionObserver', () => {
        render(
            <LazyRender rootMargin="50px">
                <div>Content</div>
            </LazyRender>
        )

        expect(mockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({ rootMargin: '50px' })
        )
    })
})
