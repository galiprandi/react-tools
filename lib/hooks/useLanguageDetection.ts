import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';

/**
 * Result object returned by the language detection.
 */
export interface DetectionResult {
  /** The detected language code (BCP 47 format, e.g., 'en', 'es', 'fr') */
  detectedLanguage: string;
  /** Confidence level between 0.0 (lowest) and 1.0 (highest) */
  confidence: number;
}

/**
 * Configuration options for the Language Detection hook.
 */
export interface UseLanguageDetectionOptions {
  /** Preload the model on component mount for faster first detection */
  warmup?: boolean;
}

/**
 * Status of the language detection process.
 */
export type LanguageDetectionStatus = 'idle' | 'initializing' | 'downloading' | 'detecting' | 'success' | 'error';

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
 * Result object returned by the useLanguageDetection hook.
 */
export interface UseLanguageDetectionResult {
  /** Array of detected languages with confidence scores, ranked from most to least likely */
  results: DetectionResult[];
  /** Current status of the detection process */
  status: LanguageDetectionStatus;
  /** Download progress if model is being downloaded */
  progress: DownloadProgress | null;
  /** Error object if detection failed */
  error: Error | null;
  /** Function to detect language from text */
  detect: (text: string) => Promise<void>;
  /** Function to reset the hook state */
  reset: () => void;
}

// Type definitions for Chrome's Language Detection API
// These are not yet in TypeScript's lib.dom.d.ts

/**
 * Monitor for tracking LanguageDetector creation progress.
 */
interface CreateMonitor {
  addEventListener(event: 'downloadprogress', callback: (e: ProgressEvent) => void): void;
}

/**
 * Options for creating a LanguageDetector instance.
 */
interface LanguageDetectorCreateOptions {
  monitor?(m: CreateMonitor): void;
}

/**
 * Chrome's LanguageDetector interface.
 */
interface LanguageDetector {
  detect(text: string): Promise<DetectionResult[]>;
  destroy(): void;
}

/**
 * Hook for using the browser's Language Detection API.
 *
 * This hook provides a React interface to Chrome's native Language Detection API.
 * It handles model initialization, download progress, and automatic cleanup on unmount.
 *
 * @example
 * ```tsx
 * const detector = useLanguageDetection({ warmup: true });
 *
 * await detector.detect('Hello world');
 * console.log(detector.results);
 * // [{ detectedLanguage: 'en', confidence: 0.999 }]
 * ```
 *
 * @param options - Configuration for the detector
 * @returns An object with results, status, progress, error, and functions to detect or reset
 */
export function useLanguageDetection(options: UseLanguageDetectionOptions = {}): UseLanguageDetectionResult {
  const { warmup = false } = options;
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [status, setStatus] = useState<LanguageDetectionStatus>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const detectorRef = useRef<LanguageDetector | null>(null);

  const reset = useCallback(() => {
    setResults([]);
    setStatus('idle');
    setProgress(null);
    setError(null);
  }, []);

  const createDetector = useCallback(async () => {
    if (detectorRef.current) return detectorRef.current;

    // Chrome native API: LanguageDetector is a global constructor
    if (typeof window === 'undefined' || typeof (window as unknown as { LanguageDetector?: unknown }).LanguageDetector !== 'function') {
      throw new Error('LanguageDetector API not supported in this browser');
    }

    const LanguageDetector = (window as unknown as { LanguageDetector: { availability?: () => Promise<Availability>; create?: (options?: LanguageDetectorCreateOptions) => Promise<LanguageDetector> } }).LanguageDetector;

    // Check availability
    if (typeof LanguageDetector.availability === 'function') {
      const avail = await LanguageDetector.availability();
      if (avail === 'unavailable') {
        throw new Error('LanguageDetector is not available');
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

    if (typeof LanguageDetector.create !== 'function') {
      throw new Error('LanguageDetector.create is not available');
    }

    const instance = await LanguageDetector.create({
      monitor(m: CreateMonitor) {
        m.addEventListener('downloadprogress', (e: ProgressEvent) => {
          setProgress({ loaded: e.loaded, total: e.total });
        });
      },
    });

    detectorRef.current = instance;
    return instance;
  }, []);

  const detect = useCallback(
    async (text: string) => {
      if (status === 'detecting' || status === 'initializing' || status === 'downloading') {
        return;
      }

      setError(null);
      setResults([]);

      try {
        const detector = await createDetector();
        setStatus('detecting');

        const detectionResults = await detector.detect(text);
        setResults(detectionResults);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error during language detection'));
        setStatus('error');
      }
    },
    [status, createDetector]
  );

  useEffect(() => {
    if (warmup) {
      createDetector().then(() => setStatus('idle')).catch(() => {});
    }

    return () => {
      if (detectorRef.current) {
        detectorRef.current.destroy();
        detectorRef.current = null;
      }
    };
  }, [warmup, createDetector]);

  return {
    results,
    status,
    progress,
    error,
    detect,
    reset,
  };
}
