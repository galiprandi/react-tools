import { useState } from 'react'
import { DateTime, type DateTimeProps } from '../../lib/components/DateTime'

export const DateTimeExample = () => {
    const now = new Date().toISOString()
    const [isoValue, setIsoValue] = useState<DateTimeProps['isoValue']>(now)

    return (
        <section>
            <hr />
            <h2>DateTime</h2>
            <DateTime
                // Custom attributes
                isoValue={isoValue}
                label="Date"
                onChangeISOValue={setIsoValue}
            />
            <p>
                Input: <code>{now}</code>
                <br />
                onChangeISOValue: <code>{isoValue}</code>
            </p>
        </section>
    )
}
