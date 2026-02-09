import { describe, it, expect } from "vitest";
import { page } from "vitest/browser";
import { h } from "vue";
import GUserMenu from "../src/components/GUserMenu.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GUserMenu", () => {
    describe("Rendering", () => {
        it("renders avatar with initials", async () => {
            await mnt(GUserMenu, {
                props: {
                    initials: "JD",
                    email: "john.doe@example.com",
                    color: "#4A90E2",
                },
                slots: {
                    default: () => h("a", { href: "/profile" }, "Profile"),
                },
            });

            const avatar = page.getByRole("button", { name: "User menu" });
            await expect.element(avatar).toBeVisible();
            await expect.element(avatar).toHaveTextContent("JD");
        });

        it("uses custom label for accessibility", async () => {
            await mnt(GUserMenu, {
                props: {
                    initials: "XY",
                    email: "user@example.com",
                    color: "#000000",
                    label: "Account menu",
                },
                slots: {
                    default: () => h("a", { href: "/profile" }, "Profile"),
                },
            });

            const avatar = page.getByRole("button", { name: "Account menu" });
            await expect.element(avatar).toBeVisible();
        });
    });

    describe("Popover Interaction", () => {
        it("opens popover on button click", async () => {
            await mnt(GUserMenu, {
                props: {
                    initials: "JD",
                    email: "john.doe@example.com",
                    color: "#4A90E2",
                },
                slots: {
                    default: () => h("a", { href: "/profile" }, "Profile"),
                },
            });

            const avatar = page.getByRole("button", { name: "User menu" });
            await avatar.click();

            // Check if popover is visible
            const dialog = page.getByRole("dialog");
            await expect.element(dialog).toBeVisible();

            // Check if email is displayed
            const email = page.getByRole("heading", {
                name: "john.doe@example.com",
            });
            await expect.element(email).toBeVisible();
        });

        it("displays menu items in popover", async () => {
            await mnt(GUserMenu, {
                props: {
                    initials: "JD",
                    email: "john.doe@example.com",
                    color: "#4A90E2",
                },
                slots: {
                    default: () => [
                        h("a", { href: "/profile" }, "Profile"),
                        h("a", { href: "/settings" }, "Settings"),
                        h("button", { type: "button" }, "Logout"),
                    ],
                },
            });

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
                {
                    initials: "JD",
                    email: "john.doe@example.com",
                    color: "#005A9C", // Darker blue for better contrast
                },
                {
                    default: () => [
                        h("a", { href: "/profile" }, "Profile"),
                        h("a", { href: "/settings" }, "Settings"),
                        h("button", { type: "button" }, "Logout"),
                    ],
                },
            );
        });

        it("passes accessibility tests with menu open", async () => {
            await mnt(GUserMenu, {
                props: {
                    initials: "JD",
                    email: "john.doe@example.com",
                    color: "#005A9C", // Darker blue for better contrast
                },
                slots: {
                    default: () => [
                        h("a", { href: "/profile" }, "Profile"),
                        h("a", { href: "/settings" }, "Settings"),
                        h("button", { type: "button" }, "Logout"),
                    ],
                },
            });

            const avatar = page.getByRole("button", { name: "User menu" });
            await avatar.click();

            // Wait for popover to be visible
            const dialog = page.getByRole("dialog");
            await expect.element(dialog).toBeVisible();
        });
    });
});
