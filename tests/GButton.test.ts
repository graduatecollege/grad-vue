import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GButton from "../src/components/GButton.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GButton", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            const wrapper = mnt(GButton, {
                slots: {
                    default: "Click me",
                },
            });

            expect(wrapper.text()).toBe("Click me");
            expect(wrapper.classes()).toContain("g-btn");
            expect(wrapper.classes()).toContain("g-btn--medium");
            expect(wrapper.classes()).toContain("g-btn--primary");
        });

        it("emits click event when clicked", async () => {
            const wrapper = mount(GButton, {
                slots: { default: "Click me" },
            });

            await wrapper.trigger("click");
            expect(wrapper.emitted()).toHaveProperty("click");
        });

        it("applies size classes correctly", () => {
            const sizes = ["small", "medium", "large"] as const;

            sizes.forEach((size) => {
                const wrapper = mount(GButton, {
                    props: { size },
                    slots: { default: "Button" },
                });

                expect(wrapper.classes()).toContain(`g-btn--${size}`);
            });
        });

        it("applies theme classes correctly", () => {
            const themes = ["primary", "secondary", "accent", "danger"] as const;

            themes.forEach((theme) => {
                const wrapper = mount(GButton, {
                    props: { theme },
                    slots: { default: "Button" },
                });

                expect(wrapper.classes()).toContain(`g-btn--${theme}`);
            });
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default props", async () => {
            await testAccessibility(GButton, {}, { default: "Click me" });
        });

        describe.for(["small", "medium", "large"] as const)("Size: %s", (size) => {
            describe.for(["primary", "secondary", "accent", "danger"] as const)("Theme: %s", (theme) => {
               it.for([
                   "Outlined",
                   "Text"
               ])("Variant: %s", async (variant) => {
                   await testAccessibility(
                       GButton,
                       { size, theme, outlined: variant === "Outlined", text: variant === "Text" },
                       { default: "Button" }
                   );
               });
            });
        });

        it("passes accessibility tests with different sizes", async () => {
            const sizes = ["small", "medium", "large"] as const;

            for (const size of sizes) {
                await testAccessibility(GButton, { size }, { default: "Button" });
            }
        });

        it("passes accessibility tests with different themes", async () => {
            const themes = ["primary", "secondary", "accent", "danger"] as const;

            for (const theme of themes) {
                await testAccessibility(GButton, { theme }, { default: "Button" });
            }
        });

        it("passes accessibility tests with outlined variant", async () => {
            await testAccessibility(GButton, { outlined: true }, { default: "Button" });
        });

        it("passes accessibility tests with text variant", async () => {
            await testAccessibility(GButton, { text: true }, { default: "Button" });
        });
    });
});
