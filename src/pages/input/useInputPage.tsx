import { useState } from 'react'
import { Input, type InputProps } from '../../../lib/main'

export const UseInputPage = () => {
    const [value, setValue] = useState<InputProps['value']>('')
    const [valueDebounced, setValueDebounced] = useState<InputProps['value']>('')
    const [transform, setTransform] = useState<InputProps['transform']>('titleCase')

    return (
        <main>
            <article>
                <header>
                    <h1>Input</h1>
                </header>

                {/* Documentation */}
                <section>
                    <h3>Documentation</h3>
                    <article>
                        <p>The <code>Input</code> component provides an accessible input with value transformations and debouncing support.</p>
                        <p><strong>Props:</strong></p>
                        <ul>
                            <li><code>name</code>: string - Input name for form submission</li>
                            <li><code>label</code>: string - Accessible label for the input</li>
                            <li><code>value</code>: string - Input value</li>
                            <li><code>type</code>: string - Input type (text, password, number, etc.)</li>
                            <li><code>onChangeValue</code>: (value: string) =&gt; void - Callback when value changes</li>
                            <li><code>onChangeDebounce</code>: (value: string) =&gt; void - Callback with debounced value</li>
                            <li><code>debounceDelay</code>: number - Debounce delay in milliseconds</li>
                            <li><code>transform</code>: InputProps[&apos;transform&apos;] - Value transformation function</li>
                            <li><code>datalist</code>: string[] - Array of suggestions for autocomplete</li>
                        </ul>
                        <p><strong>Transform Options:</strong></p>
                        <ul>
                            <li><code>toUpperCase</code> - Convert to uppercase</li>
                            <li><code>toLowerCase</code> - Convert to lowercase</li>
                            <li><code>capitalize</code> - Capitalize first letter</li>
                            <li><code>titleCase</code> - Title case each word</li>
                            <li><code>snakeCase</code> - Convert to snake_case</li>
                            <li><code>camelCase</code> - Convert to camelCase</li>
                            <li><code>kebabCase</code> - Convert to kebab-case</li>
                            <li><code>onlyNumbers</code> - Keep only numbers</li>
                            <li><code>onlyLetters</code> - Keep only letters</li>
                            <li><code>onlyEmail</code> - Email format validation</li>
                            <li><code>onlyAlphanumeric</code> - Keep only alphanumeric characters</li>
                        </ul>
                    </article>
                </section>

                {/* Live Example */}
                <section>
                    <h3>Live Example</h3>
                    <article>
                        <Input
                            type="text"
                            placeholder="Enter your name and last name"
                            value={value}
                            label="Name and Last Name"
                            onChangeValue={setValue}
                            onChangeDebounce={setValueDebounced}
                            debounceDelay={1000}
                            transform={transform}
                            datalist={['John Doe', 'Jane Doe', 'John Smith']}
                        />

                        <div>
                            <label htmlFor="transform">
                                Transformation:
                                <select
                                    name="transform"
                                    id="transform"
                                    value={transform}
                                    onChange={(e) =>
                                        setTransform(
                                            e.target.value as InputProps['transform'],
                                        )
                                    }
                                >
                                    <option value="">None</option>
                                    <option value="toUpperCase">Upper Case</option>
                                    <option value="toLowerCase">Lower Case</option>
                                    <option value="capitalize">Capitalize</option>
                                    <option value="titleCase">Title Case</option>
                                    <option value="snakeCase">Snake Case</option>
                                    <option value="camelCase">Camel Case</option>
                                    <option value="kebabCase">Kebab Case</option>
                                    <option value="onlyNumbers">Only Numbers</option>
                                    <option value="onlyLetters">Only Letters</option>
                                    <option value="onlyEmail">Only Email</option>
                                    <option value="onlyAlphanumeric">Only Alphanumeric</option>
                                </select>
                            </label>
                        </div>

                        <details>
                            <summary>Current State</summary>
                            <pre>
                                <code>{JSON.stringify({ value, valueDebounced, transform }, null, 2)}</code>
                            </pre>
                        </details>

                        <p>
                            <strong>Transformed value:</strong> <code>{value || '(empty)'}</code>
                            <br />
                            <strong>Debounced value (1s):</strong> <code>{valueDebounced || '(empty)'}</code>
                        </p>
                    </article>
                </section>
            </article>
        </main>
    )
}
