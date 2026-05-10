import { useState } from 'react'
import { Form } from '../../../lib/main'
import { Input } from '../../../lib/main'

export const UseFormPage = () => {
    const [values, setValues] = useState<MyFormValues>()

    return (
        <main>
            <article>
                <header>
                    <h1>Form</h1>
                    <p>Accessible form component with automatic value extraction</p>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>Form</code> component provides an accessible form with automatic value extraction and filtering.</p>
                        <p><strong>Props:</strong></p>
                        <ul>
                            <li><code>onSubmitValues</code>: (values: T) =&gt; void - Callback with form values</li>
                            <li><code>filterEmptyValues</code>: boolean - Filter out empty values</li>
                            <li><code>children</code>: ReactNode - Form fields</li>
                        </ul>
                        <p><strong>Features:</strong></p>
                        <ul>
                            <li>Automatic form value extraction</li>
                            <li>Empty value filtering</li>
                            <li>Type-safe form handling</li>
                            <li>Accessibility support</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <Form<MyFormValues>
                            onSubmitValues={setValues}
                            filterEmptyValues={true}
                        >
                            <fieldset>
                                <legend>Form Example</legend>
                                <Input
                                    name="username"
                                    label="username"
                                    placeholder="Username"
                                />
                                <br />
                                <Input
                                    name="password"
                                    label="password"
                                    placeholder="Password"
                                    type="password"
                                />
                                <br />
                                <Input
                                    name="age"
                                    label="age"
                                    placeholder="Age"
                                    type="number"
                                />
                                <br />
                                <button type="submit">Login</button>
                            </fieldset>
                        </Form>
                        <details>
                            <summary>Form Values</summary>
                            <pre>
                                <code>{JSON.stringify(values, null, 2)}</code>
                            </pre>
                        </details>
                    </article>
                </section>
            </article>
        </main>
    )
}

type MyFormValues = {
    username: string
    password: string
}
