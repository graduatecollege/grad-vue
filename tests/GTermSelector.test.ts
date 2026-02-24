import { describe, it } from "vitest";
import GTermSelector from "../packages/grad-vue/src/components/GTermSelector.vue";
import { testAccessibility } from "./test-utils";

describe("GTermSelector", () => {
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
