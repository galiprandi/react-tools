import { LazyRender } from '../../lib/main.ts'

export const LazyRenderExample = () => {
    return (
        <section>
            <hr />
            <h2>LazyRender</h2>
            <p>
                <small>
                    A component that allows render children when the element is
                    in the viewport and disappear when the element is out of the
                    viewport.
                </small>
            </p>
            <LazyRender>
                <img
                    src={`https://picsum.photos/500/500`}
                    loading="lazy"
                    alt="Free image"
                    width={500}
                    height={500}
                />
            </LazyRender>
        </section>
    )
}
