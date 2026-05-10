---
name: react-tools
description: Guide for using @galiprandi/react-tools library. Use when working with React projects that need lightweight, dependency-free utilities including components (AsyncBlock, Form, Input, DateTime, Dialog, Observer, LazyRender), hooks (useAI, useAISummarize, useLanguageDetection, useTranslator, useDebounce, useTimer, useList), and utilities (dates, strings, userLanguage). This library provides accessible, composable React utilities with no configuration needed.
---

# React Tools

**@galiprandi/react-tools** is a lightweight, dependency-free utility library for React that provides reusable components and hooks to simplify development and improve accessibility.

## When to Use

Use this library when you need:
- **Async data handling** with loading/error states → `AsyncBlock`
- **Form management** with automatic value collection → `Form`, `Input`
- **Date/time inputs** with ISO string handling → `DateTime`
- **Accessible dialogs/modals** → `Dialog`
- **Viewport visibility tracking** → `Observer`, `LazyRender`
- **Browser-native AI features** (Chrome AI API) → `useAI`, `useAISummarize`, `useLanguageDetection`, `useTranslator`
- **Common React patterns** → `useDebounce`, `useTimer`, `useList`
- **Utility functions** → dates, strings, userLanguage detection

## Installation

```bash
npm install @galiprandi/react-tools
# or
yarn add @galiprandi/react-tools
# or
pnpm add @galiprandi/react-tools
```

## Quick Start

```tsx
import { AsyncBlock, Form, Input, useDebounce } from '@galiprandi/react-tools';

// Async data with automatic cancellation
<AsyncBlock
  promiseFn={() => fetch('/api/data').then(res => res.json())}
  pending={<p>Loading...</p>}
  success={(data) => <p>{data.name}</p>}
  error={(err) => <p>Error: {(err as Error).message}</p>}
/>

// Form with automatic value collection
<Form<{ email: string }> onSubmitValues={console.log}>
  <Input name="email" label="Email" transform="onlyEmail" />
  <button type="submit">Submit</button>
</Form>

// Debounced value
const debouncedSearch = useDebounce(searchTerm, 500);
```

## Components

### AsyncBlock

Declarative component for rendering async data with loading, success, and error states. Automatically cancels in-flight requests when dependencies change.

```tsx
<AsyncBlock
  promiseFn={() => fetch(`/api/user/${userId}`).then(res => res.json())}
  deps={[userId]}
  timeOut={5000}
  pending={<p>Loading user...</p>}
  success={(user) => <p>Welcome, {user.name}!</p>}
  error={(err) => <p>Error: {(err as Error).message}</p>}
  onSuccess={(user) => console.log('User loaded:', user)}
  onError={(err) => console.error('Failed to load:', err)}
/>
```

**Key Props:**
- `promiseFn`: Async function returning a Promise
- `deps`: Dependency array for re-execution
- `timeOut`: Optional timeout in milliseconds
- `pending/success/error`: UI for each state
- `onSuccess/onError`: Callbacks

### Form

Enhanced `<form>` element that automatically gathers and returns values on submit.

```tsx
<Form<{ username: string; email: string }>
  onSubmitValues={(values) => console.log(values)}
  filterEmptyValues
>
  <Input name="username" label="Username" transform="titleCase" />
  <Input name="email" label="Email" transform="onlyEmail" />
  <button type="submit">Submit</button>
</Form>
```

**Key Props:**
- `onSubmitValues`: Handles form submission with collected values
- `filterEmptyValues`: Remove empty fields before submission

### Input

Custom input component supporting transformations, debounce, datalist, and more.

```tsx
<Input
  label="Email"
  name="email"
  placeholder="Enter your email"
  transform="onlyEmail"
  onChangeValue={(val) => console.log(val)}
  debounceDelay={500}
  datalist={['user@example.com', 'admin@example.com']}
/>
```

**Transform Options:**
- `titleCase`, `toUpperCase`, `toLowerCase`
- `capitalize`, `snakeCase`
- `onlyNumbers`, `onlyLetters`, `onlyEmail`, `onlyAlphanumeric`

### DateTime

Wrapper around `<input type="datetime-local" />` that handles ISO string conversion.

```tsx
<DateTime
  label="Appointment"
  isoValue={appointmentDate}
  onChangeISOValue={setAppointmentDate}
/>
```

### Dialog

Accessible dialog/modal component built on the native `<dialog>` element.

```tsx
<Dialog
  behavior="modal"
  opener={<button>Open Modal</button>}
  onClose={() => console.log('Closed')}
>
  <p>This is an accessible dialog!</p>
  <button onClick={() => dialogRef.current?.close()}>Close</button>
</Dialog>
```

### Observer

Tracks whether a child element is visible in the viewport using `IntersectionObserver`.

```tsx
<Observer
  onChange={(isVisible) => console.log('Visible:', isVisible)}
  threshold={0.5}
>
  <div>Watch me appear!</div>
</Observer>
```

### LazyRender

Only renders children when they become visible in the viewport.

