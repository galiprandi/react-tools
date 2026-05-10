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
  * [useDebounce](#usedebounce)
  * [useTimer](#usetimer)
  * [useList](#uselist)
* [Accessibility & Performance](#accessibility--performance)
* [FAQ](#faq)
* [License](#license)

***

## 🧠 Overview

**@galiprandi/react-tools** is a lightweight, dependency-free utility library for React. It provides reusable components and hooks to simplify development and improve accessibility — no configuration needed.

👉 [Live Playground](https://stackblitz.com/edit/ga-react-tools?file=index.html)

### ✨ What's New

**AI Hooks** - New hooks for browser-native AI features using Chrome's AI API:
- [`useAI`](#useai) - Check AI Summarizer availability
- [`useAISummarize`](#useaisummarize) - Generate text summaries with streaming support
- [`useLanguageDetection`](#uselanguagedetection) - Detect language from text with confidence scores
- [`useTranslator`](#usetranslator) - Translate text between languages with streaming support

***

## 🚀 Installation

```bash
npm install @galiprandi/react-tools
# or
yarn add @galiprandi/react-tools
# or
pnpm add @galiprandi/react-tools
```

***

## 📦 Components

***

### AsyncBlock

**Description**\
Declarative component to render async data with loading, success, and error states. Automatically cancels in-flight requests when dependencies change.

**Example**

```tsx
<AsyncBlock
  promiseFn={() => fetch(`/api/user`).then(res => res.json())}
  pending={<p>Loading...</p>}
  success={(data) => <p>Welcome {data.name}</p>}
  error={(err) => <p>Error: {(err as Error).message}</p>}
  timeOut={5000}
  deps={[userId]}
/>
```

**Props**

| Prop         | Type                                     | Description                             |
|--------------|------------------------------------------|------------------------------------------|
| `promiseFn`  | `(signal?: AbortSignal) => Promise<T>`   | Async function returning a Promise       |
| `pending`    | `ReactNode \| () => ReactNode`           | UI while loading                         |
| `success`    | `(data: T) => ReactNode`                 | UI on success                            |
| `error`      | `(err: unknown) => ReactNode`            | UI on error                              |
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
```

**Props**

| Prop                | Type                                | Description                             |
|---------------------|-------------------------------------|------------------------------------------|
| `label`             | `string`                            | Optional label                          |
| `transform`         | `string` (`"titleCase"`, `"onlyEmail"`...) | Built-in value transforms         |
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

***

### Observer

**Description**\
Tracks whether a child element is visible in the viewport using `IntersectionObserver`.

**Example**

```tsx
<Observer onChange={(visible) => console.log(visible)}>
  <div>Watch me appear!</div>
</Observer>
```

**Props**

| Prop        | Type                             | Description                             |
|-------------|----------------------------------|------------------------------------------|
| `onChange`  | `(isVisible: boolean) => void`   | Callback when visibility changes        |
| `threshold` | `number \| number[]`             | Intersection threshold (optional)       |

***

### LazyRender

**Description**\
Only renders children when they become visible in the viewport.

**Example**

```tsx
<LazyRender placeholder={<span>Loading...</span>}>
  <img src="/heavy-image.jpg" alt="Lazy" />
</LazyRender>
```

**Props**

| Prop         | Type                      | Description                              |
|--------------|---------------------------|-------------------------------------------|
| `placeholder`| `ReactNode`               | Rendered before children become visible   |
| `threshold`  | `number \| number[]`      | Optional visibility sensitivity           |

***

## 🪝 Hooks

### useAI

**Description**\
Hook for checking the availability of the browser's AI Summarizer API. This hook automatically checks if the Chrome native Summarizer API is available and provides real-time status updates. It's useful for feature detection before attempting to use AI summarization features.

**Example**

```tsx
import { useAI } from '@galiprandi/react-tools';

function MyComponent() {
  const { isAvailable, availability, status, error } = useAI();

  if (status === 'loading') return <p>Checking AI availability...</p>;
  if (!isAvailable) return <p>AI not available in this browser</p>;
  return <AISummarizerComponent />;
}
```

**Returns**

| Property      | Type                          | Description                                 |
|---------------|-------------------------------|---------------------------------------------|
| `isAvailable` | `boolean`                     | Whether the AI Summarizer API is available  |
| `availability`| `'unavailable' \| 'downloadable' \| 'downloading' \| 'available'` | The availability state of the API |
| `status`      | `'idle' \| 'loading' \| 'ready' \| 'error'` | The current status of the availability check |
| `error`       | `Error \| null`               | Error object if the check failed           |

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
| `warmup`                  | `boolean`                                     | `false`      | Preload model on mount for faster first summary |

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
| `warmup` | `boolean` | `false` | Preload the model on component mount for faster first detection |
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
Hook for using the browser's Translator API. This hook provides a React interface to Chrome's native Translator API. It handles model initialization, download progress, streaming support, and automatic cleanup on unmount. Supports 38+ languages. Automatically detects source language and uses browser language by default.

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
| `warmup`        | `boolean` | `false` | Preload model on mount for faster first translation |
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

### useDebounce

**Description**\
A React hook that returns a debounced version of a value. Useful for search input, filters, etc.

**Example**

```tsx
const debouncedSearch = useDebounce(searchTerm, 500);
```

**Props**

| Parameter     | Type      | Description                    |
|---------------|-----------|--------------------------------|
| `value`       | `T`       | Value to debounce              |
| `delay`       | `number`  | Delay in milliseconds          |

**Returns**\
Debounced version of the value (`T`).

***

### useTimer

**Description**
Managing timers like `setTimeout` and `setInterval` directly in React components can be complex, often leading to issues like memory leaks, unexpected behavior during re-renders, or difficulties in cancellation when components unmount.

The `useTimer` hook abstracts this complexity, providing a safe, declarative, and easy-to-use way to work with various types of timers. It ensures automatic cleanup, integrates with component lifecycles, and offers event callbacks for monitoring timer status, including progress for longer durations.

**Features**

* **Automatic Cleanup:** Timers are automatically cleared when the component using the hook unmounts, preventing memory leaks.
* **Lifecycle Events:** Receive notifications when a timer is set, cancelled, completes, or reports progress.
* **Flexible Scheduling:** Set timers by milliseconds, a future `Date` object, or as limited intervals.
* **Simplified Control:** Clear any active timer with a single method call.

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

**Example**

This example demonstrates how `useTimer` simplifies scheduling an action for a specific future `targetDate` and automatically handles cleanup, while utilizing event callbacks to monitor its state.

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

***

### useList

**Description**
A React hook to simplify managing array state in components. It provides immutable helper methods for common operations like adding, inserting, removing, updating, finding, and counting items based on index or item properties, reducing boilerplate compared to manual state updates.

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
| `removeByIdx`    | `(index: number) => void`                                   | Removes the item at the specified `index`. If the index is out of bounds, the list remains unchanged.                                   |
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
