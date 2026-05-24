import {
    PropsWithChildren,
    ReactHTML,
    createElement,
    useEffect,
    useRef,
} from 'react'

/**
 * Observer component - A component's wrapper that uses the Intersection Observer API to detect when its children appear or disappear in the viewport and triggers the specified callback functions.
 *
 * @param {ObserverProps} props - The props for the Observer component.
 * @returns {ObserverReturn} - Returns a React element with the specified wrapper.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *     const handleAppear = (entry: IntersectionObserverEntry) => {
 *         console.log('Element appeared:', entry);
 *     };
 *
 *     const handleDisappear = (entry: IntersectionObserverEntry) => {
 *         console.log('Element disappeared:', entry);
 *     };
 *
 *     return (
 *         <Observer onAppear={handleAppear} onDisappear={handleDisappear} wrapper="section">
 *             <p>Content to observe</p>
 *         </Observer>
 *     );
 * };
 * ```
 */
export const Observer = (props: ObserverProps): ObserverReturn => {
    const {
        wrapper = 'div',
        onAppear,
        onDisappear,
        children,
        root,
        rootMargin,
        threshold,
    } = props
    const ref = useRef<HTMLDivElement>(null)
    const onAppearRef = useRef(onAppear)
    const onDisappearRef = useRef(onDisappear)

    // Update refs to always point to the latest callbacks
    useEffect(() => {
        onAppearRef.current = onAppear
        onDisappearRef.current = onDisappear
    }, [onAppear, onDisappear])

    useEffect(() => {
        const callbackFunction = ([entry]: IntersectionObserverEntry[]) => {
            if (entry.isIntersecting && onAppearRef.current) {
                onAppearRef.current(entry)
            }
            if (!entry.isIntersecting && onDisappearRef.current) {
                onDisappearRef.current(entry)
            }
        }

        const observer = new IntersectionObserver(callbackFunction, {
            root,
            rootMargin,
            threshold,
        })

        const currentRef = ref.current
        if (currentRef) observer.observe(currentRef)

        return () => {
            if (currentRef) observer.unobserve(currentRef)
            observer.disconnect()
        }
    }, [root, rootMargin, threshold])

    // eslint-disable-next-line react/no-children-prop
    return createElement(wrapper, { ref, children })
}

/**
 * The properties for the Observer component.
 *
 * @interface ObserverProps
 * @extends {PropsWithChildren}
 * @extends {IntersectionObserverInit}
 *
 * @property {keyof ReactHTML} [wrapper='div'] - The HTML element to wrap the children with.
 * @property {(entry: IntersectionObserverEntry) => void} [onAppear] - Callback function triggered when the element appears in the viewport.
 * @property {(entry: IntersectionObserverEntry) => void} [onDisappear] - Callback function triggered when the element disappears from the viewport.
 */
export interface ObserverProps
    extends PropsWithChildren,
        IntersectionObserverInit {
    /**
     * The HTML element to wrap the children with.
     *
     * @default 'div'
     */
    wrapper?: keyof ReactHTML
    /**
     * Callback function triggered when the element appears in the viewport.
     *
     * @param {IntersectionObserverEntry} entry - The intersection observer entry.
     */
    onAppear?: (entry: IntersectionObserverEntry) => void
    /**
     * Callback function triggered when the element disappears from the viewport.
     *
     * @param {IntersectionObserverEntry} entry - The intersection observer entry.
     */
    onDisappear?: (entry: IntersectionObserverEntry) => void
}

/**
 * The return type for the Observer component.
 */
type ObserverReturn = React.DetailedReactHTMLElement<
    {
        ref: React.RefObject<HTMLDivElement>
        children: React.ReactNode
    },
    HTMLDivElement
>
