import {
    PropsWithChildren,
    ReactHTML,
    createElement,
    useEffect,
    useRef,
} from 'react'

export const Observer = (props: ObserverProps) => {
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

    return createElement(wrapper, { ref, children })
}

export interface ObserverProps
    extends PropsWithChildren,
        IntersectionObserverInit {
    wrapper?: keyof ReactHTML
    onAppear?: (entry: IntersectionObserverEntry) => void
    onDisappear?: (entry: IntersectionObserverEntry) => void
}
