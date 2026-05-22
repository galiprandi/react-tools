import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAI } from './useAI'

describe('useAI Security', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    it('should not report an API as available if it is just a plain object', async () => {
        // Mock window.Summarizer as a plain object
        vi.stubGlobal('Summarizer', {})

        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))

        // Give it time to run the effect
        await vi.waitFor(() => expect(result.current.status).toBe('ready'))

        // If it's vulnerable, it will say 'available'
        // If it's secure, it should be 'unavailable'
        expect(result.current.apis.summarizer.availability).toBe('unavailable')
    })

    it('should not allow bypass via Object.create in preload', async () => {
        // Mock Summarizer as {} so apiConstructor becomes Object
        vi.stubGlobal('Summarizer', {})

        // Stub userActivation to be true to allow preload to proceed
        vi.stubGlobal('navigator', {
            userActivation: { isActive: true },
        })

        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))
        await vi.waitFor(() => expect(result.current.status).toBe('ready'))

        // Attempt to preload
        // If vulnerable, it will call Object.create and succeed
        await result.current.preload('summarizer')

        // If it was vulnerable, availability would be 'available'
        // But since it should fail to find a proper create method, it should probably stay unavailable or error
        expect(result.current.apis.summarizer.availability).not.toBe(
            'available',
        )
    })
})
