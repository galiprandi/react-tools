import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIPrompt } from './useAIPrompt';

describe('useAIPrompt', () => {
  const mockSession = {
    prompt: vi.fn(),
    promptStreaming: vi.fn(),
    destroy: vi.fn(),
    addEventListener: vi.fn(),
    contextUsage: 10,
    contextWindow: 1000,
  };

  const mockLanguageModel = {
    availability: vi.fn(),
    create: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('ai', {
      languageModel: mockLanguageModel,
    });

    // Also mock window.ai for implementation that uses (window as any).ai
    if (typeof window !== 'undefined') {
      (window as any).ai = {
        languageModel: mockLanguageModel,
      };
    }

    mockLanguageModel.availability.mockResolvedValue('readily');
    mockLanguageModel.create.mockResolvedValue(mockSession);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      delete (window as any).ai;
      delete (window as any).LanguageModel;
    }
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useAIPrompt());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should pass through prompting status when calling prompt', async () => {
    mockSession.prompt.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('response'), 50)));
    const { result } = renderHook(() => useAIPrompt());

    act(() => {
      result.current.prompt('hello');
    });

    await waitFor(() => expect(result.current.status).toBe('prompting'));
    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 2000 });
    expect(result.current.data).toBe('response');
    expect(result.current.contextUsage).toBe(10);
    expect(result.current.contextWindow).toBe(1000);
  });

  it('should handle streaming with cumulative chunks', async () => {
    const chunks = ['Hello', 'Hello world', 'Hello world!'];
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk
        }
      },
    }
    mockSession.promptStreaming.mockReturnValue(mockStream);

    const { result } = renderHook(() => useAIPrompt({ streaming: true }));

    await act(async () => {
      await result.current.prompt('hello');
    });

    expect(result.current.data).toBe('Hello world!');
    expect(result.current.status).toBe('success');
  });

  it('should call destroy on unmount', async () => {
    const { unmount } = renderHook(() => useAIPrompt({ warmup: true }));
    await waitFor(() => expect(mockLanguageModel.create).toHaveBeenCalled());
    unmount();
    expect(mockSession.destroy).toHaveBeenCalled();
  });

  it('should handle errors during prompting', async () => {
    const error = new Error('Prompt failed');
    mockSession.prompt.mockRejectedValue(error);

    const { result } = renderHook(() => useAIPrompt());

    await act(async () => {
      await result.current.prompt('hello');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
  });

  it('should handle availability "after-download"', async () => {
    mockLanguageModel.availability.mockResolvedValue('after-download');

    // Delay session creation to ensure we can catch the downloading status
    mockLanguageModel.create.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSession), 100)));
    mockSession.prompt.mockResolvedValue('response');

    const { result } = renderHook(() => useAIPrompt());

    act(() => {
      result.current.prompt('hello');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('downloading');
    });
    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 2000 });
  });

  it('should respect warmup option', async () => {
    renderHook(() => useAIPrompt({ warmup: true }));
    await waitFor(() => expect(mockLanguageModel.create).toHaveBeenCalled());
  });

  it('should reset state correctly', async () => {
    mockSession.prompt.mockResolvedValue('response');
    const { result } = renderHook(() => useAIPrompt());

    await act(async () => {
      await result.current.prompt('hello');
    });

    expect(result.current.data).toBe('response');

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe('');
    expect(result.current.status).toBe('idle');
  });

  it('should throw error if user activation is not active', async () => {
    vi.stubGlobal('navigator', {
      userActivation: { isActive: false },
    })

    const { result } = renderHook(() => useAIPrompt({ warmup: false }))

    await act(async () => {
      await result.current.prompt('hello')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error?.message).toContain('User activation required')
  })

  it('should handle download progress', async () => {
    mockLanguageModel.availability.mockResolvedValue('after-download');

    let monitorCallback: ((m: any) => void) | undefined;
    mockLanguageModel.create.mockImplementation((options: any) => {
      monitorCallback = options.monitor;
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockSession), 100);
      });
    });

    const { result } = renderHook(() => useAIPrompt());

    act(() => {
      result.current.prompt('hello');
    });

    await waitFor(() => expect(result.current.status).toBe('downloading'));

    const eventListeners = new Map<string, (e: any) => void>();
    const mockMonitor = {
      addEventListener: (event: string, callback: (e: any) => void) => {
        eventListeners.set(event, callback);
      },
    };

    await waitFor(() => expect(monitorCallback).toBeDefined());
    monitorCallback?.(mockMonitor);

    act(() => {
      const progressEvent = { loaded: 50, total: 100 };
      const callback = eventListeners.get('downloadprogress');
      callback?.(progressEvent);
    });

    expect(result.current.progress).toEqual({ loaded: 50, total: 100 });
  });
});
