/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react'

function getValueToCompare<T>(item: T, key: string | undefined | null): any {
    if (key === undefined || key === null) {
        return item
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
 */
export function useList<T>(initialList: T[] = []): UseListReturn<T> {
    const [list, setList] = useState<T[]>(initialList)

    // CORRECCIÓN AQUÍ: Asegura que siempre se pase una NUEVA instancia a setList si no es un updater function
    const setListCallback = useCallback(
        (newList: T[] | ((currentList: T[]) => T[])) => {
            if (typeof newList === 'function') {
                setList((currentList) => {
                    const result = newList(currentList)
                    // Si el updater retorna un array, asegúrate de que sea una *nueva* instancia para React
                    // Si el resultado es el mismo array que currentList, setList optimizará y no re-renderizará.
                    // Si el resultado es un *nuevo* array con el mismo contenido, setList *sí* re-renderizará.
                    // Esto puede ser un debate de rendimiento vs. garantía de nueva instancia.
                    // La forma más segura para testing (garantizar nueva instancia si *cualquier* cambio ocurrió)
                    // y a menudo práctica es que los métodos (remove, update, add) *ya devuelvan* nuevas instancias cuando cambian.
                    // Y que setListCallback simplemente pase el resultado.
                    // ¡La corrección anterior ya hizo eso!
                    // Simplemente pasemos el resultado del updater.
                    return result // Pass the result directly
                })
            } else {
                // Si es un array directo, crea una *copia* para asegurar una nueva instancia
                // Esto es lo que espera el test `should replace the list with a new array`.
                setList([...newList]) // <--- Usamos spread para crear una copia
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
            if (!Array.isArray(items) || items.length === 0) return // Verifica si items es un array no vacío
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
}
