# Comprehensive Testing Methodology - @galiprandi/react-tools

## Objective
Verify that each parameter and behavior documented in README.md works exactly as described for all library components, hooks, and utilities.

## Prerequisites
- Development server running at `http://localhost:5173` (npm run dev)
- Playwright MCP available
- Access to README.md documentation

## Test Order (according to README.md)

### Components
1. AsyncBlock
2. Form
3. Input
4. DateTime
5. Dialog
6. Observer
7. LazyRender

### Hooks
1. useAI
2. useAISummarize
3. useLanguageDetection
4. useTranslator
5. useDebounce
6. useTimer
7. useList

## Playwright Testing Methodology

### 1. Navigate to Test Page
- Use `mcp4_browser_navigate` to go to `http://localhost:5173`
- Use `mcp4_browser_snapshot` to view current state
- Click the link corresponding to the component/hook to test

### 2. Verify Props According to README
For each component/hook:
- Read README.md documentation to get the list of props
- For each prop:
  - Identify how it's tested in the test page UI
  - Execute the corresponding action (click, input, etc.)
  - Verify behavior matches documentation
  - Document result as 🟢 (pass), 🟡 (partial), or 🔴 (fail)

### 3. Capture Evidence
- Use `mcp4_browser_snapshot` before and after each action
- Verify DOM changes
- Review console logs with `mcp4_browser_console_messages` if necessary

### 4. Document Results
Create file with format: `tests/resultados-YYYY-MM-DD.md` containing:
- Execution date
- List of tested components/hooks
- For each feature: 🟢🟡🔴 + brief result description
- If 🔴: describe the problem found

## Special Considerations

### AI Hooks (useAI, useAISummarize, useLanguageDetection, useTranslator)
- These hooks require Chrome's experimental AI APIs
- May not be available in all browsers
- If not available, mark as 🟡 with note "API not available in test environment"

### Components with Async Behavior
- AsyncBlock: requires waiting for promise to resolve
- Observer/LazyRender: require scroll to activate
- useTimer: requires waiting for timeouts

### Interactive Elements
- Dialog: requires opening/closing the modal
- Form: requires form submit
- Input: requires typing in the input

## Results Report Format

```markdown
# Comprehensive Test Results - YYYY-MM-DD

## Summary
- Total features tested: X
- Passed (🟢): X
- Partial (🟡): X
- Failed (🔴): X

## Components

### AsyncBlock
- 🟢 promiseFn: Executes async function correctly
- 🟢 pending: Shows loading UI
- 🟢 success: Shows success UI with data
- 🟢 error: Shows error UI
- 🟢 timeOut: Timeout works correctly
- 🟢 deps: Re-executes when dependencies change
- 🟢 onSuccess: Callback executes
- 🟢 onError: Callback executes

[... rest of components ...]

## Hooks

### useAI
[... same format ...]
```

## Reproducibility
This methodology allows tests to be repeated at any time:
1. Ensure development server is running
2. Follow test order according to README.md
3. Use Playwright MCP to automate navigation and verification
4. Document results in a new dated file

## Unit Test Coverage Analysis

As a complement to E2E tests with Playwright, this methodology includes an analysis of which features documented in README.md do NOT have corresponding unit tests.

### ⚠️ CRITICAL: Always Verify Current Test State

**BEFORE analyzing coverage, ALWAYS execute the following steps:**

1. **Run all unit tests first** to verify they pass and get current test count:
   ```bash
   npm test
   ```
   This ensures you're analyzing the ACTUAL current state, not outdated assumptions.

2. **List all test files** to see what exists:
   ```bash
   find_by_name Pattern: "*.test.ts"
   find_by_name Pattern: "*.test.tsx"
   ```

3. **Document test execution** in the results file:
   - Total test files executed
   - Total tests passed
   - Any warnings or errors
   - Execution timestamp

### Analysis Process

1. **Extract documented features**: For each component/hook from README.md, list all documented props/options/returns

2. **Read existing unit tests**: Review all `.test.ts` and `.test.tsx` files in `lib/` to identify which features are tested
   - **IMPORTANT**: Read the ACTUAL test files, don't rely on memory or previous reports
   - For each test file, identify:
     - Which props/options are being tested
     - Which callbacks are being verified
     - Which return values are being checked

3. **Compare and document gaps**: For each component/hook, identify:
   - Documented features that do NOT have tests (verify by searching test files)
   - Tested features that are NOT documented (bonus)
   - Calculate coverage percentage based on ACTUAL test content

4. **Verify gaps are real**: For each identified gap:
   - Search the test file for the prop/feature name
   - If found, verify it's actually being tested (not just mentioned)
   - If not found, confirm it's truly missing

5. **Add to report**: Include a "Unit Test Coverage Analysis" section in the results file with:
   - Test execution summary (from step 1)
   - Gaps by component/hook
   - Coverage percentages
   - Summary of priority areas for improvement
   - Note: "Analysis conducted on [date] with [X] tests passing"

### Tools

- `bash` with `npm test` to run tests and verify current state
- `find_by_name` with `Pattern: "*.test.ts"` to list all tests
- `read_file` to read each test and analyze coverage
- `Grep` to search for specific prop/feature names in test files
- Manual comparison against README.md

### Gap Documentation Format

```markdown
### [Component/Hook]
**Test gaps:**
- ❌ `[prop/feature]` - Gap description
```

