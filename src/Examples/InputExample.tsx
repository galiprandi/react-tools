import { useState } from 'react'
import { Input, type InputProps } from '../../lib/components/Input'

export const InputExample = () => {
    const [value, setValue] = useState<InputProps['value']>()
    const [valueDebounced, setValueDebounced] = useState<InputProps['value']>()
    const [transform, setTransform] =
        useState<InputProps['transform']>('titleCase')

    return (
        <section>
            <hr />
            <h2>Input</h2>

            <Input
                type="text"
                placeholder="Enter your name and last name"
                value={value}
                // Custom attributes
                label="Name and Last Name"
                className="my-custom-input"
                onChangeValue={setValue}
                onChangeDebounce={setValueDebounced}
                debounceDelay={1000}
                transform={transform}
                datalist={['John Doe', 'Jane Doe', 'John Smith']}
            />

            <p>
                <label>
                    Transformation:
                    <select
                        name="tranformation"
                        id="tranformation"
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
                        <option value="onlyNumbers">Only Numbers</option>
                        <option value="onlyLetters">Only Letters</option>
                        <option value="onlyEmail">Only Email</option>
                        <option value="onlyAlphanumeric">
                            Only Alphanumeric
                        </option>
                    </select>
                </label>
            </p>
            <p>
                Transformed value: <code>{value}</code>
                <br />
                Debounced value (1s): <code>{valueDebounced}</code>
            </p>
        </section>
    )
}
