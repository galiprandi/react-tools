# react-tools

Welcome to `react-tools`, a set of simple and intuitive utilities for developing React applications. This package includes key tools that can streamline your development process.

## Contents

### Components:

-   `<Input />`: A reusable input component that provides a consistent user experience.

### Others:

-   `useDebounce()`: - A hook that takes two arguments, value and delay, and return a debounced value.-

## Installation

To install `react-tools`, use the following command with `pnpm`:

```bash
# PNPM
pnpm i @galiprandi/react-tools

# NPM
npm i @galiprandi/react-tools

# YARN
yarn add @galiprandi/react-tools
```

## `<Input />` component

A simple wrapper around the native `input` element. It accepts all the same props as the native input element and adds a few additional props for convenience.

### Adicional Props:

-   `label`: A label for the input element. If provided, we add a label element with the provided text.
-   `onChangeValue`: A callback function that is called when the input value changes
-   `onChangeDebounce`: A callback function that is called when the input value changes after the debounce delay.
-   `debounceDelay`: The delay in milliseconds for the debounce. Default 1000.
-   `className`: A class name to apply to the input element. If a label is provided, the class name is applied to the label and input elements.
-   `transform`: The type of transformation to apply to the input value. Options include "toUpperCase", "toLowerCase", "capitalize", "titleCase", "snakeCase", "onlyNumbers", "onlyLetters", "onlyEmail" and "onlyAlphanumeric"
-   `transformFn`: A custom function to apply to the input value. This function takes a string as input and returns a string as output. If both transform and transformFn are provided, the transformFn function will take precedence.

### Example:

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

## `<DateTime>` component

A simple wrapper around the native `input` element with `type="datetime-local"`. It accepts all the same props as the native input element and adds a few additional props for convenience.

### Adicional Props:

-   `label`: A label for the input element. If provided, we add a label element with the provided text.
-   `className`: A class name to apply to the input element. If a label is provided, the class name is applied to the label and input elements.
-   `onChangeValue`: A callback function that is called when the input value changes.
-   `onChangeISOVale`: A callback function that is called when the input value changes and returns the date in ISO 8601 format.
-   `isoValue`: The date in ISO 8601 format.
-   Any other prop that the our `Input` component accepts (like `onChangeDebounce`, `transform` and `transformFn`).

### Example:

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

## `useDebounce()` hook

A simple hook that takes two arguments, value and delay, and returns a debounced value. Its used internally by some components, but you can use it in your custom hooks or components.

### Example:

```js
import { useState } from "react";
import { useDebounce } from "../../lib/hooks/useDebounce";

export const DebounceExample = () => {
  const [value, setValue] = useState<string>();
  const debouncedValue = useDebounce(value, 1000);

  return (
    <section>
      <h2>Debounce</h2>

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
  );
};
```

## Contribution

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a branch with a meaningful description.
3. Make the desired changes.
4. Open a Pull Request to the main branch.

If you find an issue or have a suggestion to improve the project, feel free to open an issue.

## License

This project is licensed under the MIT License.
