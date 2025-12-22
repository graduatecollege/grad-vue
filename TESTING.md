# Testing Guide

This project uses Vitest 4 for unit testing and @sa11y/vitest for accessibility testing. All components are tested for both functional behavior and accessibility compliance.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized by component in the `tests/` directory:

```
tests/
├── setup.ts                    # Global test setup
├── test-utils.ts               # Reusable test utilities
├── vitest.d.ts                 # TypeScript declarations
├── GAlertDialog.test.ts        # Alert dialog component tests
├── GAppHeader.test.ts          # App header component tests
├── GButton.test.ts             # Button component tests
├── GPopover.test.ts            # Popover component tests
├── GProgress.test.ts           # Progress component tests
├── GSearch.test.ts             # Search component tests
├── GSelect.test.ts             # Select component tests
├── GSelectButton.test.ts       # Select button component tests
├── GSidebar.test.ts            # Sidebar component tests
├── GSidebarMenu.test.ts        # Sidebar menu component tests
└── GTextInput.test.ts          # Text input component tests
```

## Test Types

### Functional Tests

Each component has basic functional tests that verify:
- Component renders correctly with default props
- Props are applied correctly
- Events are emitted as expected
- Component behavior matches specifications

### Accessibility Tests

All components include accessibility tests using @sa11y/vitest that verify:
- WCAG compliance using axe-core rules
- Proper ARIA attributes
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Form labels

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { testAccessibility } from "./test-utils";
import GButton from "../src/components/GButton.vue";

describe("GButton", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            const wrapper = mount(GButton, {
                slots: { default: "Click me" },
            });

            expect(wrapper.text()).toBe("Click me");
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests", async () => {
            await testAccessibility(GButton, {}, { default: "Click me" });
        });
    });
});
```

### Using Test Utilities

The `testAccessibility` helper reduces code duplication:

```typescript
// Automatically mounts component, runs accessibility checks, and unmounts
await testAccessibility(Component, props, slots);
```

## Test Results

After running tests, results are available in multiple formats:

- **HTML Report**: `test-results/index.html` - Interactive browser-based report
- **JSON Results**: `test-results/results.json` - Raw Vitest output
- **Component Results**: `test-results/component-results.json` - Grouped by component

View the HTML report:

```bash
npx vite preview --outDir test-results
```

## Current Test Status

- ✅ 45 tests passing
- ⏭️ 3 tests skipped (GAlertDialog - focus-trap complexity)
- ❌ 0 tests failing

## Continuous Integration

Tests run automatically on every commit via GitHub Actions. See `.github/workflows/` for CI configuration.

## Troubleshooting

### Focus Trap Errors

Some components (like GAlertDialog) use focus-trap which can be difficult to test in isolation. These tests may be skipped with proper documentation.

### Missing Props Warnings

Vue may warn about missing required props in tests. Add the required props to your test setup:

```typescript
mount(Component, {
    props: {
        requiredProp: "value",
    },
});
```

### Accessibility Violations

If accessibility tests fail, the error message will include:
- The specific WCAG rule that failed
- The element(s) with violations
- Suggestions for fixing the issue

Example:

```
[label] Ensure every form element has a label
- Error element(s): 1
- HTML element: <input type="text">
- Fix: Add aria-label, <label>, or title attribute
```
