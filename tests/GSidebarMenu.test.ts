import { describe, expect, it } from "vitest";
import GSidebarMenu from "../packages/grad-vue/src/components/GSidebarMenu.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page } from "vitest/browser";

describe("GSidebarMenu", () => {
    const menuItems = [
        { label: "Home", href: "/" },
        { label: "About", href: "#about" },
    ];

    describe("Functional Tests", () => {
        it("renders with basic props", async () => {
            const wrapper = mnt(GSidebarMenu, {
                props: {
                    title: "Sidebar Menu",
                    items: menuItems,
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });
    });

    describe("Accessibility Tests", () => {
        it("with menu items", async () => {
            await testAccessibility(GSidebarMenu, {
                title: "Sidebar Menu",
                items: menuItems,
            });
        });
        it("with an active item", async () => {
            await testAccessibility(GSidebarMenu, {
                title: "Sidebar Menu",
                items: menuItems,
                spy: true,
                modelValue: "about",
            });
        });
        it("activeId should add aria-current", async () => {
            mnt(GSidebarMenu, {
                props: {
                    title: "Sidebar Menu",
                    items: menuItems,
                    spy: true,
                    modelValue: "about",
                },
            });

            await expect
                .element(page.getByRole("link", { name: "About" }))
                .toHaveAttribute("aria-current", "location");
        });
    });
});
