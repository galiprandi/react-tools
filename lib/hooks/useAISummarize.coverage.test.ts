import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAISummarize } from './useAISummarize';

describe('useAISummarize Coverage', () => {
    const mockSummarizer = {
        summarize: vi.fn(),
        summarizeStreaming: vi.fn(),
        destroy: vi.fn(),
    };

    beforeEach(() => {
        vi.stubGlobal('navigator', {
            userActivation: { isActive: true },
        });

        const Summarizer = function() {};
        Summarizer.availability = vi.fn().mockResolvedValue('readily');
        Summarizer.create = vi.fn().mockResolvedValue(mockSummarizer);

        vi.stubGlobal('Summarizer', Summarizer);

        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Summarizer = Summarizer;
        }
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).Summarizer;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).LanguageDetector;
        }
    });

    it('should handle missing window.Summarizer', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).Summarizer;
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window as any).Summarizer;
        }

        const { result } = renderHook(() => useAISummarize());

        await act(async () => {
            await result.current.summarize('text');
        });

        expect(result.current.status).toBe('error');
        expect(result.current.error?.message).toBe('Summarizer API not supported in this browser');
    });

    it('should handle Summarizer being a base constructor (Object)', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.stubGlobal('Summarizer', Object);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined') (window as any).Summarizer = Object;

        const { result } = renderHook(() => useAISummarize());

        await act(async () => {
            await result.current.summarize('text');
        });

        expect(result.current.status).toBe('error');
        expect(result.current.error?.message).toBe('Summarizer is not available');
    });

    it('should handle Summarizer availability "unavailable"', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global as any).Summarizer.availability.mockResolvedValue('unavailable');

        const { result } = renderHook(() => useAISummarize());

        await act(async () => {
            await result.current.summarize('text');
        });

        expect(result.current.status).toBe('error');
        expect(result.current.error?.message).toBe('Summarizer is not available');
    });

    it('should set status to downloading if availability is "downloadable"', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global as any).Summarizer.availability.mockResolvedValue('downloadable');
        // Delay creation to capture downloading status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global as any).Summarizer.create.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSummarizer), 50)));

        const { result } = renderHook(() => useAISummarize());

        act(() => {
            result.current.summarize('text');
        });

        await waitFor(() => expect(result.current.status).toBe('downloading'));
        await waitFor(() => expect(result.current.status).toBe('success'));
    });

    it('should handle Summarizer.create being missing', async () => {
        const Summarizer = function() {};
        Summarizer.availability = vi.fn().mockResolvedValue('readily');

        vi.stubGlobal('Summarizer', Summarizer);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined') (window as any).Summarizer = Summarizer;

        const { result } = renderHook(() => useAISummarize());

        await act(async () => {
            await result.current.summarize('text');
        });

        expect(result.current.status).toBe('error');
        expect(result.current.error?.message).toBe('Summarizer.create is not available');
    });

    it('should handle LanguageDetector being a base constructor (Array)', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.stubGlobal('LanguageDetector', Array);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined') (window as any).LanguageDetector = Array;

        const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

        await act(async () => {
            await result.current.summarize('text');
        });

        // Should fallback to 'en'
        expect(result.current.status).toBe('success');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((global as any).Summarizer.create).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'en' })
        );
    });

    it('should handle LanguageDetector availability "unavailable"', async () => {
        const LanguageDetector = function() {};
        LanguageDetector.availability = vi.fn().mockResolvedValue('unavailable');
        LanguageDetector.create = vi.fn();

        vi.stubGlobal('LanguageDetector', LanguageDetector);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined') (window as any).LanguageDetector = LanguageDetector;

        const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

        await act(async () => {
            await result.current.summarize('text');
        });

        expect(result.current.status).toBe('success');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((global as any).Summarizer.create).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'en' })
        );
    });

    it('should handle LanguageDetector.create being missing', async () => {
        const LanguageDetector = function() {};
        LanguageDetector.availability = vi.fn().mockResolvedValue('readily');

        vi.stubGlobal('LanguageDetector', LanguageDetector);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined') (window as any).LanguageDetector = LanguageDetector;

        const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

        await act(async () => {
            await result.current.summarize('text');
        });

        expect(result.current.status).toBe('success');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((global as any).Summarizer.create).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'en' })
        );
    });

    it('should handle LanguageDetector returning empty results', async () => {
        const mockDetector = {
            detect: vi.fn().mockResolvedValue([]),
            destroy: vi.fn(),
        };
        const LanguageDetector = function() {};
        LanguageDetector.availability = vi.fn().mockResolvedValue('readily');
        LanguageDetector.create = vi.fn().mockResolvedValue(mockDetector);

        vi.stubGlobal('LanguageDetector', LanguageDetector);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined') (window as any).LanguageDetector = LanguageDetector;

        const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

        await act(async () => {
            await result.current.summarize('text');
        });

        expect(result.current.status).toBe('success');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((global as any).Summarizer.create).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'en' })
        );
    });

    it('should reuse existing summarizer', async () => {
        const { result } = renderHook(() => useAISummarize());

        await act(async () => {
            await result.current.summarize('first text');
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((global as any).Summarizer.create).toHaveBeenCalledTimes(1);

        await act(async () => {
            await result.current.summarize('second text');
        });

        // Should not call create again
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((global as any).Summarizer.create).toHaveBeenCalledTimes(1);
    });

    it('should use "en" as default outputLanguage during warmup if set to "auto"', async () => {
        renderHook(() => useAISummarize({ warmup: true, outputLanguage: 'auto' }));

        await waitFor(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((global as any).Summarizer.create).toHaveBeenCalledWith(
                expect.objectContaining({ outputLanguage: 'en' })
            );
        });
    });

    it('should use provided outputLanguage during warmup', async () => {
        renderHook(() => useAISummarize({ warmup: true, outputLanguage: 'es' }));

        await waitFor(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((global as any).Summarizer.create).toHaveBeenCalledWith(
                expect.objectContaining({ outputLanguage: 'es' })
            );
        });
    });

    it('should log error to console if warmup fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const error = new Error('Warmup failed');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked((global as any).Summarizer.create).mockRejectedValue(error);

        renderHook(() => useAISummarize({ warmup: true }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to warmup summarizer:', error);
        });
        consoleSpy.mockRestore();
    });

    it('should handle non-Error rejection in summarize', async () => {
        mockSummarizer.summarize.mockRejectedValue('Something went wrong');

        const { result } = renderHook(() => useAISummarize());

        await act(async () => {
            await result.current.summarize('text');
        });

        expect(result.current.status).toBe('error');
        expect(result.current.error?.message).toBe('Unknown error during summarization');
    });

    it('should pass context to summarize', async () => {
        mockSummarizer.summarize.mockResolvedValue('summary');

        const { result } = renderHook(() => useAISummarize());

        await act(async () => {
            await result.current.summarize('text', 'some context');
        });

        expect(mockSummarizer.summarize).toHaveBeenCalledWith(
            'text',
            expect.objectContaining({ context: 'some context' })
        );
    });

    it('should use provided outputLanguage when not "auto" or "user"', async () => {
        const { result } = renderHook(() => useAISummarize({ outputLanguage: 'es' }));

        await act(async () => {
            await result.current.summarize('text');
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((global as any).Summarizer.create).toHaveBeenCalledWith(
            expect.objectContaining({ outputLanguage: 'es' })
        );
    });

    it('should clear abortControllerRef on reset', async () => {
        mockSummarizer.summarize.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('summary'), 100)));
        const { result } = renderHook(() => useAISummarize());

        act(() => {
            result.current.summarize('text');
        });

        await waitFor(() => expect(result.current.status).toBe('summarizing'));

        act(() => {
            result.current.reset();
        });

        expect(result.current.status).toBe('idle');
    });

    it('should abort in-flight summarize on unmount', async () => {
        const abortSpy = vi.fn();
        const OriginalAbortController = global.AbortController;
        vi.stubGlobal('AbortController', class extends OriginalAbortController {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            abort(reason?: any) {
                super.abort(reason);
                abortSpy();
            }
        });

        const { result, unmount } = renderHook(() => useAISummarize());

        act(() => {
            result.current.summarize('text');
        });

        await waitFor(() => expect(result.current.status).toBe('summarizing'));

        unmount();
        expect(abortSpy).toHaveBeenCalled();

        vi.stubGlobal('AbortController', OriginalAbortController);
    });

    it('should fail if user activation is missing during language detection', async () => {
        vi.stubGlobal('navigator', {
            userActivation: { isActive: false },
        });

        const LanguageDetector = function() {};
        vi.stubGlobal('LanguageDetector', LanguageDetector);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined') (window as any).LanguageDetector = LanguageDetector;

        const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

        await act(async () => {
            await result.current.summarize('text');
        });

        // Even if detection falls back to 'en', creating the summarizer requires user activation
        expect(result.current.status).toBe('error');
        expect(result.current.error?.message).toContain('User activation required');
    });
});
