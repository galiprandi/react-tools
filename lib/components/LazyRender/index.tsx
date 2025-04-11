import { PropsWithChildren, ReactHTML, useState } from 'react'
import { Observer } from '../Observer'

/**
 * LazyRender component – A wrapper that uses the Intersection Observer API to conditionally render its children.
 * The children are rendered only when the component is visible in the viewport and unmounted when it disappears.
 *
 * This is useful for performance optimization, lazy loading, or deferring rendering of non-visible elements.
 *
 * @param {LazyRenderProps} props - The props for the LazyRender component.
 * @returns {JSX.Element} - Returns a React element with the specified wrapper and its children, or null when out of view.
 *
 * Example usage:
 *
 * ```tsx
 * const MyComponent = () => {
 *     return (
 *         <LazyRender wrapper="section">
 *             <p>This content will only render when visible</p>
 *         </LazyRender>
 *     );
 * };
 * ```
 */ export const LazyRender = (props: LazyRenderProps) => {
    const { wrapper = 'div', placeholder = null, ...options } = props
    const [render, setRender] = useState(false)

    return (
        <Observer
            onAppear={() => setRender(true)}
            onDisappear={() => setRender(false)}
            wrapper={wrapper}
            {...options}
        >
            {render ? props.children : placeholder}
        </Observer>
    )
}

/**
 * LazyRenderProps – Props for the LazyRender component.
 *
 * @interface LazyRenderProps
 * @extends {PropsWithChildren}
 * @extends {IntersectionObserverInit}
 *
 * @property {keyof ReactHTML} [wrapper='div'] - The HTML tag to wrap the children.
 */
export interface LazyRenderProps
    extends PropsWithChildren,
        IntersectionObserverInit {
    /**
     * The HTML element to wrap the children with.
     *
     * @default 'div'
     */
    wrapper?: keyof ReactHTML
    /**
     * The content to render when the component is out of view.
     * Default: null
     */
    placeholder?: React.ReactNode
}
