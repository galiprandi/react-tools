import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslator } from './useTranslator';

describe('useTranslator', () => {
  const mockTranslator = {
    translate: vi.fn(),
    translateStreaming: vi.fn(),
    destroy: vi.fn(),
  };

  const mockTranslatorCreate = vi.fn();
  const mockAvailability = vi.fn();

  beforeEach(() => {
    vi.mock('../utilities/userLanguage', () => ({
      getUserLanguage: vi.fn(() => 'en'),
    }));

    const TranslatorConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockTranslatorCreate };
    TranslatorConstructor.availability = mockAvailability;
    TranslatorConstructor.create = mockTranslatorCreate;
    
    vi.stubGlobal('Translator', TranslatorConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Translator?: unknown }).Translator = (global as unknown as { Translator?: unknown }).Translator;
    }
    mockAvailability.mockImplementation(async () => 'readily');
    mockTranslatorCreate.mockResolvedValue(mockTranslator);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      delete (window as unknown as { Translator?: unknown }).Translator;
    }
  });

  it('should initialize with idle status and default options', () => {
    const { result } = renderHook(() => useTranslator());
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es' }));
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should translate text successfully', async () => {
    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', streaming: false, warmup: false }));

    await act(async () => {
      await result.current.translate('Hello world');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('Hola mundo');
  });

  it('should auto-translate when text is provided', async () => {
    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', text: 'Hello world', streaming: false, warmup: false }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toBe('Hola mundo');
  });

  it('should use user language when targetLanguage is user', async () => {
    const { getUserLanguage } = await import('../utilities/userLanguage');
    vi.mocked(getUserLanguage).mockReturnValue('es');

    vi.stubGlobal('navigator', {
      userActivation: { isActive: true },
    });

    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'user', streaming: false, warmup: false }));

    await act(async () => {
      await result.current.translate('Hello world');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.resolvedTargetLanguage).toBe('es');
  });

  it('should not auto-translate when enable is false', async () => {
    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', text: 'Hello world', enable: false }));

    expect(result.current.status).toBe('idle');
    expect(mockTranslator.translate).not.toHaveBeenCalled();
  });

  it('should skip translation when source and target are the same', async () => {
    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'en', streaming: false, warmup: false }));

    await act(async () => {
      await result.current.translate('Hello world');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('Hello world');
    expect(mockTranslator.translate).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Translation failed');
    mockTranslator.translate.mockRejectedValue(error);

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', streaming: false, warmup: false }));

    await act(async () => {
      await result.current.translate('Hello world');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
  });

  it('should reset state', async () => {
    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', streaming: false, warmup: false }));

    await act(async () => {
      await result.current.translate('Hello world');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('Hola mundo');

    mockTranslator.translate.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve('Hola'), 100)));
    act(() => {
      void result.current.translate('Hello world');
    });

    // Wait for the status to change from 'idle'
    await waitFor(() => expect(result.current.status).not.toBe('idle'));

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBeNull();
  });

  it('should handle streaming', async () => {
    const chunks = ['Hola', 'Hola mundo', 'Hola mundo!'];
    const mockStream = {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
    };
    mockTranslator.translateStreaming.mockReturnValue(mockStream);

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', streaming: true }));

    await act(async () => {
      await result.current.translate('Hello world!');
    });

    expect(result.current.data).toBe('Hola mundo!');
    expect(result.current.status).toBe('success');
  });

  it('should respect warmup option', async () => {
    vi.stubGlobal('navigator', {
      userActivation: { isActive: true },
    });
    renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', warmup: true }));
    await waitFor(() => expect(mockTranslatorCreate).toHaveBeenCalled());
  });

  it('should detect source language when sourceLanguage is auto', async () => {
    vi.stubGlobal('navigator', {
      userActivation: { isActive: true },
    });
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

    mockTranslator.translate.mockResolvedValue('Bonjour le monde');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'auto', targetLanguage: 'en' }));

    await act(async () => {
      await result.current.translate('Bonjour le monde');
    });

    expect(result.current.detectedSourceLanguage).toBe('fr');
    expect(mockLanguageDetector.detect).toHaveBeenCalledWith('Bonjour le monde');

    vi.unstubAllGlobals();
    if (typeof window !== 'undefined') {
      delete (window as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }
  });

  it('should handle download progress', async () => {
    mockAvailability.mockResolvedValue('downloading');

    let monitorCallback: ((monitor: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void) | undefined;
    mockTranslatorCreate.mockImplementation(({ monitor }: { monitor?: (m: { addEventListener: (event: string, callback: (e: Event) => void) => void }) => void }) => {
      monitorCallback = monitor;
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockTranslator), 100);
      });
    });

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', text: 'Hello world' }));

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

  it('should handle AbortError by resetting to idle', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    mockTranslator.translate.mockRejectedValue(abortError);

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', streaming: false, warmup: false }));

    await act(async () => {
      await result.current.translate('Hello world');
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('should return early if already in a busy state', async () => {
    mockTranslator.translate.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve('Hola'), 100)));
    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', streaming: false, warmup: false }));

    let firstTranslatePromise: Promise<void> | undefined;
    act(() => {
      firstTranslatePromise = result.current.translate('Hello');
    });

    // Wait for the status to change from 'idle'
    await waitFor(() => expect(result.current.status).not.toBe('idle'));

    const secondTranslatePromise = result.current.translate('World');
    expect(secondTranslatePromise).resolves.toBeUndefined();
    expect(mockTranslator.translate).toHaveBeenCalledTimes(1);

    await act(async () => {
      await firstTranslatePromise;
    });
  });

  it('should call destroy and abort on unmount', async () => {
    mockTranslator.translate.mockResolvedValue('Hola');
    const { result, unmount } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', streaming: false, warmup: false }));

    await act(async () => {
      await result.current.translate('Hello');
    });

    unmount();
    expect(mockTranslator.destroy).toHaveBeenCalled();
  });

  it('should handle LanguageDetector edge cases in resolveLanguages', async () => {
    vi.stubGlobal('navigator', {
      userActivation: { isActive: false },
    });

    const mockLanguageDetector = {
      detect: vi.fn(),
      destroy: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LanguageDetectorConstructor = function () {} as any;
    LanguageDetectorConstructor.availability = vi.fn().mockResolvedValue('readily');
    LanguageDetectorConstructor.create = vi.fn().mockResolvedValue(mockLanguageDetector);
    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'auto', targetLanguage: 'en' }));

    // Case: No user activation
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.detectedSourceLanguage).toBeUndefined(); // Falls back to 'en'

    // Case: availability 'unavailable'
    vi.stubGlobal('navigator', { userActivation: { isActive: true } });
    LanguageDetectorConstructor.availability.mockResolvedValue('unavailable');
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.detectedSourceLanguage).toBeUndefined();

    // Case: No detection results
    LanguageDetectorConstructor.availability.mockResolvedValue('readily');
    mockLanguageDetector.detect.mockResolvedValue([]);
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.detectedSourceLanguage).toBeUndefined();

    // Case: Detected language not supported
    mockLanguageDetector.detect.mockResolvedValue([{ detectedLanguage: 'xyz', confidence: 1.0 }]);
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.detectedSourceLanguage).toBeUndefined();

    // Case: LanguageDetector throwing error
    LanguageDetectorConstructor.availability.mockRejectedValue(new Error('Fail'));
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.detectedSourceLanguage).toBeUndefined();
  });

  it('should fallback to en when user language is not supported', async () => {
    const { getUserLanguage } = await import('../utilities/userLanguage');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getUserLanguage).mockReturnValue('xyz' as any);

    const { result } = renderHook(() => useTranslator({ targetLanguage: 'user', warmup: false }));
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.resolvedTargetLanguage).toBe('en');
  });

  it('should handle security check when Translator is a base constructor', async () => {
    vi.stubGlobal('Translator', Object);
    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', warmup: false }));

    await act(async () => {
      await result.current.translate('Hello');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Translator is not available');
  });

  it('should handle security check when LanguageDetector is a base constructor', async () => {
    vi.stubGlobal('LanguageDetector', Array);
    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'auto', targetLanguage: 'en', warmup: false }));

    await act(async () => {
      await result.current.translate('Hello');
    });

    // Should fallback to 'en' without throwing
    expect(result.current.status).toBe('success');
    expect(result.current.detectedSourceLanguage).toBeUndefined();
  });

  it('should handle missing Translator.availability', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TranslatorConstructor = function () {} as any;
    TranslatorConstructor.create = vi.fn().mockResolvedValue(mockTranslator);
    vi.stubGlobal('Translator', TranslatorConstructor);

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', warmup: false }));
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.status).toBe('success');
  });

  it('should handle availability "unavailable"', async () => {
    mockAvailability.mockResolvedValue('unavailable');
    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', warmup: false }));
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toContain('is not available for');
  });

  it('should handle missing Translator.create', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TranslatorConstructor = function () {} as any;
    TranslatorConstructor.availability = vi.fn().mockResolvedValue('readily');
    vi.stubGlobal('Translator', TranslatorConstructor);

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', warmup: false }));
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Translator.create is not available');
  });

  it('should handle missing LanguageDetector.availability', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LanguageDetectorConstructor = function () {} as any;
    LanguageDetectorConstructor.create = vi.fn().mockResolvedValue({
      detect: vi.fn().mockResolvedValue([{ detectedLanguage: 'fr', confidence: 1.0 }]),
      destroy: vi.fn(),
    });
    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'auto', targetLanguage: 'en', warmup: false }));
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.status).toBe('success');
    expect(result.current.detectedSourceLanguage).toBeUndefined(); // Falls back to 'en' because of missing availability check
  });

  it('should handle missing window.Translator', async () => {
    vi.stubGlobal('Translator', undefined);
    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', warmup: false }));
    await act(async () => {
      await result.current.translate('Hello');
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Translator API not supported in this browser');
  });

  it('should handle non-Error rejection in translate', async () => {
    mockTranslator.translate.mockRejectedValue('String error');
    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', streaming: false, warmup: false }));

    await act(async () => {
      await result.current.translate('Hello');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toBe('Unknown error during translation');
  });

  it('should handle warmup with auto source language', async () => {
    vi.stubGlobal('navigator', { userActivation: { isActive: true } });
    renderHook(() => useTranslator({ sourceLanguage: 'auto', warmup: true }));
    // Wait for resolveLanguages and createTranslator to be called
    await waitFor(() => expect(mockTranslatorCreate).toHaveBeenCalled());
  });

  it('should handle warmup error gracefully', async () => {
    mockAvailability.mockRejectedValue(new Error('Availability failed'));
    renderHook(() => useTranslator({ warmup: true }));
    // Warmup error is swallowed but we wait to ensure it finished
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  it('should call abort on unmount even if no translator is active', () => {
    const { unmount } = renderHook(() => useTranslator({ warmup: false }));
    unmount();
    // No errors should occur
  });
});
