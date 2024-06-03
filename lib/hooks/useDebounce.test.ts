import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useDebounce } from '../main.ts'

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
    })

    afterEach(() => {
        vi.runOnlyPendingTimers()
        vi.useRealTimers()
    })

    it('should return the debounced value', async () => {
        const value = 'test-1'
        const { result } = renderHook(() => useDebounce(value, 200))
        expect(result.current).toBe(value)
    })

    it('should return the debounced value when delay is 0 ', async () => {
        const value = 'test-2'
        const { result } = renderHook(() => useDebounce(value, 0))
        expect(result.current).toBe(value)
    })
})
