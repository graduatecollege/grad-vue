<script lang="ts" setup>
/**
 * The GNoteInput component provides a rich text editing experience using Tiptap for writing notes. It supports:
 *
 *  - **Bold** and *italic* text formatting
 *  - Bullet and numbered lists
 *  - Always visible toolbar for formatting
 *  - Undo/redo support
 *
 *  **Note**: This component is part of the `@illinois-grad/grad-vue-rte` package, which includes Tiptap dependencies.
 */
import { computed } from "vue";
import { EditorContent } from "@tiptap/vue-3";
import { useRichTextEditor } from "../composables/useRichTextEditor";
import GRichTextToolbar from "./GRichTextToolbar.vue";

defineOptions({ inheritAttrs: false });

interface Props {
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Disabled
     */
    disabled?: boolean;
    /**
     * Accessible label
     */
    label?: string;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: "Write a note...",
    label: "Note input",
    disabled: false,
});
const model = defineModel<object | "">();

const { editor, focusEditor } = useRichTextEditor({
    content: model,
    placeholder: computed(() => props.placeholder),
    label: computed(() => props.label),
});

function focusInput() {
    focusEditor();
}

defineExpose({ focusInput });
</script>

<template>
    <div class="g-note-input-wrap">
        <GRichTextToolbar :editor="editor" class="toolbar" />
        <EditorContent :editor="editor" class="editor-content" />
    </div>
</template>

<style>
.g-note-input-wrap {
    .tiptap {
        background: transparent;
        border: none;
        padding: 0.5em;
        font-size: 15px;
        min-height: 12em;
        flex: 1;
        outline: none;

        p {
            margin: 0.375em 0 0;
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
        p.is-editor-empty:first-child::before {
            color: var(--g-surface-600);
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }
    }
}
</style>

<style scoped>
.g-note-input-wrap {
    display: flex;
    flex-direction: column;
    background: var(--g-surface-0);
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;

    &:has(.ProseMirror-focused) {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--g-info-200);
        border-color: var(--g-info-200);
    }
}

.toolbar {
    border-bottom: 1px solid var(--g-surface-200);
    padding: 0.25rem;

    :deep(button) {
        border-radius: 4px;

        &:focus {
            outline: 2px solid var(--g-primary-500);
            outline-offset: 2px;
        }
    }
}

.editor-content {
    flex: 1;
    min-width: 0;
}
</style>
