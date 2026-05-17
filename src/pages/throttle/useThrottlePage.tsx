import { useState } from 'react'
import { useThrottle } from '../../../lib/main'

export const UseThrottlePage = () => {
    const [value, setValue] = useState<string>('')
    const throttledValue = useThrottle(value, 1000)

    return (
        <main>
            <article>
                <header>
                    <h1>useThrottle</h1>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>useThrottle</code> hook ensures that a value updates at most once every specified limit.</p>
                        <p><strong>Parameters:</strong></p>
                        <ul>
                            <li><code>value</code>: T - The value to throttle</li>
                            <li><code>limit</code>: number - Limit in milliseconds (default: 500)</li>
                        </ul>
                        <p><strong>Returns:</strong></p>
                        <ul>
                            <li><code>T</code> - The throttled value</li>
                        </ul>
                        <p><strong>Use Cases:</strong></p>
                        <ul>
                            <li>Window resizing or scrolling events</li>
                            <li>Limiting frequent state updates</li>
                            <li>Improving performance in high-frequency interactions</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <input
                            type="text"
                            placeholder="Type something..."
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                        <details>
                            <summary>Current State</summary>
                            <pre>
                                <code>{JSON.stringify({ value, throttledValue }, null, 2)}</code>
                            </pre>
                        </details>
                        <p>
                            <strong>Value:</strong> <code>{value || '(empty)'}</code>
                            <br />
                            <strong>Throttled value (1s):</strong> <code>{throttledValue || '(empty)'}</code>
                        </p>
                    </article>
                </section>
            </article>
        </main>
    )
}
