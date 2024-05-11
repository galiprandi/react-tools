import { ReactNode, useEffect, useState } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { valueTransforms } from '../../utilities/strings'

export function Input(props: InputProps) {
    const {
        label,
        onChangeValue,
        onChangeDebounce,
        debounceDelay = 0,
        transform,
        transformFn,
        ...restProps
    } = props
    const [value, setValue] = useState(props.value ?? '')
    const valueDebounce = useDebounce(value, debounceDelay)

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

    if (label)
        return (
            <label className={props.className}>
                {label}
                <input {...restProps} value={value} onChange={handleOnChange} />
            </label>
        )

    return <input {...restProps} value={value} onChange={handleOnChange} />
}

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: ReactNode
    onChangeValue?: (value: TData) => void
    onChangeDebounce?: (value: TData) => void
    debounceDelay?: number
    transform?: Parameters<typeof valueTransforms>[1]
    transformFn?: (value: string) => string
}

type TData = React.InputHTMLAttributes<HTMLInputElement>['value']
