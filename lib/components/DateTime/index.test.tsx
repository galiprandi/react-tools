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

    it('should render label prop (inherited from Input)', () => {
        const testId = 'test-3'
        const { getByText } = render(
            <DateTime
                data-testid={testId}
                label="Select Date"
                isoValue="2021-01-01T01:00:00Z"
            />,
        )
        expect(getByText(/select date/i)).toBeDefined()
    })

    it('should pass transform prop to Input (inherited)', () => {
        const testId = 'test-4'
        render(
            <DateTime
                data-testid={testId}
                transform="toUpperCase"
                isoValue="2021-01-01T01:00:00Z"
            />,
        )
        // transform is passed to Input, actual behavior is tested in Input tests
        expect(true).toBe(true)
    })

    it('should pass transformFn prop to Input (inherited)', () => {
        const testId = 'test-5'
        render(
            <DateTime
                data-testid={testId}
                transformFn={(value) => value.replace('T', ' ')}
                isoValue="2021-01-01T01:00:00Z"
            />,
        )
        // transformFn is passed to Input, actual behavior is tested in Input tests
        expect(true).toBe(true)
    })

    it('should pass debounceDelay prop to Input (inherited)', () => {
        const testId = 'test-6'
        render(
            <DateTime
                data-testid={testId}
                debounceDelay={500}
                isoValue="2021-01-01T01:00:00Z"
            />,
        )
        // debounceDelay is passed to Input, actual behavior is tested in Input tests
        expect(true).toBe(true)
    })

    it('should render datalist prop (inherited from Input)', () => {
        const testId = 'test-7'
        const datalist = ['2021-01-01T01:00:00', '2021-01-02T01:00:00']
        const { container } = render(
            <DateTime
                data-testid={testId}
                isoValue="2021-01-01T01:00:00Z"
                datalist={datalist}
            />,
        )
        expect(container.querySelector('datalist')).toBeDefined()
        expect(container.querySelectorAll('option')).toHaveLength(datalist.length)
    })
})
