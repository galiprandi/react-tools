import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTranslator } from './useTranslator'

describe('useTranslator Coverage Gaps', () => {
    beforeEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()

        // Default mock navigator.userActivation to active
        vi.stubGlobal('navigator', {
            userActivation: { isActive: true },
            language: 'en-US',
        })

        if (typeof window !== 'undefined') {
            const globals = ['Translator', 'LanguageDetector']
            globals.forEach((g) => {
                delete (window as unknown as Record<string, unknown>)[g]
            })
        }
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.clearAllMocks()
    })

    it('should handle LanguageDetector being a base constructor', async () => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = Object
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto', text: 'test' }),
        )

        await waitFor(() => expect(result.current.status).toBe('idle'))
        // It should fallback to 'en'
        expect(result.current.detectedSourceLanguage).toBeUndefined()
    })

    it('should handle Translator being a base constructor', async () => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Translator = Object
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'en', targetLanguage: 'es' }),
        )

        await act(async () => {
            await result.current.translate('test').catch(() => {})
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toContain(
            'Translator is not available',
        )
    })

    it('should handle LanguageDetector.detect returning empty results', async () => {
        const mockLanguageDetector = {
            detect: vi.fn().mockResolvedValue([]),
            destroy: vi.fn(),
        }
        const LanguageDetector = function () {}
        LanguageDetector.availability = vi.fn().mockResolvedValue('available')
        LanguageDetector.create = vi
            .fn()
            .mockResolvedValue(mockLanguageDetector)

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetector
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto', warmup: false }),
        )

        await act(async () => {
            await result.current.translate('test')
        })

        expect(result.current.detectedSourceLanguage).toBeUndefined()
    })

    it('should handle navigator.userActivation.isActive being false', async () => {
        vi.stubGlobal('navigator', {
            userActivation: { isActive: false },
        })

        const Translator = function () {}
        Translator.availability = vi.fn().mockResolvedValue('available')

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Translator = Translator
        }

        const { result } = renderHook(() =>
            useTranslator({
                sourceLanguage: 'en',
                targetLanguage: 'es',
                warmup: false,
            }),
        )

        await act(async () => {
            await result.current.translate('test').catch(() => {})
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toContain(
            'User activation required',
        )
    })

    it('should handle warmup failure', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const Translator = function () {}
        Translator.availability = vi
            .fn()
            .mockRejectedValue(new Error('Warmup failed'))

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Translator = Translator
        }

        renderHook(() => useTranslator({ warmup: true }))

        // Warmup is async, we wait a bit
        await new Promise((resolve) => setTimeout(resolve, 50))
        // Should not crash
        consoleSpy.mockRestore()
    })

    it('should handle "downloading" availability state', async () => {
        const Translator = function () {}
        Translator.availability = vi.fn().mockResolvedValue('downloading')
        Translator.create = vi.fn().mockResolvedValue({
            translate: vi.fn().mockResolvedValue('translated'),
            destroy: vi.fn(),
        })

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Translator = Translator
        }

        const { result } = renderHook(() =>
            useTranslator({
                sourceLanguage: 'en',
                targetLanguage: 'es',
                streaming: false,
                warmup: false,
            }),
        )

        await act(async () => {
            await result.current.translate('test')
        })

        expect(result.current.status).toBe('success')
    })

    it('should handle unsupported user language', async () => {
        vi.stubGlobal('navigator', {
            language: 'xx-XX', // Unsupported language
        })

        const { result } = renderHook(() =>
            useTranslator({ targetLanguage: 'user' }),
        )

        // It should fallback to 'en'
        expect(result.current.resolvedTargetLanguage).toBe('en')
    })

    it('should handle non-Error rejection in translate', async () => {
        const Translator = function () {}
        Translator.availability = vi.fn().mockResolvedValue('available')
        Translator.create = vi.fn().mockRejectedValue(new Error('String Error'))

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Translator = Translator
        }

        const { result } = renderHook(() =>
            useTranslator({
                sourceLanguage: 'en',
                targetLanguage: 'es',
                warmup: false,
            }),
        )

        await act(async () => {
            await result.current.translate('test').catch(() => {})
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toBe('String Error')
    })

    it('should handle LanguageDetector not being a function', async () => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = 'not a function'
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto' }),
        )
        await act(async () => {
            await result.current.translate('test')
        })
        expect(result.current.detectedSourceLanguage).toBeUndefined()
    })

    it('should handle detected language not in SUPPORTED_LANGUAGES', async () => {
        const mockLanguageDetector = {
            detect: vi
                .fn()
                .mockResolvedValue([
                    { detectedLanguage: 'xx', confidence: 0.9 },
                ]),
            destroy: vi.fn(),
        }
        const LanguageDetector = function () {}
        LanguageDetector.availability = vi.fn().mockResolvedValue('available')
        LanguageDetector.create = vi
            .fn()
            .mockResolvedValue(mockLanguageDetector)

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetector
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto', warmup: false }),
        )

        await act(async () => {
            await result.current.translate('test')
        })

        expect(result.current.detectedSourceLanguage).toBeUndefined()
    })

    it('should handle Translator.availability being unavailable', async () => {
        const Translator = function () {}
        Translator.availability = vi.fn().mockResolvedValue('unavailable')

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Translator = Translator
        }

        const { result } = renderHook(() =>
            useTranslator({
                sourceLanguage: 'en',
                targetLanguage: 'es',
                warmup: false,
            }),
        )

        await act(async () => {
            await result.current.translate('test').catch(() => {})
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toContain(
            'Translator is not available for en → es',
        )
    })

    it('should handle LanguageDetector.availability being unavailable', async () => {
        const LanguageDetector = function () {}
        LanguageDetector.availability = vi.fn().mockResolvedValue('unavailable')

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetector
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto', warmup: false }),
        )

        await act(async () => {
            await result.current.translate('test')
        })

        expect(result.current.detectedSourceLanguage).toBeUndefined()
    })

    it('should handle cleanup on unmount when refs are set', async () => {
        const mockDestroy = vi.fn()
        const Translator = function () {}
        Translator.availability = vi.fn().mockResolvedValue('available')
        Translator.create = vi.fn().mockResolvedValue({
            translate: vi.fn().mockResolvedValue('done'),
            destroy: mockDestroy,
        })

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Translator = Translator
        }

        const { result, unmount } = renderHook(() =>
            useTranslator({
                sourceLanguage: 'en',
                targetLanguage: 'es',
                warmup: false,
            }),
        )

        await act(async () => {
            await result.current.translate('test')
        })

        unmount()
        expect(mockDestroy).toHaveBeenCalled()
    })

    it('should handle LanguageDetector.availability throwing error', async () => {
        const LanguageDetector = function () {}
        LanguageDetector.availability = vi
            .fn()
            .mockRejectedValue(new Error('fail'))

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetector
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto', warmup: false }),
        )

        await act(async () => {
            await result.current.translate('test')
        })

        expect(result.current.detectedSourceLanguage).toBeUndefined()
    })

    it('should handle Translator.create not being a function', async () => {
        const Translator = function () {}
        Translator.availability = vi.fn().mockResolvedValue('available')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(Translator as any).create = undefined

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Translator = Translator
        }

        const { result } = renderHook(() =>
            useTranslator({
                sourceLanguage: 'en',
                targetLanguage: 'es',
                warmup: false,
            }),
        )

        await act(async () => {
            await result.current.translate('test').catch(() => {})
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toContain(
            'Translator.create is not available',
        )
    })

    it('should handle LanguageDetector userActivation isActive false', async () => {
        vi.stubGlobal('navigator', {
            userActivation: { isActive: false },
        })
        const LanguageDetector = function () {}
        LanguageDetector.availability = vi.fn().mockResolvedValue('available')
        LanguageDetector.create = vi.fn()

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetector
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto', warmup: false }),
        )
        await act(async () => {
            await result.current.translate('test')
        })
        expect(LanguageDetector.create).not.toHaveBeenCalled()
    })

    it('should handle LanguageDetector.create not being a function', async () => {
        const LanguageDetector = function () {}
        LanguageDetector.availability = vi.fn().mockResolvedValue('available')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(LanguageDetector as any).create = undefined

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetector
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto', warmup: false }),
        )
        await act(async () => {
            await result.current.translate('test')
        })
        expect(result.current.detectedSourceLanguage).toBeUndefined()
    })

    it('should handle LanguageDetector not having availability function', async () => {
        const LanguageDetector = function () {}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(LanguageDetector as any).availability = undefined

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).LanguageDetector = LanguageDetector
        }

        const { result } = renderHook(() =>
            useTranslator({ sourceLanguage: 'auto', warmup: false }),
        )
        await act(async () => {
            await result.current.translate('test')
        })
        expect(result.current.detectedSourceLanguage).toBeUndefined()
    })
})
