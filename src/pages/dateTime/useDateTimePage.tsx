import { useState } from 'react'
import { DateTime, type DateTimeProps } from '../../../lib/main'

export const UseDateTimePage = () => {
    const now = new Date().toISOString()
    const [isoValue, setIsoValue] = useState<DateTimeProps['isoValue']>(now)

    return (
        <main>
            <article>
                <header>
                    <h1>DateTime</h1>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>DateTime</code> component provides an accessible date and time input with ISO value support.</p>
                        <p><strong>Props:</strong></p>
                        <ul>
                            <li><code>isoValue</code>: string - ISO 8601 date string</li>
                            <li><code>label</code>: string - Accessible label for the input</li>
                            <li><code>onChangeISOValue</code>: (value: string) =&gt; void - Callback when ISO value changes</li>
                        </ul>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Full keyboard navigation</li>
                            <li>Screen reader support</li>
                            <li>ISO 8601 format handling</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <DateTime
                            isoValue={isoValue}
                            label="Date"
                            onChangeISOValue={setIsoValue}
                        />
                        <details>
                            <summary>Current State</summary>
                            <pre>
                                <code>{JSON.stringify({ isoValue }, null, 2)}</code>
                            </pre>
                        </details>
                    </article>
                </section>
            </article>
        </main>
    )
}
