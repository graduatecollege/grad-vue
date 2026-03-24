import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import GTreeMenu from "../packages/grad-vue/src/components/GTreeMenu.vue";
import type { TreeMenuItem } from "../packages/grad-vue/src/components/GTreeMenu.vue";
import { mnt, testAccessibility } from "./test-utils";

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
        async function focusFirst(container: ReturnType<typeof mnt>["container"]) {
            const el = container.element()!.querySelector<HTMLElement>("[data-tree-primary]");
            el?.focus();
        }

        it("ArrowDown moves focus to the next item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await focusFirst(wrapper.container);

            await userEvent.keyboard("{ArrowDown}");

            await expect
                .element(wrapper.container.getByRole("button", { name: "Chapter 2" }))
                .toHaveFocus();
        });

        it("ArrowUp moves focus to the previous item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            // Focus the second item manually
            const buttons = wrapper.container.element()!.querySelectorAll<HTMLElement>("[data-tree-primary]");
            (buttons[1] as HTMLElement).focus();

            await userEvent.keyboard("{ArrowUp}");

            await expect
                .element(wrapper.container.getByRole("button", { name: "Chapter 1" }))
                .toHaveFocus();
        });

        it("ArrowRight expands a collapsed item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await focusFirst(wrapper.container);

            await userEvent.keyboard("{ArrowRight}");

            await expect.element(wrapper.container.getByText("Section 1.1")).toBeVisible();
        });

        it("ArrowRight on an expanded item moves to its first child", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            // Expand Chapter 1 by clicking so focus stays on the button.
            await wrapper.container.getByRole("button", { name: "Chapter 1" }).click();

            // Re-focus the Chapter 1 button.
            const ch1Btn = wrapper.container.element()!.querySelector<HTMLElement>(
                "[data-tree-primary]",
            );
            ch1Btn?.focus();

            // Chapter 1 is now expanded — ArrowRight should move to first child.
            await userEvent.keyboard("{ArrowRight}");

            await expect
                .element(wrapper.container.getByRole("link", { name: "Section 1.1" }))
                .toHaveFocus();
        });

        it("ArrowLeft collapses an expanded item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });

            // Expand Chapter 1 by clicking so focus stays on the button.
            await wrapper.container.getByRole("button", { name: "Chapter 1" }).click();
            await expect.element(wrapper.container.getByText("Section 1.1")).toBeVisible();

            // Re-focus Chapter 1 button.
            const ch1Btn = wrapper.container.element()!.querySelector<HTMLElement>(
                "[data-tree-primary]",
            );
            ch1Btn?.focus();

            // ArrowLeft on an expanded item collapses it.
            await userEvent.keyboard("{ArrowLeft}");
            await expect.element(wrapper.container.getByText("Section 1.1")).not.toBeInTheDocument();
        });

        it("ArrowLeft on a collapsed item moves focus to its parent", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await focusFirst(wrapper.container);

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
            const buttons = wrapper.container.element()!.querySelectorAll<HTMLElement>("[data-tree-primary]");
            (buttons[buttons.length - 1] as HTMLElement).focus();

            await userEvent.keyboard("{Home}");

            await expect
                .element(wrapper.container.getByRole("button", { name: "Chapter 1" }))
                .toHaveFocus();
        });

        it("End moves focus to the last visible item", async () => {
            const wrapper = mnt(GTreeMenu, { props: { items: nestedItems } });
            await focusFirst(wrapper.container);

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
});
