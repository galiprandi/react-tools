import { render, fireEvent, screen } from '@testing-library/react'
import { describe, it, vi, expect } from 'vitest'

import { Form } from '../../main.ts'

interface TestFormValues {
    name: string
    email: string
}

describe('Form Component', () => {
    it('should render the form and its children', () => {
        const testId = 'test-1'
        const { findByTestId, findByText } = render(
            <Form<TestFormValues> onSubmitValues={vi.fn()} data-testid={testId}>
                <label>
                    Name:
                    <input type="text" name="name" />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" />
                </label>
                <button type="submit">Submit</button>
            </Form>,
        )

        expect(findByTestId(testId)).toBeDefined()
        expect(findByText(/name/i)).toBeDefined()
        expect(findByText(/email/i)).toBeDefined()
    })

    it('should call onSubmitValues with form values on submit', () => {
        const onSubmit = vi.fn()
        const testId = 'test-2'
        render(
            <Form<TestFormValues>
                onSubmitValues={onSubmit}
                data-testid={testId}
            >
                <label>
                    Name:
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue="John Doe"
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue="john.doe@mail.com"
                    />
                </label>
                <button type="submit">Submit</button>
            </Form>,
        )

        fireEvent.submit(screen.getByTestId(testId) as HTMLFormElement)
        expect(onSubmit).toHaveBeenCalledTimes(1)
        expect(onSubmit).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john.doe@mail.com',
        })
    })

    it('should call onSubmit with form values on submit', () => {
        const onSubmit = vi.fn()
        const testId = 'test-3'
        render(
            <Form<TestFormValues> onSubmit={onSubmit} data-testid={testId}>
                <label>
                    Name:
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue="John Doe"
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        id="email"
                        name="email"
                        defaultValue="john.doe@mail.com"
                    />
                </label>
                <button type="submit">Submit</button>
            </Form>,
        )

        fireEvent.submit(screen.getByTestId(testId) as HTMLFormElement)
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('should filter out empty values if filterEmptyValues is true', () => {
        const onSubmit = vi.fn()
        const testId = 'test-4'
        render(
            <Form<TestFormValues>
                onSubmitValues={onSubmit}
                filterEmptyValues={true}
                data-testid={testId}
            >
                <label>
                    Name:
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue="John Does"
                    />
                </label>
                <label>
                    Email:
                    <input type="email" id="email" name="email" />
                </label>
                <button type="submit">Submit</button>
            </Form>,
        )

        fireEvent.submit(screen.getByTestId(testId) as HTMLFormElement)
        expect(onSubmit).toHaveBeenCalledTimes(1)
        expect(onSubmit).toHaveBeenCalledWith({ name: 'John Does' })
    })

    it('should include empty values by default (filterEmptyValues is false)', () => {
        const onSubmit = vi.fn()
        const testId = 'test-default-empty'
        render(
            <Form<TestFormValues>
                onSubmitValues={onSubmit}
                data-testid={testId}
            >
                <label>
                    Name:
                    <input type="text" name="name" defaultValue="John Doe" />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" defaultValue="" />
                </label>
                <button type="submit">Submit</button>
            </Form>,
        )

        fireEvent.submit(screen.getByTestId(testId) as HTMLFormElement)
        expect(onSubmit).toHaveBeenCalledWith({
            name: 'John Doe',
            email: '',
        })
    })

    it('should filter out restricted keys to prevent prototype pollution and injection', () => {
        const onSubmit = vi.fn()
        const testId = 'test-security'

        // Mock FormData to return restricted keys
        const mockEntries = [
            ['name', 'John'],
            ['__proto__', 'malicious'],
            ['constructor', 'malicious'],
            ['toString', 'malicious'],
            ['valueOf', 'malicious'],
        ]

        // We render a normal form without restricted keys to avoid happy-dom crashes
        render(
            <Form onSubmitValues={onSubmit} data-testid={testId}>
                <input name="name" defaultValue="John" />
                <button type="submit">Submit</button>
            </Form>,
        )

        // Spy on FormData to return our mock entries including restricted ones
        const formDataSpy = vi.spyOn(window, 'FormData').mockImplementation(
            () =>
                ({
                    entries: () => mockEntries[Symbol.iterator](),
                }) as unknown as FormData,
        )

        fireEvent.submit(screen.getByTestId(testId) as HTMLFormElement)

        expect(onSubmit).toHaveBeenCalledTimes(1)
        const submittedValues = onSubmit.mock.calls[0][0]

        // Check that restricted keys are not present
        expect(submittedValues.name).toBe('John')
        expect(submittedValues.__proto__).not.toBe('malicious')
        expect(submittedValues.constructor).not.toBe('malicious')
        expect(submittedValues.toString).toBeUndefined()
        expect(submittedValues.valueOf).toBeUndefined()

        // Verify it's a null-prototype object
        expect(Object.getPrototypeOf(submittedValues)).toBeNull()

        formDataSpy.mockRestore()
    })

    it('should forward ref to the form element', () => {
        const ref = { current: null as HTMLFormElement | null }
        render(
            <Form onSubmitValues={vi.fn()} ref={ref} data-testid="form-ref" />,
        )
        expect(ref.current).not.toBeNull()
        expect(ref.current?.tagName).toBe('FORM')
    })
})
