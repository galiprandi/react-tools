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
import { UseAIPromptPage } from './pages/ai/useAIPromptPage'
import { UseAIWritePage } from './pages/ai/useAIWritePage'
import { UseAIRewriterPage } from './pages/ai/useAIRewriterPage'
import { UseAIProofreaderPage } from './pages/ai/useAIProofreaderPage'
import { UseTimerPage } from './pages/timer/useTimerPage'
import { UseListPage } from './pages/list/useListPage'

function App() {
    const [currentPage, setCurrentPage] = useState<'asyncblock' | 'form' | 'input' | 'datetime' | 'dialog' | 'observer' | 'lazyrender' | 'ai-status' | 'ai-summarizer' | 'ai-language-detection' | 'ai-translator' | 'ai-prompt' | 'ai-write' | 'ai-rewriter' | 'ai-proofreader' | 'debounce' | 'timer' | 'list'>('ai-prompt')

    return (
        <main>
            <nav>
                <ul>
                    <li><strong>react-tools</strong></li>
                </ul>
                <ul>
                    <li>
                        <details className="dropdown">
                            <summary>Components</summary>
                            <ul dir="rtl">
                                <li>
                                    <a
                                        href="#"
                                        className={currentPage === 'asyncblock' ? '' : ''}
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
                                        className={currentPage === 'form' ? 'secondary' : ''}
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
                                        className={currentPage === 'input' ? 'secondary' : ''}
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
                                        className={currentPage === 'datetime' ? 'secondary' : ''}
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
                                        className={currentPage === 'dialog' ? '' : ''}
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
                                        className={currentPage === 'observer' ? 'secondary' : ''}
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
                                        className={currentPage === 'lazyrender' ? 'secondary' : ''}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage('lazyrender')
                                        }}
                                    >
                                        LazyRender
                                    </a>
                                </li>
                            </ul>
                        </details>
                    </li>
                    <li>
                        <details className="dropdown">
                            <summary>Hooks</summary>
                            <ul dir="rtl">
                                <li>
                                    <a
                                        href="#"
                                        className={currentPage === 'debounce' ? '' : ''}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage('debounce')
                                        }}
                                    >
                                        useDebounce
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className={currentPage === 'timer' ? 'secondary' : ''}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage('timer')
                                        }}
                                    >
                                        useTimer
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className={currentPage === 'list' ? 'secondary' : ''}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage('list')
                                        }}
                                    >
                                        useList
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className={currentPage === 'ai-status' ? 'secondary' : ''}
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
                                        className={currentPage === 'ai-summarizer' ? '' : ''}
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
                                        className={currentPage === 'ai-language-detection' ? 'secondary' : ''}
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
                                        className={currentPage === 'ai-translator' ? 'secondary' : ''}
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
                                        className={currentPage === 'ai-prompt' ? '' : ''}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage('ai-prompt')
                                        }}
                                    >
                                        useAIPrompt
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className={currentPage === 'ai-write' ? 'secondary' : ''}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage('ai-write')
                                        }}
                                    >
                                        useAIWrite
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className={currentPage === 'ai-rewriter' ? 'secondary' : ''}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage('ai-rewriter')
                                        }}
                                    >
                                        useAIRewriter
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className={currentPage === 'ai-proofreader' ? 'secondary' : ''}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage('ai-proofreader')
                                        }}
                                    >
                                        useAIProofreader
                                    </a>
                                </li>
                            </ul>
                        </details>
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

            {currentPage === 'ai-prompt' && <UseAIPromptPage />}

            {currentPage === 'ai-write' && <UseAIWritePage />}

            {currentPage === 'ai-rewriter' && <UseAIRewriterPage />}

            {currentPage === 'ai-proofreader' && <UseAIProofreaderPage />}

            {currentPage === 'debounce' && <UseDebouncePage />}

            {currentPage === 'timer' && <UseTimerPage />}

            {currentPage === 'list' && <UseListPage />}
        </main>
    )
}

export default App
