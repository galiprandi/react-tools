import { describe, it, expect } from 'vitest'
import { iso2LocalDateTime } from './dates.ts'

describe('iso2LocalDateTime', () => {
    const invalidDates = [undefined, null, 12345, 'invalid date string']

    invalidDates.forEach((invalidDate) => {
        it(`should return '${invalidDate}' for invalid input: ${invalidDate}`, () => {
            expect(iso2LocalDateTime(invalidDate as any)).toBe(invalidDate)
        })
    })

    //
    it('should convert ISO date-time string to local date-time string', () => {
        const isoString = '2024-05-14T13:00:00.000Z'
        const expectedLocalString = '2024-05-14T10:00'
        expect(iso2LocalDateTime(isoString)).toBe(expectedLocalString)
    })

    it('should handle empty string', () => {
        expect(iso2LocalDateTime('')).toBe('')
    })

    it('should handle different time zones correctly', () => {
        const isoString = '2024-12-31T23:59:59.000Z'
        const localString = new Date('2024-12-31T20:59:59.000Z')
            .toISOString()
            .slice(0, 16)
        expect(iso2LocalDateTime(isoString)).toBe(localString)
    })
})
