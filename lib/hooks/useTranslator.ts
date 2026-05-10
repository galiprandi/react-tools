import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';

/**
 * Supported languages for translation (BCP 47 language codes).
 * Based on Chrome's Translator API implementation.
 */
export type SupportedLanguage =
  | 'ar' | 'bg' | 'bn' | 'cs' | 'da' | 'de' | 'el' | 'en' | 'es' | 'fi' | 'fr'
  | 'hi' | 'hr' | 'hu' | 'id' | 'it' | 'iw' | 'ja' | 'kn' | 'ko' | 'lt' | 'mr' | 'nl'
  | 'no' | 'pl' | 'pt' | 'ro' | 'ru' | 'sk' | 'sl' | 'sv' | 'ta' | 'te' | 'th' | 'tr'
  | 'uk' | 'vi' | 'zh' | 'zh-Hant';

/**
 * Configuration options for the Translator hook.
 */
export interface UseTranslatorOptions {
  /** Source language code (BCP 47 format, e.g., 'en', 'es', 'fr') */
  sourceLanguage: SupportedLanguage;
  /** Target language code (BCP 47 format, e.g., 'en', 'es', 'fr') */
  targetLanguage: SupportedLanguage;
  /** Enable streaming output for real-time results */
  streaming?: boolean;
  /** Preload the model on component mount for faster first translation */
  warmup?: boolean;
}

/**
 * Status of the translation process.
 */
export type TranslationStatus = 'idle' | 'initializing' | 'downloading' | 'translating' | 'success' | 'error';

/**
 * Progress information for model download.
 */
export interface DownloadProgress {
  /** Number of bytes downloaded */
  loaded: number;
  /** Total number of bytes to download */
  total: number;
}

/**
 * Result object returned by the useTranslator hook.
 */
export interface UseTranslatorResult {
  /** The translated text */
  data: string;
  /** Current status of the translation process */
  status: TranslationStatus;
  /** Download progress if model is being downloaded */
  progress: DownloadProgress | null;
  /** Error object if translation failed */
  error: Error | null;
  /** Function to translate text */
  translate: (text: string) => Promise<void>;
  /** Function to reset the hook state */
  reset: () => void;
}

// Type definitions for Chrome's Translator API
// These are not yet in TypeScript's lib.dom.d.ts

/**
 * Monitor for tracking Translator creation progress.
 */
interface CreateMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: ProgressEvent) => void): void;
}

/**
 * Options for creating a Translator instance.
 */
interface TranslatorCreateOptions {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  monitor?(m: CreateMonitor): void;
}

/**
 * Options for availability check.
 */
interface TranslatorAvailabilityOptions {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
}

/**
 * Chrome's Translator interface.
 */
interface Translator {
  translate(text: string, options?: { signal?: AbortSignal }): Promise<string>;
  translateStreaming(text: string, options?: { signal?: AbortSignal }): ReadableStream<string>;
  destroy(): void;
}

/**
 * Hook for using the browser's Translator API.
 *
 * This hook provides a React interface to Chrome's native Translator API.
 * It handles model initialization, download progress, streaming support, and
 * automatic cleanup on unmount.
 *
 * @example
 * ```tsx
 * const translator = useTranslator({
 *   sourceLanguage: 'en',
 *   targetLanguage: 'es',
 *   streaming: true
 * });
 *
 * await translator.translate('Hello world');
 * console.log(translator.data);
 * // 'Hola mundo'
 * ```
 *
 * @param options - Configuration for the translator
 * @returns An object with data, status, progress, error, and functions to translate or reset
 */
export function useTranslator(options: UseTranslatorOptions): UseTranslatorResult {
  const { sourceLanguage, targetLanguage, streaming = false, warmup = false } = options;
  const [data, setData] = useState<string>('');
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const translatorRef = useRef<Translator | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setData('');
    setStatus('idle');
    setProgress(null);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const createTranslator = useCallback(async () => {
    if (translatorRef.current) return translatorRef.current;

    // Chrome native API: Translator is a global constructor
    if (typeof window === 'undefined' || typeof (window as unknown as { Translator?: unknown }).Translator !== 'function') {
      throw new Error('Translator API not supported in this browser');
    }

    const Translator = (window as unknown as { Translator: { availability?: (options: TranslatorAvailabilityOptions) => Promise<Availability>; create?: (options: TranslatorCreateOptions) => Promise<Translator> } }).Translator;

    // Check availability for the specific language pair
    if (typeof Translator.availability === 'function') {
      const avail = await Translator.availability({ sourceLanguage, targetLanguage });
      if (avail === 'unavailable') {
        throw new Error(`Translator is not available for ${sourceLanguage} → ${targetLanguage}`);
      }
      if (avail === 'downloading' || avail === 'downloadable') {
        setStatus('downloading');
      } else {
        setStatus('initializing');
      }
    }

    // Check user activation (required by Chrome)
    if (typeof navigator !== 'undefined' && 'userActivation' in navigator && !(navigator as unknown as { userActivation?: { isActive: boolean } }).userActivation?.isActive) {
      throw new Error('User activation required. Please interact with the page first.');
    }

    if (typeof Translator.create !== 'function') {
      throw new Error('Translator.create is not available');
    }

    const instance = await Translator.create({
      sourceLanguage,
      targetLanguage,
      monitor(m: CreateMonitor) {
        m.addEventListener('downloadprogress', (e: ProgressEvent) => {
          setProgress({ loaded: e.loaded, total: e.total });
        });
      },
    });

    translatorRef.current = instance;
    return instance;
  }, [sourceLanguage, targetLanguage]);

  const translate = useCallback(
    async (text: string) => {
      if (status === 'translating' || status === 'initializing' || status === 'downloading') {
        return;
      }

      setError(null);
      setData('');

      try {
        const translator = await createTranslator();
        setStatus('translating');

        abortControllerRef.current = new AbortController();

        if (streaming) {
          const stream = translator.translateStreaming(text, { signal: abortControllerRef.current.signal });
          let fullText = '';
          // @ts-expect-error - ReadableStream is async iterable in many environments
          for await (const chunk of stream) {
            fullText += chunk;
            setData(fullText);
          }
          setStatus('success');
        } else {
          const result = await translator.translate(text, { signal: abortControllerRef.current.signal });
          setData(result);
          setStatus('success');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err : new Error('Unknown error during translation'));
        setStatus('error');
      }
    },
    [status, streaming, createTranslator]
  );

  useEffect(() => {
    if (warmup) {
      createTranslator().then(() => setStatus('idle')).catch(() => {});
    }

    return () => {
      if (translatorRef.current) {
        translatorRef.current.destroy();
        translatorRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [warmup, createTranslator]);

  return {
    data,
    status,
    progress,
    error,
    translate,
    reset,
  };
}
