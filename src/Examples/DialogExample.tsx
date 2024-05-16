import { Dialog } from '../../lib/components/Dialog'

export const DialogExample = () => {
    return (
        <section>
            <hr />
            <h2>Dialog</h2>

            <Dialog
                // Custom attributes
                behavior="modal"
                opener={<button>Toggle Dialog</button>}
                onOpen={() => console.info('Dialog opened')}
                onClose={() => console.info('Dialog closed')}
            >
                <h2>Hello there 👋</h2>
                <p>This is a dialog example.</p>
                <p>
                    For information on how to use html dialogs, or styling them,
                    <a
                        href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {' '}
                        check documentation on MDN website
                    </a>
                </p>
            </Dialog>
        </section>
    )
}
