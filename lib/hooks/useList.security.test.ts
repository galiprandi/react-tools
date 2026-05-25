
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
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

    it('should NOT allow matching items via restricted keys even with undefined value', () => {
        const initialList = [{ id: 1 }, { id: 2 }]
        const { result } = renderHook(() => useList(initialList))

        act(() => {
            // This should NOT remove any item because 'constructor' is a restricted key
            // and we use a unique Symbol as a fallback that never matches user input.
            result.current.removeBy('constructor', undefined)
        })

        expect(result.current.list).toHaveLength(2)
    })

    it('should NOT allow toggling items via restricted keys (it should always add)', () => {
        const initialList = [{ id: 1 }]
        const { result } = renderHook(() => useList(initialList))

        act(() => {
            // Toggling with 'constructor' should NOT match the existing item
            // even if they both have 'constructor'. It should always add the new item.
            result.current.toggle({ id: 2 }, 'constructor')
        })

        // It should have 2 items now (it should NOT have removed {id: 1})
        expect(result.current.list).toHaveLength(2)
        expect(result.current.list[0]).toEqual({ id: 1 })
        expect(result.current.list[1]).toEqual({ id: 2 })
    })
})
