import './App.css'
import { DateTimeExample } from './Examples/DateTimeExample'
import { DebounceExample } from './Examples/DebounceExample'
import { DialogExample } from './Examples/DialogExample'
import { FormExample } from './Examples/FormExample'
import { InputExample } from './Examples/InputExample'
import { ObserveExample } from './Examples/ObserverExample'
import { LazyRenderExample } from './Examples/LazyRenderExample'

function App() {
    return (
        <main>
            <h1>react-tools</h1>
            <p>
                Welcome to react-tools, a set of simple and intuitive utilities
                for developing React applications. This package includes key
                tools that can streamline your development process.
            </p>

            <FormExample />
            <InputExample />
            <DateTimeExample />
            <DialogExample />
            <ObserveExample />
            <LazyRenderExample />
            <DebounceExample />
        </main>
    )
}

export default App
