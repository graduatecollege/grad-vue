import { describe, it } from "vitest";
import GTermSelectorControl from "../src/components/term/GTermSelectorControl.vue";
import { testAccessibility } from "./test-utils";

describe("GTermSelectorControl", () => {
    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default content", async () => {
            await testAccessibility(
                GTermSelectorControl,
                { label: "Term Selector Control" },
                { default: "<p>Example content</p>" },
            );
        });
    });
});
