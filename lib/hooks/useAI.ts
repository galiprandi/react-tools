import { useState, useEffect } from 'react';

export function useAI() {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [availability, setAvailability] = useState<AIAvailability>('no');
  const [capabilities, setCapabilities] = useState<AISummarizerCapabilities | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkCapabilities = async () => {
      setStatus('loading');
      try {
        if (typeof window !== 'undefined' && window.ai?.summarizer) {
          const caps = await window.ai.summarizer.capabilities();
          setCapabilities(caps);
          setAvailability(caps.available);
          setIsAvailable(caps.available !== 'no');
          setStatus('ready');
        } else {
          setIsAvailable(false);
          setAvailability('no');
          setStatus('ready');
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to check AI capabilities'));
        setStatus('error');
      }
    };

    checkCapabilities();
  }, []);

  return { isAvailable, availability, capabilities, status, error };
}
