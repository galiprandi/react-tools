
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { DateTime } from './index'

describe('DateTime Security', () => {
    it('should not crash if invalid date is provided via props', () => {
        const onChangeISOValue = vi.fn()
        render(
            <DateTime isoValue="invalid-date" onChangeISOValue={onChangeISOValue} />
        )

        expect(onChangeISOValue).not.toHaveBeenCalled()
    })

    it('should not crash if invalid date is provided via user input', () => {
        const onChangeISOValue = vi.fn()
        const { container } = render(
            <DateTime isoValue="2024-05-14T13:00:00.000Z" onChangeISOValue={onChangeISOValue} />
        )

        // Clear the initial call from mount
        onChangeISOValue.mockClear()

        const input = container.querySelector('input')
        fireEvent.change(input!, { target: { value: 'not-a-date' } })

        // Should NOT call onChangeISOValue with an invalid date
        expect(onChangeISOValue).not.toHaveBeenCalled()
    })

    it('should still work for valid dates', () => {
        const onChangeISOValue = vi.fn()
        const { container } = render(
            <DateTime isoValue="2024-05-14T13:00:00.000Z" onChangeISOValue={onChangeISOValue} />
        )

        onChangeISOValue.mockClear()

        const input = container.querySelector('input')
        // datetime-local input expects YYYY-MM-DDTHH:mm
        fireEvent.change(input!, { target: { value: '2024-05-15T14:00' } })

        expect(onChangeISOValue).toHaveBeenCalled()
        const lastCall = onChangeISOValue.mock.calls[0][0]
        expect(new Date(lastCall).toISOString()).toBeDefined()
    })
})
