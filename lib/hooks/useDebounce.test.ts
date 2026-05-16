import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useDebounce } from '../main.ts'

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should update the value after the specified delay', () => {
        const { result, rerender } = renderHook(
            ({ val, delay }) => useDebounce(val, delay),
            {
                initialProps: { val: 'initial', delay: 200 },
            },
        )

        expect(result.current).toBe('initial')

        // Update value
        rerender({ val: 'updated', delay: 200 })
        expect(result.current).toBe('initial')

        // Advance timers by the delay
        act(() => {
            vi.advanceTimersByTime(200)
        })
        expect(result.current).toBe('updated')
    })

    it('should return the debounced value when delay is 0', () => {
        const { result, rerender } = renderHook(
            ({ val, delay }) => useDebounce(val, delay),
            {
                initialProps: { val: 'initial', delay: 0 },
            },
        )

        act(() => {
            rerender({ val: 'updated', delay: 0 })
            vi.advanceTimersByTime(0)
        })
        expect(result.current).toBe('updated')
    })
})
