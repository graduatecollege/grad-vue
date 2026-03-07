import { describe, expect, it } from "vitest";
import GRichTextContent from "../packages/grad-vue-rte/src/components/GRichTextContent.vue";
import { mnt, testAccessibility } from "./test-utils";

const SIMPLE_JSON = JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "Hello World" }] }],
});

const FORMATTED_JSON = JSON.stringify({
    type: "doc",
    content: [
        { type: "paragraph", content: [{ type: "text", text: "Bold", marks: [{ type: "bold" }] }] },
        { type: "paragraph", content: [{ type: "text", text: "Italic", marks: [{ type: "italic" }] }] },
    ],
});

describe("GRichTextContent", () => {
    describe("Functional Tests", () => {
        it("renders content from a JSON string", async () => {
            const wrapper = mnt(GRichTextContent, {
                props: { content: SIMPLE_JSON },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
            await expect.element(wrapper.instance).toHaveTextContent("Hello World");
        });

        it("renders nothing for an empty string", async () => {
            const wrapper = mnt(GRichTextContent, {
                props: { content: "" },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
            // Root wrapper has no children when content is empty
            const el = wrapper.instance.element() as HTMLElement;
            expect(el.children.length).toBe(0);
        });

        it("renders an error message for invalid JSON", async () => {
            const wrapper = mnt(GRichTextContent, {
                props: { content: "not valid json" },
            });

            await expect.element(wrapper.instance.getByRole("alert")).toBeInTheDocument();
            await expect.element(wrapper.instance.getByRole("alert")).toHaveTextContent("Failed to render content.");
        });

        it("renders bold and italic marks", async () => {
            const wrapper = mnt(GRichTextContent, {
                props: { content: FORMATTED_JSON },
            });

            const el = wrapper.container.element() as HTMLElement;
            expect(el.querySelector("strong")).toBeTruthy();
            expect(el.querySelector("em")).toBeTruthy();
        });

        it("renders a bullet list", async () => {
            const listJson = JSON.stringify({
                type: "doc",
                content: [{
                    type: "bulletList",
                    content: [
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item 1" }] }] },
                        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item 2" }] }] },
                    ],
                }],
            });

            const wrapper = mnt(GRichTextContent, {
                props: { content: listJson },
            });

            const el = wrapper.container.element() as HTMLElement;
            expect(el.querySelector("ul")).toBeTruthy();
            expect(el.querySelectorAll("li").length).toBe(2);
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with content", async () => {
            await testAccessibility(GRichTextContent, { content: SIMPLE_JSON });
        });

        it("error message uses role=alert", async () => {
            const wrapper = mnt(GRichTextContent, {
                props: { content: "not valid json" },
            });

            await expect.element(wrapper.instance.getByRole("alert")).toBeInTheDocument();
        });
    });
});
