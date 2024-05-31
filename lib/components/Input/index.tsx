import { ReactNode, useEffect, useState } from 'react'
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
 *     label="Username"
 *     onChangeValue={handleChangeValue}
 *     onChangeDebounce={handleChangeDebounce}
 *     debounceDelay={300}
 *     transform="uppercase"
 *     className="input-class"
 * />;
 * ```
 * 
 *  * Example usage with optional datalist prop:
 * 
 * - Note: id prop is required when using datalist prop
 * 
 * <Input
 *     className="input-class"
 *     label="Choose your option"
 *     id='test_input'
 *     datalist={['Option 1', 'Option 2', 'Option 3']}
 * />;
 * ```
 */
export function Input(props: InputProps): JSX.Element {
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

    //Check and throw error when 'id' prop is not present with 'datalist' prop
    if (datalist && !props.id) {
        throw new Error("The 'id' prop is required when 'datalist' prop is provided.")
    }

    // Update the debounced value
    useEffect(() => {
        if (onChangeDebounce) onChangeDebounce(valueDebounce)
    }, [valueDebounce, onChangeDebounce])

    // Update the value
    useEffect(() => {
        if (onChangeValue) onChangeValue(value)
    }, [value, onChangeValue])

    // Handle the input change
    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = event.target.value
        if (transform) inputValue = valueTransforms(inputValue, transform)
        if (transformFn) inputValue = transformFn(inputValue)
        if (props.onChange) props.onChange(event)
        setValue(inputValue)
    }

    if (datalist) {
        return (
            label ? (
                <label className={props.className}>
                    {label}
                    <input {...restProps} value={value} onChange={handleOnChange} list={props.id ? `${props.id}-datalist` : undefined} />
                    {datalist && (
                        <datalist id={`${props.id}-datalist`}>
                            {datalist.map((option, index) => (
                                <option key={index} value={option}></option>
                            ))}
                        </datalist>
                    )}
                </label>
            ) : (
                <>
                    <input {...restProps} value={value} onChange={handleOnChange} list={props.id ? `${props.id}-datalist` : undefined} />
                    {datalist && (
                        <datalist id={`${props.id}-datalist`}>
                            {datalist.map((option, index) => (
                                <option key={index} value={option}></option>
                            ))}
                        </datalist>
                    )}
                </>
            )
        )
    } 
    
    if (label) {
        return (
            <label className={props.className}>
                {label}
                <input {...restProps} value={value} onChange={handleOnChange} />
            </label>
        )
    }
     
    return <input {...restProps} value={value} onChange={handleOnChange} />
}

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * The label for the input field. If provided, the input field will be wrapped in a label element.
     */
    label?: ReactNode
    /**
     * Callback function triggered on value change and receives the current value of the input field.
     *
     * @param {TData} value - The current value of the input field.
     */
    datalist?: string[]
    /**
     * Callback function triggered on value change and receives the current value of the input field.
     *
     * @param {TData} value - The current value of the input field.
     */
    onChangeValue?: (value: TData) => void
    /**
     * Callback function triggered on debounced value change. It receives the debounced value of the input field.
     *
     * @param {TData} value - The debounced value of the input field.
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
     */
    transform?: Parameters<typeof valueTransforms>[1]
    /**
     * Custom transformation function for the input value. If provided, it will apply after the default transformation.
     *
     * @param {string} value - The current value of the input field.
     * @returns {string} - The transformed value of the input field.
     */
    transformFn?: (value: string) => string
}

type TData = React.InputHTMLAttributes<HTMLInputElement>['value']
