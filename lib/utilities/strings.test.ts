import { describe, it, expect } from 'vitest'
import { valueTransforms } from './strings.ts'

describe('valueTransforms', () => {
    it('should transform to upper case', () => {
        expect(valueTransforms('hello', 'toUpperCase')).toBe('HELLO')
    })

    it('should transform to lower case', () => {
        expect(valueTransforms('HELLO', 'toLowerCase')).toBe('hello')
    })

    it('should capitalize the string', () => {
        expect(valueTransforms('hello', 'capitalize')).toBe('Hello')
    })

    it('should transform to title case', () => {
        expect(valueTransforms('hello world', 'titleCase')).toBe('Hello World')
    })

    it('should transform to snake case', () => {
        expect(valueTransforms('hello world', 'snakeCase')).toBe('hello_world')
    })

    it('should remove all non-numeric characters', () => {
        expect(valueTransforms('a1b2c3', 'onlyNumbers')).toBe('123')
    })

    it('should remove all non-letter characters', () => {
        expect(valueTransforms('a1b2c3', 'onlyLetters')).toBe('abc')
    })

    it('should remove invalid email characters', () => {
        expect(valueTransforms('test@domain.com!', 'onlyEmail')).toBe(
            'test@domain.com',
        )
    })

    it('should remove all non-alphanumeric characters', () => {
        expect(valueTransforms('a1b2c3!@#', 'onlyAlphanumeric')).toBe('a1b2c3')
    })

    it('should return the original value if no transform is provided', () => {
        expect(valueTransforms('hello')).toBe('hello')
    })

    it('should return the original value if an invalid transform is provided', () => {
        // @ts-expect-error
        expect(valueTransforms('hello', 'invalidTransform')).toBe('hello')
    })
})
