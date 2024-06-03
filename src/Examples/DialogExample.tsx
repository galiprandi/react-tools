import { Dialog } from '../../lib/main.ts'

export const DialogExample = () => {
    return (
        <section>
            <hr />
            <h2>Dialog</h2>

            <Dialog
                // Custom attributes
                behavior="dialog"
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

            <p>
                Dialogs are a great way to show content that requires user
                interaction. They are also a great way to show content that
                should not be missed by the user.
            </p>
        </section>
    )
}
