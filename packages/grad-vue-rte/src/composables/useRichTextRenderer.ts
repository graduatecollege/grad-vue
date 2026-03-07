import { computed, type Ref } from "vue";
import { generateHTML } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { ListKit } from "@tiptap/extension-list";

const extensions = [Document, Paragraph, Text, Bold, Italic, ListKit];

/**
 * Composable for rendering a JSON string of tiptap content to HTML.
 * Supports all extensions used by GChatInput and GNoteInput.
 *
 * @param content - A reactive ref or plain string containing JSON-encoded tiptap content
 * @returns `html` — rendered HTML string, empty string for empty content, or `null` when rendering fails;
 *          `hasError` — `true` when the content cannot be parsed or rendered
 */
export function useRichTextRenderer(content: Ref<string> | string) {
    const html = computed<string | null>(() => {
        const value = typeof content === "string" ? content : content.value;

        if (!value || value.trim() === "") {
            return "";
        }

        try {
            const parsed = JSON.parse(value);
            return generateHTML(parsed, extensions);
        } catch {
            return null;
        }
    });

    const hasError = computed(() => html.value === null);

    return { html, hasError };
}
