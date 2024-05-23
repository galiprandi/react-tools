import { ReactElement, cloneElement, useEffect, useRef, useState } from 'react'

/**
 * Dialog component - A component that wraps the dialog HTML tag and provides a simple way to create accessibility dialogs and modals in your React application.
 *
 * @param {DialogProps} props - The props for the Dialog component.
 * @returns {JSX.Element} - Returns a JSX element representing the dialog component.
 *
 * Example usage:
 *
 * ```tsx
 * const MyComponent = () => {
 *     const [isOpen, setIsOpen] = useState(false);
 *
 *     const handleOpen = () => setIsOpen(true);
 *     const handleClose = () => setIsOpen(false);
 *
 *     return (
 *         <div>
 *             <button onClick={handleOpen}>Open Dialog</button>
 *             <Dialog
 *                 isOpen={isOpen}
 *                 onOpen={() => console.log('Dialog opened')}
 *                 onClose={() => console.log('Dialog closed')}
 *                 behavior="modal"
 *                 opener={<button>Toggle Dialog</button>}
 *             >
 *                 <p>Dialog content goes here</p>
 *             </Dialog>
 *         </div>
 *     );
 * };
 * ```
 */
export const Dialog = (props: DialogProps): JSX.Element => {
    const {
        isOpen = false,
        behavior = 'modal',
        opener,
        onOpen,
        onClose,
        ...restProps
    } = props
    const dialog = useRef<HTMLDialogElement>(null)
    const [open, setOpen] = useState(isOpen)

    useEffect(() => {
        if (!dialog.current) return
        if (open) {
            behavior === 'dialog'
                ? dialog.current.show()
                : dialog.current.showModal()
            onOpen?.()
        } else {
            dialog.current.close()
            onClose?.()
        }
    }, [open, behavior, onOpen, onClose])

    const handleToggle = () => setOpen((prev) => !prev)

    return (
        <>
            {opener && cloneElement(opener, { onClick: handleToggle })}
            <dialog ref={dialog} {...restProps} />
        </>
    )
}

export interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
    /**
     * A boolean value that determines if the dialog is open or closed.
     *
     * @default false
     */
    isOpen?: boolean
    /**
     * Callback function triggered when the dialog is opened.
     */
    onOpen?: () => void
    /**
     * Callback function triggered when the dialog is closed.
     */
    onClose?: () => void
    /**
     * The behavior of the dialog. Can be either 'dialog' or 'modal'.
     * 'dialog' - The dialog is a modeless dialog and does not block the rest of the page.
     * 'modal' - The dialog is a modal dialog and blocks the rest of the page.
     *
     * @default 'modal'
     */
    behavior?: 'dialog' | 'modal'
    /**
     * The element that triggers the dialog to open or close.
     */
    opener?: ReactElement
}
