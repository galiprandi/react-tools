import { LazyRender } from '../../../lib/main'

export const UseLazyRenderPage = () => {
    return (
        <main className="container">
            <article>
                <header>
                    <h1>LazyRender</h1>
                    <p>Lazy render component for viewport-based rendering</p>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article className="secondary">
                        <p>The <code>LazyRender</code> component renders children only when the element is in the viewport and unmounts when it exits the viewport.</p>
                        <p><strong>Props:</strong></p>
                        <ul>
                            <li><code>wrapper</code>: keyof JSX.IntrinsicElements - Wrapper element type</li>
                            <li><code>placeholder</code>: ReactNode - Placeholder to show while not in viewport</li>
                            <li><code>threshold</code>: number - Intersection threshold (0-1)</li>
                            <li><code>children</code>: ReactNode - Content to lazy render</li>
                        </ul>
                        <p><strong>Use Cases:</strong></p>
                        <ul>
                            <li>Lazy loading images</li>
                            <li>Performance optimization for long lists</li>
                            <li>Reducing initial render time</li>
                            <li>Memory management</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article className="secondary">
                        <p>Scroll down to see the image load:</p>
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <small>↓ Scroll ↓</small>
                        </div>
                        <LazyRender wrapper="section" placeholder={<p>Loading...</p>}>
                            <img
                                src={`https://picsum.photos/500/500`}
                                loading="lazy"
                                alt="Free image"
                                width={500}
                                height={500}
                                style={{ display: 'block', margin: '1rem auto' }}
                            />
                        </LazyRender>
                    </article>
                </section>
            </article>
        </main>
    )
}
