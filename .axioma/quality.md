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

## 2026-05-18 - [Security Utility Documentation and Testing]
**Learning:** Security-critical utilities like `isRestrictedKey` must be explicitly documented with their security purpose (e.g., prototype pollution prevention) and covered by exhaustive unit tests, including case-sensitivity and edge cases.
**Action:** Always provide JSDoc with @example and dedicated unit tests for any utility involved in security checks or data validation.

## 2025-05-22 - [Robust Timer Testing and Documentation]
**Learning:** Testing timers requires considering edge cases like negative delays or past dates, which browsers typically treat as a 0ms delay. Standardizing all exported hooks with detailed JSDoc and removing legacy/non-English comments significantly improves API discoverability and maintainability.
**Action:** Always include edge cases for timing-related utilities and ensure all comments/JSDoc are in English and follow the project's standard format.

## 2025-05-25 - [Micro Quality Improvement Scope]
**Learning:** Maintaining a strict 50-line diff limit ensures quality improvements remain "micro" and easy to review. Combining documentation updates and test coverage improvements across multiple files can easily exceed this limit and complicate reviews.
**Action:** Focus on a single quality gap (either tests or JSDoc) in a single file per PR to adhere to the micro-improvement philosophy.

## 2025-05-30 - [Deterministic Date Testing]
**Learning:** Tests for date conversion utilities like `iso2LocalDateTime` are sensitive to the execution environment's timezone; mock `Date.prototype.getTimezoneOffset` using Vitest spies (`vi.spyOn(...).mockReturnValue(...)`) to achieve deterministic test outcomes across different environments.
**Action:** Always mock the timezone offset when testing date-to-local-string conversions to prevent flaky tests in CI.

## 2024-06-05 - [Robust Browser API Wrapping]
**Learning:** Components wrapping browser APIs (like `IntersectionObserver` or `HTMLDialogElement`) should use `useRef` to stabilize callbacks and avoid stale closures without triggering effect re-runs. For `Dialog`, checking the native `open` property before calling methods like `showModal()` prevents `InvalidStateError` and redundant state updates.
**Action:** Use the "latest ref" pattern for event callbacks in wrapper components and always verify native element state before invoking state-changing methods.

## 2024-06-05 - [Mocking Dialog State in Tests]
**Learning:** In 'happy-dom', when mocking `HTMLDialogElement` methods, it's crucial to also update the `open` attribute of the element within the mock (e.g., `this.setAttribute('open', '')`). Otherwise, any component logic that checks `dialog.open` after calling a method will receive stale information, leading to incorrect test results.
**Action:** Ensure mocks for native methods also update the underlying DOM state that the component depends on.

## 2024-06-06 - [Safe Instanceof Checks for Browser APIs]
**Learning:** Internal functions for AI content inference must check if browser-specific types like `AudioBuffer` exist using `typeof ... !== 'undefined'` before performing `instanceof` checks to prevent `ReferenceError` in non-browser test environments (like Vitest with happy-dom if not all APIs are polyfilled) or SSR.
**Action:** Always wrap `instanceof` checks for experimental or environment-specific APIs in a `typeof` check.

## 2024-06-06 - [Testing Hooks with Async Warmup]
**Learning:** When testing hooks with async `warmup` features (like `useAIPrompt`), use `waitFor` to ensure the hook reaches an `idle` state before executing actions, or explicitly disable `warmup` in tests that focus on subsequent interactions to avoid race conditions with session initialization.
**Action:** Coordinate test actions with the hook's initialization status to ensure deterministic results.

## 2024-06-12 - [Testing List Sorting Edge Cases]
**Learning:** Testing sorting logic requires covering not only the happy path (ascending/descending) but also edge cases like duplicate values and the presence of `null` or `undefined`. In this codebase, the `useList` hook's sorting logic explicitly pushes nullish values to the end, which must be verified to ensure predictable UI behavior.
**Action:** Always include tests for equal values and null/undefined values when implementing or improving sorting utilities.

## 2024-06-15 - [Exhaustive Coverage for Date Safeguards]
**Learning:** Date utilities like `iso2LocalDateTime` require exhaustive testing of their error safeguards, such as the `catch` block for `toISOString` RangeErrors. Achieving 100% branch coverage often involves mocking prototype methods to throw or using boundary dates (e.g., `8.64e15`) that fail after timezone adjustment.
**Action:** Use `vi.spyOn(Date.prototype, 'toISOString').mockImplementation()` to verify fallback behavior and always rely on `afterEach(() => vi.restoreAllMocks())` for robust cleanup.

## 2024-06-20 - [Achieving Full Branch Coverage with Default Parameters]
**Learning:** To achieve 100% branch coverage in hooks or functions that use default parameters (e.g., `useThrottle(value, limit = 500)`), unit tests must explicitly invoke the function without the optional arguments. Simply relying on tests that provide values for all arguments leaves the default assignment branch uncovered.
**Action:** Always include a test case that omits optional arguments to ensure default parameter logic is verified and coverage is maximized.

