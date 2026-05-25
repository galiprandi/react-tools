import { describe, it, expect, vi } from 'vitest'
import { iso2LocalDateTime } from './dates'

describe('iso2LocalDateTime security', () => {
    it('should handle dates that would cause RangeError in toISOString after offset', () => {
        // Date.prototype.toISOString throws RangeError for dates outside the range -271821-04-20 to 275760-09-13
        // But for dates near year 0 or 9999, it might still throw depending on the environment if it's not handled.
        // Actually, JS Date supports much wider range than 0000-9999.
        // toISOString() can produce expanded years like "+010000-01-01T00:00:00.000Z".

        // Let's test with actual values that might cause trouble.
        // A very large date
        const maxDate = new Date(8.64e15); // Maximum allowed date in JS
        expect(() => iso2LocalDateTime(maxDate.toISOString())).not.toThrow();

        const minDate = new Date(-8.64e15); // Minimum allowed date in JS
        expect(() => iso2LocalDateTime(minDate.toISOString())).not.toThrow();
    });

    it('should return original date if toISOString throws', () => {
        const input = '2024-05-14T13:00:00.000Z';

        // Force toISOString to throw on any Date instance
        const originalToISOString = Date.prototype.toISOString;
        Date.prototype.toISOString = vi.fn().mockImplementation(() => {
            throw new RangeError('Invalid time value');
        });

        try {
            expect(iso2LocalDateTime(input)).toBe(input);
        } finally {
            Date.prototype.toISOString = originalToISOString;
        }
    });
});
