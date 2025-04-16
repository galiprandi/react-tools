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

---

## 📚 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Components](#components)
  - [AsyncBlock](#asyncblock)
  - [Form](#form)
  - [Input](#input)
  - [DateTime](#datetime)
  - [Dialog](#dialog)
  - [Observer](#observer)
  - [LazyRender](#lazyrender)
- [Hooks](#hooks)
  - [useDebounce](#usedebounce)
- [Accessibility & Performance](#accessibility--performance)
- [FAQ](#faq)
- [License](#license)

---

## 🧠 Overview

**@galiprandi/react-tools** is a lightweight, dependency-free utility library for React. It provides reusable components and hooks to simplify development and improve accessibility — no configuration needed.

👉 [Live Playground](https://stackblitz.com/edit/ga-react-tools?file=index.html)

---

## 🚀 Installation

```bash
npm install @galiprandi/react-tools
# or
yarn add @galiprandi/react-tools
# or
pnpm add @galiprandi/react-tools
```

---

## 📦 Components

---

### AsyncBlock

**Description**  
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

---

### Form

**Description**  
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

---

### Input

**Description**  
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

---

### DateTime

**Description**  
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

---

### Dialog

**Description**  
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

---

### Observer

**Description**  
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

---

### LazyRender

**Description**  
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

---

## 🪝 Hooks

---

### useDebounce

**Description**  
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

**Returns**  
Debounced version of the value (`T`).

---

## ♿ Accessibility & Performance

All components follow accessibility best practices:

- ✅ `Dialog` uses proper ARIA roles and keyboard focus control.
- ✅ `Input` supports labeling, aria attributes, and datalists.
- ✅ `LazyRender` and `Observer` use `IntersectionObserver` to optimize rendering.

---

## ❓ FAQ

**Q: Is this compatible with React Native?**  
A: No, this library is intended for use in React DOM (web).

**Q: Can I style components with Tailwind or CSS modules?**  
A: Yes, components are unstyled and fully customizable.

**Q: Does it support SSR or work in Next.js?**  
A: Yes, all components are compatible with SSR environments.

**Q: How can I report a bug or request a new feature?**  
A: Open an issue on the [GitHub repo](https://github.com/galiprandi/react-tools/issues).

---

## 📄 License

MIT © [@galiprandi](https://github.com/galiprandi)
