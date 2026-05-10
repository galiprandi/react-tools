import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';
import { getUserLanguage } from '../utilities/userLanguage';

/**
 * Result object returned by the language detection.
 */
interface DetectionResult {
  /** The detected language code (BCP 47 format, e.g., 'en', 'es', 'fr') */
  detectedLanguage: string;
  /** Confidence level between 0.0 (lowest) and 1.0 (highest) */
  confidence: number;
}

/**
 * Monitor for tracking LanguageDetector creation progress.
 */
interface CreateMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: ProgressEvent) => void): void;
}

/**
 * Chrome's LanguageDetector interface.
 */
interface LanguageDetector {
  detect(text: string): Promise<DetectionResult[]>;
  destroy(): void;
}

/**
 * Options for creating a LanguageDetector instance.
 */
interface LanguageDetectorCreateOptions {
  monitor?(m: CreateMonitor): void;
}


/**
 * Helper function to detect language from text using Chrome's LanguageDetector API.
 * @param text - Text to detect language from
 * @returns The detected language code (e.g., 'en', 'es', 'ja')
 */
async function detectLanguageFromText(text: string): Promise<string> {
  if (typeof window === 'undefined' || typeof (window as unknown as { LanguageDetector?: unknown }).LanguageDetector !== 'function') {
    return 'en';
  }

  const LanguageDetector = (window as unknown as { LanguageDetector: { availability?: () => Promise<Availability>; create?: (options?: LanguageDetectorCreateOptions) => Promise<LanguageDetector> } }).LanguageDetector;

  // Check availability
  if (typeof LanguageDetector.availability === 'function') {
    const avail = await LanguageDetector.availability();
    if (avail === 'unavailable') {
      return 'en';
    }
  }

  if (typeof LanguageDetector.create !== 'function') {
    return 'en';
  }

  const detector = await LanguageDetector.create();
  const results = await detector.detect(text);
  detector.destroy();

  // Return the most likely language with highest confidence
  if (results.length > 0) {
    const detected = results[0].detectedLanguage.split('-')[0];
    return detected;
  }

  return 'en';
}

export interface UseAISummarizeOptions {
  type?: 'tldr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  outputLanguage?: 'en' | 'es' | 'ja' | 'auto' | 'user';
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  preference?: 'auto' | 'capability';
  streaming?: boolean;
  warmup?: boolean;
}

export type AISummarizeStatus = 'idle' | 'initializing' | 'downloading' | 'summarizing' | 'success' | 'error';

export interface UseAISummarizeReturn {
  data: string;
  status: AISummarizeStatus;
  progress: { loaded: number; total: number } | null;
  error: Error | null;
  summarize: (text: string, context?: string) => Promise<void>;
  reset: () => void;
}

// Type definitions for Chrome's Summarizer API
// These are not yet in TypeScript's lib.dom.d.ts

/**
 * Monitor for tracking Summarizer creation progress.
 */
interface AICreateMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: Event) => void): void;
}

/**
 * Options for creating a Summarizer instance.
 */
interface SummarizerCreateOptions {
  type?: string;
  format?: string;
  length?: string;
  sharedContext?: string;
  outputLanguage?: string;
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  preference?: 'auto' | 'capability';
  monitor?(m: AICreateMonitor): void;
}

/**
 * Chrome's Summarizer interface.
 */
interface AISummarizer {
  summarize(text: string, options?: { signal?: AbortSignal; context?: string }): Promise<string>;
  summarizeStreaming(text: string, options?: { signal?: AbortSignal; context?: string }): ReadableStream<string>;
  destroy(): void;
}

/**
 * Hook for using the browser's AI Summarizer API.
 *
 * This hook provides a React interface to Chrome's native AI Summarizer API.
 * It handles model initialization, download progress, streaming support, and automatic cleanup on unmount.
 *
 * @param options - Configuration for the summarizer
 * @param options.type - Type of summary: 'tldr', 'key-points', 'teaser', or 'headline'
 * @param options.format - Output format: 'plain-text' or 'markdown'
 * @param options.length - Length of the summary: 'short', 'medium', or 'long'
 * @param options.sharedContext - Shared context for all summaries
 * @param options.outputLanguage - Output language: 'en', 'es', 'ja', 'auto' (detect from text, default), or 'user' (browser language)
 * @param options.expectedInputLanguages - Expected input languages (BCP 47 format)
 * @param options.expectedContextLanguages - Expected context languages (BCP 47 format)
 * @param options.preference - Performance preference: 'auto' or 'capability' (default: 'auto')
 * @param options.streaming - Enable streaming output for real-time results (default: false)
 * @param options.warmup - Preload model on mount for faster first summary (default: false)
 * @returns An object with data, status, progress, error, and functions to summarize or reset
 */
