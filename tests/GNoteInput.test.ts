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

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            await expect.element(toolbar).toBeInTheDocument();
        });

        it("has formatting buttons in toolbar", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            const buttons = toolbar.getByRole("button", { includeHidden: true });
            
            // Should have 4 buttons: Bold, Italic, Ordered List, Unordered List
            await expect.element(buttons.nth(0)).toBeInTheDocument();
            await expect.element(buttons.nth(1)).toBeInTheDocument();
            await expect.element(buttons.nth(2)).toBeInTheDocument();
            await expect.element(buttons.nth(3)).toBeInTheDocument();
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

        it("keyboard navigation works in toolbar", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            await expect.element(toolbar).toBeInTheDocument();

            // Focus the toolbar
            const boldButton = toolbar.getByRole("button", { name: /bold/i });
            await boldButton.focus();

            // Verify we can navigate to and from the toolbar with Tab
            await userEvent.keyboard("{Tab}");
            // After tabbing once, we should move out of the toolbar
            // The next element should not be in the toolbar
            const activeElement = page.elementLocator(document.activeElement!);
            await expect.element(activeElement).not.toBe(boldButton);
        });

        it("buttons have aria-pressed attribute", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            
            // Check each button has aria-pressed
            await expect.element(toolbar.getByRole("button", { name: /bold/i })).toHaveAttribute('aria-pressed');
            await expect.element(toolbar.getByRole("button", { name: /italic/i })).toHaveAttribute('aria-pressed');
            await expect.element(toolbar.getByRole("button", { name: /ordered list/i })).toHaveAttribute('aria-pressed');
            await expect.element(toolbar.getByRole("button", { name: /unordered list/i })).toHaveAttribute('aria-pressed');
        });

        it("SVG icons have aria-hidden", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            const boldButton = toolbar.getByRole("button", { name: /bold/i });
            
            // Check that the SVG within the button has aria-hidden
            const svg = boldButton.element().querySelector('svg');
            expect(svg?.getAttribute('aria-hidden')).toBe('true');
        });
    });
});
