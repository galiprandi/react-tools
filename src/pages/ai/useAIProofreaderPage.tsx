import { useState, useEffect } from 'react'
import { useAI } from '../../../lib/hooks/useAI'
import { useAIProofreader, type UseAIProofreaderOptions } from '../../../lib/hooks/useAIProofreader'

export const UseAIProofreaderPage = () => {
    const ai = useAI()
    const [text, setText] = useState<string>('')
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [options, setOptions] = useState<UseAIProofreaderOptions>({
        expectedInputLanguages: ['en'],
        warmup: true,
    })
    const proofreader = useAIProofreader(options)
    const handleProofread = () => {
        if (text.trim()) {
            proofreader.proofread(text)
        }
    }

    const handleReset = () => {
        proofreader.reset()
        setText('')
    }

    // Load sample text on mount
    useEffect(() => {
        setText(sampleText)
    }, [])

    const sampleText = `I seen him yesterday at the store.`

    return (
        <main className="container">
            <article>
                <header>
                    <h1>useAIProofreader</h1>
                </header>

                {/* API Availability Status */}
                <article role="alert">
                    <small data-tooltip="Status from useAI hook: Checks if Chrome's Native AI Proofreader API is available">
                        {ai.isAvailable ? '✓ AI Available' : '✗ AI Not Available'}
                    </small>
                </article>

                {/* Configuration */}
                <section>
                    <h3>Configuration</h3>
                    <div className="grid">
                        <div>
                            <label htmlFor="expectedInputLanguages" data-tooltip="Expected input languages (BCP 47 format). Currently only 'en' is supported by the Proofreader API">
                                Expected Input Languages
                            </label>
                            <input
                                id="expectedInputLanguages"
                                type="text"
                                value={options.expectedInputLanguages?.join(', ') || ''}
                                onChange={(e) => setOptions({ 
                                    ...options, 
                                    expectedInputLanguages: e.target.value 
                                        ? e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0) 
                                        : undefined 
                                })}
                                placeholder="en"
                                disabled
                            />
                            <small>Currently only English is supported by the Proofreader API</small>
                        </div>

                        <label data-tooltip="Preload the model on component mount (faster first proofread)">
                            <input
                                type="checkbox"
                                role="switch"
                                checked={options.warmup ?? true}
                                onChange={(e) => setOptions({ ...options, warmup: e.target.checked })}
                            />
                            Warmup
                        </label>
                    </div>
                </section>

                {/* Text Input */}
                <section>
                    <div>
                        <label htmlFor="text">Text to Proofread</label>
                        <button onClick={() => setText(sampleText)}>Load Sample</button>
                    </div>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to proofread..."
                        rows={isExpanded ? 20 : 1}
                    />
                    <button onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? '▼ Collapse' : '▲ Expand'}
                    </button>
                </section>

                {/* Action Buttons */}
                <div className="grid">
                    <button
                        onClick={handleProofread}
                        disabled={!ai.isAvailable || proofreader.status === 'proofreading' || proofreader.status === 'initializing' || proofreader.status === 'downloading' || !text.trim()}
                    >
                        {proofreader.status === 'proofreading' ? 'Proofreading...' : proofreader.status === 'initializing' ? 'Initializing...' : proofreader.status === 'downloading' ? 'Downloading...' : 'Proofread'}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={proofreader.status === 'idle'}
                    >
                        Reset
                    </button>
                </div>

                {/* Progress */}
                {proofreader.progress && (
                    <article role="status">
                        <strong>Downloading Model:</strong>
                        <progress value={proofreader.progress.loaded} max={proofreader.progress.total} />
                    </article>
                )}

                {/* Error */}
                {proofreader.error && (
                    <article role="alert">
                        <strong>Error:</strong> {proofreader.error.message}
                    </article>
                )}

                {/* Result */}
                {proofreader.data && (
                    <article>
                        <h3>Corrected Text</h3>
                        <p>{proofreader.data}</p>
                        
                        {proofreader.corrections.length > 0 && (
                            <details>
                                <summary>Corrections ({proofreader.corrections.length})</summary>
                                <ul>
                                    {proofreader.corrections.map((correction, index) => (
                                        <li key={index}>
                                            <strong>Position {correction.startIndex}-{correction.endIndex}:</strong>
                                            <span> {text.slice(correction.startIndex, correction.endIndex)}</span>
                                            {correction.type && <span> - Type: {correction.type}</span>}
                                            {correction.explanation && <span> - {correction.explanation}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </article>
                )}
            </article>
        </main>
    )
}
