import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dialog } from './index'

describe('Dialog', () => {
    beforeEach(() => {
        // Mocking HTMLDialogElement methods as they are not implemented in happy-dom
        // We also need to mock the 'open' property behavior
        vi.spyOn(HTMLDialogElement.prototype, 'show').mockImplementation(function (this: HTMLDialogElement) {
            this.setAttribute('open', '')
        })
        vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) {
            this.setAttribute('open', '')
        })
        vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) {
            this.removeAttribute('open')
        })
    })

    it('should render correctly with children', () => {
        render(
            <Dialog isOpen={false}>
                <p>Dialog Content</p>
            </Dialog>
        )
        expect(screen.getByText('Dialog Content')).toBeTruthy()
    })

    it('should call showModal when isOpen is true and behavior is modal', () => {
        render(
            <Dialog isOpen={true} behavior="modal">
                <p>Modal Content</p>
            </Dialog>
        )
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
    })

    it('should call show when isOpen is true and behavior is dialog', () => {
        render(
            <Dialog isOpen={true} behavior="dialog">
                <p>Dialog Content</p>
            </Dialog>
        )
        expect(HTMLDialogElement.prototype.show).toHaveBeenCalled()
    })

    it('should call close when isOpen changes to false', () => {
        const { rerender } = render(
            <Dialog isOpen={true}>
                <p>Content</p>
            </Dialog>
        )

        rerender(
            <Dialog isOpen={false}>
                <p>Content</p>
            </Dialog>
        )

        expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
    })

    it('should call onOpen callback when opened', () => {
        const onOpen = vi.fn()
        render(
            <Dialog isOpen={true} onOpen={onOpen}>
                <p>Content</p>
            </Dialog>
        )
        expect(onOpen).toHaveBeenCalled()
    })

    it('should call onClose callback when closed', () => {
        const onClose = vi.fn()
        const { rerender } = render(
            <Dialog isOpen={true} onClose={onClose}>
                <p>Content</p>
            </Dialog>
        )

        rerender(
            <Dialog isOpen={false} onClose={onClose}>
                <p>Content</p>
            </Dialog>
        )

        expect(onClose).toHaveBeenCalled()
    })

    it('should toggle dialog when opener is clicked', () => {
        render(
            <Dialog
                opener={<button>Toggle</button>}
            >
                <p>Content</p>
            </Dialog>
        )

        const button = screen.getByText('Toggle')

        // Initial click to open
        fireEvent.click(button)
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()

        // Second click to close
        fireEvent.click(button)
        expect(HTMLDialogElement.prototype.close).toHaveBeenCalled()
    })

    it('should pass native dialog element props via spread', () => {
        const { container } = render(
            <Dialog
                isOpen={false}
                className="custom-dialog"
                id="my-dialog"
                aria-labelledby="dialog-title"
            >
                <p>Content</p>
            </Dialog>
        )

        const dialog = container.querySelector('dialog')
        expect(dialog?.className).toContain('custom-dialog')
        expect(dialog?.getAttribute('id')).toBe('my-dialog')
        expect(dialog?.getAttribute('aria-labelledby')).toBe('dialog-title')
    })

    it('should not redundantly call native methods when re-rendered with new callback instances', () => {
        const onOpen1 = vi.fn()
        const onOpen2 = vi.fn()

        const { rerender } = render(
            <Dialog isOpen={true} onOpen={onOpen1}>
                <p>Content</p>
            </Dialog>
        )

        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1)

        rerender(
            <Dialog isOpen={true} onOpen={onOpen2}>
                <p>Content</p>
            </Dialog>
        )

        // It should still be 1 because it's already open
        expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1)
    })
})
