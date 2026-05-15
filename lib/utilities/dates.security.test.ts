import { describe, it, expect, vi, afterEach } from 'vitest'
import { iso2LocalDateTime } from './dates.ts'

describe('iso2LocalDateTime security reproduction', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should NOT crash with RangeError when offset pushes date out of range', () => {
        // Mock positive offset (e.g., UTC-3 is 180 minutes)
        vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(180)

        // Minimum valid ISO date
        const minDate = new Date(-8640000000000000).toISOString()

        // This should NO LONGER throw
        expect(() => iso2LocalDateTime(minDate)).not.toThrow()
        expect(iso2LocalDateTime(minDate)).toBe(minDate)
    })
})
