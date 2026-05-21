import { DateTimeProps } from '../main'

/**
 * Converts an ISO date-time string to a local date-time string.
 *
 * @param date - The ISO date-time string
 * @returns The local date-time string or undefined if input is invalid
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
    if (d instanceof Date && isNaN(d.getTime())) return date
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    if (!isNaN(local.getTime())) {
        return local.toISOString().slice(0, 16)
    }
    return date
}
