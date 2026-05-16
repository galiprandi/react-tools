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

### Analysis Process

1. **Extract documented features**: For each component/hook from README.md, list all documented props/options/returns

2. **Read existing unit tests**: Review all `.test.ts` and `.test.tsx` files in `lib/` to identify which features are tested

3. **Compare and document gaps**: For each component/hook, identify:
   - Documented features that do NOT have tests
   - Tested features that are NOT documented (bonus)
   - Calculate coverage percentage

4. **Add to report**: Include a "Unit Test Coverage Analysis" section in the results file with:
   - Gaps by component/hook
   - Coverage percentages
   - Summary of priority areas for improvement

### Tools

- `find_by_name` with `Pattern: "*.test.ts"` to list all tests
- `read_file` to read each test and analyze coverage
- Manual comparison against README.md

### Gap Documentation Format

```markdown
### [Component/Hook]
**Test gaps:**
- ❌ `[prop/feature]` - Gap description
```

### Prioritization

Gaps should be prioritized as follows:
1. **Critical**: Main documented features without tests (e.g., main props)
2. **High**: Important options/returns without tests
3. **Medium**: Secondary props or edge cases
4. **Low**: Experimental or rarely used features

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
