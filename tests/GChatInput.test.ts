import { describe, expect, it, vi } from "vitest";
import GChatInput from "../packages/grad-vue-rte/src/components/GChatInput.vue";
import { mnt } from "./test-utils";
import { page, userEvent } from "vitest/browser";
import { ref } from "vue";

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

            const sendButton = wrapper.instance.getByRole("button", { name: /send/i });
            await expect.element(sendButton).toBeDisabled();
        });

        it("emits send event when send button is clicked", async () => {
            const onSend = vi.fn();
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }] },
                    onSend,
                },
            });

            const sendButton = wrapper.instance.getByRole("button", { name: /send/i });
            await userEvent.click(sendButton);
            
            expect(onSend).toHaveBeenCalled();
        });

        it("respects disabled prop", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }] },
                    disabled: true,
                },
            });

            const sendButton = wrapper.instance.getByRole("button", { name: /send/i });
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
            const editor = wrapper.container.element().querySelector('.tiptap');
            expect(editor).toBeTruthy();

            // Type text into the editor
            await userEvent.click(editor as HTMLElement);
            await userEvent.keyboard("Hello World");

            // Wait for the model to update
            await vi.waitUntil(() => {
                return model.value && 
                    typeof model.value === 'object' && 
                    model.value.type === 'doc';
            });

            // Verify the model contains the typed text
            expect(model.value).toBeTruthy();
            expect(model.value.type).toBe('doc');
            expect(model.value.content).toBeTruthy();
            expect(model.value.content[0].content).toBeTruthy();
            expect(model.value.content[0].content[0].text).toBe('Hello World');
        });
    });

    describe("Accessibility Tests", () => {
        it("SVG icons have aria-hidden", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                },
            });

            const sendButton = wrapper.instance.getByRole("button", { name: /send/i });
            const svg = sendButton.element().querySelector('svg');
            
            expect(svg?.getAttribute('aria-hidden')).toBe('true');
        });
    });
});
