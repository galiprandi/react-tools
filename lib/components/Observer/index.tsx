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
 * Example usage:
 *
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
        ...options
    } = props
    const ref = useRef<HTMLDivElement>(null)

    const callbackFunction = ([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting && onAppear) onAppear(entry)
        if (!entry.isIntersecting && onDisappear) onDisappear(entry)
    }

    useEffect(() => {
        const observer = new IntersectionObserver(callbackFunction, options)
        if (ref.current) observer.observe(ref.current)

        return () => {
            if (ref.current) observer.unobserve(ref.current)
        }
    }, [ref, options])

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
