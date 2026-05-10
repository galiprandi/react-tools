import { useAI } from '../../../lib/hooks/useAI'

export const UseAIPage = () => {
    const ai = useAI()

    return (
        <main>
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
                    <div>
                        <div>
                            <label>Status</label>
                            <p>{ai.status}</p>
                        </div>
                        <div>
                            <label>Summarizer</label>
                            <p>{ai.apis.summarizer.availability}</p>
                        </div>
                        <div>
                            <label>Translator</label>
                            <p>{ai.apis.translator.availability}</p>
                        </div>
                        <div>
                            <label>Language Detector</label>
                            <p>{ai.apis.languageDetector.availability}</p>
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
                    <article>
                        <p>The <code>useAI</code> hook checks the availability of Chrome&apos;s Native AI APIs.</p>
                        <p><strong>Returns:</strong></p>
                        <ul>
                            <li><code>isAvailable</code>: boolean - Whether all requested APIs are available</li>
                            <li><code>status</code>: &apos;idle&apos; | &apos;loading&apos; | &apos;ready&apos; | &apos;error&apos;</li>
                            <li><code>apis</code>: Object with availability status for each API</li>
                            <li><code>error</code>: Error | null</li>
                        </ul>
                    </article>
                </section>
            </article>
        </main>
    )
}
