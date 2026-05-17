import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAISummarize } from './useAISummarize';

describe('useAISummarize', () => {
  const mockSummarizer = {
    summarize: vi.fn(),
    summarizeStreaming: vi.fn(),
    destroy: vi.fn(),
  };

  const mockSummarizerCreate = vi.fn();
  const mockAvailability = vi.fn();

  beforeEach(() => {
    vi.mock('../utilities/userLanguage', () => ({
      getUserLanguage: vi.fn(() => 'en'),
    }));

    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockSummarizerCreate };
    SummarizerConstructor.availability = mockAvailability;
    SummarizerConstructor.create = mockSummarizerCreate;
    
    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
        (window as unknown as { Summarizer?: unknown }).Summarizer = (global as unknown as { Summarizer?: unknown }).Summarizer;
    }
    mockAvailability.mockResolvedValue('readily');
    mockSummarizerCreate.mockResolvedValue(mockSummarizer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
        delete (window as unknown as { Summarizer?: unknown }).Summarizer;
    }
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useAISummarize());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should pass through summarizing status when calling summarize', async () => {
    mockSummarizer.summarize.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('summary'), 50)));
    const { result } = renderHook(() => useAISummarize());

    act(() => {
      result.current.summarize('input text');
    });

    await waitFor(() => expect(result.current.status).toBe('summarizing'));
    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 2000 });
    expect(result.current.data).toBe('summary');
  });

  it('should handle streaming', async () => {
    const chunks = ['part1', 'part2', 'full summary'];
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    };
    mockSummarizer.summarizeStreaming.mockReturnValue(mockStream);

    const { result } = renderHook(() => useAISummarize({ streaming: true }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(result.current.data).toBe('part1part2full summary');
    expect(result.current.status).toBe('success');
  });

  it('should call destroy on unmount', async () => {
    const { unmount } = renderHook(() => useAISummarize({ warmup: true }));
    await waitFor(() => expect(mockSummarizerCreate).toHaveBeenCalled());
    unmount();
    expect(mockSummarizer.destroy).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Summarization failed');
    mockSummarizer.summarize.mockRejectedValue(error);

    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
  });

  it('should prevent concurrent summarization', async () => {
    let resolveSummarize: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolveSummarize = resolve;
    });
    mockSummarizer.summarize.mockReturnValue(promise);

    const { result } = renderHook(() => useAISummarize());

    act(() => {
      result.current.summarize('first call');
    });

    await waitFor(() => expect(result.current.status).toBe('summarizing'));

    // Second call should be ignored
    act(() => {
      result.current.summarize('second call');
    });

    expect(mockSummarizer.summarize).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSummarize!('first result');
    });

    expect(result.current.status).toBe('success');
  });

  it('should handle download progress', async () => {
    mockAvailability.mockResolvedValue('downloading');

    let monitorCallback: ((monitor: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void) | undefined;
    mockSummarizerCreate.mockImplementation(({ monitor }: { monitor?: (m: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void }) => {
      monitorCallback = monitor;
      return new Promise((resolve) => {
          // Delay resolution to simulate download
          setTimeout(() => resolve(mockSummarizer), 100);
      });
    });

    const { result } = renderHook(() => useAISummarize());

    act(() => {
      result.current.summarize('text');
    });

    await waitFor(() => expect(result.current.status).toBe('downloading'));

    const eventListeners = new Map<string, (e: Event) => void>();
    const mockMonitor = {
      addEventListener: (event: string, callback: (e: Event) => void) => {
        eventListeners.set(event, callback);
      },
    };
    monitorCallback?.(mockMonitor);

    act(() => {
      const progressEvent = { loaded: 50, total: 100 } as ProgressEvent;
      const callback = eventListeners.get('downloadprogress');
      callback?.(progressEvent);
    });

    expect(result.current.progress).toEqual({ loaded: 50, total: 100 });
  });

  it('should respect warmup option', async () => {
    renderHook(() => useAISummarize({ warmup: true }));
    await waitFor(() => expect(mockSummarizerCreate).toHaveBeenCalled());
  });

  it('should handle outputLanguage "user" by using browser language', async () => {
    const { getUserLanguage } = await import('../utilities/userLanguage');
    vi.mocked(getUserLanguage).mockReturnValue('es');

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'user' }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    // Should create summarizer with 'es' (normalized from 'es-ES')
    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        outputLanguage: 'es',
      })
    );
  });

  it('should handle outputLanguage "auto" by detecting language from text', async () => {
    const mockLanguageDetector = {
      detect: vi.fn().mockResolvedValue([{ detectedLanguage: 'fr', confidence: 0.99 }]),
      destroy: vi.fn(),
    };
    const mockLanguageDetectorCreate = vi.fn().mockResolvedValue(mockLanguageDetector);
    const mockLanguageAvailability = vi.fn().mockResolvedValue('readily');

    const LanguageDetectorConstructor = function () {} as unknown as { availability: typeof mockLanguageAvailability; create: typeof mockLanguageDetectorCreate };
    LanguageDetectorConstructor.availability = mockLanguageAvailability;
    LanguageDetectorConstructor.create = mockLanguageDetectorCreate;

    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { LanguageDetector?: unknown }).LanguageDetector = (global as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

    await act(async () => {
      await result.current.summarize('Bonjour le monde');
    });

    // Should detect language as 'fr' and create summarizer with it
    expect(mockLanguageDetector.detect).toHaveBeenCalledWith('Bonjour le monde');
    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        outputLanguage: 'fr',
      })
    );

    vi.unstubAllGlobals();
    if (typeof window !== 'undefined') {
      delete (window as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }
  });

  it('should fall back to "en" when language detection is unavailable', async () => {
    vi.stubGlobal('LanguageDetector', undefined);
    if (typeof window !== 'undefined') {
      delete (window as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }

    const { result } = renderHook(() => useAISummarize({ outputLanguage: 'auto' }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    // Should fall back to 'en' when LanguageDetector is not available
    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        outputLanguage: 'en',
      })
    );

    vi.unstubAllGlobals();
  });

  it('should work without options parameter', () => {
    const { result } = renderHook(() => useAISummarize());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should default to "auto" for outputLanguage', async () => {
    const mockLanguageDetector = {
      detect: vi.fn().mockResolvedValue([{ detectedLanguage: 'en', confidence: 0.99 }]),
      destroy: vi.fn(),
    };
    const mockLanguageDetectorCreate = vi.fn().mockResolvedValue(mockLanguageDetector);
    const mockLanguageAvailability = vi.fn().mockResolvedValue('readily');

    const LanguageDetectorConstructor = function () {} as unknown as { availability: typeof mockLanguageAvailability; create: typeof mockLanguageDetectorCreate };
    LanguageDetectorConstructor.availability = mockLanguageAvailability;
    LanguageDetectorConstructor.create = mockLanguageDetectorCreate;

    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { LanguageDetector?: unknown }).LanguageDetector = (global as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }

    const { result } = renderHook(() => useAISummarize());

    await act(async () => {
      await result.current.summarize('input text');
    });

    // Should detect language when no options are provided (default is 'auto')
    expect(mockLanguageDetector.detect).toHaveBeenCalledWith('input text');

    vi.unstubAllGlobals();
    if (typeof window !== 'undefined') {
      delete (window as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }
  });

  it('should pass type option to Summarizer.create', async () => {
    const { result } = renderHook(() => useAISummarize({ type: 'tldr' }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'tldr',
      })
    );
  });

  it('should pass format option to Summarizer.create', async () => {
    const { result } = renderHook(() => useAISummarize({ format: 'markdown' }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'markdown',
      })
    );
  });

  it('should pass length option to Summarizer.create', async () => {
    const { result } = renderHook(() => useAISummarize({ length: 'short' }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        length: 'short',
      })
    );
  });

  it('should pass sharedContext option to Summarizer.create', async () => {
    const { result } = renderHook(() => useAISummarize({ sharedContext: 'This is a shared context' }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        sharedContext: 'This is a shared context',
      })
    );
  });

  it('should pass expectedInputLanguages option to Summarizer.create', async () => {
    const { result } = renderHook(() => useAISummarize({ expectedInputLanguages: ['en', 'es'] }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedInputLanguages: ['en', 'es'],
      })
    );
  });

  it('should pass expectedContextLanguages option to Summarizer.create', async () => {
    const { result } = renderHook(() => useAISummarize({ expectedContextLanguages: ['en', 'fr'] }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedContextLanguages: ['en', 'fr'],
      })
    );
  });

  it('should pass preference option to Summarizer.create', async () => {
    const { result } = renderHook(() => useAISummarize({ preference: 'capability' }));

    await act(async () => {
      await result.current.summarize('input text');
    });

    expect(mockSummarizerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        preference: 'capability',
      })
    );
  });
});
