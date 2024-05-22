import { ReactElement, cloneElement, useEffect, useRef, useState } from 'react'

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
    isOpen?: boolean
    onOpen?: () => void
    onClose?: () => void
    behavior?: 'dialog' | 'modal'
    opener?: ReactElement
}
