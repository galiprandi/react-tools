import { describe, it, expect, afterEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'

import { Input } from '../../main.ts'

describe('<Input />', () => {
    afterEach(cleanup)

    it('should render an input element', () => {
        const testId = 'test-1'
        const { getByTestId } = render(
            <Input id={testId} type="text" name="name" data-testid={testId} />,
        )

        expect(getByTestId(testId)).toBeDefined()
    })

    it('should render a label when provided', () => {
        const testId = 'test-2'
        const { getByTestId, getByText } = render(
            <Input
                id={testId}
                type="text"
                name="name"
                label="Enter your name:"
                data-testid={testId}
            />,
        )

        expect(getByTestId(testId)).toBeDefined()
        expect(getByText(/enter your name/i)).toBeDefined()
    })

    it('should render a datalist with options when provided', () => {
        const testId = 'test-3'
        const datalist = ['John Doe', 'Jane Doe', 'John Smith']
        const { getByTestId, container } = render(
            <Input
                type="text"
                name="name"
                label="Enter your name:"
                data-testid={testId}
                datalist={datalist}
            />,
        )

        expect(getByTestId(testId)).toBeDefined()
        expect(container.querySelector('datalist')).toBeDefined()
        expect(container.querySelectorAll('option')).toHaveLength(
            datalist.length,
        )
        expect(container).toMatchSnapshot()
    })

    it('should call onChange, onChangeValue & onChangeDebounce when input value changes', () => {
        const testId = 'test-4'
        const onChange = vi.fn()
        const onChangeValue = vi.fn()
        const onChangeDebounce = vi.fn()

        const { getByTestId } = render(
            <Input
                id={testId}
                type="text"
                name="name"
                label="Enter your name:"
                data-testid={testId}
                onChange={onChange}
                onChangeValue={onChangeValue}
                onChangeDebounce={onChangeDebounce}
            />,
        )

        // Type 'test value' in input
        const input = getByTestId(testId)
        fireEvent.change(input, { target: { value: 'test value' } })

        expect(onChange).toHaveBeenCalled()
        expect(onChangeValue).toHaveBeenCalledWith('test value')
        expect(onChangeDebounce).toHaveBeenCalledWith('test value')
    })

    it('should transform value to uppercase when transform prop is provided', () => {
        const testId = 'test-5'
        const onChangeValue = vi.fn()

        const { getByTestId } = render(
            <Input
                id={testId}
                type="text"
                name="name"
                data-testid={testId}
                transform="toUpperCase"
                onChangeValue={onChangeValue}
            />,
        )

        // Type 'test value' in input
        const input = getByTestId(testId)
        fireEvent.change(input, { target: { value: 'test value' } })

        expect(onChangeValue).toHaveBeenCalledWith('TEST VALUE')
    })

    it('should call transformFn when provided', () => {
        const testId = 'test-5'
        const onChangeValue = vi.fn()

        const { getByTestId } = render(
            <Input
                id={testId}
                type="text"
                name="name"
                data-testid={testId}
                transformFn={(value) => `${value}.transformed`}
                onChangeValue={onChangeValue}
            />,
        )

        // Type 'test value' in input
        const input = getByTestId(testId)
        fireEvent.change(input, { target: { value: 'value' } })

        expect(onChangeValue).toHaveBeenCalledWith('value.transformed')
    })

    it('should apply multiple transforms from array', () => {
        const testId = 'test-6'
        const onChangeValue = vi.fn()

        const { getByTestId } = render(
            <Input
                id={testId}
                type="text"
                name="name"
                data-testid={testId}
                transform={['toUpperCase', 'onlyAlphanumeric']}
                onChangeValue={onChangeValue}
            />,
        )

        // Type 'test value 123!' in input
        const input = getByTestId(testId)
        fireEvent.change(input, { target: { value: 'test value 123!' } })

        expect(onChangeValue).toHaveBeenCalledWith('TESTVALUE123')
    })

    it('should apply multiple transforms in sequence', () => {
        const testId = 'test-7'
        const onChangeValue = vi.fn()

        const { getByTestId } = render(
            <Input
                id={testId}
                type="text"
                name="name"
                data-testid={testId}
                transform={['onlyLetters', 'toUpperCase']}
                onChangeValue={onChangeValue}
            />,
        )

        // Type 'test123' in input
        const input = getByTestId(testId)
        fireEvent.change(input, { target: { value: 'test123' } })

        expect(onChangeValue).toHaveBeenCalledWith('TEST')
    })

    it('should work with empty array', () => {
        const testId = 'test-8'
        const onChangeValue = vi.fn()

        const { getByTestId } = render(
            <Input
                id={testId}
                type="text"
                name="name"
                data-testid={testId}
                transform={[]}
                onChangeValue={onChangeValue}
            />,
        )

        // Type 'test value' in input
        const input = getByTestId(testId)
        fireEvent.change(input, { target: { value: 'test value' } })

        expect(onChangeValue).toHaveBeenCalledWith('test value')
    })

    it('should forward ref to the input element', () => {
        const ref = { current: null as HTMLInputElement | null }
        render(<Input ref={ref} data-testid="input-ref" />)
        expect(ref.current).not.toBeNull()
        expect(ref.current?.tagName).toBe('INPUT')
    })

    it('should update the input value when props.value changes (controlled component support)', () => {
        const { getByTestId, rerender } = render(<Input value="initial" data-testid="controlled-input" />)
        const input = getByTestId('controlled-input') as HTMLInputElement
        expect(input.value).toBe('initial')

        rerender(<Input value="updated" data-testid="controlled-input" />)
        expect(input.value).toBe('updated')
    })

    it('should handle input change without optional callbacks', () => {
        const testId = 'test-no-callbacks'
        const { getByTestId } = render(
            <Input id={testId} data-testid={testId} />,
        )

        const input = getByTestId(testId)
        fireEvent.change(input, { target: { value: 'no callback' } })

        expect((input as HTMLInputElement).value).toBe('no callback')
    })
})
