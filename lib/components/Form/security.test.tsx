
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Form } from './index'

describe('Form Security', () => {
    it('should ignore dangerous keys to prevent prototype pollution', () => {
        const onSubmitValues = vi.fn()

        // We use a different way to trigger the submission with dangerous data
        // since happy-dom crashes if we put them in 'name' attribute of an input

        const { container } = render(
            <Form onSubmitValues={onSubmitValues}>
                <input name="normal" defaultValue="value" />
                <button type="submit">Submit</button>
            </Form>
        )

        const form = container.querySelector('form')

        // Mock FormData to return dangerous keys
        const originalFormData = window.FormData;
        window.FormData = vi.fn().mockImplementation(() => ({
            entries: () =>
                [
                    ['normal', 'value'],
                    ['__proto__', 'polluted'],
                    ['constructor', 'polluted'],
                    ['prototype', 'polluted'],
                ][Symbol.iterator](),
        })) as unknown as typeof FormData

        fireEvent.submit(form!);

        expect(onSubmitValues).toHaveBeenCalled()
        const values = onSubmitValues.mock.calls[0][0]

        expect(values.normal).toBe('value')

        // Ensure __proto__ was not actually set on the object
        expect(Object.prototype.hasOwnProperty.call(values, '__proto__')).toBe(false)
        expect(Object.prototype.hasOwnProperty.call(values, 'constructor')).toBe(false)
        expect(Object.prototype.hasOwnProperty.call(values, 'prototype')).toBe(false)

        // Restore original FormData
        window.FormData = originalFormData;
    })
})
