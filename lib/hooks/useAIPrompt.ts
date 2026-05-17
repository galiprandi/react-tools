import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Role of a participant in a conversation.
 */
export type AIPromptRole = 'system' | 'user' | 'assistant';

/**
 * Simplified content type for automatic type inference.
 */
export type AIPromptContentSimple = string |
  AudioBuffer | ArrayBufferView | ArrayBuffer | Blob |
  HTMLImageElement | SVGImageElement | HTMLVideoElement |
  HTMLCanvasElement | ImageBitmap | OffscreenCanvas |
  VideoFrame | ImageData;

/**
 * Internal content type for Chrome Prompt API (type + value).
 */
export interface AIPromptContentInternal {
  type: 'text' | 'audio' | 'image';
  value: AIPromptContentSimple;
}

/**
 * Infer content type from value for automatic type detection.
 */
function inferContentType(value: AIPromptContentSimple): 'text' | 'audio' | 'image' {
  if (typeof value === 'string') return 'text';
  
  // Audio types
  if (value instanceof AudioBuffer) return 'audio';
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return 'audio';
  
  // Blob: check MIME type
  if (value instanceof Blob) {
    if (value.type.startsWith('audio/')) return 'audio';
    return 'image'; // fallback for images or blobs without clear type
  }
  
  // Visual elements
  if (value instanceof HTMLImageElement) return 'image';
  if (value instanceof SVGImageElement) return 'image';
  if (value instanceof HTMLVideoElement) return 'image';
  if (value instanceof HTMLCanvasElement) return 'image';
  if (value instanceof ImageBitmap) return 'image';
  if (typeof OffscreenCanvas !== 'undefined' && value instanceof OffscreenCanvas) return 'image';
  if (typeof VideoFrame !== 'undefined' && value instanceof VideoFrame) return 'image';
  if (value instanceof ImageData) return 'image';
  
  return 'text';
}

/**
 * Normalize content to Chrome Prompt API format with automatic type inference.
 */
function normalizeContent(content: AIPromptContentSimple | AIPromptContentSimple[]): AIPromptContentInternal[] {
  const items = Array.isArray(content) ? content : [content];
  return items.map(value => ({
    type: inferContentType(value),
    value
  }));
}

/**
 * A message in a conversation.
 */
export interface AIPromptMessage {
  /** The role of the message sender */
  role: AIPromptRole;
  /** The content of the message (text or multimodal) */
  content: AIPromptContentSimple | AIPromptContentSimple[];
}

/**
 * Options for the useAIPrompt hook.
 */
export interface UseAIPromptOptions {
  /** Initial prompts to provide context to the model */
  initialPrompts?: AIPromptMessage[];
  /** Temperature for sampling (higher is more creative) */
  temperature?: number;
  /** Top-K sampling parameter */
  topK?: number;
  /** Enable streaming output for real-time results */
  streaming?: boolean;
  /** Preload the model on component mount */
  warmup?: boolean;
  /** Expected input types for multimodal support */
  expectedInputs?: { type: 'text' | 'audio' | 'image'; languages?: string[] }[];
  /** Expected output types for multimodal support */
  expectedOutputs?: { type: 'text' | 'audio' | 'image'; languages?: string[] }[];
}

/**
 * Status of the AI prompt process.
 */
export type AIPromptStatus = 'idle' | 'initializing' | 'downloading' | 'prompting' | 'success' | 'error';

/**
 * Result object returned by the useAIPrompt hook.
 */
export interface UseAIPromptResult {
  /** The response data from the AI */
  data: string;
  /** Current status of the prompt process */
  status: AIPromptStatus;
  /** Download progress if model is being downloaded */
  progress: { loaded: number; total: number } | null;
  /** Error object if prompting failed */
  error: Error | null;
  /** Function to send a prompt to the AI */
  prompt: (input: string | AIPromptMessage[]) => Promise<void>;
  /** Function to append contextual messages without generating response */
  append: (messages: AIPromptMessage[]) => Promise<void>;
  /** Function to reset the hook state */
  reset: () => void;
  /** Number of tokens used in the current session */
  contextUsage: number;
  /** Maximum number of tokens allowed in the session */
  contextWindow: number;
}

/**
 * Hook for using the browser's Prompt API (Gemini Nano).
 *
 * This hook provides a React interface to Chrome's native Prompt API.
 * It handles session creation, model download progress, streaming, and cleanup.
 *
 * @example
 * ```tsx
 * const { data, prompt, status } = useAIPrompt({
 *   initialPrompts: [
 *     { role: 'system', content: 'You are a helpful assistant.' }
 *   ]
 * });
 *
 * const handleSend = () => {
 *   prompt('What is the capital of France?');
 * };
 *
 * return (
 *   <div>
 *     <button onClick={handleSend} disabled={status === 'prompting'}>
 *       Send
 *     </button>
 *     {status === 'prompting' && <p>Thinking...</p>}
 *     <p>{data}</p>
 *   </div>
 * );
 * ```
 *
 * @param options - Configuration for the Prompt API session
 * @returns An object with state and functions to interact with the model
 */
