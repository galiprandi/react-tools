import { useAI } from '../../../lib/hooks/useAI'

export const UseAIPage = () => {
    const ai = useAI()

    return (
        <main className="container">
            <article>
                <header>
                    <h1>AI Status</h1>
                    <p>Chrome&apos;s Native AI API Availability</p>
                </header>

                {/* AI Status */}
                <nav>
                    <ul>
                        <li>
                            <a
                                href="#"
                                className={ai.isAvailable ? 'success' : 'error'}
                                data-tooltip="Status from useAI hook: Checks if Chrome's Native AI Summarizer API is available"
                                onClick={(e) => e.preventDefault()}
                            >
                                {ai.isAvailable ? '✓ AI Available' : '✗ AI Not Available'}
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Detailed Status */}
                <section>
                    <h3>Detailed Status</h3>
                    <div className="grid">
                        <div>
                            <label>Status</label>
                            <p>{ai.status}</p>
                        </div>
                        <div>
                            <label>Availability</label>
                            <p>{ai.availability}</p>
                        </div>
                    </div>

                    {ai.error && (
                        <article className="error" role="alert">
                            <strong>Error:</strong> {ai.error.message}
                        </article>
                    )}
                </section>

                {/* Hook Information */}
                <section>
                    <h3>useAI Hook</h3>
                    <article className="secondary">
                        <p>The <code>useAI</code> hook checks the availability of Chrome&apos;s Native AI Summarizer API.</p>
                        <p><strong>Returns:</strong></p>
                        <ul>
                            <li><code>isAvailable</code>: boolean - Whether the API is available</li>
                            <li><code>availability</code>: &apos;unavailable&apos; | &apos;downloadable&apos; | &apos;downloading&apos; | &apos;available&apos;</li>
                            <li><code>status</code>: &apos;idle&apos; | &apos;loading&apos; | &apos;ready&apos; | &apos;error&apos;</li>
                            <li><code>error</code>: Error | null</li>
                        </ul>
                    </article>
                </section>
            </article>
        </main>
    )
}
