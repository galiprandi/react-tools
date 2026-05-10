import { useState } from 'react'
import { useAI } from '../../lib/hooks/useAI'
import { useAISummarize, type UseAISummarizeOptions } from '../../lib/hooks/useAISummarize'

export const AISummarizeExample = () => {
    const ai = useAI()
    const [text, setText] = useState(`Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals. The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving".

The field of AI research was founded at an event held at Dartmouth College in 1956. The attendees became the leaders of AI research for decades. Many of them predicted that a machine as intelligent as a human being would exist in no more than a generation and they were given millions of dollars to make this vision come true. However, they failed to recognize the difficulty of the problem.

In the early 1980s, AI research was revived by the commercial success of expert systems, a form of AI program that simulated the knowledge and analytical skills of human experts. By 1985, the market for AI had reached over a billion dollars. In the 1990s and early 21st century, AI achieved its greatest successes, albeit somewhat behind the scenes. Artificial intelligence is used in logistics, data mining, medical diagnosis and many other areas throughout the technology industry.

The various sub-fields of AI research are centered around particular goals and the use of particular tools. The traditional problems (or goals) of AI research include reasoning, knowledge representation, planning, learning, natural language processing, perception, and the ability to move and manipulate objects. General intelligence is among the field's long-term goals. Approaches include statistical methods, neural networks, and symbolic artificial intelligence. The field draws upon computer science, mathematics, psychology, linguistics, philosophy, and many other fields.`)
    const [context, setContext] = useState<string>("don't use the article title in the summary and always end with 'what do you think?'")
    const [isTextareaExpanded, setIsTextareaExpanded] = useState(false)
    const [options, setOptions] = useState<UseAISummarizeOptions>({
        type: 'tldr',
        format: 'plain-text',
        length: 'short',
        streaming: false,
        warmup: false,
    })
    const summarize = useAISummarize(options)

    const handleSummarize = () => {
        if (text.trim()) {
            summarize.summarize(text, context || undefined)
        }
    }

    const handleReset = () => {
        summarize.reset()
        setText('')
        setContext('')
    }

    return (
        <section>
            <hr />
            <h2>AI Summarizer</h2>
            
            {/* AI Availability */}
            <div style={{ marginBottom: '1rem' }}>
                <h3>AI Availability</h3>
                <p><strong>Status:</strong> {ai.status}</p>
                <p><strong>Available:</strong> {ai.isAvailable ? 'Yes' : 'No'}</p>
                <p><strong>Availability:</strong> {ai.availability}</p>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px', fontSize: '0.875rem' }}>
                    <strong>useAI Hook Example:</strong>
                    <pre style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>{`const ai = useAI()
// Returns:
// - isAvailable: boolean
// - availability: 'unavailable' | 'downloadable' | 'downloading' | 'available'
// - status: 'idle' | 'loading' | 'ready' | 'error'
// - error: Error | null`}</pre>
                </div>
            </div>

            {/* Options */}
            <div style={{ marginBottom: '1rem' }}>
                <h3>Options</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label>
                            <strong>Type:</strong>
                            <span title="Type of summary: TL;DR (concise), Key Points (bullet list), Teaser (preview), Headline (one-line)" style={{ marginLeft: '0.25rem', cursor: 'help', color: '#0070f3' }}>?</span>
                            <select
                                value={options.type}
                                onChange={(e) => setOptions({ ...options, type: e.target.value as UseAISummarizeOptions['type'] })}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                <option value="tldr">TL;DR</option>
                                <option value="key-points">Key Points</option>
                                <option value="teaser">Teaser</option>
                                <option value="headline">Headline</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                            <strong>Format:</strong>
                            <span title="Output format: Plain Text (plain text) or Markdown (formatted)" style={{ marginLeft: '0.25rem', cursor: 'help', color: '#0070f3' }}>?</span>
                            <select
                                value={options.format}
                                onChange={(e) => setOptions({ ...options, format: e.target.value as UseAISummarizeOptions['format'] })}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                <option value="plain-text">Plain Text</option>
                                <option value="markdown">Markdown</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                            <strong>Length:</strong>
                            <span title="Summary length: Short (brief), Medium (moderate), Long (detailed)" style={{ marginLeft: '0.25rem', cursor: 'help', color: '#0070f3' }}>?</span>
                            <select
                                value={options.length}
                                onChange={(e) => setOptions({ ...options, length: e.target.value as UseAISummarizeOptions['length'] })}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                <option value="short">Short</option>
                                <option value="medium">Medium</option>
                                <option value="long">Long</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={options.streaming}
                                onChange={(e) => setOptions({ ...options, streaming: e.target.checked })}
                                style={{ marginRight: '0.5rem' }}
                            />
                            <strong>Streaming</strong>
                            <span title="Enable streaming output (real-time text generation)" style={{ marginLeft: '0.25rem', cursor: 'help', color: '#0070f3' }}>?</span>
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={options.warmup}
                                onChange={(e) => setOptions({ ...options, warmup: e.target.checked })}
                                style={{ marginRight: '0.5rem' }}
                            />
                            <strong>Warmup</strong>
                            <span title="Preload the model on component mount (faster first summary)" style={{ marginLeft: '0.25rem', cursor: 'help', color: '#0070f3' }}>?</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Text Input */}
            <div style={{ marginBottom: '1rem' }}>
                <h3>Text to Summarize</h3>
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
                    placeholder="Enter text to summarize..."
                    rows={isTextareaExpanded ? 20 : 6}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#000' }}
                />

                <h3 style={{ marginTop: '1rem' }}>Context (optional)</h3>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    Additional context to guide the summarization (e.g., &apos;This article is intended for a tech-savvy audience&apos;)
                </p>
                <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#000' }}
                />
            </div>

            {/* Buttons */}
            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={handleSummarize}
                    disabled={!ai.isAvailable || summarize.status === 'summarizing' || summarize.status === 'initializing' || summarize.status === 'downloading' || !text.trim()}
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
                    {summarize.status === 'summarizing' ? 'Summarizing...' : summarize.status === 'initializing' ? 'Initializing...' : summarize.status === 'downloading' ? 'Downloading...' : 'Summarize'}
                </button>
                <button
                    onClick={handleReset}
                    disabled={summarize.status === 'idle'}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: summarize.status !== 'idle' ? 'pointer' : 'not-allowed',
                    }}
                >
                    Reset
                </button>
            </div>

            {/* Progress */}
            {summarize.progress && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e3f2fd', borderRadius: '4px', color: '#000' }}>
                    <strong>Downloading Model:</strong> {summarize.progress.loaded} / {summarize.progress.total}
                </div>
            )}

            {/* Status */}
            <p style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong> {summarize.status}
            </p>

            {/* Error */}
            {summarize.error && (
                <p style={{ color: 'red', marginBottom: '1rem' }}>
                    <strong>Error:</strong> {summarize.error.message}
                </p>
            )}

            {/* Result */}
            {summarize.data && (
                <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '4px', color: '#000' }}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{summarize.data}</p>
                </div>
            )}
        </section>
    )
}
