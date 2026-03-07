<script setup lang="ts">
/**
 * Renders a JSON string of tiptap content as HTML.
 * Supports all formatting produced by GChatInput and GNoteInput:
 * bold, italic, ordered lists, and bullet lists.
 *
 * - Empty content is handled gracefully (renders nothing).
 * - Displays an error message when the content cannot be parsed or rendered.
 *
 * The rendering only happens in the client when used with Nuxt.js.
 *
 * **Security note**: rendered HTML is produced by tiptap's `generateHTML`, which only
 * serializes recognized document nodes - it does not inject raw HTML from the JSON.
 *
 * **Note**: This component is part of the `@illinois-grad/grad-vue-rte` package, which includes Tiptap dependencies.
 */
import { toRef } from "vue";
import { useRichTextRenderer } from "../composables/useRichTextRenderer";

interface Props {
    /**
     * Error message when rendering fails
     */
    error?: string;

    // JSON-encoded tiptap content string to render.
    content: string;
}

const props = defineProps<Props>();

const contentRef = toRef(props, "content");

const { rendered, hasError } = useRichTextRenderer(contentRef);

</script>

<template>
    <div class="g-rich-text-content-wrap">
        <div v-if="hasError" role="alert" class="g-rich-text-content-error">
            {{ error || 'Failed to render content.' }}
        </div>
        <div v-else-if="rendered" class="g-rich-text-content" v-html="rendered"></div>
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
    color: var(--g-danger-700);
    font-size: 0.875em;
}
</style>
