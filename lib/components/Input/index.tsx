import { ReactNode, useEffect, useId, useState, forwardRef } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { valueTransforms } from '../../utilities/strings'

/**
 * Input component - a wrapper of HTML input that can receive all their properties and methods.
 *
 * @param {InputProps} props - The props for the Input component.
 * @returns {JSX.Element} - Returns a JSX element representing the input component.
 *
 * Example usage:
 *
 * ```tsx
 * const handleChangeValue = (value: string) => {
 *     console.log(value);
 * };
 *
 * const handleChangeDebounce = (value: string) => {
 *     console.log('Debounced:', value);
 * };
 *
 * <Input
 *     type="text"
 *     placeholder="Enter your name and last name"
 *     value={value}
 *     label="Name and Last Name"
 *     onChangeValue={handleChangeValue}
 *     onChangeDebounce={handleChangeDebounce}
 *     debounceDelay={300}
 *     transform="pascalCase"
 *     className="input-class"
 *     datalist={['john.doe', 'jane.doe', 'john.smith']}
 * />;
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const {
        label,
        datalist,
        onChangeValue,
        onChangeDebounce,
        debounceDelay = 0,
        transform,
        transformFn,
        ...restProps
    } = props
    const [value, setValue] = useState(props.value ?? '')
    const valueDebounce = useDebounce(value, debounceDelay)

    // Generate a unique id for the datalist
    const baseId = props.id ?? useId()
    // Sanitize ID to be valid as CSS selector (replace special chars with dashes)
    const sanitizedId = baseId.replace(/[^a-zA-Z0-9-_]/g, '-')
    const did = `datalist-${sanitizedId}`

    // Update the value state when props.value changes (controlled component support)
    useEffect(() => {
        if (props.value !== undefined) {
            setValue(props.value)
        }
    }, [props.value])

    // Update the debounced value
    useEffect(() => {
        if (onChangeDebounce) onChangeDebounce(valueDebounce)
    }, [valueDebounce, onChangeDebounce])

    // Handle the input change
    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = event.target.value
        if (transform) inputValue = valueTransforms(inputValue, transform)
        if (transformFn) inputValue = transformFn(inputValue)
        if (props.onChange) props.onChange(event)
        setValue(inputValue)
        if (onChangeValue) onChangeValue(inputValue)
    }

    return (
        <LabeledContainer label={label}>
            <input
                {...restProps}
                ref={ref}
                value={value}
                onChange={handleOnChange}
                list={did}
            />

            {!!datalist?.length && (
                <datalist id={did}>
                    {datalist.map((option, index) => (
                        <option key={index} value={option}></option>
                    ))}
                </datalist>
            )}
        </LabeledContainer>
    )
})

Input.displayName = 'Input'

/**
 * Internal component to wrap the input with a label if provided.
 *
 * @param props - The props for the LabeledContainer component.
 * @param props.label - The label to display.
 * @param props.className - Optional CSS class for the label element.
 * @param props.children - The input element to be wrapped.
 * @returns The wrapped input or just the input if no label is provided.
 */
const LabeledContainer = ({
    label,
    className,
    children,
}: {
    label: ReactNode
    className?: string
    children: ReactNode
}) =>
    label ? (
        <label className={className}>
            {label}
            {children}
        </label>
    ) : (
        children
    )

/**
 * Props for the Input component.
 * Extends standard HTML input attributes.
 */
export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * The label for the input field. If provided, the input field will be wrapped in a label element.
     */
    label?: ReactNode
    /**
     * The list of options for the input field. If provided, the input field will have a datalist element.
     */
    datalist?: string[]
    /**
     * Callback function triggered on value change and receives the current value of the input field.
     *
     * @param value - The current value of the input field.
     */
    onChangeValue?: (value: TData) => void
    /**
     * Callback function triggered on debounced value change. It receives the debounced value of the input field.
     *
     * @param value - The debounced value of the input field.
     */
    onChangeDebounce?: (value: TData) => void
    /**
     * Delay time in milliseconds for debouncing input changes. If set to 0, the debouncing is disabled.
     *
     * @default 0
     */
    debounceDelay?: number
    /**
     * Transformation type for the input value (e.g., "uppercase", "lowercase").
     * Can be a single transform or an array of transforms to apply sequentially.
     */
    transform?: Parameters<typeof valueTransforms>[1]
    /**
     * Custom transformation function for the input value. If provided, it will apply after the default transformation.
     *
     * @param value - The current value of the input field.
     * @returns The transformed value of the input field.
     */
    transformFn?: (value: string) => string
}

type TData = React.InputHTMLAttributes<HTMLInputElement>['value']
