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

    it('should include empty values if filterEmptyValues is false', () => {
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
})
