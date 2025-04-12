# @galiprandi/react-tools

A set of simple and intuitive utilities for developing React applications.

<div align="center" style="background-color: white; border-radius: 5px;">
  <img src="lib/assets/logo.svg" alt="Logo" width="300" height="180">
</div>

***

<p align="center">
  <a href="https://www.npmjs.com/package/@galiprandi/react-tools">
    <img src="https://img.shields.io/npm/d18m/%40galiprandi%2Freact-tools?style=for-the-badge&logo=npm&color=CB3837" alt="NPM Downloads"/>
  </a>
  <a href="https://jsr.io/@galiprandi/react-tools">
    <img src="https://img.shields.io/jsr/v/%40galiprandi/react-tools?style=for-the-badge&logo=javascript&color=F7DF1E" alt="JSR Version"/>
  </a>
  <a href="https://github.com/galiprandi/react-tools">
    <img src="https://img.shields.io/github/stars/galiprandi/react-tools?style=for-the-badge&logo=github&color=181717" alt="GitHub Stars"/>
  </a>
</p>

***

## Overview

**@galiprandi/react-tools** is a dependency-free utility package offering composable components and hooks that simplify React development while maintaining accessibility and performance.

### 🔗 [Playground](https://stackblitz.com/edit/ga-react-tools?file=index.html)

***

## 🚀 Installation

```bash
npm i @galiprandi/react-tools
# or
yarn add @galiprandi/react-tools
# or
pnpm i @galiprandi/react-tools
```

***

## 📦 Components

* `<AsyncBlock />`: Declaratively renders asynchronous content with state handling.
* `<Form />`: Enhanced `form` element wrapper.
* `<Input />`: Reusable and extensible `input` component.
* `<DateTime />`: `datetime-local` input with ISO format support.
* `<Dialog />`: Accessible dialog/modal wrapper.
* `<Observer />`: Tracks element visibility via Intersection Observer.
* `<LazyRender />`: Delays rendering until visible in viewport.

## 🪝 Hooks

* `useDebounce(value, delay)`: Returns a debounced value.

***

## 📘 Components in Detail

### AsyncBlock

Declaratively renders asynchronous content with pending, success, and error states.

**Props:**

* `promiseFn: (signal?: AbortSignal) => Promise<T>` - Function that returns a Promise
* `pending: ReactNode | (() => ReactNode)` - Content to display during loading
* `success: (data: T) => ReactNode` - Function to render on successful resolution
* `error: (err: unknown) => ReactNode` - Function to render on error
* `timeOut?: number` - Optional timeout in milliseconds
* `deps?: any[]` - Dependencies to re-run the promise when changed
* `onSuccess?: (data: T) => void` - Optional callback on success
* `onError?: (err: unknown) => void` - Optional callback on error

**Example:**

```tsx
<AsyncBlock
    promiseFn={() => fetch(`/api/users/${userId}`).then((res) => res.json())}
    pending={<p>Loading user data...</p>}
    success={(data) => (
        <div>
            <h2>{data.name}</h2>
            <p>Email: {data.email}</p>
        </div>
    )}
    error={(err) => <p>Error: {(err as Error)?.message}</p>}
    timeOut={5000} // Cancel after 5 seconds
    deps={[userId]} // Re-run when userId changes
/>
```

***

### Form

Wraps a native `<form>` and captures values on submit.

**Props:**

* `onSubmitValues: (values: T) => void`
* `filterEmptyValues?: boolean` – Remove empty fields before submit. *(Default: false)*

**Example:**

```tsx
<Form<MyFormValues> onSubmitValues={setValues} filterEmptyValues>
    <Input name="username" label="Username" placeholder="Username" />
    <Input
        name="password"
        label="Password"
        placeholder="Password"
        type="password"
    />
    <button type="submit">Login</button>
</Form>
```

***

### Input

Enhanced `input` with support for transformations, debouncing, datalist, and more.

**Additional Props:**

* `label`
* `onChangeValue`, `onChangeDebounce`, `debounceDelay`
* `transform`: "toUpperCase" | "toLowerCase" | "capitalize" | "titleCase" | "snakeCase" | "onlyNumbers" | "onlyLetters" | "onlyEmail" | "onlyAlphanumeric"
* `transformFn`: `(value: string) => string`
* `datalist: string[]`

**Example:**

```tsx
<Input
    label="Name"
    placeholder="Enter full name"
    transform="titleCase"
    onChangeValue={setValue}
    onChangeDebounce={setValueDebounced}
    debounceDelay={1000}
    datalist={['John Doe', 'Jane Smith']}
/>
```

***

### DateTime

Wrapper for `input[type=datetime-local]` with ISO (RFC 3339) support.

**Additional Props:**

* `isoValue`: string
* `onChangeISOValue`: (iso: string) => void
* Inherits all `Input` props

**Example:**

```tsx
<DateTime
    label="Select your birthday"
    isoValue={isoValue}
    onChangeISOValue={setIsoValue}
/>
```

***

### Dialog

Wraps the native `dialog` element with modal support and accessibility features.

**Props:**

* `isOpen?: boolean`
* `behavior?: 'dialog' | 'modal'` *(Default: 'modal')*
* `onOpen?`, `onClose?`
* `opener?`: ReactNode
* `children?`: ReactNode

**Example:**

```tsx
<Dialog
    behavior="modal"
    opener={<button>Open Dialog</button>}
    onOpen={() => console.log('Opened')}
    onClose={() => console.log('Closed')}
>
    <h2>Hello 👋</h2>
    <p>This is a dialog example.</p>
</Dialog>
```

***

### Observer

Detects when a child enters/exits the viewport.

**Props:**

* `onChange: (isVisible: boolean) => void`
* `threshold?: number | number[]`

**Example:**

```tsx
<Observer onChange={(visible) => console.log(visible)}>
    <p>Track my visibility</p>
</Observer>
```

***

### LazyRender

Renders children only when visible in viewport.

**Props:**

* `placeholder?: ReactNode`
* `threshold?: number | number[]`

**Example:**

```tsx
<LazyRender placeholder={<div>Loading...</div>}>
    <img src="/heavy-content.jpg" alt="Lazy Loaded" />
</LazyRender>
```

***

## 🔁 Hook: useDebounce

Returns a debounced value after a delay.

**Signature:**

```ts
function useDebounce<T>(value: T, delay: number): T
```

**Example:**

```tsx
const debounced = useDebounce(searchTerm, 500)
```

***

## License

MIT © [@galiprandi](https://github.com/galiprandi)
