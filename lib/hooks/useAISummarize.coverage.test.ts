import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAISummarize } from './useAISummarize';

describe('useAISummarize Coverage', () => {
  const mockSummarizer = {
    summarize: vi.fn(),
    summarizeStreaming: vi.fn(),
    destroy: vi.fn(),
  };

  const mockSummarizerCreate = vi.fn();
  const mockAvailability = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('navigator', {
      userActivation: { isActive: true },
    });

    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockSummarizerCreate };
    SummarizerConstructor.availability = mockAvailability;
    SummarizerConstructor.create = mockSummarizerCreate;

    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).Summarizer = SummarizerConstructor;
    }
    mockAvailability.mockResolvedValue('readily');
    mockSummarizerCreate.mockResolvedValue(mockSummarizer);
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

  it('should handle "unavailable" status from LanguageDetector.availability', async () => {
    const mockLanguageAvailability = vi.fn().mockResolvedValue('unavailable');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LanguageDetectorConstructor = function () {} as any;
    LanguageDetectorConstructor.availability = mockLanguageAvailability;
    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).LanguageDetector = LanguageDetectorConstructor;

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

    await act(async () => {
      await result.current.summarize('test text');
    });

    // Should fall back to 'en'
    expect(mockSummarizerCreate).toHaveBeenCalledWith(expect.objectContaining({ outputLanguage: 'en' }));
  });

  it('should handle base constructor security check for LanguageDetector', async () => {
    vi.stubGlobal('LanguageDetector', Object);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).LanguageDetector = Object;

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

    await act(async () => {
      await result.current.summarize('test text');
    });

    // Should fall back to 'en'
    expect(mockSummarizerCreate).toHaveBeenCalledWith(expect.objectContaining({ outputLanguage: 'en' }));
  });

  it('should handle missing LanguageDetector.create function', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LanguageDetectorConstructor = function () {} as any;
    // create is missing
    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).LanguageDetector = LanguageDetectorConstructor;

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

    await act(async () => {
      await result.current.summarize('test text');
    });

    // Should fall back to 'en'
    expect(mockSummarizerCreate).toHaveBeenCalledWith(expect.objectContaining({ outputLanguage: 'en' }));
  });

  it('should handle empty results from detector.detect', async () => {
    const mockDetector = {
      detect: vi.fn().mockResolvedValue([]),
      destroy: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LanguageDetectorConstructor = function () {} as any;
    LanguageDetectorConstructor.create = vi.fn().mockResolvedValue(mockDetector);
    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).LanguageDetector = LanguageDetectorConstructor;

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

    await act(async () => {
      await result.current.summarize('test text');
    });

    // Should fall back to 'en'
    expect(mockSummarizerCreate).toHaveBeenCalledWith(expect.objectContaining({ outputLanguage: 'en' }));
  });

  it('should handle outputLanguage as string directly', async () => {
    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'es' }));

    await act(async () => {
      await result.current.summarize('test text');
    });

    expect(mockSummarizerCreate).toHaveBeenCalledWith(expect.objectContaining({ outputLanguage: 'es' }));
  });

  it('should handle context in summarize', async () => {
    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('test text', 'test context');
    });

    expect(mockSummarizer.summarize).toHaveBeenCalledWith(
      'test text',
      expect.objectContaining({ context: 'test context' })
    );
  });

  it('should handle errors in detectLanguageFromText', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LanguageDetectorConstructor = function () {} as any;
    LanguageDetectorConstructor.availability = vi.fn().mockRejectedValue(new Error('Detection error'));
    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).LanguageDetector = LanguageDetectorConstructor;

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

    await act(async () => {
      await result.current.summarize('test text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Detection error');
  });

  it('should handle errors in createSummarizer during summarize', async () => {
    mockSummarizerCreate.mockRejectedValue(new Error('Creation failed'));
    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('test text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Creation failed');
  });

  it('should handle non-Error rejection in summarize', async () => {
    mockSummarizerCreate.mockRejectedValue('String error');
    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('test text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Unknown error during summarization');
  });

  it('should handle warmup failures and log error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSummarizerCreate.mockRejectedValue(new Error('Warmup failed'));

    renderHook(() => useAISummarize({ warmup: true }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to warmup summarizer:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should throw error when Summarizer API is not supported', async () => {
    vi.stubGlobal('Summarizer', undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).Summarizer = undefined;

    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('test text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Summarizer API not supported in this browser');
  });

  it('should throw error when Summarizer is a base constructor', async () => {
    vi.stubGlobal('Summarizer', Object);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).Summarizer = Object;

    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('test text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Summarizer is not available');
  });

  it('should throw error when Summarizer availability is "unavailable"', async () => {
    mockAvailability.mockResolvedValue('unavailable');

    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('test text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Summarizer is not available');
  });

  it('should throw error when Summarizer.create is not available', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SummarizerConstructor = function () {} as any;
    SummarizerConstructor.availability = vi.fn().mockResolvedValue('available');
    // create is missing
    vi.stubGlobal('Summarizer', SummarizerConstructor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined') (window as any).Summarizer = SummarizerConstructor;

    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('test text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Summarizer.create is not available');
  });

  it('should reset state and abort ongoing operation in reset', async () => {
    let abortSignal: AbortSignal | undefined;
    mockSummarizerCreate.mockImplementation(async () => {
      return new Promise(resolve => setTimeout(() => resolve(mockSummarizer), 50));
    });
    mockSummarizer.summarize.mockImplementation((_, options) => {
      abortSignal = options?.signal;
      return new Promise((_, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
        });
      });
    });

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'en' }));

    act(() => {
      result.current.summarize('test text');
    });

    await waitFor(() => expect(result.current.status).toBe('initializing'));

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
    expect(result.current.progress).toBeNull();
    expect(result.current.error).toBeNull();
    expect(abortSignal?.aborted).toBe(true);
  });

  it('should handle "downloading" availability for Summarizer', async () => {
    mockAvailability.mockResolvedValue('downloading');
    // Delay creation to ensure status stays in 'downloading' long enough for waitFor
    mockSummarizerCreate.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSummarizer), 100)));

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'en' }));

    act(() => {
      result.current.summarize('test text');
    });

    await waitFor(() => expect(result.current.status).toBe('downloading'));
  });

  it('should handle "downloadable" availability for Summarizer', async () => {
    mockAvailability.mockResolvedValue('downloadable');
    mockSummarizerCreate.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSummarizer), 100)));

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'en' }));

    act(() => {
      result.current.summarize('test text');
    });

    await waitFor(() => expect(result.current.status).toBe('downloading'));
  });

  it('should handle "downloadprogress" event in createSummarizer', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let monitorCallback: (m: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockSummarizerCreate.mockImplementation(({ monitor }: { monitor: (m: any) => void }) => {
      monitorCallback = monitor;
      // Delay so it doesn't resolve too fast
      return new Promise(resolve => setTimeout(() => resolve(mockSummarizer), 50));
    });

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'en' }));

    act(() => {
      result.current.summarize('test text');
    });

    await waitFor(() => expect(monitorCallback).toBeDefined());

    const mockMonitor = {
      addEventListener: vi.fn((event, cb) => {
        if (event === 'downloadprogress') {
          cb({ loaded: 75, total: 100 });
        }
      })
    };

    act(() => {
      monitorCallback!(mockMonitor);
    });

    expect(result.current.progress).toEqual({ loaded: 75, total: 100 });
  });
});
