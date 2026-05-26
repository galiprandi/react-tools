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
        closeOnBackdropClick = false,
        opener,
        onOpen,
        onClose,
        ...restProps
    } = props
    const dialog = useRef<HTMLDialogElement>(null)
    const [open, setOpen] = useState(isOpen)

    useEffect(() => {
        setOpen(isOpen)
    }, [isOpen])

    useEffect(() => {
        const dialogElement = dialog.current
        if (!dialogElement) return

        if (open) {
            if (!dialogElement.open) {
                behavior === 'dialog'
                    ? dialogElement.show()
                    : dialogElement.showModal()
                onOpen?.()
            }
        } else {
            if (dialogElement.open) {
                dialogElement.close()
            }
        }
    }, [open, behavior, onOpen])

    const handleNativeClose = () => {
        setOpen(false)
        onClose?.()
    }

    const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        if (!closeOnBackdropClick || behavior !== 'modal') return

        const rect = event.currentTarget.getBoundingClientRect()
        const isInDialog =
            rect.top <= event.clientY &&
            event.clientY <= rect.bottom &&
            rect.left <= event.clientX &&
            event.clientX <= rect.right

        if (!isInDialog) {
            dialog.current?.close()
        }
    }

    const handleToggle = () => setOpen((prev) => !prev)

    return (
        <>
            {opener && cloneElement(opener, { onClick: handleToggle })}
            <dialog
                ref={dialog}
                {...restProps}
                onClose={handleNativeClose}
                onClick={handleClick}
            />
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
    /**
     * Whether the dialog should close when clicking on the backdrop.
     * Only applies when behavior is 'modal'.
     *
     * @default false
     */
    closeOnBackdropClick?: boolean
}