export function useAIPrompt(options: UseAIPromptOptions = {}): UseAIPromptResult {
  const { initialPrompts, temperature, topK, streaming = false, warmup = true, expectedInputs, expectedOutputs } = options;
  const [data, setData] = useState<string>('');
  const [status, setStatus] = useState<AIPromptStatus>('idle');
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [contextUsage, setContextUsage] = useState<number>(0);
  const [contextWindow, setContextWindow] = useState<number>(0);

  const sessionRef = useRef<AILanguageModel | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setData('');
    setStatus('idle');
    setProgress(null);
    setError(null);
    setContextUsage(0);
    setContextWindow(0);
    if (sessionRef.current) {
      sessionRef.current.destroy();
      sessionRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const createSession = useCallback(async () => {
    if (sessionRef.current) return sessionRef.current;

    if (typeof window === 'undefined') {
      throw new Error('Prompt API is only available in the browser');
    }

    // Support both window.ai.languageModel and the global LanguageModel
    const ai = (window as any).ai;
    const LanguageModel = (window as any).LanguageModel || ai?.languageModel;

    if (!LanguageModel) {
      throw new Error('Prompt API not supported in this browser');
    }

    // Check availability
    if (typeof LanguageModel.availability === 'function') {
      const avail = await LanguageModel.availability();
      if (avail === 'unavailable') {
        throw new Error('Prompt API is not available');
      }
      if (avail === 'downloading' || avail === 'after-download') {
        setStatus('downloading');
      } else {
        setStatus('initializing');
      }
    }

    // Check user activation (required by Chrome for some AI APIs)
    if (typeof navigator !== 'undefined' && 'userActivation' in navigator && !(navigator as any).userActivation?.isActive) {
      // Note: Some versions might not strictly require this for Prompt API but it's a good practice for built-in AI
    }

    const instance = await LanguageModel.create({
      initialPrompts,
      temperature,
      topK,
      expectedInputs,
      expectedOutputs,
      monitor(m: any) {
        m.addEventListener('downloadprogress', (e: any) => {
          setProgress({ loaded: e.loaded, total: e.total });
        });
      },
    });

    sessionRef.current = instance;
    setContextUsage(instance.contextUsage || 0);
    setContextWindow(instance.contextWindow || 0);

    // Listen for context overflow
    instance.addEventListener?.('contextoverflow', () => {
      console.warn('AI Prompt context window overflowed');
    });

    return instance;
  }, [initialPrompts, temperature, topK]);

  const prompt = useCallback(async (input: string | AIPromptMessage[]) => {
    if (status === 'prompting' || status === 'initializing' || status === 'downloading') {
      return;
    }

    setError(null);
    setData('');

    try {
      const session = await createSession();
      setStatus('prompting');

      abortControllerRef.current = new AbortController();

      // Normalize input to Chrome API format
      const normalizedInput = typeof input === 'string' 
        ? input 
        : input.map(msg => ({
            role: msg.role,
            content: normalizeContent(msg.content)
          }));

      if (streaming) {
        const stream = session.promptStreaming(normalizedInput, { signal: abortControllerRef.current.signal });
        let accumulated = '';
        for await (const chunk of stream) {
          // The Prompt API returns incremental chunks, accumulate them
          accumulated += chunk;
          setData(accumulated);
          setContextUsage(session.contextUsage || 0);
        }
        setStatus('success');
      } else {
        const result = await session.prompt(normalizedInput, { signal: abortControllerRef.current.signal });
        setData(result);
        setContextUsage(session.contextUsage || 0);
        setStatus('success');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err : new Error('Unknown error during prompting'));
      setStatus('error');
    }
  }, [status, streaming, createSession]);

  useEffect(() => {
    if (warmup) {
      createSession().then(() => setStatus('idle')).catch((err) => {
        console.error('Failed to warmup AI Prompt:', err);
      });
    }

    return () => {
      if (sessionRef.current) {
        sessionRef.current.destroy();
        sessionRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [warmup, createSession]);

  const append = useCallback(async (messages: AIPromptMessage[]) => {
    try {
      const session = await createSession();
      const normalizedMessages = messages.map(msg => ({
        role: msg.role,
        content: normalizeContent(msg.content)
      }));
      await session.append(normalizedMessages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error during append'));
      setStatus('error');
    }
  }, [createSession]);

  return {
    data,
    status,
    progress,
    error,
    prompt,
    append,
    reset,
    contextUsage,
    contextWindow,
  };
}
