import { describe, it, expect, vi } from "vitest";
import GButton from "../src/components/GButton.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page, userEvent } from "vitest/browser";

describe("GButton", () => {
    describe("Functional Tests", () => {
        it("renders with default props", async () => {
            const wrapper = mnt(GButton, {
                slots: {
                    default: () => "Click me",
                },
            });

            await expect.element(wrapper.instance).toHaveTextContent("Click me");
            await expect.element(wrapper.instance).toHaveClass("g-btn");
            await expect.element(wrapper.instance).toHaveClass("g-btn--medium");
            await expect.element(wrapper.instance).toHaveClass("g-btn--primary");
            wrapper.unmount();
        });

        it("emits click event when clicked", async () => {
            const onClick = vi.fn();
            const wrapper = mnt(GButton, {
                props: { onClick },
                slots: { default: () => "Click me" },
            });

            await userEvent.click(wrapper.instance);
            expect(onClick).toHaveBeenCalled();
            wrapper.unmount();
        });

        it("applies size classes correctly", async () => {
            const sizes = ["small", "medium", "large"] as const;

            for (const size of sizes) {
                const wrapper = mnt(GButton, {
                    props: { size },
                    slots: { default: () => "Button" },
                });

                await expect.element(wrapper.instance).toHaveClass(`g-btn--${size}`);
                wrapper.unmount();
            }
        });

        it("applies theme classes correctly", async () => {
            const themes = ["primary", "secondary", "accent", "danger"] as const;

            for (const theme of themes) {
                const wrapper = mnt(GButton, {
                    props: { theme },
                    slots: { default: () => "Button" },
                });

                await expect.element(wrapper.instance).toHaveClass(`g-btn--${theme}`);
                wrapper.unmount();
            }
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default props", async () => {
            await testAccessibility(GButton, {}, { default: () => "Click me" });
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
                       { default: () => "Button" }
                   );
               });
            });
        });

        it("passes accessibility tests with different sizes", async () => {
            const sizes = ["small", "medium", "large"] as const;

            for (const size of sizes) {
                await testAccessibility(GButton, { size }, { default: () => "Button" });
            }
        });

        it("passes accessibility tests with different themes", async () => {
            const themes = ["primary", "secondary", "accent", "danger"] as const;

            for (const theme of themes) {
                await testAccessibility(GButton, { theme }, { default: () => "Button" });
            }
        });

        it("passes accessibility tests with outlined variant", async () => {
            await testAccessibility(GButton, { outlined: true }, { default: () => "Button" });
        });

        it("passes accessibility tests with text variant", async () => {
            await testAccessibility(GButton, { text: true }, { default: () => "Button" });
        });
    });
});