```tsx
<LazyRender
  placeholder={<span>Loading image...</span>}
  threshold={0.1}
>
  <img src="/heavy-image.jpg" alt="Lazy loaded" />
</LazyRender>
```

## Hooks

### AI Hooks (Chrome AI API)

**Important**: AI hooks require Chrome's experimental AI APIs. Always check availability with `useAI` first.

#### useAI

Check and manage availability of multiple Chrome AI APIs (Summarizer, Translator, LanguageDetector, and experimental APIs like Prompt, Writer, Rewriter, Proofreader).

```tsx
import { useAI } from '@galiprandi/react-tools';

function MyComponent() {
  // Check all APIs
  const { isAvailable, apis, status, preload } = useAI();

  // Check specific APIs only
  const { isAvailable, apis } = useAI({ 
    apis: ['translator', 'summarizer'] 
  });

  // Preload models for faster first use
  useEffect(() => {
    if (isAvailable) {
      preload('translator');
    }
  }, [isAvailable, preload]);

  // Show download progress
  if (apis.translator.availability === 'downloading') {
    const progress = getApiProgress('translator');
    return <LoadingBar {...progress} />;
  }

  return <div>AI Status: {status}</div>;
}
```

**Returns:**
- `isAvailable`: Whether all requested APIs are available
- `status`: `'idle' | 'loading' | 'ready' | 'error'`
- `apis`: Status of each API (unavailable, downloadable, downloading, available)
- `isApiAvailable(api)`: Check specific API
- `getApiProgress(api)`: Get download progress
- `preload(api)`: Preload specific API model
- `preloadAll()`: Preload all APIs

#### useAISummarize

Generate text summaries with streaming support.

```tsx
import { useAISummarize } from '@galiprandi/react-tools';

function Summarizer() {
  const summarize = useAISummarize({
    type: 'tldr',
    format: 'markdown',
    length: 'short',
    outputLanguage: 'en',
    streaming: true,
    warmup: true
  });

  const handleSummarize = async () => {
    await summarize.summarize(longText, 'End with: Powered by my app');
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

**Options:**
- `type`: `'tldr' | 'key-points' | 'teaser' | 'headline'`
- `format`: `'plain-text' | 'markdown'`
- `length`: `'short' | 'medium' | 'long'`
- `outputLanguage`: `'en' | 'es' | 'ja' | 'auto' | 'user'`
- `streaming`: Enable real-time output
- `warmup`: Preload model on mount

#### useLanguageDetection

Detect language from text with confidence scores and user language comparison.

```tsx
import { useLanguageDetection } from '@galiprandi/react-tools';

