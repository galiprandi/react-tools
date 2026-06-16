import { forwardRef, ForwardedRef } from 'react'
import { isRestrictedKey } from '../../utilities/security'

const FormInner = <T,>(
    props: FormProps<T>,
    ref: ForwardedRef<HTMLFormElement>,
): JSX.Element => {
    const {
        onSubmitValues,
        filterEmptyValues,
        onSubmit: onSubmitProp,
        ...restProps
    } = props

    /**
     * Handles the form submission event.
     *
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     */
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (onSubmitValues) {
            const formData = new FormData(event.currentTarget)
            const entries = formData.entries()
            const values = Object.create(null) as T

            for (const [key, value] of entries) {
                // Security check: prevent prototype pollution and object property injection
                if (isRestrictedKey(key)) {
                    continue
                }

                if (filterEmptyValues && !value) continue
                ;(values as Record<string, unknown>)[key] = value
            }

            onSubmitValues(values)
        }
        onSubmitProp && onSubmitProp(event)
    }
    return <form ref={ref} {...restProps} onSubmit={onSubmit} />
}

/**
 * A wrapper for the form element that provides additional functionality to handle form submissions.
 * It also provides a callback function that is triggered when form values are submitted.
 *
 * @template T
 * @param {FormProps<T>} props - The properties for the form component.
 * @returns {JSX.Element} The rendered form element.
 *
 * Example usage:
 *
 * ```tsx
 * interface MyFormValues {
 *     name: string;
 *     email: string;
 * }
 *
 * const handleFormSubmit = (values: MyFormValues) => {
 *     console.log(values);
 * };
 *
 * <Form<MyFormValues> onSubmitValues={handleFormSubmit}>
 *     <label>
 *         Name:
 *         <input type="text" name="name" />
 *     </label>
 *     <label>
 *         Email:
 *         <input type="email" name="email" />
 *     </label>
 *     <button type="submit">Submit</button>
 * </Form>
 * ```
 */
export const Form = forwardRef(FormInner) as <T>(
    props: FormProps<T> & React.RefAttributes<HTMLFormElement>,
) => JSX.Element

Form.displayName = 'Form'

/**
 * The properties for the Form component.
 *
 * @template T
 * @extends {React.FormHTMLAttributes<HTMLFormElement>}
 */
export interface FormProps<T>
    extends React.FormHTMLAttributes<HTMLFormElement> {
    /**
     * Callback function that is triggered when form values are submitted and receives an object with the values of the form as a parameter.
     *
     * @param {T} values - The values submitted from the form.
     *
     * Example usage:
     *
     * ```tsx
     * const handleFormSubmit = (values: { name: string; email: string }) => {
     *     console.log(values);
     * };
     *
     * <Form onSubmitValues={handleFormSubmit} />
     * ```
     */
    onSubmitValues?: (values: T) => void
    /**
     * A flag to determine if empty values should be included in the form values.
     */
    filterEmptyValues?: boolean
}
