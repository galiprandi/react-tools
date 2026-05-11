## 2026-05-11 - Prototype Pollution in Form Data Collection
**Vulnerability:** The `Form` component was vulnerable to prototype pollution when collecting values from `FormData`.
**Learning:** Blindly spreading `FormData` entries into an object allows an attacker to inject properties like `__proto__`, `constructor`, or `prototype`, which can lead to prototype pollution.
**Prevention:** Always validate or filter keys from untrusted input before assigning them to objects. Use direct assignment or `Object.create(null)` for result objects. Note that 'happy-dom' test environment crashes if an HTML input has a 'name' attribute equal to these reserved keys, so mocking 'FormData' is preferred for testing.
