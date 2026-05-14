## 2025-05-14 - [Centralized String Transforms]
**Learning:** Using a centralized utility for string transformations (`valueTransforms`) and then leveraging TypeScript's `Parameters<typeof valueTransforms>[1]` in UI components (like `Input`) ensures that new transformations are automatically available and type-safe across the entire library.
**Pattern:** Export a transform utility with a union type for its options, and use `Parameters<typeof fn>[index]` to type props in components that consume it.

## 2025-05-20 - [Unified Comparison Pattern in useList]
**Learning:** Leveraging the internal `getValueToCompare` helper allows new list operations like `toggle` to seamlessly handle both primitive values and complex objects through an optional key parameter, maintaining consistency with existing operations like `removeBy` or `findItemsBy`.
**Pattern:** Follow the repository's existing internal patterns for value comparison to ensure new features harmonize with the established API and behavior.

## 2025-05-24 - [Stable Function References in useList]
**Learning:** Using a stable `setListCallback` wrapper for the state setter in complex hooks like `useList` ensures that all returned API methods have stable references, preventing unnecessary re-renders in consuming components when these methods are passed as props.
**Pattern:** Wrap the state setter in a `useCallback` (`setListCallback`) and use it as the dependency for all other hook methods.
