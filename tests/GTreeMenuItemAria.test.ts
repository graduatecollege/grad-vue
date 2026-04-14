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
    it("should have aria-expanded on the link in the slot when it has children", async () => {
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

        await expect.element(wrapper.container.getByRole("link", { name: "Chapter 1" }))
            .toHaveAttribute("aria-expanded", "false");
    });

    it("should have aria-expanded on the button in the slot when it has children", async () => {
        const wrapper = slotMenu({ heading: "Contents" }, [
            h(
                GTreeMenuItem,
                { label: "Chapter 1" },
                {
                    default: () => h("button", { id: "ch1-btn" }, "Chapter 1"),
                    children: () => [
                        h(GTreeMenuItem, null, () =>
                            h("a", { href: "#ch1/s1" }, "Section 1.1"),
                        ),
                    ],
                },
            ),
        ]);

        const btnInSlot = wrapper.container.getByRole("button", { name: "Chapter 1" });
        await expect.element(btnInSlot).toHaveAttribute("aria-expanded", "false");
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

    it("should have aria-expanded on the link when it's wrapped in another element", async () => {
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

        const link = wrapper.container.getByRole("link", { name: "Chapter 1" });
        await expect.element(link).toHaveAttribute("aria-expanded", "false");
    });

    it("should have aria-expanded on the button when it's wrapped in another element", async () => {
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

        const btn = wrapper.container.getByRole("button", { name: "Chapter 1" });
        await expect.element(btn).toHaveAttribute("aria-expanded", "false");
    });

    it("should have aria-expanded on the button when it contains nested elements", async () => {
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

        const btn = wrapper.container.getByRole("button", { name: "Chapter 1" });
        await expect.element(btn).toHaveAttribute("aria-expanded", "false");
    });

    it("should have aria-expanded on the link when it's deeply nested", async () => {
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
        await expect.element(link).toHaveAttribute("aria-expanded", "false");
    });

    it("should handle multiple focusable elements by picking the first one", async () => {
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

        await expect.element(firstBtn).toHaveAttribute("aria-expanded", "false");
        await expect.element(secondLink).not.toHaveAttribute("aria-expanded");
    });
});
