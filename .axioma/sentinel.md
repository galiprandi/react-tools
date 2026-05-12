## 2026-05-11 - Prototype Pollution in Form Data Collection
**Vulnerability:** The `Form` component was vulnerable to prototype pollution when collecting values from `FormData`.
**Learning:** Blindly spreading `FormData` entries into an object allows an attacker to inject properties like `__proto__`, `constructor`, or `prototype`, which can lead to prototype pollution.
**Prevention:** Always validate or filter keys from untrusted input before assigning them to objects. Use direct assignment or `Object.create(null)` for result objects. Note that 'happy-dom' test environment crashes if an HTML input has a 'name' attribute equal to these reserved keys, so mocking 'FormData' is preferred for testing.

## 2025-05-15 - Unhandled Invalid Date in DateTime Component
**Vulnerability:** The `DateTime` component could crash (RangeError: Invalid time value) if an invalid date string was provided via props or input, as it called `.toISOString()` without validation.
**Learning:** React state updates or prop changes can trigger effects that perform operations on data (like `new Date()`) that might fail. Unhandled exceptions in `useEffect` can crash the entire React application.
**Prevention:** Always validate data before calling methods that can throw, especially when dealing with external input or date parsing.
