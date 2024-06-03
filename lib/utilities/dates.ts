import { DateTimeProps } from '../main'

/**
 * Converts an ISO date-time string to a local date-time string.
 *
 * @param {string} [date] - The ISO date-time string.
 * @returns {string | undefined} - The local date-time string or undefined if the input is invalid.
 *
 * Example:
 *
 * ```js
 * // Input:  2024-05-14T13:00:00.000Z
 * // Output: 2024-05-14T10:00
 * const localDateTime = iso2LocalDateTime('2024-05-14T13:00:00.000Z');
 * console.log(localDateTime); // "2024-05-14T10:00"
 * ```
 */
export const iso2LocalDateTime = (
    date?: DateTimeProps['isoValue'],
): string | undefined => {
    if (!date || typeof date !== 'string') return date
    const d = new Date(date)
    if (d instanceof Date && isNaN(d as any)) return date
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
}