## 2024-06-25 - [Robust Timer Input Validation]
**Learning:** Browser timer APIs like `setInterval` and `setTimeout` have inconsistent behaviors when receiving `NaN` or unexpected objects (like `Date` for intervals), often defaulting to 1ms or 0ms without warning. Explicitly validating these inputs and providing fallback values (e.g., 1000ms for intervals) with `console.warn` ensures predictable behavior and improves developer experience.
**Action:** Implement defensive checks for numeric inputs in timer hooks and utilities, especially when they might be derived from dynamic or external sources.

## 2024-06-21 - [Testing Async Lifecycle and Unmount Safety]
**Learning:** Testing components with asynchronous logic (like promises or timeouts) requires verifying that side-effect callbacks (e.g., `onSuccess`, `onError`) are NOT invoked if the component unmounts before the operation completes. This ensures the implementation correctly uses `isMounted` refs or `AbortController` to prevent state updates on unmounted components.
**Action:** Always include "unmount during pending" and "unmount during timeout" test cases for components managing asynchronous lifecycles.

## 2024-06-26 - [Verifying Polymorphic Type Inference]
**Learning:** Hooks that perform automatic type inference (like `useAIPrompt` for multimodal inputs) should have explicit unit tests for each supported input type (e.g., `ArrayBuffer`, `Blob`, `string[]`). Relying only on happy-path text tests can leave type-specific logic uncovered and prone to regressions.
**Action:** Always include a dedicated test case for each supported input type in internal normalization or inference functions to ensure full branch coverage and robustness.

## 2026-06-07 - [Explicit AbortError State Management]
**Learning:** When wrapping browser-native asynchronous APIs (like the Built-in AI APIs), it's critical to explicitly handle the `AbortError` in `catch` blocks by resetting the hook's status to `'idle'`. This ensures that if an operation is cancelled (e.g., via a signal or component unmount), the UI state doesn't remain "stuck" in a loading or active state, improving the robustness of state management across the application.
**Action:** Always transition the status to `'idle'` when an `AbortError` is caught in AI-related hooks to maintain synchronization between the UI and the underlying API state.

## 2026-06-08 - Distinguishing Abort Reasons in Async Components
**Learning:** When using `AbortController` in components that also implement a `timeOut`, it is critical to distinguish between a manual abort (e.g., due to dependency change or unmount) and a timeout abort. Indiscriminately ignoring all aborted promises in a `.catch` block can swallow legitimate timeout errors.
**Action:** Use `signal.reason` to filter aborts in `.catch` blocks: `if (signal.aborted && signal.reason !== 'Timeout') return`. This ensures race conditions are prevented while still allowing the component to transition to an error state upon timeout.

## 2026-06-10 - [Robust Hook Input Validation]
**Learning:** React hooks that wrap timing-sensitive browser APIs (like `useThrottle`) should implement defensive checks for their numeric parameters (e.g., `limit`). Using a pattern like `if (!limit || limit <= 0)` covers `NaN`, `0`, and negative values, ensuring the hook falls back to an immediate update rather than passing invalid values to `setTimeout`.
**Action:** Always validate numeric inputs in hooks that interact with browser timers or scheduling APIs to provide a safe and predictable fallback.

## 2024-06-30 - [Mocking Global Types for Branch Coverage]
**Learning:** To achieve 100% branch coverage in functions that use `typeof Type !== 'undefined' && value instanceof Type` (a common pattern for SSR-safe browser API checks), tests must explicitly mock both the presence and absence of the global `Type`. Using `vi.stubGlobal('Type', class {})` allows exercising the `instanceof` branch even in environments where the API is not natively available.
**Action:** Always use `vi.stubGlobal` to provide mock constructors when testing branch logic that depends on environment-specific global types.

## 2024-06-30 - [Consistent AI Hook Error Recovery]
**Learning:** AI hooks that implement async 'warmup' or cancellable operations must explicitly handle failures and AbortErrors to avoid "stuck" UI states. Transitioning status to 'idle' on AbortError and logging warmup failures while resetting status ensures the hook remains usable for subsequent interactions.
**Action:** Always include AbortError handling in catch blocks and add error logging/state reset to warmup effects in all AI-related hooks.

## 2024-07-01 - [Achieving 100% Branch Coverage for Optional Callbacks]
**Learning:** To achieve 100% branch coverage in components that utilize optional callbacks (e.g., `Input`'s `onChangeValue`, `onChangeDebounce`), unit tests must trigger relevant events (like `fireEvent.change`) while intentionally omitting these optional props to exercise the 'falsy' branches of conditional logic.
**Action:** Always include a test case that omits optional callback props when testing components with event handlers to ensure all logical paths are verified.

## 2024-07-05 - [Ensuring Internal Event Handlers Precedence]
**Learning:** When creating wrapper components that spread `restProps` onto a native element, placing internal event handlers (like `onSubmit` or `onChange`) *after* the spread ensures they are not accidentally overwritten by user-provided props. Additionally, destructuring the specific handler from props allows it to be manually invoked within the internal handler, preserving both functionalities.
**Action:** Always spread `restProps` before specifying internal event handlers in wrapper components to maintain control over the component's core logic while still supporting custom callbacks.
