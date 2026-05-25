import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTimer } from './useTimer'

describe('useTimer security reproduction', () => {
    it('should handle invalid Date in setTimeout and not cause infinite loop/NaN progress', () => {
        vi.useFakeTimers()
        const onProgress = vi.fn()
        const { result } = renderHook(() => useTimer({ onProgress }))

        // This will set delayMs to NaN
        act(() => {
            result.current.setTimeout(() => {}, new Date('invalid'))
        })

        expect(result.current.getRemainingTime()).toBe(0)

        // Advance time a bit
        act(() => {
            vi.advanceTimersByTime(100)
        })

        // If it was vulnerable, onProgress might have been called with NaN
        if (onProgress.mock.calls.length > 0) {
            const [progress] = onProgress.mock.calls[0]
            expect(progress).not.toBeNaN()
        }

        vi.useRealTimers()
    })
})
