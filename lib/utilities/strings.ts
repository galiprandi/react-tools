/**
 * Available transformation types for strings.
 */
export type TransformType =
    | 'toUpperCase'
    | 'toLowerCase'
    | 'capitalize'
    | 'titleCase'
    | 'snakeCase'
    | 'camelCase'
    | 'pascalCase'
    | 'kebabCase'
    | 'onlyNumbers'
    | 'onlyLetters'
    | 'onlyEmail'
    | 'onlyAlphanumeric'
    | 'slugify'

/**
 * Transforms a string based on the specified transformation type.
 *
 * @param value - The string to transform.
 * @param transform - The type of transformation to apply. Can be a single transform or an array of transforms to apply sequentially.
 * @returns The transformed string.
 *
 * @example
 * ```ts
 * const upper = valueTransforms('hello', 'toUpperCase');
 * console.log(upper); // "HELLO"
 *
 * const capitalized = valueTransforms('  hello world  ', 'capitalize');
 * console.log(capitalized); // "Hello world"
 *
 * const title = valueTransforms('hello_world-exampleHelloWorld', 'titleCase');
 * console.log(title); // "Hello World Example Hello World"
 *
 * const pascal = valueTransforms('hello world', 'pascalCase');
 * console.log(pascal); // "HelloWorld"
 *
 * const multiple = valueTransforms('Hello World 123', ['toUpperCase', 'onlyAlphanumeric']);
 * console.log(multiple); // "HELLOWORLD123"
 * ```
 */
export const valueTransforms = (
    value: string,
    transform?: TransformType | TransformType[],
): string => {
    const applyTransform = (val: string, t: string): string => {
        switch (t) {
            case 'toUpperCase':
                return val.toUpperCase()
            case 'toLowerCase':
                return val.toLowerCase()
            case 'capitalize': {
                const trimmed = val.trim()
                return (
                    trimmed.charAt(0).toUpperCase() +
                    trimmed.slice(1).toLowerCase()
                )
            }
            case 'titleCase':
                return val
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/[_-]/g, ' ')
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, ' ')
                    .replace(/\b\w/g, (ch) => ch.toUpperCase())
            case 'snakeCase':
                return val
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/[_-]/g, ' ')
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '_')
            case 'camelCase':
                return val
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/[_-]/g, ' ')
                    .toLowerCase()
                    .trim()
                    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
                        index === 0 ? word.toLowerCase() : word.toUpperCase(),
                    )
                    .replace(/\s+/g, '')
            case 'pascalCase':
                return val
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/[_-]/g, ' ')
                    .toLowerCase()
                    .trim()
                    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) =>
                        word.toUpperCase(),
                    )
                    .replace(/\s+/g, '')
            case 'kebabCase':
                return val
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/[_-]/g, ' ')
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
            case 'onlyNumbers':
                return val.replace(/\D/g, '')
            case 'onlyLetters':
                return val.replace(/[^a-zA-Z]/g, '')
            case 'onlyEmail':
                return val.replace(/[^a-zA-Z0-9@._-]/g, '')
            case 'onlyAlphanumeric':
                return val.replace(/[^a-zA-Z0-9]/g, '')
            case 'slugify':
                return val
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s_-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
            default:
                return val
        }
    }

    if (Array.isArray(transform)) {
        return transform.reduce((acc, t) => applyTransform(acc, t), value)
    }

    return transform ? applyTransform(value, transform) : value
}