function LanguageDetector() {
  const { lang, confidence, allLangs, userLang, isUserLang, status } = 
    useLanguageDetection({
      text: 'Hallo und herzlich willkommen!',
      minConfidence: 0.8,
      maxResults: 3
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

**Options:**
- `text`: Text to detect language from (auto-detects when changed)
- `enable`: Enable/disable auto-detection
- `minConfidence`: Minimum confidence threshold (0.0 - 1.0)
- `maxResults`: Maximum number of results
- `warmup`: Preload model on mount

#### useTranslator

Translate text between languages with auto-detection and browser language support. Supports 38+ languages.

```tsx
import { useTranslator } from '@galiprandi/react-tools';

function Translator() {
  // Auto-detect source, translate to browser language
  const { data, detectedSourceLanguage, resolvedTargetLanguage, status } = 
    useTranslator({
      text: 'Hello world, how are you?',
      sourceLanguage: 'auto',
      targetLanguage: 'user',
      streaming: true
    });

  return (
    <div>
      {status === 'translating' && <p>Translating...</p>}
      {data && (
        <p>
          {data}
          <small>
            (from {detectedSourceLanguage} to {resolvedTargetLanguage})
          </small>
        </p>
      )}
    </div>
  );
}
```

**Options:**
- `text`: Text to translate (auto-translates when changed)
- `sourceLanguage`: `'auto'` or specific language code
- `targetLanguage`: `'user'` or specific language code
- `streaming`: Enable real-time output
- `warmup`: Preload model on mount
- `enable`: Enable/disable auto-translation

**Optimization**: When source and target languages match, returns original text without loading translation model.

### Utility Hooks

#### useDebounce

Debounce any value for search, filters, etc.

```tsx
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  // API call only runs 500ms after searchTerm stops changing
  if (debouncedSearch) {
    fetch(`/api/search?q=${debouncedSearch}`);
  }
}, [debouncedSearch]);
```

#### useTimer

Safe timer management with automatic cleanup.

```tsx
const { setTimeout, setInterval, clearTimer, isActive } = useTimer({
  onSetTimer: (id) => console.log('Timer set:', id),
  onTimerComplete: (id) => console.log('Timer completed:', id),
  onCancelTimer: (id) => console.log('Timer cancelled:', id),
});

// Set a timeout
setTimeout(() => console.log('Done!'), 5000);

// Set an interval
setInterval(() => console.log('Tick'), 1000);

// Clear any active timer
clearTimer();
```

#### useList

Simplify array state management with immutable helpers.

```tsx
const { list, addItem, removeByIdx, updateByIdx, findItemBy, count } = 
  useList([{ id: 1, name: 'Item 1' }]);

// Add item
addItem({ id: 2, name: 'Item 2' });

// Remove by index
removeByIdx(0);

// Update by index
updateByIdx(0, (item) => ({ ...item, name: 'Updated' }));

// Find item
const item = findItemBy('id', 1);

// Count items
const total = count();
```

## Utilities

### dates

ISO to local datetime conversion (used internally by DateTime).

```tsx
import { isoToLocal, localToIso } from '@galiprandi/react-tools/utilities/dates';

const localDate = isoToLocal('2024-01-15T10:30:00Z');
const isoDate = localToIso('2024-01-15T10:30');
```

### strings

Value transforms for Input component.

```tsx
import { toTitleCase, onlyEmail, snakeCase } from '@galiprandi/react-tools/utilities/strings';

toTitleCase('hello world'); // 'Hello World'
onlyEmail('test@example.com'); // 'test@example.com'
snakeCase('hello world'); // 'hello_world'
```

### userLanguage

Browser language detection (used internally by useTranslator).

```tsx
import { getUserLanguage } from '@galiprandi/react-tools/utilities/userLanguage';

const userLang = getUserLanguage(); // 'en', 'es', 'ja', etc.
```

## Common Patterns

### Pattern 1: Search with Debounce

```tsx
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (debouncedSearch) {
      fetch(`/api/search?q=${debouncedSearch}`)
        .then(res => res.json())
        .then(setResults);
    }
  }, [debouncedSearch]);

  return (
    <>
      <Input
        value={searchTerm}
        onChangeValue={setSearchTerm}
        placeholder="Search..."
      />
      <AsyncBlock
        promiseFn={() => fetch(`/api/search?q=${debouncedSearch}`).then(r => r.json())}
        deps={[debouncedSearch]}
        success={(data) => <ul>{data.map(item => <li>{item}</li>)}</ul>}
      />
    </>
  );
}
```

### Pattern 2: Form with Validation

```tsx
function UserForm() {
  return (
    <Form<{ email: string; username: string }>
      onSubmitValues={(values) => {
        // values are already transformed and filtered
        fetch('/api/users', {
          method: 'POST',
          body: JSON.stringify(values)
        });
      }}
      filterEmptyValues
    >
      <Input
        name="email"
        label="Email"
        transform="onlyEmail"
        required
      />
      <Input
        name="username"
        label="Username"
        transform="titleCase"
        required
      />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### Pattern 3: AI Pipeline

```tsx
function AIPipeline() {
  const ai = useAI({ apis: ['languageDetector', 'translator'] });
  const { lang, confidence } = useLanguageDetection({ text: inputText });
  const { data, status } = useTranslator({
    text: inputText,
    sourceLanguage: 'auto',
    targetLanguage: 'user'
  });

  if (!ai.isAvailable) return <div>AI not available</div>;

  return (
    <div>
      <p>Detected: {lang} ({Math.round(confidence! * 100)}%)</p>
      {status === 'translating' && <p>Translating...</p>}
      {data && <p>Translation: {data}</p>}
    </div>
  );
}
```

### Pattern 4: Lazy Loading with Progress

```tsx
function LazyImageGallery() {
  const images = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    src: `/images/image-${i}.jpg`
  }));

  return (
    <div>
      {images.map(img => (
        <LazyRender
          key={img.id}
          placeholder={<div style={{ height: 300, background: '#eee' }}>Loading...</div>}
          threshold={0.1}
        >
          <img src={img.src} alt={`Image ${img.id}`} loading="lazy" />
        </LazyRender>
      ))}
    </div>
  );
}
```

## Best Practices

### AI Hooks
1. Always check availability with `useAI` before using AI hooks
2. Use `warmup: true` for faster first use in critical paths
3. Handle loading states and errors appropriately
4. Use `streaming: true` for better UX with long-running operations

### AsyncBlock
- Use `deps` array to re-execute when dependencies change
- Set `timeOut` to prevent hanging requests
- Leverage automatic cancellation - no need for manual AbortSignal
- Use `onSuccess`/`onError` for side effects

### Form/Input
- Use `transform` prop for built-in validations (onlyEmail, titleCase, etc.)
- Use `filterEmptyValues` on Form to exclude empty fields
- Leverage `onChangeDebounce` for search/filter inputs
- Combine with `useDebounce` for form fields that trigger API calls

### Performance
- Use `LazyRender` for heavy images or components below the fold
- Use `Observer` for scroll-based animations or lazy loading
- Use `useDebounce` for search/filter inputs to reduce API calls
- Use `useTimer` instead of direct `setTimeout`/`setInterval` for automatic cleanup

## Browser Compatibility

- All components work in modern browsers
- AI hooks require Chrome with experimental AI APIs enabled
- Dialog uses native `<dialog>` element (polyfill available for older browsers)
- IntersectionObserver (Observer, LazyRender) requires modern browser support
