import { describe, expect, it } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import GAppHeader from "../packages/grad-vue/src/components/GAppHeader.vue";
import { mnt, testAccessibility } from "./test-utils";

async function tick(vm: any) {
    await vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 20));
    await vm.$nextTick();
}

function mountHeader(props?: Record<string, any>) {
    return mnt(GAppHeader, {
        props,
        slots: {
            title: () => h("span", "Page Title"),
            navigation: () => [
                h("a", { href: "#students" }, "Students"),
                h("a", { href: "#hooders" }, "Hooders"),
            ],
            "app-controls": () => h("button", { type: "button" }, "Account"),
        },
    });
}

describe("GAppHeader", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            mnt(GAppHeader, {});
        });

        it("shows horizontal navigation on large screens", async () => {
            await page.viewport(1200, 800);
            mountHeader();

            await expect
                .element(
                    page.getByRole("navigation", { name: "Main navigation" }),
                )
                .toBeVisible();
            await expect
                .element(page.getByRole("link", { name: "Students" }))
                .toBeVisible();
            await expect
                .element(page.getByRole("button", { name: "Main navigation" }))
                .not.toBeInTheDocument();
        });

        it("replaces navigation with a hamburger menu on small screens", async () => {
            await page.viewport(600, 800);
            mountHeader();

            await expect
                .element(page.getByLabelText("Main navigation"))
                .toBeVisible();
            await expect
                .element(
                    page.getByRole("navigation", { name: "Main navigation" }),
                )
                .not.toBeInTheDocument();
        });

        it("keeps focus on the same link when collapsing into the hamburger menu", async () => {
            await page.viewport(1200, 800);
            const { vm } = mountHeader();

            page.getByRole("link", { name: "Hooders" }).element().focus();
            await expect
                .element(page.getByRole("link", { name: "Hooders" }))
                .toHaveFocus();

            await page.viewport(600, 800);
            await tick(vm);

            await expect
                .element(page.getByRole("link", { name: "Hooders" }))
                .toHaveFocus();
        });

        it("keeps focus on the same link when expanding back to the main navigation", async () => {
            await page.viewport(600, 800);
            const { vm } = mountHeader();

            await page.getByLabelText("Main navigation").click();
            await tick(vm);
            page.getByRole("link", { name: "Students" }).element().focus();
            await expect
                .element(page.getByRole("link", { name: "Students" }))
                .toHaveFocus();

            await page.viewport(1200, 800);
            await tick(vm);

            await expect
                .element(page.getByRole("link", { name: "Students" }))
                .toHaveFocus();
        });
    });

    describe("Accessibility Tests", () => {
        it("with title", async () => {
            await testAccessibility(
                GAppHeader,
                {},
                { title: () => h("span", "Application Title") },
            );
        });

        it("with navigation slot", async () => {
            await testAccessibility(
                GAppHeader,
                {},
                {
                    title: () => h("span", "App"),
                    navigation: () => h("a", { href: "/" }, "Home"),
                },
            );
        });
    });
});
