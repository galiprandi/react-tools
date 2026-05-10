import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';

export interface UseAISummarizeOptions {
  type?: 'tldr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  outputLanguage?: 'en' | 'es' | 'ja';
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  preference?: 'auto' | 'capability';
  streaming?: boolean;
  warmup?: boolean;
}

export type AISummarizeStatus = 'idle' | 'initializing' | 'downloading' | 'summarizing' | 'success' | 'error';

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
 * @param options.outputLanguage - Output language: 'en', 'es', or 'ja' (default: 'en')
 * @param options.expectedInputLanguages - Expected input languages (BCP 47 format)
 * @param options.expectedContextLanguages - Expected context languages (BCP 47 format)
 * @param options.preference - Performance preference: 'auto' or 'capability' (default: 'auto')
 * @param options.streaming - Enable streaming output for real-time results (default: false)
 * @param options.warmup - Preload model on mount for faster first summary (default: false)
 * @returns An object with data, status, progress, error, and functions to summarize or reset
 */
export function useAISummarize(options: UseAISummarizeOptions = {}) {
  const { type, format, length, sharedContext, outputLanguage = 'en', expectedInputLanguages, expectedContextLanguages, preference = 'auto', streaming = false, warmup = false } = options;
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

  const createSummarizer = useCallback(async () => {
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

    const instance = await Summarizer.create({
      type,
      format,
      length,
      sharedContext,
      outputLanguage,
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
        const summarizer = await createSummarizer();
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
    [status, streaming, createSummarizer]
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
