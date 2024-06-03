import { Observer } from '../../lib/main.ts'
import { useState } from 'react'

export const ObserveExample = () => {
    const [inScreen, setInScreen] = useState<number[]>([])
    const images = Array.from({ length: 5 }, (_, i) => i + 1)

    return (
        <section>
            <hr />
            <h2>Observer</h2>
            <p>
                <small>
                    A component that allows you to track when an element enters
                    or exits the viewport. This is useful for lazy loading
                    images, infinite scrolling, and more.
                </small>
            </p>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    right: 0,
                    fontSize: 20,
                    background: '#283618',
                    padding: 15,
                }}
            >
                Images in screen: {inScreen.join(' | ')}
            </div>
            <br />
            {images.map((i) => (
                <Observer
                    key={i}
                    wrapper="p"
                    onAppear={() =>
                        setInScreen((prev) => Array.from(new Set([...prev, i])))
                    }
                    onDisappear={() =>
                        setInScreen((prev) => prev.filter((item) => item !== i))
                    }
                    threshold={0.5}
                >
                    <>
                        <img
                            src={`https://picsum.photos/500/500?random=${i}`}
                            loading="lazy"
                            alt="Free image"
                            width={500}
                            height={500}
                        />
                        <br />
                    </>
                </Observer>
            ))}
        </section>
    )
}
