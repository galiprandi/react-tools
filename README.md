# @galiprandi/react-tools

Welcome to `@galiprandi/react-tools`, a set of simple and intuitive utilities for developing React applications. This package includes key tools that can streamline your development process.

### Components:

-   `<Input />`: A reusable input component that provides a consistent user experience.
    [details.](#input-component)

-   `<DateTime />`: A reusable input component with `type="datetime-local"` that use dates in RFC 3339 format. [details.](#datetime-component)
-   `<Dialog />`: A component that wraps the dialog HTML tag and provides a simple way to create accessibility dialogs and modals in your React application. [details.](#dialog-component)
-   `<Observer />`: A component allows you to track when an element enters or exits the viewport. This is useful for lazy loading images, infinite scrolling, and more. [details.](#observer-component)

### Hooks:

-   `useDebounce()`: A hook that takes two arguments, value and delay, and return a debounced value. [details.](#usedebounce-hook)

## Installation

To install use one of the following commands:

```bash
npm i @galiprandi/react-tools
```

```bash
pnpm i @galiprandi/react-tools
```

```bash
yarn add @galiprandi/react-tools
```

## Components

### Input component

A simple wrapper around the native `input` element. It accepts all the same props as the native input element and adds a few additional props for convenience.

#### Adicional Props:

-   `label`: A label for the input element. If provided, we add a label element with the provided text.
-   `onChangeValue`: A callback function that is called when the input value changes
-   `onChangeDebounce`: A callback function that is called when the input value changes after the debounce delay.
-   `debounceDelay`: The delay in milliseconds for the debounce.
-   `className`: A class name to apply to the input element. If a label is provided, the class name is applied to the label and input elements.
-   `transform`: The type of transformation to apply to the input value. Options include "toUpperCase", "toLowerCase", "capitalize", "titleCase", "snakeCase", "onlyNumbers", "onlyLetters", "onlyEmail" and "onlyAlphanumeric"
-   `transformFn`: A custom function to apply to the input value. This function takes a string as input and returns a string as output. If both transform and transformFn are provided, the transformFn function will take precedence.

#### Example:

```js
import { useState } from "react";
import { Input, type InputProps } from '@galiprandi/react-tools';

export const InputExample = () => {
  const [value, setValue] = useState<InputProps["value"]>();
  const [valueDebounced, setValueDebounced] = useState<InputProps["value"]>();

  return (
    <section>
      <h2>Input</h2>

      <Input
        type="text"
        placeholder="Name and Last Name"
        // Custom attributes
        label="Name"
        className="my-custom-input"
        value={value}
        onChangeValue={setValue}
        onChangeDebounce={setValueDebounced}
        debounceDelay={1000}
        transform="titleCase"
      />
      <p>
        Transformed value: <code>{value}</code>
        <br />
        Debounced value (1s): <code>{valueDebounced}</code>
      </p>
    </section>
  );
};
```

### DateTime component

A simple wrapper around the native `input` element with `type="datetime-local"`. It accepts all the same props as the native input element and adds a few additional props for convenience.

#### Adicional Props:

-   `label`: A label for the input element. If provided, we add a label element with the provided text.
-   `className`: A class name to apply to the input element. If a label is provided, the class name is applied to the label and input elements.
-   `onChangeValue`: A callback function that is called when the input value changes.
-   `onChangeISOValue`: A callback function that is called when the input value changes and returns the date in RFC 3339 format.
-   `isoValue`: The date in RFC 3339 format.
-   Any other prop that the our `Input` component accepts (like `onChangeDebounce`, `transform` and `transformFn`).

#### Example:

```js
import { useState } from 'react'
import { DateTime, type DateTimeProps } from '@galiprandi/react-tools'

export const DateTimeExample = () => {
    const now = new Date().toISOString()
    const [isoValue, setIsoValue] = useState<DateTimeProps['isoValue']>(now)

    return (
        <section>
            <hr />
            <h2>DateTime</h2>
            <DateTime
                // Custom attributes
                isoValue={isoValue}
                label="Date"
                onChangeISOVale={setIsoValue}
            />
            <p>
                Input: <code>{now}</code>
                <br />
                onChangeISOVale: <code>{isoValue}</code>
            </p>
        </section>
    )
}

```

### Dialog component

A component that wraps the `<dialog />` HTML tag and provides a simple way to create accessibility dialogs and modals in your React application.

#### Adicional Props:

-   `isOpen:` Boolean, defines if the dialog is open or closed. (Optional)
-   `behavior:` 'dialog' | 'modal', defines the behavior of the dialog. (Default: 'modal')
-   `onOpen:` Callback function executed when the dialog is opened. (Optional)
-   `onClose:` Callback function executed when the dialog is closed. (Optional)
-   `children:` ReactNode, the content of the dialog. (Optional)
-   `opener:` ReactNode, the element that opens the dialog. (Optional)

#### Example:

```js
import { Dialog } from '@galiprandi/react-tools'

export const DialogExample = () => {
    return (
        <section>
            <hr />
            <h2>Dialog</h2>

            <Dialog
                // Custom attributes
                behavior="modal"
                opener={<button>Toggle Dialog</button>}
                onOpen={() => console.info('Dialog opened')}
                onClose={() => console.info('Dialog closed')}
            >
                <h2>Hello there 👋</h2>
                <p>This is a dialog example.</p>
                <p>
                    For information on how to use html dialogs, or styling them,
                    <a
                        href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {' '}
                        check documentation on MDN website
                    </a>
                </p>
            </Dialog>
        </section>
    )
}
```

### Observer component

A component that allows you to track when an element enters or exits the viewport. This is useful for lazy loading images, infinite scrolling, and more.

#### Adicional Props:

-   `children:` ReactNode, the content of the observer.
-   `onAppear:` Callback function executed when the element enters the viewport. (Optional)
-   `onDisappear` Callback function executed when the element exits the viewport. (Optional)
-   `wrapper:` HTMLElement, the element that is used as wrapper of children. (Default: 'div')
-   `root:` HTMLElement, the element that is used as the viewport for checking visibility of the target. (Optional)
-   `rootMargin` Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left). The values can be percentages. (Optional)
-   `threshold` Number, a number between 0 and 1 indicating the percentage of the target's visibility the observer's callback should be executed. (Default: 0)

#### Example:

```js
import { Observer } from '@galiprandi/react-tools'

export const ObserveExample = () => {
    const images = Array.from({ length: 5 }, (_, i) => i + 1)

    return (
        <section>
            <hr />
            <h2>Observer</h2>

            {images.map((i) => (
                <Observer
                    key={i}
                    wrapper="article"
                    onAppear={() => console.log(`Appeared ${i}`)}
                    onDisappear={() => console.log(`Disappeared ${i}`)}
                    threshold={0.5}
                >
                    <img
                        src={`https://picsum.photos/500/500?random=${i}`}
                        alt="Free image"
                        width={500}
                        height={500}
                    />
                </Observer>
            ))}
        </section>
    )
}
```

## Hooks

### useDebounce hook

A simple hook that takes two arguments, value and delay, and returns a debounced value. Its used internally by some components, but you can use it in your custom hooks or components.

#### Example:

```js
import { useDebounce } from '@galiprandi/react-tools'
import { useState } from 'react'

export const DebounceExample = () => {
    const [value, setValue] = useState<string>()
    const debouncedValue = useDebounce(value, 1000)

    return (
        <section>
            <hr />
            <h2>useDebounce</h2>

            <input
                type="text"
                placeholder="Type something..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <p>
                Value: <code>{value}</code>
                <br />
                Debounced value (1s): <code>{debouncedValue}</code>
            </p>
        </section>
    )
}
```

## Contribution

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a branch with a meaningful description.
3. Make the desired changes.
4. Update the **documentation** if necessary.
5. Open a Pull Request to the main branch.

If you find an issue or have a suggestion to improve the project, feel free to open an issue.

## License

This project is licensed under the MIT License.
