import { useState } from 'react'
import { useAI } from '../../../lib/hooks/useAI'
import { useLanguageDetection } from '../../../lib/hooks/useLanguageDetection'

const sampleText = `Hallo und herzlich willkommen! This is a mixed language text. Bonjour le monde!`

export const UseLanguageDetectionPage = () => {
    const ai = useAI()
    const [text, setText] = useState<string>(sampleText)
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const detector = useLanguageDetection({ text, warmup: false })

    const handleReset = () => {
        detector.reset()
        setText(sampleText)
    }

    return (
        <main>
            <article>
                <header>
                    <h1>useLanguageDetection</h1>
                </header>

                {/* API Availability Status */}
                <article role="alert">
                    <small data-tooltip="Status from useAI hook: Checks if Chrome's Native AI APIs are available">
                        {ai.isAvailable ? '✓ AI Available' : '✗ AI Not Available'}
                    </small>
                </article>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>useLanguageDetection</code> hook provides access to Chrome&apos;s native Language Detection API.</p>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Detects language from text with confidence scores</li>
                            <li>Returns ranked list of possible languages (most likely first)</li>
                            <li>Automatic model download progress tracking</li>
                            <li>User activation check for security</li>
                            <li>Automatic cleanup on unmount</li>
                        </ul>
                        <p><strong>Returns:</strong></p>
                        <ul>
                            <li><code>lang</code>: Most likely detected language code</li>
                            <li><code>confidence</code>: Confidence of the most likely detection</li>
                            <li><code>allLangs</code>: All detected languages with confidence scores</li>
                            <li><code>userLang</code>: User&apos;s browser language code</li>
                            <li><code>isUserLang</code>: Whether detected language matches user&apos;s language</li>
                            <li><code>status</code>: Current detection status</li>
                            <li><code>progress</code>: Download progress if model is downloading</li>
                            <li><code>error</code>: Error object if detection failed</li>
                            <li><code>reset</code>: Function to reset state</li>
                        </ul>
                    </article>
                </section>

                {/* Text Input */}
                <section>
                    <div>
                        <label htmlFor="text">Text to Analyze</label>
                    </div>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to detect language..."
                        rows={isExpanded ? 20 : 1}
                    />
                    <button onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? '▼ Collapse' : '▲ Expand'}
                    </button>
                </section>

                {/* Action Buttons */}
                <div className="grid">
                    <button
                        onClick={handleReset}
                        disabled={detector.status === 'idle'}
                    >
                        Reset
                    </button>
                </div>

                {/* Progress */}
                {detector.progress && (
                    <article role="status">
                        <strong>Downloading Model:</strong>
                        <progress value={detector.progress.loaded} max={detector.progress.total} />
                    </article>
                )}

                {/* Error */}
                {detector.error && (
                    <article role="alert">
                        <strong>Error:</strong> {detector.error.message}
                    </article>
                )}

                {/* Results */}
                {detector.allLangs && detector.allLangs.length > 0 && (
                    <article>
                        <h3>Detection Results</h3>
                        {detector.allLangs.map((result, index) => (
                            <div key={index}>
                                <strong>#{index + 1}</strong> - Language: <code>{result.lang}</code> | 
                                Confidence: <code>{(result.confidence * 100).toFixed(2)}%</code>
                            </div>
                        ))}
                    </article>
                )}
            </article>
        </main>
    )
}
