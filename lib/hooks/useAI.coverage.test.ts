import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAI, AIApiType } from './useAI'

describe('useAI Coverage Gaps', () => {
    beforeEach(() => {
        vi.unstubAllGlobals()

        // Default mock navigator.userActivation to active
        vi.stubGlobal('navigator', {
            userActivation: { isActive: true },
        })

        if (typeof window !== 'undefined') {
            // Clear known AI globals
            const globals = [
                'Summarizer',
                'Translator',
                'LanguageDetector',
                'LanguageModel',
                'PromptAPI',
                'Writer',
                'Rewriter',
                'Proofreader',
                'ai',
            ]
            globals.forEach((g) => {
                delete (window as unknown as Record<string, unknown>)[g]
            })
        }
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    it('should handle unrecognized API type in checkApiAvailability', async () => {
        const { result } = renderHook(() => useAI({ apis: ['invalid-api' as AIApiType] }))

        await waitFor(() => expect(result.current.status).toBe('ready'))

        await waitFor(() => {
            const apiStatus = result.current.apis['invalid-api' as AIApiType]
            return expect(apiStatus).toBeDefined()
        })

        expect(result.current.apis['invalid-api' as AIApiType]?.availability).toBe('unavailable')
        expect(result.current.apis['invalid-api' as AIApiType]?.error?.message).toContain('Unrecognized AI API type')
    })

    it('should handle error in preload when user activation is missing', async () => {
        vi.stubGlobal('navigator', {
            userActivation: { isActive: false },
        })

        // Provide a real Summarizer so preload reaches the user-activation guard
        const Summarizer = function() {}
        Summarizer.create = vi.fn().mockResolvedValue({ destroy: vi.fn() })
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Summarizer
        }

        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))
        await waitFor(() => expect(result.current.status).toBe('ready'))

        await result.current.preload('summarizer')

        await waitFor(() => expect(result.current.apis.summarizer.error).toBeDefined())
        expect(result.current.apis.summarizer.error?.message).toBeDefined()
        expect(result.current.apis.summarizer.error?.message).toContain('User activation required')
        expect(result.current.apis.summarizer.availability).toBe('unavailable')
    })

    it('should call onReady from preload when API becomes available', async () => {
        const onReady = vi.fn()
        const mockCreate = vi.fn().mockResolvedValue({
            destroy: vi.fn(),
        })

        const Summarizer = function() {}
        Summarizer.create = mockCreate

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Summarizer
        }

        const { result } = renderHook(() => useAI({ onReady, apis: ['summarizer'] }))
        await waitFor(() => expect(result.current.status).toBe('ready'))

        await result.current.preload('summarizer')

        expect(onReady).toHaveBeenCalledWith('summarizer')
        expect(result.current.apis.summarizer.availability).toBe('available')
    })

    it('should preload all APIs using preloadAll', async () => {
        const mockCreate = vi.fn().mockResolvedValue({ destroy: vi.fn() })

        const Summarizer = function() {}
        Summarizer.create = mockCreate
        const Translator = function() {}
        Translator.create = mockCreate

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Summarizer;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Translator = Translator;
        }

        const { result } = renderHook(() => useAI({ apis: ['summarizer', 'translator'] }))
        await waitFor(() => expect(result.current.status).toBe('ready'))

        await result.current.preloadAll()

        expect(mockCreate).toHaveBeenCalledTimes(2)
        expect(result.current.apis.summarizer.availability).toBe('available')
        expect(result.current.apis.translator.availability).toBe('available')
    })

    it('should handle unrecognized API type in preload', async () => {
        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))
        await waitFor(() => expect(result.current.status).toBe('ready'))

        await result.current.preload('invalid-api' as AIApiType)

        await waitFor(() => {
            const apiStatus = result.current.apis['invalid-api' as AIApiType]
            return expect(apiStatus).toBeDefined()
        })
        expect(result.current.apis['invalid-api' as AIApiType]?.availability).toBe('unavailable')
        expect(result.current.apis['invalid-api' as AIApiType]?.error?.message).toContain('Unrecognized AI API type')
    })

    it('should handle experimental APIs in checkApiAvailability', async () => {
        const { result } = renderHook(() => useAI({ apis: ['writer', 'rewriter', 'proofreader', 'prompt'] }))

        await waitFor(() => expect(result.current.status).toBe('ready'))

        expect(result.current.apis.writer.availability).toBe('unavailable')
        expect(result.current.apis.rewriter.availability).toBe('unavailable')
        expect(result.current.apis.proofreader.availability).toBe('unavailable')
        expect(result.current.apis.prompt.availability).toBe('unavailable')
    })

    it('should clean up effect on unmount', () => {
        const { unmount } = renderHook(() => useAI())
        unmount()
        // No error means it cleaned up successfully
    })

    it('should handle base constructors in preload', async () => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Object
        }
        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))
        await waitFor(() => expect(result.current.status).toBe('ready'))

        await result.current.preload('summarizer')
        await waitFor(() => expect(result.current.apis.summarizer.error).toBeDefined())
        expect(result.current.apis.summarizer.error?.message).toContain('is not a valid AI API')
    })

    it('should handle base constructors in checkApiAvailability', async () => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Object
        }
        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))

        await waitFor(() => expect(result.current.status).toBe('ready'))
        expect(result.current.apis.summarizer.availability).toBe('unavailable')
    })

    it('should handle API requiring arguments in availability check', async () => {
        const Summarizer = function() {}
        Summarizer.availability = vi.fn().mockRejectedValue(new Error('Requires arguments'))

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Summarizer
        }
        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))

        await waitFor(() => expect(result.current.status).toBe('ready'))
        expect(result.current.apis.summarizer.availability).toBe('unavailable')
        expect(result.current.apis.summarizer.error?.message).toContain('Requires arguments')
    })

    it('should handle non-Error rejection in availability check', async () => {
        const Summarizer = function() {}
        Summarizer.availability = vi.fn().mockRejectedValue('String Error')

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Summarizer
        }
        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))

        await waitFor(() => expect(result.current.status).toBe('ready'))
        expect(result.current.apis.summarizer.error?.message).toContain('requires arguments or is not supported')
    })

    it('should handle non-Error rejection in preload', async () => {
        const Summarizer = function() {}
        Summarizer.create = vi.fn().mockRejectedValue('String Error')

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Summarizer
        }
        const { result } = renderHook(() => useAI({ apis: ['summarizer'] }))
        await waitFor(() => expect(result.current.status).toBe('ready'))

        await result.current.preload('summarizer')
        await waitFor(() => expect(result.current.apis.summarizer.error).toBeDefined())
        expect(result.current.apis.summarizer.error?.message).toContain('Failed to preload summarizer')
    })

    it('should handle stable apis check correctly when apis change', async () => {
        const { rerender, result } = renderHook(({ apis }) => useAI({ apis }), {
            initialProps: { apis: ['summarizer'] as AIApiType[] }
        })

        await waitFor(() => expect(result.current.status).toBe('ready'))

        rerender({ apis: ['translator'] as AIApiType[] })

        await waitFor(() => expect(result.current.status).toBe('loading'))
        await waitFor(() => expect(result.current.status).toBe('ready'))
    })
})
