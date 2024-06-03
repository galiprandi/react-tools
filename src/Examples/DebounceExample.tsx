import { useState } from 'react'
import { useDebounce } from '../../lib/main.ts'

export const DebounceExample = () => {
    const [value, setValue] = useState<string>()
    const debouncedValue = useDebounce(value, 1000)

    return (
        <section>
            <hr />
            <h2>useDebounce</h2>

            <input
                type="text"
                placeholder="Type something..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            <p>
                Value: <code>{value}</code>
                <br />
                Debounced value (1s): <code>{debouncedValue}</code>
            </p>
        </section>
    )
}
