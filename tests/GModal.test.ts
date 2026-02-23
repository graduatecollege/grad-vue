import { describe, expect, it, vi } from "vitest";
import GModal from "../packages/grad-vue/src/components/GModal.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page, userEvent } from "vitest/browser";
import { h } from "vue";

describe("GModal", () => {
    describe("Functional Tests", () => {
        it("renders with basic props", async () => {
            const wrapper = mnt(GModal, {
                props: {
                    label: "Default Modal",
                },
                teleport: true,
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });
        it("renders with custom label", async () => {
            const wrapper = mnt(GModal, {
                props: {
                    label: "Hello Modal",
                },
                teleport: true,
            });
            await expect
                .element(page.getByRole("heading", { name: "Hello Modal" }))
                .toBeInTheDocument();
        });
        it("close event is emitted when clicking close button", async () => {
            const onClose = vi.fn();
            mnt(GModal, {
                props: {
                    label: "Hello Modal",
                    onClose,
                },
                teleport: true,
            });

            await userEvent.click(page.getByRole("button", { name: "Close" }));
            expect(onClose).toHaveBeenCalled();
        });
        it("escape should close the modal", async () => {
            const onClose = vi.fn();
            const { vm } = mnt(GModal, {
                props: {
                    label: "Hello Modal",
                    onClose,
                },
                teleport: true,
            });
            await vm.$nextTick();
            await userEvent.keyboard("{Escape}");
            await vm.$nextTick();

            expect(onClose).toHaveBeenCalled();
        });

        it("locks body scrolling when open", async () => {
            mnt(GModal, {
                props: {
                    label: "Scroll Lock Modal",
                },
                teleport: true,
            });

            expect(document.body.classList.contains("g-scroll-lock")).toBe(
                true,
            );
        });

        it("unlocks body scrolling when unmounted", async () => {
            const { app } = mnt(GModal, {
                props: {
                    label: "Scroll Lock Modal",
                },
                teleport: true,
            });

            expect(document.body.classList.contains("g-scroll-lock")).toBe(
                true,
            );
            app.unmount();
            expect(document.body.classList.contains("g-scroll-lock")).toBe(
                false,
            );
        });

        it("open dialog should focus the heading", async () => {
            const { instance } = mnt(GModal, {
                props: {
                    label: "Focus Modal",
                },
                teleport: true,
            });

            await expect.element(instance.getByRole("heading")).toHaveFocus();
        })

        it("adding a popover focus attribute should focus that element", async () => {
            const { instance } = mnt(GModal, {
                props: {
                    label: "Focus Modal",
                },
                slots: {
                    default: () =>
                        h(
                            "button",
                            {
                                "popover-focus": true,
                                type: "button",
                            },
                            "Focus Me",
                        ),
                },
                teleport: true,
            });

            await expect
                .element(instance.getByRole("button", { name: "Focus Me" }))
                .toHaveFocus();
        });
    });

    describe("Size Tests", () => {
        it.each(["small", "medium", "large", "full"])(
            "applies %s size class",
            async (size) => {
                const wrapper = mnt(GModal, {
                    props: {
                        label: "Size Modal",
                        size: size as any,
                    },
                    teleport: true,
                });

                await expect
                    .element(page.getByRole("dialog"))
                    .toHaveClass(`g-modal--${size}`);
            },
        );
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            const wrapper = mnt(GModal, {
                teleport: true,
                props: {
                    label: "Hello Modal",
                },
            });

            await testAccessibility(
                wrapper.container.element(),
                {},
                { default: () => "Modal content" },
            );
        });

        it("label should match accessible name", async () => {
            mnt(GModal, {
                slots: { default: () => "Content" },
                props: {
                    label: "Hello Modal",
                },
                teleport: true,
            });
            await expect
                .element(page.getByRole("dialog"))
                .toHaveAccessibleName("Hello Modal");
        });
    });
});
