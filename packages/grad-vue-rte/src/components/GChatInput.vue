<script lang="ts" setup>
/**
 * The GChatInput component provides a rich text editing experience using Tiptap. It supports:
 *
 *  - **Bold** and *italic* text formatting
 *  - Bullet and numbered lists
 *  - Bubble menu for formatting (appears when text is selected)
 *  - Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line
 *  - Undo/redo support
 *
 *  **Note**: This component is part of the `@illinois-grad/grad-vue-rte` package, which includes Tiptap dependencies.
 */
import { computed } from "vue";
import { EditorContent } from "@tiptap/vue-3";
import { BubbleMenu } from "@tiptap/vue-3/menus";
import { useRichTextEditor } from "../composables/useRichTextEditor";
import GRichTextToolbar from "./editor/GRichTextToolbar.vue";

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
     * Maximum number of rows
     */
    maxRows?: number;
    /**
     * Accessible label
     */
    label?: string;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: "Type a comment",
    label: "Comment input",
    disabled: false,
    maxRows: 5,
});
const model = defineModel<object | "">();
const emit = defineEmits<{ send: [content: object] }>();

const { editor, focusEditor } = useRichTextEditor({
    content: model as any,
    placeholder: computed(() => props.placeholder),
    label: computed(() => props.label),
    editorProps: {
        handleKeyDown(view: any, event: any) {
            if (editor.value && event.key === "Enter") {
                if (
                    editor.value.isActive("orderedList") ||
                    editor.value.isActive("bulletList")
                ) {
                    return false;
                }
                if (!event.shiftKey) {
                    model.value = editor.value?.getJSON();
                    event.preventDefault();
                    onSend(editor.value?.getJSON());
                    return true;
                } else {
                    editor.value.commands.splitBlock();
                }
            }
            return false;
        },
        attributes: {
            "aria-keyshortcuts": "Shift+Enter",
        },
    },
});

function onSend(content: any) {
    if (content) {
        emit("send", content);
    }
}

function clickSend() {
    onSend(editor.value?.getJSON());
}

function focusInput() {
    focusEditor();
}

defineExpose({ focusInput });
</script>

<template>
    <div class="g-chat-input-wrap">
        <BubbleMenu :editor="editor" v-if="editor">
            <GRichTextToolbar :editor="editor" class="bubble-menu" />
        </BubbleMenu>
        <EditorContent :editor="editor" class="editor-content" />
        <button
            class="g-chat-send-btn"
            :disabled="
                props.disabled ||
                !model ||
                (model && Object.keys(model).length === 0)
            "
            @click="clickSend"
            title="Send"
            aria-label="Send"
            type="button"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
            >
                <path
                    d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                />
            </svg>
        </button>
    </div>
</template>

<style>
.g-chat-input-wrap {
    .tiptap {
        background: transparent;
        border: none;
        padding: 0.15em 0;
        font-size: 15px;
        max-height: 10em;
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
.bubble-menu {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    background-color: var(--g-surface-100);

    :deep(button) {
        &:first-child {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
        }
        &:last-child {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }
    }
}

.g-chat-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--g-surface-0);
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;
    padding: 0.5em;

    &:has(.ProseMirror-focused) {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--g-info-200);
        border-color: var(--g-info-200);
    }
}

.editor-content {
    flex: 1;
    min-width: 0;
}

.g-chat-send-btn {
    color: var(--g-primary-500);
    font-size: 1em;
    border: 2px solid transparent;
    border-radius: 4px;
    padding: 0.4em;
    margin: 0;
    align-self: flex-end;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    flex-shrink: 0;

    &:hover:not(:disabled) {
        color: var(--g-accent-700);
        background-color: var(--g-surface-100);
    }

    &:focus:not(:disabled) {
        background-color: var(--g-info-200);
        color: var(--g-primary-500);
    }

    &:active:not(:disabled) {
        background-color: var(--g-primary-500);
        color: var(--g-surface-0);
    }

    &:disabled {
        color: var(--g-surface-300);
        cursor: not-allowed;
    }
}
</style>
