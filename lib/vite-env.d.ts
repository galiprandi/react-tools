/// <reference types="vite/client" />

type AIAvailability = 'no' | 'readily' | 'after-download';

interface AISummarizerCapabilities {
  readonly available: AIAvailability;
  // Specific capabilities could be added here if needed, but 'available' is the core one.
}

interface AISummarizerCreateOptions {
  type?: 'tldr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  monitor?: (m: AICreateMonitor) => void;
}

interface AICreateMonitor extends EventTarget {
  onprogress: (event: AICreateMonitorProgressEvent) => void;
}

interface AICreateMonitorProgressEvent extends Event {
  readonly loaded: number;
  readonly total: number;
}

interface AISummarizer {
  summarize(text: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  summarizeStreaming(text: string, options?: { context?: string; signal?: AbortSignal }): ReadableStream<string>;
  destroy(): void;
}

interface WindowAI {
  readonly summarizer: {
    capabilities(): Promise<AISummarizerCapabilities>;
    create(options?: AISummarizerCreateOptions): Promise<AISummarizer>;
  };
}

interface Window {
  readonly ai: WindowAI;
}
