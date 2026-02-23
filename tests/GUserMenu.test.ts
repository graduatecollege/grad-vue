import { describe, it, expect } from "vitest";
import { page } from "vitest/browser";
import { h } from "vue";
import GUserMenu from "../packages/grad-vue/src/components/GUserMenu.vue";
import { mnt, testAccessibility } from "./test-utils";

const J = {
    props: {
        initials: "J",
        email: "j@example.com",
    },
    slots: {
        default: () => [
            h("a", { href: "/profile" }, "Profile"),
            h("a", { href: "/settings" }, "Settings"),
            h("button", { type: "button" }, "Logout"),
        ],
    },
};

describe("GUserMenu", () => {
    describe("Rendering", () => {
        it("renders avatar with initials", async () => {
            mnt(GUserMenu, J);

            const avatar = page.getByRole("button", { name: "User menu" });
            await expect.element(avatar).toBeVisible();
            await expect.element(avatar).toHaveTextContent("J");
        });

        it("uses custom label for accessibility", async () => {
            mnt(GUserMenu, {
                props: {
                    initials: "XY",
                    email: "user@example.com",
                    label: "Account menu",
                },
                slots: {
                    default: () => h("a", { href: "/profile" }, "Profile"),
                },
            });

            const avatar = page.getByRole("button", { name: "XY - Account menu" });
            await expect.element(avatar).toBeVisible();
        });
    });

    describe("Popover Interaction", () => {
        it("opens popover on button click", async () => {
            mnt(GUserMenu, J);

            const avatar = page.getByRole("button", { name: "User menu" });
            await avatar.click();

            // Check if popover is visible
            const dialog = page.getByRole("dialog");
            await expect.element(dialog).toBeVisible();

            // Check if email is displayed
            const email = page.getByRole("heading", {
                name: "j@example.com",
            });
            await expect.element(email).toBeVisible();
        });

        it("displays menu items in popover", async () => {
            mnt(GUserMenu, J);

            const avatar = page.getByRole("button", { name: "User menu" });
            await avatar.click();

            // Check if menu items are visible
            const profileLink = page.getByRole("link", { name: "Profile" });
            await expect.element(profileLink).toBeVisible();

            const settingsLink = page.getByRole("link", { name: "Settings" });
            await expect.element(settingsLink).toBeVisible();

            const logoutButton = page.getByRole("button", { name: "Logout" });
            await expect.element(logoutButton).toBeVisible();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with menu closed", async () => {
            await testAccessibility(
                GUserMenu,
                J.props,
                J.slots,
            );
        });

        it("passes accessibility tests with menu open", async () => {
            mnt(GUserMenu, {
                props: {
                    initials: "J",
                    email: "j@example.com",
                    color: "#005A9C"
                },
                slots: J.slots
            });

            const avatar = page.getByRole("button", { name: "User menu" });
            await avatar.click();

            // Wait for popover to be visible
            const dialog = page.getByRole("dialog");
            await expect.element(dialog).toBeVisible();
        });
    });
});
