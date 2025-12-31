import { describe, expect, it, vi } from "vitest";
import GAlertDialog from "../src/components/GAlertDialog.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page, userEvent } from "vitest/browser";

describe("GAlertDialog", () => {
    describe("Functional Tests", () => {
        it("renders with default props", async () => {
            const wrapper = mnt(GAlertDialog, { teleport: true });

            await expect.element(wrapper.instance).toBeInTheDocument();
            wrapper.unmount();
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
            wrapper.unmount();
        });
        it("is visible when opened in a scrolled container", async (ctx) => {
            await page.viewport(420, 500);

            // Mount the GAlertDialog
            const { container, unmount, vm } = mnt(GAlertDialog, {
                teleport: true,
            });

            container.style.height = "400px";
            container.style.overflow = "scroll";

            const content = document.createElement("div");
            content.style.height = "1500px";
            container.prepend(content);

            container.scrollTop = 600;

            await vm.$nextTick();

            await expect
                .element(page.getByRole("alertdialog"))
                .toBeInViewport();
            unmount();
        });
        it("escape should cancel the dialog", async () => {
            const onCancel = vi.fn();
            const { container, unmount, vm } = mnt(GAlertDialog, {
                props: {
                    onCancel,
                },
                teleport: true,
            });
            await vm.$nextTick();
            await userEvent.keyboard("{Escape}");
            await vm.$nextTick();

            expect(onCancel).toHaveBeenCalled();

            unmount();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default props", async () => {
            const wrapper = mnt(GAlertDialog, {
                teleport: true,
            });

            await testAccessibility(
                wrapper.container,
                {},
                { default: () => "Alert message" },
            );

            wrapper.unmount();
        });

        it("label should match accessible name", async () => {
            const wrapper = mnt(GAlertDialog, {
                slots: { default: () => "Are you sure?" },
                teleport: true,
            });
            await expect
                .element(page.getByRole("alertdialog"))
                .toHaveAccessibleName("Confirmation");
            wrapper.unmount();
        });

        it("description should match content", async () => {
            const wrapper = mnt(GAlertDialog, {
                slots: { default: () => "Are you sure?" },
                teleport: true,
            });
            await expect
                .element(page.getByRole("alertdialog"))
                .toHaveAccessibleDescription("Are you sure?");
            wrapper.unmount();
        });
    });
});
