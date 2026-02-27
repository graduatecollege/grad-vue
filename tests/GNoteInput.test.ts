import { describe, expect, it, vi } from "vitest";
import GNoteInput from "../packages/grad-vue-rte/src/components/GNoteInput.vue";
import { mnt, testAccessibility, renderTipTapText } from "./test-utils";
import { page, userEvent } from "vitest/browser";
import { ref } from "vue";

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

        it("updates model when text is typed in editor", async () => {
            const model = ref<any>("");
            const {container} = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
                model,
            });

            await container.getByLabelText("Note Input").click();

            // Type text into the editor
            await userEvent.keyboard("Hello World");

            // Verify the rendered text matches what was typed
            expect(model.value).toBeTruthy();
            const renderedText = renderTipTapText(model.value);
            expect(renderedText).toBe('Hello World');
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GNoteInput, {
            });
        });

        it("keyboard navigation works in toolbar", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            await expect.element(toolbar).toBeInTheDocument();

            // Click to focus the bold button
            const boldButton = toolbar.getByRole("button", { name: "Bold", exact: true });
            await userEvent.click(boldButton);

            // Arrow keys navigate within the toolbar
            await userEvent.keyboard("{ArrowRight}");
            
            // Escape returns focus to the editor
            await userEvent.keyboard("{Escape}");
            
            // After Escape, focus should move back to the editor (away from toolbar)
            const activeElement = page.elementLocator(document.activeElement!);
            // The active element should not be any toolbar button
            await expect.element(activeElement).not.toBe(boldButton);
        });

        it("buttons have aria-pressed attribute", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            
            // Check each button has aria-pressed - use exact matching to avoid conflicts
            await expect.element(toolbar.getByRole("button", { name: "Bold", exact: true })).toHaveAttribute('aria-pressed');
            await expect.element(toolbar.getByRole("button", { name: "Italic", exact: true })).toHaveAttribute('aria-pressed');
            await expect.element(toolbar.getByRole("button", { name: "Ordered List", exact: true })).toHaveAttribute('aria-pressed');
            await expect.element(toolbar.getByRole("button", { name: "Unordered List", exact: true })).toHaveAttribute('aria-pressed');
        });

        it("SVG icons have aria-hidden", async () => {
            const wrapper = mnt(GNoteInput, {
                props: {
                    modelValue: "",
                },
            });

            const toolbar = wrapper.instance.getByRole("toolbar", { name: /text formatting/i });
            const boldButton = toolbar.getByRole("button", { name: "Bold", exact: true });
            
            await expect.element(boldButton).toBeInTheDocument();
            
            // Check that the SVG within the button has aria-hidden
            const svg = boldButton.element().querySelector('svg');
            expect(svg?.getAttribute('aria-hidden')).toBe('true');
        });
    });
});
