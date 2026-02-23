import { describe, expect, it, vi } from "vitest";
import GChatInput from "../packages/grad-vue-rte/src/components/GChatInput.vue";
import { mnt } from "./test-utils";
import { page, userEvent } from "vitest/browser";

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

        it("renders with custom placeholder", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                    placeholder: "Type your message here",
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });

        it("renders with custom label", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                    label: "Custom label",
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
        });

        it("renders send button", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                },
            });

            const sendButton = wrapper.instance.getByRole("button", { name: "Add comment" });
            await expect.element(sendButton).toBeInTheDocument();
        });

        it("disables send button when no content", async () => {
            const wrapper = mnt(GChatInput, {
                props: {
                    modelValue: "",
                },
            });

            const sendButton = wrapper.instance.getByRole("button", { name: "Add comment" });
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

            const sendButton = wrapper.instance.getByRole("button", { name: "Add comment" });
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

            const sendButton = wrapper.instance.getByRole("button", { name: "Add comment" });
            await expect.element(sendButton).toBeDisabled();
        });
    });
});
