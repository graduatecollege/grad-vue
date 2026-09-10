import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { page, userEvent } from "vitest/browser";
import GTermSelector from "../packages/grad-vue/src/components/GTermSelector.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GTermSelector", () => {
    describe("Functional Tests", () => {
        it("updates its model when the internal term control changes", async () => {
            const term = ref({ year: "2026", name: "Spring" });

            mnt(GTermSelector, {
                props: {
                    termYears: ["2026", "2025"],
                },
                model: term,
            });

            await userEvent.click(page.getByRole("button", { name: /Spring 2026/ }));
            await userEvent.click(page.getByText("Summer", { exact: true }));

            expect(term.value).toEqual({ year: "2026", name: "Summer" });
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default content", async () => {
            await testAccessibility(
                GTermSelector,
                { label: "Term Selector" },
                { default: () => "<p>Example content</p>" },
            );
        });
    });
});
