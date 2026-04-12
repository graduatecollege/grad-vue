import { describe, expect, it, afterEach } from "vitest";
import { defineCustomElement, h, nextTick } from "vue";
import { page, userEvent } from "vitest/browser";
import GTreeMenu from "../packages/grad-vue/src/components/GTreeMenu.vue";
import type { TreeMenuItem } from "../packages/grad-vue/src/components/tree-menu/GTreeMenuList.vue";
import { mnt, tabTo, testAccessibility } from "./test-utils";

const flatItems: TreeMenuItem[] = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

const nestedItems: TreeMenuItem[] = [
    {
        label: "Chapter 1",
        children: [
            { label: "Section 1.1", href: "/ch1/s1" },
            { label: "Section 1.2", href: "/ch1/s2" },
        ],
    },
    {
        label: "Chapter 2",
        children: [
            {
                label: "Section 2.1",
                href: "/ch2/s1",
                children: [
                    { label: "Subsection 2.1.1", href: "/ch2/s1/ss1" },
                    { label: "Subsection 2.1.2", href: "/ch2/s1/ss2" },
                ],
            },
            { label: "Section 2.2", href: "/ch2/s2" },
        ],
    },
    { label: "Appendix", href: "/appendix" },
];

// Items where parent nodes also carry links (href + children)
const linkedParentItems: TreeMenuItem[] = [
    {
        label: "Chapter 1",
        href: "/ch1",
        children: [
            { label: "Section 1.1", href: "/ch1/s1" },
            { label: "Section 1.2", href: "/ch1/s2" },
        ],
    },
    { label: "Chapter 2", href: "/ch2" },
];

