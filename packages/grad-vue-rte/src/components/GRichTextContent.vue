<script setup lang="ts">
/**
 * Renders a JSON string of tiptap content as HTML.
 * Supports all formatting produced by GChatInput and GNoteInput:
 * bold, italic, ordered lists, and bullet lists.
 *
 * - Empty content is handled gracefully (renders nothing).
 * - Displays an error message when the content cannot be parsed or rendered.
 *
 * **Security note**: rendered HTML is produced by tiptap's `generateHTML`, which only
 * serialises recognised document nodes — it does not inject raw HTML from the JSON. Content
 * should still originate from a trusted tiptap editor (e.g. GChatInput / GNoteInput) rather
 * than arbitrary user-supplied strings.
 */
import { computed } from "vue";
import { useRichTextRenderer } from "../composables/useRichTextRenderer";

interface Props {
    /**
     * JSON-encoded tiptap content string to render.
     */
    content: string;
}

const props = defineProps<Props>();

const { html, hasError } = useRichTextRenderer(computed(() => props.content));
</script>

<template>
    <div class="g-rich-text-content-wrap">
        <div v-if="hasError" role="alert" class="g-rich-text-content-error">
            Failed to render content.
        </div>
        <div v-else-if="html" class="g-rich-text-content" v-html="html"></div>
    </div>
</template>

<style scoped>
.g-rich-text-content {
    p {
        margin: 0.375em 0;
    }

    > :first-child {
        margin-top: 0;
    }

    > :last-child {
        margin-bottom: 0;
    }

    ul,
    ol {
        padding: 0 1em;
        margin: 0.375em 1em 0 0.4em;

        li p {
            margin-top: 0;
            margin-bottom: 0;
        }
    }
}

.g-rich-text-content-error {
    color: var(--g-danger-700, #b91c1c);
    font-size: 0.875em;
}
</style>
