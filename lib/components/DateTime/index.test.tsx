import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { DateTime } from '../../main.ts'

describe('<DateTime />', () => {
    beforeEach(cleanup)

    it('should render the DateTime component', () => {
        const testId = 'test-1'
        const { findByTestId } = render(
            <DateTime data-testid={testId} isoValue="2021-01-01T01:00:00Z" />,
        )
        expect(findByTestId(testId)).toBeDefined()
    })

    it('should by call onChange & onChangeISOValue', () => {
        const testId = 'test-2'
        const onChange = vi.fn()
        const onChangeISOValue = vi.fn()
        const { getByTestId } = render(
            <DateTime
                data-testid={testId}
                onChange={onChange}
                isoValue="2021-01-01T01:00:00Z"
                onChangeISOValue={onChangeISOValue}
            />,
        )
        fireEvent.change(getByTestId(testId), {
            target: { value: '2021-01-02T01:00:00Z' },
        })
        expect(onChange).toHaveBeenCalled()
        expect(onChangeISOValue).toHaveBeenCalled()
        expect(onChangeISOValue).toHaveBeenCalledWith(
            '2021-01-01T01:00:00.000Z',
        )
    })
})
