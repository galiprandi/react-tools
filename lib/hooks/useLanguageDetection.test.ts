import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLanguageDetection } from './useLanguageDetection';

describe('useLanguageDetection', () => {
  const mockDetector = {
    detect: vi.fn(),
    destroy: vi.fn(),
  };

  const mockDetectorCreate = vi.fn();
  const mockAvailability = vi.fn();

  beforeEach(() => {
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
    expect(result.current.results).toEqual([]);
  });

  it('should detect language successfully', async () => {
    const mockResults = [{ detectedLanguage: 'en', confidence: 0.999 }];
    mockDetector.detect.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useLanguageDetection());

    await act(async () => {
      await result.current.detect('Hello world');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.results).toEqual(mockResults);
  });

  it('should handle errors', async () => {
    const error = new Error('Detection failed');
    mockDetector.detect.mockRejectedValue(error);

    const { result } = renderHook(() => useLanguageDetection());

    await act(async () => {
      await result.current.detect('Hello world');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
  });

  it('should reset state', async () => {
    const mockResults = [{ detectedLanguage: 'en', confidence: 0.999 }];
    mockDetector.detect.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useLanguageDetection());

    await act(async () => {
      await result.current.detect('Hello world');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.results).toEqual(mockResults);

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.results).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBeNull();
  });
});
