import { computed, onMounted, ref, type Ref, toValue, watch } from "vue";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { ListKit } from "@tiptap/extension-list";
import { generateHTML } from "@tiptap/core";

const extensions = [Document, Paragraph, Text, Bold, Italic, ListKit];

/**
 * Composable for rendering a JSON string of tiptap content to HTML.
 * Supports all extensions used by GChatInput and GNoteInput.
 *
 * @param content - A reactive ref or plain string containing JSON-encoded tiptap content
 * @returns `rendered` — rendered HTML string, empty string for empty content, or `null` when rendering fails;
 *          `hasError` — `true` when the content cannot be parsed or rendered
 */
export function useRichTextRenderer(content: Ref<string>) {
    const rendered = ref<string | null>("");

    onMounted(() => {
        watch(content, () => {
            const value = toValue(content);
            if (!value || value.trim() === "") {
                return "";
            }

            try {
                const parsed = JSON.parse(value);
                let html = generateHTML(
                    parsed,
                    extensions
                );
                rendered.value = html;
            } catch (error) {
                console.error("Failed to parse content:", value);
                console.error(error);
                rendered.value = null;
            }
        }, {immediate: true});
    });

    const hasError = computed(() => rendered.value === null);

    return { rendered, hasError };
}
