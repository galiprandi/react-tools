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
  const mockCapabilities = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('ai', {
      summarizer: {
        capabilities: mockCapabilities,
        create: mockSummarizerCreate,
      },
    });
    if (typeof window !== 'undefined') {
        (window as any).ai = (global as any).ai;
    }
    mockCapabilities.mockResolvedValue({ available: 'readily' });
    mockSummarizerCreate.mockResolvedValue(mockSummarizer);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
        delete (window as any).ai;
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

    expect(result.current.data).toBe('full summary');
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
    mockCapabilities.mockResolvedValue({ available: 'after-download' });

    let monitorCallback: any;
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

    const mockMonitor = { onprogress: null as any };
    monitorCallback(mockMonitor);

    act(() => {
      mockMonitor.onprogress({ loaded: 50, total: 100 });
    });

    expect(result.current.progress).toEqual({ loaded: 50, total: 100 });
  });

  it('should respect warmup option', async () => {
    renderHook(() => useAISummarize({ warmup: true }));
    await waitFor(() => expect(mockSummarizerCreate).toHaveBeenCalled());
  });
});
