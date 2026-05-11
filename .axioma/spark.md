## 2025-05-14 - [Centralized String Transforms]
**Learning:** Using a centralized utility for string transformations (`valueTransforms`) and then leveraging TypeScript's `Parameters<typeof valueTransforms>[1]` in UI components (like `Input`) ensures that new transformations are automatically available and type-safe across the entire library.
**Pattern:** Export a transform utility with a union type for its options, and use `Parameters<typeof fn>[index]` to type props in components that consume it.
