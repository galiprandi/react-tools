import { ReactNode, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { textTransforms } from "../../utilities/strings";

export function Input(props: InputProps) {
  const { transform, transformFn, ...restProps } = props;
  const [value, setValue] = useState(props.defaultValue);
  const [valueDebounce] = useDebounce(value, props.debounceDelay ?? 1000);

  // Update the debounced value
  useEffect(() => {
    props?.onChangeDebounce && props?.onChangeDebounce(valueDebounce);
  }, [props, valueDebounce]);

  // Update the value
  useEffect(() => {
    props?.onChangeValue && props?.onChangeValue(value);
  }, [props, value]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    if (transform) inputValue = textTransforms(inputValue, transform);
    if (transformFn) inputValue = transformFn(inputValue);
    setValue(inputValue);
    props.onChange && props.onChange(e);
  };

  return props.label ? (
    <label className={props.className}>
      {props.label}
      <input {...restProps} value={value} onChange={handleOnChange} />
    </label>
  ) : (
    <input {...restProps} value={value} onChange={handleOnChange} />
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  onChangeValue?: (value: TData) => void;
  onChangeDebounce?: (value: TData) => void;
  debounceDelay?: number;
  transform?: Parameters<typeof textTransforms>[1];
  transformFn?: (value: string) => string;
}

type TData = React.InputHTMLAttributes<HTMLInputElement>["value"];
