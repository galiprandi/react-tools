import { ComponentProps, useEffect, useState } from 'react'
import { iso2LocalDateTime } from '../../utilities/dates'

import { Input } from '../Input'

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
    const { isoValue, onChangeISOValue, isoMin, isoMax, min, max, ...restProps } =
        props
    const [isoDateTime, setIsoDateTime] =
        useState<DateTimeProps['isoValue']>(isoValue)

    useEffect(() => {
        if (!isoDateTime || !onChangeISOValue) return
        const date = new Date(isoDateTime)
        if (!isNaN(date.getTime())) {
            onChangeISOValue(date.toISOString())
        }
    }, [isoDateTime, onChangeISOValue])

    return (
        <Input
            {...restProps}
            type="datetime-local"
            min={isoMin ? iso2LocalDateTime(isoMin) : min}
            max={isoMax ? iso2LocalDateTime(isoMax) : max}
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
 * @property {string} [isoMin] - The minimum date and time allowed in ISO 8601 format.
 * @property {string} [isoMax] - The maximum date and time allowed in ISO 8601 format.
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
    /**
     * The minimum date and time allowed in ISO 8601 format.
     */
    isoMin?: string
    /**
     * The maximum date and time allowed in ISO 8601 format.
     */
    isoMax?: string
}