describe("GTreeMenu", () => {
    describe("Functional Tests", () => {
        it("renders with a title and flat items", async () => {
            const wrapper = mnt(GTreeMenu, {
                props: { title: "Navigation", items: flatItems },
            });
            await expect.element(wrapper.instance).toBeInTheDocument();
            await expect.element(page.getByRole("navigation", { name: "Navigation" })).toBeVisible();
        });

        it("renders nested items collapsed by default", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            // Sections (children) should not yet be visible
            await expect.element(wrapper.container.getByText("Section 1.1")).not.toBeInTheDocument();
            await expect.element(wrapper.container.getByText("Section 1.2")).not.toBeInTheDocument();

            // Top-level chapter buttons must be visible
            await expect.element(wrapper.container.getByRole("button", { name: "Chapter 1" })).toBeVisible();
        });

        it("expanding an item reveals its children", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            await wrapper.container.getByRole("button", { name: "Chapter 1" }).click();

            await expect.element(wrapper.container.getByText("Section 1.1")).toBeVisible();
            await expect.element(wrapper.container.getByText("Section 1.2")).toBeVisible();
        });

        it("button aria-expanded updates on toggle", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            const btn = wrapper.container.getByRole("button", { name: "Chapter 1" });

            await expect.element(btn).toHaveAttribute("aria-expanded", "false");
            await btn.click();
            await expect.element(btn).toHaveAttribute("aria-expanded", "true");
            await btn.click();
            await expect.element(btn).toHaveAttribute("aria-expanded", "false");
        });

        it("multiple items can be expanded simultaneously", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            await wrapper.container.getByRole("button", { name: "Chapter 1" }).click();
            await wrapper.container.getByRole("button", { name: "Chapter 2" }).click();

            await expect.element(wrapper.container.getByText("Section 1.1")).toBeVisible();
            await expect.element(wrapper.container.getByText("Section 2.2")).toBeVisible();
        });

        it("collapsing hides children again", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            const btn = wrapper.container.getByRole("button", { name: "Chapter 1" });

            await btn.click(); // expand
            await expect.element(wrapper.container.getByText("Section 1.1")).toBeVisible();
            await btn.click(); // collapse
            await expect.element(wrapper.container.getByText("Section 1.1")).not.toBeInTheDocument();
        });

        it("supports arbitrary depth — nested expand works", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            await wrapper.container.getByRole("button", { name: "Chapter 2" }).click();
            // Section 2.1 has children, it is also a button
            await wrapper.container.getByRole("button", { name: "Section 2.1" }).click();

            await expect.element(wrapper.container.getByText("Subsection 2.1.1")).toBeVisible();
        });

        it("renders as <ol> when listType='ol'", async () => {
            const wrapper = mnt(GTreeMenu, {
                props: { items: flatItems, listType: "ol" },
            });
            const ol = wrapper.container.element()!.querySelector("ol");
            expect(ol).not.toBeNull();
        });

        it("renders as <ul> by default", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: flatItems } });
            const ul = wrapper.container.element()!.querySelector("ul");
            expect(ul).not.toBeNull();
        });

        it("parent items with href render both a toggle button and a link", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: linkedParentItems } });

            // The link for Chapter 1 should exist
            await expect.element(
                wrapper.container.getByRole("link", { name: "Chapter 1" }),
            ).toBeVisible();

            // A separate chevron toggle button should also exist
            await expect.element(
                wrapper.container.getByRole("button", { name: /Chapter 1 sub-menu/i }),
            ).toBeVisible();
        });

        it("clicking chevron toggle expands a linked parent item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: linkedParentItems } });

            await wrapper.container.getByRole("button", { name: /Chapter 1 sub-menu/i }).click();

            await expect.element(wrapper.container.getByText("Section 1.1")).toBeVisible();
        });
    });

    describe("Keyboard Navigation Tests", () => {

        it("ArrowDown moves focus to the next item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await tabTo("Chapter 1");

            await userEvent.keyboard("{ArrowDown}");

            await expect
                .element(wrapper.container.getByRole("button", { name: "Chapter 2" }))
                .toHaveFocus();
        });

        it("ArrowUp moves focus to the previous item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await tabTo("Chapter 2");
            await userEvent.keyboard("{ArrowUp}");

            await expect
                .element(wrapper.container.getByRole("button", { name: "Chapter 1" }))
                .toHaveFocus();
        });

        it("ArrowRight expands a collapsed item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await tabTo("Chapter 1");

            await userEvent.keyboard("{ArrowRight}");

            await expect.element(wrapper.container.getByText("Section 1.1")).toBeVisible();
        });

        it("ArrowRight on an expanded item moves to its first child", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            // Expand Chapter 1 by clicking so focus stays on the button.
            await tabTo("Chapter 1");
            await userEvent.keyboard("{ArrowRight}");

            await tabTo("Chapter 1");

            // Chapter 1 is now expanded — ArrowRight should move to first child.
            await userEvent.keyboard("{ArrowRight}");

            await expect
                .element(wrapper.container.getByRole("link", { name: "Section 1.1" }))
                .toHaveFocus();
        });

        it("ArrowLeft collapses an expanded item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            // Expand Chapter 1 by clicking so focus stays on the button.
            await tabTo("Chapter 1");
            await userEvent.keyboard("{ArrowRight}");

            // Re-focus Chapter 1 button.
            await tabTo("Chapter 1");

            // ArrowLeft on an expanded item collapses it.
            await userEvent.keyboard("{ArrowLeft}");
            await expect.element(wrapper.container.getByText("Section 1.1")).not.toBeInTheDocument();
        });

        it("ArrowLeft on a collapsed item moves focus to its parent", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await tabTo("Chapter 1");

            // Expand Chapter 1, then move into Section 1.1
            await userEvent.keyboard("{ArrowRight}");
            await userEvent.keyboard("{ArrowRight}");

            // Now ArrowLeft from Section 1.1 (which is a leaf) → should go to Chapter 1
            await userEvent.keyboard("{ArrowLeft}");

            await expect
                .element(wrapper.container.getByRole("button", { name: "Chapter 1" }))
                .toHaveFocus();
        });

        it("Home moves focus to the first item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            // Focus the last top-level item
            await tabTo("Appendix");

            await userEvent.keyboard("{Home}");

            await expect
                .element(wrapper.container.getByRole("button", { name: "Chapter 1" }))
                .toHaveFocus();
        });

        it("End moves focus to the last visible item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await tabTo("Chapter 1");

            await userEvent.keyboard("{End}");

            await expect
                .element(wrapper.container.getByRole("link", { name: "Appendix" }))
                .toHaveFocus();
        });
    });

    describe("Accessibility Tests", () => {
        it("flat list passes axe", async () => {
            await testAccessibility(GTreeMenu, {
                title: "Navigation",
                items: flatItems,
            });
        });

        it("nested list (collapsed) passes axe", async () => {
            await testAccessibility(GTreeMenu, {
                title: "Contents",
                items: nestedItems,
            });
        });

        it("nested list (expanded) passes axe", async () => {
            const wrapper = mnt(GTreeMenu, {
                props: { title: "Contents", items: nestedItems },
            });

            // Expand both chapters
            await wrapper.container.getByRole("button", { name: "Chapter 1" }).click();
            await wrapper.container.getByRole("button", { name: "Chapter 2" }).click();

            await testAccessibility(wrapper.container.element() as HTMLElement);
        });

        it("linked parent items pass axe", async () => {
            await testAccessibility(GTreeMenu, {
                title: "Contents",
                items: linkedParentItems,
            });
        });

        it("ol list type passes axe", async () => {
            await testAccessibility(GTreeMenu, {
                title: "Chapters",
                items: nestedItems,
                listType: "ol",
            });
        });

        it("dark theme passes axe", async () => {
            await testAccessibility(GTreeMenu, {
                title: "Navigation",
                items: flatItems,
                theme: "dark",
            });
        });
    });

    describe("Slot-based input", () => {
        function flatSlot() {
            return {
                default: () =>
                    h("ul", [
                        h("li", [h("a", { href: "/" }, "Home")]),
                        h("li", [h("a", { href: "/about" }, "About")]),
                        h("li", [h("a", { href: "/contact" }, "Contact")]),
                    ]),
            };
        }

        function nestedSlot() {
            return {
                default: () =>
                    h("ul", [
                        h("li", [
                            h("a", { href: "/ch1" }, "Chapter 1"),
                            h("ul", [
                                h("li", [h("a", { href: "/ch1/s1" }, "Section 1.1")]),
                                h("li", [h("a", { href: "/ch1/s2" }, "Section 1.2")]),
                            ]),
                        ]),
                        h("li", [h("a", { href: "/appendix" }, "Appendix")]),
                    ]),
            };
        }

        it("parses flat links from slot into items", async () => {
            const wrapper = mnt(GTreeMenu, { slots: flatSlot() });
            await expect.element(wrapper.container.getByRole("link", { name: "Home" })).toBeVisible();
            await expect.element(wrapper.container.getByRole("link", { name: "About" })).toBeVisible();
            await expect.element(wrapper.container.getByRole("link", { name: "Contact" })).toBeVisible();
        });

        it("parses nested ul from slot into hierarchical items", async () => {
            const wrapper = mnt(GTreeMenu, { slots: nestedSlot() });

            // Chapter 1 has children, so it should show a toggle button (the enhanced tree renders it)
            const btn = wrapper.container.getByRole("button", { name: /Chapter 1 sub-menu/i });
            await expect.element(btn).toBeVisible();

            // Section 1.1 should not yet be visible (collapsed by default)
            await expect.element(btn).toHaveAttribute("aria-expanded", "false");

            // Expand it
            await btn.click();

            // After expansion, Section 1.1 link becomes visible in the enhanced tree.
            // getByRole skips display:none elements so the hidden slot fallback won't interfere.
            await expect.element(wrapper.container.getByRole("link", { name: "Section 1.1" })).toBeVisible();
            await expect.element(wrapper.container.getByRole("link", { name: "Section 1.2" })).toBeVisible();
        });

        it("items prop takes priority over slot content", async () => {
            const propItems: TreeMenuItem[] = [{ label: "Prop Item", href: "/prop" }];
            const wrapper = mnt(GTreeMenu, {
                props: { items: propItems },
                slots: flatSlot(),
            });
            await expect
                .element(wrapper.container.getByRole("link", { name: "Prop Item" }))
                .toBeVisible();
            // Slot items should not appear in the interactive tree (Home comes from slot)
            const links = wrapper.container.element()!.querySelectorAll("[data-tree-primary]");
            const hrefs = Array.from(links).map((l) => (l as HTMLAnchorElement).getAttribute("href"));
            expect(hrefs).not.toContain("/");
        });

        it("slot fallback is hidden after mount and enhanced tree is visible", async () => {
            const wrapper = mnt(GTreeMenu, { slots: flatSlot() });

            // After mount the slot fallback should not be visible
            const fallback = wrapper.container.element()!.querySelector(".g-tree-menu__slot-fallback") as HTMLElement;
            expect(fallback).not.toBeNull();
            await expect.element(page.elementLocator(fallback)).not.toBeVisible();

            // The enhanced content should be visible and contain the parsed links
            await expect.element(wrapper.container.getByRole("link", { name: "Home" })).toBeVisible();
        });

        it("infers listType ol from an ol slot element", async () => {
            const wrapper = mnt(GTreeMenu, {
                slots: {
                    default: () =>
                        h("ol", [
                            h("li", [h("a", { href: "/a" }, "Item A")]),
                            h("li", [h("a", { href: "/b" }, "Item B")]),
                        ]),
                },
            });
            const ol = wrapper.container.element()!.querySelector("ol.g-tree-menu__list");
            expect(ol).not.toBeNull();
        });

        it("listType prop overrides slot-inferred type", async () => {
            const wrapper = mnt(GTreeMenu, {
                props: { listType: "ol" },
                slots: flatSlot(),
            });
            const ol = wrapper.container.element()!.querySelector("ol.g-tree-menu__list");
            expect(ol).not.toBeNull();
        });

        it("slot-based flat menu passes axe", async () => {
            await testAccessibility(GTreeMenu, { title: "Navigation" }, flatSlot());
        });

        it("slot-based nested menu passes axe", async () => {
            await testAccessibility(GTreeMenu, { title: "Contents" }, nestedSlot());
        });
    });

    describe("Web Components / Custom Elements mode", () => {
        const TAG = "g-tree-menu-wc-test";
        const ceElements: HTMLElement[] = [];

        afterEach(() => {
            ceElements.forEach((el) => el.remove());
            ceElements.length = 0;
        });

        function mountCE(innerHTML: string, props: Record<string, string> = {}): HTMLElement {
            if (!customElements.get(TAG)) {
                const CE = defineCustomElement(GTreeMenu as any, { shadowRoot: false });
                customElements.define(TAG, CE);
            }
            const el = document.createElement(TAG);
            for (const [k, v] of Object.entries(props)) {
                el.setAttribute(k, v);
            }
            el.innerHTML = innerHTML;
            document.body.appendChild(el);
            ceElements.push(el);
            return el;
        }

        it("parses flat slot list into the enhanced tree", async () => {
            const el = mountCE(`
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            `);
            await nextTick();
            const elLoc = page.elementLocator(el);
            await expect.element(elLoc.getByRole("link", { name: "Home" })).toBeVisible();
            await expect.element(elLoc.getByRole("link", { name: "About" })).toBeVisible();
            await expect.element(elLoc.getByRole("link", { name: "Contact" })).toBeVisible();
        });

        it("parses nested slot list with children", async () => {
            const el = mountCE(`
                <ul>
                    <li>
                        <a href="/ch1">Chapter 1</a>
                        <ul>
                            <li><a href="/ch1/s1">Section 1.1</a></li>
                            <li><a href="/ch1/s2">Section 1.2</a></li>
                        </ul>
                    </li>
                    <li><a href="/appendix">Appendix</a></li>
                </ul>
            `);
            await nextTick();
            const elLoc = page.elementLocator(el);

            const btn = elLoc.getByRole("button", { name: /Chapter 1 sub-menu/i });
            await expect.element(btn).toBeVisible();
            await expect.element(btn).toHaveAttribute("aria-expanded", "false");

            await btn.click();
            await expect.element(elLoc.getByRole("link", { name: "Section 1.1" })).toBeVisible();
            await expect.element(elLoc.getByRole("link", { name: "Section 1.2" })).toBeVisible();
        });

        it("infers listType ol from a top-level ol slot element", async () => {
            const el = mountCE(`
                <ol>
                    <li><a href="/a">Item A</a></li>
                    <li><a href="/b">Item B</a></li>
                </ol>
            `);
            await nextTick();
            const ol = el.querySelector("ol.g-tree-menu__list");
            expect(ol).not.toBeNull();
        });

        it("listType prop overrides slot-inferred type in CE mode", async () => {
            const el = mountCE(`
                <ul>
                    <li><a href="/a">Item A</a></li>
                </ul>
            `, { "list-type": "ol" });
            await nextTick();
            const ol = el.querySelector("ol.g-tree-menu__list");
            expect(ol).not.toBeNull();
        });

        it("supports data-to attribute for router links", async () => {
            const el = mountCE(`
                <ul>
                    <li><a href="#" data-to="/router-path">Router Link</a></li>
                </ul>
            `);
            await nextTick();
            const elLoc = page.elementLocator(el);
            await expect.element(elLoc.getByRole("link", { name: "Router Link" })).toBeVisible();
        });
    });
});
