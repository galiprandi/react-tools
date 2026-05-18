import { describe, it, expect } from 'vitest'
import { isRestrictedKey, RESTRICTED_KEYS } from './security'

describe('isRestrictedKey', () => {
    it('should return true for all restricted keys', () => {
        RESTRICTED_KEYS.forEach((key) => {
            expect(isRestrictedKey(key)).toBe(true)
        })
    })

    it('should return false for non-restricted keys', () => {
        const safeKeys = ['name', 'id', 'value', 'data', 'myCustomProperty']
        safeKeys.forEach((key) => {
            expect(isRestrictedKey(key)).toBe(false)
        })
    })

    it('should handle empty string', () => {
        expect(isRestrictedKey('')).toBe(false)
    })

    it('should be case sensitive', () => {
        // '__proto__' is restricted, but '__PROTO__' should not be (though it's still good practice to avoid)
        // based on the current implementation using includes()
        expect(isRestrictedKey('__PROTO__')).toBe(false)
        expect(isRestrictedKey('CONSTRUCTOR')).toBe(false)
    })
})
