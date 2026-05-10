import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLanguageDetection } from './useLanguageDetection';

describe('useLanguageDetection', () => {
  const mockDetector = {
    detect: vi.fn(),
    destroy: vi.fn(),
  };

  const mockDetectorCreate = vi.fn();
  const mockAvailability = vi.fn();

  beforeEach(() => {
    vi.mock('../utilities/userLanguage', () => ({
      getUserLanguage: vi.fn(() => 'en'),
    }));

    const LanguageDetectorConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockDetectorCreate };
    LanguageDetectorConstructor.availability = mockAvailability;
    LanguageDetectorConstructor.create = mockDetectorCreate;
    
    vi.stubGlobal('LanguageDetector', LanguageDetectorConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { LanguageDetector?: unknown }).LanguageDetector = (global as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }
    mockAvailability.mockResolvedValue('readily');
    mockDetectorCreate.mockResolvedValue(mockDetector);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      delete (window as unknown as { LanguageDetector?: unknown }).LanguageDetector;
    }
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useLanguageDetection());
    expect(result.current.status).toBe('idle');
    expect(result.current.allLangs).toEqual([]);
    expect(result.current.userLang).toBe('en');
    expect(result.current.isUserLang).toBe(false);
  });


  it('should auto-detect when text is provided', async () => {
    mockDetector.detect.mockResolvedValue([{ lang: 'en', confidence: 0.99 }]);
    const { result } = renderHook(() => useLanguageDetection({ text: 'Hello world' }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.lang).toBe('en');
    expect(result.current.confidence).toBe(0.99);
    expect(result.current.allLangs).toEqual([{ lang: 'en', confidence: 0.99 }]);
  });

  it('should handle errors', async () => {
    const error = new Error('Detection failed');
    mockDetector.detect.mockRejectedValue(error);

    const { result } = renderHook(() => useLanguageDetection({ text: 'Hello world' }));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(error);
  });

  it('should calculate isUserLang correctly when languages match', async () => {
    const { getUserLanguage } = await import('../utilities/userLanguage');
    vi.mocked(getUserLanguage).mockReturnValue('en');

    mockDetector.detect.mockResolvedValue([{ lang: 'en', confidence: 0.99 }]);
    const { result } = renderHook(() => useLanguageDetection({ text: 'Hello world' }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.isUserLang).toBe(true);
  });

  it('should calculate isUserLang as false when languages differ', async () => {
    const { getUserLanguage } = await import('../utilities/userLanguage');
    vi.mocked(getUserLanguage).mockReturnValue('es');

    mockDetector.detect.mockResolvedValue([{ lang: 'en', confidence: 0.99 }]);
    const { result } = renderHook(() => useLanguageDetection({ text: 'Hello world' }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.isUserLang).toBe(false);
  });

  it('should limit by maxResults', async () => {
    mockDetector.detect.mockResolvedValue([
      { lang: 'en', confidence: 0.99 },
      { lang: 'es', confidence: 0.8 },
      { lang: 'fr', confidence: 0.7 }
    ]);
    const { result } = renderHook(() => useLanguageDetection({ text: 'Hello world', maxResults: 2 }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.allLangs).toEqual([
      { lang: 'en', confidence: 0.99 },
      { lang: 'es', confidence: 0.8 }
    ]);
  });

  it('should reset state', async () => {
    mockDetector.detect.mockResolvedValue([{ lang: 'en', confidence: 0.99 }]);
    const { result } = renderHook(() => useLanguageDetection({ text: 'Hello world' }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.allLangs).toEqual([{ lang: 'en', confidence: 0.99 }]);

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.allLangs).toEqual([]);
    expect(result.current.lang).toBeUndefined();
    expect(result.current.confidence).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBeNull();
  });

  it('should not auto-detect when enable is false', async () => {
    mockDetector.detect.mockResolvedValue([{ lang: 'en', confidence: 0.99 }]);
    const { result } = renderHook(() => useLanguageDetection({ text: 'Hello world', enable: false }));

    expect(result.current.status).toBe('idle');
    expect(mockDetector.detect).not.toHaveBeenCalled();
  });

  it('should filter by minConfidence', async () => {
    mockDetector.detect.mockResolvedValue([
      { lang: 'en', confidence: 0.99 },
      { lang: 'es', confidence: 0.5 },
      { lang: 'fr', confidence: 0.3 }
    ]);
    const { result } = renderHook(() => useLanguageDetection({ text: 'Hello world', minConfidence: 0.6 }));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.allLangs).toEqual([
      { lang: 'en', confidence: 0.99 }
    ]);
  });

  it('should handle empty text', async () => {
    const { result } = renderHook(() => useLanguageDetection({ text: '' }));

    expect(result.current.status).toBe('idle');
    expect(mockDetector.detect).not.toHaveBeenCalled();
  });
});
