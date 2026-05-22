/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'
import { isRestrictedKey } from '../utilities/security'

const RESTRICTED_SYMBOL = Symbol('RESTRICTED_KEY')

function getValueToCompare<T>(item: T, key: string | undefined | null): any {
    if (key === undefined || key === null) {
        return item
    }

    if (isRestrictedKey(key)) {
        return RESTRICTED_SYMBOL
    }
    if (typeof item === 'object' && item !== null) {
        return (item as any)[key]
    }
    return undefined
}

/**
 * A React hook to simplify managing array state in components with helpers for common immutable operations based on index or item properties.
 * It provides methods to add, insert, remove, and update items in the list immutably.
 *
 * @template T The type of elements in the list array.
 * @param {T[]} [initialList=[]] The initial array state.
 * @returns {UseListReturn<T>} An object containing the current array state and helper functions to modify it immutably.
 *
 * @example
 * ```tsx
 * interface Task {
 *   id: number;
 *   title: string;
 *   done: boolean;
 * }
 *
 * const { list, addItem, removeBy, updateBy, toggle } = useList<Task>([
 *   { id: 1, title: 'Buy milk', done: false }
 * ]);
 *
 * const addTask = (title: string) => {
 *   addItem({ id: Date.now(), title, done: false });
 * };
 *
 * const removeTask = (id: number) => {
 *   removeBy('id', id);
 * };
 *
 * const completeTask = (id: number) => {
 *   updateBy('id', id, (task) => ({ ...task, done: true }));
 * };
 * ```
 */
export function useList<T>(initialList: T[] = []): UseListReturn<T> {
    const [list, setList] = useState<T[]>(initialList)

    // Ensure that a NEW instance is always passed to setList if it's not an updater function
    const setListCallback = useCallback(
        (newList: T[] | ((currentList: T[]) => T[])) => {
            if (typeof newList === 'function') {
                setList((currentList) => {
                    const result = newList(currentList)
                    // Return the result directly. Methods like remove, update, and add
                    // already return new instances when changes occur.
                    return result
                })
            } else {
                // If it's a direct array, create a copy to ensure a new instance
                setList([...newList])
            }
        },
        [setList],
    ) // setList itself is stable

    const addItem = useCallback(
        (item: T) => {
            setListCallback((currentList) => [...currentList, item])
        },
        [setListCallback],
    )

    const insert = useCallback(
        (index: number, item: T) => {
            setListCallback((currentList) => {
                const safeIndex = Math.max(
                    0,
                    Math.min(currentList.length, index),
                )
                return [
                    ...currentList.slice(0, safeIndex),
                    item,
                    ...currentList.slice(safeIndex),
                ]
            })
        },
        [setListCallback],
    )

    const insertMany = useCallback(
        (items: T[]) => {
            // Verify if items is a non-empty array
            if (!Array.isArray(items) || items.length === 0) return
            setListCallback((currentList) => [...currentList, ...items])
        },
        [setListCallback],
    )

    const removeByIdx = useCallback(
        (index: number) => {
            setListCallback((currentList) => {
                if (index < 0 || index >= currentList.length) {
                    return currentList
                }
                return currentList.filter((_, i) => i !== index)
            })
        },
        [setListCallback],
    )

    const removeBy = useCallback(
        (key: string | undefined | null, value: any) => {
            setListCallback((currentList) => {
                const indexToRemove = currentList.findIndex(
                    (item) => getValueToCompare(item, key) === value,
                )
                if (indexToRemove === -1) {
                    return currentList
                }
                return currentList.filter((_, index) => index !== indexToRemove)
            })
        },
        [setListCallback],
    )

    const removeManyBy = useCallback(
        (key: string | undefined | null, value: any) => {
            setListCallback((currentList) => {
                const newList = currentList.filter(
                    (item) => getValueToCompare(item, key) !== value,
                )
                if (newList.length === currentList.length) {
                    return currentList
                }
                return newList
            })
        },
        [setListCallback],
    )

    const updateByIdx = useCallback(
        (index: number, updateFn: (item: T) => T) => {
            setListCallback((currentList) => {
                if (index < 0 || index >= currentList.length) {
                    return currentList
                }
                return currentList.map((item, i) =>
                    i === index ? updateFn(item) : item,
                )
            })
        },
        [setListCallback],
    )

    const updateBy = useCallback(
        (
            key: string | undefined | null,
            value: any,
            updateFn: (item: T) => T,
        ) => {
            setListCallback((currentList) => {
                let updated = false
                const newList = currentList.map((item) => {
                    if (!updated && getValueToCompare(item, key) === value) {
                        updated = true
                        return updateFn(item)
                    }
                    return item
                })
                return updated ? newList : currentList
            })
        },
        [setListCallback],
    )

    const updateManyBy = useCallback(
        (
            key: string | undefined | null,
            value: any,
            updateFn: (item: T) => T,
        ) => {
            setListCallback((currentList) => {
                let updateOccurred = false
                const newList = currentList.map((item) => {
                    if (getValueToCompare(item, key) === value) {
                        updateOccurred = true
                        return updateFn(item)
                    }
                    return item
                })
                return updateOccurred ? newList : currentList
            })
        },
        [setListCallback],
    )

    const clearList = useCallback(() => {
        setListCallback((currentList) => {
            if (currentList.length === 0) {
                return currentList
            }
            return []
        })
    }, [setListCallback])

    const setListApi = setListCallback // Expose the memoized wrapper

    const findItemBy = useCallback(
        (key: string | undefined | null, value: any): T | undefined => {
            return list.find((item) => getValueToCompare(item, key) === value)
        },
        [list],
    )

    const findItemsBy = useCallback(
        (key: string | undefined | null, value: any): T[] => {
            return list.filter((item) => getValueToCompare(item, key) === value)
        },
        [list],
    )

    const count = useCallback(
        (predicate?: (item: T) => boolean): number => {
            if (predicate) {
                return list.filter(predicate).length
            }
            return list.length
        },
        [list],
    )

    const toggle = useCallback(
        (item: T, key?: string | undefined | null) => {
            const value = getValueToCompare(item, key)
            const index = list.findIndex(
                (i) => getValueToCompare(i, key) === value,
            )

            if (index === -1) {
                addItem(item)
            } else {
                removeByIdx(index)
            }
        },
        [list, addItem, removeByIdx],
    )

    const move = useCallback(
        (fromIndex: number, toIndex: number) => {
            setListCallback((currentList) => {
                if (
                    fromIndex < 0 ||
                    fromIndex >= currentList.length ||
                    toIndex < 0 ||
                    toIndex >= currentList.length ||
                    fromIndex === toIndex
                ) {
                    return currentList
                }

                const newList = [...currentList]
                const [item] = newList.splice(fromIndex, 1)
                newList.splice(toIndex, 0, item)
                return newList
            })
        },
        [setListCallback],
    )

    const sort = useCallback(
        (
            keyOrCompareFn?: string | ((a: T, b: T) => number) | null,
            order: 'asc' | 'desc' = 'asc',
        ) => {
            setListCallback((currentList) => {
                const newList = [...currentList]
                if (typeof keyOrCompareFn === 'function') {
                    return newList.sort(keyOrCompareFn)
                }

                return newList.sort((a, b) => {
                    const valA = getValueToCompare(a, keyOrCompareFn)
                    const valB = getValueToCompare(b, keyOrCompareFn)

                    if (valA === valB) return 0

                    if (valA === undefined || valA === null) return 1
                    if (valB === undefined || valB === null) return -1

                    const result = valA < valB ? -1 : 1
                    return order === 'asc' ? result : -result
                })
            })
        },
        [setListCallback],
    )

    const shuffle = useCallback(() => {
        setListCallback((currentList) => {
            const newList = [...currentList]
            for (let i = newList.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[newList[i], newList[j]] = [newList[j], newList[i]]
            }
            return newList
        })
    }, [setListCallback])

    const swap = useCallback(
        (indexA: number, indexB: number) => {
            setListCallback((currentList) => {
                if (
                    indexA < 0 ||
                    indexA >= currentList.length ||
                    indexB < 0 ||
                    indexB >= currentList.length ||
                    indexA === indexB
                ) {
                    return currentList
                }

                const newList = [...currentList]
                ;[newList[indexA], newList[indexB]] = [
                    newList[indexB],
                    newList[indexA],
                ]
                return newList
            })
        },
        [setListCallback],
    )

    return {
        list,
        addItem,
        insert,
        insertMany,
        removeByIdx,
        removeBy,
        removeManyBy,
        updateByIdx,
        updateBy,
        updateManyBy,
        clearList,
        setList: setListApi,

        findItemBy,
        findItemsBy,
        count,
        toggle,
        move,
        sort,
        shuffle,
        swap,
    }
}

