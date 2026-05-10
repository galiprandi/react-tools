import { useState, useEffect } from 'react'
import { useAI } from '../../../lib/hooks/useAI'
import { useAISummarize, type UseAISummarizeOptions } from '../../../lib/hooks/useAISummarize'

export const UseAISummarizePage = () => {
    const ai = useAI()
    const [activeTab, setActiveTab] = useState<'options' | 'input'>('options')
    const [text, setText] = useState<string>('')
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [options, setOptions] = useState<UseAISummarizeOptions>({
        type: 'tl;dr',
        format: 'plain-text',
        length: 'short',
        streaming: true,
        warmup: false,
    })
    const summarize = useAISummarize(options)
    const [displayedText, setDisplayedText] = useState('')

    const handleSummarize = () => {
        if (text.trim()) {
            summarize.summarize(text)
        }
    }

    const handleReset = () => {
        summarize.reset()
        setText('')
        setDisplayedText('')
    }

    // Load sample text on mount
    useEffect(() => {
        setText(sampleText)
    }, [])

    // Animate streaming text progressively
    useEffect(() => {
        if (summarize.data) {
            if (options.streaming) {
                // When using real streaming, display the data directly as it comes
                setDisplayedText(summarize.data)
            } else {
                // When not using streaming, animate the text progressively
                let index = 0
                const text = summarize.data
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
    }, [summarize.data, options.streaming])

    const sampleText = `Attention Is All You Need is a 2017 landmark research paper in machine learning that introduced the Transformer architecture, which underlies most modern large language models (LLMs). The authors of the paper are Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser, and Illia Polosukhin. All eight authors were equal contributors to the paper; the listed order was randomized. After the paper, each of the authors left Google to join other companies or to found startups.

The paper&apos;s title is a reference to the song &apos;All You Need Is Love&apos; by the Beatles. The name &apos;Transformer&apos; was picked because Jakob Uszkoreit, one of the paper&apos;s authors, liked the sound of that word. An early design document was titled &apos;Transformers: Iterative Self-Attention and Processing for Various Tasks&apos;, and included an illustration of six characters from the Transformers franchise. The team was named Team Transformer.

The paper is best known for introducing the Transformer architecture, which underlies most modern large language models (LLMs). A key reason why the architecture is preferred by most modern LLMs is the parallelizability of the architecture over its predecessors. This ensures that the operations necessary for training can be accelerated on a GPU, allowing both faster training times and models of bigger sizes to be trained.

The paper introduced the scaled dot-product attention and self-attention mechanism instead of a recurrent neural network or long short-term memory (which rely on recurrence instead). The use of scaled dot-product attention allows for better performance. Since the model relies on Query (Q), Key (K), and Value (V) matrices that come from the same source (i.e., the input sequence or context window), this eliminates the need for RNNs, completely ensuring parallelizability for the architecture.

In the self-attention mechanism, queries (Q), keys (K), and values (V) are dynamically generated for each input sequence (typically limited by the size of the context window), allowing the model to focus on different parts of the input sequence at different steps. Multi-head attention enhances this process by introducing multiple parallel attention heads. Each attention head learns different linear projections of the Q, K, and V matrices. This allows the model to capture different aspects of the relationships between words in the sequence simultaneously.

Since the Transformer does not rely on recurrence or convolution of the text in order to perform encoding and decoding, the paper relied on the use of sine and cosine wave functions to encode the position of the token into the embedding. The paper specifically comments on why this method was chosen: &apos;We chose the sinusoidal version because it may allow the model to extrapolate to sequence lengths longer than the ones encountered during training.&apos;`

    return (
        <main className="container">
            <article>
                <header>
                    <h1>AI Summarizer</h1>
                </header>

                {/* API Availability Status */}
                <article role="alert">
                    <small data-tooltip="Status from useAI hook: Checks if Chrome's Native AI Summarizer API is available">
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
                        <div>
                            <div>
                                <label htmlFor="type" data-tooltip="Type of summary: TL;DR (concise), Key Points (bullet list), Teaser (preview), Headline (one-line)">
                                    Type
                                </label>
                                <select
                                    id="type"
                                    value={options.type}
                                    onChange={(e) => setOptions({ ...options, type: e.target.value as UseAISummarizeOptions['type'] })}
                                >
                                    <option value="tldr">TL;DR</option>
                                    <option value="key-points">Key Points</option>
                                    <option value="teaser">Teaser</option>
                                    <option value="headline">Headline</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="format" data-tooltip="Output format: Plain Text (plain text) or Markdown (formatted)">
                                    Format
                                </label>
                                <select
                                    id="format"
                                    value={options.format}
                                    onChange={(e) => setOptions({ ...options, format: e.target.value as UseAISummarizeOptions['format'] })}
                                >
                                    <option value="plain-text">Plain Text</option>
                                    <option value="markdown">Markdown</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="length" data-tooltip="Summary length: Short (brief), Medium (moderate), Long (detailed)">
                                    Length
                                </label>
                                <select
                                    id="length"
                                    value={options.length}
                                    onChange={(e) => setOptions({ ...options, length: e.target.value as UseAISummarizeOptions['length'] })}
                                >
                                    <option value="short">Short</option>
                                    <option value="medium">Medium</option>
                                    <option value="long">Long</option>
                                </select>
                            </div>

                        </div>

                        <div>
                            <label data-tooltip="Enable streaming output (real-time text generation)">
                                <input
                                    type="checkbox"
                                    checked={options.streaming}
                                    onChange={(e) => setOptions({ ...options, streaming: e.target.checked })}
                                />
                                Streaming
                            </label>

                            <label data-tooltip="Preload the model on component mount (faster first summary)">
                                <input
                                    type="checkbox"
                                    checked={options.warmup}
                                    onChange={(e) => setOptions({ ...options, warmup: e.target.checked })}
                                />
                                Warmup
                            </label>
                        </div>
                    </section>
                )}

                {/* Text Input */}
                {activeTab === 'input' && (
                    <section>
                        <div>
                            <label htmlFor="text">Text to Summarize</label>
                            <button onClick={() => setText(sampleText)}>Load Sample</button>
                        </div>
                        <textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text to summarize..."
                            rows={isExpanded ? 20 : 1}
                        />
                        <button onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? '▼ Collapse' : '▲ Expand'}
                        </button>

                    </section>
                )}

                {/* Action Buttons */}
                <div className="grid">
                    <button
                        onClick={handleSummarize}
                        disabled={!ai.isAvailable || summarize.status === 'summarizing' || summarize.status === 'initializing' || summarize.status === 'downloading' || !text.trim()}
                    >
                        {summarize.status === 'summarizing' ? 'Summarizing...' : summarize.status === 'initializing' ? 'Initializing...' : summarize.status === 'downloading' ? 'Downloading...' : 'Summarize'}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={summarize.status === 'idle'}
                    >
                        Reset
                    </button>
                </div>

                {/* Progress */}
                {summarize.progress && (
                    <article role="status">
                        <strong>Downloading Model:</strong> {summarize.progress.loaded} / {summarize.progress.total}
                    </article>
                )}

                {/* Error */}
                {summarize.error && (
                    <article role="alert">
                        <strong>Error:</strong> {summarize.error.message}
                    </article>
                )}

                {/* Result */}
                {(summarize.data || displayedText) && (
                    <article>
                        <h3>Summary</h3>
                        <p>{displayedText || summarize.data}</p>
                    </article>
                )}
            </article>
        </main>
    )
}
