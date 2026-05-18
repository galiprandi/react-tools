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
    mockAvailability.mockResolvedValue('readily');
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
    renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', warmup: true }));
    await waitFor(() => expect(mockTranslatorCreate).toHaveBeenCalled());
  });

  it('should detect source language when sourceLanguage is auto', async () => {
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
});
