import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, provide } from "vue";
import { page, userEvent } from "vitest/browser";

import GHamburgerMenu from "../src/components/GHamburgerMenu.vue";
import GSidebar from "../src/components/GSidebar.vue";
import { useSidebar } from "../src/compose/useSidebar";
import { mnt, testAccessibility, tabTo } from "./test-utils";

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
