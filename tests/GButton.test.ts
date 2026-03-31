import { describe, it, expect, vi } from "vitest";
import { h } from "vue";
import GButton from "../packages/grad-vue/src/components/GButton.vue";
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

            const btn = wrapper.instance;
            await expect.element(btn).toBeVisible();
            await expect.element(btn).toHaveAttribute("type", "button");
            await expect.element(btn).toHaveTextContent("Click me");
        });

        it("emits click event when clicked", async () => {
            const onClick = vi.fn();
            const wrapper = mnt(GButton, {
                props: { onClick },
                slots: { default: () => "Click me" },
            });

            await userEvent.click(wrapper.instance);
            expect(onClick).toHaveBeenCalled();
        });

        it("works with different sizes (renders and is clickable)", async () => {
            const sizes = ["small", "medium", "large"] as const;
            const dims: Record<string, { width: number; height: number }> = {};

            for (const size of sizes) {
                const wrapper = mnt(GButton, {
                    props: { size },
                    slots: { default: () => "Button" },
                });

                await expect.element(wrapper.instance).toBeVisible();

                const rect = wrapper.instance.element().getBoundingClientRect();
                dims[size] = { width: rect.width, height: rect.height };

                await userEvent.click(wrapper.instance);
            }

            expect(dims.small.height).toBeLessThan(dims.medium.height);
            expect(dims.medium.height).toBeLessThan(dims.large.height);
            expect(dims.small.width).toBeLessThan(dims.medium.width);
            expect(dims.medium.width).toBeLessThan(dims.large.width);
        });

        it("works with different themes (renders and is clickable)", async () => {
            const themes = [
                "primary",
                "secondary",
                "accent",
                "danger",
            ] as const;
            const colors: Record<string, string> = {};

            for (const theme of themes) {
                const wrapper = mnt(GButton, {
                    props: { theme },
                    slots: { default: () => "Button" },
                });

                await expect.element(wrapper.instance).toBeVisible();

                const style = window.getComputedStyle(wrapper.instance.element());
                colors[theme] = style.backgroundColor;

                await userEvent.click(wrapper.instance);
            }

            // Ensure themes have different background colors
            expect(colors.primary).not.toBe(colors.secondary);
            expect(colors.primary).not.toBe(colors.accent);
            expect(colors.primary).not.toBe(colors.danger);
            expect(colors.secondary).not.toBe(colors.accent);
            expect(colors.secondary).not.toBe(colors.danger);
            expect(colors.accent).not.toBe(colors.danger);
        });

        it("renders leading icon when icon class prop is provided", async () => {
            const wrapper = mnt(GButton, {
                props: { icon: "fa-solid fa-plus" },
                slots: { default: () => "Add" },
            });

            const icon = wrapper.instance
                .element()
                .querySelector(".fa-solid.fa-plus");
            expect(icon).toBeInTheDocument();
        });

        it("renders leading SVG when provided via icon slot", async () => {
            const { instance } = mnt(GButton, {
                slots: {
                    default: () => "Save",
                    icon: () =>
                        // minimal inline svg
                        h("svg", { viewBox: "0 0 10 10", role: "none" }, [
                            h("circle", {
                                cx: 5,
                                cy: 5,
                                r: 5,
                                fill: "currentColor",
                            }),
                        ]),
                },
            });

            await expect.element(instance.getByRole("none")).toBeVisible();
        });
    });

    describe("Accessibility Tests", () => {
        it("with default props", async () => {
            await testAccessibility(GButton, {}, { default: () => "Click me" });
        });

        describe.for(["small", "medium", "large"] as const)(
            "Size: %s",
            (size) => {
                describe.for([
                    "primary",
                    "secondary",
                    "accent",
                    "danger",
                ] as const)("Theme: %s", (theme) => {
                    it.for(["Outlined", "Text"])(
                        "Variant: %s",
                        async (variant) => {
                            await testAccessibility(
                                GButton,
                                {
                                    size,
                                    theme,
                                    outlined: variant === "Outlined",
                                    text: variant === "Text",
                                },
                                { default: () => "Button" },
                            );
                        },
                    );
                });
            },
        );

        it("with different sizes", async () => {
            const sizes = ["small", "medium", "large"] as const;

            for (const size of sizes) {
                await testAccessibility(
                    GButton,
                    { size },
                    { default: () => "Button" },
                );
            }
        });

        it("with different themes", async () => {
            const themes = [
                "primary",
                "secondary",
                "accent",
                "danger",
            ] as const;

            for (const theme of themes) {
                await testAccessibility(
                    GButton,
                    { theme },
                    { default: () => "Button" },
                );
            }
        });

        it("with outlined variant", async () => {
            await testAccessibility(
                GButton,
                { outlined: true },
                { default: () => "Button" },
            );
        });

        it("with text variant", async () => {
            await testAccessibility(
                GButton,
                { text: true },
                { default: () => "Button" },
            );
        });

        it("with SVG icon", async () => {
            await testAccessibility(
                GButton,
                {},
                {
                    default: () => "Save",
                    icon: () =>
                        // minimal inline svg
                        h("svg", { viewBox: "0 0 10 10", role: "none" }, [
                            h("circle", {
                                cx: 5,
                                cy: 5,
                                r: 5,
                                fill: "currentColor",
                            }),
                        ]),
                },
            );
        });
    });
});
