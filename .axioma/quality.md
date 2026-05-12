## 2025-05-14 - [Strict JSDoc and ESLint Rules]
**Learning:** This codebase requires all exported functions to have comprehensive JSDoc with @param, @returns, and @example. Additionally, ESLint enforces a description for `@ts-expect-error` comments.
**Action:** Always check for missing JSDoc on exports and ensure `@ts-expect-error` has a descriptive comment.

## 2025-05-12 - [Dialog Testing and State Synchronization]
**Learning:** The 'happy-dom' test environment does not natively implement `HTMLDialogElement` methods (`show`, `showModal`, `close`). Additionally, components that initialize state from props (like `Dialog`) need explicit `useEffect` hooks to remain reactive to prop changes.
**Action:** Manually mock `HTMLDialogElement.prototype` methods in Vitest when testing dialog components, and ensure state/prop synchronization is implemented for reactive components.
