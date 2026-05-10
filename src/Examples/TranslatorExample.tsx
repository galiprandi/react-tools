import { useState } from 'react'
import { useAI } from '../../lib/hooks/useAI'
import { useTranslator, type UseTranslatorOptions, type SupportedLanguage } from '../../lib/hooks/useTranslator'

export const TranslatorExample = () => {
    const ai = useAI()
    const [text, setText] = useState('Where is the next bus stop, please?')
    const [isTextareaExpanded, setIsTextareaExpanded] = useState(false)
    const [options, setOptions] = useState<UseTranslatorOptions>({
        sourceLanguage: 'auto',
        targetLanguage: 'user',
        streaming: false,
        warmup: false,
        enable: true,
    })
    const translator = useTranslator({ ...options, text: text })

    const handleTranslate = () => {
        if (text.trim()) {
            translator.translate(text)
        }
    }

    const handleReset = () => {
        translator.reset()
        setText('')
    }

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
        <section>
            <hr />
            <h2>Translator</h2>
            
            {/* AI Availability */}
            <div style={{ marginBottom: '1rem' }}>
                <h3>AI Availability</h3>
                <p><strong>Status:</strong> {ai.status}</p>
                <p><strong>Available:</strong> {ai.isAvailable ? 'Yes' : 'No'}</p>
                <p><strong>Availability:</strong> {ai.availability}</p>
            </div>

            {/* Options */}
            <div style={{ marginBottom: '1rem' }}>
                <h3>Options</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label>
                            <strong>Source Language:</strong>
                            <select
                                value={options.sourceLanguage}
                                onChange={(e) => setOptions({ ...options, sourceLanguage: e.target.value as 'auto' | SupportedLanguage })}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                <option value="auto">Auto-detect</option>
                                {supportedLanguages.map(lang => (
                                    <option key={lang} value={lang}>{languageNames[lang]}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                            <strong>Target Language:</strong>
                            <select
                                value={options.targetLanguage}
                                onChange={(e) => setOptions({ ...options, targetLanguage: e.target.value as 'user' | SupportedLanguage })}
                                style={{ marginLeft: '0.5rem' }}
                            >
                                <option value="user">User&apos;s Browser Language</option>
                                {supportedLanguages.map(lang => (
                                    <option key={lang} value={lang}>{languageNames[lang]}</option>
                                ))}
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
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                checked={options.enable ?? true}
                                onChange={(e) => setOptions({ ...options, enable: e.target.checked })}
                                style={{ marginRight: '0.5rem' }}
                            />
                            <strong>Auto-translate</strong>
                        </label>
                    </div>
                </div>
            </div>

            {/* Text Input */}
            <div style={{ marginBottom: '1rem' }}>
                <h3>Text to Translate</h3>
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
                    placeholder="Enter text to translate..."
                    rows={isTextareaExpanded ? 20 : 6}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', color: '#000' }}
                />
            </div>

            {/* Buttons */}
            <div style={{ marginBottom: '1rem' }}>
                <button
                    onClick={handleTranslate}
                    disabled={!ai.isAvailable || translator.status === 'translating' || translator.status === 'initializing' || translator.status === 'downloading' || !text.trim()}
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
                    {translator.status === 'translating' ? 'Translating...' : translator.status === 'initializing' ? 'Initializing...' : translator.status === 'downloading' ? 'Downloading...' : 'Translate'}
                </button>
                <button
                    onClick={handleReset}
                    disabled={translator.status === 'idle'}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: translator.status !== 'idle' ? 'pointer' : 'not-allowed',
                    }}
                >
                    Reset
                </button>
            </div>

            {/* Progress */}
            {translator.progress && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#e3f2fd', borderRadius: '4px', color: '#000' }}>
                    <strong>Downloading Model:</strong> {translator.progress.loaded} / {translator.progress.total}
                </div>
            )}

            {/* Status */}
            <p style={{ marginBottom: '1rem' }}>
                <strong>Status:</strong> {translator.status}
            </p>

            {/* Error */}
            {translator.error && (
                <p style={{ color: 'red', marginBottom: '1rem' }}>
                    <strong>Error:</strong> {translator.error.message}
                </p>
            )}

            {/* Result */}
            {translator.data && (
                <div style={{ padding: '1rem', background: '#e3f2fd', borderRadius: '4px', color: '#000' }}>
                    <h3>Translation</h3>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{translator.data}</p>
                    {translator.detectedSourceLanguage && (
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                            <strong>Detected source:</strong> {translator.detectedSourceLanguage}
                        </p>
                    )}
                    {translator.resolvedTargetLanguage && (
                        <p style={{ fontSize: '0.875rem', color: '#666' }}>
                            <strong>Target:</strong> {translator.resolvedTargetLanguage}
                        </p>
                    )}
                </div>
            )}
        </section>
    )
}
