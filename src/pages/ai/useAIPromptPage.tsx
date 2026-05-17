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
    const [mode, setMode] = useState<'text' | 'multimodal'>('text')
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
    const [input, setInput] = useState<string>('')
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
    const [streamingResponse, setStreamingResponse] = useState<string>('')
    const [uploadedImage, setUploadedImage] = useState<File | null>(null)
    const [uploadedAudio, setUploadedAudio] = useState<File | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [appendedImages, setAppendedImages] = useState<File[]>([])
    const chatContainerRef = useRef<HTMLElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const canvasRefCallback = useRef<HTMLCanvasElement>(null)
    const [options, setOptions] = useState<UseAIPromptOptions>({
        initialPrompts: [
            { role: 'system', content: 'You are a helpful assistant. Always respond in the same language as the user\'s question.' }
        ],
        temperature: 0.7,
        topK: 40,
        streaming: true,
        warmup: true,
        expectedInputs: [{ type: 'text' }, { type: 'image' }, { type: 'audio' }],
        expectedOutputs: [{ type: 'text' }],
    })
    const prompt = useAIPrompt(options)
    const debouncedPromptStatus = useDebounce(prompt.status, 300)

    const handleSend = async () => {
        if (!input.trim() || prompt.status === 'prompting') return

        const userMessage = input.trim()
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }])
        setInput('')

        let content: AIPromptMessage[]
        
        // Check if we have any multimodal content
        const hasMultimodalContent = uploadedImage || uploadedAudio || canvasRefCallback.current
        
        if (hasMultimodalContent) {
            // Multimodal mode - include all content
            const multimodalContent: (string | File | HTMLCanvasElement)[] = [userMessage]
            
            if (uploadedImage) {
                multimodalContent.push(uploadedImage)
            }
            
            if (uploadedAudio) {
                multimodalContent.push(uploadedAudio)
            }
            
            if (canvasRefCallback.current) {
                multimodalContent.push(canvasRefCallback.current)
            }
            
            content = [
                { role: 'user', content: multimodalContent }
            ]
        } else {
            // Text-only mode
            content = chatHistory.length === 0
                ? [
                    { role: 'user', content: userMessage }
                ]
                : [
                    ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
                    { role: 'user', content: userMessage }
                ]
        }

        try {
            await prompt.prompt(content)
            // Clear uploaded files after sending
            setUploadedImage(null)
            setUploadedAudio(null)
        } catch (error) {
            console.error('Error during prompt:', error)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedImage(file)
        }
    }

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedAudio(file)
        }
    }

    const handleAppendImage = async () => {
        if (!uploadedImage) return
        
        try {
            await prompt.append([
                { role: 'user', content: ['Imagen de referencia:', uploadedImage] }
            ])
            setAppendedImages(prev => [...prev, uploadedImage])
            setUploadedImage(null)
        } catch (error) {
            console.error('Error during append:', error)
        }
    }

    const handleCanvasDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRefCallback.current || !isDrawing) return
        
        const canvas = canvasRefCallback.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        const rect = canvas.getBoundingClientRect()
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.stroke()
    }

    const handleCanvasMouseDown = () => setIsDrawing(true)
    const handleCanvasMouseUp = () => setIsDrawing(false)
    const handleCanvasMouseLeave = () => setIsDrawing(false)
    
    const clearCanvas = () => {
        if (canvasRefCallback.current) {
            const ctx = canvasRefCallback.current.getContext('2d')
            if (ctx) {
                ctx.clearRect(0, 0, canvasRefCallback.current.width, canvasRefCallback.current.height)
            }
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
                    <button 
                        onClick={() => setMode(mode === 'text' ? 'multimodal' : 'text')}
                        style={{ marginLeft: '10px' }}
                    >
                        Mode: {mode === 'text' ? 'Text' : 'Multimodal'}
                    </button>
                </div>

                {/* Multimodal Panel */}
                {mode === 'multimodal' && (
                    <section style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                        <h3>Multimodal Input</h3>
                        
                        {/* Image Upload */}
                        <div style={{ marginBottom: '15px' }}>
                            <label>Upload Image:</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ marginLeft: '10px' }}
                            />
                            {uploadedImage && (
                                <div style={{ marginTop: '10px' }}>
                                    <small>Image loaded: {uploadedImage.type}</small>
                                    <button 
                                        onClick={handleAppendImage}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Append to Context
                                    </button>
                                    <button 
                                        onClick={() => setUploadedImage(null)}
                                        style={{ marginLeft: '5px' }}
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Audio Upload */}
                        <div style={{ marginBottom: '15px' }}>
                            <label>Upload Audio:</label>
                            <input 
                                type="file" 
                                accept="audio/*"
                                onChange={handleAudioUpload}
                                style={{ marginLeft: '10px' }}
                            />
                            {uploadedAudio && (
                                <div style={{ marginTop: '10px' }}>
                                    <small>Audio loaded: {uploadedAudio.type}</small>
                                    <button 
                                        onClick={() => setUploadedAudio(null)}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Canvas Drawing */}
                        <div style={{ marginBottom: '15px' }}>
                            <label>Draw on Canvas:</label>
                            <div style={{ marginTop: '10px' }}>
                                <canvas
                                    ref={canvasRefCallback}
                                    width={400}
                                    height={200}
                                    style={{ border: '1px solid #ccc', cursor: 'crosshair' }}
                                    onMouseDown={handleCanvasMouseDown}
                                    onMouseUp={handleCanvasMouseUp}
                                    onMouseLeave={handleCanvasMouseLeave}
                                    onMouseMove={handleCanvasDraw}
                                />
                                <button 
                                    onClick={clearCanvas}
                                    style={{ marginLeft: '10px' }}
                                >
                                    Clear Canvas
                                </button>
                            </div>
                        </div>

                        {/* Appended Images */}
                        {appendedImages.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <label>Appended Images ({appendedImages.length}):</label>
                                <div style={{ marginTop: '10px' }}>
                                    {appendedImages.map((_, idx) => (
                                        <span key={idx} style={{ marginRight: '10px' }}>
                                            Image {idx + 1}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

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
                                value={typeof options.initialPrompts?.[0]?.content === 'string' ? options.initialPrompts[0].content : ''}
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
                    <button 
                        type="button"
                        className="contrast"
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        title="Adjuntar archivo"
                    >
                        +
                    </button>
                    
                    {/* Attachment Menu */}
                    {showAttachmentMenu && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: '0',
                            marginBottom: '5px',
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '10px',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                📷 Imagen
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        handleImageUpload(e)
                                        setShowAttachmentMenu(false)
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                🎵 Audio
                                <input 
                                    type="file" 
                                    accept="audio/*"
                                    onChange={(e) => {
                                        handleAudioUpload(e)
                                        setShowAttachmentMenu(false)
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    )}
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
