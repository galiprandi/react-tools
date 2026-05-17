import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThrottle } from './useThrottle'

describe('useThrottle', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should update the value immediately on the first call', () => {
        const { result } = renderHook(
            ({ val, limit }) => useThrottle(val, limit),
            {
                initialProps: { val: 'initial', limit: 500 },
            },
        )

        expect(result.current).toBe('initial')
    })

    it('should throttle updates', () => {
        const { result, rerender } = renderHook(
            ({ val, limit }) => useThrottle(val, limit),
            {
                initialProps: { val: 'initial', limit: 500 },
            },
        )

        // Update value within limit
        rerender({ val: 'updated 1', limit: 500 })
        expect(result.current).toBe('initial')

        // Advance timers by less than the limit
        act(() => {
            vi.advanceTimersByTime(250)
        })
        expect(result.current).toBe('initial')

        // Advance timers to the limit
        act(() => {
            vi.advanceTimersByTime(250)
        })
        expect(result.current).toBe('updated 1')
    })

    it('should eventually update to the latest value (trailing edge)', () => {
        const { result, rerender } = renderHook(
            ({ val, limit }) => useThrottle(val, limit),
            {
                initialProps: { val: 'initial', limit: 500 },
            },
        )

        rerender({ val: 'updated 1', limit: 500 })
        rerender({ val: 'updated 2', limit: 500 })
        expect(result.current).toBe('initial')

        act(() => {
            vi.advanceTimersByTime(500)
        })
        expect(result.current).toBe('updated 2')
    })

    it('should update immediately if the limit has passed', () => {
        const { result, rerender } = renderHook(
            ({ val, limit }) => useThrottle(val, limit),
            {
                initialProps: { val: 'initial', limit: 500 },
            },
        )

        // Wait for limit to pass
        act(() => {
            vi.advanceTimersByTime(600)
        })

        rerender({ val: 'updated 1', limit: 500 })
        expect(result.current).toBe('updated 1')
    })

    it('should return the value immediately when limit is 0', () => {
        const { result, rerender } = renderHook(
            ({ val, limit }) => useThrottle(val, limit),
            {
                initialProps: { val: 'initial', limit: 0 },
            },
        )

        rerender({ val: 'updated 1', limit: 0 })
        expect(result.current).toBe('updated 1')
    })
})
