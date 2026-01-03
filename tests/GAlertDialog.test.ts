import { describe, expect, it, vi } from "vitest";
import GAlertDialog from "../src/components/GAlertDialog.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page, userEvent } from "vitest/browser";

describe("GAlertDialog", () => {
    describe("Functional Tests", () => {
        it("renders with default props", async () => {
            const wrapper = mnt(GAlertDialog, { teleport: true });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });
        it("renders with custom label", async () => {
            const wrapper = mnt(GAlertDialog, {
                props: {
                    label: "Hello Alert",
                },
                teleport: true,
            });
            await expect
                .element(page.getByRole("heading", { name: "Hello Alert" }))
                .toBeInTheDocument();
        });
        it("is visible when opened in a scrolled container", async (ctx) => {
            await page.viewport(420, 500);

            // Mount the GAlertDialog
            const { container, vm } = mnt(GAlertDialog, {
                teleport: true,
            });
            const containerElement = container.element();


            containerElement.style.height = "400px";
            containerElement.style.overflow = "scroll";

            const content = document.createElement("div");
            content.style.height = "1500px";
            containerElement.prepend(content);

            containerElement.scrollTop = 600;

            await vm.$nextTick();

            await expect
                .element(page.getByRole("alertdialog"))
                .toBeInViewport();
        });
        it("escape should cancel the dialog", async () => {
            const onCancel = vi.fn();
            const { vm } = mnt(GAlertDialog, {
                props: {
                    onCancel,
                },
                teleport: true,
            });
            await vm.$nextTick();
            await userEvent.keyboard("{Escape}");
            await vm.$nextTick();

            expect(onCancel).toHaveBeenCalled();
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            const wrapper = mnt(GAlertDialog, {
                teleport: true,
            });

            await testAccessibility(
                wrapper.container.element(),
                {},
                { default: () => "Alert message" },
            );
        });

        it("label should match accessible name", async () => {
            const wrapper = mnt(GAlertDialog, {
                slots: { default: () => "Are you sure?" },
                teleport: true,
            });
            await expect
                .element(page.getByRole("alertdialog"))
                .toHaveAccessibleName("Confirmation");
        });

        it("description should match content", async () => {
            const wrapper = mnt(GAlertDialog, {
                slots: { default: () => "Are you sure?" },
                teleport: true,
            });
            await expect
                .element(page.getByRole("alertdialog"))
                .toHaveAccessibleDescription("Are you sure?");
        });
    });
});
