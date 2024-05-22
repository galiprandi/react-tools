import { ComponentProps, useEffect, useState } from 'react'
import { Input } from '../../main'

/**
 * DateTime component for selecting date and time in RFC 3339 format.
 * @param {DateTimeProps} props - Props for the DateTime component.
 * @returns {JSX.Element} - DateTime component JSX.
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
            value={isoDateTime ? isoToDateTime(isoDateTime) : props.value}
            onChangeValue={(value) =>
                typeof value === 'string'
                    ? setIsoDateTime(value)
                    : setIsoDateTime(undefined)
            }
        />
    )
}

export interface DateTimeProps
    extends Omit<ComponentProps<typeof Input>, 'type'> {
    isoValue?: string
    onChangeISOValue?: (value: string) => void
}

// Input:  2024-05-14T13:00:00.000Z
// Output: 2024-05-14T10:00
const isoToDateTime = (
    date?: DateTimeProps['isoValue'],
): string | undefined => {
    if (!date || typeof date !== 'string') return date
    const d = new Date(date)
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
}
