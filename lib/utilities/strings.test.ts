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
        expect(valueTransforms('hello_world', 'titleCase')).toBe('Hello World')
        expect(valueTransforms('hello-world', 'titleCase')).toBe('Hello World')
        expect(valueTransforms('helloWorld', 'titleCase')).toBe('Hello World')
        expect(valueTransforms('  hello   world  ', 'titleCase')).toBe(
            'Hello World',
        )
    })

    it('should transform to snake case', () => {
        expect(valueTransforms('hello world', 'snakeCase')).toBe('hello_world')
        expect(valueTransforms('helloWorld', 'snakeCase')).toBe('hello_world')
        expect(valueTransforms('hello-world', 'snakeCase')).toBe('hello_world')
        expect(valueTransforms('  Hello   World  ', 'snakeCase')).toBe(
            'hello_world',
        )
    })

    it('should transform to camel case', () => {
        expect(valueTransforms('hello world', 'camelCase')).toBe('helloWorld')
        expect(valueTransforms('hello-world', 'camelCase')).toBe('helloWorld')
        expect(valueTransforms('hello_world', 'camelCase')).toBe('helloWorld')
        expect(valueTransforms('  hello world  ', 'camelCase')).toBe(
            'helloWorld',
        )
    })

    it('should transform to pascal case', () => {
        expect(valueTransforms('hello world', 'pascalCase')).toBe('HelloWorld')
        expect(valueTransforms('hello-world', 'pascalCase')).toBe('HelloWorld')
        expect(valueTransforms('hello_world', 'pascalCase')).toBe('HelloWorld')
        expect(valueTransforms('helloWorld', 'pascalCase')).toBe('HelloWorld')
        expect(valueTransforms('  hello world  ', 'pascalCase')).toBe(
            'HelloWorld',
        )
    })

    it('should transform to kebab case', () => {
        expect(valueTransforms('hello world', 'kebabCase')).toBe('hello-world')
        expect(valueTransforms('helloWorld', 'kebabCase')).toBe('hello-world')
        expect(valueTransforms('hello_world', 'kebabCase')).toBe('hello-world')
        expect(valueTransforms('  Hello   World  ', 'kebabCase')).toBe(
            'hello-world',
        )
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

    it('should transform to slug case', () => {
        expect(valueTransforms('Hello World', 'slugify')).toBe('hello-world')
        expect(valueTransforms('Héllo World', 'slugify')).toBe('hello-world')
        expect(valueTransforms('  Hello   World  ', 'slugify')).toBe(
            'hello-world',
        )
        expect(valueTransforms('Hello_World', 'slugify')).toBe('hello-world')
        expect(valueTransforms('Hello-World', 'slugify')).toBe('hello-world')
        expect(valueTransforms('Hello & World!', 'slugify')).toBe('hello-world')
        expect(valueTransforms('123 Hello World 456', 'slugify')).toBe(
            '123-hello-world-456',
        )
    })

    it('should return the original value if no transform is provided', () => {
        expect(valueTransforms('hello')).toBe('hello')
    })

    it('should return the original value if an invalid transform is provided', () => {
        // @ts-expect-error - Testing runtime behavior with invalid input
        expect(valueTransforms('hello', 'invalidTransform')).toBe('hello')
    })

    it('should handle empty strings', () => {
        expect(valueTransforms('', 'toUpperCase')).toBe('')
        expect(valueTransforms('', 'capitalize')).toBe('')
        expect(valueTransforms('', 'titleCase')).toBe('')
    })

    it('should handle strings with multiple spaces', () => {
        expect(valueTransforms('hello   world', 'snakeCase')).toBe(
            'hello_world',
        )
        expect(valueTransforms('  hello  ', 'capitalize')).toBe('Hello')
        expect(valueTransforms('  hello world  ', 'capitalize')).toBe(
            'Hello world',
        )
    })

    it('should handle multiple words in capitalize (only first char of first word)', () => {
        expect(valueTransforms('hello world', 'capitalize')).toBe('Hello world')
    })

    it('should lowercase other characters in capitalize', () => {
        expect(valueTransforms('HELLO', 'capitalize')).toBe('Hello')
        expect(valueTransforms('hELLO', 'capitalize')).toBe('Hello')
    })

    it('should handle all-caps in camelCase and pascalCase', () => {
        expect(valueTransforms('HELLO WORLD', 'camelCase')).toBe('helloWorld')
        expect(valueTransforms('HELLO WORLD', 'pascalCase')).toBe('HelloWorld')
    })

    it('should apply sequential transforms from an array', () => {
        expect(
            valueTransforms('Hello World 123!', [
                'toUpperCase',
                'onlyAlphanumeric',
            ]),
        ).toBe('HELLOWORLD123')

        expect(
            valueTransforms('  Some_Mixed-Value  ', [
                'onlyLetters',
                'toLowerCase',
                'capitalize',
            ]),
        ).toBe('Somemixedvalue')
    })
})
