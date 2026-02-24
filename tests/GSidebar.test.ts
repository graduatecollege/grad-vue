import { describe, it } from "vitest";
import GSidebar from "../packages/grad-vue/src/components/GSidebar.vue";
import { testAccessibility } from "./test-utils";
import { h } from "vue";

describe("GSidebar", () => {
    describe("Accessibility Tests", () => {
        it("with content", async () => {
            await testAccessibility(
                GSidebar,
                { label: "Navigation" },
                {
                    default:
                        () => h("div", { class: "g-dark-content" }, [
                            h("h2", {}, "Sidebar content"),
                            h("p", {}, "Paragraph in sidebar "),
                            h("a", { href: "#" }, "With Link"),
                        ]),
                },
            );
        });
    });
});
