## 2026-05-11 - Prototype Pollution in Form Data Collection

**Vulnerability:** The `Form` component was vulnerable to prototype pollution when collecting values from `FormData`.
**Learning:** Blindly spreading `FormData` entries into an object allows an attacker to inject properties like `__proto__`, `constructor`, or `prototype`, which can lead to prototype pollution.
**Prevention:** Always validate or filter keys from untrusted input before assigning them to objects. Use direct assignment or `Object.create(null)` for result objects. Note that 'happy-dom' test environment crashes if an HTML input has a 'name' attribute equal to these reserved keys, so mocking 'FormData' is preferred for testing.

## 2025-05-15 - Unhandled Invalid Date in DateTime Component

**Vulnerability:** The `DateTime` component could crash (RangeError: Invalid time value) if an invalid date string was provided via props or input, as it called `.toISOString()` without validation.
**Learning:** React state updates or prop changes can trigger effects that perform operations on data (like `new Date()`) that might fail. Unhandled exceptions in `useEffect` can crash the entire React application.
**Prevention:** Always validate data before calling methods that can throw, especially when dealing with external input or date parsing.

## 2024-05-18 - Prototype Access Vulnerability in useList

**Vulnerability:** The `useList` hook allowed matching items using prototype properties like `constructor` or `__proto__` when a key was provided to helper methods like `removeBy` or `toggle`.
**Learning:** Functions that dynamically access object properties using a string key from parameters can unintentionally expose internal object state or methods if the key is not validated.
**Prevention:** Implement a blacklist of restricted keys (e.g., `__proto__`, `constructor`, `prototype`, `toString`) when performing dynamic property access on objects, especially in generic utilities or hooks.

## 2025-05-16 - Dependency Upgrade and ID Selector Constraints

