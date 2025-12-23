import { describe, it } from "vitest";
import GProgress from "../src/components/GProgress.vue";
import { testAccessibility } from "./test-utils";

describe("GProgress", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            // Basic rendering test
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with indeterminate state", async () => {
            await testAccessibility(GProgress, {});
        });

        it("passes accessibility tests with determinate value", async () => {
            await testAccessibility(GProgress, { value: 50 });
        });

        it("passes accessibility tests with different sizes", async () => {
            const sizes = ["small", "medium", "large"] as const;

            for (const size of sizes) {
                await testAccessibility(GProgress, { size, value: 75 });
            }
        });

        it("passes accessibility tests with custom aria-label", async () => {
            await testAccessibility(GProgress, {
                ariaLabel: "File upload progress",
                value: 30,
            });
        });
    });
});
