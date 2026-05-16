import { Dialog } from '../../../lib/main'
import { useState } from 'react'

export const UseDialogPage = () => {
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (message: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    }

    return (
        <main>
            <article>
                <header>
                    <h1>Dialog</h1>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>Dialog</code> component provides an accessible dialog using the HTML &lt;dialog&gt; element.</p>
                        <p><strong>Props:</strong></p>
                        <ul>
                            <li><code>behavior</code>: &apos;dialog&apos; | &apos;modal&apos; - Dialog behavior mode</li>
                            <li><code>opener</code>: ReactNode - Button or element to open the dialog</li>
                            <li><code>onOpen</code>: () =&gt; void - Callback when dialog opens</li>
                            <li><code>onClose</code>: () =&gt; void - Callback when dialog closes</li>
                            <li><code>isOpen</code>: boolean - Control dialog state externally</li>
                        </ul>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Native HTML dialog element</li>
                            <li>Modal and dialog modes</li>
                            <li>Accessibility support</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <Dialog
                            behavior="dialog"
                            opener={<button>Toggle Dialog</button>}
                            onOpen={() => {
                                addLog('Dialog opened')
                                console.info('Dialog opened')
                            }}
                            onClose={() => {
                                addLog('Dialog closed')
                                console.info('Dialog closed')
                            }}
                        >
                            <h2>Hello there 👋</h2>
                            <p>This is a dialog example.</p>
                            <p>
                                For information on how to use html dialogs, or styling them,
                                <a
                                    href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    check documentation on MDN website
                                </a>
                            </p>
                        </Dialog>

                        <details>
                            <summary>Callback Logs</summary>
                            <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
                                <code>{logs.join('\n')}</code>
                            </pre>
                        </details>
                    </article>
                </section>
            </article>
        </main>
    )
}
