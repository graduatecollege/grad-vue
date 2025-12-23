import { describe, it } from "vitest";
import GSidebar from "../src/components/GSidebar.vue";
import { testAccessibility } from "./test-utils";

describe("GSidebar", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            // Basic rendering test
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with content", async () => {
            await testAccessibility(
                GSidebar,
                { label: "Navigation" },
                { default: "<nav>Sidebar content</nav>" }
            );
        });

        it("passes accessibility tests with different positions", async () => {
            const positions = ["left", "right"] as const;

            for (const position of positions) {
                await testAccessibility(
                    GSidebar,
                    { label: "Navigation", position },
                    { default: "Sidebar content" }
                );
            }
        });
    });
});
