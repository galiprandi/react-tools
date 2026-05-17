import { useState, useEffect, useRef } from 'react'
import { useAI } from '../../../lib/hooks/useAI'
import { useAIPrompt, type UseAIPromptOptions, type AIPromptMessage } from '../../../lib/hooks/useAIPrompt'
import { useDebounce } from '../../../lib/hooks/useDebounce'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export const UseAIPromptPage = () => {
    const ai = useAI()
    const [showConfig, setShowConfig] = useState(false)
    const [input, setInput] = useState<string>('')
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [streamingResponse, setStreamingResponse] = useState<string>('')
    const chatContainerRef = useRef<HTMLElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [options, setOptions] = useState<UseAIPromptOptions>({
        initialPrompts: [
            { role: 'system', content: 'You are a helpful assistant. Always respond in the same language as the user\'s question.' }
        ],
        temperature: 0.7,
        topK: 40,
        streaming: true,
        warmup: true,
    })
    const prompt = useAIPrompt(options)
    const debouncedPromptStatus = useDebounce(prompt.status, 300)

    const handleSend = async () => {
        if (!input.trim() || prompt.status === 'prompting') return

        const userMessage = input.trim()
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])
        setInput('')

        const conversation: AIPromptMessage[] = chatHistory.length === 0
            ? [
                ...(options.initialPrompts || []),
                { role: 'user', content: userMessage }
            ]
            : [
                ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
                { role: 'user', content: userMessage }
            ]

        try {
            await prompt.prompt(conversation)
        } catch (error) {
            console.error('Error during prompt:', error)
        }
    }

    // Watch for prompt completion and add AI response to chat
    useEffect(() => {
        if (options.streaming && prompt.status === 'prompting' && prompt.data) {
            // Streaming mode: display data directly as it comes
            setStreamingResponse(prompt.data)
        } else if (prompt.status === 'success') {
            // Streaming completed: add final response to chat and clear streaming response
            if (prompt.data) {
                setChatHistory(prev => [...prev, { role: 'assistant', content: prompt.data }])
            }
            setStreamingResponse('')
        }
    }, [prompt.status, prompt.data, options.streaming])

    // Scroll to bottom and focus input after streaming completes
    useEffect(() => {
        if (debouncedPromptStatus === 'success' && chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            })
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [debouncedPromptStatus])

    const handleReset = () => {
        prompt.reset()
        setChatHistory([])
        setInput('')
        setStreamingResponse('')
    }

    return (
        <main className="container" style={{ maxWidth: '800px' }}>
            <article>
                <header>
                    <h1>useAIPrompt Chat</h1>
                </header>

                {/* API Availability Status */}
                <article role="alert">
                    <small data-tooltip="Status from useAI hook: Checks if Chrome's Native Prompt API is available">
                        {ai.isAvailable ? '✓ AI Available' : '✗ AI Not Available'}
                    </small>
                </article>

                {/* Context Usage */}
                {prompt.contextWindow > 0 && (
                    <article role="status" style={{ marginBottom: '10px' }}>
                        <strong>Context Usage:</strong> {prompt.contextUsage} / {prompt.contextWindow} tokens
                    </article>
                )}

                {/* Configuration Toggle */}
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={() => setShowConfig(!showConfig)}>
                        {showConfig ? 'Hide Configuration' : 'Show Configuration'}
                    </button>
                    <button onClick={handleReset} style={{ marginLeft: '10px' }}>
                        Clear Chat
                    </button>
                </div>

                {/* Configuration Panel */}
                {showConfig && (
                    <section style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                        <h3>Configuration</h3>
                        <div className="grid">
                            <div>
                                <label htmlFor="temperature" data-tooltip="Temperature for sampling (0.0 = more deterministic, 1.0 = more creative)">
                                    Temperature
                                </label>
                                <input
                                    id="temperature"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={options.temperature ?? 0.7}
                                    onChange={(e) => setOptions({ ...options, temperature: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div>
                                <label htmlFor="topK" data-tooltip="Top-K sampling parameter (limits to top K tokens)">
                                    Top-K
                                </label>
                                <input
                                    id="topK"
                                    type="number"
                                    min="1"
                                    value={options.topK ?? 40}
                                    onChange={(e) => setOptions({ ...options, topK: parseInt(e.target.value) })}
                                />
                            </div>

                            <label data-tooltip="Preload the model on component mount (faster first prompt)">
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

                        <div style={{ marginTop: '20px' }}>
                            <label data-tooltip="Initial system prompt to set context">
                                System Prompt
                            </label>
                            <textarea
                                value={options.initialPrompts?.[0]?.content || ''}
                                onChange={(e) => setOptions({
                                    ...options,
                                    initialPrompts: [{ role: 'system', content: e.target.value }]
                                })}
                                rows={3}
                                placeholder="You are a helpful assistant."
                            />
                        </div>
                    </section>
                )}

                {/* Progress */}
                {prompt.progress && (
                    <article role="status" style={{ marginBottom: '10px' }}>
                        <strong>Downloading Model:</strong>
                        <progress value={prompt.progress.loaded} max={prompt.progress.total} />
                    </article>
                )}

                {/* Chat Container */}
                <section 
                    ref={chatContainerRef}
                    style={{ 
                        border: '1px solid #ccc', 
                        borderRadius: '8px', 
                        padding: '20px',
                        marginBottom: '20px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                    }}>
                    {chatHistory.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#666' }}>
                            Start a conversation by typing a message below
                        </p>
                    )}
                    
                    {chatHistory.map((msg, index) => (
                        <div key={index} style={{
                            borderRadius: '12px',
                            color: 'white',
                            width: '80%',
                            textAlign: 'right',
                            padding: '0 1em',
                            backgroundColor: msg.role === 'user' ? '#00B478' : '#9236A4',
                            margin: msg.role === 'user' ? '0 0 20px auto' : '0 auto 20px 0',
                        }}>
                            <span>{msg.content}</span>
                        </div>
                    ))}

                    {/* Streaming response */}
                    {streamingResponse && (
                        <div style={{
                            borderRadius: '12px',
                            color: 'white',
                            width: '80%',
                            textAlign: 'left',
                            padding: '0 1em',
                            backgroundColor: '#9236A4',
                            margin: '0 auto 20px 0',
                        }}>
                            <span>{streamingResponse}</span>
                        </div>
                    )}
                </section>

                {/* Error */}
                {prompt.error && (
                    <article role="alert" style={{ marginBottom: '10px', color: 'red' }}>
                        <strong>Error:</strong> {prompt.error.message}
                    </article>
                )}

                {/* Input Area */}
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <fieldset role="group">
                    <input
                        ref={inputRef}
                        type="text"
                        name="message"
                        placeholder="Type your message..."
                        autoComplete="off"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!ai.isAvailable || prompt.status === 'prompting' || prompt.status === 'initializing' || prompt.status === 'downloading'}
                    />
                    <input
                        type="submit"
                        value={prompt.status === 'prompting' ? 'Sending...' : 'Send'}
                        disabled={!ai.isAvailable || prompt.status === 'prompting' || prompt.status === 'initializing' || prompt.status === 'downloading' || !input.trim()}
                    />
                    </fieldset>
                </form>
            </article>
        </main>
    )
}
