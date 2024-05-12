# react-tools

Welcome to `react-tools`, a set of simple and intuitive utilities for developing React applications. This package includes key tools that can streamline your development process.

## Contents

### Utilities:

-   `<Input />`: A reusable input component that provides a consistent user experience.
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

-   `onChangeValue`: A callback function that is called when the input value changes.

-   `onChangeDebounce`: A callback function that is called when the input value changes after the debounce delay.

-   `debounceDelay`: The delay in milliseconds for the debounce. Default 1000.

-   `className`: A class name to apply to the input element. If a label is provided, the class name is applied to the label and input elements.

-   `transform`: The type of transformation to apply to the input value. Options include "toUpperCase", "toLowerCase", "capitalize", "titleCase", "snakeCase", "onlyNumbers", "onlyLetters", and "onlyEmail".

-   `transformFn`: A custom function to apply to the input value. This function takes a string as input and returns a string as output. If both transform and transformFn are provided, the transformFn function will take precedence.

### Example:

```js
import { useState } from "react";
import { Input, InputProps } from "../../lib/components/Input";

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

## Contribution

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a branch with a meaningful description.
3. Make the desired changes.
4. Open a Pull Request to the main branch.

If you find an issue or have a suggestion to improve the project, feel free to open an issue.

## License

This project is licensed under the MIT License.
