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
                onChangeISOVale={setIsoValue}
            />
            <p>
                Input: <code>{now}</code>
                <br />
                onChangeISOVale: <code>{isoValue}</code>
            </p>
        </section>
    )
}
