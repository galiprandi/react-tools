import { useState } from 'react'
import { useList } from '../../lib/main.ts'

interface TodoItem {
    id: number
    text: string
    completed: boolean
}

export const ListExample = () => {
    const { list, addItem, removeByIdx, updateByIdx, clearList } = useList<TodoItem>([
        { id: 1, text: 'Learn useList hook', completed: false },
        { id: 2, text: 'Build amazing apps', completed: true },
    ])

    const [newItem, setNewItem] = useState('')

    const handleAdd = () => {
        if (newItem.trim()) {
            const newId = Math.max(...list.map((i) => i.id), 0) + 1
            addItem({ id: newId, text: newItem, completed: false })
            setNewItem('')
        }
    }

    const handleToggle = (index: number) => {
        updateByIdx(index, (item) => ({ ...item, completed: !item.completed }))
    }

    return (
        <section>
            <hr />
            <h2>useList</h2>
            <p>
                <small>
                    A powerful hook for managing array state with immutable
                    operations. Add, remove, update, and query items easily.
                </small>
            </p>

            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Add new item..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button onClick={handleAdd}>Add</button>
                <button onClick={clearList} className="secondary">
                    Clear All
                </button>
            </div>

            <ul>
                {list.map((item, index) => (
                    <li
                        key={item.id}
                        style={{
                            textDecoration: item.completed ? 'line-through' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <span>
                            <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => handleToggle(index)}
                            />
                            {item.text}
                        </span>
                        <button
                            onClick={() => removeByIdx(index)}
                            className="secondary"
                            style={{ padding: '0.25rem 0.5rem' }}
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>

            <p>
                <small>Total items: {list.length}</small>
            </p>
        </section>
    )
}
