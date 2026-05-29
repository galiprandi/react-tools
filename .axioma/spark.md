## 2025-05-14 - [Centralized String Transforms]
**Learning:** Using a centralized utility for string transformations (`valueTransforms`) and then leveraging TypeScript's `Parameters<typeof valueTransforms>[1]` in UI components (like `Input`) ensures that new transformations are automatically available and type-safe across the entire library.
**Pattern:** Export a transform utility with a union type for its options, and use `Parameters<typeof fn>[index]` to type props in components that consume it.

## 2025-05-20 - [Unified Comparison Pattern in useList]
**Learning:** Leveraging the internal `getValueToCompare` helper allows new list operations like `toggle` to seamlessly handle both primitive values and complex objects through an optional key parameter, maintaining consistency with existing operations like `removeBy` or `findItemsBy`.
**Pattern:** Follow the repository's existing internal patterns for value comparison to ensure new features harmonize with the established API and behavior.

## 2025-05-24 - [Stable Function References in useList]
**Learning:** Using a stable `setListCallback` wrapper for the state setter in complex hooks like `useList` ensures that all returned API methods have stable references, preventing unnecessary re-renders in consuming components when these methods are passed as props.
**Pattern:** Wrap the state setter in a `useCallback` (`setListCallback`) and use it as the dependency for all other hook methods.

## 2025-05-25 - [Full Circle Features: Implementation to Documentation]
**Learning:** A micro-feature is only complete when it is reflected in the `README.md`. Always update the component/hook documentation table when adding new public API methods to ensure users can discover and use the new functionality immediately.
**Pattern:** Every change to `UseListReturn` or similar public interfaces must be accompanied by a corresponding update in the project's primary `README.md`.

## 2026-05-15 - [Render Prop Reload Pattern]
**Learning:** Adding a `reload` function as an argument to render props in components that manage async state (`AsyncBlock`) provides a seamless way for users to implement manual refresh or retry logic without increasing component complexity.
**Pattern:** Implement an internal `tick` state that triggers the core `useEffect` and expose a `reload` callback that increments it via the component's render functions.

## 2026-05-20 - [No-op Optimizations in Immutable State]
**Learning:** For list manipulation hooks, implementing no-op checks (returning the original state reference) for operations that would result in an identical array (e.g., reversing a single-item list or swapping out-of-bounds indices) prevents unnecessary React re-renders and improves performance.
**Pattern:** Always check for edge cases where an operation results in no change and return the `currentList` reference immediately.

## 2025-05-26 - [Shadowing standard props for ISO transforms]
**Learning:** For components that wrap native HTML inputs, adding `iso*` variants of standard props (like `isoMin` for `min`) allows the component to handle standard data formats while gracefully falling back to native behavior when the specialized prop is absent.
**Pattern:** Implement specialized props with an `iso` prefix and use a ternary in the render function to prioritize the transformed ISO value: `min={isoMin ? iso2LocalDateTime(isoMin) : min}`.

## 2026-05-26 - [Syncing React State with Native Events]
**Learning:** For components wrapping native elements with their own internal state (like `<dialog>`), synchronizing React state via native event listeners (like `onClose`) is critical. This ensures the component remains in sync when the state changes via browser shortcuts (ESC key) or other non-React means.
**Pattern:** Use native event handlers on the underlying element to trigger React state updates, rather than relying solely on imperative method calls (like `dialog.close()`) to drive the `onClose` logic.

## 2026-05-27 - [Robust Slugification Pattern]
**Learning:** Implementing a robust  transform without external dependencies requires careful handling of diacritics using Unicode normalization (`NFD`) and range replacement (`[̀-ͯ]`) to ensure international characters are simplified rather than just removed.
**Pattern:** When adding string transformations that simplify input for URLs or IDs, use `val.normalize("NFD").replace(/[̀-ͯ]/g, "")` followed by lowercase conversion and non-alphanumeric replacement to create clean, accessible results.

## 2026-05-27 - [Robust Slugification Pattern]
**Learning:** Implementing a robust `slugify` transform without external dependencies requires careful handling of diacritics using Unicode normalization (`NFD`) and range replacement (`[\u0300-\u036f]`) to ensure international characters are simplified rather than just removed.
**Pattern:** When adding string transformations that simplify input for URLs or IDs, use `val.normalize(\"NFD\").replace(/[\u0300-\u036f]/g, \"\")` followed by lowercase conversion and non-alphanumeric replacement to create clean, accessible results.

## 2026-05-28 - [Predicate-Based List Manipulation]
**Learning:** Adding functional methods like `removeWhere` and `updateWhere` to a list management hook (`useList`) significantly increases its expressiveness compared to index-based or property-based operations alone. By using a stable `setListCallback`, these methods maintain high performance and prevent unnecessary re-renders when no matches are found.
**Pattern:** Implement functional list operations by wrapping `filter` and `map` with predicate checks, and always perform a length or equality check before calling the state setter to ensure a no-op when no items are affected.

## 2026-05-29 - [Normalized Circular Operations]
**Learning:** When implementing circular operations like `rotate` on arrays, using a double-modulo pattern `((offset % length) + length) % length` ensures the offset is correctly normalized to a positive value regardless of whether the input is positive or negative, simplifying the slicing logic.
**Pattern:** Normalize directional offsets with `((n % len) + len) % len` before performing immutable array manipulations to robustly handle both "forward" and "backward" operations with a single logic path.