**Vulnerability:** Vitest (<1.6.1) and Happy DOM (<20.0.2) were vulnerable to Remote Code Execution (RCE).
**Learning:** Upgrading Happy DOM to v20+ introduced a breaking change where `querySelector` (used internally by React/Testing Library) fails on IDs containing colons (common in React 18's `useId`). This caused tests using datalists or linked elements to crash.
**Prevention:** When upgrading test environments, verify that ID generation patterns (like `useId`) remain compatible with the environment's CSS selector parser. Prefixing dynamic IDs with a string (e.g., `datalist-${baseId}`) ensures compatibility across different DOM implementations.

## 2025-05-16 - Centralized Prototype Pollution Defense

**Vulnerability:** Duplicated and incomplete lists of restricted keys (`__proto__`, `constructor`, etc.) in multiple components increased the risk of inconsistent security coverage.
**Learning:** Security-critical constants like restricted keys for object property validation should be centralized to ensure consistency and easier maintenance.
**Prevention:** Use the centralized `isRestrictedKey` utility from `lib/utilities/security.ts` for all operations involving dynamic property assignment from untrusted input (e.g., Form data, List operations).

## 2026-05-18 - DoS in AI Streaming Hooks

**Vulnerability:** AI hooks (Prompt, Summarizer, etc.) were accumulating chunks in streaming mode (`setData(prev => prev + chunk)`), leading to memory exhaustion because Chrome's AI APIs return cumulative chunks.
**Learning:** Always verify whether a streaming API returns incremental or cumulative data. Cumulative data requires state replacement to avoid redundant and potentially explosive memory usage.
**Prevention:** In AI streaming hooks, use `setData(chunk)` to replace state with the latest cumulative result, and enforce `userActivation` to prevent automated abuse of local AI resources.

## 2025-05-22 - Missing User Activation and Resource Exhaustion in Built-in AI

**Vulnerability:** `useAIPrompt` was missing a mandatory `throw` for missing user activation, and AI hooks were vulnerable to a DoS (high memory usage) by manually concatenating cumulative chunks from Chrome's Built-in AI APIs.
**Learning:** Built-in browser AI APIs (Prompt, Summarizer, etc.) often return cumulative results in their streaming methods. Concatenating these chunks instead of replacing the state leads to quadratic string growth and potential memory exhaustion. Enforcing user activation prevents automated background abuse of local LLMs.
**Prevention:** Always replace the state with the latest chunk (`setData(chunk)`) when using cumulative streaming APIs. Consistently enforce `navigator.userActivation.isActive` across all hooks using experimental browser AI.

## 2025-05-23 - Holistic User Activation Enforcement in AI APIs

**Vulnerability:** AI model preloading and internal utility functions (like auto-language detection) were bypasses for the user activation requirement, allowing background resource consumption and potential fingerprinting.
**Learning:** Security gates must be applied not just at the primary user-facing action, but at any entry point that triggers expensive or privacy-sensitive model initialization, including preloading and automated background tasks.
**Prevention:** Consistently verify `navigator.userActivation.isActive` in all methods that call `.create()` on AI models, including internal helpers and preloading hooks.

## 2025-05-25 - Security Bypass in useList Comparison Logic

**Vulnerability:** The `useList` hook's `isRestrictedKey` check could be bypassed if a user provided `undefined` as the target value for comparison, because the hook's internal helper returned `undefined` for restricted keys.
**Learning:** Using a common value like `undefined` as a fallback or indicator for restricted/invalid keys is insecure if that value can also be provided by the user.
**Prevention:** Use a unique `Symbol` as a sentinel value when handling restricted keys in comparison or lookup logic to ensure they never match user-controlled input.

## 2025-05-26 - False Positive API Detection via Object Constructor

**Vulnerability:** The `useAI` hook incorrectly identified APIs as available when a plain object (e.g., `{}`) existed with a matching global name. This happened because `globalApi.constructor` resolved to `Object` when `globalApi` was a plain object.
**Learning:** When dynamically resolving global constructors by name, explicitly verify that the resolved constructor is not the base `Object` to avoid false positives from matching global objects that are not actual class/function constructors.
**Prevention:** Validate that resolved global constructors are not equal to `Object` and use `isRestrictedKey` to prevent property injection when accessing globals by dynamic names.

## 2024-05-27 - Security Bypass in useList Toggle Logic

**Vulnerability:** The `useList` hook's `toggle` method was vulnerable to a security bypass where using a restricted key (like `constructor`) would incorrectly match and remove the first item in the list. This happened because `getValueToCompare` correctly returned a unique `RESTRICTED_SYMBOL` for restricted keys, but `toggle` then used this symbol to find a match, which always succeeded for any item in the list as they all returned the same symbol.
**Learning:** When using sentinel values (like Symbols) to indicate restricted or invalid inputs, ensure that subsequent logic (like `findIndex`) does not treat these sentinels as valid values to match against.
**Prevention:** Explicitly check for the restricted sentinel value in comparison logic and treat it as a non-match where appropriate (e.g., in `toggle` operations).

## 2025-05-28 - Unrecognized API Type Vulnerability in useAI

**Vulnerability:** The `useAI` hook lacked a default case in its API type-to-global name mapping, which could lead to accessing `window[undefined]` or other unintended property access if the `AIApiType` was extended without updating the internal `switch` statements.
**Learning:** Always implement exhaustive `switch` statements or include a `default` case when mapping union types to internal values to ensure "fail-secure" behavior for future expansions.
**Prevention:** Use `default` cases in mapping logic to report explicit errors or throw exceptions for unrecognized types.

## 2025-05-29 - False Positive AI API Detection via Primitives

**Vulnerability:** The `useAI` hook could incorrectly identify APIs as available if a global property with a matching name was a plain object, array, or basic function, as long as it didn't match the `Object` constructor.
**Learning:** Checking against only the `Object` constructor is insufficient for dynamic global property resolution. Other built-in constructors like `Array` and `Function` can also produce false positives.
**Prevention:** Explicitly exclude `Object`, `Array`, and `Function` constructors, and enforce a "fail-secure" check by requiring the presence of specific expected methods (like `create` or `availability`) on the global object itself before reporting it as available.
