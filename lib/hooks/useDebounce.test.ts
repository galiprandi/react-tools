import { describe, it, expect } from 'vitest'

import { useDebounce } from '../main.ts'
import { renderHook } from '@testing-library/react'

describe('useDebounce', () => {
    it('should return the debounced value', () => {
        const value = 'test-1'
        const { result } = renderHook(() => useDebounce(value, 1000))
        expect(result.current).toBe(value)
    })

    it('should return the debounced value when delay is 0 ', async () => {
        const value = 'test-2'
        const { result } = renderHook(() => useDebounce(value, 0))
        expect(result.current).toBe(value)
    })
})
