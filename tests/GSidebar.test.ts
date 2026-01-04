import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GSidebar from "../src/components/GSidebar.vue";
import { testAccessibility } from "./test-utils";

describe("GSidebar", () => {
    describe("Accessibility Tests", () => {
        it("with content", async () => {
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
