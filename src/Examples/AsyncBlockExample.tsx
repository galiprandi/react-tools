import { useState } from 'react'
import { AsyncBlock } from '../../lib/main.ts'

const fetchCharactersByPage = async (page: number, signal?: AbortSignal) => {
    const res = await fetch(
        `https://rickandmortyapi.com/api/character?page=${page}`,
        signal ? { signal } : undefined,
    )
    if (!res.ok) throw new Error('Failed to fetch characters')
    return res.json()
}

export const AsyncBlockExample = () => {
    const [page, setPage] = useState(1)

    return (
        <section>
            <hr />
            <h2>AsyncBlock</h2>
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
                                    width={40}
                                    height={40}
                                    style={{ margin: '1rem' }}
                                />
                            ))}
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </button>
                            <button onClick={() => setPage((p) => p + 1)}>
                                Next
                            </button>
                        </div>
                    </section>
                )}
                error={(err) => (
                    <p style={{ color: 'red' }}>{(err as Error)?.message}</p>
                )}
                timeOut={5000}
            />
        </section>
    )
}

type Character = {
    id: number
    name: string
    image: string
}
