<script lang="ts" setup>
import { ref } from "vue";
import type { Editor } from "@tiptap/vue-3";
import { useToolbarNavigation } from "../composables/useToolbarNavigation";

interface Props {
    editor: Editor | undefined;
}

const props = defineProps<Props>();

const toolbarRef = ref<HTMLElement | null>(null);
const { handleToolbarKeyDown, getButtonTabIndex } = useToolbarNavigation(
    () => props.editor as any,
    toolbarRef,
);
</script>

<template>
    <div
        v-if="editor"
        class="g-rich-text-toolbar"
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
</template>

<style scoped>
.g-rich-text-toolbar {
    background-color: var(--g-surface-100);
    display: flex;

    button {
        background-color: unset;
        padding: 0.4rem 0.5rem;
        font-size: 0.875rem;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

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
    }
}
</style>
