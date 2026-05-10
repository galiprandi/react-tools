import './App.css'
import { useState } from 'react'
import { UseDateTimePage } from './pages/dateTime/useDateTimePage'
import { UseDebouncePage } from './pages/debounce/useDebouncePage'
import { UseDialogPage } from './pages/dialog/useDialogPage'
import { UseFormPage } from './pages/form/useFormPage'
import { UseInputPage } from './pages/input/useInputPage'
import { UseObserverPage } from './pages/observer/useObserverPage'
import { UseLazyRenderPage } from './pages/lazyRender/useLazyRenderPage'
import { UseAsyncBlockPage } from './pages/asyncBlock/useAsyncBlockPage'
import { UseAIPage } from './pages/ai/useAIPage'
import { UseAISummarizePage } from './pages/ai/useAISummarizePage'
import { UseLanguageDetectionPage } from './pages/ai/useLanguageDetectionPage'
import { UseTranslatorPage } from './pages/ai/useTranslatorPage'

function App() {
    const [currentPage, setCurrentPage] = useState<'asyncblock' | 'form' | 'input' | 'datetime' | 'dialog' | 'observer' | 'lazyrender' | 'ai-status' | 'ai-summarizer' | 'ai-language-detection' | 'ai-translator' | 'debounce'>('asyncblock')

    return (
        <main>
            <nav style={{ overflowX: 'auto' }}>
                <ul>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('asyncblock')
                            }}
                        >
                            AsyncBlock
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('form')
                            }}
                        >
                            Form
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('input')
                            }}
                        >
                            Input
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('datetime')
                            }}
                        >
                            DateTime
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('dialog')
                            }}
                        >
                            Dialog
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('observer')
                            }}
                        >
                            Observer
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('lazyrender')
                            }}
                        >
                            LazyRender
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('ai-status')
                            }}
                        >
                            useAI
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('ai-summarizer')
                            }}
                        >
                            useAISummarize
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('ai-language-detection')
                            }}
                        >
                            useLanguageDetection
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('ai-translator')
                            }}
                        >
                            useTranslator
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage('debounce')
                            }}
                        >
                            useDebounce
                        </a>
                    </li>
                </ul>
            </nav>

            {currentPage === 'asyncblock' && <UseAsyncBlockPage />}

            {currentPage === 'form' && <UseFormPage />}

            {currentPage === 'input' && <UseInputPage />}

            {currentPage === 'datetime' && <UseDateTimePage />}

            {currentPage === 'dialog' && <UseDialogPage />}

            {currentPage === 'observer' && <UseObserverPage />}

            {currentPage === 'lazyrender' && <UseLazyRenderPage />}

            {currentPage === 'ai-status' && <UseAIPage />}

            {currentPage === 'ai-summarizer' && <UseAISummarizePage />}

            {currentPage === 'ai-language-detection' && <UseLanguageDetectionPage />}

            {currentPage === 'ai-translator' && <UseTranslatorPage />}

            {currentPage === 'debounce' && <UseDebouncePage />}
        </main>
    )
}

export default App
