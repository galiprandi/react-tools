import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Represents the availability state of AI APIs.
 */
export type Availability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

/**
 * Represents the status of the AI availability check.
 */
export type AIAvailabilityStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Supported AI API types.
 */
export type AIApiType = 
  | 'summarizer'
  | 'translator'
  | 'languageDetector'
  | 'prompt' // Experimental
  | 'writer' // Experimental
  | 'rewriter' // Experimental
  | 'proofreader'; // Experimental

/**
 * Status of a specific AI API.
 */
export interface AIApiStatus {
  /** Availability state of the API */
  availability: Availability;
  /** Download progress if model is being downloaded */
  progress?: { loaded: number; total: number };
  /** Error if availability check failed */
  error?: Error;
}

/**
 * Options for the useAI hook.
 */
export interface UseAIOptions {
  /** Specific APIs to check. If not provided, checks all APIs. */
  apis?: AIApiType[];
  /** Callback when an API's download progress updates */
  onProgress?: (api: AIApiType, progress: { loaded: number; total: number }) => void;
  /** Callback when an API becomes ready */
  onReady?: (api: AIApiType) => void;
}

/**
 * Result object returned by the useAI hook.
 */
export interface UseAIResult {
  /** Whether any of the requested APIs are available */
  isAvailable: boolean;
  /** The current status of the availability check */
  status: AIAvailabilityStatus;
  /** Error object if the check failed */
  error: Error | null;
  /** Status of each API */
  apis: Record<AIApiType, AIApiStatus>;
  /** Check if a specific API is available */
  isApiAvailable: (api: AIApiType) => boolean;
  /** Get download progress for a specific API */
  getApiProgress: (api: AIApiType) => { loaded: number; total: number } | null;
  /** Preload a specific API's model */
  preload: (api: AIApiType) => Promise<void>;
  /** Preload all APIs' models */
  preloadAll: () => Promise<void>;
}

/**
 * Hook for checking and managing the availability of browser's AI APIs.
 *
 * This hook provides a centralized way to detect which AI APIs are available,
 * track model download progress, and preload models for faster initial use.
 * Supports current APIs (Summarizer, Translator, LanguageDetector) and
 * experimental APIs (Prompt, Writer, Rewriter, Proofreader).
 *
 * @example
 * ```tsx
 * // Check all APIs
 * const { isAvailable, apis, status } = useAI();
 *
 * // Check specific APIs
 * const { isAvailable, apis, preload } = useAI({ apis: ['translator', 'summarizer'] });
 *
 * // Preload models
 * useEffect(() => {
 *   if (isAvailable) {
 *     preload('translator');
 *   }
 * }, [isAvailable, preload]);
 *
 * // Show download progress
 * if (apis.translator.availability === 'downloading') {
 *   const progress = getApiProgress('translator');
 *   return <LoadingBar {...progress} />;
 * }
 * ```
 *
 * @param options - Configuration for the AI availability check
 * @returns An object containing availability information, status, and preload functions
 */
