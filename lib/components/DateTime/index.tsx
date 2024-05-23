import { ComponentProps, useEffect, useState } from 'react'
import { Input } from '../../main'

/**
 * DateTime component - A wrapper for the Input component that handles ISO date-time values.
 *
 * @param {DateTimeProps} props - The props for the DateTime component.
 * @returns {JSX.Element} - Returns a JSX element representing the date-time input component.
 *
 * Example usage:
 *
 * ```tsx
 * const MyComponent = () => {
 *     const [isoValue, setIsoValue] = useState('2024-05-14T13:00:00.000Z');
 *
 *     const handleChangeISOValue = (value: string) => {
 *         setIsoValue(value);
 *     };
 *
 *     return (
 *         <DateTime
 *             isoValue={isoValue}
 *             onChangeISOValue={handleChangeISOValue}
 *             label="Select Date and Time"
 *             className="datetime-input"
 *         />
 *     );
 * };
 * ```
 */
export const DateTime = (props: DateTimeProps): JSX.Element => {
    const { isoValue, onChangeISOValue, ...restProps } = props
    const [isoDateTime, setIsoDateTime] =
        useState<DateTimeProps['isoValue']>(isoValue)

    useEffect(() => {
        if (!isoDateTime || !onChangeISOValue) return
        onChangeISOValue(new Date(isoDateTime).toISOString())
    }, [isoDateTime, onChangeISOValue])

    return (
        <Input
            {...restProps}
            type="datetime-local"
            value={isoDateTime ? iso2LocalDateTime(isoDateTime) : props.value}
            onChangeValue={(value) =>
                typeof value === 'string'
                    ? setIsoDateTime(value)
                    : setIsoDateTime(undefined)
            }
        />
    )
}

/**
 * The properties for the DateTime component.
 *
 * @interface DateTimeProps
 * @extends {Omit<ComponentProps<typeof Input>, 'type'>}
 *
 * @property {string} [isoValue] - The ISO date-time string value.
 * @property {(value: string) => void} [onChangeISOValue] - Callback function triggered when the ISO date-time value changes.
 */
export interface DateTimeProps
    extends Omit<ComponentProps<typeof Input>, 'type'> {
    /**
     * The ISO date-time string value in format "YYYY-MM-DDTHH:MM:SS.sssZ".
     */
    isoValue?: string
    /**
     * Callback function triggered when component date-time value changes.
     *
     * @param {string} value - The new ISO date-time value in format "YYYY-MM-DDTHH:MM:SS.sssZ".
     */
    onChangeISOValue?: (value: string) => void
}

/**
 * Converts an ISO date-time string to a local date-time string.
 *
 * @param {string} [date] - The ISO date-time string.
 * @returns {string | undefined} - The local date-time string or undefined if the input is invalid.
 *
 * Example:
 *
 * ```js
 * // Input:  2024-05-14T13:00:00.000Z
 * // Output: 2024-05-14T10:00
 * const localDateTime = iso2LocalDateTime('2024-05-14T13:00:00.000Z');
 * console.log(localDateTime); // "2024-05-14T10:00"
 * ```
 */
const iso2LocalDateTime = (
    date?: DateTimeProps['isoValue'],
): string | undefined => {
    if (!date || typeof date !== 'string') return date
    const d = new Date(date)
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
}
