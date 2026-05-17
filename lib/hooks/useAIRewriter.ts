import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';

export interface UseAIRewriterOptions {
  tone?: 'more-formal' | 'as-is' | 'more-casual';
  format?: 'as-is' | 'markdown' | 'plain-text';
  length?: 'shorter' | 'as-is' | 'longer';
  sharedContext?: string;
  outputLanguage?: string;
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  streaming?: boolean;
  warmup?: boolean;
}

export type AIRewriterStatus = 'idle' | 'initializing' | 'downloading' | 'rewriting' | 'success' | 'error';

export interface UseAIRewriterReturn {
  data: string;
  status: AIRewriterStatus;
  progress: { loaded: number; total: number } | null;
  error: Error | null;
  rewrite: (text: string, context?: string, overrideTone?: 'more-formal' | 'as-is' | 'more-casual') => Promise<void>;
  reset: () => void;
}

// Type definitions for Chrome's Rewriter API
// These are not yet in TypeScript's lib.dom.d.ts

/**
 * Monitor for tracking Rewriter creation progress.
 */
interface AICreateMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: Event) => void): void;
}

/**
 * Options for creating a Rewriter instance.
 */
interface RewriterCreateOptions {
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
 * Chrome's Rewriter interface.
 */
interface AIRewriter {
  rewrite(text: string, options?: { signal?: AbortSignal; context?: string; tone?: string }): Promise<string>;
  rewriteStreaming(text: string, options?: { signal?: AbortSignal; context?: string; tone?: string }): ReadableStream<string>;
  destroy(): void;
}

/**
 * Hook for using the browser's AI Rewriter API.
 *
 * This hook provides a React interface to Chrome's native AI Rewriter API.
 * It handles model initialization, download progress, streaming support, and automatic cleanup on unmount.
 *
 * @param options - Configuration for the rewriter
 * @param options.tone - Writing tone: 'more-formal', 'as-is' (default), or 'more-casual'
 * @param options.format - Output format: 'as-is' (default), 'markdown', or 'plain-text'
 * @param options.length - Length of the output: 'shorter', 'as-is' (default), or 'longer'
 * @param options.sharedContext - Shared context for all rewriting tasks
 * @param options.outputLanguage - Output language (BCP 47 format, e.g., 'en', 'es')
 * @param options.expectedInputLanguages - Expected input languages (BCP 47 format)
 * @param options.expectedContextLanguages - Expected context languages (BCP 47 format)
 * @param options.streaming - Enable streaming output for real-time results (default: false)
 * @param options.warmup - Preload model on mount for faster first rewrite (default: true)
 * @returns An object with data, status, progress, error, and functions to rewrite or reset
 */
export function useAIRewriter(options: UseAIRewriterOptions = {}): UseAIRewriterReturn {
  const { tone, format, length, sharedContext, outputLanguage, expectedInputLanguages, expectedContextLanguages, streaming = false, warmup = true } = options;
  const [data, setData] = useState<string>('');
  const [status, setStatus] = useState<AIRewriterStatus>('idle');
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const rewriterRef = useRef<AIRewriter | null>(null);
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

  const createRewriter = useCallback(async () => {
    if (rewriterRef.current) return rewriterRef.current;

    // Chrome native API: Rewriter is a global constructor
    if (typeof window === 'undefined' || typeof (window as unknown as { Rewriter?: unknown }).Rewriter !== 'function') {
      throw new Error('Rewriter API not supported in this browser');
    }

    const Rewriter = (window as unknown as { Rewriter: { availability?: () => Promise<Availability>; create?: (options: RewriterCreateOptions) => Promise<AIRewriter> } }).Rewriter;

    // Check availability
    if (typeof Rewriter.availability === 'function') {
      const avail = await Rewriter.availability();
      if (avail === 'unavailable') {
        throw new Error('Rewriter is not available');
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

    if (typeof Rewriter.create !== 'function') {
      throw new Error('Rewriter.create is not available');
    }

    const instance = await Rewriter.create({
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

    rewriterRef.current = instance;
    return instance;
  }, [tone, format, length, sharedContext, outputLanguage, expectedInputLanguages, expectedContextLanguages]);

  const rewrite = useCallback(
    async (text: string, context?: string, overrideTone?: 'more-formal' | 'as-is' | 'more-casual') => {
      if (status === 'rewriting' || status === 'initializing' || status === 'downloading') {
        return;
      }

      setError(null);
      setData('');

      try {
        const rewriter = await createRewriter();
        setStatus('rewriting');

        abortControllerRef.current = new AbortController();

        const options: { signal: AbortSignal; context?: string; tone?: string } = { signal: abortControllerRef.current.signal };
        if (context) {
          options.context = context;
        }
        if (overrideTone) {
          options.tone = overrideTone;
        }

        if (streaming) {
          const stream = rewriter.rewriteStreaming(text, options);
          let fullText = '';
          // @ts-expect-error - ReadableStream is async iterable in many environments
          for await (const chunk of stream) {
            fullText += chunk;
            setData(fullText);
          }
          setStatus('success');
        } else {
          const result = await rewriter.rewrite(text, options);
          setData(result);
          setStatus('success');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err : new Error('Unknown error during rewriting'));
        setStatus('error');
      }
    },
    [status, streaming, createRewriter]
  );

  useEffect(() => {
    if (warmup) {
      createRewriter().then(() => setStatus('idle')).catch((err) => {
        console.error('Failed to warmup rewriter:', err);
      });
    }

    return () => {
      if (rewriterRef.current) {
        rewriterRef.current.destroy();
        rewriterRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [warmup, createRewriter]);

  return {
    data,
    status,
    progress,
    error,
    rewrite,
    reset,
  };
}
