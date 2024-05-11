# react-tools

Welcome to `react-tools`, a set of simple and intuitive utilities for developing React applications. This package includes key tools that can streamline your development process.

## Contents

### Utilities:

- `<Input />`: A reusable input component that provides a consistent user experience.

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

### Usage:

```ts
import { Input } from "@galiprandi/react-tools";

function Example() {
  const [value, setValue] = useState<ComponentProps<typeof Input>["value"]>();
  const [valueDebounced, setValueDebounced] =
    useState<ComponentProps<typeof Input>["value"]>();

  return (
    <section>
      <Input
        label="Name"
        type="text"
        placeholder="Enter your name"
        className="my-custom-input"
        onChangeValue={setValue}
        onChangeDebounce={setValueDebounced}
        debounceDelay={1000}
      />
      <br />
      <div>value: {value}</div>
      <div>valueDebounced: {valueDebounced}</div>
    </section>
  );
}
```

### Aditional Props:

- `label`: A label for the input element. If provided, we add a label element with the provided text.

- `onChangeValue`: A callback function that is called when the input value changes.

- `onChangeDebounce`: A callback function that is called when the input value changes after the debounce delay.

- `debounceDelay`: The delay in milliseconds for the debounce. Default 1000.

- `className`: A class name to apply to the input element. If a label is provided, the class name is applied to the label and input elements.

- `transform`: The type of transformation to apply to the input value. Options include "toUpperCase", "toLowerCase", "capitalize", and "titleCase".

- `transformFn`: A custom function to apply to the input value. This function takes a string as input and returns a string as output. If both transform and transformFn are provided, the transformFn function will take precedence.

## Contribution

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create a branch with a meaningful description.
3. Make the desired changes.
4. Open a Pull Request to the main branch.

If you find an issue or have a suggestion to improve the project, feel free to open an issue.

## License

This project is licensed under the MIT License.
