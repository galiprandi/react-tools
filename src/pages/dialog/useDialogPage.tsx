import { Dialog } from '../../../lib/main'

export const UseDialogPage = () => {
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
                            <li><code>wrapper</code>: keyof JSX.IntrinsicElements - Wrapper element type</li>
                            <li><code>threshold</code>: number - Intersection threshold for Observer</li>
                            <li><code>onAppear</code>: () =&gt; void - Callback when element appears in viewport</li>
                            <li><code>onDisappear</code>: () =&gt; void - Callback when element disappears from viewport</li>
                        </ul>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Native HTML dialog element</li>
                            <li>Modal and dialog modes</li>
                            <li>Accessibility support</li>
                            <li>Intersection Observer integration</li>
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
                            onOpen={() => console.info('Dialog opened')}
                            onClose={() => console.info('Dialog closed')}
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
                    </article>
                </section>
            </article>
        </main>
    )
}
