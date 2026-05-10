import { useState } from 'react'
import { useAI } from '../../../lib/hooks/useAI'
import { useLanguageDetection } from '../../../lib/hooks/useLanguageDetection'

export const UseLanguageDetectionPage = () => {
    const ai = useAI()
    const [text, setText] = useState<string>('')
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const detector = useLanguageDetection({ warmup: false })

    const handleDetect = () => {
        if (text.trim()) {
            detector.detect(text)
        }
    }

    const handleReset = () => {
        detector.reset()
        setText('')
    }

    const sampleText = `Hallo und herzlich willkommen! This is a mixed language text. Bonjour le monde!`

    return (
        <main>
            <article>
                <header>
                    <h1>Language Detection</h1>
                </header>

                {/* API Availability Status */}
                <article>
                    <small data-tooltip="Status from useAI hook: Checks if Chrome's Native AI APIs are available">
                        {ai.isAvailable ? '✓ AI Available' : '✗ AI Not Available'}
                    </small>
                </article>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>useLanguageDetection</code> hook provides access to Chrome's native Language Detection API.</p>
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
                            <li><code>results</code>: Array of {`{detectedLanguage, confidence}`} objects</li>
                            <li><code>status</code>: Current detection status</li>
                            <li><code>progress</code>: Download progress if model is downloading</li>
                            <li><code>error</code>: Error object if detection failed</li>
                            <li><code>detect</code>: Function to detect language from text</li>
                            <li><code>reset</code>: Function to reset state</li>
                        </ul>
                    </article>
                </section>

                {/* Text Input */}
                <section>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                        <label htmlFor="text">Text to Analyze</label>
                        <button onClick={() => setText(sampleText)}>Load Sample</button>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        onClick={handleDetect}
                        disabled={!ai.isAvailable || detector.status === 'detecting' || detector.status === 'initializing' || detector.status === 'downloading' || !text.trim()}
                    >
                        {detector.status === 'detecting' ? 'Detecting...' : detector.status === 'initializing' ? 'Initializing...' : detector.status === 'downloading' ? 'Downloading...' : 'Detect Language'}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={detector.status === 'idle'}
                    >
                        Reset
                    </button>
                </div>

                {/* Progress */}
                {detector.progress && (
                    <article>
                        <strong>Downloading Model:</strong> {detector.progress.loaded} / {detector.progress.total}
                    </article>
                )}

                {/* Error */}
                {detector.error && (
                    <article>
                        <strong>Error:</strong> {detector.error.message}
                    </article>
                )}

                {/* Results */}
                {detector.results.length > 0 && (
                    <article>
                        <h3>Detection Results</h3>
                        {detector.results.map((result, index) => (
                            <div key={index}>
                                <strong>#{index + 1}</strong> - Language: <code>{result.detectedLanguage}</code> | 
                                <code>{(result.confidence * 100).toFixed(2)}%</code>
                            </div>
                        ))}
                    </article>
                )}
            </article>
        </main>
    )
}
