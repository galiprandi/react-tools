import { ReactNode, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export function Input(props: InputProps) {
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
    const inputValue = e.target.value;
    setValue(inputValue);
    props.onChange && props.onChange(e);
  };

  const { ...restProps } = props;

  return props.label ? (
    <label className={props.className}>
      {props.label}
      <input {...restProps} value={value} onChange={handleOnChange} />
    </label>
  ) : (
    <input {...restProps} value={value} onChange={handleOnChange} />
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  onChangeValue?: (
    value: React.InputHTMLAttributes<HTMLInputElement>["value"]
  ) => void;
  onChangeDebounce?: (
    value: React.InputHTMLAttributes<HTMLInputElement>["value"]
  ) => void;
  debounceDelay?: number;
}
