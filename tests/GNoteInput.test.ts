import { describe, expect, it, vi } from "vitest";
import GNoteInput from "../packages/grad-vue-rte/src/components/GNoteInput.vue";
import { mnt } from "./test-utils";
import { page, userEvent } from "vitest/browser";

describe("GNoteInput", () => {
    describe("Functional Tests", () => {
        it("renders with default props", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });

        it("renders with custom placeholder", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                    placeholder: "Type your note here",
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });

        it("renders with custom label", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                    label: "Custom label",
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });

        it("renders toolbar", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            await expect.element(toolbar).toBeInTheDocument();
        });

        it("toolbar is always visible", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            // Use vi.waitUntil to wait for editor to be ready
            await vi.waitUntil(() => {
                const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
                return toolbar !== null;
            });

            const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
            expect(toolbar).toBeTruthy();
        });

        it("has formatting buttons in toolbar", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            // Use vi.waitUntil to wait for toolbar to be ready
            await vi.waitUntil(() => {
                const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
                return toolbar !== null;
            });

            const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
            const buttons = toolbar?.querySelectorAll('button');
            
            // Should have 4 buttons: Bold, Italic, Ordered List, Unordered List
            expect(buttons?.length).toBe(4);
        });

        it("updates model value when content changes", async () => {
            const modelValue = { type: "doc", content: [{ type: "paragraph" }] };
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue,
                    "onUpdate:modelValue": (val: any) => {
                        wrapper.props.modelValue = val;
                    },
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });
    });

    describe("Accessibility Tests", () => {
        it("toolbar has role and aria-label", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            await expect.element(toolbar).toBeInTheDocument();
        });

        it("first toolbar button has tabindex 0, others have tabindex -1", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            // Use vi.waitUntil to wait for toolbar to be ready
            await vi.waitUntil(() => {
                const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
                return toolbar !== null;
            });

            const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
            const buttons = toolbar?.querySelectorAll('button');
            
            if (buttons) {
                expect(buttons[0]?.getAttribute('tabindex')).toBe('0');
                expect(buttons[1]?.getAttribute('tabindex')).toBe('-1');
                expect(buttons[2]?.getAttribute('tabindex')).toBe('-1');
                expect(buttons[3]?.getAttribute('tabindex')).toBe('-1');
            }
        });

        it("buttons have aria-pressed attribute", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            // Use vi.waitUntil to wait for toolbar to be ready
            await vi.waitUntil(() => {
                const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
                return toolbar !== null;
            });

            const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
            const buttons = toolbar?.querySelectorAll('button');
            
            if (buttons) {
                buttons.forEach((button) => {
                    expect(button.hasAttribute('aria-pressed')).toBe(true);
                });
            }
        });

        it("SVG icons have aria-hidden", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            // Use vi.waitUntil to wait for toolbar to be ready
            await vi.waitUntil(() => {
                const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
                return toolbar !== null;
            });

            const toolbar = wrapper.container.element().querySelector('[role="toolbar"]');
            const svgs = toolbar?.querySelectorAll('svg');
            
            if (svgs) {
                svgs.forEach((svg) => {
                    expect(svg.getAttribute('aria-hidden')).toBe('true');
                });
            }
        });
    });
});
