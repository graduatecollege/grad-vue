---
name: writing-tests
description: Use when writing tests
---

# Writing Tests

Use this skill when creating or updating unit/component tests for this monorepo.

## Guidelines
- Use the `mnt` helper from `tests/test-utils.ts` instead of raw `mount`.
- Prefer `vitest-browser` semantic queries (e.g., `page.getByRole`, `getByLabelText`) over CSS selectors.
- Extract common setup into fixtures or helpers to avoid duplication.
- Keep tests focused on behavior and accessibility; verify roles, names, and ARIA where applicable.
- Run `npm run test`

## Code examples

Minimal component test using `mnt` and semantic queries

```ts
import { describe, it, expect } from "vitest";
import { page } from "vitest/browser";
import { mnt } from "./test-utils";
import GButton from "../packages/grad-vue/src/components/GButton.vue";

describe("GButton", () => {
  it("renders and is accessible by name", async () => {
    const { instance } = mnt(GButton, { props: { label: "Click me" } });
    await expect.element(page.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });
});
```

Each component should include at least one accessibility scanner test:

```ts
describe("Accessibility Tests", () => {
    it("with default props", async () => {
        await testAccessibility(GButton, {}, { default: () => "Click me" });
    });
});
```