### ⚠️ Common Pitfalls to Avoid

**1. Relying on outdated reports**
- ❌ Don't reference previous coverage reports without verifying current state
- ✅ Always run `npm test` first to get current test count
- ✅ Always read actual test files, don't rely on memory

**2. Misidentifying gaps**
- ❌ Don't assume a prop is untested just because it's not in a specific test
- ✅ Use `Grep` to search for prop names across all test files
- ✅ Verify the prop is actually being tested (not just mentioned in code)

**3. Missing inherited props**
- ❌ Don't forget that components inherit props from other components
- ✅ Check component source code to see what props it inherits
- ✅ Document inherited props separately from own props

**4. Confusing README errors with test gaps**
- ❌ Don't mark a prop as "untested" if it doesn't exist in the component
- ✅ Verify the prop exists in the component source code
- ✅ If README lists a prop that doesn't exist, document as README error, not test gap

## README vs Source Code Verification

To avoid confusing documentation errors with test gaps, verify that README.md accurately reflects the actual component/hook implementation.

### Verification Process

1. **For each component/hook**:
   - Read the component/hook source code
   - Extract the actual props/options from TypeScript interfaces
   - Compare with README.md documentation

2. **Document discrepancies**:
   - **README Error**: README lists a prop that doesn't exist in source
   - **Missing Documentation**: Source has a prop not documented in README
   - **Type Mismatch**: README type doesn't match source type

3. **Handle discrepancies in analysis**:
   - README errors → Document separately, don't count as test gaps
   - Missing documentation → Document as documentation gap, not test gap
   - Type mismatches → Document as documentation error

### Example

If README.md lists Dialog props as:
- `isOpen`, `behavior`, `onOpen`, `onClose`, `opener`, `wrapper`, `threshold`, `onAppear`, `onDisappear`

But Dialog source code only has:
- `isOpen`, `behavior`, `onOpen`, `onClose`, `opener`

Then document:
- **README Error**: `wrapper`, `threshold`, `onAppear`, `onDisappear` don't exist in Dialog (they belong to Observer)
- These should NOT be counted as "untested props"

### Prioritization

Gaps should be prioritized as follows:
1. **Critical**: Main documented features without tests (e.g., main props)
2. **High**: Important options/returns without tests
3. **Medium**: Secondary props or edge cases
4. **Low**: Experimental or rarely used features

## Pre-Report Verification Checklist

Before generating the final coverage report, verify the following:

### ✅ Test Execution Verification
- [ ] Ran `npm test` and all tests passed
- [ ] Documented total test count in report
- [ ] Documented execution timestamp in report
- [ ] Noted any warnings or errors from test execution

### ✅ Test File Verification
- [ ] Listed all test files with `find_by_name`
- [ ] Read each test file to understand actual coverage
- [ ] Used `Grep` to search for specific prop names when unsure
- [ ] Verified props are actually being tested (not just mentioned)

### ✅ README vs Source Verification
- [ ] Read component/hook source code for each item
- [ ] Compared README props with actual TypeScript interfaces
- [ ] Documented README errors separately from test gaps
- [ ] Documented missing documentation separately from test gaps

### ✅ Gap Verification
- [ ] For each identified gap, searched test files for the prop name
- [ ] Confirmed the prop truly doesn't have a test
- [ ] Verified the prop actually exists in the component/hook
- [ ] Distinguished between own props and inherited props

### ✅ Report Completeness
- [ ] Included test execution summary
- [ ] Included coverage percentages for each component/hook
- [ ] Documented README errors separately
- [ ] Documented test gaps separately
- [ ] Added note with analysis date and test count
- [ ] Prioritized gaps by importance

### Report Format Update

Add this header to the Unit Test Coverage Analysis section:

```markdown
## Unit Test Coverage Analysis

**Test Execution Summary:**
- Execution date: [YYYY-MM-DD HH:MM]
- Test files: [X]
- Total tests: [X]
- Status: [All passed / X failed]
- Warnings: [None / List warnings]

**Note:** This analysis was conducted by reading actual test files on [date]. Do not reference this report without verifying current test state with `npm test`.
```

## Recommended Improvements

### 1. TypeScript Type Verification

**Problem**: The methodology doesn't verify that TypeScript types match the documented props.

**Solution**: Add a type-checking step:
```bash
tsc --noEmit
```

This ensures that:
- All documented props exist in the component/hook interfaces
- Type signatures match the documentation
- No type errors in the library code

### 2. README Example Validation

**Problem**: The methodology doesn't verify that code examples in README.md compile and work.

**Solution**: Extract and validate each example:
1. Extract code blocks from README.md
2. Create temporary test files with each example
3. Compile with TypeScript to verify syntax
4. Optionally run examples in a test environment

This ensures that users can copy-paste examples from the README and they will work.

### 3. Automated Coverage Analysis

**Problem**: Unit test coverage analysis is manual and time-consuming.

**Solution**: Use automated coverage tools:
```bash
vitest --coverage
```

Generate coverage reports that:
- Show percentage of code covered by tests
- Highlight untested lines
- Identify components/hooks with low coverage
- Track coverage over time

### 4. Integration with CI/CD

**Recommendation**: Integrate all verification steps into CI/CD pipeline:
- TypeScript type checking on every commit
- Unit tests with coverage reporting
- E2E tests with Playwright on PRs
- Documentation validation (README examples)

This ensures that documentation always stays in sync with implementation.
