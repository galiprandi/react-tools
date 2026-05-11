/**
 * Transforms a string based on the specified transformation type.
 *
 * @param value - The string to transform.
 * @param transform - The type of transformation to apply.
 * @returns The transformed string.
 *
 * @example
 * ```ts
 * const upper = valueTransforms('hello', 'toUpperCase');
 * console.log(upper); // "HELLO"
 *
 * const capitalized = valueTransforms('hello world', 'capitalize');
 * console.log(capitalized); // "Hello world"
 *
 * const title = valueTransforms('hello world', 'titleCase');
 * console.log(title); // "Hello World"
 * ```
 */
export const valueTransforms = (
    value: string,
    transform?:
        | 'toUpperCase'
        | 'toLowerCase'
        | 'capitalize'
        | 'titleCase'
        | 'snakeCase'
        | 'onlyNumbers'
        | 'onlyLetters'
        | 'onlyEmail'
        | 'onlyAlphanumeric',
): string => {
    switch (transform) {
        case 'toUpperCase':
            return value.toUpperCase()
        case 'toLowerCase':
            return value.toLowerCase()
        case 'capitalize':
            return value.toLowerCase().charAt(0).toUpperCase() + value.slice(1)
        case 'titleCase':
            return value
                .toLowerCase()
                .replace(/\b\w/g, (ch) => ch.toUpperCase())
        case 'snakeCase':
            return value.toLowerCase().replace(/\s/g, '_')
        case 'onlyNumbers':
            return value.replace(/\D/g, '')
        case 'onlyLetters':
            return value.replace(/[^a-zA-Z]/g, '')
        case 'onlyEmail':
            return value.replace(/[^a-zA-Z0-9@._-]/g, '')
        case 'onlyAlphanumeric':
            return value.replace(/[^a-zA-Z0-9]/g, '')
        default:
            return value
    }
}
