import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIRewriter } from './useAIRewriter';

describe('useAIRewriter', () => {
  const mockRewriter = {
    rewrite: vi.fn(),
    rewriteStreaming: vi.fn(),
    destroy: vi.fn(),
  };

  const mockRewriterCreate = vi.fn();
  const mockAvailability = vi.fn();

  beforeEach(() => {
    const RewriterConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockRewriterCreate };
    RewriterConstructor.availability = mockAvailability;
    RewriterConstructor.create = mockRewriterCreate;
    
    vi.stubGlobal('Rewriter', RewriterConstructor);
    if (typeof window !== 'undefined') {
        (window as unknown as { Rewriter?: unknown }).Rewriter = (global as unknown as { Rewriter?: unknown }).Rewriter;
    }
    mockAvailability.mockResolvedValue('readily');
    mockRewriterCreate.mockResolvedValue(mockRewriter);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
        delete (window as unknown as { Rewriter?: unknown }).Rewriter;
    }
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useAIRewriter());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should pass through rewriting status when calling rewrite', async () => {
    mockRewriter.rewrite.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('rewritten text'), 50)));
    const { result } = renderHook(() => useAIRewriter());

    act(() => {
      result.current.rewrite('original text');
    });

    await waitFor(() => expect(result.current.status).toBe('rewriting'));
    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 2000 });
    expect(result.current.data).toBe('rewritten text');
  });

  it('should handle streaming', async () => {
    // Chrome Rewriter API returns incremental chunks, hook accumulates them
    const chunks = ['full ', 'text'];
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    };
    mockRewriter.rewriteStreaming.mockReturnValue(mockStream);

    const { result } = renderHook(() => useAIRewriter({ streaming: true }));

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(result.current.data).toBe('full text');
    expect(result.current.status).toBe('success');
  });

  it('should call destroy on unmount', async () => {
    const { unmount } = renderHook(() => useAIRewriter({ warmup: true }));
    await waitFor(() => expect(mockRewriterCreate).toHaveBeenCalled());
    unmount();
    expect(mockRewriter.destroy).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Rewriting failed');
    mockRewriter.rewrite.mockRejectedValue(error);

    const { result } = renderHook(() => useAIRewriter());

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
  });

  it('should prevent concurrent rewriting', async () => {
    let resolveRewrite: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolveRewrite = resolve;
    });
    mockRewriter.rewrite.mockReturnValue(promise);

    const { result } = renderHook(() => useAIRewriter());

    act(() => {
      result.current.rewrite('first call');
    });

    await waitFor(() => expect(result.current.status).toBe('rewriting'));

    // Second call should be ignored
    act(() => {
      result.current.rewrite('second call');
    });

    expect(mockRewriter.rewrite).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRewrite!('first result');
    });

    expect(result.current.status).toBe('success');
  });

  it('should handle download progress', async () => {
    mockAvailability.mockResolvedValue('downloading');

    let monitorCallback: ((monitor: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void) | undefined;
    mockRewriterCreate.mockImplementation(({ monitor }: { monitor?: (m: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void }) => {
      monitorCallback = monitor;
      return new Promise((resolve) => {
          // Delay resolution to simulate download
          setTimeout(() => resolve(mockRewriter), 100);
      });
    });

    const { result } = renderHook(() => useAIRewriter());

    act(() => {
      result.current.rewrite('original text');
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
    renderHook(() => useAIRewriter({ warmup: true }));
    await waitFor(() => expect(mockRewriterCreate).toHaveBeenCalled());
  });

  it('should work without options parameter', () => {
    const { result } = renderHook(() => useAIRewriter());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should pass tone option to Rewriter.create', async () => {
    const { result } = renderHook(() => useAIRewriter({ tone: 'more-formal' }));

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(mockRewriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'more-formal',
      })
    );
  });

  it('should pass format option to Rewriter.create', async () => {
    const { result } = renderHook(() => useAIRewriter({ format: 'markdown' }));

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(mockRewriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'markdown',
      })
    );
  });

  it('should pass length option to Rewriter.create', async () => {
    const { result } = renderHook(() => useAIRewriter({ length: 'shorter' }));

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(mockRewriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        length: 'shorter',
      })
    );
  });

  it('should pass sharedContext option to Rewriter.create', async () => {
    const { result } = renderHook(() => useAIRewriter({ sharedContext: 'This is a shared context' }));

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(mockRewriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        sharedContext: 'This is a shared context',
      })
    );
  });

  it('should pass expectedInputLanguages option to Rewriter.create', async () => {
    const { result } = renderHook(() => useAIRewriter({ expectedInputLanguages: ['en', 'es'] }));

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(mockRewriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedInputLanguages: ['en', 'es'],
      })
    );
  });

  it('should pass expectedContextLanguages option to Rewriter.create', async () => {
    const { result } = renderHook(() => useAIRewriter({ expectedContextLanguages: ['en', 'fr'] }));

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(mockRewriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedContextLanguages: ['en', 'fr'],
      })
    );
  });

  it('should pass outputLanguage option to Rewriter.create', async () => {
    const { result } = renderHook(() => useAIRewriter({ outputLanguage: 'es' }));

    await act(async () => {
      await result.current.rewrite('original text');
    });

    expect(mockRewriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        outputLanguage: 'es',
      })
    );
  });

  it('should pass context parameter to rewrite method', async () => {
    const { result } = renderHook(() => useAIRewriter());

    await act(async () => {
      await result.current.rewrite('original text', 'additional context');
    });

    expect(mockRewriter.rewrite).toHaveBeenCalledWith(
      'original text',
      expect.objectContaining({
        context: 'additional context',
      })
    );
  });

  it('should pass overrideTone parameter to rewrite method', async () => {
    const { result } = renderHook(() => useAIRewriter());

    await act(async () => {
      await result.current.rewrite('original text', undefined, 'more-casual');
    });

    expect(mockRewriter.rewrite).toHaveBeenCalledWith(
      'original text',
      expect.objectContaining({
        tone: 'more-casual',
      })
    );
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useAIRewriter());

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
    expect(result.current.error).toBe(null);
    expect(result.current.progress).toBe(null);
  });
});
