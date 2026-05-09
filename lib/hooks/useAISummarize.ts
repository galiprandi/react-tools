import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseAISummarizeOptions {
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  streaming?: boolean;
  warmup?: boolean;
}

export type AISummarizeStatus = 'idle' | 'initializing' | 'downloading' | 'summarizing' | 'success' | 'error';

/**
 * Hook for using the browser's AI Summarizer API.
 *
 * @param options - Configuration for the summarizer
 * @returns An object with data, status, progress, error, and functions to summarize or reset.
 */
export function useAISummarize(options: UseAISummarizeOptions = {}) {
  const { type, format, length, sharedContext, streaming = false, warmup = false } = options;
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

    const ai = (typeof window !== 'undefined' && window.ai) || (typeof global !== 'undefined' && (global as any).ai);

    if (!ai?.summarizer) {
      throw new Error('AI API not supported in this browser');
    }

    const caps = await ai.summarizer.capabilities();
    if (caps.available === 'no') {
      throw new Error('Summarizer is not available');
    }

    if (caps.available === 'after-download') {
      setStatus('downloading');
    } else {
      setStatus('initializing');
    }

    const instance = await ai.summarizer.create({
      type,
      format,
      length,
      sharedContext,
      monitor(m) {
        m.onprogress = (e) => {
          setProgress({ loaded: e.loaded, total: e.total });
        };
      },
    });

    summarizerRef.current = instance;
    return instance;
  }, [type, format, length, sharedContext]);

  const summarize = useCallback(
    async (text: string) => {
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
          const stream = summarizer.summarizeStreaming(text, { signal: abortControllerRef.current.signal });
          let fullText = '';
          // @ts-ignore - ReadableStream is async iterable in many environments
          for await (const chunk of stream) {
            fullText = chunk;
            setData(fullText);
          }
          setStatus('success');
        } else {
          const result = await summarizer.summarize(text, { signal: abortControllerRef.current.signal });
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
