import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Observer } from '../../main.ts'

const mockIntersectionObserver = vi.fn()
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

describe('Observer Component', () => {
    beforeEach(() => {
        mockIntersectionObserver.mockImplementation(() => ({
            observe: mockObserve,
            unobserve: mockUnobserve,
            disconnect: mockDisconnect,
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

    it.only('should render children correctly', () => {
        render(
            <Observer>
                <p data-testid="child-element">Test Content</p>
            </Observer>,
        )

        expect(screen.getByTestId('child-element')).toBeTruthy()
        expect(screen.getByTestId('child-element').textContent).toBe(
            'Test Content',
        )
    })

    it('should use the default div wrapper when not specified', () => {
        const { container } = render(
            <Observer>
                <p>Test Content</p>
            </Observer>,
        )

        // The first child should be a div
        expect(container.firstChild?.nodeName).toBe('DIV')
    })

    it('should use the specified wrapper element', () => {
        const { container } = render(
            <Observer wrapper="section">
                <p>Test Content</p>
            </Observer>,
        )

        // The first child should be a section
        expect(container.firstChild?.nodeName).toBe('SECTION')
    })

    it('should call IntersectionObserver with the provided options', () => {
        const options = {
            rootMargin: '10px',
            threshold: 0.5,
        }

        render(
            <Observer {...options}>
                <p>Test Content</p>
            </Observer>,
        )

        expect(mockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining(options),
        )
    })

    it('should observe the ref element when mounted', () => {
        render(
            <Observer>
                <p>Test Content</p>
            </Observer>,
        )

        expect(mockObserve).toHaveBeenCalled()
    })

    it('should unobserve when unmounted', () => {
        const { unmount } = render(
            <Observer>
                <p>Test Content</p>
            </Observer>,
        )

        unmount()
        expect(mockUnobserve).toHaveBeenCalled()
    })

    it('should call onAppear when element enters viewport', () => {
        const onAppearMock = vi.fn()
        const mockEntry = { isIntersecting: true }

        render(
            <Observer onAppear={onAppearMock}>
                <p>Test Content</p>
            </Observer>,
        )

        // Get the callback function passed to IntersectionObserver
        const callback = mockIntersectionObserver.mock.calls[0][0]

        // Simulate intersection
        callback([mockEntry])

        expect(onAppearMock).toHaveBeenCalledWith(mockEntry)
    })

    it('should call onDisappear when element leaves viewport', () => {
        const onDisappearMock = vi.fn()
        const mockEntry = { isIntersecting: false }

        render(
            <Observer onDisappear={onDisappearMock}>
                <p>Test Content</p>
            </Observer>,
        )

        // Get the callback function passed to IntersectionObserver
        const callback = mockIntersectionObserver.mock.calls[0][0]

        // Simulate intersection change
        callback([mockEntry])

        expect(onDisappearMock).toHaveBeenCalledWith(mockEntry)
    })

    it('should not call onAppear when isIntersecting is false', () => {
        const onAppearMock = vi.fn()
        const mockEntry = { isIntersecting: false }

        render(
            <Observer onAppear={onAppearMock}>
                <p>Test Content</p>
            </Observer>,
        )

        const callback = mockIntersectionObserver.mock.calls[0][0]
        callback([mockEntry])

        expect(onAppearMock).not.toHaveBeenCalled()
    })

    it('should not call onDisappear when isIntersecting is true', () => {
        const onDisappearMock = vi.fn()
        const mockEntry = { isIntersecting: true }

        render(
            <Observer onDisappear={onDisappearMock}>
                <p>Test Content</p>
            </Observer>,
        )

        const callback = mockIntersectionObserver.mock.calls[0][0]
        callback([mockEntry])

        expect(onDisappearMock).not.toHaveBeenCalled()
    })

    it('should handle both onAppear and onDisappear callbacks', () => {
        const onAppearMock = vi.fn()
        const onDisappearMock = vi.fn()

        render(
            <Observer onAppear={onAppearMock} onDisappear={onDisappearMock}>
                <p>Test Content</p>
            </Observer>,
        )

        const callback = mockIntersectionObserver.mock.calls[0][0]

        // Test appearing
        callback([{ isIntersecting: true }])
        expect(onAppearMock).toHaveBeenCalled()
        expect(onDisappearMock).not.toHaveBeenCalled()

        vi.clearAllMocks()

        // Test disappearing
        callback([{ isIntersecting: false }])
        expect(onAppearMock).not.toHaveBeenCalled()
        expect(onDisappearMock).toHaveBeenCalled()
    })
})
