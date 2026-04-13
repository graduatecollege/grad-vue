import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { h, nextTick, ref } from "vue";
import GTreeMenu from "../packages/grad-vue/src/components/GTreeMenu.vue";
import GTreeMenuList from "../packages/grad-vue/src/components/tree-menu/GTreeMenuList.vue";
import GTreeMenuItem from "../packages/grad-vue/src/components/tree-menu/GTreeMenuItem.vue";
import { mnt, tabTo, testAccessibility } from "./test-utils";

/**
 * Helper that builds a slot-based GTreeMenu using render functions.
 * This mirrors the template-based usage:
 *
 *   <GTreeMenu heading="...">
 *     <GTreeMenuList>
 *       <GTreeMenuItem><a href="...">Label</a></GTreeMenuItem>
 *     </GTreeMenuList>
 *   </GTreeMenu>
 */
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

describe("GTreeMenu", () => {
    describe("Functional Tests", () => {
        it("renders with a title and flat items", async () => {
            const wrapper = slotMenu({ heading: "Navigation" }, [
                h(GTreeMenuItem, null, () => h("a", { href: "/" }, "Home")),
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "/about" }, "About"),
                ),
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "/contact" }, "Contact"),
                ),
            ]);

            await expect.element(wrapper.instance).toBeInTheDocument();
            await expect
                .element(page.getByRole("navigation", { name: "Navigation" }))
                .toBeVisible();
            await expect
                .element(wrapper.container.getByRole("link", { name: "Home" }))
                .toBeVisible();
            await expect
                .element(
                    wrapper.container.getByRole("link", { name: "Contact" }),
                )
                .toBeVisible();
        });

        it("renders nested items collapsed by default", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s2" }, "Section 1.2"),
                            ),
                        ],
                    },
                ),
            ]);

            await expect
                .element(
                    wrapper.container.getByRole("button", {
                        name: "Chapter 1 sub-menu",
                    }),
                )
                .toBeVisible();
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .not.toBeInTheDocument();
            await expect
                .element(wrapper.container.getByText("Section 1.2"))
                .not.toBeInTheDocument();
        });

        it("expanding an item reveals its children", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s2" }, "Section 1.2"),
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
            await expect
                .element(wrapper.container.getByText("Section 1.2"))
                .toBeVisible();
        });

        it("button aria-expanded updates on toggle", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            const btn = wrapper.container.getByRole("button", {
                name: "Chapter 1 sub-menu",
            });
            await expect.element(btn).toHaveAttribute("aria-expanded", "false");
            await btn.click();
            await expect.element(btn).toHaveAttribute("aria-expanded", "true");
            await btn.click();
            await expect.element(btn).toHaveAttribute("aria-expanded", "false");
        });

        it("multiple items can be expanded simultaneously", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
                h(
                    GTreeMenuItem,
                    { label: "Chapter 2" },
                    {
                        default: () => "Chapter 2",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch2/s1" }, "Section 2.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();
            await wrapper.container
                .getByRole("button", { name: "Chapter 2 sub-menu" })
                .click();

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
            await expect
                .element(wrapper.container.getByText("Section 2.1"))
                .toBeVisible();
        });

        it("collapsing hides children again", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            const btn = wrapper.container.getByRole("button", {
                name: "Chapter 1 sub-menu",
            });
            await btn.click();
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
            await btn.click();
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .not.toBeInTheDocument();
        });

        it("supports arbitrary depth — nested expand works", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 2" },
                    {
                        default: () => "Chapter 2",
                        children: () => [
                            h(
                                GTreeMenuItem,
                                { label: "Section 2.1" },
                                {
                                    default: () =>
                                        h(
                                            "a",
                                            { href: "/ch2/s1" },
                                            "Section 2.1",
                                        ),
                                    children: () => [
                                        h(GTreeMenuItem, null, () =>
                                            h(
                                                "a",
                                                { href: "/ch2/s1/ss1" },
                                                "Subsection 2.1.1",
                                            ),
                                        ),
                                    ],
                                },
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container
                .getByRole("button", { name: "Chapter 2 sub-menu" })
                .click();
            await wrapper.container
                .getByRole("button", { name: "Section 2.1 sub-menu" })
                .click();
            await expect
                .element(wrapper.container.getByText("Subsection 2.1.1"))
                .toBeVisible();
        });

        it("renders as <ol> when listType='ol'", async () => {
            const wrapper = slotMenu(
                { heading: "Contents" },
                [
                    h(GTreeMenuItem, null, () =>
                        h("a", { href: "#a" }, "Item A"),
                    ),
                ],
                { listType: "ol" },
            );
            const ol = wrapper.container.element()!.querySelector("ol");
            expect(ol).not.toBeNull();
        });

        it("renders as <ul> by default", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(GTreeMenuItem, null, () => h("a", { href: "#a" }, "Item A")),
            ]);
            const ul = wrapper.container.element()!.querySelector("ul");
            expect(ul).not.toBeNull();
        });

        it("parent items with a link render a toggle button alongside", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => h("a", { href: "/ch1" }, "Chapter 1"),
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s2" }, "Section 1.2"),
                            ),
                        ],
                    },
                ),
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "/ch2" }, "Chapter 2"),
                ),
            ]);

            await expect
                .element(
                    wrapper.container.getByRole("link", { name: "Chapter 1" }),
                )
                .toBeVisible();
            await expect
                .element(
                    wrapper.container.getByRole("button", {
                        name: /Chapter 1 sub-menu/i,
                    }),
                )
                .toBeVisible();
        });

        it("clicking chevron toggle expands a linked parent item", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => h("a", { href: "/ch1" }, "Chapter 1"),
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container
                .getByRole("button", { name: /Chapter 1 sub-menu/i })
                .click();
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
        });

        it("clicking the text area of a non-link parent item expands it", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .not.toBeInTheDocument();
            await wrapper.container.getByText("Chapter 1").click();
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
        });

        it("renders custom DOM inside items", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "#ch1" }, [
                        h("span", { class: "num" }, "Chapter 1"),
                        " ",
                        h("span", { class: "title" }, "Some Chapter Title"),
                    ]),
                ),
            ]);

            const link = wrapper.container
                .element()!
                .querySelector("a[href='#ch1']");
            expect(link).not.toBeNull();
            expect(link!.querySelector(".num")!.textContent).toBe("Chapter 1");
            expect(link!.querySelector(".title")!.textContent).toBe(
                "Some Chapter Title",
            );
        });
    });

    describe("Expanded Prop", () => {
        it("item with expanded=true starts expanded", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", expanded: true },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
            await expect
                .element(
                    wrapper.container.getByRole("button", {
                        name: "Chapter 1 sub-menu",
                    }),
                )
                .toHaveAttribute("aria-expanded", "true");
        });

        it("expanded prop does not affect leaf items", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(GTreeMenuItem, { expanded: true }, () =>
                    h("a", { href: "/" }, "Home"),
                ),
            ]);

            await expect
                .element(wrapper.container.getByRole("link", { name: "Home" }))
                .toBeVisible();
        });

        it("multiple items can start expanded independently", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", expanded: true },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
                h(
                    GTreeMenuItem,
                    { label: "Chapter 2", expanded: false },
                    {
                        default: () => "Chapter 2",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch2/s1" }, "Section 2.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
            await expect
                .element(wrapper.container.getByText("Section 2.1"))
                .not.toBeInTheDocument();
        });

        it("toggling a pre-expanded item collapses it", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", expanded: true },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();

            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .not.toBeInTheDocument();
        });

        it("nested items can start expanded", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", expanded: true },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(
                                GTreeMenuItem,
                                { label: "Section 1.1", expanded: true },
                                {
                                    default: () =>
                                        h(
                                            "a",
                                            { href: "/ch1/s1" },
                                            "Section 1.1",
                                        ),
                                    children: () => [
                                        h(GTreeMenuItem, null, () =>
                                            h(
                                                "a",
                                                { href: "/ch1/s1/ss1" },
                                                "Subsection 1.1.1",
                                            ),
                                        ),
                                    ],
                                },
                            ),
                        ],
                    },
                ),
            ]);

            await expect
                .element(wrapper.container.getByText("Subsection 1.1.1"))
                .toBeVisible();
        });

        it("updating expanded prop changes expanded state", async () => {
            const expanded = ref(false);
            const wrapper = mnt(GTreeMenu, {
                props: { heading: "Contents" },
                slots: {
                    default: () =>
                        h(GTreeMenuList, {}, {
                            default: () => [
                                h(
                                    GTreeMenuItem,
                                    { label: "Chapter 1", expanded: expanded.value },
                                    {
                                        default: () => "Chapter 1",
                                        children: () => [
                                            h(GTreeMenuItem, null, () =>
                                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                                            ),
                                        ],
                                    },
                                ),
                            ],
                        }),
                },
            });

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .not.toBeInTheDocument();

            expanded.value = true;
            await nextTick();

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
        });

        it("expanded item passes axe", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", expanded: true },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);
            await testAccessibility(wrapper.container.element() as HTMLElement);
        });
    });

    describe("Expand/Collapse Events", () => {
        it("GTreeMenuItem emits expand event when expanded", async () => {
            const onExpand = vi.fn();
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", onExpand },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();

            expect(onExpand).toHaveBeenCalledOnce();
        });

        it("GTreeMenuItem emits collapse event when collapsed", async () => {
            const onCollapse = vi.fn();
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", expanded: true, onCollapse },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();

            expect(onCollapse).toHaveBeenCalledOnce();
        });

        it("keyboard expand/collapse emits events on the item", async () => {
            const onExpand = vi.fn();
            const onCollapse = vi.fn();
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", onExpand, onCollapse },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowRight}");

            expect(onExpand).toHaveBeenCalledOnce();

            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowLeft}");

            expect(onCollapse).toHaveBeenCalledOnce();
        });

        it("clicking text area of non-link parent emits expand event", async () => {
            const onExpand = vi.fn();
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", onExpand },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container.getByText("Chapter 1").click();

            expect(onExpand).toHaveBeenCalledOnce();
        });
    });

    describe("Keyboard Navigation Tests", () => {
        it("ArrowDown moves focus to the next item", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
                h(
                    GTreeMenuItem,
                    { label: "Chapter 2" },
                    {
                        default: () => "Chapter 2",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch2/s1" }, "Section 2.1"),
                            ),
                        ],
                    },
                ),
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "/appendix" }, "Appendix"),
                ),
            ]);

            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowDown}");
            const focused = document.activeElement as HTMLElement;
            await expect.element(focused).toHaveTextContent("Chapter 2");
        });

        it("ArrowUp moves focus to the previous item", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
                h(
                    GTreeMenuItem,
                    { label: "Chapter 2" },
                    {
                        default: () => "Chapter 2",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch2/s1" }, "Section 2.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await tabTo("Chapter 2 sub-menu");
            await userEvent.keyboard("{ArrowUp}");
            const focused = document.activeElement as HTMLElement;
            await expect.element(focused).toHaveTextContent("Chapter 1");
        });

        it("ArrowRight expands a collapsed item", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowRight}");
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
        });

        it("ArrowRight on an expanded item moves to its first child", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowRight}");
            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowRight}");

            await expect
                .element(
                    wrapper.container.getByRole("link", {
                        name: "Section 1.1",
                    }),
                )
                .toHaveFocus();
        });

        it("ArrowLeft collapses an expanded item", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowRight}");
            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowLeft}");
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .not.toBeInTheDocument();
        });

        it("ArrowLeft on a collapsed item moves focus to its parent", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{ArrowRight}");
            await userEvent.keyboard("{ArrowRight}");
            await userEvent.keyboard("{ArrowLeft}");

            const focused = document.activeElement as HTMLElement;
            await expect.element(focused).toHaveTextContent("Chapter 1");
        });

        it("Home moves focus to the first item", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "/appendix" }, "Appendix"),
                ),
            ]);

            await tabTo("Appendix");
            await userEvent.keyboard("{Home}");

            const focused = document.activeElement as HTMLElement;
            await expect.element(focused).toHaveTextContent("Chapter 1");
        });

        it("End moves focus to the last visible item", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "/appendix" }, "Appendix"),
                ),
            ]);

            await tabTo("Chapter 1 sub-menu");
            await userEvent.keyboard("{End}");

            const focused = document.activeElement as HTMLElement;
            await expect.element(focused).toHaveTextContent("Appendix");
        });
    });

    describe("Session Storage", () => {
        const STORAGE_KEY = "test-tree-menu-storage";

        function menuWithStorage(storageKey: string) {
            return slotMenu({ heading: "Contents", storageKey }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
                h(
                    GTreeMenuItem,
                    { label: "Chapter 2" },
                    {
                        default: () => "Chapter 2",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch2/s1" }, "Section 2.1"),
                            ),
                        ],
                    },
                ),
            ]);
        }

        afterEach(() => {
            sessionStorage.removeItem(STORAGE_KEY);
        });

        it("items are collapsed by default when no stored state exists", async () => {
            const wrapper = menuWithStorage(STORAGE_KEY);
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .not.toBeInTheDocument();
        });

        it("expanding an item saves its state to sessionStorage", async () => {
            const wrapper = menuWithStorage(STORAGE_KEY);
            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();

            const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
            expect(stored["Chapter 1"]).toBe(true);
        });

        it("collapsing an item saves its state to sessionStorage", async () => {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ "Chapter 1": true }));
            const wrapper = menuWithStorage(STORAGE_KEY);
            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();

            const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
            expect(stored["Chapter 1"]).toBe(false);
        });

        it("restores expanded state from sessionStorage on mount", async () => {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ "Chapter 1": true }));
            const wrapper = menuWithStorage(STORAGE_KEY);
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
            await expect
                .element(wrapper.container.getByText("Section 2.1"))
                .not.toBeInTheDocument();
        });

        it("restores multiple expanded items from sessionStorage", async () => {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ "Chapter 1": true, "Chapter 2": true }),
            );
            const wrapper = menuWithStorage(STORAGE_KEY);
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
            await expect
                .element(wrapper.container.getByText("Section 2.1"))
                .toBeVisible();
        });

        it("without storageKey, items still collapse and expand normally", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();
            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
            expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
        });

        it("expanded prop is used as fallback when no stored state exists for the item", async () => {
            const wrapper = slotMenu({ heading: "Contents", storageKey: STORAGE_KEY }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", expanded: true },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .toBeVisible();
        });

        it("stored state takes precedence over expanded prop", async () => {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ "Chapter 1": false }));
            const wrapper = slotMenu({ heading: "Contents", storageKey: STORAGE_KEY }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1", expanded: true },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await expect
                .element(wrapper.container.getByText("Section 1.1"))
                .not.toBeInTheDocument();
        });
    });

    describe("Accessibility Tests", () => {
        it("flat list passes axe", async () => {
            const wrapper = slotMenu({ heading: "Navigation" }, [
                h(GTreeMenuItem, null, () => h("a", { href: "/" }, "Home")),
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "/about" }, "About"),
                ),
            ]);
            await testAccessibility(wrapper.container.element() as HTMLElement);
        });

        it("nested list (collapsed) passes axe", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);
            await testAccessibility(wrapper.container.element() as HTMLElement);
        });

        it("nested list (expanded) passes axe", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => "Chapter 1",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
                h(
                    GTreeMenuItem,
                    { label: "Chapter 2" },
                    {
                        default: () => "Chapter 2",
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch2/s1" }, "Section 2.1"),
                            ),
                        ],
                    },
                ),
            ]);

            await wrapper.container
                .getByRole("button", { name: "Chapter 1 sub-menu" })
                .click();
            await wrapper.container
                .getByRole("button", { name: "Chapter 2 sub-menu" })
                .click();

            await testAccessibility(wrapper.container.element() as HTMLElement);
        });

        it("linked parent items pass axe", async () => {
            const wrapper = slotMenu({ heading: "Contents" }, [
                h(
                    GTreeMenuItem,
                    { label: "Chapter 1" },
                    {
                        default: () => h("a", { href: "/ch1" }, "Chapter 1"),
                        children: () => [
                            h(GTreeMenuItem, null, () =>
                                h("a", { href: "/ch1/s1" }, "Section 1.1"),
                            ),
                        ],
                    },
                ),
            ]);
            await testAccessibility(wrapper.container.element() as HTMLElement);
        });

        it("ol list type passes axe", async () => {
            const wrapper = slotMenu(
                { heading: "Chapters" },
                [
                    h(
                        GTreeMenuItem,
                        { label: "Chapter 1" },
                        {
                            default: () => "Chapter 1",
                            children: () => [
                                h(GTreeMenuItem, null, () =>
                                    h("a", { href: "/ch1/s1" }, "Section 1.1"),
                                ),
                            ],
                        },
                    ),
                ],
                { listType: "ol" },
            );
            await testAccessibility(wrapper.container.element() as HTMLElement);
        });

        it("dark theme passes axe", async () => {
            const wrapper = slotMenu({ heading: "Navigation", theme: "dark" }, [
                h(GTreeMenuItem, null, () => h("a", { href: "/" }, "Home")),
                h(GTreeMenuItem, null, () =>
                    h("a", { href: "/about" }, "About"),
                ),
            ]);
            await testAccessibility(wrapper.container.element() as HTMLElement);
        });
    });
});
