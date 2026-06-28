import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAIProofreader } from './useAIProofreader'

describe('useAIProofreader coverage', () => {
    const mockProofreader = {
        proofread: vi.fn(),
        destroy: vi.fn(),
    }

    const mockProofreaderCreate = vi.fn()
    const mockAvailability = vi.fn()

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ProofreaderConstructor = function () {} as any
        ProofreaderConstructor.availability = mockAvailability
        ProofreaderConstructor.create = mockProofreaderCreate

        vi.stubGlobal('Proofreader', ProofreaderConstructor)
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).Proofreader = ProofreaderConstructor
        }

        // Mock navigator.userActivation
        if (typeof navigator !== 'undefined') {
            Object.defineProperty(navigator, 'userActivation', {
                value: { isActive: true },
                configurable: true,
            })
        }

        mockAvailability.mockResolvedValue('readily')
        mockProofreaderCreate.mockResolvedValue(mockProofreader)
        mockProofreader.proofread.mockResolvedValue({
            correctedInput: 'corrected',
            corrections: [],
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).Proofreader
        }
    })

    it('should set error if Proofreader is Object base constructor', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Proofreader = Object
        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toBe(
            'Proofreader is not available',
        )
    })

    it('should set error if Proofreader is Array base constructor', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Proofreader = Array
        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toBe(
            'Proofreader is not available',
        )
    })

    it('should set error if Proofreader is Function base constructor', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Proofreader = Function
        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toBe(
            'Proofreader is not available',
        )
    })

    it('should handle downloadable availability status', async () => {
        mockAvailability.mockResolvedValue('downloadable')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let resolveCreate: (value: any) => void
        mockProofreaderCreate.mockReturnValue(
            new Promise((resolve) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolveCreate = resolve as any
            }),
        )

        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        act(() => {
            result.current.proofread('test')
        })

        await waitFor(() => expect(result.current.status).toBe('downloading'))

        await act(async () => {
            resolveCreate!(mockProofreader)
        })

        await waitFor(() => expect(result.current.status).toBe('success'))
    })

    it('should set error if user activation is missing', async () => {
        Object.defineProperty(navigator, 'userActivation', {
            value: { isActive: false },
            configurable: true,
        })

        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toContain(
            'User activation required',
        )
    })

    it('should set error if Proofreader.create is missing', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Proofreader.create = undefined

        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toBe(
            'Proofreader.create is not available',
        )
    })

    it('should handle non-Error rejection in proofread', async () => {
        mockProofreader.proofread.mockRejectedValue('string error')

        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toBe(
            'Unknown error during proofreading',
        )
    })

    it('should log error on warmup failure', async () => {
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        const error = new Error('Warmup failed')
        mockAvailability.mockRejectedValue(error)

        renderHook(() => useAIProofreader({ warmup: true }))

        await waitFor(() =>
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to warmup proofreader:',
                error,
            ),
        )
    })

    it('should not call Proofreader.availability if it is not a function', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Proofreader.availability = undefined

        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('success')
    })

    it('should set error if Proofreader API is not supported', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).Proofreader = undefined
        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toBe(
            'Proofreader API not supported in this browser',
        )
    })

    it('should set error if Proofreader is unavailable', async () => {
        mockAvailability.mockResolvedValue('unavailable')
        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test')
        })

        expect(result.current.status).toBe('error')
        expect(result.current.error?.message).toBe(
            'Proofreader is not available',
        )
    })

    it('should abort pending proofreading on reset', async () => {
        const abortSpy = vi.fn()
        const OriginalAbortController = global.AbortController
        vi.stubGlobal(
            'AbortController',
            class extends OriginalAbortController {
                abort() {
                    super.abort()
                    abortSpy()
                }
            },
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let resolveProofread: (value: any) => void
        mockProofreader.proofread.mockReturnValue(
            new Promise((resolve) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolveProofread = resolve as any
            }),
        )

        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        act(() => {
            result.current.proofread('test')
        })

        await waitFor(() => expect(result.current.status).toBe('proofreading'))

        act(() => {
            result.current.reset()
        })

        expect(abortSpy).toHaveBeenCalled()
        expect(result.current.status).toBe('idle')

        await act(async () => {
            resolveProofread!({ correctedInput: 'corrected', corrections: [] })
        })
    })

    it('should reuse existing proofreader instance', async () => {
        const { result } = renderHook(() => useAIProofreader({ warmup: false }))

        await act(async () => {
            await result.current.proofread('test 1')
        })
        expect(mockProofreaderCreate).toHaveBeenCalledTimes(1)

        await act(async () => {
            await result.current.proofread('test 2')
        })
        // Should still be 1 because it reuses the instance
        expect(mockProofreaderCreate).toHaveBeenCalledTimes(1)
    })

    it('should handle unmount with null proofreader', () => {
        const { unmount } = renderHook(() =>
            useAIProofreader({ warmup: false }),
        )
        unmount()
        expect(mockProofreader.destroy).not.toHaveBeenCalled()
    })

    it('should handle unmount with active proofreader', async () => {
        const { result, unmount } = renderHook(() =>
            useAIProofreader({ warmup: false }),
        )
        await act(async () => {
            await result.current.proofread('test')
        })
        unmount()
        expect(mockProofreader.destroy).toHaveBeenCalled()
    })
})
