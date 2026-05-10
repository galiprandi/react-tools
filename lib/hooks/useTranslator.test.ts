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
    expect(result.current.resolvedTargetLanguage).toBe('en');
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es' }));
    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBe('');
  });

  it('should translate text successfully', async () => {
    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es' }));

    await act(async () => {
      await result.current.translate('Hello world');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('Hola mundo');
  });

  it('should auto-translate when text is provided', async () => {
    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es', text: 'Hello world' }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toBe('Hola mundo');
  });

  it('should use user language when targetLanguage is user', async () => {
    const { getUserLanguage } = await import('../utilities/userLanguage');
    vi.mocked(getUserLanguage).mockReturnValue('es');

    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'user' }));

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

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'en' }));

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

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es' }));

    await act(async () => {
      await result.current.translate('Hello world');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
  });

  it('should reset state', async () => {
    mockTranslator.translate.mockResolvedValue('Hola mundo');

    const { result } = renderHook(() => useTranslator({ sourceLanguage: 'en', targetLanguage: 'es' }));

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
    expect(result.current.detectedSourceLanguage).toBeUndefined();
    expect(result.current.resolvedTargetLanguage).toBeUndefined();
  });
});
