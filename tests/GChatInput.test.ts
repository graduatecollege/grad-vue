import { describe, expect, it, vi } from "vitest";
import GChatInput from "../packages/grad-vue-rte/src/components/GChatInput.vue";
import { mnt, renderTipTapText, testAccessibility } from "./test-utils";
import { page, userEvent } from "vitest/browser";
import { ref } from "vue";

function mountExpandable(props: Record<string, unknown> = {}) {
    return mnt(GChatInput, {
        props: {
            modelValue: "",
            expandable: true,
            ...props,
        },
    });
}

describe("GChatInput", () => {
    describe("Functional Tests", () => {
        it("renders with default props", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });

        it("disables send button when no content", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                },
            });

            const sendButton = wrapper.instance.getByRole("button", {
                name: /send/i,
            });
            await expect.element(sendButton).toBeDisabled();
        });

        it("emits send event when send button is clicked", async () => {
            const onSend = vi.fn();
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [{ type: "text", text: "Hello" }],
                            },
                        ],
                    },
                    onSend,
                },
            });

            const sendButton = wrapper.instance.getByRole("button", {
                name: /send/i,
            });
            await userEvent.click(sendButton);

            expect(onSend).toHaveBeenCalled();
        });

        it("respects disabled prop", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: [{ type: "text", text: "Hello" }],
                            },
                        ],
                    },
                    disabled: true,
                },
            });

            const sendButton = wrapper.instance.getByRole("button", {
                name: /send/i,
            });
            await expect.element(sendButton).toBeDisabled();
        });

        it("updates model when text is typed in editor", async () => {
            const model = ref<any>("");
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                },
                model,
            });

            await expect.element(wrapper.instance).toBeInTheDocument();

            // Find the editor (contenteditable element)
            const editor = wrapper.container
                .element()
                .querySelector(".tiptap")!;

            // Type text into the editor
            await userEvent.click(editor as HTMLElement);
            await userEvent.keyboard("Hello World");

            // Wait for the model to update
            await vi.waitUntil(() => {
                return model.value && typeof model.value === "object";
            });

            // Verify the rendered text matches what was typed
            expect(model.value).toBeTruthy();
            const renderedText = renderTipTapText(model.value);
            expect(renderedText).toBe("Hello World");
        });

        it("only renders the expand control when enabled", async () => {
            const compact = mnt(GChatInput, {
                props: {
                    modelValue: "",
                },
            });

            await expect
                .element(
                    compact.instance.getByRole("button", {
                        name: "Expand editor",
                    }),
                )
                .not.toBeInTheDocument();

            const expandable = mountExpandable();
            const expandButton = expandable.instance.getByRole("button", {
                name: "Expand editor",
            });

            await expect
                .element(expandButton)
                .toHaveAttribute("aria-expanded", "false");
            await expect
                .element(expandButton)
                .toHaveAttribute("aria-keyshortcuts", "Control+Shift+F");

            const editor = compact.container.getByRole("textbox").element();
            const shortcutEvent = new KeyboardEvent("keydown", {
                key: "f",
                ctrlKey: true,
                shiftKey: true,
                bubbles: true,
                cancelable: true,
            });

            expect(editor.dispatchEvent(shortcutEvent)).toBe(true);
            await expect
                .element(compact.container.getByRole("dialog"))
                .not.toBeInTheDocument();
        });

        it("expands and collapses from the toggle button", async () => {
            const wrapper = mountExpandable({ label: "Message" });
            const expandButton = wrapper.instance.getByRole("button", {
                name: "Expand editor",
            });

            await userEvent.click(expandButton);

            const dialog = wrapper.container.getByRole("dialog", {
                name: "Message expanded",
            });
            await expect.element(dialog).toBeVisible();
            await expect
                .element(
                    wrapper.instance.getByRole("button", {
                        name: "Collapse editor",
                    }),
                )
                .toHaveAttribute("aria-expanded", "true");
            await expect
                .element(
                    wrapper.instance.getByRole("textbox", { name: "Message" }),
                )
                .toHaveFocus();

            await userEvent.click(
                wrapper.instance.getByRole("button", {
                    name: "Collapse editor",
                }),
            );

            await expect.element(dialog).not.toBeInTheDocument();
            await expect
                .element(
                    wrapper.instance.getByRole("button", {
                        name: "Expand editor",
                    }),
                )
                .toHaveFocus();
        });

        it("toggles with Ctrl+Shift+F only from the focused input", async () => {
            const first = mountExpandable({ label: "First message" });
            const second = mountExpandable({ label: "Second message" });
            const secondEditor = second.instance.getByRole("textbox", {
                name: "Second message",
            });

            await userEvent.click(secondEditor);
            await userEvent.keyboard("{Control>}{Shift>}f{/Shift}{/Control}");

            await expect
                .element(
                    second.container.getByRole("dialog", {
                        name: "Second message expanded",
                    }),
                )
                .toBeVisible();
            await expect
                .element(first.container.getByRole("dialog"))
                .not.toBeInTheDocument();
        });

        it("closes with Escape and restores focus to the toggle", async () => {
            const wrapper = mountExpandable();

            await userEvent.click(
                wrapper.instance.getByRole("button", {
                    name: "Expand editor",
                }),
            );
            await userEvent.keyboard("{Escape}");

            const expandButton = wrapper.instance.getByRole("button", {
                name: "Expand editor",
            });
            await expect
                .element(wrapper.container.getByRole("dialog"))
                .not.toBeInTheDocument();
            await expect.element(expandButton).toHaveFocus();
        });

        it("closes without blocking an outside pointer action", async () => {
            await page.viewport(1200, 800);
            const outsideAction = vi.fn();
            const outsideButton = document.createElement("button");
            outsideButton.textContent = "Outside action";
            outsideButton.addEventListener("click", outsideAction);
            document.body.appendChild(outsideButton);
            const wrapper = mountExpandable();

            await userEvent.click(
                wrapper.instance.getByRole("button", {
                    name: "Expand editor",
                }),
            );
            await userEvent.click(
                page.getByRole("button", {
                    name: "Outside action",
                }),
            );

            expect(outsideAction).toHaveBeenCalledOnce();
            await expect
                .element(wrapper.container.getByRole("dialog"))
                .not.toBeInTheDocument();
            await expect
                .element(page.getByRole("button", { name: "Outside action" }))
                .toHaveFocus();
        });

        it("traps keyboard focus while expanded", async () => {
            const wrapper = mountExpandable({
                modelValue: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", text: "Draft" }],
                        },
                    ],
                },
            });

            await userEvent.click(
                wrapper.instance.getByRole("button", {
                    name: "Expand editor",
                }),
            );
            await userEvent.keyboard("{Shift>}{Tab}{/Shift}");

            await expect
                .element(wrapper.instance.getByRole("button", { name: "Send" }))
                .toHaveFocus();

            await userEvent.keyboard("{Tab}");

            await expect
                .element(wrapper.instance.getByRole("textbox"))
                .toHaveFocus();
        });

        it("preserves draft content and send behavior while toggling", async () => {
            const model = ref<any>("");
            const onSend = vi.fn();
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                    expandable: true,
                    onSend,
                },
                model,
            });
            const editor = wrapper.instance.getByRole("textbox");

            await userEvent.click(editor);
            await userEvent.keyboard("A longer message");
            await userEvent.keyboard("{Control>}{Shift>}f{/Shift}{/Control}");
            await userEvent.click(
                wrapper.instance.getByRole("button", {
                    name: "Collapse editor",
                }),
            );

            expect(renderTipTapText(model.value)).toBe("A longer message");

            await userEvent.click(
                wrapper.instance.getByRole("button", { name: "Send" }),
            );

            expect(onSend).toHaveBeenCalledWith(model.value);
        });

        it("moves actions below the editor when content has multiple lines", async () => {
            const wrapper = mountExpandable();

            await expect.element(wrapper.instance).toBeInTheDocument();

            const editor = wrapper.instance.getByRole("textbox");
            const sendButton = wrapper.instance.getByRole("button", {
                name: "Send",
            });

            expect(
                sendButton.element().getBoundingClientRect().top,
            ).toBeLessThan(editor.element().getBoundingClientRect().bottom);

            await userEvent.click(editor);
            await userEvent.keyboard(
                "A first line{Shift>}{Enter}{/Shift}Second line",
            );

            await vi.waitUntil(() => {
                return (
                    sendButton.element().getBoundingClientRect().top >=
                    editor.element().getBoundingClientRect().bottom
                );
            });
        });

        it("caps the editor height at maxRows before scrolling", async () => {
            const short = mnt(GChatInput, {
                props: { modelValue: "", maxRows: 2 },
            });
            const tall = mnt(GChatInput, {
                props: { modelValue: "", maxRows: 8 },
            });

            const typeLines = async (wrapper: typeof short) => {
                const editor = wrapper.container.getByRole("textbox");
                await userEvent.click(editor);
                await userEvent.keyboard(
                    "One{Shift>}{Enter}{/Shift}Two{Shift>}{Enter}{/Shift}Three{Shift>}{Enter}{/Shift}Four",
                );
                return editor.element() as HTMLElement;
            };

            const shortEditor = await typeLines(short);
            const tallEditor = await typeLines(tall);

            await vi.waitUntil(
                () => shortEditor.scrollHeight > shortEditor.clientHeight,
            );
            expect(tallEditor.scrollHeight).toBeLessThanOrEqual(
                tallEditor.clientHeight,
            );
            expect(shortEditor.clientHeight).toBeLessThan(
                tallEditor.clientHeight,
            );
        });

        it("uses a desktop panel and a full-viewport mobile layout", async () => {
            await page.viewport(1200, 800);
            const wrapper = mountExpandable();

            await userEvent.click(
                wrapper.instance.getByRole("button", {
                    name: "Expand editor",
                }),
            );

            const dialog = wrapper.container.getByRole("dialog");
            const desktopRect = dialog.element().getBoundingClientRect();
            expect(desktopRect.width).toBe(768);
            expect(desktopRect.height).toBe(512);
            expect(desktopRect.right).toBe(1184);
            expect(desktopRect.bottom).toBe(784);

            await page.viewport(480, 700);

            const mobileRect = dialog.element().getBoundingClientRect();
            expect(mobileRect.top).toBe(0);
            expect(mobileRect.left).toBe(0);
            expect(mobileRect.width).toBe(480);
            expect(mobileRect.height).toBe(700);
        });
    });

    describe("Accessibility Tests", () => {
        it("SVG icons have aria-hidden", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                },
            });

            const sendButton = wrapper.instance.getByRole("button", {
                name: /send/i,
            });
            const svg = sendButton.getByRole("img", { includeHidden: true });

            await expect.element(svg).toHaveAttribute("aria-hidden", "true");
        });

        it("has no accessibility violations when expanded", async () => {
            const wrapper = mountExpandable({ label: "Message" });

            await userEvent.click(
                wrapper.instance.getByRole("button", {
                    name: "Expand editor",
                }),
            );

            await testAccessibility(wrapper.container.element());
        });
    });
});
