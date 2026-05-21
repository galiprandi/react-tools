# @galiprandi/react-tools

> ✨ Simple, composable & accessible utilities for React development.

<div align="center">
  <img src="lib/assets/logo.svg" alt="Logo" width="280" height="160" />
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/@galiprandi/react-tools">
    <img src="https://img.shields.io/npm/dm/%40galiprandi%2Freact-tools?style=for-the-badge&logo=npm&color=CB3837" alt="NPM Downloads"/>
  </a>
  <a href="https://jsr.io/@galiprandi/react-tools">
    <img src="https://img.shields.io/jsr/v/%40galiprandi/react-tools?style=for-the-badge&logo=javascript&color=F7DF1E" alt="JSR Version"/>
  </a>
  <a href="https://github.com/galiprandi/react-tools">
    <img src="https://img.shields.io/github/stars/galiprandi/react-tools?style=for-the-badge&logo=github&color=181717" alt="GitHub Stars"/>
  </a>
</p>


## 🧠 Overview

**@galiprandi/react-tools** is a lightweight, dependency-free utility library for React. It provides reusable components and hooks to simplify development and improve accessibility — no configuration needed.

👉 [Live Playground](https://stackblitz.com/edit/ga-react-tools?file=index.html)

***

## 🚀 Installation

```bash
npm install @galiprandi/react-tools
# or
yarn add @galiprandi/react-tools
# or
pnpm add @galiprandi/react-tools
```

### AI Agent Skill

Install this library as an AI agent skill for Claude Code, Cursor, Windsurf, and other AI coding agents:

```bash
npx skills add https://github.com/galiprandi/skills --skill react-tools
```

This provides comprehensive guidance for using @galiprandi/react-tools with AI agents.

***

## ✨ What's New

**AI Hooks** - New hooks for browser-native AI features using Chrome's AI API:

- **useAI** - Check and manage availability of browser's AI APIs
- **useAISummarize** - Generate text summaries with streaming support
- **useLanguageDetection** - Detect language from text with confidence scores
- **useTranslator** - Translate text between languages with streaming support
- **useAIPrompt** - Generate AI responses using Chrome's Prompt API (Gemini Nano)
- **useAIWrite** - Generate written content with customizable tone and format
- **useAIRewriter** - Rewrite and restructure text with customizable tone, format, and length
- **useAIProofreader** - Check grammar and spelling with highlighted corrections

***

## 📚 Table of Contents

* [Overview](#overview)
* [Installation](#installation)
* [Components](#components)
  * [AsyncBlock](#asyncblock)
  * [Form](#form)
  * [Input](#input)
  * [DateTime](#datetime)
  * [Dialog](#dialog)
  * [Observer](#observer)
  * [LazyRender](#lazyrender)
* [Hooks](#hooks)
  * [useAI](#useai)
  * [useAISummarize](#useaisummarize)
  * [useLanguageDetection](#uselanguagedetection)
  * [useTranslator](#usetranslator)
  * [useAIPrompt](#useaiprompt)
  * [useAIWrite](#useaiwrite)
  * [useAIRewriter](#useairewriter)
  * [useAIProofreader](#useaiproofreader)
  * [useDebounce](#usedebounce)
  * [useThrottle](#usethrottle)
  * [useTimer](#usetimer)
  * [useList](#uselist)
* [Accessibility & Performance](#accessibility--performance)
* [FAQ](#faq)
* [License](#license)


## 📦 Components

### AsyncBlock

**Description**\
Declarative component to render async data with loading, success, and error states. Automatically cancels in-flight requests when dependencies change.

**Example**

```tsx
<AsyncBlock
  promiseFn={() => fetch(`/api/user`).then(res => res.json())}
  pending={<p>Loading...</p>}
  success={(data, reload) => (
    <div>
      <p>Welcome {data.name}</p>
      <button onClick={reload}>Refresh</button>
    </div>
  )}
  error={(err, reload) => (
    <div>
      <p>Error: {(err as Error).message}</p>
      <button onClick={reload}>Retry</button>
    </div>
  )}
  timeOut={5000}
  deps={[userId]}
/>
```

**Props**

| Prop         | Type                                     | Description                             |
|--------------|------------------------------------------|------------------------------------------|
| `promiseFn`  | `(signal?: AbortSignal) => Promise<T>`   | Async function returning a Promise       |
| `pending`    | `ReactNode \| (reload: () => void) => ReactNode` | UI while loading                 |
| `success`    | `(data: T, reload: () => void) => ReactNode` | UI on success                      |
| `error`      | `(err: unknown, reload: () => void) => ReactNode` | UI on error                    |
| `timeOut`    | `number`                                 | Optional timeout in ms                   |
| `deps`       | `any[]`                                  | Dependency list for re-execution         |
| `onSuccess`  | `(data: T) => void`                      | Optional success callback                |
| `onError`    | `(err: unknown) => void`                 | Optional error callback                  |

***

### Form

**Description**\
Enhanced `<form>` element that automatically gathers and returns values on submit.

**Example**

```tsx
<Form<{ username: string }> onSubmitValues={console.log} filterEmptyValues>
  <Input name="username" label="Username" />
  <button type="submit">Submit</button>
</Form>
```

**Props**

| Prop               | Type                           | Description                                 |
|--------------------|--------------------------------|---------------------------------------------|
| `onSubmitValues`   | `(values: T) => void`          | Handles form submission with collected values |
| `filterEmptyValues`| `boolean` *(default: false)*   | Remove empty fields before submission        |

***

### Input

**Description**\
Custom input component supporting transformations, debounce, datalist, and more.

**Example**

```tsx
<Input
  label="Email"
  name="email"
  placeholder="Enter your email"
  transform="onlyEmail"
  onChangeValue={(val) => console.log(val)}
  debounceDelay={500}
/>

// Multiple transforms applied sequentially
<Input
  label="Username"
  transform={['toUpperCase', 'onlyAlphanumeric']}
  onChangeValue={(val) => console.log(val)}
/>
```

**Props**

| Prop                | Type                                | Description                             |
|---------------------|-------------------------------------|------------------------------------------|
| `label`             | `string`                            | Optional label                          |
| `transform`         | `string \| string[]` (`"camelCase"`, `"pascalCase"`, `"kebabCase"`, `"titleCase"`, `"onlyEmail"`...) | Built-in value transforms (single or array for sequential application)         |
| `transformFn`       | `(value: string) => string`         | Custom value transform                   |
| `onChangeValue`     | `(value: string) => void`           | Fires on value change                    |
| `onChangeDebounce`  | `(value: string) => void`           | Fires after debounce                     |
| `debounceDelay`     | `number`                            | Delay in milliseconds                    |
| `datalist`          | `string[]`                          | List of autocomplete suggestions         |

***

### DateTime

**Description**\
A wrapper around `<input type="datetime-local" />` that handles ISO string conversion.

**Example**

```tsx
<DateTime
  label="Appointment"
  isoValue={value}
  onChangeISOValue={setValue}
/>
```

**Props**

| Prop                | Type                              | Description                             |
|---------------------|-----------------------------------|------------------------------------------|
| `isoValue`          | `string`                          | ISO 8601 datetime value                 |
| `onChangeISOValue`  | `(iso: string) => void`           | Callback with ISO string                |
| `...InputProps`     | All `<Input />` props             | Inherits all Input behavior             |

***

### Dialog

**Description**\
Accessible dialog/modal component built on top of the native `<dialog>` element.

**Example**

```tsx
<Dialog
  behavior="modal"
  opener={<button>Open Modal</button>}
  onClose={() => console.log('Closed')}
>
  <p>This is a dialog!</p>
</Dialog>
```

**Props**

| Prop        | Type                          | Description                                |
|-------------|-------------------------------|---------------------------------------------|
| `isOpen`    | `boolean`                     | Controlled open state (optional)           |
| `behavior`  | `'dialog' \| 'modal'`         | Dialog type (default: `'modal'`)           |
| `onOpen`    | `() => void`                  | Triggered on open                          |
| `onClose`   | `() => void`                  | Triggered on close                         |
| `opener`    | `ReactNode`                   | Element to trigger opening                 |
| `children`  | `ReactNode`                   | Content inside the dialog                  |
| `...dialogProps` | All native `<dialog>` props | Inherits all HTML dialog element attributes |

***

### Observer

**Description**\
Tracks whether a child element is visible in the viewport using `IntersectionObserver`. Triggers callbacks when the element appears or disappears from the viewport.

**Example**

```tsx
<Observer
  wrapper="section"
  onAppear={() => console.log('Element appeared')}
  onDisappear={() => console.log('Element disappeared')}
  threshold={0.5}
>
  <div>Watch me appear!</div>
</Observer>
```

**Props**

| Prop          | Type                                       | Description                             |
|---------------|--------------------------------------------|------------------------------------------|
| `wrapper`     | `keyof ReactHTML` (default: `'div'`)       | HTML element to wrap children with        |
| `onAppear`    | `(entry: IntersectionObserverEntry) => void` | Callback when element appears in viewport |
| `onDisappear` | `(entry: IntersectionObserverEntry) => void` | Callback when element disappears from viewport |
| `threshold`   | `number \| number[]`                       | Intersection threshold (0-1)              |
| `root`        | `Element \| null`                           | The element used as the viewport          |
| `rootMargin`  | `string`                                    | Margin around the root                    |

**Note**: This component extends `IntersectionObserverInit`, accepting all standard Intersection Observer options.

***

### LazyRender

**Description**\
Only renders children when they become visible in the viewport. Automatically unmounts children when they disappear to optimize performance.

**Example**

```tsx
<LazyRender
  wrapper="section"
  placeholder={<span>Loading...</span>}
  threshold={0.5}
>
  <img src="/heavy-image.jpg" alt="Lazy" />
</LazyRender>
```

**Props**

| Prop         | Type                      | Description                              |
|--------------|---------------------------|-------------------------------------------|
| `wrapper`     | `keyof ReactHTML` (default: `'div'`) | HTML element to wrap children with        |
| `placeholder`| `ReactNode`               | Rendered before children become visible   |
| `threshold`  | `number \| number[]`      | Intersection threshold (0-1)              |
| `root`        | `Element \| null`         | The element used as the viewport          |
| `rootMargin`  | `string`                  | Margin around the root                    |

**Note**: This component extends `IntersectionObserverInit`, accepting all standard Intersection Observer options.

***

## 🪝 Hooks

### useAI

**Description**\
Hook for checking and managing the availability of browser's AI APIs. This hook provides a centralized way to detect which AI APIs are available, track model download progress, and preload models for faster initial use. Supports current APIs (Summarizer, Translator, LanguageDetector) and experimental APIs (Prompt, Writer, Rewriter, Proofreader).

**Example**

```tsx
import { useAI } from '@galiprandi/react-tools';

function MyComponent() {
  // Check all APIs
  const { isAvailable, apis, status } = useAI();

  // Check specific APIs
  const { isAvailable, apis, preload } = useAI({ apis: ['translator', 'summarizer'] });

  // Preload models
  useEffect(() => {
    if (isAvailable) {
      preload('translator');
    }
  }, [isAvailable, preload]);

  // Show download progress
  if (apis.translator.availability === 'downloading') {
    const progress = apis.translator.progress;
    return <LoadingBar {...progress} />;
  }
}
```

**Options**

| Option      | Type      | Default | Description                                   |
|-------------|-----------|---------|-----------------------------------------------|
| `apis`      | `AIApiType[]` | All APIs | Specific APIs to check. If not provided, checks all APIs |
| `onProgress` | `(api: AIApiType, progress: { loaded: number; total: number }) => void` | - | Callback when an API's download progress updates |
| `onReady`    | `(api: AIApiType) => void` | - | Callback when an API becomes ready |

**Returns**

| Property        | Type                          | Description                                 |
|-----------------|-------------------------------|---------------------------------------------|
| `isAvailable`   | `boolean`                     | Whether any of the requested APIs are available     |
| `status`        | `'idle' \| 'loading' \| 'ready' \| 'error'` | The current status of the availability check |
| `error`         | `Error \| null`               | Error object if the check failed           |
| `apis`          | `Record<AIApiType, AIApiStatus>` | Status of each API                          |
| `isApiAvailable`| `(api: AIApiType) => boolean` | Check if a specific API is available        |
| `getApiProgress`| `(api: AIApiType) => { loaded: number; total: number } \| null` | Get download progress for a specific API   |
| `preload`       | `(api: AIApiType) => Promise<void>` | Preload a specific API's model             |
| `preloadAll`    | `() => Promise<void>`          | Preload all APIs' models                    |

**Supported APIs**

`summarizer`, `translator`, `languageDetector`, `prompt` (Experimental), `writer` (Experimental), `rewriter` (Experimental), `proofreader` (Experimental)

**Note**: This hook requires Chrome's Native AI APIs, which are currently experimental and may not be available in all browsers.

***

### useAISummarize

**Description**\
Hook for using the browser's AI Summarizer API. This hook provides a React interface to Chrome's native AI Summarizer API. It handles model initialization, download progress, streaming support, and automatic cleanup on unmount.

**Example**

```tsx
import { useAISummarize } from '@galiprandi/react-tools';

function MyComponent() {
  const summarize = useAISummarize({
    type: 'tldr',
    format: 'markdown',
    length: 'short',
    outputLanguage: 'en',
    streaming: true
  });

  const handleSummarize = async () => {
    await summarize.summarize(longText, 'End the summary with: Powered by my app');
    console.log(summarize.data);
  };

  return (
    <div>
      <button onClick={handleSummarize}>Summarize</button>
      {summarize.status === 'summarizing' && <p>Summarizing...</p>}
      {summarize.data && <p>{summarize.data}</p>}
    </div>
  );
}
```

**Options**

| Option                    | Type                                          | Default      | Description                                   |
|---------------------------|-----------------------------------------------|--------------|-----------------------------------------------|
| `type`                    | `'tldr' \| 'key-points' \| 'teaser' \| 'headline'` | `undefined`  | Type of summary to generate                   |
| `format`                  | `'plain-text' \| 'markdown'`                  | `undefined`  | Output format of the summary                  |
| `length`                  | `'short' \| 'medium' \| 'long'`               | `undefined`  | Length of the summary                         |
| `sharedContext`           | `string`                                      | `undefined`  | Shared context for all summaries               |
| `expectedInputLanguages`  | `string[]`                                    | `undefined`  | Expected input languages (BCP 47 format)      |
| `outputLanguage`          | `'en' \| 'es' \| 'ja' \| 'auto' \| 'user'`    | `'auto'`     | Output language. Use `'auto'` to detect from text (default), `'user'` for browser language, or specify a language code |
| `expectedContextLanguages`| `string[]`                                    | `undefined`  | Expected context languages (BCP 47 format)    |
| `preference`              | `'auto' \| 'capability'`                       | `'auto'`     | Performance preference (auto or capability)   |
| `streaming`               | `boolean`                                     | `false`      | Enable streaming output for real-time results |
| `warmup`                  | `boolean`                                     | `true`       | Preload model on mount for faster first summary |

**Returns**

| Property              | Type                                        | Description                                                  |
|-----------------------|---------------------------------------------|--------------------------------------------------------------|
| `data`                | `string`                                    | The generated summary text                                  |
| `status`              | `'idle' \| 'initializing' \| 'downloading' \| 'summarizing' \| 'success' \| 'error'` | Current status of the summarization process |
| `progress`            | `{ loaded: number; total: number } \| null` | Download progress if model is being downloaded              |
| `error`               | `Error \| null`                             | Error object if summarization failed                        |
| `supportedPreferences` | `('auto' \| 'capability')[]`                 | Supported preference values based on browser capabilities    |
| `summarize`           | `(text: string, context?: string) => Promise<void>` | Function to summarize text with optional context instruction |
| `reset`               | `() => void`                                | Function to reset the hook state                            |

**Note**: This hook requires Chrome's AI Summarizer API, which is currently experimental and may not be available in all browsers. Use the `useAI` hook to check availability first.

***

### useLanguageDetection

**Description**\
Hook for using the browser's Language Detection API. This hook provides a React interface to Chrome's native Language Detection API. It handles model initialization, download progress, and automatic cleanup on unmount. Returns the most likely detected language, confidence score, all results, and user language comparison.

**Example**

```tsx
import { useLanguageDetection } from '@galiprandi/react-tools';

function MyComponent() {
  const { lang, confidence, allLangs, userLang, isUserLang, status } = useLanguageDetection({
    text: 'Hallo und herzlich willkommen!',
    minConfidence: 0.8
  });

  return (
    <div>
      {status === 'detecting' && <p>Detecting...</p>}
      {lang && (
        <p>
          Detected: {lang} ({Math.round(confidence! * 100)}% confidence)
          {isUserLang && <span> (matches your language)</span>}
        </p>
      )}
      {allLangs.length > 1 && (
        <details>
          <summary>All detected languages</summary>
          <ul>
            {allLangs.map(({ lang, confidence }) => (
              <li key={lang}>{lang}: {Math.round(confidence * 100)}%</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
```

**Options**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string` | - | Text to detect language from. Re-detects automatically when changed |
| `enable` | `boolean` | `true` | Enable/disable auto-detection |
| `warmup` | `boolean` | `true` | Preload model on component mount for faster first detection |
| `minConfidence` | `number` | `0` | Minimum confidence to include in allLangs (0.0 - 1.0) |
| `maxResults` | `number` | - | Maximum number of results to return in allLangs |

**Returns**

| Property | Type | Description |
|----------|------|-------------|
| `lang` | `string \| undefined` | The most likely detected language code (e.g., 'en', 'es') |
| `confidence` | `number \| undefined` | Confidence of the most likely detection (0.0 - 1.0) |
| `allLangs` | `DetectionResult[]` | All detected languages with confidence scores, ranked from most to least likely |
| `userLang` | `string` | User's browser language code (e.g., 'en', 'es') |
| `isUserLang` | `boolean` | Whether the detected language matches the user's browser language |
| `status` | `'idle' \| 'initializing' \| 'downloading' \| 'detecting' \| 'success' \| 'error'` | Current status of the detection process |
| `progress` | `{ loaded: number, total: number } \| null` | Download progress if model is being downloaded |
| `error` | `Error \| null` | Error object if detection failed |
| `reset` | `() => void` | Function to reset the hook state |

**Note**: This hook requires Chrome's Language Detection API, which is currently experimental and may not be available in all browsers.

***

### useTranslator

**Description**\
Hook for using the browser's Translator API. This hook provides a React interface to Chrome's native Translator API. It handles model initialization, download progress, streaming support, and automatic cleanup on unmount. Supports 38+ languages. Automatically detects source language and uses browser language by default. **Optimization**: When the detected source language matches the target language, the hook returns the original text without loading the translation model.

**Example**

```tsx
import { useTranslator } from '@galiprandi/react-tools';

function MyComponent() {
  // Auto-detect source language and translate to browser language
  const { data, detectedSourceLanguage, resolvedTargetLanguage, status } = useTranslator({
    text: 'Hello world, how are you?'
  });

  return (
    <div>
      {status === 'translating' && <p>Translating...</p>}
      {data && (
        <p>
          {data}
          {detectedSourceLanguage && <small> (from {detectedSourceLanguage} to {resolvedTargetLanguage})</small>}
        </p>
      )}
    </div>
  );
}
```

**Options**

| Option          | Type      | Default | Description                                   |
|-----------------|-----------|---------|-----------------------------------------------|
| `text`          | `string`  | - | Text to translate. Auto-translates when changed |
| `sourceLanguage`| `'auto' \| SupportedLanguage` | `'auto'` | Source language code. Use `'auto'` to detect from text automatically |
| `targetLanguage`| `'user' \| SupportedLanguage` | `'user'` | Target language code. Use `'user'` for browser language |
| `streaming`     | `boolean` | `false` | Enable streaming output for real-time results |
| `warmup`        | `boolean` | `true` | Preload model on component mount for faster first translation |
| `enable`        | `boolean` | `true` | Enable/disable auto-translation |

**Returns**

| Property   | Type                                        | Description                                                  |
|------------|---------------------------------------------|--------------------------------------------------------------|
| `data`     | `string`                                    | The translated text                                         |
| `detectedSourceLanguage` | `string \| undefined` | Detected source language (when sourceLanguage is 'auto') |
| `resolvedTargetLanguage` | `string \| undefined` | Resolved target language (when targetLanguage is 'user') |
| `status`   | `'idle' \| 'initializing' \| 'downloading' \| 'translating' \| 'success' \| 'error'` | Current status of the translation process |
| `progress` | `{ loaded: number; total: number } \| null` | Download progress if model is being downloaded              |
| `error`    | `Error \| null`                             | Error object if translation failed                          |
| `translate` | `(text: string) => Promise<void>`           | Function to translate text manually                        |
| `reset`    | `() => void`                                | Function to reset the hook state                            |

**Supported Languages**

`ar`, `bg`, `bn`, `cs`, `da`, `de`, `el`, `en`, `es`, `fi`, `fr`, `hi`, `hr`, `hu`, `id`, `it`, `iw`, `ja`, `kn`, `ko`, `lt`, `mr`, `nl`, `no`, `pl`, `pt`, `ro`, `ru`, `sk`, `sl`, `sv`, `ta`, `te`, `th`, `tr`, `uk`, `vi`, `zh`, `zh-Hant`

**Note**: This hook requires Chrome's Translator API, which is currently experimental and may not be available in all browsers. Use the `useAI` hook to check availability first.

***

### useAIPrompt

**Description**\
Hook for using the browser's Prompt API (Gemini Nano) with multimodal support. This hook provides a React interface to Chrome's native Prompt API with automatic type inference for text, images, and audio. It handles session creation, model download progress, streaming support, context management, and automatic cleanup on unmount. Supports multi-turn conversations with system prompts, custom AI parameters, and multimodal content.

**Example**

```tsx
import { useAIPrompt } from '@galiprandi/react-tools';

function MyComponent() {
  const { data, prompt, append, status, contextUsage, contextWindow } = useAIPrompt({
    initialPrompts: [
      { role: 'system', content: 'You are a helpful assistant.' }
    ],
    expectedInputs: [{ type: 'text' }, { type: 'image' }],
    expectedOutputs: [{ type: 'text' }],
    temperature: 0.7,
    topK: 40,
    streaming: true
  });

  const handleSendWithImage = async (imageBlob: Blob) => {
    await prompt([
      { role: 'user', content: ['Describe this image:', imageBlob] }
    ]);
  };

  const handleSend = async () => {
    await prompt('What is the capital of France?');
  };

  return (
    <div>
      <button onClick={handleSend} disabled={status === 'prompting'}>
        Send
      </button>
      {status === 'prompting' && <p>Thinking...</p>}
      {status === 'downloading' && <p>Downloading model...</p>}
      {data && <p>{data}</p>}
      <small>Context: {contextUsage} / {contextWindow} tokens</small>
    </div>
  );
}
```

**Options**

| Option          | Type                      | Default | Description                                   |
|-----------------|---------------------------|---------|-----------------------------------------------|
| `initialPrompts`| `AIPromptMessage[]`       | -       | Initial prompts to provide context to the model (system/user/assistant roles) |
| `temperature`    | `number`                  | -       | Temperature for sampling (higher is more creative) |
| `topK`          | `number`                  | -       | Top-K sampling parameter                     |
| `streaming`     | `boolean`                 | `false` | Enable streaming output for real-time results |
| `warmup`        | `boolean`                 | `true`  | Preload model on component mount for faster first prompt |
| `expectedInputs` | `{ type: 'text' \| 'image' \| 'audio' }[]` | - | Expected input types for multimodal support (e.g., `[{ type: 'text' }, { type: 'image' }]`) |
| `expectedOutputs`| `{ type: 'text' }[]`       | - | Expected output types (e.g., `[{ type: 'text' }]`) |

**Returns**

| Property        | Type                                        | Description                                                  |
|-----------------|---------------------------------------------|--------------------------------------------------------------|
| `data`          | `string`                                    | The AI response text                                        |
| `status`        | `'idle' \| 'initializing' \| 'downloading' \| 'prompting' \| 'success' \| 'error'` | Current status of the prompt process |
| `progress`      | `{ loaded: number; total: number } \| null` | Download progress if model is being downloaded              |
| `error`         | `Error \| null`                             | Error object if prompting failed                            |
| `prompt`        | `(input: string \| AILanguageModelPrompt[]) => Promise<void>` | Function to send a prompt to the AI (supports text or multimodal content) |
| `append`        | `(input: AILanguageModelPrompt[]) => Promise<void>` | Function to append contextual messages without generating response (useful for preloading images/audio) |
| `reset`         | `() => void`                                | Function to reset the hook state                            |
| `contextUsage`  | `number`                                    | Number of tokens used in the current session                |
| `contextWindow` | `number`                                    | Maximum number of tokens allowed in the session              |

**Multimodal Support:**

The hook supports automatic type inference for:
- **Text**: strings
- **Audio**: AudioBuffer, ArrayBuffer, ArrayBufferView, Blob (audio/*)
- **Images**: HTMLImageElement, SVGImageElement, HTMLVideoElement, HTMLCanvasElement, ImageBitmap, OffscreenCanvas, VideoFrame, Blob (image/*), ImageData

**Important Limitations:**
- **Single content type per prompt**: The Chrome AI model currently has limitations processing multiple content types (e.g., image + audio) simultaneously in a single prompt. Send one type of multimodal content at a time for best results.
- **Model capability**: Multimodal support depends on the specific Chrome AI model version and capabilities available in the browser.

**Note**: This hook requires Chrome's Prompt API (Gemini Nano), which is currently experimental and may not be available in all browsers. Use the `useAI` hook to check availability first.

***

### useAIWrite

**Description**\
Hook for using the browser's Writer API to generate written content with customizable tone and format. This hook provides a React interface to Chrome's native Writer API. It handles model initialization, download progress, streaming support, shared context management, and automatic cleanup on unmount. Perfect for generating emails, blog posts, social media content, and other written materials.

**Example**

```tsx
import { useAIWrite } from '@galiprandi/react-tools';

function MyComponent() {
  const { data, write, status, progress } = useAIWrite({
    tone: 'formal',
    format: 'markdown',
    length: 'medium',
    sharedContext: 'This is for a professional business email',
    streaming: true
  });

  const handleWrite = async () => {
    await write('Write a thank you email to a colleague for their help on the project', 'I want to mention their attention to detail');
  };

  return (
    <div>
      <button onClick={handleWrite} disabled={status === 'writing'}>
        Generate
      </button>
      {status === 'writing' && <p>Writing...</p>}
      {status === 'downloading' && <p>Downloading model...</p>}
      {data && <p>{data}</p>}
    </div>
  );
}
```

**Options**

| Option          | Type                      | Default | Description                                   |
|-----------------|---------------------------|---------|-----------------------------------------------|
| `tone`          | `'formal' \| 'neutral' \| 'casual'` | `'neutral'` | Writing tone: formal (professional), neutral (balanced), casual (friendly) |
| `format`        | `'markdown' \| 'plain-text'` | `'markdown'` | Output format: markdown (formatted) or plain-text |
| `length`        | `'short' \| 'medium' \| 'long'` | `'short'` | Length of the output: short (brief), medium (moderate), long (detailed) |
| `sharedContext` | `string`                  | -       | Shared context for all writing tasks (helps maintain consistency across multiple writes) |
| `outputLanguage`| `string`                  | -       | Output language (BCP 47 format, e.g., 'en', 'es', 'fr') |
| `expectedInputLanguages` | `string[]`      | -       | Expected input languages (BCP 47 format) |
| `expectedContextLanguages` | `string[]` | -       | Expected context languages (BCP 47 format) |
| `streaming`     | `boolean`                 | `false` | Enable streaming output for real-time results |
| `warmup`        | `boolean`                 | `true`  | Preload model on component mount for faster first write |

**Returns**

| Property        | Type                                        | Description                                                  |
|-----------------|---------------------------------------------|--------------------------------------------------------------|
| `data`          | `string`                                    | The generated written content                                |
| `status`        | `'idle' \| 'initializing' \| 'downloading' \| 'writing' \| 'success' \| 'error'` | Current status of the writing process |
| `progress`      | `{ loaded: number; total: number } \| null` | Download progress if model is being downloaded              |
| `error`         | `Error \| null`                             | Error object if writing failed                              |
| `write`         | `(prompt: string, context?: string) => Promise<void>` | Function to generate written content with optional context |
| `reset`         | `() => void`                                | Function to reset the hook state                            |

**Features:**

- **Multiple Tones**: Choose between formal, neutral, or casual writing styles
- **Format Options**: Output in markdown or plain-text
- **Length Control**: Generate short, medium, or long content
- **Shared Context**: Maintain consistency across multiple writing tasks
- **Language Support**: Specify expected input/output languages
- **Streaming**: Real-time content generation for better UX
- **Reusable Writer**: The same writer instance can be used for multiple writes

**Use Cases:**

- Email generation (professional, casual, thank you, follow-up)
- Blog post writing
- Social media content creation
- Document drafting
- Report generation
- Marketing copy

**Note**: This hook requires Chrome's Writer API, which is currently experimental and may not be available in all browsers. Use the `useAI` hook to check availability first.

***

### useAIRewriter

**Description**\
Hook for using the browser's Rewriter API to rewrite and restructure text with customizable tone, format, and length. This hook provides a React interface to Chrome's native Rewriter API. It handles model initialization, download progress, streaming support, shared context management, and automatic cleanup on unmount. Perfect for improving writing style, adjusting tone, condensing or expanding content, and restructuring text for different audiences.

**Example**

```tsx
import { useAIRewriter } from '@galiprandi/react-tools';

function MyComponent() {
  const { data, rewrite, status, progress } = useAIRewriter({
    tone: 'more-formal',
    format: 'markdown',
    length: 'shorter',
    sharedContext: 'This is for a professional business email',
    streaming: true
  });

  const handleRewrite = async () => {
    await rewrite('Hi, I wanted to let you know the project is going well.', 'Make it more professional');
  };

  return (
    <div>
      <button onClick={handleRewrite} disabled={status === 'rewriting'}>
        Rewrite
      </button>
      {status === 'rewriting' && <p>Rewriting...</p>}
      {status === 'downloading' && <p>Downloading model...</p>}
      {data && <p>{data}</p>}
    </div>
  );
}
```

**Options**

| Option          | Type                      | Default | Description                                   |
|-----------------|---------------------------|---------|-----------------------------------------------|
| `tone`          | `'more-formal' \| 'as-is' \| 'more-casual'` | `'as-is'` | Writing tone: more-formal (professional), as-is (balanced), more-casual (friendly) |
| `format`        | `'as-is' \| 'markdown' \| 'plain-text'` | `'as-is'` | Output format: as-is (preserve original), markdown (formatted), plain-text |
| `length`        | `'shorter' \| 'as-is' \| 'longer'` | `'as-is'` | Length of the output: shorter (condense), as-is (preserve), longer (expand) |
| `sharedContext` | `string`                  | -       | Shared context for all rewriting tasks (helps maintain consistency across multiple rewrites) |
| `outputLanguage`| `string`                  | -       | Output language (BCP 47 format, e.g., 'en', 'es', 'fr') |
| `expectedInputLanguages` | `string[]`      | -       | Expected input languages (BCP 47 format) |
| `expectedContextLanguages` | `string[]` | -       | Expected context languages (BCP 47 format) |
| `streaming`     | `boolean`                 | `false` | Enable streaming output for real-time results |
| `warmup`        | `boolean`                 | `true`  | Preload model on component mount for faster first rewrite |

**Returns**

| Property        | Type                                        | Description                                                  |
|-----------------|---------------------------------------------|--------------------------------------------------------------|
| `data`          | `string`                                    | The rewritten text                                         |
| `status`        | `'idle' \| 'initializing' \| 'downloading' \| 'rewriting' \| 'success' \| 'error'` | Current status of the rewriting process |
| `progress`      | `{ loaded: number; total: number } \| null` | Download progress if model is being downloaded              |
| `error`         | `Error \| null`                             | Error object if rewriting failed                            |
| `rewrite`       | `(text: string, context?: string, overrideTone?: 'more-formal' \| 'as-is' \| 'more-casual') => Promise<void>` | Function to rewrite text with optional context and tone override |
| `reset`         | `() => void`                                | Function to reset the hook state                            |

**Features:**

- **Multiple Tones**: Adjust tone to be more formal, keep as-is, or more casual
- **Format Options**: Preserve original format, convert to markdown, or plain-text
- **Length Control**: Condense (shorter), preserve (as-is), or expand (longer) content
- **Shared Context**: Maintain consistency across multiple rewriting tasks
- **Language Support**: Specify expected input/output languages
- **Streaming**: Real-time content generation for better UX
- **Tone Override**: Override global tone setting per rewrite
- **Reusable Rewriter**: The same rewriter instance can be used for multiple rewrites

**Use Cases:**

- Email tone adjustment (make more professional or casual)
- Content condensation (summarize long text)
- Content expansion (add detail and elaboration)
- Style improvement (enhance readability and flow)
- Audience adaptation (rewrite for different audiences)
- Review polishing (improve feedback constructiveness)
- Format conversion (convert to markdown or plain-text)

**Note**: This hook requires Chrome's Rewriter API, which is currently experimental and may not be available in all browsers. Use the `useAI` hook to check availability first.

***

### useAIProofreader

**Description**\
Hook for using the browser's Proofreader API to check grammar and spelling with highlighted corrections. This hook provides a React interface to Chrome's native Proofreader API. It handles model initialization, download progress, and automatic cleanup on unmount. Perfect for text editing, content review, and improving writing quality.

**Example**

```tsx
import { useAIProofreader } from '@galiprandi/react-tools';

function MyComponent() {
  const { data, corrections, proofread, status, progress } = useAIProofreader({
    expectedInputLanguages: ['en'],
  });

  const handleProofread = async () => {
    await proofread('I seen him yesterday at the store.');
  };

  return (
    <div>
      <button onClick={handleProofread} disabled={status === 'proofreading'}>
        Proofread
      </button>
      {status === 'proofreading' && <p>Proofreading...</p>}
      {status === 'downloading' && <p>Downloading model...</p>}
      {data && <p>{data}</p>}
      {corrections.length > 0 && (
        <ul>
          {corrections.map((c, i) => (
            <li key={i}>
              {c.type && <span>Type: {c.type}</span>}
              {c.explanation && <span> - {c.explanation}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Options**

| Option          | Type                      | Default | Description                                   |
|-----------------|---------------------------|---------|-----------------------------------------------|
| `expectedInputLanguages` | `string[]`      | -       | Expected input languages (BCP 47 format, e.g., 'en', 'es') |
| `warmup`        | `boolean`                 | `true`  | Preload model on component mount for faster first proofread |

**Returns**

| Property        | Type                                        | Description                                                  |
|-----------------|---------------------------------------------|--------------------------------------------------------------|
| `data`          | `string`                                    | The corrected text                                         |
| `corrections`   | `ProofreadCorrection[]`                     | Array of corrections with startIndex, endIndex, type, and explanation |
| `status`        | `'idle' \| 'initializing' \| 'downloading' \| 'proofreading' \| 'success' \| 'error'` | Current status of the proofreading process |
| `progress`      | `{ loaded: number; total: number } \| null` | Download progress if model is being downloaded              |
| `error`         | `Error \| null`                             | Error object if proofreading failed                          |
| `proofread`     | `(text: string) => Promise<void>`           | Function to proofread text                                  |
| `reset`         | `() => void`                                | Function to reset the hook state                            |

**ProofreadCorrection:**

- `startIndex`: Start index of the correction in the original text
- `endIndex`: End index of the correction in the original text
- `type`: Type of correction (e.g., 'grammar', 'spelling')
- `explanation`: Explanation of the correction

**Features:**

- **Grammar Checking**: Detect and correct grammatical errors
- **Spelling Correction**: Identify and fix spelling mistakes
- **Detailed Corrections**: Get correction type and explanation for each issue
- **Language Support**: Specify expected input languages for better accuracy
- **Fast Proofreading**: Warmup option for faster first proofread
- **Reusable Proofreader**: The same proofreader instance can be used for multiple checks

**Use Cases:**

- Text editing (grammar and spell checking)
- Content review (improving writing quality)
- Email validation (catching typos before sending)
- Document proofreading (ensuring professional quality)
- Blog post review (improving readability)
- Comment moderation (identifying language issues)

**Note**: This hook requires Chrome's Proofreader API, which is currently experimental and may not be available in all browsers. Use the `useAI` hook to check availability first.

***

### useDebounce

**Description**\
A React hook that returns a debounced version of a value. Useful for search input, filters, etc.

**Example**

```tsx
const debouncedSearch = useDebounce(searchTerm, 500);
```

**Props**

| Parameter     | Type      | Description                               |
|---------------|-----------|-------------------------------------------|
| `value`       | `T`       | Value to debounce                         |
| `delay`       | `number`  | Delay in milliseconds (default: `500`)    |

**Returns**\
Debounced version of the value (`T`).

***

### useThrottle

**Description**\
A React hook that returns a throttled version of a value. Ensures the value updates at most once every specified limit.

**Example**

```tsx
const throttledValue = useThrottle(value, 500);
```

**Props**

| Parameter     | Type      | Description                    |
|---------------|-----------|--------------------------------|
| `value`       | `T`       | Value to throttle              |
| `limit`       | `number`  | Limit in milliseconds          |

**Returns**\
Throttled version of the value (`T`).

***

### useTimer

**Description**
A React hook that abstracts the complexity of managing `setTimeout` and `setInterval` directly in React components. It provides automatic cleanup, lifecycle events, flexible scheduling, and simplified control to prevent memory leaks and unexpected behavior.

**Features**

* **Automatic Cleanup:** Timers are automatically cleared when the component using the hook unmounts, preventing memory leaks.
* **Lifecycle Events:** Receive notifications when a timer is set, cancelled, completes, or reports progress.
* **Flexible Scheduling:** Set timers by milliseconds, a future `Date` object, or as limited intervals.
* **Simplified Control:** Clear any active timer with a single method call.

**Example**

```tsx
import { useEffect } from 'react';
import { useTimer } from '@galiprandi/react-tools';

function FutureExecution({ targetDate }: { targetDate: Date }) {
  const { setTimeoutDate, clearTimer } = useTimer({
    onSetTimer: (id) => console.log(`Timer ID ${id} set for future execution`),
    onTimerComplete: (id) => console.log(`Timer ID ${id} completed!`),
    onCancelTimer: (id) => console.log(`Timer ID ${id} cancelled!`),
    onProgress: (progress) =>
      console.log(`Progress: ${Math.round(progress * 100)}%`),
  });

  useEffect(() => {
    console.log(`Scheduling action for: ${targetDate.toLocaleTimeString()}`);

    setTimeoutDate(() => {
      // Do something here, like a fake fetch request
      console.log("--- Fake fetch executed! ---");
    }, targetDate);

    // ⚠️ Remember to clear the timer when the component unmounts or when the targetDate changes
    return () => {
      console.log('Component unmounting or targetDate change, clearing timer.');
      clearTimer();
    };
  }, [setTimeoutDate, clearTimer, targetDate]);

  return (
    <div>
      <p>Check the console for timer messages.</p>
    </div>
  );
}
```

**Parameters (options)**

| Parameter         | Type                               | Description                                                     |
|-------------------|------------------------------------|-----------------------------------------------------------------|
| `onSetTimer`      | `(timerId: number) => void`        | Callback fired when a new timer is successfully set.            |
| `onCancelTimer`   | `(timerId: number) => void`        | Callback fired when an active timer is cleared/cancelled.       |
| `onTimerComplete` | `(timerId: number) => void`        | Callback fired when a timer completes naturally (timeout) or for each interval execution (interval/limited interval). |
| `onProgress`      | `(progress: number, elapsedMs: number, totalMs: number) => void` | Callback fired periodically during long timers (`setTimeout`) and limited intervals to report progress (0 to 1). |

**Returns**
An object containing control methods and status/info getters.

| Property               | Type                                                     | Description                                                              |
|------------------------|----------------------------------------------------------|--------------------------------------------------------------------------|
| `setTimeout`           | `(callback: () => void, delay: number \| Date) => number \| null` | Sets a timeout with event callbacks. Accepts milliseconds or a future `Date`. Returns the timer ID. |
| `setInterval`          | `(callback: () => void, delay: number) => number \| null`       | Sets an interval with event callbacks. Accepts milliseconds. Returns the timer ID. |
| `setTimeoutDate`       | `(callback: () => void, targetDate: Date) => number \| null`    | Sets a timeout to execute at a specific future `Date`. Returns the timer ID. |
| `setLimitedInterval`   | `(callback: () => void, delay: number, iterations: number) => number \| null` | Sets an interval that executes a fixed number of times. Returns the timer ID. |
| `clearTimer`           | `() => void`                                             | Clears any currently active timer set by this hook instance.             |
| `isActive`             | `() => boolean`                                          | Returns `true` if a timer is currently active, `false` otherwise.        |
| `getCurrentTimerId`    | `() => number \| null`                                   | Returns the ID of the currently active timer, or `null`.                 |
| `getRemainingIterations`| `() => number \| null`                                   | For `setLimitedInterval`, returns remaining executions.                  |
| `getRemainingTime`     | `() => number`                                           | For an active `setTimeout`, returns estimated remaining time in ms, otherwise `-1`. |

***

### useList

**Description**
A React hook that simplifies managing array state in components. It provides immutable helper methods for common operations like adding, inserting, removing, updating, finding, and counting items based on index or item properties.

**Parameters**

| Parameter   | Type   | Description                                 |
|-------------|--------|---------------------------------------------|
| `initialList`| `T[]`  | The initial array state (defaults to `[]`) |

**Returns**
An object containing the current array state (`list`) and helper functions to modify or query it immutably.

| Property         | Type                                                        | Description                                                                                                                               |
|------------------|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `list`           | `T[]`                                                       | The current array state.                                                                                                                  |
| `addItem`        | `(item: T) => void`                                         | Adds an `item` to the end of the array.                                                                                                   |
| `insert`         | `(index: number, item: T) => void`                          | Inserts an `item` at the specified `index`. If the index is out of bounds, the item is added to the beginning (index < 0) or end (index > length). |
| `insertMany`     | `(items: T[]) => void`                                      | Adds multiple `items` to the end of the array. Does nothing if input is not an array or is empty.                                       |
| `removeByIdx`    | `(index: number) => void`                                   | Removes the item at the specified `index`. If the index is out of bounds, the list remains unchanged. |
| `removeBy`       | `(key: string \| undefined \| null, value: any) => void`    | Removes the **first** item where `item[key]` strictly equals `value`. If `key` is `undefined` or `null`, removes the first item where `item` strictly equals `value` (useful for primitives). If no match is found, the list remains unchanged. |
| `removeManyBy`   | `(key: string \| undefined \| null, value: any) => void`    | Removes **all** items where `item[key]` strictly equals `value`. If `key` is `undefined` or `null`, removes all items where `item` strictly equals `value` (useful for primitives). If no match is found, the list remains unchanged. |
| `updateByIdx`    | `(index: number, updateFn: (item: T) => T) => void`         | Updates the item at the specified `index` using an immutable `updateFn`. If the index is out of bounds, the list remains unchanged.    |
| `updateBy`       | `(key: string \| undefined \| null, value: any, updateFn: (item: T) => T) => void` | Updates the **first** item where `item[key]` strictly equals `value` (or `item === value` if `key` is null/undefined) using an immutable `updateFn`. If no match is found, the list remains unchanged. |
| `updateManyBy`   | `(key: string \| undefined \| null, value: any, updateFn: (item: T) => T) => void` | Updates **all** items where `item[key]` strictly equals `value` (or `item === value` if `key` is null/undefined) using an immutable `updateFn`. If no matches are found, the list remains unchanged. |
| `clearList`      | `() => void`                                                | Removes all items from the list, setting it to an empty array.                                                                           |
| `setList`        | `(newList: T[] \| ((currentList: T[]) => T[])) => void`     | Replaces the entire list array, similar to the standard `useState` setter. Accepts a new array or a function updater.                 |
| `findItemBy`     | `(key: string \| undefined \| null, value: any) => T \| undefined` | Finds and returns the **first** item where `item[key]` strictly equals `value`. If `key` is `undefined` or `null`, finds the first item where `item` strictly equals `value`. Does not modify the list. Returns `undefined` if not found. |
| `findItemsBy`    | `(key: string \| undefined \| null, value: any) => T[]`       | Finds and returns **all** items where `item[key]` strictly equals `value`. If `key` is `undefined` or `null`, finds all items where `item` strictly equals `value`. Does not modify the list. Returns an empty array if no matches are found. |
| `count`          | `(predicate?: (item: T) => boolean) => number`              | Returns the total number of items in the list, or the count of items matching an optional `predicate`. Does not modify the list.       |
| `toggle`         | `(item: T, key?: string \| undefined \| null) => void`      | Adds an item if it's not present, or removes it if it is, based on an optional key or reference comparison. |
| `move`           | `(fromIndex: number, toIndex: number) => void`              | Moves an item from `fromIndex` to `toIndex` immutably. If indices are out of bounds or identical, the list remains unchanged. |
| `sort`           | `(keyOrCompareFn?: string \| ((a: T, b: T) => number) \| null, order?: 'asc' \| 'desc') => void` | Sorts the list immutably using an optional key or comparison function, and an optional sort order. |
| `shuffle`        | `() => void`                                                | Randomly reorders the list items immutably. |
| `swap`           | `(indexA: number, indexB: number) => void`                  | Swaps two items in the list immutably based on their indices. |

***

## ♿ Accessibility & Performance

All components follow accessibility best practices:

* ✅ `Dialog` uses proper ARIA roles and keyboard focus control.
* ✅ `Input` supports labeling, aria attributes, and datalists.
* ✅ `LazyRender` and `Observer` use `IntersectionObserver` to optimize rendering.

***

## ❓ FAQ

**Q: Is this compatible with React Native?**\
A: No, this library is intended for use in React DOM (web).

**Q: Can I style components with Tailwind or CSS modules?**\
A: Yes, components are unstyled and fully customizable.

**Q: Does it support SSR or work in Next.js?**\
A: Yes, all components are compatible with SSR environments.

**Q: How can I report a bug or request a new feature?**\
A: Open an issue on the [GitHub repo](https://github.com/galiprandi/react-tools/issues).

***

## 📄 License

MIT © [@galiprandi](https://github.com/galiprandi)
