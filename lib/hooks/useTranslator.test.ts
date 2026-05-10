import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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
  });
});
