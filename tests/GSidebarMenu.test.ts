import { describe, expect, it } from "vitest";
import GSidebarMenu from "../src/components/GSidebarMenu.vue";
import { mnt, testAccessibility } from "./test-utils";
import { mount } from "@vue/test-utils";

describe("GSidebarMenu", () => {
    const menuItems = [
        { label: "Home", href: "/" },
        { label: "About", href: "#about" },
    ];

    describe("Functional Tests", () => {
        it("renders with basic props", () => {

            const wrapper = mnt(GSidebarMenu, {
                props: {
                    title: "Sidebar Menu",
                    items: menuItems
                }
            });

            expect(wrapper.exists()).toBe(true);
            wrapper.unmount();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with menu items", async () => {
            await testAccessibility(GSidebarMenu, {
                title: "Sidebar Menu",
                items: menuItems,
            });
        });
        it("passes accessibility tests with an active item", async () => {
            await testAccessibility(GSidebarMenu, {
                title: "Sidebar Menu",
                items: menuItems,
                spy: true,
                modelValue: "about",
            });
        });
        it("activeId should add aria-current", () => {
            const wrapper = mnt(GSidebarMenu, {
                props: {
                    title: "Sidebar Menu",
                    items: menuItems,
                    spy: true,
                    modelValue: "about"
                },
            });

            expect(wrapper.find("a[href='#about']").attributes("aria-current")).toBe("location");
        });
    });
});
