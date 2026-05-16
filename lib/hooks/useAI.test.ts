import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAI } from './useAI';

describe('useAI', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    if (typeof window !== 'undefined') {
      delete (window as unknown as { Summarizer?: unknown }).Summarizer;
      delete (window as unknown as { Translator?: unknown }).Translator;
      delete (window as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (typeof window !== 'undefined') {
      delete (window as unknown as { Summarizer?: unknown }).Summarizer;
      delete (window as unknown as { Translator?: unknown }).Translator;
      delete (window as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }
  });

  it('should initialize with idle status and all APIs unavailable', () => {
    const { result } = renderHook(() => useAI());
    expect(result.current.status).toBe('loading');
    expect(result.current.apis.summarizer.availability).toBe('unavailable');
    expect(result.current.apis.translator.availability).toBe('unavailable');
    expect(result.current.apis.languageDetector.availability).toBe('unavailable');
  });

  it('should detect Summarizer availability', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    SummarizerConstructor.availability = mockAvailability;
    
    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
    }
    
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.summarizer.availability).toBe('available');
    expect(result.current.isApiAvailable('summarizer')).toBe(true);
  });

  it('should detect Translator availability', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const TranslatorConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    TranslatorConstructor.availability = mockAvailability;
    
    vi.stubGlobal('Translator', TranslatorConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Translator?: unknown }).Translator = TranslatorConstructor;
    }
    
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.translator.availability).toBe('available');
    expect(result.current.isApiAvailable('translator')).toBe(true);
  });

  it('should detect LanguageDetector availability', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const LanguageDetectorConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    LanguageDetectorConstructor.availability = mockAvailability;
    
    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { LanguageDetector?: unknown }).LanguageDetector = LanguageDetectorConstructor;
    }
    
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.languageDetector.availability).toBe('available');
    expect(result.current.isApiAvailable('languageDetector')).toBe(true);
  });

  it('should check only specified APIs', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    SummarizerConstructor.availability = mockAvailability;
    
    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
    }
    
    const { result } = renderHook(() => useAI({ apis: ['summarizer'] }));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.summarizer.availability).toBe('available');
    expect(result.current.isAvailable).toBe(true);
  });

  it('should return false for isAvailable when some APIs are unavailable', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    SummarizerConstructor.availability = mockAvailability;
    
    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
    }
    
    const { result } = renderHook(() => useAI({ apis: ['summarizer', 'translator'] }));

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.summarizer.availability).toBe('available');
    expect(result.current.apis.translator.availability).toBe('unavailable');
    expect(result.current.isAvailable).toBe(false);
  });

  it('should return null progress when not downloading', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    SummarizerConstructor.availability = mockAvailability;
    
    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
    }
    
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.getApiProgress('summarizer')).toBeNull();
  });

  it('should handle errors in availability check', async () => {
    const error = new Error('Test Error');
    const mockAvailability = vi.fn().mockRejectedValue(error);
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    SummarizerConstructor.availability = mockAvailability;
    
    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
    }
    
    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.summarizer.error).toBeDefined();
  });
});
