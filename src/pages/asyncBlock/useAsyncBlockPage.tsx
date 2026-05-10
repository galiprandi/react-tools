import { useState } from 'react'
import { AsyncBlock } from '../../../lib/main'

const fetchCharactersByPage = async (page: number, signal?: AbortSignal) => {
    const res = await fetch(
        `https://rickandmortyapi.com/api/character?page=${page}`,
        signal ? { signal } : undefined,
    )
    if (!res.ok) throw new Error('Failed to fetch characters')
    return res.json()
}

export const UseAsyncBlockPage = () => {
    const [page, setPage] = useState(1)

    return (
        <main>
            <article>
                <header>
                    <h1>AsyncBlock</h1>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>AsyncBlock</code> component handles async data fetching with automatic loading, success, and error states.</p>
                        <p><strong>Props:</strong></p>
                        <ul>
                            <li><code>promiseFn</code>: (signal?: AbortSignal) =&gt; Promise&lt;T&gt; - Async function to fetch data</li>
                            <li><code>deps</code>: unknown[] - Dependencies to refetch when changed</li>
                            <li><code>pending</code>: ReactNode - Component to show while loading</li>
                            <li><code>success</code>: (data: T) =&gt; ReactNode - Component to show with fetched data</li>
                            <li><code>error</code>: (err: Error) =&gt; ReactNode - Component to show on error</li>
                            <li><code>timeOut</code>: number - Timeout in milliseconds</li>
                        </ul>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Automatic loading states</li>
                            <li>Error handling</li>
                            <li>Abort signal support</li>
                            <li>Dependency-based refetching</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <div style={{ marginBottom: '1rem' }}>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </button>
                            <span style={{ margin: '0 1rem' }}>Page {page}</span>
                            <button onClick={() => setPage((p) => p + 1)}>
                                Next
                            </button>
                        </div>

                        <AsyncBlock
                            promiseFn={(signal) => fetchCharactersByPage(page, signal)}
                            deps={[page]}
                            pending={<p>Loading page {page}...</p>}
                            success={(data) => (
                                <section>
                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {data.results.map((char: Character) => (
                                            <img
                                                key={char.id}
                                                src={char.image}
                                                alt={char.name}
                                                width={80}
                                                height={80}
                                                style={{ margin: '0.5rem', borderRadius: '8px' }}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                            error={(err) => (
                                <p style={{ color: 'red' }}>{(err as Error)?.message}</p>
                            )}
                            timeOut={5000}
                        />
                    </article>
                </section>
            </article>
        </main>
    )
}

type Character = {
    id: number
    name: string
    image: string
}
