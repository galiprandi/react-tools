import { useState, useEffect } from 'react'
import { useAI } from '../../../lib/hooks/useAI'
import { useAIWrite, type UseAIWriteOptions } from '../../../lib/hooks/useAIWrite'

export const UseAIWritePage = () => {
    const ai = useAI()
    const [activeTab, setActiveTab] = useState<'options' | 'input'>('options')
    const [prompt, setPrompt] = useState<string>('')
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [options, setOptions] = useState<UseAIWriteOptions>({
        tone: 'neutral',
        format: 'markdown',
        length: 'short',
        streaming: true,
        warmup: true,
    })
    const writer = useAIWrite(options)
    const [displayedText, setDisplayedText] = useState('')
    const [context, setContext] = useState<string>('Write in a professional tone')

    const handleWrite = () => {
        if (prompt.trim()) {
            writer.write(prompt, context || undefined)
        }
    }

    const handleReset = () => {
        writer.reset()
        setPrompt('')
        setDisplayedText('')
    }

    // Load sample prompt on mount
    useEffect(() => {
        setPrompt(samplePrompt)
    }, [])

    // Animate streaming text progressively
    useEffect(() => {
        if (writer.data) {
            if (options.streaming) {
                // When using real streaming, display the data directly as it comes
                setDisplayedText(writer.data)
            } else {
                // When not using streaming, animate the text progressively
                let index = 0
                const text = writer.data
                const interval = setInterval(() => {
                    if (index < text.length) {
                        setDisplayedText(text.slice(0, index + 1))
                        index++
                    } else {
                        clearInterval(interval)
                    }
                }, 20)
                return () => clearInterval(interval)
            }
        }
    }, [writer.data, options.streaming])

    const samplePrompt = `Write a thank you email to a colleague who helped you complete a project ahead of schedule. Mention their attention to detail and collaborative spirit.`

    return (
        <main className="container">
            <article>
                <header>
                    <h1>useAIWrite</h1>
                </header>

                {/* API Availability Status */}
                <article role="alert">
                    <small data-tooltip="Status from useAI hook: Checks if Chrome's Native AI Writer API is available">
                        {ai.isAvailable ? '✓ AI Available' : '✗ AI Not Available'}
                    </small>
                </article>

                {/* Configuration Tabs */}
                <nav>
                    <ul>
                        <li>
                            <a 
                                href="#"
                                className={activeTab === 'options' ? 'secondary' : ''}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setActiveTab('options')
                                }}
                            >
                                Configuration
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#"
                                className={activeTab === 'input' ? 'secondary' : ''}
                                onClick={(e) => {
                                    e.preventDefault()
                                    setActiveTab('input')
                                }}
                            >
                                Prompt Input
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Options Grid */}
                {activeTab === 'options' && (
                    <section>
                        <h3>Configuration</h3>
                        <div className="grid">
                            <div>
                                <label htmlFor="tone" data-tooltip="Writing tone: Formal (professional), Neutral (balanced, default), Casual (friendly)">
                                    Tone
                                </label>
                                <select
                                    id="tone"
                                    value={options.tone}
                                    onChange={(e) => setOptions({ ...options, tone: e.target.value as UseAIWriteOptions['tone'] })}
                                >
                                    <option value="formal">Formal</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="casual">Casual</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="format" data-tooltip="Output format: Markdown (formatted) or Plain Text (plain text)">
                                    Format
                                </label>
                                <select
                                    id="format"
                                    value={options.format}
                                    onChange={(e) => setOptions({ ...options, format: e.target.value as UseAIWriteOptions['format'] })}
                                >
                                    <option value="markdown">Markdown</option>
                                    <option value="plain-text">Plain Text</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="length" data-tooltip="Output length: Short (brief), Medium (moderate), Long (detailed)">
                                    Length
                                </label>
                                <select
                                    id="length"
                                    value={options.length}
                                    onChange={(e) => setOptions({ ...options, length: e.target.value as UseAIWriteOptions['length'] })}
                                >
                                    <option value="short">Short</option>
                                    <option value="medium">Medium</option>
                                    <option value="long">Long</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="outputLanguage" data-tooltip="Output language (BCP 47 format, e.g., 'en', 'es', 'fr')">
                                    Output Language
                                </label>
                                <input
                                    id="outputLanguage"
                                    type="text"
                                    value={options.outputLanguage || ''}
                                    onChange={(e) => setOptions({ ...options, outputLanguage: e.target.value || undefined })}
                                    placeholder="en"
                                />
                            </div>

                            <div>
                                <label htmlFor="sharedContext" data-tooltip="Shared context for all writing tasks">
                                    Shared Context
                                </label>
                                <input
                                    id="sharedContext"
                                    type="text"
                                    value={options.sharedContext || ''}
                                    onChange={(e) => setOptions({ ...options, sharedContext: e.target.value || undefined })}
                                    placeholder="This is for a business email"
                                />
                            </div>

                            <label data-tooltip="Preload the model on component mount (faster first write)">
                                <input
                                    type="checkbox"
                                    role="switch"
                                    checked={options.warmup ?? true}
                                    onChange={(e) => setOptions({ ...options, warmup: e.target.checked })}
                                />
                                Warmup
                            </label>

                            <label data-tooltip="Enable streaming output (real-time text generation)">
                                <input
                                    type="checkbox"
                                    role="switch"
                                    checked={options.streaming}
                                    onChange={(e) => setOptions({ ...options, streaming: e.target.checked })}
                                />
                                Streaming
                            </label>
                        </div>
                    </section>
                )}

                {/* Prompt Input */}
                {activeTab === 'input' && (
                    <section>
                        <div>
                            <label htmlFor="prompt">Writing Prompt</label>
                            <button onClick={() => setPrompt(samplePrompt)}>Load Sample</button>
                        </div>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter your writing prompt..."
                            rows={isExpanded ? 20 : 1}
                        />
                        <button onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? '▼ Collapse' : '▲ Expand'}
                        </button>

                        <div>
                            <label htmlFor="context" data-tooltip="Additional context for this specific writing task">
                                Task Context
                            </label>
                            <input
                                id="context"
                                type="text"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Write in a professional tone"
                            />
                        </div>

                    </section>
                )}

                {/* Action Buttons */}
                <div className="grid">
                    <button
                        onClick={handleWrite}
                        disabled={!ai.isAvailable || writer.status === 'writing' || writer.status === 'initializing' || writer.status === 'downloading' || !prompt.trim()}
                    >
                        {writer.status === 'writing' ? 'Writing...' : writer.status === 'initializing' ? 'Initializing...' : writer.status === 'downloading' ? 'Downloading...' : 'Write'}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={writer.status === 'idle'}
                    >
                        Reset
                    </button>
                </div>

                {/* Progress */}
                {writer.progress && (
                    <article role="status">
                        <strong>Downloading Model:</strong>
                        <progress value={writer.progress.loaded} max={writer.progress.total} />
                    </article>
                )}

                {/* Error */}
                {writer.error && (
                    <article role="alert">
                        <strong>Error:</strong> {writer.error.message}
                    </article>
                )}

                {/* Result */}
                {(writer.data || displayedText) && (
                    <article>
                        <h3>Generated Text</h3>
                        <p>{displayedText || writer.data}</p>
                    </article>
                )}
            </article>
        </main>
    )
}
