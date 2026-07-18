import { describe, expect, it } from "vitest";
import { h } from "vue";
import GTreeMenu from "../packages/grad-vue/src/components/GTreeMenu.vue";
import GTreeMenuList from "../packages/grad-vue/src/components/tree-menu/GTreeMenuList.vue";
import GTreeMenuItem from "../packages/grad-vue/src/components/tree-menu/GTreeMenuItem.vue";
import { mnt } from "./test-utils";

function slotMenu(
    menuProps: Record<string, any>,
    listChildren: any[],
    listProps?: Record<string, any>,
) {
    return mnt(GTreeMenu, {
        props: menuProps,
        slots: {
            default: () =>
                h(GTreeMenuList, listProps ?? {}, {
                    default: () => listChildren,
                }),
        },
    });
}

describe("GTreeMenuItem", () => {
    it("should expose a disclosure button when the item has children", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => h("a", { href: "#ch1", id: "ch1-link" }, "Chapter 1"),
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        await expect.element(wrapper.container.getByRole("button", { name: "Child items for Chapter 1" }))
            .toHaveAttribute("aria-expanded", "false");
    });

    it("should keep the slotted link free of disclosure state", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => h("a", { href: "#ch1", id: "ch1-link" }, "Chapter 1"),
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        const linkInSlot = wrapper.container.getByRole("link", { name: "Chapter 1" });
        await expect.element(linkInSlot).not.toHaveAttribute("aria-expanded");
    });

    it("should NOT have aria-expanded on the link when it has NO children", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                {},
                {
                    default: () => h("a", { href: "#home", id: "home-link" }, "Home"),
                },
            ),
        ]);

        const link = wrapper.container.getByRole("link", { name: "Home" });
        await expect.element(link).not.toHaveAttribute("aria-expanded");
    });

    it("should keep disclosure state on the dedicated toggle when the link is wrapped", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => h("div", null, [
                        h("a", { href: "#ch1", id: "ch1-link" }, "Chapter 1"),
                    ]),
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        await expect.element(wrapper.container.getByRole("button", { name: "Child items for Chapter 1" }))
            .toHaveAttribute("aria-expanded", "false");
    });

    it("should keep disclosure state on the dedicated toggle when the button is wrapped", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => h("span", null, [
                        h("button", null, "Chapter 1"),
                    ]),
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        await expect.element(wrapper.container.getByRole("button", { name: "Child items for Chapter 1" }))
            .toHaveAttribute("aria-expanded", "false");
    });

    it("should keep nested button content separate from disclosure semantics", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => h("button", null, [
                        h("span", { class: "label-text" }, "Chapter 1"),
                    ]),
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        const btn = wrapper.container.getByRole("button", { name: "Chapter 1", exact: true });
        await expect.element(btn).not.toHaveAttribute("aria-expanded");
        await expect.element(wrapper.container.getByRole("button", { name: "Child items for Chapter 1" }))
            .toHaveAttribute("aria-expanded", "false");
    });

    it("should keep deeply nested link content separate from disclosure semantics", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => h("div", null, [
                        h("div", null, [
                            h("a", { href: "#ch1" }, [
                                h("strong", null, "Chapter 1"),
                            ]),
                        ]),
                    ]),
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        const link = wrapper.container.getByRole("link", { name: "Chapter 1" });
        await expect.element(link).not.toHaveAttribute("aria-expanded");
        await expect.element(wrapper.container.getByRole("button", { name: "Child items for Chapter 1" }))
            .toHaveAttribute("aria-expanded", "false");
    });

    it("should keep disclosure state off multiple slotted focusable elements", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => [
                        h("button", { id: "first" }, "Primary Action"),
                        h("a", { href: "#secondary", id: "second" }, "Secondary Link"),
                    ],
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        const firstBtn = wrapper.container.getByRole("button", { name: "Primary Action" });
        const secondLink = wrapper.container.getByRole("link", { name: "Secondary Link" });

        await expect.element(firstBtn).not.toHaveAttribute("aria-expanded");
        await expect.element(secondLink).not.toHaveAttribute("aria-expanded");
        await expect.element(wrapper.container.getByRole("button", { name: "Child items for Chapter 1" }))
            .toHaveAttribute("aria-expanded", "false");
    });

    it("should expose the chevron as a real button for assistive technology", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => h("a", { href: "#ch1" }, "Chapter 1"),
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        const root = wrapper.container.element() as HTMLElement;
        const toggle = root.querySelector(".g-tree-menu__toggle-btn");
        const chevron = root.querySelector(".g-tree-menu__chevron");

        expect(toggle?.tagName).toBe("BUTTON");
        expect(toggle?.getAttribute("aria-expanded")).toBe("false");
        expect(toggle?.getAttribute("aria-label")).toBe("Child items for Chapter 1");
        expect(chevron?.getAttribute("aria-hidden")).toBe("true");
        expect(chevron?.getAttribute("focusable")).toBe("false");
    });
});
