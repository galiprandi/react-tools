
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react-hooks'
import { useList } from './useList'

describe('useList Security', () => {
    it('should not allow matching items via prototype properties like constructor', () => {
        const initialList = [{ id: 1 }, { id: 2 }]
        const { result } = renderHook(() => useList(initialList))

        act(() => {
            // This should NOT remove any item because 'constructor' is a restricted key
            // Even though item.constructor === Object
            result.current.removeBy('constructor', Object)
        })

        expect(result.current.list).toHaveLength(2)
    })

    it('should not allow matching items via __proto__', () => {
        const initialList = [{ id: 1 }]
        const { result } = renderHook(() => useList(initialList))

        act(() => {
            result.current.removeBy('__proto__', Object.prototype)
        })

        expect(result.current.list).toHaveLength(1)
    })

    it('should not allow matching items via toString', () => {
        const initialList = [{ id: 1 }]
        const { result } = renderHook(() => useList(initialList))

        act(() => {
            result.current.removeBy('toString', (initialList[0] as { toString: unknown }).toString)
        })

        expect(result.current.list).toHaveLength(1)
    })
})
