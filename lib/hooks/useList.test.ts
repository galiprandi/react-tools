/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useList } from '../main.ts'

describe('useList', () => {
    it('should initialize with an empty list if no initial list is provided', () => {
        const { result } = renderHook(() => useList())
        expect(result.current.list).toEqual([])
        expect(result.current.list).toHaveLength(0)
    })

    it('should initialize with the provided initial list', () => {
        const initialList = [
            { id: 1, name: 'Test' },
            { id: 2, name: 'Item' },
        ]
        const { result } = renderHook(() => useList(initialList))
        expect(result.current.list).toEqual(initialList)
        expect(result.current.list).toHaveLength(2)
    })

    it('should return a new array instance when the list changes', () => {
        const initialList = ['a', 'b']
        const { result } = renderHook(() => useList(initialList))
        const originalList = result.current.list

        act(() => {
            result.current.addItem('c')
        })

        expect(result.current.list).toEqual(['a', 'b', 'c'])
        expect(result.current.list).not.toBe(originalList)
    })

    describe('addItem', () => {
        it('should add an item to the end of the list', () => {
            const { result } = renderHook(() => useList(['a', 'b']))
            act(() => {
                result.current.addItem('c')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should add an item to an empty list', () => {
            const { result } = renderHook(() => useList<string>())
            act(() => {
                result.current.addItem('first')
            })
            expect(result.current.list).toEqual(['first'])
        })
    })

    describe('insert', () => {
        it('should insert an item at the specified index', () => {
            const { result } = renderHook(() => useList(['a', 'c']))
            act(() => {
                result.current.insert(1, 'b')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should insert at the beginning (index 0)', () => {
            const { result } = renderHook(() => useList(['b', 'c']))
            act(() => {
                result.current.insert(0, 'a')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should insert at the end (index equals length)', () => {
            const { result } = renderHook(() => useList(['a', 'b']))
            act(() => {
                result.current.insert(2, 'c')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should insert at the beginning if index is less than 0', () => {
            const { result } = renderHook(() => useList(['b', 'c']))
            act(() => {
                result.current.insert(-1, 'a')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should insert at the end if index is greater than length', () => {
            const { result } = renderHook(() => useList(['a', 'b']))
            act(() => {
                result.current.insert(100, 'c')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should insert into an empty list', () => {
            const { result } = renderHook(() => useList<string>())
            act(() => {
                result.current.insert(0, 'a')
            })
            expect(result.current.list).toEqual(['a'])
        })
    })

    describe('insertMany', () => {
        it('should add multiple items to the end of the list', () => {
            const { result } = renderHook(() => useList(['a', 'b']))
            act(() => {
                result.current.insertMany(['c', 'd'])
            })
            expect(result.current.list).toEqual(['a', 'b', 'c', 'd'])
        })

        it('should add multiple items to an empty list', () => {
            const { result } = renderHook(() => useList<string>())
            act(() => {
                result.current.insertMany(['a', 'b'])
            })
            expect(result.current.list).toEqual(['a', 'b'])
        })

        it('should do nothing if the input array is empty or not an array', () => {
            const initialList = ['a', 'b']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.insertMany(null as any)
            })
            expect(result.current.list).toBe(originalList)

            act(() => {
                result.current.insertMany([])
            })
            expect(result.current.list).toBe(originalList)
        })
    })

    describe('removeByIdx', () => {
        it('should remove the item at the specified index', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.removeByIdx(1)
            })
            expect(result.current.list).toEqual(['a', 'c'])
        })

        it('should remove the first item (index 0)', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.removeByIdx(0)
            })
            expect(result.current.list).toEqual(['b', 'c'])
        })

        it('should remove the last item (last index)', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.removeByIdx(2)
            })
            expect(result.current.list).toEqual(['a', 'b'])
        })

        it('should do nothing if the index is out of bounds', () => {
            const initialList = ['a', 'b', 'c']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.removeByIdx(-1)
            })
            expect(result.current.list).toBe(originalList)

            act(() => {
                result.current.removeByIdx(100)
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing on an empty list', () => {
            const { result } = renderHook(() => useList<string>())
            const originalList = result.current.list
            act(() => {
                result.current.removeByIdx(0)
            })
            expect(result.current.list).toBe(originalList)
        })
    })

    describe('removeBy', () => {
        it('should remove the first item matching key and value for objects', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                    { id: 3, name: 'a' },
                ]),
            )
            act(() => {
                result.current.removeBy('name', 'a')
            })
            expect(result.current.list).toEqual([
                { id: 2, name: 'b' },
                { id: 3, name: 'a' },
            ])
        })

        it('should remove the first item matching value for primitives when key is null/undefined', () => {
            // Explicitly type the hook for strings
            const { result } = renderHook(() =>
                useList<string>(['apple', 'banana', 'apple', 'cherry']),
            )
            act(() => {
                result.current.removeBy(undefined, 'apple')
            })
            expect(result.current.list).toEqual(['banana', 'apple', 'cherry'])
        })

        it('should do nothing if no item matches the condition', () => {
            const initialList = [
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
            ]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.removeBy('name', 'c')
            })
            expect(result.current.list).toBe(originalList)

            act(() => {
                result.current.removeBy('id', 99)
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing on an empty list', () => {
            const { result } = renderHook(() => useList<any>())
            const originalList = result.current.list
            act(() => {
                result.current.removeBy('id', 1)
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing if key is provided but item is not an object', () => {
            const initialList = ['a', 'b', { id: 1, name: 'c' }]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.removeBy('id', 'a')
            })
            expect(result.current.list).toBe(originalList)
        })
    })

    describe('removeManyBy', () => {
        it('should remove all items matching key and value for objects', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                    { id: 3, name: 'a' },
                ]),
            )
            act(() => {
                result.current.removeManyBy('name', 'a')
            })
            expect(result.current.list).toEqual([{ id: 2, name: 'b' }])
        })

        it('should remove all items matching value for primitives when key is null/undefined', () => {
            const { result } = renderHook(() =>
                useList<string>(['apple', 'banana', 'apple', 'cherry']),
            ) // Explicitly type
            act(() => {
                result.current.removeManyBy(undefined, 'apple')
            })
            expect(result.current.list).toEqual(['banana', 'cherry'])
        })

        it('should do nothing if no item matches the condition', () => {
            const initialList = [
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
            ]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.removeManyBy('name', 'c')
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing on an empty list', () => {
            const { result } = renderHook(() => useList<any>()) // Keep any
            const originalList = result.current.list
            act(() => {
                result.current.removeManyBy('id', 1)
            })
            expect(result.current.list).toBe(originalList)
        })
    })

    describe('updateByIdx', () => {
        it('should update the item at the specified index', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                ]),
            )
            act(() => {
                result.current.updateByIdx(1, (item) => ({
                    ...item,
                    name: 'updated',
                }))
            })
            expect(result.current.list).toEqual([
                { id: 1, name: 'a' },
                { id: 2, name: 'updated' },
            ])
        })

        it('should update the item at index 0 for primitives', () => {
            // Explicitly type the hook for strings
            const { result } = renderHook(() => useList<string>(['a', 'b']))
            act(() => {
                result.current.updateByIdx(0, (item) => item.toUpperCase())
            })
            expect(result.current.list).toEqual(['A', 'b'])
        })

        it('should do nothing if the index is out of bounds', () => {
            const initialList = ['a', 'b']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.updateByIdx(-1, (item) => item + 'X')
            })
            expect(result.current.list).toBe(originalList)

            act(() => {
                result.current.updateByIdx(100, (item) => item + 'X')
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing on an empty list', () => {
            const { result } = renderHook(() => useList<string>())
            const originalList = result.current.list
            act(() => {
                result.current.updateByIdx(0, (item) => item + 'X')
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should return a new list instance even if the updateFn returns the original item', () => {
            const initialList = [{ id: 1, name: 'a' }]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            const originalItem = originalList[0]

            act(() => {
                result.current.updateByIdx(0, (item) => item) // Return the original item instance
            })

            expect(result.current.list).toEqual(initialList)
            expect(result.current.list).not.toBe(originalList)
            expect(result.current.list[0]).toBe(originalItem)
        })
    })

    describe('updateBy', () => {
        it('should update the first item matching key and value for objects', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                    { id: 3, name: 'a' },
                ]),
            )
            act(() => {
                result.current.updateBy('name', 'a', (item) => ({
                    ...item,
                    updated: true,
                }))
            })
            expect(result.current.list).toEqual([
                { id: 1, name: 'a', updated: true },
                { id: 2, name: 'b' },
                { id: 3, name: 'a' },
            ])
        })

        it('should update the first item matching value for primitives when key is null/undefined', () => {
            const { result } = renderHook(() =>
                useList<string>(['apple', 'banana', 'apple', 'cherry']),
            ) // Explicitly type
            act(() => {
                result.current.updateBy(undefined, 'apple', (item) =>
                    item.toUpperCase(),
                )
            })
            expect(result.current.list).toEqual([
                'APPLE',
                'banana',
                'apple',
                'cherry',
            ])
        })

        it('should do nothing if no item matches the condition', () => {
            const initialList = [
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
            ]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.updateBy('name', 'c', (item) => ({
                    ...item,
                    updated: true,
                }))
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing on an empty list', () => {
            const { result } = renderHook(() => useList<any>()) // Keep any
            const originalList = result.current.list
            act(() => {
                result.current.updateBy('id', 1, (item) => ({
                    ...item,
                    updated: true,
                }))
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should return a new list instance if a match was found, even if the updateFn returns the original item instance', () => {
            const initialList = [{ id: 1, name: 'a' }]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            const originalItem = originalList[0]

            act(() => {
                result.current.updateBy('id', 1, (item) => item) // Match found, but updateFn returns original item
            })

            expect(result.current.list).toEqual(initialList)
            expect(result.current.list).not.toBe(originalList)
            expect(result.current.list[0]).toBe(originalItem)
        })
    })

    describe('updateManyBy', () => {
        it('should update all items matching key and value for objects', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                    { id: 3, name: 'a' },
                ]),
            )
            act(() => {
                result.current.updateManyBy('name', 'a', (item) => ({
                    ...item,
                    updated: true,
                }))
            })
            expect(result.current.list).toEqual([
                { id: 1, name: 'a', updated: true },
                { id: 2, name: 'b' },
                { id: 3, name: 'a', updated: true },
            ])
        })

        it('should update all items matching value for primitives when key is null/undefined', () => {
            const { result } = renderHook(() =>
                useList<string>(['apple', 'banana', 'apple', 'cherry']),
            ) // Explicitly type
            act(() => {
                result.current.updateManyBy(undefined, 'apple', (item) =>
                    item.toUpperCase(),
                )
            })
            expect(result.current.list).toEqual([
                'APPLE',
                'banana',
                'APPLE',
                'cherry',
            ])
        })

        it('should do nothing if no item matches the condition', () => {
            const initialList = [
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
            ]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.updateManyBy('name', 'c', (item) => ({
                    ...item,
                    updated: true,
                }))
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing on an empty list', () => {
            const { result } = renderHook(() => useList<any>()) // Keep any
            const originalList = result.current.list
            act(() => {
                result.current.updateManyBy('id', 1, (item) => ({
                    ...item,
                    updated: true,
                }))
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should return a new list instance if any match was found, even if updateFn returns original item for some or all matches', () => {
            const initialList = [
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
            ]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            const originalItem1 = originalList[0]
            const originalItem2 = originalList[1]

            act(() => {
                result.current.updateManyBy('name', 'a', (item) => item) // Match found, updateFn returns original item
            })

            expect(result.current.list).toEqual(initialList)
            expect(result.current.list).not.toBe(originalList)
            expect(result.current.list[0]).toBe(originalItem1)
            expect(result.current.list[1]).toBe(originalItem2)
        })
    })

    describe('clearList', () => {
        it('should remove all items from the list', () => {
            const { result } = renderHook(() => useList(['a', 'b']))
            act(() => {
                result.current.clearList()
            })
            expect(result.current.list).toEqual([])
        })

        it('should do nothing on an empty list', () => {
            const { result } = renderHook(() => useList<string>())
            const originalList = result.current.list
            act(() => {
                result.current.clearList()
            })
            expect(result.current.list).toBe(originalList)
        })
    })

    describe('setList', () => {
        it('should replace the list with a new array', () => {
            const { result } = renderHook(() => useList(['a', 'b']))
            const originalList = result.current.list
            const newList = ['x', 'y']
            act(() => {
                result.current.setList(newList)
            })
            expect(result.current.list).toEqual(newList)
            expect(result.current.list).not.toBe(originalList)
            expect(result.current.list).not.toBe(newList)
        })

        it('should replace the list using an updater function', () => {
            const { result } = renderHook(() => useList([1, 2]))
            const originalList = result.current.list
            act(() => {
                result.current.setList((currentList) =>
                    currentList.map((n) => n * 2),
                )
            })
            expect(result.current.list).toEqual([2, 4])
            expect(result.current.list).not.toBe(originalList)
        })

        it('should return a new array instance when using updater function, even if content is same', () => {
            const initialList = ['a']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.setList((currentList) => [...currentList])
            })
            expect(result.current.list).toEqual(initialList)
            expect(result.current.list).not.toBe(originalList)
        })

        it('should return a new array instance when setting a direct empty array', () => {
            const { result } = renderHook(() => useList(['a']))
            const originalList = result.current.list

            act(() => {
                result.current.setList([])
            })
            expect(result.current.list).toEqual([])
            expect(result.current.list).not.toBe(originalList)
        })
    })

    describe('findItemBy', () => {
        it('should find the first item matching key and value for objects', () => {
            const item1 = { id: 1, name: 'a' }
            const item2 = { id: 2, name: 'b' }
            const item3 = { id: 3, name: 'a' }
            const { result } = renderHook(() => useList([item1, item2, item3]))

            expect(result.current.findItemBy('name', 'a')).toBe(item1)
            expect(result.current.findItemBy('id', 2)).toBe(item2)
        })

        it('should find the first item matching value for primitives when key is null/undefined', () => {
            const list = ['apple', 'banana', 'apple', 'cherry']
            const { result } = renderHook(() => useList<string>(list))
            expect(result.current.findItemBy(undefined, 'apple')).toBe('apple')
            expect(result.current.findItemBy(null, 'banana')).toBe('banana')
        })

        it('should return undefined if no item matches the condition', () => {
            const { result } = renderHook(() => useList([{ id: 1, name: 'a' }]))
            expect(result.current.findItemBy('name', 'c')).toBeUndefined()
            expect(result.current.findItemBy('id', 99)).toBeUndefined()
        })

        it('should return undefined on an empty list', () => {
            const { result } = renderHook(() => useList<any>())
            expect(result.current.findItemBy('id', 1)).toBeUndefined()
        })
    })

    describe('findItemsBy', () => {
        it('should find all items matching key and value for objects', () => {
            const item1 = { id: 1, name: 'a' }
            const item2 = { id: 2, name: 'b' }
            const item3 = { id: 3, name: 'a' }
            const { result } = renderHook(() => useList([item1, item2, item3]))

            const foundByName = result.current.findItemsBy('name', 'a')
            expect(foundByName).toEqual([item1, item3])
            expect(foundByName).toHaveLength(2)
            expect(foundByName[0]).toBe(item1)
            expect(foundByName[1]).toBe(item3)

            const foundById = result.current.findItemsBy('id', 2)
            expect(foundById).toEqual([item2])
            expect(foundById).toHaveLength(1)
            expect(foundById[0]).toBe(item2)
        })

        it('should find all items matching value for primitives when key is null/undefined', () => {
            const list = ['apple', 'banana', 'apple', 'cherry']
            const { result } = renderHook(() => useList<string>(list))
            const foundApples = result.current.findItemsBy(undefined, 'apple')
            expect(foundApples).toEqual(['apple', 'apple'])
            expect(foundApples).toHaveLength(2)

            const foundBananas = result.current.findItemsBy(null, 'banana')
            expect(foundBananas).toEqual(['banana'])
            expect(foundBananas).toHaveLength(1)
        })

        it('should return an empty array if no item matches the condition', () => {
            const { result } = renderHook(() => useList([{ id: 1, name: 'a' }]))
            expect(result.current.findItemsBy('name', 'c')).toEqual([])
            expect(result.current.findItemsBy('id', 99)).toEqual([])
        })

        it('should return an empty array on an empty list', () => {
            const { result } = renderHook(() => useList<any>())
            expect(result.current.findItemsBy('id', 1)).toEqual([])
        })
    })

    describe('count', () => {
        it('should return the total number of items if no predicate is provided', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            expect(result.current.count()).toBe(3)
        })

        it('should return 0 for an empty list if no predicate is provided', () => {
            const { result } = renderHook(() => useList<string>())
            expect(result.current.count()).toBe(0)
        })

        it('should return the number of items matching the predicate', () => {
            const list = [
                { id: 1, done: true },
                { id: 2, done: false },
                { id: 3, done: true },
            ]
            const { result } = renderHook(() => useList(list))
            expect(result.current.count((item) => item.done)).toBe(2)
            expect(result.current.count((item) => !item.done)).toBe(1)
        })

        it('should return 0 if the predicate matches no items', () => {
            const list = [
                { id: 1, done: true },
                { id: 2, done: false },
            ]
            const { result } = renderHook(() => useList(list))
            expect(result.current.count((item) => item.id === 99)).toBe(0)
        })

        it('should return 0 for an empty list if a predicate is provided', () => {
            const { result } = renderHook(() => useList<any>())
            expect(result.current.count((item) => item.done)).toBe(0)
        })
    })
})
