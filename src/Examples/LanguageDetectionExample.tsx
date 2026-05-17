import { useState } from 'react'
import { useAI } from '../../lib/hooks/useAI'
import { useLanguageDetection } from '../../lib/hooks/useLanguageDetection'

export const LanguageDetectionExample = () => {
    const ai = useAI()
    const [text, setText] = useState('Hallo und herzlich willkommen!')
    const [isTextareaExpanded, setIsTextareaExpanded] = useState(false)
    const detector = useLanguageDetection({ warmup: true })

    const handleDetect = () => {
        if (text.trim()) {
            detector.detect(text)
        }
    }

    const handleReset = () => {
        detector.reset()
        setText('')
    }

    return (
        <section>
            <hr />
            <h2>Language Detection</h2>
            
            {/* AI Availability */}
            <div style={{ marginBottom: '1rem' }}>
                <h3>AI Availability</h3>
                <p><strong>Status:</strong> {ai.status}</p>
                <p><strong>Available:</strong> {ai.isAvailable ? 'Yes' : 'No'}</p>
                <p><strong>Availability:</strong> {ai.availability}</p>
            </div>

            {/* Text Input */}
            <div style={{ marginBottom: '1rem' }}>
                <h3>Text to Detect</h3>
                <button
                    onClick={() => setIsTextareaExpanded(!isTextareaExpanded)}
                    style={{
                        padding: '0.25rem 0.5rem',
                        marginBottom: '0.5rem',
                        background: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                    }}
                >
                    {isTextareaExpanded ? 'Collapse' : 'Expand'}
                </button>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to detect language..."
                    rows={isTextareaExpanded ? 20 : 6}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#000' }}
                />
            </div>

            {/* Buttons */}
            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={handleDetect}
                    disabled={!ai.isAvailable || detector.status === 'detecting' || detector.status === 'initializing' || detector.status === 'downloading' || !text.trim()}
                    style={{
                        padding: '0.5rem 1rem',
                        marginRight: '0.5rem',
                        background: ai.isAvailable ? '#0070f3' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: ai.isAvailable ? 'pointer' : 'not-allowed',
                    }}
                >
                    {detector.status === 'detecting' ? 'Detecting...' : detector.status === 'initializing' ? 'Initializing...' : detector.status === 'downloading' ? 'Downloading...' : 'Detect'}
                </button>
                <button
                    onClick={handleReset}
                    disabled={detector.status === 'idle'}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: detector.status !== 'idle' ? 'pointer' : 'not-allowed',
                    }}
                >
                    Reset
                </button>
            </div>

            {/* Progress */}
            {detector.progress && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e3f2fd', borderRadius: '4px', color: '#000' }}>
                    <strong>Downloading Model:</strong> {detector.progress.loaded} / {detector.progress.total}
                </div>
            )}

            {/* Status */}
            <p style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong> {detector.status}
            </p>

            {/* Error */}
            {detector.error && (
                <p style={{ color: 'red', marginBottom: '1rem' }}>
                    <strong>Error:</strong> {detector.error.message}
                </p>
            )}

            {/* Results */}
            {detector.results.length > 0 && (
                <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '4px', color: '#000' }}>
                    <h3>Detection Results</h3>
                    {detector.results.map((result, index) => (
                        <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: index === 0 ? '#e8f5e9' : '#f5f5f5', borderRadius: '4px' }}>
                            <strong>#{index + 1}</strong> - Language: <code>{result.detectedLanguage}</code> | 
                            Confidence: <code>{(result.confidence * 100).toFixed(2)}%</code>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
