/// <reference types="vite/client" />
/// <reference types="@types/dom-chromium-ai" />

// Legacy type aliases for backward compatibility with existing code
type AIAvailability = Availability;
type AISummarizer = globalThis.Summarizer;
type AISummarizerCreateOptions = globalThis.SummarizerCreateOptions;
type AISummarizerCapabilities = { available: Availability };

interface WindowAI {
  readonly summarizer: {
    capabilities(): Promise<AISummarizerCapabilities>;
    create(options?: AISummarizerCreateOptions): Promise<AISummarizer>;
  };
}

interface Window {
  readonly ai: WindowAI;
  readonly Summarizer?: typeof globalThis.Summarizer;
}
