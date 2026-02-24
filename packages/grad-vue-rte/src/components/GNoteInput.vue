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
import { ref, toRaw, watch } from "vue";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { ListKit } from "@tiptap/extension-list";
import { UndoRedo, Placeholder } from "@tiptap/extensions";

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

const toolbarRef = ref<HTMLElement | null>(null);
const activeButtonIndex = ref(0);

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
            editor.value?.setOptions({
                editorProps: {
                    attributes: {
                        "aria-label": val,
                    },
                },
            });
        }
    },
);

watch(
    () => model.value,
    (val) => {
        if (
            editor.value &&
            JSON.stringify(val) !== JSON.stringify(editor.value.getJSON())
        ) {
            editor.value.commands.setContent(toRaw(val) || "");
        }
    },
);

// Keyboard navigation for toolbar
function handleToolbarKeyDown(event: KeyboardEvent) {
    const toolbar = toolbarRef.value;
    if (!toolbar) return;

    const buttons = Array.from(
        toolbar.querySelectorAll("button"),
    ) as HTMLButtonElement[];
    const currentIndex = buttons.findIndex(
        (btn) => btn === document.activeElement,
    );

    // Handle Escape key - return focus to editor
    if (event.key === "Escape") {
        event.preventDefault();
        editor.value?.commands?.focus();
        return;
    }

    // Don't handle Tab - let it exit the toolbar naturally
    if (event.key === "Tab") {
        return;
    }

    let nextIndex = currentIndex;

    switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
            event.preventDefault();
            nextIndex =
                currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
            break;
        case "ArrowLeft":
        case "ArrowUp":
            event.preventDefault();
            nextIndex =
                currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
            break;
        case "Home":
            event.preventDefault();
            nextIndex = 0;
            break;
        case "End":
            event.preventDefault();
            nextIndex = buttons.length - 1;
            break;
        default:
            return;
    }

    // Update active button index and focus
    activeButtonIndex.value = nextIndex;
    buttons[nextIndex]?.focus();
}

// Get tabindex for a button based on roving tabindex pattern
function getButtonTabIndex(index: number): number {
    return index === activeButtonIndex.value ? 0 : -1;
}

function focusInput() {
    editor.value?.commands?.focus();
}

defineExpose({ focusInput });
</script>

<template>
    <div class="g-note-input-wrap">
        <div
            v-if="editor"
            class="toolbar"
            role="toolbar"
            aria-label="Text formatting"
            ref="toolbarRef"
            @keydown="handleToolbarKeyDown"
            tabindex="-1"
        >
            <button
                @click="editor.chain().focus().toggleBold().run()"
                :class="{
                    bold: true,
                    'is-active': editor.isActive('bold'),
                }"
                :aria-pressed="editor.isActive('bold')"
                title="Bold"
                aria-label="Bold"
                type="button"
                :tabindex="getButtonTabIndex(0)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        d="M0 64C0 46.3 14.3 32 32 32H80 96 224c70.7 0 128 57.3 128 128c0 31.3-11.3 60.1-30 82.3c37.1 22.4 62 63.1 62 109.7c0 70.7-57.3 128-128 128H96 80 32c-17.7 0-32-14.3-32-32s14.3-32 32-32H48V256 96H32C14.3 96 0 81.7 0 64zM224 224c35.3 0 64-28.7 64-64s-28.7-64-64-64H112V224H224zM112 288V416H256c35.3 0 64-28.7 64-64s-28.7-64-64-64H224 112z"
                    />
                </svg>
            </button>
            <button
                @click="editor.chain().focus().toggleItalic().run()"
                :class="{
                    italic: true,
                    'is-active': editor.isActive('italic'),
                }"
                :aria-pressed="editor.isActive('italic')"
                title="Italic"
                aria-label="Italic"
                type="button"
                :tabindex="getButtonTabIndex(1)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="16"
                    height="16"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        d="M128 64c0-17.7 14.3-32 32-32H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H293.3L160 416h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H90.7L224 96H160c-17.7 0-32-14.3-32-32z"
                    />
                </svg>
            </button>
            <button
                @click="editor.chain().focus().toggleOrderedList().run()"
                :class="{ 'is-active': editor.isActive('orderedList') }"
                :aria-pressed="editor.isActive('orderedList')"
                title="Ordered List"
                aria-label="Ordered List"
                type="button"
                :tabindex="getButtonTabIndex(2)"
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
                        d="M24 56c0-13.3 10.7-24 24-24H80c13.3 0 24 10.7 24 24V176h16c13.3 0 24 10.7 24 24s-10.7 24-24 24H48c-13.3 0-24-10.7-24-24s10.7-24 24-24H64V80H48C34.7 80 24 69.3 24 56zM86.7 341.2c-6.5-7.4-18.3-6.9-24 1.2L51.5 357.9c-7.7 10.8-22.7 13.3-33.5 5.6s-13.3-22.7-5.6-33.5l11.1-15.6c23.7-33.2 72.3-35.6 99.2-4.9c21.3 24.4 20.8 60.9-1.1 84.7L86.8 432H120c13.3 0 24 10.7 24 24s-10.7 24-24 24H48c-9.5 0-18.2-5.6-22-14.4s-2.1-18.9 4.3-25.9l72-78c5.3-5.8 5.4-14.6 .3-20.5zM224 64H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm0 160H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32z"
                    />
                </svg>
            </button>
            <button
                @click="editor.chain().focus().toggleBulletList().run()"
                :class="{ 'is-active': editor.isActive('bulletList') }"
                :aria-pressed="editor.isActive('bulletList')"
                title="Unordered List"
                aria-label="Unordered List"
                type="button"
                :tabindex="getButtonTabIndex(3)"
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
                        d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z"
                    />
                </svg>
            </button>
        </div>
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
    background-color: var(--g-surface-100);
    border-bottom: 1px solid var(--g-surface-200);
    display: flex;
    padding: 0.25rem;

    button {
        background-color: unset;
        padding: 0.4rem 0.5rem;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;

        &.bold {
            font-weight: 700;
        }
        &.italic {
            font-style: italic;
        }

        &.is-active {
            color: var(--g-accent-700);
            background-color: var(--g-surface-150);
        }

        &:hover {
            background-color: var(--g-primary-300);
            color: var(--g-primary-text);
        }

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
