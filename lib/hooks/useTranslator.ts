import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';
import { getUserLanguage } from '../utilities/userLanguage';

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
  /** Text to translate. Auto-translates when changed */
  text?: string;
  /** Source language code (BCP 47 format, e.g., 'en', 'es', 'fr'). Use 'auto' to detect from text (default) */
  sourceLanguage?: 'auto' | SupportedLanguage;
  /** Target language code (BCP 47 format, e.g., 'en', 'es', 'fr'). Use 'user' for browser language (default) */
  targetLanguage?: 'user' | SupportedLanguage;
  /** Enable streaming output for real-time results */
  streaming?: boolean;
  /** Preload the model on component mount for faster first translation */
  warmup?: boolean;
  /** Enable/disable auto-translation (default: true) */
  enable?: boolean;
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
  /** Detected source language (when sourceLanguage is 'auto') */
  detectedSourceLanguage?: string;
  /** Resolved target language (when targetLanguage is 'user') */
  resolvedTargetLanguage?: string;
  /** Current status of the translation process */
  status: TranslationStatus;
  /** Download progress if model is being downloaded */
  progress: DownloadProgress | null;
  /** Error object if translation failed */
  error: Error | null;
  /** Function to translate text manually */
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
 * // Auto-detect source language and translate to browser language
 * const { data, detectedSourceLanguage, resolvedTargetLanguage } = useTranslator({
 *   text: 'Hello world, how are you?'
 * });
 * console.log(data); // 'Hola mundo, ¿cómo estás?' (if browser is Spanish)
 * console.log(detectedSourceLanguage); // 'en'
 * console.log(resolvedTargetLanguage); // 'es'
 *
 * // Specify target language only
 * const translator = useTranslator({
 *   text: 'Hello world',
 *   targetLanguage: 'fr'
 * });
 * console.log(translator.data); // 'Bonjour le monde'
 *
 * // Manual translation with streaming
 * const translator = useTranslator({
 *   sourceLanguage: 'en',
 *   targetLanguage: 'es',
 *   streaming: true
 * });
 * await translator.translate('Hello world');
 * console.log(translator.data);
 * // 'Hola mundo'
 * ```
 *
 * **Optimization**: When the detected source language matches the target language,
 * the hook returns the original text without loading the translation model.
 * This is particularly useful for auto-translation scenarios where the text
 * may already be in the user's language.
 *
 * @param options - Configuration for the translator
 * @returns An object with data, detected languages, status, progress, error, and functions to translate or reset
 */
export function useTranslator(options: UseTranslatorOptions = {}): UseTranslatorResult {
  const { text, sourceLanguage = 'auto', targetLanguage = 'user', streaming = false, warmup = false, enable = true } = options;
  const [data, setData] = useState<string>('');
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [detectedSourceLanguage, setDetectedSourceLanguage] = useState<string | undefined>();
  const [resolvedTargetLanguage, setResolvedTargetLanguage] = useState<string | undefined>();

  const translatorRef = useRef<Translator | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to resolve languages
  const resolveLanguages = useCallback(async (textToDetect?: string): Promise<{ source: SupportedLanguage; target: SupportedLanguage }> => {
    let resolvedSource: SupportedLanguage;
    let resolvedTarget: SupportedLanguage;

    // Resolve source language
    if (sourceLanguage === 'auto') {
      if (!textToDetect) {
        // Default to 'en' if no text to detect
        resolvedSource = 'en';
      } else {
        // Try to detect language from text using Chrome's LanguageDetector
        try {
          if (typeof window !== 'undefined' && typeof (window as unknown as { LanguageDetector?: unknown }).LanguageDetector === 'function') {
            const LanguageDetector = (window as unknown as { LanguageDetector: { availability?: () => Promise<Availability>; create?: (options?: { monitor?: (m: { addEventListener: (event: string, callback: (e: ProgressEvent) => void) => void }) => void }) => Promise<{ detect: (text: string) => Promise<{ detectedLanguage: string; confidence: number }[]>; destroy: () => void }> } }).LanguageDetector;
            
            if (typeof LanguageDetector.availability === 'function') {
              const avail = await LanguageDetector.availability();
              if (avail !== 'unavailable' && typeof LanguageDetector.create === 'function') {
                const detector = await LanguageDetector.create();
                const results = await detector.detect(textToDetect);
                detector.destroy();
                
                if (results.length > 0) {
                  const detected = results[0].detectedLanguage.split('-')[0] as SupportedLanguage;
                  // Check if detected language is supported
                  const supportedLanguages: SupportedLanguage[] = ['ar', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'hi', 'hr', 'hu', 'id', 'it', 'iw', 'ja', 'kn', 'ko', 'lt', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'ta', 'te', 'th', 'tr', 'uk', 'vi', 'zh', 'zh-Hant'];
                  if (supportedLanguages.includes(detected)) {
                    resolvedSource = detected;
                    setDetectedSourceLanguage(detected);
                  } else {
                    resolvedSource = 'en';
                  }
                } else {
                  resolvedSource = 'en';
                }
              } else {
                resolvedSource = 'en';
              }
            } else {
              resolvedSource = 'en';
            }
          } else {
            resolvedSource = 'en';
          }
        } catch {
          resolvedSource = 'en';
        }
      }
    } else {
      resolvedSource = sourceLanguage;
    }

    // Resolve target language
    if (targetLanguage === 'user') {
      const userLang = getUserLanguage() as SupportedLanguage;
      const supportedLanguages: SupportedLanguage[] = ['ar', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'hi', 'hr', 'hu', 'id', 'it', 'iw', 'ja', 'kn', 'ko', 'lt', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'ta', 'te', 'th', 'tr', 'uk', 'vi', 'zh', 'zh-Hant'];
      if (supportedLanguages.includes(userLang)) {
        resolvedTarget = userLang;
      } else {
        resolvedTarget = 'en';
      }
      setResolvedTargetLanguage(resolvedTarget);
    } else {
      resolvedTarget = targetLanguage;
      setResolvedTargetLanguage(targetLanguage);
    }

    return { source: resolvedSource, target: resolvedTarget };
  }, [sourceLanguage, targetLanguage]);

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

  const createTranslator = useCallback(async (source: SupportedLanguage, target: SupportedLanguage) => {
    if (translatorRef.current) return translatorRef.current;

    // Chrome native API: Translator is a global constructor
    if (typeof window === 'undefined' || typeof (window as unknown as { Translator?: unknown }).Translator !== 'function') {
      throw new Error('Translator API not supported in this browser');
    }

    const Translator = (window as unknown as { Translator: { availability?: (options: TranslatorAvailabilityOptions) => Promise<Availability>; create?: (options: TranslatorCreateOptions) => Promise<Translator> } }).Translator;

    // Check availability for the specific language pair
    if (typeof Translator.availability === 'function') {
      const avail = await Translator.availability({ sourceLanguage: source, targetLanguage: target });
      if (avail === 'unavailable') {
        throw new Error(`Translator is not available for ${source} → ${target}`);
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
      sourceLanguage: source,
      targetLanguage: target,
      monitor(m: CreateMonitor) {
        m.addEventListener('downloadprogress', (e: ProgressEvent) => {
          setProgress({ loaded: e.loaded, total: e.total });
        });
      },
    });

    translatorRef.current = instance;
    return instance;
  }, []);

  const translate = useCallback(
    async (textToTranslate: string) => {
      const currentStatus = translatorRef.current ? 'translating' : status;
      if (currentStatus === 'translating' || currentStatus === 'initializing' || currentStatus === 'downloading') {
        return;
      }

      setError(null);
      setData('');

      try {
        const { source, target } = await resolveLanguages(textToTranslate);

        // Optimization: if source and target are the same, skip translation
        if (source === target) {
          setData(textToTranslate);
          setStatus('success');
          return;
        }

        const translator = await createTranslator(source, target);
        setStatus('translating');

        abortControllerRef.current = new AbortController();

        if (streaming) {
          const stream = translator.translateStreaming(textToTranslate, { signal: abortControllerRef.current.signal });
          let fullText = '';
          // @ts-expect-error - ReadableStream is async iterable in many environments
          for await (const chunk of stream) {
            fullText += chunk;
            setData(fullText);
          }
          setStatus('success');
        } else {
          const result = await translator.translate(textToTranslate, { signal: abortControllerRef.current.signal });
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
    [streaming, resolveLanguages]
  );

  // Auto-translate when text changes and enable is true
  useEffect(() => {
    if (enable && text && text.trim().length > 0) {
      translate(text);
    }
  }, [text, enable, translate]);

  useEffect(() => {
    if (warmup) {
      resolveLanguages().then(({ source, target }) => {
        createTranslator(source, target).then(() => setStatus('idle')).catch(() => {});
      }).catch(() => {});
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
  }, [warmup, resolveLanguages, createTranslator]);

  return {
    data,
    detectedSourceLanguage,
    resolvedTargetLanguage,
    status,
    progress,
    error,
    translate,
    reset,
  };
}
