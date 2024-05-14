import './App.css'
import { DateTimeExample } from './Examples/DateTimeExample'
import { InputExample } from './Examples/InputExample'

function App() {
    return (
        <main>
            <h1>react-tools</h1>
            <p>
                Welcome to `react-tools`, a set of simple and intuitive
                utilities for developing React applications. This package
                includes key tools that can streamline your development process.
            </p>

            <InputExample />
            <DateTimeExample />
        </main>
    )
}

export default App
