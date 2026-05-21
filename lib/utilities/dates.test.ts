import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { iso2LocalDateTime } from './dates.ts'

describe('iso2LocalDateTime', () => {
    beforeEach(() => {
        // Mock timezone offset to UTC-3 (180 minutes)
        vi.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(180)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    const invalidDates = [undefined, null, 12345, 'invalid date string']

    invalidDates.forEach((invalidDate) => {
        it(`should return '${invalidDate}' for invalid input: ${invalidDate}`, () => {
            // @ts-expect-error - Testing runtime behavior with invalid input types
            expect(iso2LocalDateTime(invalidDate)).toBe(invalidDate)
        })
    })

    //
    it('should convert ISO date-time string to local date-time string', () => {
        const isoString = '2024-05-14T13:00:00.000Z'
        const expectedLocalString = '2024-05-14T10:00'
        expect(iso2LocalDateTime(isoString)).toBe(expectedLocalString)
    })

    it('should handle different time zones correctly', () => {
        const isoString = '1979-07-04T00:00:00.000Z'
        const expectedLocalString = '1979-07-03T21:00'
        expect(iso2LocalDateTime(isoString)).toBe(expectedLocalString)
    })

    it('should handle empty string', () => {
        expect(iso2LocalDateTime('')).toBe('')
    })

    it('should handle end of year correctly', () => {
        const isoString = '2024-12-31T23:59:59.000Z'
        const expectedLocalString = '2024-12-31T20:59'
        expect(iso2LocalDateTime(isoString)).toBe(expectedLocalString)
    })
})
