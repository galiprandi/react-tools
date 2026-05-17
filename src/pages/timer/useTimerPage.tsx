import { useState } from 'react'
import { useTimer } from '../../../lib/main'

export const UseTimerPage = () => {
    const [logs, setLogs] = useState<string[]>([])
    const [progress, setProgress] = useState(0)

    const addLog = (message: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    }

    const timer = useTimer({
        onSetTimer: (id) => {
            addLog(`Timer set with ID: ${id}`)
        },
        onCancelTimer: (id) => {
            addLog(`Timer cancelled with ID: ${id}`)
        },
        onTimerComplete: (id) => {
            addLog(`Timer completed with ID: ${id}`)
        },
        onProgress: (prog) => {
            setProgress(prog)
        },
    })


    const handleSetTimeout = () => {
        timer.setTimeout(() => {
            addLog('setTimeout executed!')
        }, 3000)
    }

    const handleSetInterval = () => {
        timer.setInterval(() => {
            addLog('setInterval executed!')
        }, 1000)
    }

    const handleSetTimeoutDate = () => {
        const targetDate = new Date(Date.now() + 3000)
        timer.setTimeoutDate(() => {
            addLog('setTimeoutDate executed!')
        }, targetDate)
    }

    const handleSetLimitedInterval = () => {
        timer.setLimitedInterval(() => {
            addLog('setLimitedInterval executed!')
        }, 1000, 3)
    }

    const handleClear = () => {
        timer.clearTimer()
    }

    return (
        <main>
            <article>
                <header>
                    <h1>useTimer</h1>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>useTimer</code> hook abstracts the complexity of managing setTimeout and setInterval in React components.</p>
                        <p><strong>Options:</strong></p>
                        <ul>
                            <li><code>onSetTimer</code>: (timerId: number) =&gt; void - Callback when timer is set</li>
                            <li><code>onCancelTimer</code>: (timerId: number) =&gt; void - Callback when timer is cancelled</li>
                            <li><code>onTimerComplete</code>: (timerId: number) =&gt; void - Callback when timer completes</li>
                            <li><code>onProgress</code>: (progress: number, elapsedMs: number, totalMs: number) =&gt; void - Callback for progress updates</li>
                        </ul>
                        <p><strong>Returns:</strong></p>
                        <ul>
                            <li><code>setTimeout</code>: (callback, delay) =&gt; number - Set a timeout</li>
                            <li><code>setInterval</code>: (callback, delay) =&gt; number - Set an interval</li>
                            <li><code>setTimeoutDate</code>: (callback, targetDate) =&gt; number - Set timeout for specific date</li>
                            <li><code>setLimitedInterval</code>: (callback, delay, iterations) =&gt; number - Set interval with limited executions</li>
                            <li><code>clearTimer</code>: () =&gt; void - Clear active timer</li>
                            <li><code>isActive</code>: () =&gt; boolean - Check if timer is active</li>
                            <li><code>getCurrentTimerId</code>: () =&gt; number | null - Get current timer ID</li>
                            <li><code>getRemainingIterations</code>: () =&gt; number | null - Get remaining iterations</li>
                            <li><code>getRemainingTime</code>: () =&gt; number - Get remaining time in ms</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={handleSetTimeout}>setTimeout (3s)</button>
                            <button onClick={handleSetInterval}>setInterval (1s)</button>
                            <button onClick={handleSetTimeoutDate}>setTimeoutDate (3s)</button>
                            <button onClick={handleSetLimitedInterval}>setLimitedInterval (3x)</button>
                            <button onClick={handleClear} className="secondary">Clear Timer</button>
                        </div>

                        <details>
                            <summary>Current State</summary>
                            <pre>
                                <code>{JSON.stringify({
                                    isActive: timer.isActive(),
                                    timerId: timer.getCurrentTimerId(),
                                    remainingIterations: timer.getRemainingIterations(),
                                    remainingTime: timer.getRemainingTime(),
                                    progress: Math.round(progress * 100) + '%'
                                }, null, 2)}</code>
                            </pre>
                        </details>

                        <details>
                            <summary>Logs</summary>
                            <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
                                <code>{logs.join('\n')}</code>
                            </pre>
                        </details>

                        <div style={{ marginTop: '20px' }}>
                            <progress value={progress} max={1} style={{ width: '100%' }} />
                            <p>Progress: {Math.round(progress * 100)}%</p>
                        </div>
                    </article>
                </section>
            </article>
        </main>
    )
}
