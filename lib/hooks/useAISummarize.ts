import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';

/**
 * Configuration options for the AI Summarizer hook.
 */
export interface UseAISummarizeOptions {
  /** Type of summary to generate */
  type?: 'tldr' | 'key-points' | 'teaser' | 'headline';
  /** Output format of the summary */
  format?: 'plain-text' | 'markdown';
  /** Length of the summary */
  length?: 'short' | 'medium' | 'long';
  /** Additional context to guide the summarization */
  sharedContext?: string;
  /** Expected input languages */
  expectedInputLanguages?: string[];
  /** Output language */
  outputLanguage?: string;
  /** Expected context languages */
  expectedContextLanguages?: string[];
  /** Preference for execution speed vs capability (auto or capability only - speed not supported in current Chrome versions) */
  preference?: 'auto' | 'capability';
  /** Enable streaming output for real-time results */
  streaming?: boolean;
  /** Preload the model on component mount for faster first summary */
  warmup?: boolean;
}

/**
 * Status of the AI summarization process.
 */
export type AISummarizeStatus = 'idle' | 'initializing' | 'downloading' | 'summarizing' | 'success' | 'error';

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
 * Result object returned by the useAISummarize hook.
 */
export interface UseAISummarizeResult {
  /** The generated summary text */
  data: string;
  /** Current status of the summarization process */
  status: AISummarizeStatus;
  /** Download progress if model is being downloaded */
  progress: DownloadProgress | null;
  /** Error object if summarization failed */
  error: Error | null;
  /** Supported preference values based on browser capabilities */
  supportedPreferences: ('auto' | 'capability')[];
  /** Function to summarize text */
  summarize: (text: string, context?: string) => Promise<void>;
  /** Function to reset the hook state */
  reset: () => void;
}

// Type definitions for Chrome's AI Summarizer API
// These are not yet in TypeScript's lib.dom.d.ts

/**
 * Monitor for tracking Summarizer creation progress.
 */
interface CreateMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: ProgressEvent) => void): void;
}

/**
 * Options for creating a Summarizer instance.
 */
interface SummarizerCreateOptions {
  type?: UseAISummarizeOptions['type'];
  format?: UseAISummarizeOptions['format'];
  length?: UseAISummarizeOptions['length'];
  sharedContext?: UseAISummarizeOptions['sharedContext'];
  expectedInputLanguages?: UseAISummarizeOptions['expectedInputLanguages'];
  outputLanguage?: UseAISummarizeOptions['outputLanguage'];
  expectedContextLanguages?: UseAISummarizeOptions['expectedContextLanguages'];
  preference?: UseAISummarizeOptions['preference'];
  monitor?(m: CreateMonitor): void;
}

/**
 * Chrome's AISummarizer interface.
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
 * It handles model initialization, download progress, streaming support, and
 * automatic cleanup on unmount.
 *
 * @example
 * ```tsx
 * const summarize = useAISummarize({
 *   type: 'tldr',
 *   format: 'markdown',
 *   length: 'short',
 *   streaming: true
 * });
 *
 * await summarize.summarize(longText);
 * console.log(summarize.data);
 * ```
 *
 * @param options - Configuration for the summarizer
 * @returns An object with data, status, progress, error, and functions to summarize or reset
 */
export function useAISummarize(options: UseAISummarizeOptions = {}): UseAISummarizeResult {
  const { type, format, length, sharedContext, expectedInputLanguages, outputLanguage, expectedContextLanguages, preference, streaming = false, warmup = false } = options;
  const [data, setData] = useState<string>('');
  const [status, setStatus] = useState<AISummarizeStatus>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [supportedPreferences, setSupportedPreferences] = useState<('auto' | 'capability')[]>(['auto']);

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

  const createSummarizer = useCallback(async () => {
    if (summarizerRef.current) return summarizerRef.current;

    // Chrome native API: Summarizer is a global constructor
    if (typeof window === 'undefined' || typeof (window as unknown as { Summarizer?: unknown }).Summarizer !== 'function') {
      throw new Error('Summarizer API not supported in this browser');
    }

    const Summarizer = (window as unknown as { Summarizer: { availability?: () => Promise<Availability>; create?: (options?: SummarizerCreateOptions) => Promise<Summarizer> } }).Summarizer;

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
    // Use optional chaining for environments where userActivation might not exist
    if (typeof navigator !== 'undefined' && 'userActivation' in navigator && !(navigator as unknown as { userActivation?: { isActive: boolean } }).userActivation?.isActive) {
      throw new Error('User activation required. Please interact with the page first.');
    }

    if (typeof Summarizer.create !== 'function') {
      throw new Error('Summarizer.create is not available');
    }
    const instance = await Summarizer.create({
      type,
      format,
      length,
      sharedContext,
      expectedInputLanguages,
      outputLanguage,
      expectedContextLanguages,
      preference,
      monitor(m: CreateMonitor) {
        m.addEventListener('downloadprogress', (e: ProgressEvent) => {
          setProgress({ loaded: e.loaded, total: e.total });
        });
      },
    });

    summarizerRef.current = instance;
    return instance;
  }, [type, format, length, sharedContext, expectedInputLanguages, outputLanguage, expectedContextLanguages, preference]);

  const summarize = useCallback(
    async (text: string, context?: string) => {
      if (status === 'summarizing' || status === 'initializing' || status === 'downloading') {
        return;
      }

      setError(null);
      setData('');

      try {
        const summarizer = await createSummarizer();
        setStatus('summarizing');

        abortControllerRef.current = new AbortController();

        if (streaming) {
          const stream = summarizer.summarizeStreaming(text, { signal: abortControllerRef.current.signal, context });
          let fullText = '';
          // @ts-expect-error - ReadableStream is async iterable in many environments
          for await (const chunk of stream) {
            fullText += chunk;
            setData(fullText);
          }
          setStatus('success');
        } else {
          const result = await summarizer.summarize(text, { signal: abortControllerRef.current.signal, context });
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
    [status, streaming, createSummarizer]
  );

  useEffect(() => {
    const detectSupportedPreferences = async () => {
      if (typeof window === 'undefined' || typeof (window as unknown as { Summarizer?: unknown }).Summarizer !== 'function') {
        return;
      }

      const Summarizer = (window as unknown as { Summarizer: { create?: (options?: SummarizerCreateOptions) => Promise<AISummarizer> } }).Summarizer;
      if (typeof Summarizer.create !== 'function') {
        return;
      }

      const preferences: ('auto' | 'capability')[] = [];
      // Note: This list is based on Chrome's official documentation as of 2026.
      // Only 'auto' and 'capability' are supported in current Chrome versions.
      // 'speed' is documented but not yet implemented.
      const preferenceOptions = ['auto', 'capability'] as const;

      for (const pref of preferenceOptions) {
        try {
          const instance = await Summarizer.create({ preference: pref });
          instance.destroy();
          preferences.push(pref);
        } catch (e) {
          // Preference not supported, skip it
        }
      }

      setSupportedPreferences(preferences);
    };

    detectSupportedPreferences();

    if (warmup) {
      createSummarizer().then(() => setStatus('idle')).catch(() => {});
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
    supportedPreferences,
    summarize,
    reset,
  };
}
