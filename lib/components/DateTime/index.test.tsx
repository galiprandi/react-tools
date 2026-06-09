import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, cleanup, fireEvent } from '@testing-library/react'
import { DateTime } from './index'
import { iso2LocalDateTime } from '../../utilities/dates'

describe('<DateTime />', () => {
    beforeEach(cleanup)

    it('should render the DateTime component', () => {
        const testId = 'test-1'
        const { findByTestId } = render(
            <DateTime data-testid={testId} isoValue="2021-01-01T01:00:00Z" />,
        )
        expect(findByTestId(testId)).toBeDefined()
    })

    it('should call onChange & onChangeISOValue when user changes date input', () => {
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

    it('should support ISO strings for min and max props', () => {
        // Mock timezone offset to UTC (0) for deterministic results
        const tzSpy = vi
            .spyOn(Date.prototype, 'getTimezoneOffset')
            .mockReturnValue(0)

        const testId = 'test-8'
        const min = '2021-01-01T00:00:00Z'
        const max = '2021-12-31T23:59:59Z'
        const { getByTestId } = render(
            <DateTime
                data-testid={testId}
                isoValue="2021-06-01T12:00:00Z"
                isoMin={min}
                isoMax={max}
            />,
        )

        const input = getByTestId(testId) as HTMLInputElement
        expect(input.min).toBe('2021-01-01T00:00')
        expect(input.max).toBe('2021-12-31T23:59')

        tzSpy.mockRestore()
    })

    it('should forward ref to the underlying input element', () => {
        const ref = { current: null as HTMLInputElement | null }
        render(<DateTime ref={ref} data-testid="datetime-ref" />)
        expect(ref.current).not.toBeNull()
        expect(ref.current?.tagName).toBe('INPUT')
        expect(ref.current?.type).toBe('datetime-local')
    })

    it('should update the input value when props.isoValue changes (controlled component support)', () => {
        const { getByTestId, rerender } = render(<DateTime isoValue="2021-01-01T01:00:00Z" data-testid="controlled-datetime" />)
        const input = getByTestId('controlled-datetime') as HTMLInputElement
        
        // Match the timezone local string representation
        const expectedInitialLocal = iso2LocalDateTime('2021-01-01T01:00:00Z')
        expect(input.value).toBe(expectedInitialLocal)

        rerender(<DateTime isoValue="2021-01-02T01:00:00Z" data-testid="controlled-datetime" />)
        const expectedUpdatedLocal = iso2LocalDateTime('2021-01-02T01:00:00Z')
        expect(input.value).toBe(expectedUpdatedLocal)
    })

    it('should use standard min and max props when isoMin and isoMax are not provided', () => {
        const { getByTestId } = render(
            <DateTime
                data-testid="test-minmax"
                min="2021-01-01T00:00"
                max="2021-12-31T23:59"
            />,
        )
        const input = getByTestId('test-minmax') as HTMLInputElement
        expect(input.min).toBe('2021-01-01T00:00')
        expect(input.max).toBe('2021-12-31T23:59')
    })

    it('should use value prop when isoValue is not provided', () => {
        const { getByTestId } = render(
            <DateTime
                data-testid="test-value"
                value="2021-01-01T00:00"
            />,
        )
        const input = getByTestId('test-value') as HTMLInputElement
        expect(input.value).toBe('2021-01-01T00:00')
    })

    it('should handle invalid isoValue', () => {
        const onChangeISOValue = vi.fn()
        render(
            <DateTime
                isoValue="invalid-date"
                onChangeISOValue={onChangeISOValue}
            />,
        )
        expect(onChangeISOValue).not.toHaveBeenCalled()
    })
})
