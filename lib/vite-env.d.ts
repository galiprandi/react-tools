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

interface AILanguageModelCapabilities {
  readonly available: AIAvailability;
  readonly defaultTopK?: number;
  readonly maxTopK?: number;
  readonly defaultTemperature?: number;
  readonly maxTemperature?: number;
}

interface AILanguageModelPromptOptions {
  signal?: AbortSignal;
}

interface AILanguageModelInitialPrompt {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AILanguageModelPromptContentPart {
  type: 'text' | 'image' | 'audio';
  value: any;
}

interface AILanguageModelPrompt {
  role: 'system' | 'user' | 'assistant';
  content: string | AILanguageModelPromptContentPart[];
  prefix?: boolean;
}

interface AILanguageModelCreateOptions {
  signal?: AbortSignal;
  monitor?: (m: AICreateMonitor) => void;
  initialPrompts?: AILanguageModelInitialPrompt[];
  topK?: number;
  temperature?: number;
  expectedInputs?: { type: string; languages?: string[] }[];
  expectedOutputs?: { type: string; languages?: string[] }[];
}

interface AILanguageModel extends EventTarget {
  prompt(input: string | AILanguageModelPrompt[], options?: AILanguageModelPromptOptions): Promise<string>;
  promptStreaming(input: string | AILanguageModelPrompt[], options?: AILanguageModelPromptOptions): ReadableStream<string>;
  clone(options?: { signal?: AbortSignal }): Promise<AILanguageModel>;
  destroy(): void;
  readonly contextWindow: number;
  readonly contextUsage: number;
}

interface WindowAI {
  readonly summarizer: {
    capabilities(): Promise<AISummarizerCapabilities>;
    create(options?: AISummarizerCreateOptions): Promise<AISummarizer>;
  };
  readonly languageModel: {
    capabilities(): Promise<AILanguageModelCapabilities>;
    availability(options?: any): Promise<AIAvailability>;
    create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
  };
}

interface Window {
  readonly ai: WindowAI;
}
