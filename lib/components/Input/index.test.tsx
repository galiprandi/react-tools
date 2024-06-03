import { describe, it, expect, afterEach, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'

import { Input } from '../../main.ts'

describe('<Input />', () => {
    afterEach(cleanup)

    it('should be render a input', () => {
        const testId = 'test-1'
        const { getByTestId } = render(
            <Input id={testId} type="text" name="name" data-testid={testId} />,
        )

        expect(getByTestId(testId)).toBeDefined()
    })

    it('should be render a label', () => {
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

    it('should be render a datalist with options', () => {
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

    it('should be call onChange, onChangeValue & onChangeDebounce', () => {
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

    it('should be transform value to uppercase', () => {
        const testId = 'test-5'
        const onChangeValue = vi.fn()
        const transform = 'toUpperCase'

        const { getByTestId } = render(
            <Input
                id={testId}
                type="text"
                name="name"
                defaultValue={'test value'}
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

    it('should be called transformFn', () => {
        const testId = 'test-5'
        const onChangeValue = vi.fn()
        const transform = 'toUpperCase'

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
})
