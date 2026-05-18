import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';

export interface UseAIWriteOptions {
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  outputLanguage?: string;
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  streaming?: boolean;
  warmup?: boolean;
}

export type AIWriteStatus = 'idle' | 'initializing' | 'downloading' | 'writing' | 'success' | 'error';

export interface UseAIWriteReturn {
  data: string;
  status: AIWriteStatus;
  progress: { loaded: number; total: number } | null;
  error: Error | null;
  write: (prompt: string, context?: string) => Promise<void>;
  reset: () => void;
}

// Type definitions for Chrome's Writer API
// These are not yet in TypeScript's lib.dom.d.ts

/**
 * Monitor for tracking Writer creation progress.
 */
interface AICreateMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: Event) => void): void;
}

/**
 * Options for creating a Writer instance.
 */
interface WriterCreateOptions {
  tone?: string;
  format?: string;
  length?: string;
  sharedContext?: string;
  outputLanguage?: string;
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  monitor?(m: AICreateMonitor): void;
}

/**
 * Chrome's Writer interface.
 */
interface AIWriter {
  write(prompt: string, options?: { signal?: AbortSignal; context?: string }): Promise<string>;
  writeStreaming(prompt: string, options?: { signal?: AbortSignal; context?: string }): ReadableStream<string>;
  destroy(): void;
}

/**
 * Hook for using the browser's AI Writer API.
 *
 * This hook provides a React interface to Chrome's native AI Writer API.
 * It handles model initialization, download progress, streaming support, and automatic cleanup on unmount.
 *
 * @param options - Configuration for the writer
 * @param options.tone - Writing tone: 'formal', 'neutral' (default), or 'casual'
 * @param options.format - Output format: 'markdown' (default) or 'plain-text'
 * @param options.length - Length of the output: 'short' (default), 'medium', or 'long'
 * @param options.sharedContext - Shared context for all writing tasks
 * @param options.outputLanguage - Output language (BCP 47 format, e.g., 'en', 'es')
 * @param options.expectedInputLanguages - Expected input languages (BCP 47 format)
 * @param options.expectedContextLanguages - Expected context languages (BCP 47 format)
 * @param options.streaming - Enable streaming output for real-time results (default: false)
 * @param options.warmup - Preload model on mount for faster first write (default: true)
 * @returns An object with data, status, progress, error, and functions to write or reset
 */
export function useAIWrite(options: UseAIWriteOptions = {}): UseAIWriteReturn {
  const { tone, format, length, sharedContext, outputLanguage, expectedInputLanguages, expectedContextLanguages, streaming = false, warmup = true } = options;
  const [data, setData] = useState<string>('');
  const [status, setStatus] = useState<AIWriteStatus>('idle');
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const writerRef = useRef<AIWriter | null>(null);
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

  const createWriter = useCallback(async () => {
    if (writerRef.current) return writerRef.current;

    // Chrome native API: Writer is a global constructor
    if (typeof window === 'undefined' || typeof (window as unknown as { Writer?: unknown }).Writer !== 'function') {
      throw new Error('Writer API not supported in this browser');
    }

    const Writer = (window as unknown as { Writer: { availability?: () => Promise<Availability>; create?: (options: WriterCreateOptions) => Promise<AIWriter> } }).Writer;

    // Check availability
    if (typeof Writer.availability === 'function') {
      const avail = await Writer.availability();
      if (avail === 'unavailable') {
        throw new Error('Writer is not available');
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

    if (typeof Writer.create !== 'function') {
      throw new Error('Writer.create is not available');
    }

    const instance = await Writer.create({
      tone,
      format,
      length,
      sharedContext,
      outputLanguage,
      expectedInputLanguages,
      expectedContextLanguages,
      monitor(m: AICreateMonitor) {
        m.addEventListener('downloadprogress', (e: Event) => {
          const progressEvent = e as ProgressEvent;
          setProgress({ loaded: progressEvent.loaded, total: progressEvent.total });
        });
      },
    });

    writerRef.current = instance;
    return instance;
  }, [tone, format, length, sharedContext, outputLanguage, expectedInputLanguages, expectedContextLanguages]);

  const write = useCallback(
    async (prompt: string, context?: string) => {
      if (status === 'writing' || status === 'initializing' || status === 'downloading') {
        return;
      }

      setError(null);
      setData('');

      try {
        const writer = await createWriter();
        setStatus('writing');

        abortControllerRef.current = new AbortController();

        const options: { signal: AbortSignal; context?: string } = { signal: abortControllerRef.current.signal };
        if (context) {
          options.context = context;
        }

        if (streaming) {
          const stream = writer.writeStreaming(prompt, options);
          // @ts-expect-error - ReadableStream is async iterable in many environments
          for await (const chunk of stream) {
            // The Writer API returns cumulative chunks, replace state to avoid DoS
            setData(chunk);
          }
          setStatus('success');
        } else {
          const result = await writer.write(prompt, options);
          setData(result);
          setStatus('success');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err : new Error('Unknown error during writing'));
        setStatus('error');
      }
    },
    [status, streaming, createWriter]
  );

  useEffect(() => {
    if (warmup) {
      createWriter().then(() => setStatus('idle')).catch((err) => {
        console.error('Failed to warmup writer:', err);
      });
    }

    return () => {
      if (writerRef.current) {
        writerRef.current.destroy();
        writerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [warmup, createWriter]);

  return {
    data,
    status,
    progress,
    error,
    write,
    reset,
  };
}
