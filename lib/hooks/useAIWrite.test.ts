import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIWrite } from './useAIWrite';

describe('useAIWrite', () => {
  const mockWriter = {
    write: vi.fn(),
    writeStreaming: vi.fn(),
    destroy: vi.fn(),
  };

  const mockWriterCreate = vi.fn();
  const mockAvailability = vi.fn();

  beforeEach(() => {
    const WriterConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockWriterCreate };
    WriterConstructor.availability = mockAvailability;
    WriterConstructor.create = mockWriterCreate;
    
    vi.stubGlobal('Writer', WriterConstructor);
    if (typeof window !== 'undefined') {
        (window as unknown as { Writer?: unknown }).Writer = (global as unknown as { Writer?: unknown }).Writer;
    }
    mockAvailability.mockResolvedValue('readily');
    mockWriterCreate.mockResolvedValue(mockWriter);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
        delete (window as unknown as { Writer?: unknown }).Writer;
    }
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useAIWrite());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should pass through writing status when calling write', async () => {
    mockWriter.write.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('written text'), 50)));
    const { result } = renderHook(() => useAIWrite());

    act(() => {
      result.current.write('prompt');
    });

    await waitFor(() => expect(result.current.status).toBe('writing'));
    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 2000 });
    expect(result.current.data).toBe('written text');
  });

  it('should handle streaming', async () => {
    const chunks = ['part1', 'part1part2', 'full text'];
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    };
    mockWriter.writeStreaming.mockReturnValue(mockStream);

    const { result } = renderHook(() => useAIWrite({ streaming: true }));

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(result.current.data).toBe('full text');
    expect(result.current.status).toBe('success');
  });

  it('should call destroy on unmount', async () => {
    const { unmount } = renderHook(() => useAIWrite({ warmup: true }));
    await waitFor(() => expect(mockWriterCreate).toHaveBeenCalled());
    unmount();
    expect(mockWriter.destroy).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Writing failed');
    mockWriter.write.mockRejectedValue(error);

    const { result } = renderHook(() => useAIWrite());

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
  });

  it('should prevent concurrent writing', async () => {
    let resolveWrite: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolveWrite = resolve;
    });
    mockWriter.write.mockReturnValue(promise);

    const { result } = renderHook(() => useAIWrite());

    act(() => {
      result.current.write('first call');
    });

    await waitFor(() => expect(result.current.status).toBe('writing'));

    // Second call should be ignored
    act(() => {
      result.current.write('second call');
    });

    expect(mockWriter.write).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveWrite!('first result');
    });

    expect(result.current.status).toBe('success');
  });

  it('should handle download progress', async () => {
    mockAvailability.mockResolvedValue('downloading');

    let monitorCallback: ((monitor: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void) | undefined;
    mockWriterCreate.mockImplementation(({ monitor }: { monitor?: (m: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void }) => {
      monitorCallback = monitor;
      return new Promise((resolve) => {
          // Delay resolution to simulate download
          setTimeout(() => resolve(mockWriter), 100);
      });
    });

    const { result } = renderHook(() => useAIWrite());

    act(() => {
      result.current.write('prompt');
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
    renderHook(() => useAIWrite({ warmup: true }));
    await waitFor(() => expect(mockWriterCreate).toHaveBeenCalled());
  });

  it('should work without options parameter', () => {
    const { result } = renderHook(() => useAIWrite());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should pass tone option to Writer.create', async () => {
    const { result } = renderHook(() => useAIWrite({ tone: 'formal' }));

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(mockWriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'formal',
      })
    );
  });

  it('should pass format option to Writer.create', async () => {
    const { result } = renderHook(() => useAIWrite({ format: 'markdown' }));

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(mockWriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'markdown',
      })
    );
  });

  it('should pass length option to Writer.create', async () => {
    const { result } = renderHook(() => useAIWrite({ length: 'short' }));

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(mockWriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        length: 'short',
      })
    );
  });

  it('should pass sharedContext option to Writer.create', async () => {
    const { result } = renderHook(() => useAIWrite({ sharedContext: 'This is a shared context' }));

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(mockWriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        sharedContext: 'This is a shared context',
      })
    );
  });

  it('should pass expectedInputLanguages option to Writer.create', async () => {
    const { result } = renderHook(() => useAIWrite({ expectedInputLanguages: ['en', 'es'] }));

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(mockWriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedInputLanguages: ['en', 'es'],
      })
    );
  });

  it('should pass expectedContextLanguages option to Writer.create', async () => {
    const { result } = renderHook(() => useAIWrite({ expectedContextLanguages: ['en', 'fr'] }));

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(mockWriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedContextLanguages: ['en', 'fr'],
      })
    );
  });

  it('should pass outputLanguage option to Writer.create', async () => {
    const { result } = renderHook(() => useAIWrite({ outputLanguage: 'es' }));

    await act(async () => {
      await result.current.write('prompt');
    });

    expect(mockWriterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        outputLanguage: 'es',
      })
    );
  });

  it('should pass context parameter to write method', async () => {
    const { result } = renderHook(() => useAIWrite());

    await act(async () => {
      await result.current.write('prompt', 'additional context');
    });

    expect(mockWriter.write).toHaveBeenCalledWith(
      'prompt',
      expect.objectContaining({
        context: 'additional context',
      })
    );
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useAIWrite());

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
    expect(result.current.error).toBe(null);
    expect(result.current.progress).toBe(null);
  });
});
