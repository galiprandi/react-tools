import { useState } from 'react'
import { useDebounce } from '../../../lib/main'

export const UseDebouncePage = () => {
    const [value, setValue] = useState<string>('')
    const debouncedValue = useDebounce(value, 1000)

    return (
        <main className="container">
            <article>
                <header>
                    <h1>useDebounce</h1>
                    <p>Debounce hook for delaying function execution</p>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article className="secondary">
                        <p>The <code>useDebounce</code> hook delays the update of a value until a specified delay has passed since the last change.</p>
                        <p><strong>Parameters:</strong></p>
                        <ul>
                            <li><code>value</code>: T - The value to debounce</li>
                            <li><code>delay</code>: number - Delay in milliseconds (default: 500)</li>
                        </ul>
                        <p><strong>Returns:</strong></p>
                        <ul>
                            <li><code>T</code> - The debounced value</li>
                        </ul>
                        <p><strong>Use Cases:</strong></p>
                        <ul>
                            <li>Search input debouncing</li>
                            <li>API request throttling</li>
                            <li>Auto-save functionality</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article className="secondary">
                        <input
                            type="text"
                            placeholder="Type something..."
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        <details>
                            <summary>Current State</summary>
                            <pre>
                                <code>{JSON.stringify({ value, debouncedValue }, null, 2)}</code>
                            </pre>
                        </details>
                        <p>
                            <strong>Value:</strong> <code>{value || '(empty)'}</code>
                            <br />
                            <strong>Debounced value (1s):</strong> <code>{debouncedValue || '(empty)'}</code>
                        </p>
                    </article>
                </section>
            </article>
        </main>
    )
}
