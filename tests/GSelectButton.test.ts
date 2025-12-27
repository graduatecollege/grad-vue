import { describe, it } from "vitest";
import GSelectButton from "../src/components/GSelectButton.vue";
import { testAccessibility } from "./test-utils";

describe("GSelectButton", () => {
    const options = ["Option 1", "Option 2", "Option 3"];

    describe("Functional Tests", () => {
        it("renders with default props", () => {
            // Basic rendering test
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GSelectButton, {
                label: "Choose option",
                options,
                modelValue: ""
            });
        });

        it("passes accessibility tests with selected value", async () => {
            await testAccessibility(GSelectButton, {
                label: "Choose option",
                options,
                modelValue: "Option 1",
            });
        });

        it("passes accessibility tests with object options", async () => {
            const objectOptions = [
                { label: "First", value: 1 },
                { label: "Second", value: 2 },
            ];

            await testAccessibility(GSelectButton, {
                label: "Choose option",
                options: objectOptions,
                modelValue: 1,
            });
        });
    });
});
