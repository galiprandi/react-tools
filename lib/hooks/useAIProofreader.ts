import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';

export interface UseAIProofreaderOptions {
  expectedInputLanguages?: string[];
  warmup?: boolean;
}

export type AIProofreaderStatus = 'idle' | 'initializing' | 'downloading' | 'proofreading' | 'success' | 'error';

export interface ProofreadCorrection {
  startIndex: number;
  endIndex: number;
  type?: string;
  explanation?: string;
}

export interface ProofreadResult {
  correctedInput: string;
  corrections: ProofreadCorrection[];
}

export interface UseAIProofreaderReturn {
  data: string;
  corrections: ProofreadCorrection[];
  status: AIProofreaderStatus;
  progress: { loaded: number; total: number } | null;
  error: Error | null;
  proofread: (text: string) => Promise<void>;
  reset: () => void;
}

// Type definitions for Chrome's Proofreader API
// These are not yet in TypeScript's lib.dom.d.ts

/**
 * Monitor for tracking Proofreader creation progress.
 */
interface AICreateMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: Event) => void): void;
}

/**
 * Options for creating a Proofreader instance.
 */
interface ProofreaderCreateOptions {
  expectedInputLanguages?: string[];
  monitor?(m: AICreateMonitor): void;
}

/**
 * Chrome's Proofreader interface.
 */
interface AIProofreader {
  proofread(text: string, options?: { signal?: AbortSignal }): Promise<ProofreadResult>;
  destroy(): void;
}

/**
 * Hook for using the browser's AI Proofreader API.
 *
 * This hook provides a React interface to Chrome's native AI Proofreader API.
 * It handles model initialization, download progress, and automatic cleanup on unmount.
 *
 * @param options - Configuration for the proofreader
 * @param options.expectedInputLanguages - Expected input languages (BCP 47 format)
 * @param options.warmup - Preload model on mount for faster first proofread (default: true)
 * @returns An object with data, corrections, status, progress, error, and functions to proofread or reset
 */
export function useAIProofreader(options: UseAIProofreaderOptions = {}): UseAIProofreaderReturn {
  const { expectedInputLanguages, warmup = true } = options;
  const [data, setData] = useState<string>('');
  const [corrections, setCorrections] = useState<ProofreadCorrection[]>([]);
  const [status, setStatus] = useState<AIProofreaderStatus>('idle');
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const proofreaderRef = useRef<AIProofreader | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setData('');
    setCorrections([]);
    setStatus('idle');
    setProgress(null);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const createProofreader = useCallback(async () => {
    if (proofreaderRef.current) return proofreaderRef.current;

    // Chrome native API: Proofreader is a global constructor
    if (typeof window === 'undefined' || typeof (window as unknown as { Proofreader?: unknown }).Proofreader !== 'function') {
      throw new Error('Proofreader API not supported in this browser');
    }

    const Proofreader = (window as unknown as { Proofreader: { availability?: () => Promise<Availability>; create?: (options: ProofreaderCreateOptions) => Promise<AIProofreader> } }).Proofreader;

    // Check availability
    if (typeof Proofreader.availability === 'function') {
      const avail = await Proofreader.availability();
      if (avail === 'unavailable') {
        throw new Error('Proofreader is not available');
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

    if (typeof Proofreader.create !== 'function') {
      throw new Error('Proofreader.create is not available');
    }

    const instance = await Proofreader.create({
      expectedInputLanguages,
      monitor(m: AICreateMonitor) {
        m.addEventListener('downloadprogress', (e: Event) => {
          const progressEvent = e as ProgressEvent;
          setProgress({ loaded: progressEvent.loaded, total: progressEvent.total });
        });
      },
    });

    proofreaderRef.current = instance;
    return instance;
  }, [expectedInputLanguages]);

  const proofread = useCallback(
    async (text: string) => {
      if (status === 'proofreading' || status === 'initializing' || status === 'downloading') {
        return;
      }

      setError(null);
      setData('');
      setCorrections([]);

      try {
        const proofreader = await createProofreader();
        setStatus('proofreading');

        abortControllerRef.current = new AbortController();

        const result = await proofreader.proofread(text, { signal: abortControllerRef.current.signal });
        setData(result.correctedInput);
        setCorrections(result.corrections);
        setStatus('success');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err : new Error('Unknown error during proofreading'));
        setStatus('error');
      }
    },
    [status, createProofreader]
  );

  useEffect(() => {
    if (warmup) {
      createProofreader().then(() => setStatus('idle')).catch((err) => {
        console.error('Failed to warmup proofreader:', err);
      });
    }

    return () => {
      if (proofreaderRef.current) {
        proofreaderRef.current.destroy();
        proofreaderRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [warmup, createProofreader]);

  return {
    data,
    corrections,
    status,
    progress,
    error,
    proofread,
    reset,
  };
}