/**
 * Represents the return value of the useList hook.
 * Contains the current list and methods to manipulate it.
 * @template T The type of elements in the list array.
 */
interface UseListReturn<T> {
    /** The current array state. */
    list: T[]
    /** Adds an item to the end of the list. */
    addItem: (item: T) => void
    /** Inserts an item at a specific index. */
    insert: (index: number, item: T) => void
    /** Adds multiple items to the end of the list. */
    insertMany: (items: T[]) => void
    /** Removes the item at a specific index. */
    removeByIdx: (index: number) => void
    /** Removes the first item matching a key/value pair (or value if key is null/undefined). */
    removeBy: (key: string | undefined | null, value: any) => void
    /** Removes all items matching a key/value pair (or value if key is null/undefined). */
    removeManyBy: (key: string | undefined | null, value: any) => void
    /** Updates the item at a specific index using an update function. */
    updateByIdx: (index: number, updateFn: (item: T) => T) => void
    /** Updates the first item matching a key/value pair using an update function. */
    updateBy: (
        key: string | undefined | null,
        value: any,
        updateFn: (item: T) => T,
    ) => void
    /** Updates all items matching a key/value pair using an update function. */
    updateManyBy: (
        key: string | undefined | null,
        value: any,
        updateFn: (item: T) => T,
    ) => void
    /** Removes all items from the list. */
    clearList: () => void
    /** Replaces the entire list array or updates it with a function. */
    setList: (newList: T[] | ((currentList: T[]) => T[])) => void

    /** Finds and returns the first item matching a key/value pair (or value if key is null/undefined). */
    findItemBy: (key: string | undefined | null, value: any) => T | undefined
    /** Finds and returns all items matching a key/value pair (or value if key is null/undefined). */
    findItemsBy: (key: string | undefined | null, value: any) => T[]
    /** Returns the total number of items, or count of items matching a predicate. */
    count: (predicate?: (item: T) => boolean) => number
    /** Adds an item if it's not present, or removes it if it is, based on an optional key or reference comparison. */
    toggle: (item: T, key?: string | undefined | null) => void
    /** Moves an item from one index to another immutably. */
    move: (fromIndex: number, toIndex: number) => void
    /** Sorts the list immutably using an optional key or comparison function, and an optional sort order. */
    sort: (
        keyOrCompareFn?: string | ((a: T, b: T) => number) | null,
        order?: 'asc' | 'desc',
    ) => void
    /** Randomly reorders the list items immutably. */
    shuffle: () => void
    /** Swaps two items in the list immutably based on their indices. */
    swap: (indexA: number, indexB: number) => void
}
