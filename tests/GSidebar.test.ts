import { describe, it } from "vitest";
import GSidebar from "../src/components/GSidebar.vue";
import { testAccessibility } from "./test-utils";

describe("GSidebar", () => {
    describe("Accessibility Tests", () => {
        it("passes accessibility tests with content", async () => {
            await testAccessibility(
                GSidebar,
                { label: "Navigation" },
                {
                    default:
                        "<div class='g-dark-content'><h2>Sidebar content</h2><p>Paragraph in sidebar <a href='#'>With Link</a></p></div>",
                },
            );
        });
    });
});
