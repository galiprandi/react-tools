import { useState, useCallback, useRef, useEffect } from 'react';
import type { Availability } from './useAI';
import { getUserLanguage } from '../utilities/userLanguage';

/**
 * Result object returned by the language detection.
 */
export interface DetectionResult {
  /** The detected language code (BCP 47 format, e.g., 'en', 'es', 'fr') */
  lang: string;
  /** Confidence level between 0.0 (lowest) and 1.0 (highest) */
  confidence: number;
}

/**
 * Configuration options for the Language Detection hook.
 */
export interface UseLanguageDetectionOptions {
  /** Text to detect language from. Re-detects automatically when changed */
  text?: string;
  /** Enable/disable auto-detection (default: true) */
  enable?: boolean;
  /** Preload the model on component mount for faster first detection */
  warmup?: boolean;
  /** Minimum confidence to include in allLangs (default: 0) */
  minConfidence?: number;
  /** Maximum number of results to return in allLangs (default: all) */
  maxResults?: number;
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
  /** The most likely detected language code (e.g., 'en', 'es') */
  lang?: string;
  /** Confidence of the most likely detection */
  confidence?: number;
  /** All detected languages with confidence scores, ranked from most to least likely */
  allLangs: DetectionResult[];
  /** User's browser language code (e.g., 'en', 'es') */
  userLang: string;
  /** Whether the detected language matches the user's browser language */
  isUserLang: boolean;
  /** Current status of the detection process */
  status: LanguageDetectionStatus;
  /** Download progress if model is being downloaded */
  progress: DownloadProgress | null;
  /** Error object if detection failed */
  error: Error | null;
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
 * // Auto-detect from text
 * const { lang, confidence, allLangs, userLang, isUserLang } = useLanguageDetection({
 *   text: 'Hello world'
 * });
 * console.log(lang); // 'en'
 * console.log(confidence); // 0.99
 * console.log(isUserLang); // true if user's browser is also 'en'
 *
 * // With filters
 * const { lang, allLangs } = useLanguageDetection({
 *   text: 'Hello world',
 *   minConfidence: 0.8,
 *   maxResults: 3
 * });
 *
 * // Disabled auto-detection
 * const { status } = useLanguageDetection({
 *   text: 'Hello world',
 *   enable: false
 * });
 * // status: 'idle' (no detection)
 * ```
 *
 * @param options - Configuration for the detector
 * @returns An object with detected language, confidence, all results, user language info, status, progress, error, and reset function
 */
export function useLanguageDetection(options: UseLanguageDetectionOptions = {}): UseLanguageDetectionResult {
  const { text, enable = true, warmup = true, minConfidence = 0, maxResults } = options;
  const [allLangs, setAllLangs] = useState<DetectionResult[]>([]);
  const [status, setStatus] = useState<LanguageDetectionStatus>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const detectorRef = useRef<LanguageDetector | null>(null);
  const userLang = getUserLanguage();

  const reset = useCallback(() => {
    setAllLangs([]);
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

    // Ensure we're not dealing with base constructors
    if (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LanguageDetector === (Object as any) ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LanguageDetector === (Array as any) ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LanguageDetector === (Function as any)
    ) {
      throw new Error('LanguageDetector is not available');
    }

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
    async (textToDetect: string) => {
      if (status === 'detecting' || status === 'initializing' || status === 'downloading') {
        return;
      }

      setError(null);
      setAllLangs([]);

      try {
        const detector = await createDetector();
        setStatus('detecting');

        const detectionResults = await detector.detect(textToDetect);
        
        // Filter by minConfidence
        const filtered = detectionResults.filter(r => r.confidence >= minConfidence);
        
        // Limit by maxResults
        const limited = maxResults ? filtered.slice(0, maxResults) : filtered;
        
        setAllLangs(limited);
        setStatus('success');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('idle');
          return;
        }
        setError(err instanceof Error ? err : new Error('Unknown error during language detection'));
        setStatus('error');
      }
    },
    [status, createDetector, minConfidence, maxResults]
  );

  // Auto-detect when text changes and enable is true
  useEffect(() => {
    if (enable && text && text.trim().length > 0) {
      detect(text);
    }
  }, [text, enable, detect]);

  useEffect(() => {
    if (warmup) {
      createDetector()
        .then(() => setStatus('idle'))
        .catch((err) => {
          console.error('Failed to warmup language detector:', err);
          setStatus('idle');
        });
    }

    return () => {
      if (detectorRef.current) {
        detectorRef.current.destroy();
        detectorRef.current = null;
      }
    };
  }, [warmup, createDetector]);

  // Calculate derived values
  const lang = allLangs[0]?.lang;
  const confidence = allLangs[0]?.confidence;
  const isUserLang = lang === userLang;

  return {
    lang,
    confidence,
    allLangs,
    userLang,
    isUserLang,
    status,
    progress,
    error,
    reset,
  };
}