export function useAI(options: UseAIOptions = {}): UseAIResult {
  const { apis: apisToCheck, onProgress, onReady } = options;
  const [status, setStatus] = useState<AIAvailabilityStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [apiStatuses, setApiStatuses] = useState<Record<AIApiType, AIApiStatus>>({
    summarizer: { availability: 'unavailable' },
    translator: { availability: 'unavailable' },
    languageDetector: { availability: 'unavailable' },
    prompt: { availability: 'unavailable' },
    writer: { availability: 'unavailable' },
    rewriter: { availability: 'unavailable' },
    proofreader: { availability: 'unavailable' },
  });

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const checkApiAvailability = useCallback(async (api: AIApiType): Promise<void> => {
    try {
      if (typeof window === 'undefined') {
        setApiStatuses(prev => ({ ...prev, [api]: { availability: 'unavailable' } }));
        return;
      }

      let apiName: string;
      switch (api) {
        case 'summarizer':
          apiName = 'Summarizer';
          break;
        case 'translator':
          apiName = 'Translator';
          break;
        case 'languageDetector':
          apiName = 'LanguageDetector';
          break;
        case 'prompt':
          apiName = 'PromptAPI';
          break;
        case 'writer':
          apiName = 'Writer';
          break;
        case 'rewriter':
          apiName = 'Rewriter';
          break;
        case 'proofreader':
          apiName = 'Proofreader';
          break;
      }

      const globalApi = (window as unknown as Record<string, { availability?: (...args: unknown[]) => Promise<Availability>; create?: (options?: unknown) => Promise<unknown>; constructor?: { availability?: (...args: unknown[]) => Promise<Availability>; create?: (options?: unknown) => Promise<unknown> } }>)[apiName];

      if (typeof globalApi === 'function' || (typeof globalApi === 'object' && globalApi !== null)) {
        const apiConstructor = typeof globalApi === 'function' ? globalApi : (globalApi as { constructor?: { availability?: (...args: unknown[]) => Promise<Availability>; create?: (options?: unknown) => Promise<unknown> } })?.constructor;
        
        if (typeof apiConstructor?.availability === 'function') {
          let avail: Availability;
          try {
            // Try calling without arguments first
            avail = await apiConstructor.availability();
          } catch (err) {
            // If that fails, the API might require arguments
            setApiStatuses(prev => ({ 
              ...prev, 
              [api]: { 
                availability: 'unavailable',
                error: err instanceof Error ? err : new Error(`${api}.availability() requires arguments or is not supported`)
              } 
            }));
            return;
          }
          setApiStatuses(prev => ({ ...prev, [api]: { availability: avail } }));
          if (avail === 'available' && onReadyRef.current) {
            onReadyRef.current(api);
          }
        } else {
          setApiStatuses(prev => ({ ...prev, [api]: { availability: 'available' } }));
          if (onReadyRef.current) {
            onReadyRef.current(api);
          }
        }
      } else {
        setApiStatuses(prev => ({ ...prev, [api]: { availability: 'unavailable' } }));
      }
    } catch (err) {
      setApiStatuses(prev => ({ 
        ...prev, 
        [api]: { 
          availability: 'unavailable',
          error: err instanceof Error ? err : new Error(`Failed to check ${api} availability`) 
        } 
      }));
    }
  }, []);

  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  const preload = useCallback(async (api: AIApiType): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;

      let apiName: string;
      switch (api) {
        case 'summarizer':
          apiName = 'Summarizer';
          break;
        case 'translator':
          apiName = 'Translator';
          break;
        case 'languageDetector':
          apiName = 'LanguageDetector';
          break;
        case 'prompt':
          apiName = 'PromptAPI';
          break;
        case 'writer':
          apiName = 'Writer';
          break;
        case 'rewriter':
          apiName = 'Rewriter';
          break;
        case 'proofreader':
          apiName = 'Proofreader';
          break;
      }

      const globalApi = (window as unknown as Record<string, { create?: (options?: unknown) => Promise<unknown>; constructor?: { create?: (options?: unknown) => Promise<unknown> } }>)[apiName];
      const apiConstructor = typeof globalApi === 'function' ? globalApi : (globalApi as { constructor?: { create?: (options?: unknown) => Promise<unknown> } })?.constructor;

      if (typeof apiConstructor?.create === 'function') {
        setApiStatuses(prev => ({ ...prev, [api]: { availability: 'downloading' } }));
        
        const instance = await apiConstructor.create({
          monitor(m: { addEventListener: (event: string, callback: (e: ProgressEvent) => void) => void }) {
            m.addEventListener('downloadprogress', (e: ProgressEvent) => {
              const progress = { loaded: e.loaded, total: e.total };
              setApiStatuses(prev => ({ ...prev, [api]: { availability: 'downloading', progress } }));
              if (onProgressRef.current) {
                onProgressRef.current(api, progress);
              }
            });
          },
        });
        
        if (instance && typeof instance === 'object' && 'destroy' in instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
        
        setApiStatuses(prev => ({ ...prev, [api]: { availability: 'available' } }));
        if (onReadyRef.current) {
          onReadyRef.current(api);
        }
      }
    } catch (err) {
      setApiStatuses(prev => ({ 
        ...prev, 
        [api]: { 
          availability: 'unavailable',
          error: err instanceof Error ? err : new Error(`Failed to preload ${api}`) 
        } 
      }));
    }
  }, []);

  const preloadAll = useCallback(async (): Promise<void> => {
    const apisToPreload = apisToCheck || (Object.keys(apiStatuses) as AIApiType[]);
    await Promise.all(apisToPreload.map(api => preload(api)));
  }, [apisToCheck, apiStatuses, preload]);

  const isApiAvailable = useCallback((api: AIApiType): boolean => {
    return apiStatuses[api].availability === 'available';
  }, [apiStatuses]);

  const getApiProgress = useCallback((api: AIApiType): { loaded: number; total: number } | null => {
    return apiStatuses[api].progress || null;
  }, [apiStatuses]);

  useEffect(() => {
    let isMounted = true;
    
    const checkAllApis = async () => {
      if (!isMounted) return;
      
      setStatus('loading');
      setError(null);

      const apis = apisToCheck || (Object.keys(apiStatuses) as AIApiType[]);
      await Promise.all(apis.map(api => checkApiAvailability(api)));

      if (isMounted) {
        setStatus('ready');
      }
    };

    checkAllApis();

    return () => {
      isMounted = false;
    };
  }, [apisToCheck]);

  const allApisAvailable = apisToCheck
    ? apisToCheck.some(api => apiStatuses[api].availability === 'available')
    : ['summarizer', 'translator', 'languageDetector'].some(api => apiStatuses[api as AIApiType].availability === 'available');

  return {
    isAvailable: allApisAvailable,
    status,
    error,
    apis: apiStatuses,
    isApiAvailable,
    getApiProgress,
    preload,
    preloadAll,
  };
}