export function useAISummarize(options: UseAISummarizeOptions = {}): UseAISummarizeReturn {
  const { type, format, length, sharedContext, outputLanguage = 'auto', expectedInputLanguages, expectedContextLanguages, preference = 'auto', streaming = false, warmup = false } = options;
  const [data, setData] = useState<string>('');
  const [status, setStatus] = useState<AISummarizeStatus>('idle');
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const summarizerRef = useRef<AISummarizer | null>(null);
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

  const createSummarizer = useCallback(async (overrideOutputLanguage?: string) => {
    if (summarizerRef.current) return summarizerRef.current;

    // Chrome native API: Summarizer is a global constructor
    if (typeof window === 'undefined' || typeof (window as unknown as { Summarizer?: unknown }).Summarizer !== 'function') {
      throw new Error('Summarizer API not supported in this browser');
    }

    const Summarizer = (window as unknown as { Summarizer: { availability?: () => Promise<Availability>; create?: (options: SummarizerCreateOptions) => Promise<AISummarizer> } }).Summarizer;

    // Check availability
    if (typeof Summarizer.availability === 'function') {
      const avail = await Summarizer.availability();
      if (avail === 'unavailable') {
        throw new Error('Summarizer is not available');
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

    if (typeof Summarizer.create !== 'function') {
      throw new Error('Summarizer.create is not available');
    }

    const resolvedOutputLanguage = overrideOutputLanguage || outputLanguage;

    const instance = await Summarizer.create({
      type,
      format,
      length,
      sharedContext,
      outputLanguage: resolvedOutputLanguage,
      expectedInputLanguages,
      expectedContextLanguages,
      preference,
      monitor(m: AICreateMonitor) {
        m.addEventListener('downloadprogress', (e: Event) => {
          const progressEvent = e as ProgressEvent;
          setProgress({ loaded: progressEvent.loaded, total: progressEvent.total });
        });
      },
    });

    summarizerRef.current = instance;
    return instance;
  }, [type, format, length, sharedContext, outputLanguage, expectedInputLanguages, expectedContextLanguages, preference]);

  const summarize = useCallback(
    async (text: string, context?: string) => {
      if (status === 'summarizing' || status === 'initializing' || status === 'downloading') {
        return;
      }

      setError(null);
      setData('');

      try {
        // Resolve outputLanguage based on 'auto' or 'user' settings
        let resolvedLanguage: string;
        if (outputLanguage === 'auto') {
          resolvedLanguage = await detectLanguageFromText(text);
        } else if (outputLanguage === 'user') {
          resolvedLanguage = getUserLanguage();
        } else {
          resolvedLanguage = outputLanguage;
        }

        const summarizer = await createSummarizer(resolvedLanguage);
        setStatus('summarizing');

        abortControllerRef.current = new AbortController();

        const options: { signal: AbortSignal; context?: string } = { signal: abortControllerRef.current.signal };
        if (context) {
          options.context = context;
        }

        if (streaming) {
          const stream = summarizer.summarizeStreaming(text, options);
          let fullText = '';
          // @ts-expect-error - ReadableStream is async iterable in many environments
          for await (const chunk of stream) {
            fullText += chunk;
            setData(fullText);
          }
          setStatus('success');
        } else {
          const result = await summarizer.summarize(text, options);
          setData(result);
          setStatus('success');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err : new Error('Unknown error during summarization'));
        setStatus('error');
      }
    },
    [status, streaming, createSummarizer, outputLanguage]
  );

  useEffect(() => {
    if (warmup) {
      createSummarizer().then(() => setStatus('idle')).catch((err) => {
        console.error('Failed to warmup summarizer:', err);
      });
    }

    return () => {
      if (summarizerRef.current) {
        summarizerRef.current.destroy();
        summarizerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [warmup, createSummarizer]);

  return {
    data,
    status,
    progress,
    error,
    summarize,
    reset,
  };
}
