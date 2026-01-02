import { describe, it } from "vitest";
import GProgress from "../src/components/GProgress.vue";
import { testAccessibility } from "./test-utils";

describe("GProgress", () => {
    describe("Accessibility Tests", () => {
        it("with indeterminate state", async () => {
            await testAccessibility(GProgress, {});
        });

        it("with determinate value", async () => {
            await testAccessibility(GProgress, { value: 50 });
        });

        it("with different sizes", async () => {
            const sizes = ["small", "medium", "large"] as const;

            for (const size of sizes) {
                await testAccessibility(GProgress, { size, value: 75 });
            }
        });

        it("with custom aria-label", async () => {
            await testAccessibility(GProgress, {
                ariaLabel: "File upload progress",
                value: 30,
            });
        });
    });
});
