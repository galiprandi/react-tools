import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAISummarize } from './useAISummarize'

describe('useAISummarize Coverage', () => {
    const mockSummarizer = {
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
        destroy: vi.fn(),
    }

    const mockSummarizerCreate = vi.fn()
    const mockAvailability = vi.fn()

    beforeEach(() => {
        vi.stubGlobal('navigator', {
            userActivation: { isActive: true },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SummarizerConstructor = function () {} as any
        SummarizerConstructor.availability = mockAvailability
        SummarizerConstructor.create = mockSummarizerCreate

        vi.stubGlobal('Summarizer', SummarizerConstructor)
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Summarizer = SummarizerConstructor
        }
        mockAvailability.mockResolvedValue('readily')
        mockSummarizerCreate.mockResolvedValue(mockSummarizer)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).Summarizer
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).LanguageDetector
        }
    })

    it('should handle base constructors in createSummarizer', async () => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Summarizer = Object
        }
        const { result } = renderHook(() => useAISummarize())

        await act(async () => {
            await result.current.summarize('text')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toContain(
            'Summarizer is not available',
        )
    })

    it('should handle unavailable status in createSummarizer', async () => {
        mockAvailability.mockResolvedValue('unavailable')
        const { result } = renderHook(() => useAISummarize())

        await act(async () => {
            await result.current.summarize('text')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toContain(
            'Summarizer is not available',
        )
    })

    it('should handle base constructors in detectLanguageFromText', async () => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = Object
        }
        const { result } = renderHook(() =>
            useAISummarize({ outputLanguage: 'auto' }),
        )

        await act(async () => {
            await result.current.summarize('text')
        })

        // Should fallback to 'en'
        expect(mockSummarizerCreate).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'en' }),
        )
    })

    it('should handle unavailable LanguageDetector in detectLanguageFromText', async () => {
        const mockLanguageAvailability = vi
            .fn()
            .mockResolvedValue('unavailable')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LanguageDetectorConstructor = function () {} as any
        LanguageDetectorConstructor.availability = mockLanguageAvailability

        vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor)
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetectorConstructor
        }

        const { result } = renderHook(() =>
            useAISummarize({ outputLanguage: 'auto' }),
        )

        await act(async () => {
            await result.current.summarize('text')
        })

        expect(mockSummarizerCreate).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'en' }),
        )
    })

    it('should handle missing userActivation in detectLanguageFromText', async () => {
        vi.stubGlobal('navigator', {
            userActivation: { isActive: false },
        })

        const mockLanguageDetectorCreate = vi.fn()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LanguageDetectorConstructor = function () {} as any
        LanguageDetectorConstructor.availability = vi
            .fn()
            .mockResolvedValue('readily')
        LanguageDetectorConstructor.create = mockLanguageDetectorCreate

        vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor)

        const { result } = renderHook(() =>
            useAISummarize({ outputLanguage: 'auto' }),
        )

        await act(async () => {
            await result.current.summarize('text')
        })

        // Should return 'en' and NOT call LanguageDetector.create
        expect(mockLanguageDetectorCreate).not.toHaveBeenCalled()
        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toContain(
            'User activation required',
        )
    })

    it('should handle explicit outputLanguage', async () => {
        const { result } = renderHook(() =>
            useAISummarize({ outputLanguage: 'ja' }),
        )

        await act(async () => {
            await result.current.summarize('text')
        })

        expect(mockSummarizerCreate).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'ja' }),
        )
    })

    it('should handle context in summarize', async () => {
        const { result } = renderHook(() => useAISummarize())

        await act(async () => {
            await result.current.summarize('text', 'custom context')
        })

        expect(mockSummarizer.summarize).toHaveBeenCalledWith(
            'text',
            expect.objectContaining({ context: 'custom context' }),
        )
    })

    it('should handle warmup error', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockSummarizerCreate.mockRejectedValue(new Error('Warmup failed'))

        renderHook(() => useAISummarize({ warmup: true }))

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to warmup summarizer:',
                expect.any(Error),
            )
        })
        consoleSpy.mockRestore()
    })

    it('should handle missing create method in detectLanguageFromText', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LanguageDetectorConstructor = function () {} as any
        LanguageDetectorConstructor.availability = vi
            .fn()
            .mockResolvedValue('readily')
        // create is missing

        vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor)
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetectorConstructor
        }

        const { result } = renderHook(() =>
            useAISummarize({ outputLanguage: 'auto' }),
        )

        await act(async () => {
            await result.current.summarize('text')
        })

        expect(mockSummarizerCreate).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'en' }),
        )
    })

    it('should handle empty results in detectLanguageFromText', async () => {
        const mockLanguageDetector = {
            detect: vi.fn().mockResolvedValue([]),
            destroy: vi.fn(),
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const LanguageDetectorConstructor = function () {} as any
        LanguageDetectorConstructor.availability = vi
            .fn()
            .mockResolvedValue('readily')
        LanguageDetectorConstructor.create = vi
            .fn()
            .mockResolvedValue(mockLanguageDetector)

        vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor)
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetectorConstructor
        }

        const { result } = renderHook(() =>
            useAISummarize({ outputLanguage: 'auto' }),
        )

        await act(async () => {
            await result.current.summarize('text')
        })

        expect(mockSummarizerCreate).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'en' }),
        )
    })
})
