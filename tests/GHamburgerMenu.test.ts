import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide } from "vue";
import { page, userEvent } from "vitest/browser";

import GHamburgerMenu from "../packages/grad-vue/src/components/GHamburgerMenu.vue";
import GSidebar from "../packages/grad-vue/src/components/GSidebar.vue";
import { useSidebar } from "../packages/grad-vue/src/compose/useSidebar";
import { mnt, testAccessibility, tabTo } from "./test-utils";

const globalScope = globalThis as typeof globalThis & {
    __GRAD_VUE_WC_SIDEBAR_CHANNELS__?: Map<string, unknown>;
};

async function tick(vm: any) {
    await vm.$nextTick();
    // `useSidebar` closes on a short `setTimeout(5)` after click/focus.
    await new Promise((r) => setTimeout(r, 10));
    await vm.$nextTick();
}


function mountFixture() {
    const Fixture = defineComponent({
        name: "HamburgerSidebarFixture",
        setup() {
            const sidebar = useSidebar();
            provide("sidebar", sidebar);

            return () =>
                h("div", { class: "fixture" }, [
                    h("main", { class: "fixture__main" }, [
                        h(GHamburgerMenu, {
                            label: "Main Navigation",
                        }),
                    ]),
                    h(
                        GSidebar,
                        {
                            theme: "light",
                            topOffset: "0",
                            width: "240px",
                        },
                        {
                            default: () => [
                                h(
                                    "a",
                                    {
                                        href: "#first",
                                    },
                                    "First link",
                                ),
                                h(
                                    "button",
                                    {
                                        type: "button",
                                    },
                                    "Sidebar button",
                                ),
                                h(
                                    "a",
                                    {
                                        href: "#last",
                                    },
                                    "Last link",
                                ),
                            ],
                        },
                    ),
                    h(
                        "button",
                        {
                            type: "button",
                            style: {
                                position: "fixed",
                                left: "320px",
                                top: "12px",
                                zIndex: "1",
                            },
                        },
                        "Outside",
                    ),
                ]);
        },
    });

    return mnt(Fixture);
}

describe("GHamburgerMenu", () => {
    beforeEach(() => {
        delete globalScope.__GRAD_VUE_WC_SIDEBAR_CHANNELS__;
    });

    afterEach(() => {
        delete globalScope.__GRAD_VUE_WC_SIDEBAR_CHANNELS__;
    });

    describe("Functional Tests", () => {
        it("Large viewport doesn't collapse the sidebar", async () => {
            await page.viewport(1200, 800);
            const { container } = mountFixture();

            await expect.element(container.getByText("First link")).toBeVisible();
        });

        it("Large viewport hides hamburger menu button", async () => {
            await page.viewport(1200, 800);
            const { container } = mountFixture();

            await expect.element(container.getByLabelText("Main Navigation")).not.toBeVisible();
        });

        it("Small viewport collapses sidebar", async () => {
            await page.viewport(600, 800);
            const { container } = mountFixture();

            await expect.element(container.getByText("First link")).not.toBeVisible();
        });

        it("Small viewport shows hamburger menu button", async () => {
            await page.viewport(600, 800);
            const { container } = mountFixture();

            const hamburger = container.getByLabelText("Main Navigation");
            await expect.element(hamburger).toBeVisible();
        });

        it("Clicking hamburger menu shows the sidebar", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await container.getByLabelText("Main Navigation").click();
            await tick(vm);

            await expect.element(container.getByText("First link")).toBeVisible();
        });

        it("Pressing escape after clicking closes the sidebar", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await container.getByLabelText("Main Navigation").click();
            await tick(vm);

            await userEvent.keyboard("{Escape}");
            await tick(vm);

            await expect.element(container.getByText("First link")).not.toBeVisible();
        });

        it("Clicking anywhere outside of the sidebar closes the sidebar", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await container.getByLabelText("Main Navigation").click();
            await tick(vm);

            await container.getByRole("button", { name: "Outside" }).click();
            await tick(vm);

            await expect.element(container.getByText("First link")).not.toBeVisible();
        });

        it("Focusing and activating the hamburger menu shows the sidebar", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await tabTo("Main Navigation");
            await userEvent.keyboard("{Enter}");
            await tick(vm);
            await expect.element(container.getByText("First link")).toBeVisible();
        });

        it("Focusing, activating and then tabbing moves focus into the sidebar", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await tabTo("Main Navigation");
            await userEvent.keyboard("{Enter}");
            await userEvent.keyboard("{Tab}");
            await expect
                .element(container.getByRole("link", { name: "First link" }))
                .toHaveFocus();
        });

        it("Pressing escape with focus in the sidebar closes it", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await container.getByLabelText("Main Navigation").click();

            await tabTo("First link");

            await userEvent.keyboard("{Escape}");
            await tick(vm);

            await expect.element(container.getByText("First link")).not.toBeVisible();
        });

        it("Pressing escape with focus in the sidebar moves focus to hamburger menu button", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await container.getByLabelText("Main Navigation").click();
            await tick(vm);

            await tabTo("First link");

            await userEvent.keyboard("{Escape}");
            await tick(vm);

            await expect
                .element(
                    container.getByLabelText("Main Navigation"),
                )
                .toHaveFocus();
        });

        it("Moving focus past the end of the content in the sidebar closes the sidebar", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await tabTo("Main Navigation");
            await userEvent.keyboard("{Enter}");

            await tabTo("Outside");
            await tick(vm);

            await expect
                .element(container.getByRole("button", { name: "Outside" }))
                .toHaveFocus();

            await expect.element(container.getByText("First link")).not.toBeVisible();
        });

        it("Clicking the hamburger menu button while the sidebar is open closes it and keeps it closed", async () => {
            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            const hamburger = container.getByLabelText("Main Navigation");
            const element = hamburger.element();

            // Open it
            await hamburger.click();
            await tick(vm);
            await expect.element(container.getByText("First link")).toBeVisible();

            // Close it with a delay between mousedown and click to ensure document listener doesn't interfere
            element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
            await new Promise((r) => setTimeout(r, 20));
            element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
            element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            await tick(vm);

            await expect.element(container.getByText("First link")).not.toBeVisible();
        });

    });

    describe("Visible label", () => {
        it("Does not render visible label by default", async () => {
            await page.viewport(600, 800);
            const { container } = mnt(GHamburgerMenu, { props: { label: "Main Navigation" } });

            await expect.element(container.getByText("Main Navigation", { exact: true })).not.toBeInTheDocument();
        });

        it("Renders visible label when labelVisible is true", async () => {
            await page.viewport(600, 800);
            const { container } = mnt(GHamburgerMenu, {
                props: { label: "Main Navigation", labelVisible: true },
            });

            await expect.element(container.getByText("Main Navigation", { exact: true })).toBeInTheDocument();
        });

        it("Visible label shows the provided label text", async () => {
            await page.viewport(600, 800);
            const { container } = mnt(GHamburgerMenu, {
                props: { label: "Open Menu", labelVisible: true },
            });

            await expect.element(container.getByText("Open Menu", { exact: true })).toBeInTheDocument();
            // The accessible name should still match the label.
            await expect.element(container.getByLabelText("Open Menu")).toBeInTheDocument();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with open sidebar", async () => {

            await page.viewport(600, 800);
            const { vm, container } = mountFixture();

            await container.getByLabelText("Main Navigation").click();
            await tick(vm);

            await testAccessibility(
                container.element(),
                { label: "Hamburger Menu" },
                { default: "<p>Example content</p>" },
            );
        });
    });
});
