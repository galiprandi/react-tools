## 2025-05-14 - [Strict JSDoc and ESLint Rules]
**Learning:** This codebase requires all exported functions to have comprehensive JSDoc with @param, @returns, and @example. Additionally, ESLint enforces a description for `@ts-expect-error` comments.
**Action:** Always check for missing JSDoc on exports and ensure `@ts-expect-error` has a descriptive comment.

## 2025-05-12 - [Dialog Testing and State Synchronization]
**Learning:** The 'happy-dom' test environment does not natively implement `HTMLDialogElement` methods (`show`, `showModal`, `close`). Additionally, components that initialize state from props (like `Dialog`) need explicit `useEffect` hooks to remain reactive to prop changes.
**Action:** Manually mock `HTMLDialogElement.prototype` methods in Vitest when testing dialog components, and ensure state/prop synchronization is implemented for reactive components.

## 2025-05-15 - [Testing IntersectionObserver and State Updates]
**Learning:** Testing components that use `IntersectionObserver` in 'happy-dom' requires mocking the global `IntersectionObserver` and manually invoking the callback. Furthermore, any state updates triggered by these callbacks must be wrapped in `act` from `@testing-library/react` to avoid "update not wrapped in act" warnings and ensure the UI reflects the new state before assertions.
**Action:** Mock `window.IntersectionObserver` and use `act` when simulating intersection changes in tests.

## 2025-05-20 - [Robust String Transformations]
**Learning:** Common string transformations (camelCase, pascalCase, snakeCase) often fail on "extreme" inputs like all-caps strings or multiple consecutive spaces if they rely on simple regex-based word boundaries. Standardizing input via `.toLowerCase()` and `.trim()` before applying transformation regexes significantly increases utility robustness.
**Action:** Always normalize casing and whitespace when implementing or updating string transformation utilities to handle inconsistent user input.
