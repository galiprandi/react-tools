// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'happy-dom',
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'json', 'html'],
            exclude: ['src'],
        },
    },
})
