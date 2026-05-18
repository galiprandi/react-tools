/**
 * A list of keys that are restricted to prevent prototype pollution and other security risks
 * when dynamically accessing or setting object properties from untrusted input.
 *
 * This includes properties from Object.prototype that could be used to manipulate
 * the global prototype or bypass security checks.
 */
export const RESTRICTED_KEYS: string[] = [
    '__proto__',
    'constructor',
    'prototype',
    'toString',
    'valueOf',
    'toLocaleString',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    '__defineGetter__',
    '__defineSetter__',
    '__lookupGetter__',
    '__lookupSetter__',
]

/**
 * Checks if a given key is restricted to prevent prototype pollution.
 *
 * @param key - The key to check.
 * @returns True if the key is restricted, false otherwise.
 *
 * @example
 * ```ts
 * const restricted = isRestrictedKey('__proto__');
 * console.log(restricted); // true
 *
 * const safe = isRestrictedKey('name');
 * console.log(safe); // false
 * ```
 */
export const isRestrictedKey = (key: string): boolean => {
    return RESTRICTED_KEYS.includes(key)
}
