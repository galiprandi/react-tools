import { ComponentProps, useState } from "react";
import { Input } from "../../lib/components/Input";

export const InputComponent = () => {
  const [value, setValue] = useState<ComponentProps<typeof Input>["value"]>();
  const [valueDebounced, setValueDebounced] =
    useState<ComponentProps<typeof Input>["value"]>();
  return (
    <section>
      <hr />
      <h2>Input</h2>
      <p>
        The <code>Input</code> component is a simple wrapper around the native
        <code>input</code> element. It accepts all the same props as the native
        input element and adds a few additional props for convenience.
      </p>

      <Input
        type="text"
        placeholder="Enter your name"
        // Custom attributes
        label="Name"
        className="my-custom-input"
        onChangeValue={setValue}
        onChangeDebounce={setValueDebounced}
        debounceDelay={1000}
        transform="titleCase"
      />
      <br />
      <div>value: {value}</div>
      <div>valueDebounced: {valueDebounced}</div>

      <h3>Additional Props:</h3>
      <ul>
        <li>
          <code>label</code> - A label for the input element. If provided, we
          add a label element with the provided text.
        </li>
        <li>
          <code>onChangeValue</code> - A callback function that is called when
          the input value changes.
        </li>
        <li>
          <code>onChangeDebounce</code> - A callback function that is called
          when the input value changes after the debounce delay.
        </li>
        <li>
          <code>delay</code> - The delay in milliseconds for the debounce.
          <small>Default: 1000</small>
        </li>
        <li>
          <code>className</code> - A class name to apply to the input element.
          If a label is provided, the class name is applied to the label and
          input elements.
        </li>
      </ul>
    </section>
  );
};
