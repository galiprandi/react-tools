import { Observer } from '../../lib/components/Observer'

export const ObserveExample = () => {
    const images = Array.from({ length: 5 }, (_, i) => i + 1)

    return (
        <section>
            <hr />
            <h2>Observer</h2>

            {images.map((i) => (
                <Observer
                    key={i}
                    wrapper="article"
                    onAppear={() => console.log(`Appeared ${i}`)}
                    onDisappear={() => console.log(`Disappeared ${i}`)}
                    threshold={0.5}
                >
                    <img
                        src={`https://picsum.photos/500/500?random=${i}`}
                        alt="Free image"
                        width={500}
                        height={500}
                    />
                </Observer>
            ))}
        </section>
    )
}
