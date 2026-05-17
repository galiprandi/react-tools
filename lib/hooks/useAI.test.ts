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

  it('should call onReady callback when API becomes available', async () => {
    const onReadyMock = vi.fn();
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    SummarizerConstructor.availability = mockAvailability;

    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
    }

    renderHook(() => useAI({ onReady: onReadyMock }));

    await waitFor(() => expect(onReadyMock).toHaveBeenCalledWith('summarizer'));
  });

  it('should call onProgress callback during preload', async () => {
    const onProgressMock = vi.fn();
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const mockCreate = vi.fn().mockImplementation((options: { monitor: (m: { addEventListener: (event: string, callback: (e: ProgressEvent) => void) => void }) => void }) => {
      options.monitor({
        addEventListener: (event: string, callback: (e: ProgressEvent) => void) => {
          if (event === 'downloadprogress') {
            callback({ loaded: 50, total: 100 } as ProgressEvent);
          }
        },
      });
      return { destroy: vi.fn() };
    });
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockCreate };
    SummarizerConstructor.availability = mockAvailability;
    SummarizerConstructor.create = mockCreate;

    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
    }

    const { result } = renderHook(() => useAI({ onProgress: onProgressMock }));

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await result.current.preload('summarizer');

    expect(onProgressMock).toHaveBeenCalledWith('summarizer', { loaded: 50, total: 100 });
  });

  it('should preload a specific API', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const mockCreate = vi.fn().mockResolvedValue({ destroy: vi.fn() });
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockCreate };
    SummarizerConstructor.availability = mockAvailability;
    SummarizerConstructor.create = mockCreate;

    vi.stubGlobal('Summarizer', SummarizerConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
    }

    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await result.current.preload('summarizer');

    expect(mockCreate).toHaveBeenCalled();
    expect(result.current.apis.summarizer.availability).toBe('available');
  });

  it('should preload all APIs', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const mockCreate = vi.fn().mockResolvedValue({ destroy: vi.fn() });
    const SummarizerConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockCreate };
    SummarizerConstructor.availability = mockAvailability;
    SummarizerConstructor.create = mockCreate;

    const TranslatorConstructor = function () {} as unknown as { availability: typeof mockAvailability; create: typeof mockCreate };
    TranslatorConstructor.availability = mockAvailability;
    TranslatorConstructor.create = mockCreate;

    vi.stubGlobal('Summarizer', SummarizerConstructor);
    vi.stubGlobal('Translator', TranslatorConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Summarizer?: unknown }).Summarizer = SummarizerConstructor;
      (window as unknown as { Translator?: unknown }).Translator = TranslatorConstructor;
    }

    const { result } = renderHook(() => useAI({ apis: ['summarizer', 'translator'] }));

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await result.current.preloadAll();

    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('should detect experimental APIs availability', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const PromptAPIConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    PromptAPIConstructor.availability = mockAvailability;

    vi.stubGlobal('PromptAPI', PromptAPIConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { PromptAPI?: unknown }).PromptAPI = PromptAPIConstructor;
    }

    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.prompt.availability).toBe('available');
    expect(result.current.isApiAvailable('prompt')).toBe(true);
  });

  it('should detect Writer experimental API availability', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const WriterConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    WriterConstructor.availability = mockAvailability;

    vi.stubGlobal('Writer', WriterConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Writer?: unknown }).Writer = WriterConstructor;
    }

    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.writer.availability).toBe('available');
    expect(result.current.isApiAvailable('writer')).toBe(true);
  });

  it('should detect Rewriter experimental API availability', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const RewriterConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    RewriterConstructor.availability = mockAvailability;

    vi.stubGlobal('Rewriter', RewriterConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Rewriter?: unknown }).Rewriter = RewriterConstructor;
    }

    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.rewriter.availability).toBe('available');
    expect(result.current.isApiAvailable('rewriter')).toBe(true);
  });

  it('should detect Proofreader experimental API availability', async () => {
    const mockAvailability = vi.fn().mockResolvedValue('available');
    const ProofreaderConstructor = function () {} as unknown as { availability: typeof mockAvailability };
    ProofreaderConstructor.availability = mockAvailability;

    vi.stubGlobal('Proofreader', ProofreaderConstructor);
    if (typeof window !== 'undefined') {
      (window as unknown as { Proofreader?: unknown }).Proofreader = ProofreaderConstructor;
    }

    const { result } = renderHook(() => useAI());

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.apis.proofreader.availability).toBe('available');
    expect(result.current.isApiAvailable('proofreader')).toBe(true);
  });
});
