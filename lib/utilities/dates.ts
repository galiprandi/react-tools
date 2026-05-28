import { DateTimeProps } from '../main'

/**
 * Converts an ISO date-time string to a local date-time string in 'YYYY-MM-DDTHH:mm' format.
 *
 * This function handles timezone adjustments and includes safeguards against invalid dates
 * or range errors. If the input is not a string, is an invalid date, or if the adjusted
 * date falls outside the valid ISO range, the original input is returned.
 *
 * @param date - The ISO date-time string (e.g., from an API or Date.toISOString())
 * @returns The local date-time string or the original input if conversion is not possible
 *
 * @example
 * ```ts
 * const local = iso2LocalDateTime('2024-05-14T13:00:00.000Z');
 * console.log(local); // "2024-05-14T10:00"
 * ```
 */
export const iso2LocalDateTime = (
    date?: DateTimeProps['isoValue'],
): string | undefined => {
    if (!date || typeof date !== 'string') return date
    const d = new Date(date)

    // Security: check if date is valid before processing
    if (isNaN(d.getTime())) return date

    try {
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        // Check if adjusted date is still valid
        if (!isNaN(local.getTime())) {
            return local.toISOString().slice(0, 16)
        }
    } catch {
        // Fallback if toISOString fails due to range errors
        return date
    }

    return date
}
