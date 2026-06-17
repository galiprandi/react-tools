import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useDebounce } from './useDebounce'

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

    it('should only update to the latest value after rapid updates', () => {
        const { result, rerender } = renderHook(
            ({ val, delay }) => useDebounce(val, delay),
            {
                initialProps: { val: 'initial', delay: 200 },
            },
        )

        rerender({ val: 'update 1', delay: 200 })
        act(() => {
            vi.advanceTimersByTime(100)
        })
        expect(result.current).toBe('initial')

        rerender({ val: 'update 2', delay: 200 })
        act(() => {
            vi.advanceTimersByTime(200)
        })
        expect(result.current).toBe('update 2')
    })

    it('should clear timeout on unmount', () => {
        const spy = vi.spyOn(global, 'clearTimeout')
        const { unmount, rerender } = renderHook(
            ({ val, delay }) => useDebounce(val, delay),
            {
                initialProps: { val: 'test', delay: 200 },
            },
        )

        // Trigger an update to set the timeout
        rerender({ val: 'updated', delay: 200 })

        unmount()
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    it('should use default delay of 500ms when no delay is provided', () => {
        const { result, rerender } = renderHook(
            ({ val }) => useDebounce(val),
            {
                initialProps: { val: 'initial' },
            },
        )

        expect(result.current).toBe('initial')

        // Update value
        rerender({ val: 'updated' })
        expect(result.current).toBe('initial')

        // Advance timers by 499ms
        act(() => {
            vi.advanceTimersByTime(499)
        })
        expect(result.current).toBe('initial')

        // Advance timers to 500ms
        act(() => {
            vi.advanceTimersByTime(1)
        })
        expect(result.current).toBe('updated')
    })

    it('should not call setTimeout on initial mount', () => {
        const spy = vi.spyOn(global, 'setTimeout')
        renderHook(() => useDebounce('initial', 500))

        expect(spy).not.toHaveBeenCalled()
        spy.mockRestore()
    })

    it('should handle negative delay by treating it as 0 (immediate update)', () => {
        const { result, rerender } = renderHook(
            ({ val, delay }) => useDebounce(val, delay),
            {
                initialProps: { val: 'initial', delay: -100 },
            },
        )

        rerender({ val: 'updated', delay: -100 })
        expect(result.current).toBe('updated')
    })

    it('should handle NaN delay by treating it as 0 (immediate update)', () => {
        const { result, rerender } = renderHook(
            ({ val, delay }) => useDebounce(val, delay),
            {
                initialProps: { val: 'initial', delay: NaN },
            },
        )

        rerender({ val: 'updated', delay: NaN })
        expect(result.current).toBe('updated')
    })
})
