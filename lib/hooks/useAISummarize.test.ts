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
    // Chrome native API: Summarizer is a global constructor (function)
    // Create a function mock that also has static methods
    const SummarizerMock = vi.fn() as unknown as { availability: typeof mockAvailability; create: typeof mockSummarizerCreate };
    SummarizerMock.availability = mockAvailability;
    SummarizerMock.create = mockSummarizerCreate;
    
    // Mock window.Summarizer directly
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'Summarizer', {
        value: SummarizerMock,
        writable: true,
        configurable: true,
      });
    }
    
    // The implementation now handles missing userActivation gracefully
    // No need to mock it for tests
    
    mockAvailability.mockResolvedValue('available');
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

    // Streaming accumulates all chunks
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
    expect(result.current.error?.message).toBe('Summarization failed');
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
    mockAvailability.mockResolvedValue('downloadable');

    let monitorCallback: ((m: { addEventListener: (event: string, callback: (e: ProgressEvent) => void) => void }) => void) | undefined;
    mockSummarizerCreate.mockImplementation(({ monitor }) => {
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

    const mockMonitor = { addEventListener: vi.fn() };
    monitorCallback!(mockMonitor);

    act(() => {
      const progressEvent = { loaded: 50, total: 100 } as ProgressEvent;
      const callback = mockMonitor.addEventListener.mock.calls.find((call: unknown[]) => call[0] === 'downloadprogress')?.[1];
      if (callback) callback(progressEvent);
    });

    expect(result.current.progress).toEqual({ loaded: 50, total: 100 });
  });

  it('should respect warmup option', async () => {
    renderHook(() => useAISummarize({ warmup: true }));
    await waitFor(() => expect(mockSummarizerCreate).toHaveBeenCalled());
  });
});
