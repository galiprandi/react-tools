import { useList } from '../../../lib/main'

interface Item {
    id: number
    name: string
    value: number
}

export const UseListPage = () => {
    const { list, addItem, insert, insertMany, removeByIdx, removeBy, removeManyBy, updateByIdx, updateBy, updateManyBy, clearList, setList, findItemBy, findItemsBy, count, toggle, move, sort, shuffle } = useList<Item>([
        { id: 1, name: 'Item 1', value: 10 },
        { id: 2, name: 'Item 2', value: 20 },
        { id: 3, name: 'Item 3', value: 30 },
    ])

    const handleAddItem = () => {
        const newId = Math.max(...list.map(i => i.id), 0) + 1
        addItem({ id: newId, name: `Item ${newId}`, value: newId * 10 })
    }

    const handleInsert = () => {
        const newId = Math.max(...list.map(i => i.id), 0) + 1
        insert(1, { id: newId, name: `Inserted ${newId}`, value: newId * 10 })
    }

    const handleInsertMany = () => {
        const maxId = Math.max(...list.map(i => i.id), 0)
        insertMany([
            { id: maxId + 1, name: 'Bulk 1', value: 100 },
            { id: maxId + 2, name: 'Bulk 2', value: 200 },
        ])
    }

    const handleRemoveByIdx = () => {
        if (list.length > 0) removeByIdx(0)
    }

    const handleRemoveBy = () => {
        removeBy('name', 'Item 1')
    }

    const handleRemoveManyBy = () => {
        removeManyBy('value', 10)
    }

    const handleUpdateByIdx = () => {
        if (list.length > 0) updateByIdx(0, (item) => ({ ...item, name: 'Updated ' + item.name }))
    }

    const handleUpdateBy = () => {
        updateBy('name', 'Item 2', (item) => ({ ...item, value: item.value * 2 }))
    }

    const handleUpdateManyBy = () => {
        updateManyBy('value', 20, (item) => ({ ...item, name: 'Updated ' + item.name }))
    }

    const handleClear = () => {
        clearList()
    }

    const handleSetList = () => {
        setList([{ id: 99, name: 'Reset Item', value: 999 }])
    }

    const handleToggle = () => {
        toggle({ id: 1, name: 'Item 1', value: 10 })
    }

    const handleMove = () => {
        if (list.length >= 2) move(0, list.length - 1)
    }

    const handleSort = () => {
        sort((a, b) => a.value - b.value)
    }

    const handleShuffle = () => {
        shuffle()
    }

    return (
        <main>
            <article>
                <header>
                    <h1>useList</h1>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>useList</code> hook simplifies managing array state with immutable helper methods.</p>
                        <p><strong>Parameters:</strong></p>
                        <ul>
                            <li><code>initialList</code>: T[] - Initial array state (default: [])</li>
                        </ul>
                        <p><strong>Returns:</strong></p>
                        <ul>
                            <li><code>list</code>: T[] - Current array state</li>
                            <li><code>addItem</code>: Add item to end</li>
                            <li><code>insert</code>: Insert at index</li>
                            <li><code>insertMany</code>: Add multiple items</li>
                            <li><code>removeByIdx</code>: Remove by index</li>
                            <li><code>removeBy</code>: Remove first matching item</li>
                            <li><code>removeManyBy</code>: Remove all matching items</li>
                            <li><code>updateByIdx</code>: Update by index</li>
                            <li><code>updateBy</code>: Update first matching</li>
                            <li><code>updateManyBy</code>: Update all matching</li>
                            <li><code>clearList</code>: Clear all items</li>
                            <li><code>setList</code>: Replace entire list</li>
                            <li><code>findItemBy</code>: Find first matching</li>
                            <li><code>findItemsBy</code>: Find all matching</li>
                            <li><code>count</code>: Count items</li>
                            <li><code>toggle</code>: Add if not present, remove if is</li>
                            <li><code>move</code>: Move item</li>
                            <li><code>sort</code>: Sort list</li>
                            <li><code>shuffle</code>: Randomly reorder</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={handleAddItem}>Add Item</button>
                            <button onClick={handleInsert}>Insert at Index 1</button>
                            <button onClick={handleInsertMany}>Insert Many</button>
                            <button onClick={handleRemoveByIdx} className="secondary">Remove By Index 0</button>
                            <button onClick={handleRemoveBy} className="secondary">Remove By Name &apos;Item 1&apos;</button>
                            <button onClick={handleRemoveManyBy} className="secondary">Remove Many By Value 10</button>
                            <button onClick={handleUpdateByIdx}>Update Index 0</button>
                            <button onClick={handleUpdateBy}>Update &apos;Item 2&apos;</button>
                            <button onClick={handleUpdateManyBy}>Update Many Value 20</button>
                            <button onClick={handleToggle}>Toggle Item 1</button>
                            <button onClick={handleMove}>Move First to Last</button>
                            <button onClick={handleSort}>Sort by Value</button>
                            <button onClick={handleShuffle}>Shuffle</button>
                            <button onClick={handleSetList}>Reset List</button>
                            <button onClick={handleClear} className="secondary">Clear All</button>
                        </div>

                        <details>
                            <summary>Current List ({list.length} items)</summary>
                            <pre>
                                <code>{JSON.stringify(list, null, 2)}</code>
                            </pre>
                        </details>

                        <details>
                            <summary>Query Results</summary>
                            <pre>
                                <code>{JSON.stringify({
                                    findItemBy: findItemBy('name', 'Item 2'),
                                    findItemsBy_value20: findItemsBy('value', 20),
                                    count_total: count(),
                                    count_value_gt_15: count(item => item.value > 15),
                                    count_value_gt_100: count(item => item.value > 100)
                                }, null, 2)}</code>
                            </pre>
                        </details>

                        <table>
                            <thead>
                                <tr>
                                    <th>Index</th>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index}</td>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </article>
                </section>
            </article>
        </main>
    )
}
