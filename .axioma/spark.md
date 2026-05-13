## 2025-05-14 - [Centralized String Transforms]
**Learning:** Using a centralized utility for string transformations (`valueTransforms`) and then leveraging TypeScript's `Parameters<typeof valueTransforms>[1]` in UI components (like `Input`) ensures that new transformations are automatically available and type-safe across the entire library.
**Pattern:** Export a transform utility with a union type for its options, and use `Parameters<typeof fn>[index]` to type props in components that consume it.

## 2025-05-20 - [Unified Comparison Pattern in useList]
**Learning:** Implementing a helper like `getValueToCompare` allows list operations (add, remove, update, toggle) to seamlessly handle both primitive values and complex objects through an optional key parameter, maintaining a consistent and predictable API.
**Pattern:** Use an internal helper to resolve comparison values (e.g., `(item[key] ?? item)`) in hooks that manage collections to support both simple and keyed data structures.
