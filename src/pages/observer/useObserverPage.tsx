import { Observer } from '../../../lib/main'
import { useState } from 'react'

export const UseObserverPage = () => {
    const [inScreen, setInScreen] = useState<number[]>([])
    const images = Array.from({ length: 5 }, (_, i) => i + 1)

    return (
        <main>
            <article>
                <header>
                    <h1>Observer</h1>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>Observer</code> component tracks when an element enters or exits the viewport using the Intersection Observer API.</p>
                        <p><strong>Props:</strong></p>
                        <ul>
                            <li><code>wrapper</code>: keyof JSX.IntrinsicElements - Wrapper element type</li>
                            <li><code>threshold</code>: number - Intersection threshold (0-1)</li>
                            <li><code>onAppear</code>: () =&gt; void - Callback when element appears in viewport</li>
                            <li><code>onDisappear</code>: () =&gt; void - Callback when element disappears from viewport</li>
                            <li><code>children</code>: ReactNode - Content to observe</li>
                        </ul>
                        <p><strong>Use Cases:</strong></p>
                        <ul>
                            <li>Lazy loading images</li>
                            <li>Infinite scrolling</li>
                            <li>Triggering animations on scroll</li>
                            <li>Tracking visibility for analytics</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <div
                            style={{
                                position: 'sticky',
                                top: 0,
                                right: 0,
                                fontSize: 20,
                                background: '#283618',
                                padding: 15,
                                marginBottom: '1rem'
                            }}
                        >
                            Images in screen: {inScreen.join(' | ') || '(none)'}
                        </div>

                        {images.map((i) => (
                            <Observer
                                key={i}
                                wrapper="p"
                                onAppear={() =>
                                    setInScreen((prev) => Array.from(new Set([...prev, i])))
                                }
                                onDisappear={() =>
                                    setInScreen((prev) => prev.filter((item) => item !== i))
                                }
                                threshold={0.5}
                            >
                                <>
                                    <img
                                        src={`https://picsum.photos/500/500?random=${i}`}
                                        loading="lazy"
                                        alt={`Free image ${i}`}
                                        width={500}
                                        height={500}
                                        style={{ display: 'block', margin: '1rem auto' }}
                                    />
                                </>
                            </Observer>
                        ))}
                    </article>
                </section>
            </article>
        </main>
    )
}
