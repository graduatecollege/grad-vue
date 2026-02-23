<script lang="ts" setup>
import { nextTick, ref, toRaw, watch } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { ListKit } from "@tiptap/extension-list";
import { UndoRedo, Placeholder } from "@tiptap/extensions";
import { BubbleMenu } from "@tiptap/vue-3/menus";

defineOptions({ inheritAttrs: false });

type Props = {
    placeholder?: string;
    disabled?: boolean;
    maxRows?: number;
    label?: string;
};

const props = withDefaults(defineProps<Props>(), {
    placeholder: "Type a comment",
    label: "Comment input",
    disabled: false,
    maxRows: 5,
});
const model = defineModel<object | "">();
const emit = defineEmits<{ send: [content: object] }>();

const editor = useEditor({
    content: model.value || "",
    extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        ListKit,
        UndoRedo,
        Placeholder.configure({ placeholder: props.placeholder }),
    ],
    editorProps: {
        handleKeyDown(view, event) {
            if (editor.value && event.key === "Enter") {
                if (editor.value.isActive("orderedList") || editor.value.isActive("bulletList")) {
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
            "aria-label": props.label,
        },
    },
    onUpdate({ editor }) {
        model.value = editor.getJSON();
    },
});

watch(
    () => props.label,
    (val) => {
        if (editor.value) {
            editor.value?.setOptions({ editorProps: { attributes: { "aria-label": val } } });
        }
    },
);

watch(
    () => model.value,
    (val) => {
        if (editor.value && JSON.stringify(val) !== JSON.stringify(editor.value.getJSON())) {
            editor.value.commands.setContent(toRaw(val) || "");
        }
    }
);

function onSend(content: any) {
    if (content) {
        emit("send", content);
    }
}

function clickSend() {
    onSend(editor.value?.getJSON())
}

const inputRef = ref<HTMLInputElement | null>(null);

function focusInput() {
    editor.value?.commands?.focus();
}

defineExpose({ focusInput });
</script>

<template>
    <div class="g-chat-input-wrap">
        <BubbleMenu :editor="editor" v-if="editor">
            <div class="bubble-menu">
                <button
                    @click="editor.chain().focus().toggleBold().run()"
                    :class="{ bold: true, 'is-active': editor.isActive('bold') }"
                >
                    <span class="fa-solid fa-bold" aria-label="Bold"></span>
                </button>
                <button
                    @click="editor.chain().focus().toggleItalic().run()"
                    :class="{ italic: true, 'is-active': editor.isActive('italic') }"
                >
                    <span class="fa-solid fa-italic" aria-label="Italic"></span>
                </button>
                <button
                    @click="editor.chain().focus().toggleOrderedList().run()"
                    :class="{ italic: true, 'is-active': editor.isActive('orderedList') }"
                >
                    <span class="fa-solid fa-list-ol" aria-label="Ordered List"></span>
                </button>
                <button
                    @click="editor.chain().focus().toggleBulletList().run()"
                    :class="{ italic: true, 'is-active': editor.isActive('bulletList') }"
                >
                    <span class="fa-solid fa-list-ul" aria-label="Unordered List"></span>
                </button>
            </div>
        </BubbleMenu>
        <EditorContent :editor="editor" ref="inputRef" />
        <button
            class="g-chat-send-btn"
            :disabled="props.disabled || !model || (model && Object.keys(model).length === 0)"
            @click="clickSend"
            aria-label="Add comment"
        >
            <span class="fa-solid fa-paper-plane-top"></span>
        </button>
    </div>
</template>

<style>
.g-chat-input-wrap {
    .tiptap {
        background: var(--g-surface-0);
        border: 2px solid var(--g-primary-500);
        border-radius: 4px;
        padding: 0.15em 2.1rem 0.15em 0.5em;
        font-size: 15px;
        max-height: 10em;

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
    background-color: var(--g-surface-100);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    display: flex;

    button {
        background-color: unset;
        padding: 0.2rem 0.5rem;
        font-size: 0.875rem;

        &.bold {
            font-weight: 700;
        }
        &.italic {
            font-style: italic;
        }

        &:first-child {
            border-top-left-radius: 4px;
            border-bottom-left-radius: 4px;
        }
        &:last-child {
            border-top-right-radius: 4px;
            border-bottom-right-radius: 4px;
        }

        &.is-active {
            color: var(--g-accent-700);
            background-color: var(--g-surface-150);
        }

        &:hover {
            background-color: var(--g-primary-300);
            color: var(--g-primary-text);
        }
    }
}
.g-chat-input-wrap {
    position: relative;
    display: flex;
    align-items: flex-end;
    background: var(--g-surface-0);
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;
    padding: 0.15em 0 0.15em 0.5em;

    &:has(.g-chat-input:focus) {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--g-info-200);
        border-color: var(--g-info-200);
        outline: 2px solid var(--g-primary-500);
    }
}
.g-chat-input {
    flex: 1;
    resize: none;
    border: none;
    background: var(--g-surface-0);
    font-size: 0.9em;
    color: var(--g-surface-950);
    padding: 3px 0.1em 3px 0;
    min-height: 1.8em;
    max-height: 10em;
    line-height: 1.2em;
}
.g-chat-send-btn {
    position: absolute;
    bottom: 0.6em;
    right: 0.5em;
    color: var(--g-primary-500);
    font-size: 1em;
    border: 2px solid transparent;
    border-radius: 4px;
    padding: 0.3em 0.4em 0.2em;
    margin-left: 0.1em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover:not(:disabled) {
        color: var(--g-accent-700);
        text-decoration: underline;
        text-underline-offset: 2px;
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
