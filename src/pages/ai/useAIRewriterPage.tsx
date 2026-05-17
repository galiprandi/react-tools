import { useState, useEffect } from 'react'
import { useAI } from '../../../lib/hooks/useAI'
import { useAIRewriter, type UseAIRewriterOptions } from '../../../lib/hooks/useAIRewriter'

export const UseAIRewriterPage = () => {
    const ai = useAI()
    const [activeTab, setActiveTab] = useState<'options' | 'input'>('options')
    const [text, setText] = useState<string>('')
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [options, setOptions] = useState<UseAIRewriterOptions>({
        tone: 'as-is',
        format: 'as-is',
        length: 'as-is',
        streaming: true,
        warmup: true,
    })
    const rewriter = useAIRewriter(options)
    const [displayedText, setDisplayedText] = useState('')
    const [context, setContext] = useState<string>('Make it more professional')
    const [overrideTone, setOverrideTone] = useState<'more-formal' | 'as-is' | 'more-casual'>('as-is')

    const handleRewrite = () => {
        if (text.trim()) {
            rewriter.rewrite(text, context || undefined, overrideTone !== 'as-is' ? overrideTone : undefined)
        }
    }

    const handleReset = () => {
        rewriter.reset()
        setText('')
        setDisplayedText('')
    }

    // Load sample text on mount
    useEffect(() => {
        setText(sampleText)
    }, [])

    // Animate streaming text progressively
    useEffect(() => {
        if (rewriter.data) {
            if (options.streaming) {
                // When using real streaming, display the data directly as it comes
                setDisplayedText(rewriter.data)
            } else {
                // When not using streaming, animate the text progressively
                let index = 0
                const text = rewriter.data
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
    }, [rewriter.data, options.streaming])

    const sampleText = `Hi, I'm writing to let you know that the project is going well. We are making good progress on the development side. The team is working hard and we should be able to meet the deadline. Let me know if you have any questions or concerns about the project status.`

    return (
        <main className="container">
            <article>
                <header>
                    <h1>useAIRewriter</h1>
                </header>

                {/* API Availability Status */}
                <article role="alert">
                    <small data-tooltip="Status from useAI hook: Checks if Chrome's Native AI Rewriter API is available">
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
                                Text Input
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
                                <label htmlFor="tone" data-tooltip="Writing tone: More Formal (professional), As-Is (balanced, default), More Casual (friendly)">
                                    Tone
                                </label>
                                <select
                                    id="tone"
                                    value={options.tone}
                                    onChange={(e) => setOptions({ ...options, tone: e.target.value as UseAIRewriterOptions['tone'] })}
                                >
                                    <option value="more-formal">More Formal</option>
                                    <option value="as-is">As-Is</option>
                                    <option value="more-casual">More Casual</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="format" data-tooltip="Output format: As-Is (preserve original), Markdown (formatted), Plain Text (plain text)">
                                    Format
                                </label>
                                <select
                                    id="format"
                                    value={options.format}
                                    onChange={(e) => setOptions({ ...options, format: e.target.value as UseAIRewriterOptions['format'] })}
                                >
                                    <option value="as-is">As-Is</option>
                                    <option value="markdown">Markdown</option>
                                    <option value="plain-text">Plain Text</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="length" data-tooltip="Output length: Shorter (condense), As-Is (preserve, default), Longer (expand)">
                                    Length
                                </label>
                                <select
                                    id="length"
                                    value={options.length}
                                    onChange={(e) => setOptions({ ...options, length: e.target.value as UseAIRewriterOptions['length'] })}
                                >
                                    <option value="shorter">Shorter</option>
                                    <option value="as-is">As-Is</option>
                                    <option value="longer">Longer</option>
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
                                <label htmlFor="sharedContext" data-tooltip="Shared context for all rewriting tasks">
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

                            <label data-tooltip="Preload the model on component mount (faster first rewrite)">
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

                {/* Text Input */}
                {activeTab === 'input' && (
                    <section>
                        <div>
                            <label htmlFor="text">Text to Rewrite</label>
                            <button onClick={() => setText(sampleText)}>Load Sample</button>
                        </div>
                        <textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text to rewrite..."
                            rows={isExpanded ? 20 : 1}
                        />
                        <button onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? '▼ Collapse' : '▲ Expand'}
                        </button>

                        <div>
                            <label htmlFor="context" data-tooltip="Additional context for this specific rewriting task">
                                Task Context
                            </label>
                            <input
                                id="context"
                                type="text"
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Make it more professional"
                            />
                        </div>

                        <div>
                            <label htmlFor="overrideTone" data-tooltip="Override tone for this specific rewrite (overrides global tone setting)">
                                Override Tone
                            </label>
                            <select
                                id="overrideTone"
                                value={overrideTone}
                                onChange={(e) => setOverrideTone(e.target.value as 'more-formal' | 'as-is' | 'more-casual')}
                            >
                                <option value="as-is">As-Is (Use Global)</option>
                                <option value="more-formal">More Formal</option>
                                <option value="more-casual">More Casual</option>
                            </select>
                        </div>

                    </section>
                )}

                {/* Action Buttons */}
                <div className="grid">
                    <button
                        onClick={handleRewrite}
                        disabled={!ai.isAvailable || rewriter.status === 'rewriting' || rewriter.status === 'initializing' || rewriter.status === 'downloading' || !text.trim()}
                    >
                        {rewriter.status === 'rewriting' ? 'Rewriting...' : rewriter.status === 'initializing' ? 'Initializing...' : rewriter.status === 'downloading' ? 'Downloading...' : 'Rewrite'}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={rewriter.status === 'idle'}
                    >
                        Reset
                    </button>
                </div>

                {/* Progress */}
                {rewriter.progress && (
                    <article role="status">
                        <strong>Downloading Model:</strong>
                        <progress value={rewriter.progress.loaded} max={rewriter.progress.total} />
                    </article>
                )}

                {/* Error */}
                {rewriter.error && (
                    <article role="alert">
                        <strong>Error:</strong> {rewriter.error.message}
                    </article>
                )}

                {/* Result */}
                {(rewriter.data || displayedText) && (
                    <article>
                        <h3>Rewritten Text</h3>
                        <p>{displayedText || rewriter.data}</p>
                    </article>
                )}
            </article>
        </main>
    )
}
