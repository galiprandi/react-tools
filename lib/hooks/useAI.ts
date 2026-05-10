import { useState, useEffect } from 'react';

/**
 * Represents the availability state of the AI Summarizer API.
 */
export type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

/**
 * Represents the status of the AI availability check.
 */
export type AIAvailabilityStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Result object returned by the useAI hook.
 */
export interface UseAIResult {
  /** Whether the AI Summarizer API is available */
  isAvailable: boolean;
  /** The availability state of the API */
  availability: Availability;
  /** The current status of the availability check */
  status: AIAvailabilityStatus;
  /** Error object if the check failed */
  error: Error | null;
}

/**
 * Hook for checking the availability of the browser's AI Summarizer API.
 *
 * This hook automatically checks if the Chrome native Summarizer API is available
 * and provides real-time status updates. It's useful for feature detection before
 * attempting to use AI summarization features.
 *
 * @example
 * ```tsx
 * const { isAvailable, availability, status, error } = useAI();
 *
 * if (status === 'loading') return <p>Checking AI availability...</p>;
 * if (!isAvailable) return <p>AI not available in this browser</p>;
 * return <AISummarizerComponent />;
 * ```
 *
 * @returns An object containing availability information and status
 */
export function useAI(): UseAIResult {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [availability, setAvailability] = useState<Availability>('unavailable');
  const [status, setStatus] = useState<AIAvailabilityStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      setStatus('loading');
      
      try {
        // Chrome native API: Summarizer is a global constructor
        if (typeof window !== 'undefined' && typeof (window as unknown as { Summarizer?: unknown }).Summarizer === 'function') {
          const Summarizer = (window as unknown as { Summarizer: { availability?: () => Promise<Availability>; create?: (options?: unknown) => Promise<unknown> } }).Summarizer;
          
          if (typeof Summarizer.availability === 'function') {
            const avail = await Summarizer.availability();
            setAvailability(avail);
            setIsAvailable(avail === 'available');
          } else {
            setAvailability('available');
            setIsAvailable(true);
          }
        } else {
          setAvailability('unavailable');
          setIsAvailable(false);
        }
        setStatus('ready');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to check AI availability'));
        setStatus('error');
      }
    };

    checkAvailability();
  }, []);

  return { isAvailable, availability, status, error };
}
