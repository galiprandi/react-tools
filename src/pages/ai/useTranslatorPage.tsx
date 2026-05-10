import { useState } from 'react'
import { useAI } from '../../../lib/hooks/useAI'
import { useTranslator, type UseTranslatorOptions, type SupportedLanguage } from '../../../lib/hooks/useTranslator'

export const UseTranslatorPage = () => {
    const ai = useAI()
    const [activeTab, setActiveTab] = useState<'options' | 'input'>('options')
    const [text, setText] = useState<string>('')
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [options, setOptions] = useState<UseTranslatorOptions>({
        sourceLanguage: 'en',
        targetLanguage: 'es',
        streaming: false,
        warmup: false,
    })
    const translator = useTranslator(options)

    const handleTranslate = () => {
        if (text.trim()) {
            translator.translate(text)
        }
    }

    const handleReset = () => {
        translator.reset()
        setText('')
    }

    // Load sample text on mount
    useState(() => {
        setText('Where is the next bus stop, please?')
    })

    const supportedLanguages: SupportedLanguage[] = [
        'ar', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fr',
        'hi', 'hr', 'hu', 'id', 'it', 'iw', 'ja', 'kn', 'ko', 'lt', 'mr', 'nl',
        'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sv', 'ta', 'te', 'th', 'tr',
        'uk', 'vi', 'zh', 'zh-Hant'
    ]

    const languageNames: Record<SupportedLanguage, string> = {
        'ar': 'Arabic', 'bg': 'Bulgarian', 'bn': 'Bengali', 'cs': 'Czech', 'da': 'Danish',
        'de': 'German', 'el': 'Greek', 'en': 'English', 'es': 'Spanish', 'fi': 'Finnish',
        'fr': 'French', 'hi': 'Hindi', 'hr': 'Croatian', 'hu': 'Hungarian', 'id': 'Indonesian',
        'it': 'Italian', 'iw': 'Hebrew', 'ja': 'Japanese', 'kn': 'Kannada', 'ko': 'Korean',
        'lt': 'Lithuanian', 'mr': 'Marathi', 'nl': 'Dutch', 'no': 'Norwegian', 'pl': 'Polish',
        'pt': 'Portuguese', 'ro': 'Romanian', 'ru': 'Russian', 'sk': 'Slovak', 'sl': 'Slovenian',
        'sv': 'Swedish', 'ta': 'Tamil', 'te': 'Telugu', 'th': 'Thai', 'tr': 'Turkish',
        'uk': 'Ukrainian', 'vi': 'Vietnamese', 'zh': 'Chinese (Simplified)', 'zh-Hant': 'Chinese (Traditional)'
    }

    return (
        <main>
            <article>
                <header>
                    <h1>Translator</h1>
                </header>

                {/* API Availability Status */}
                <article>
                    <small data-tooltip="Status from useAI hook: Checks if Chrome's Native AI APIs are available">
                        {ai.isAvailable ? '✓ AI Available' : '✗ AI Not Available'}
                    </small>
                </article>

                {/* Configuration Tabs */}
                <nav>
                    <ul>
                        <li>
                            <a
                                href="#"
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label htmlFor="sourceLanguage">Source Language</label>
                                <select
                                    id="sourceLanguage"
                                    value={options.sourceLanguage}
                                    onChange={(e) => setOptions({ ...options, sourceLanguage: e.target.value as SupportedLanguage })}
                                >
                                    {supportedLanguages.map(lang => (
                                        <option key={lang} value={lang}>{languageNames[lang]}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="targetLanguage">Target Language</label>
                                <select
                                    id="targetLanguage"
                                    value={options.targetLanguage}
                                    onChange={(e) => setOptions({ ...options, targetLanguage: e.target.value as SupportedLanguage })}
                                >
                                    {supportedLanguages.map(lang => (
                                        <option key={lang} value={lang}>{languageNames[lang]}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <label data-tooltip="Enable streaming output (real-time text generation)">
                                <input
                                    type="checkbox"
                                    checked={options.streaming}
                                    onChange={(e) => setOptions({ ...options, streaming: e.target.checked })}
                                />
                                Streaming
                            </label>

                            <label data-tooltip="Preload the model on component mount (faster first translation)">
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
                        <label htmlFor="text">Text to Translate</label>
                        <textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text to translate..."
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
                        onClick={handleTranslate}
                        disabled={!ai.isAvailable || translator.status === 'translating' || translator.status === 'initializing' || translator.status === 'downloading' || !text.trim()}
                    >
                        {translator.status === 'translating' ? 'Translating...' : translator.status === 'initializing' ? 'Initializing...' : translator.status === 'downloading' ? 'Downloading...' : 'Translate'}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={translator.status === 'idle'}
                    >
                        Reset
                    </button>
                </div>

                {/* Progress */}
                {translator.progress && (
                    <article>
                        <strong>Downloading Model:</strong> {translator.progress.loaded} / {translator.progress.total}
                    </article>
                )}

                {/* Error */}
                {translator.error && (
                    <article>
                        <strong>Error:</strong> {translator.error.message}
                    </article>
                )}

                {/* Result */}
                {translator.data && (
                    <article>
                        <h3>Translation</h3>
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{translator.data}</p>
                    </article>
                )}
            </article>
        </main>
    )
}
