import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIProofreader } from './useAIProofreader';

describe('useAIProofreader', () => {
  const mockProofreader = {
    proofread: vi.fn(),
    destroy: vi.fn(),
  };

  const mockProofreaderCreate = vi.fn();
  const mockAvailability = vi.fn();

  beforeEach(() => {
    const ProofreaderConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockProofreaderCreate };
    ProofreaderConstructor.availability = mockAvailability;
    ProofreaderConstructor.create = mockProofreaderCreate;
    
    vi.stubGlobal('Proofreader', ProofreaderConstructor);
    if (typeof window !== 'undefined') {
        (window as unknown as { Proofreader?: unknown }).Proofreader = (global as unknown as { Proofreader?: unknown }).Proofreader;
    }
    mockAvailability.mockResolvedValue('readily');
    mockProofreaderCreate.mockResolvedValue(mockProofreader);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
        delete (window as unknown as { Proofreader?: unknown }).Proofreader;
    }
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useAIProofreader());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
    expect(result.current.corrections).toEqual([]);
  });

  it('should pass through proofreading status when calling proofread', async () => {
    mockProofreader.proofread.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ correctedInput: 'corrected text', corrections: [] }), 50)));
    const { result } = renderHook(() => useAIProofreader());

    act(() => {
      result.current.proofread('original text');
    });

    await waitFor(() => expect(result.current.status).toBe('proofreading'));
    await waitFor(() => expect(result.current.status).toBe('success'), { timeout: 2000 });
    expect(result.current.data).toBe('corrected text');
  });

  it('should return corrected text and corrections', async () => {
    const mockResult = {
      correctedInput: 'I saw him yesterday at the store, and he bought two loaves of bread.',
      corrections: [
        { startIndex: 2, endIndex: 6, type: 'grammar', explanation: 'Use past tense' },
        { startIndex: 45, endIndex: 49, type: 'spelling', explanation: 'Plural form' },
      ],
    };
    mockProofreader.proofread.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useAIProofreader());

    await act(async () => {
      await result.current.proofread('I seen him yesterday at the store, and he bought two loafs of bread.');
    });

    expect(result.current.data).toBe(mockResult.correctedInput);
    expect(result.current.corrections).toEqual(mockResult.corrections);
  });

  it('should call destroy on unmount', async () => {
    const { unmount } = renderHook(() => useAIProofreader({ warmup: true }));
    await waitFor(() => expect(mockProofreaderCreate).toHaveBeenCalled());
    unmount();
    expect(mockProofreader.destroy).toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Proofreading failed');
    mockProofreader.proofread.mockRejectedValue(error);

    const { result } = renderHook(() => useAIProofreader());

    await act(async () => {
      await result.current.proofread('original text');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
  });

  it('should prevent concurrent proofreading', async () => {
    let resolveProofread: (value: { correctedInput: string; corrections: [] }) => void;
    const promise = new Promise<{ correctedInput: string; corrections: [] }>((resolve) => {
      resolveProofread = resolve;
    });
    mockProofreader.proofread.mockReturnValue(promise);

    const { result } = renderHook(() => useAIProofreader());

    act(() => {
      result.current.proofread('first call');
    });

    await waitFor(() => expect(result.current.status).toBe('proofreading'));

    // Second call should be ignored
    act(() => {
      result.current.proofread('second call');
    });

    expect(mockProofreader.proofread).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveProofread!({ correctedInput: 'first result', corrections: [] });
    });

    expect(result.current.status).toBe('success');
  });

  it('should handle download progress', async () => {
    mockAvailability.mockResolvedValue('downloading');

    let monitorCallback: ((monitor: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void) | undefined;
    mockProofreaderCreate.mockImplementation(({ monitor }: { monitor?: (m: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void }) => {
      monitorCallback = monitor;
      return new Promise((resolve) => {
          // Delay resolution to simulate download
          setTimeout(() => resolve(mockProofreader), 100);
      });
    });

    const { result } = renderHook(() => useAIProofreader());

    act(() => {
      result.current.proofread('original text');
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
    renderHook(() => useAIProofreader({ warmup: true }));
    await waitFor(() => expect(mockProofreaderCreate).toHaveBeenCalled());
  });

  it('should work without options parameter', () => {
    const { result } = renderHook(() => useAIProofreader());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should pass expectedInputLanguages option to Proofreader.create', async () => {
    const { result } = renderHook(() => useAIProofreader({ expectedInputLanguages: ['en', 'es'] }));

    await act(async () => {
      await result.current.proofread('original text');
    });

    expect(mockProofreaderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedInputLanguages: ['en', 'es'],
      })
    );
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useAIProofreader());

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
    expect(result.current.corrections).toEqual([]);
    expect(result.current.error).toBe(null);
    expect(result.current.progress).toBe(null);
  });

  it('should handle AbortError by resetting to idle', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    mockProofreader.proofread.mockRejectedValue(abortError);

    const { result } = renderHook(() => useAIProofreader());

    await act(async () => {
      await result.current.proofread('original text');
    });

    expect(result.current.status).toBe('idle');
  });
});
