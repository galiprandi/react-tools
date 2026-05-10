import React, { useState } from 'react';
import { useAI, useAISummarize } from '../../lib/main';

const AIExample = () => {
    const { isAvailable, availability, status: aiStatus } = useAI();
    const [text, setText] = useState('');
    const {
        data: summary,
        status: summarizeStatus,
        progress,
        error,
        summarize,
        reset
    } = useAISummarize({
        streaming: true,
        warmup: true,
    });

    const handleSummarize = async () => {
        if (text) {
            await summarize(text);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>AI Summarizer Example</h1>

            <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>System Status</h2>
                <p>AI Available: <strong>{isAvailable ? 'Yes' : 'No'}</strong></p>
                <p>Availability: <strong>{availability}</strong></p>
                <p>Status: <strong>{aiStatus}</strong></p>
            </section>

            <section>
                <h2>Summarizer</h2>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text to summarize..."
                    style={{ width: '100%', height: '150px', marginBottom: '10px', padding: '10px' }}
                />

                <div style={{ marginBottom: '10px' }}>
                    <button
                        onClick={handleSummarize}
                        disabled={summarizeStatus === 'summarizing' || !text}
                        style={{ marginRight: '10px', padding: '8px 16px' }}
                    >
                        {summarizeStatus === 'summarizing' ? 'Summarizing...' : 'Summarize'}
                    </button>
                    <button
                        onClick={reset}
                        style={{ padding: '8px 16px' }}
                    >
                        Reset
                    </button>
                </div>

                {summarizeStatus === 'downloading' && progress && (
                    <div style={{ marginBottom: '10px' }}>
                        Downloading model: {Math.round((progress.loaded / progress.total) * 100)}%
                        <progress value={progress.loaded} max={progress.total} style={{ width: '100%' }} />
                    </div>
                )}

                {error && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        Error: {error.message}
                    </div>
                )}

                {summary && (
                    <div style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px' }}>
                        <h3>Summary:</h3>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{summary}</div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AIExample;
