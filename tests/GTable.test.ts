import { describe, it } from "vitest";
import GTable from "../src/components/GTable.vue";
import { testAccessibility } from "./test-utils";

describe("GTable", () => {
    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default content", async () => {
            await testAccessibility(
                GTable,
                { label: "Tahble" },
                { default: "<p>Example content</p>" },
            );
        });
    });
});
