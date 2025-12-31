import { describe, it } from "vitest";
import GClipboard from "../src/components/GClipboard.vue";
import { testAccessibility } from "./test-utils";

describe("GClipboard", () => {
    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default content", async () => {
            await testAccessibility(
                GClipboard,
                { label: "Clipboard" },
                { default: "<p>Example content</p>" },
            );
        });
    });
});
