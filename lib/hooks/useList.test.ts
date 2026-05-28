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

    describe('removeWhere', () => {
        it('should remove items matching the predicate', () => {
            const { result } = renderHook(() => useList([1, 2, 3, 4, 5]))
            act(() => {
                result.current.removeWhere((n) => n % 2 === 0)
            })
            expect(result.current.list).toEqual([1, 3, 5])
        })

        it('should remove items based on index', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.removeWhere((_, i) => i === 1)
            })
            expect(result.current.list).toEqual(['a', 'c'])
        })

        it('should do nothing if no item matches the predicate', () => {
            const initialList = [1, 3, 5]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.removeWhere((n) => n % 2 === 0)
            })
            expect(result.current.list).toBe(originalList)
        })
    })

    describe('updateWhere', () => {
        it('should update items matching the predicate', () => {
            const { result } = renderHook(() => useList([1, 2, 3, 4, 5]))
            act(() => {
                result.current.updateWhere(
                    (n) => n % 2 === 0,
                    (n) => n * 10,
                )
            })
            expect(result.current.list).toEqual([1, 20, 3, 40, 5])
        })

        it('should update items based on index', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.updateWhere(
                    (_, i) => i === 1,
                    (val) => val.toUpperCase(),
                )
            })
            expect(result.current.list).toEqual(['a', 'B', 'c'])
        })

        it('should do nothing if no item matches the predicate', () => {
            const initialList = [1, 3, 5]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.updateWhere(
                    (n) => n % 2 === 0,
                    (n) => n * 10,
                )
            })
            expect(result.current.list).toBe(originalList)
        })
    })

    describe('unique', () => {
        it('should remove duplicate primitives', () => {
            const { result } = renderHook(() => useList([1, 2, 2, 3, 1, 4]))
            act(() => {
                result.current.unique()
            })
            expect(result.current.list).toEqual([1, 2, 3, 4])
        })

        it('should remove duplicate objects by reference', () => {
            const obj1 = { id: 1 }
            const obj2 = { id: 2 }
            const { result } = renderHook(() => useList([obj1, obj2, obj1]))
            act(() => {
                result.current.unique()
            })
            expect(result.current.list).toEqual([obj1, obj2])
        })

        it('should remove duplicate objects by key', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                    { id: 1, name: 'c' },
                ]),
            )
            act(() => {
                result.current.unique('id')
            })
            expect(result.current.list).toEqual([
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
            ])
        })

        it('should do nothing if all items are already unique', () => {
            const initialList = [1, 2, 3]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.unique()
            })
            expect(result.current.list).toBe(originalList)
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

    describe('findIdxBy', () => {
        it('should find the index of the first item matching key and value for objects', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                    { id: 3, name: 'a' },
                ]),
            )
            expect(result.current.findIdxBy('name', 'a')).toBe(0)
            expect(result.current.findIdxBy('id', 2)).toBe(1)
            expect(result.current.findIdxBy('id', 3)).toBe(2)
        })

        it('should find the index of the first item matching value for primitives when key is null/undefined', () => {
            const { result } = renderHook(() =>
                useList<string>(['apple', 'banana', 'apple', 'cherry']),
            )
            expect(result.current.findIdxBy(undefined, 'apple')).toBe(0)
            expect(result.current.findIdxBy(null, 'banana')).toBe(1)
            expect(result.current.findIdxBy(undefined, 'cherry')).toBe(3)
        })

        it('should return -1 if no item matches the condition', () => {
            const { result } = renderHook(() => useList([{ id: 1, name: 'a' }]))
            expect(result.current.findIdxBy('name', 'c')).toBe(-1)
            expect(result.current.findIdxBy('id', 99)).toBe(-1)
        })

        it('should return -1 on an empty list', () => {
            const { result } = renderHook(() => useList<any>())
            expect(result.current.findIdxBy('id', 1)).toBe(-1)
        })
    })

    describe('contains', () => {
        it('should return true if an item matches key and value for objects', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                ]),
            )
            expect(result.current.contains('name', 'a')).toBe(true)
            expect(result.current.contains('id', 2)).toBe(true)
        })

        it('should return true if an item matches value for primitives when key is null/undefined', () => {
            const { result } = renderHook(() =>
                useList<string>(['apple', 'banana', 'cherry']),
            )
            expect(result.current.contains(undefined, 'apple')).toBe(true)
            expect(result.current.contains(null, 'banana')).toBe(true)
        })

        it('should return false if no item matches the condition', () => {
            const { result } = renderHook(() => useList([{ id: 1, name: 'a' }]))
            expect(result.current.contains('name', 'c')).toBe(false)
            expect(result.current.contains('id', 99)).toBe(false)
        })

        it('should return false on an empty list', () => {
            const { result } = renderHook(() => useList<any>())
            expect(result.current.contains('id', 1)).toBe(false)
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

    describe('toggle', () => {
        it('should add a primitive item if it is not in the list', () => {
            const { result } = renderHook(() => useList<string>(['a', 'b']))
            act(() => {
                result.current.toggle('c')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should remove a primitive item if it is in the list', () => {
            const { result } = renderHook(() => useList<string>(['a', 'b', 'c']))
            act(() => {
                result.current.toggle('b')
            })
            expect(result.current.list).toEqual(['a', 'c'])
        })

        it('should add an object if it is not in the list (by reference)', () => {
            const item1 = { id: 1, name: 'a' }
            const item2 = { id: 2, name: 'b' }
            const { result } = renderHook(() => useList([item1]))
            act(() => {
                result.current.toggle(item2)
            })
            expect(result.current.list).toEqual([item1, item2])
        })

        it('should remove an object if it is in the list (by reference)', () => {
            const item1 = { id: 1, name: 'a' }
            const item2 = { id: 2, name: 'b' }
            const { result } = renderHook(() => useList([item1, item2]))
            act(() => {
                result.current.toggle(item2)
            })
            expect(result.current.list).toEqual([item1])
        })

        it('should add an object if it is not in the list (by key)', () => {
            const item1 = { id: 1, name: 'a' }
            const { result } = renderHook(() => useList([item1]))
            act(() => {
                result.current.toggle({ id: 2, name: 'other' }, 'id')
            })
            expect(result.current.list).toEqual([item1, { id: 2, name: 'other' }])
        })

        it('should remove an object if it is in the list (by key)', () => {
            const item1 = { id: 1, name: 'a' }
            const item2 = { id: 2, name: 'b' }
            const { result } = renderHook(() => useList([item1, item2]))
            act(() => {
                result.current.toggle({ id: 2, name: 'anything' }, 'id')
            })
            expect(result.current.list).toEqual([item1])
        })
    })

    describe('upsert', () => {
        it('should add a primitive item if it is not in the list', () => {
            const { result } = renderHook(() => useList<string>(['a', 'b']))
            act(() => {
                result.current.upsert('c')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should update a primitive item if it is in the list', () => {
            const { result } = renderHook(() => useList<string>(['a', 'b', 'c']))
            act(() => {
                result.current.upsert('b')
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
            // Even if same value, it should be a new array instance because of setListCallback
        })

        it('should add an object if it is not in the list (by reference)', () => {
            const item1 = { id: 1, name: 'a' }
            const item2 = { id: 2, name: 'b' }
            const { result } = renderHook(() => useList([item1]))
            act(() => {
                result.current.upsert(item2)
            })
            expect(result.current.list).toEqual([item1, item2])
        })

        it('should update an object if it is in the list (by reference)', () => {
            const item1 = { id: 1, name: 'a' }
            const item2 = { id: 2, name: 'b' }
            const { result } = renderHook(() => useList([item1, item2]))
            act(() => {
                result.current.upsert(item2)
            })
            expect(result.current.list).toEqual([item1, item2])
            expect(result.current.list[1]).toBe(item2)
        })

        it('should add an object if it is not in the list (by key)', () => {
            const item1 = { id: 1, name: 'a' }
            const { result } = renderHook(() => useList([item1]))
            act(() => {
                result.current.upsert({ id: 2, name: 'other' }, 'id')
            })
            expect(result.current.list).toEqual([
                item1,
                { id: 2, name: 'other' },
            ])
        })

        it('should update an object if it is in the list (by key)', () => {
            const item1 = { id: 1, name: 'a' }
            const item2 = { id: 2, name: 'b' }
            const { result } = renderHook(() => useList([item1, item2]))
            const newItem2 = { id: 2, name: 'updated' }
            act(() => {
                result.current.upsert(newItem2, 'id')
            })
            expect(result.current.list).toEqual([item1, newItem2])
            expect(result.current.list[1]).toBe(newItem2)
            expect(result.current.list[1]).not.toBe(item2)
        })

        it('should always add if key is restricted', () => {
            const { result } = renderHook(() => useList<any>([{ id: 1 }]))
            act(() => {
                result.current.upsert({ constructor: 'malicious' }, 'constructor')
            })
            expect(result.current.list).toHaveLength(2)
            expect(result.current.list[1]).toEqual({ constructor: 'malicious' })
        })
    })

    describe('move', () => {
        it('should move an item forward in the list', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.move(0, 1)
            })
            expect(result.current.list).toEqual(['b', 'a', 'c'])
        })

        it('should move an item backward in the list', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.move(2, 0)
            })
            expect(result.current.list).toEqual(['c', 'a', 'b'])
        })

        it('should move an item to the same position without change', () => {
            const initialList = ['a', 'b', 'c']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.move(1, 1)
            })
            expect(result.current.list).toEqual(initialList)
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing if fromIndex is out of bounds', () => {
            const initialList = ['a', 'b', 'c']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.move(-1, 1)
            })
            expect(result.current.list).toBe(originalList)
            act(() => {
                result.current.move(3, 1)
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing if toIndex is out of bounds', () => {
            const initialList = ['a', 'b', 'c']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.move(1, -1)
            })
            expect(result.current.list).toBe(originalList)
            act(() => {
                result.current.move(1, 3)
            })
            expect(result.current.list).toBe(originalList)
        })
    })

    describe('sort', () => {
        it('should sort the list with default sort order (ascending)', () => {
            const { result } = renderHook(() => useList(['b', 'c', 'a']))
            act(() => {
                result.current.sort()
            })
            expect(result.current.list).toEqual(['a', 'b', 'c'])
        })

        it('should sort the list in descending order for primitives', () => {
            const { result } = renderHook(() => useList(['b', 'c', 'a']))
            act(() => {
                result.current.sort(null, 'desc')
            })
            expect(result.current.list).toEqual(['c', 'b', 'a'])
        })

        it('should sort the list by key in ascending order', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 3, name: 'c' },
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                ]),
            )
            act(() => {
                result.current.sort('id')
            })
            expect(result.current.list).toEqual([
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
                { id: 3, name: 'c' },
            ])
        })

        it('should sort the list by key in descending order', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 3, name: 'c' },
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                ]),
            )
            act(() => {
                result.current.sort('name', 'desc')
            })
            expect(result.current.list).toEqual([
                { id: 3, name: 'c' },
                { id: 2, name: 'b' },
                { id: 1, name: 'a' },
            ])
        })

        it('should sort the list with a custom compare function', () => {
            const { result } = renderHook(() =>
                useList([
                    { id: 3, name: 'c' },
                    { id: 1, name: 'a' },
                    { id: 2, name: 'b' },
                ]),
            )
            act(() => {
                result.current.sort((a, b) => a.id - b.id)
            })
            expect(result.current.list).toEqual([
                { id: 1, name: 'a' },
                { id: 2, name: 'b' },
                { id: 3, name: 'c' },
            ])
        })

        it('should return a new list instance even if sort order remains same', () => {
            const initialList = ['a', 'b', 'c']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.sort()
            })
            expect(result.current.list).toEqual(initialList)
            expect(result.current.list).not.toBe(originalList)
        })

        it('should do nothing on an empty list', () => {
            const { result } = renderHook(() => useList<string>([]))
            act(() => {
                result.current.sort()
            })
            expect(result.current.list).toEqual([])
        })

        it('should handle equal values during sort', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'a']))
            act(() => {
                result.current.sort()
            })
            expect(result.current.list).toEqual(['a', 'a', 'b'])
        })

        it('should push null and undefined values to the end of the list', () => {
            const { result } = renderHook(() =>
                useList(['b', null, 'a', undefined, 'c'] as unknown as string[]),
            )
            act(() => {
                result.current.sort()
            })
            // null and undefined should be at the end
            expect(result.current.list.slice(0, 3)).toEqual(['a', 'b', 'c'])
            expect(result.current.list).toContain(null)
            expect(result.current.list).toContain(undefined)
            expect(result.current.list.length).toBe(5)
            // Verify specific positions if possible, though null vs undefined order might be implementation dependent
            // current logic: if (valA === undefined || valA === null) return 1; if (valB === undefined || valB === null) return -1;
            expect(result.current.list[3]).toBe(null)
            expect(result.current.list[4]).toBe(undefined)
        })
    })

    describe('shuffle', () => {
        it('should reorder the list items', () => {
            // Use a large enough list to minimize the chance of random "same order"
            const initialList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            const { result } = renderHook(() => useList(initialList))
            act(() => {
                result.current.shuffle()
            })
            expect(result.current.list).toHaveLength(initialList.length)
            expect(result.current.list).not.toEqual(initialList)
            expect(result.current.list.sort((a, b) => a - b)).toEqual(
                initialList,
            )
        })

        it('should return a new list instance', () => {
            const initialList = [1, 2]
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.shuffle()
            })
            expect(result.current.list).not.toBe(originalList)
        })

        it('should handle an empty list', () => {
            const { result } = renderHook(() => useList<number>([]))
            act(() => {
                result.current.shuffle()
            })
            expect(result.current.list).toEqual([])
        })

        it('should handle a single item list', () => {
            const { result } = renderHook(() => useList([1]))
            act(() => {
                result.current.shuffle()
            })
            expect(result.current.list).toEqual([1])
        })
    })

    describe('swap', () => {
        it('should swap two items in the list', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.swap(0, 2)
            })
            expect(result.current.list).toEqual(['c', 'b', 'a'])
        })

        it('should do nothing if indices are identical', () => {
            const initialList = ['a', 'b', 'c']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.swap(1, 1)
            })
            expect(result.current.list).toEqual(initialList)
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing if any index is out of bounds', () => {
            const initialList = ['a', 'b', 'c']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list

            act(() => {
                result.current.swap(-1, 1)
            })
            expect(result.current.list).toBe(originalList)

            act(() => {
                result.current.swap(1, 3)
            })
            expect(result.current.list).toBe(originalList)
        })

        it('should return a new list instance on successful swap', () => {
            const initialList = ['a', 'b']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.swap(0, 1)
            })
            expect(result.current.list).toEqual(['b', 'a'])
            expect(result.current.list).not.toBe(originalList)
        })
    })

    describe('reverse', () => {
        it('should reverse the order of items in the list', () => {
            const { result } = renderHook(() => useList(['a', 'b', 'c']))
            act(() => {
                result.current.reverse()
            })
            expect(result.current.list).toEqual(['c', 'b', 'a'])
        })

        it('should reverse a list of objects', () => {
            const item1 = { id: 1 }
            const item2 = { id: 2 }
            const { result } = renderHook(() => useList([item1, item2]))
            act(() => {
                result.current.reverse()
            })
            expect(result.current.list).toEqual([item2, item1])
        })

        it('should do nothing and keep same reference for empty list', () => {
            const { result } = renderHook(() => useList<number>([]))
            const originalList = result.current.list
            act(() => {
                result.current.reverse()
            })
            expect(result.current.list).toEqual([])
            expect(result.current.list).toBe(originalList)
        })

        it('should do nothing and keep same reference for single item list', () => {
            const { result } = renderHook(() => useList(['a']))
            const originalList = result.current.list
            act(() => {
                result.current.reverse()
            })
            expect(result.current.list).toEqual(['a'])
            expect(result.current.list).toBe(originalList)
        })

        it('should return a new list instance when reversed', () => {
            const initialList = ['a', 'b']
            const { result } = renderHook(() => useList(initialList))
            const originalList = result.current.list
            act(() => {
                result.current.reverse()
            })
            expect(result.current.list).toEqual(['b', 'a'])
            expect(result.current.list).not.toBe(originalList)
        })
    })
})
