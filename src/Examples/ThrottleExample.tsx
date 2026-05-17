import { useState } from 'react'
import { useThrottle } from '../../lib/main.ts'

export const ThrottleExample = () => {
    const [value, setValue] = useState<string>('')
    const throttledValue = useThrottle(value, 1000)

    return (
        <section>
            <hr />
            <h2>useThrottle</h2>

            <input
                type="text"
                placeholder="Type something..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <p>
                Value: <code>{value || '(empty)'}</code>
                <br />
                Throttled value (1s): <code>{throttledValue || '(empty)'}</code>
            </p>
        </section>
    )
}
