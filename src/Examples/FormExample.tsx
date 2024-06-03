import { useState } from 'react'
import { Form } from '../../lib/main.ts'
import { Input } from '../../lib/main.ts'

export const FormExample = () => {
    const [values, setValues] = useState<MyFormValues>()

    return (
        <section>
            <hr />
            <h2>Form</h2>
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
            <p>
                <br />
                onChangeISOValue: <code>{JSON.stringify(values)}</code>
            </p>
        </section>
    )
}

type MyFormValues = {
    username: string
    password: string
}
