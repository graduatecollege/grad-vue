<script lang="ts">
/**
 * The GChatInput component provides a rich text editing experience using Tiptap. It supports:
 *
 *  - **Bold** and *italic* text formatting
 *  - Bullet and numbered lists
 *  - Bubble menu for formatting (appears when text is selected)
 *  - Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line
 *  - Optional expanded composer toggled with <kbd>Ctrl+Shift+F</kbd>
 *  - Undo/redo support
 *
 *  **Note**: This component is part of the `@illinois-grad/grad-vue-rte` package, which includes Tiptap dependencies.
 */
export default {};
</script>

<script lang="ts" setup>
import {
    computed,
    nextTick,
    onWatcherCleanup,
    ref,
    useId,
    useTemplateRef,
    watch,
} from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import { EditorContent } from "@tiptap/vue-3";
import { BubbleMenu } from "@tiptap/vue-3/menus";
import { useRichTextEditor } from "../composables/useRichTextEditor";
import GRichTextToolbar from "./editor/GRichTextToolbar.vue";

defineOptions({ inheritAttrs: false });

type Props = {
    /**
     * Placeholder text
     * @demo
     */
    placeholder?: string;
    /**
     * Disabled
     * @demo
     */
    disabled?: boolean;
    /**
     * Maximum number of text rows shown before the editor scrolls
     * @demo
     */
    maxRows?: number;
    /**
     * Accessible label
     * @demo
     */
    label?: string;
    /**
     * Allow the editor to expand into a large viewport overlay
     * @demo
     */
    expandable?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    placeholder: "Type a comment",
    label: "Comment input",
    disabled: false,
    maxRows: 5,
    expandable: false,
});
const model = defineModel<object | "">();
const emit = defineEmits<{ send: [content: object | undefined | null] }>();
const expanded = ref(false);
const multiline = ref(false);
const composer = useTemplateRef<HTMLElement>("composer");
const expandButton = useTemplateRef<HTMLButtonElement>("expandButton");
const actions = useTemplateRef<HTMLElement>("actions");
const composerId = `g-chat-input-${useId()}`;
const actionsBelow = computed(() => expanded.value || multiline.value);
const composerWidth = ref(0);
const maxRowsStyle = computed(() => ({
    "--g-chat-input-max-rows": String(
        Number.isFinite(props.maxRows) ? Math.max(1, props.maxRows) : 1,
    ),
}));

const { editor, focusEditor } = useRichTextEditor({
    content: model,
    placeholder: computed(() => props.placeholder),
    label: computed(() => props.label),
    multiline: true,
    editorProps: {
        handleKeyDown(view: any, event: KeyboardEvent) {
            if (editor.value && event.key === "Enter") {
                if (
                    editor.value.isActive("orderedList") ||
                    editor.value.isActive("bulletList")
                ) {
                    return false;
                }
                if (!event.shiftKey) {
                    const content = editor.value.getJSON();
                    event.preventDefault();
                    onSend(content);
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

function onSend(content: object | undefined | null) {
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

const { activate: activateFocusTrap, deactivate: deactivateFocusTrap } =
    useFocusTrap(composer, {
        immediate: false,
        clickOutsideDeactivates: true,
        escapeDeactivates: false,
        fallbackFocus: () => composer.value!,
        initialFocus: () => editor.value?.view.dom ?? composer.value!,
        returnFocusOnDeactivate: false,
        onDeactivate() {
            expanded.value = false;
        },
    });

function appendBubbleMenuTo() {
    return composer.value ?? document.body;
}

function updateLayout() {
    if (!editor.value || editor.value.isDestroyed) {
        return;
    }

    const editorElement = editor.value.view.dom;
    const composerElement = composer.value;
    const actionsElement = actions.value;

    if (
        expanded.value ||
        !editorElement ||
        !composerElement ||
        !actionsElement ||
        editor.value.isEmpty
    ) {
        multiline.value = false;
        return;
    }

    if (editor.value.state.doc.childCount > 1) {
        multiline.value = true;
        return;
    }

    const textNodes = document.createTreeWalker(
        editorElement,
        NodeFilter.SHOW_TEXT,
    );
    const lineRects: DOMRect[] = [];
    let textNode = textNodes.nextNode();

    while (textNode) {
        if (textNode.textContent) {
            const textRange = document.createRange();
            textRange.selectNodeContents(textNode);
            lineRects.push(
                ...Array.from(textRange.getClientRects()).filter(
                    (rect) => rect.width || rect.height,
                ),
            );
        }
        textNode = textNodes.nextNode();
    }

    const lineTops = lineRects.reduce<number[]>((tops, rect) => {
        if (!tops.some((top) => Math.abs(top - rect.top) < 1)) {
            tops.push(rect.top);
        }
        return tops;
    }, []);

    if (lineTops.length > 1) {
        multiline.value = true;
        return;
    }

    const composerStyle = getComputedStyle(composerElement);
    const availableInlineWidth =
        composerElement.clientWidth -
        parseFloat(composerStyle.paddingLeft) -
        parseFloat(composerStyle.paddingRight) -
        actionsElement.offsetWidth -
        parseFloat(composerStyle.columnGap || "0");

    multiline.value =
        (lineRects.reduce((width, rect) => width + rect.width, 0) ||
            editorElement.scrollWidth) >
        availableInlineWidth;
}

function scheduleLayoutUpdate() {
    const frame = requestAnimationFrame(updateLayout);
    onWatcherCleanup(() => cancelAnimationFrame(frame));
}

function expand() {
    if (!props.expandable || props.disabled || expanded.value) {
        return;
    }

    expanded.value = true;
}

function collapse(restoreFocus = true) {
    if (!expanded.value) {
        return;
    }

    expanded.value = false;

    if (restoreFocus) {
        nextTick(() => expandButton.value?.focus()).catch((error) => {
            console.error(error);
        });
    }
}

function toggleExpanded() {
    if (expanded.value) {
        collapse();
    } else {
        expand();
    }
}

function onComposerKeydown(event: KeyboardEvent) {
    if (
        props.expandable &&
        !props.disabled &&
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "f"
    ) {
        event.preventDefault();
        toggleExpanded();
        return;
    }

    if (expanded.value && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        collapse();
    }
}

watch(
    () => [props.expandable, props.disabled],
    ([expandable, disabled]) => {
        if (!expandable || disabled) {
            collapse(false);
        }
    },
);

watch(
    expanded,
    (isExpanded) => {
        if (isExpanded) {
            activateFocusTrap();
        } else {
            deactivateFocusTrap();
        }
    },
    { flush: "post" },
);

watch([model, expanded, composerWidth], scheduleLayoutUpdate, {
    flush: "post",
});

useResizeObserver(composer, ([entry]) => {
    composerWidth.value = entry?.contentRect.width ?? 0;
});

defineExpose({ focusInput });
</script>

<template>
    <div
        :id="composerId"
        ref="composer"
        class="g-chat-input-wrap"
        :class="{
            'g-chat-input-wrap--expanded': expanded,
            'g-chat-input-wrap--actions-below': actionsBelow,
        }"
        :style="maxRowsStyle"
        :role="expanded ? 'dialog' : undefined"
        :aria-label="expanded ? `${props.label} expanded` : undefined"
        :tabindex="expanded ? -1 : undefined"
        @keydown.capture="onComposerKeydown"
    >
        <BubbleMenu
            :editor="editor"
            :append-to="props.expandable ? appendBubbleMenuTo : undefined"
            v-if="editor"
        >
            <GRichTextToolbar :editor="editor" class="bubble-menu" />
        </BubbleMenu>
        <EditorContent :editor="editor" class="editor-content" />
        <div ref="actions" class="g-chat-actions">
            <button
                v-if="props.expandable"
                ref="expandButton"
                class="g-chat-expand-btn"
                :disabled="props.disabled"
                :title="expanded ? 'Collapse editor' : 'Expand editor'"
                :aria-label="expanded ? 'Collapse editor' : 'Expand editor'"
                :aria-expanded="expanded"
                :aria-controls="composerId"
                aria-haspopup="dialog"
                aria-keyshortcuts="Control+Shift+F"
                type="button"
                @click="toggleExpanded"
            >
                <svg
                    v-if="expanded"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <!--!Font Awesome Pro v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.-->
                    <path
                        d="M105.4 105.4C117.9 92.9 138.2 92.9 150.7 105.4L224 178.7L224 144C224 126.3 238.3 112 256 112C273.7 112 288 126.3 288 144L288 256C288 273.7 273.7 288 256 288L144 288C126.3 288 112 273.7 112 256C112 238.3 126.3 224 144 224L178.7 224L105.3 150.6C92.9 138.1 92.9 117.9 105.4 105.4zM534.7 105.4C547.2 117.9 547.2 138.2 534.7 150.7L461.3 224L496 224C513.7 224 528 238.3 528 256C528 273.7 513.7 288 496 288L384 288C366.3 288 352 273.7 352 256L352 144C352 126.3 366.3 112 384 112C401.7 112 416 126.3 416 144L416 178.7L489.4 105.3C501.9 92.8 522.2 92.8 534.7 105.3zM144 416C126.3 416 112 401.7 112 384C112 366.3 126.3 352 144 352L256 352C273.7 352 288 366.3 288 384L288 496C288 513.7 273.7 528 256 528C238.3 528 224 513.7 224 496L224 461.3L150.6 534.7C138.1 547.2 117.8 547.2 105.3 534.7C92.8 522.2 92.8 501.9 105.3 489.4L178.7 416L144 416zM352 384C352 366.3 366.3 352 384 352L496 352C513.7 352 528 366.3 528 384C528 401.7 513.7 416 496 416L461.3 416L534.7 489.4C547.2 501.9 547.2 522.2 534.7 534.7C522.2 547.2 501.9 547.2 489.4 534.7L416 461.3L416 496C416 513.7 401.7 528 384 528C366.3 528 352 513.7 352 496L352 384z"
                    />
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                    <path
                        d="M128 96C110.3 96 96 110.3 96 128L96 224C96 241.7 110.3 256 128 256C145.7 256 160 241.7 160 224L160 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L128 96zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 512C96 529.7 110.3 544 128 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480L160 416zM416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L480 160L480 224C480 241.7 494.3 256 512 256C529.7 256 544 241.7 544 224L544 128C544 110.3 529.7 96 512 96L416 96zM544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L512 544C529.7 544 544 529.7 544 512L544 416z"
                    />
                </svg>
            </button>
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
    </div>
</template>

<style>
.g-chat-input-wrap {
    --g-chat-input-line-height: 1.5;
    --g-chat-input-row-spacing: 0.375em;
    --g-chat-input-max-rows: 5;

    .tiptap {
        background: transparent;
        border: none;
        padding: 0.15em 0;
        font-size: 15px;
        line-height: var(--g-chat-input-line-height);
        max-height: calc(
            var(--g-chat-input-max-rows) * var(--g-chat-input-line-height) *
                1em + (var(--g-chat-input-max-rows) - 1) *
                var(--g-chat-input-row-spacing)
        );
        overflow-y: auto;
        flex: 1;
        outline: none;

        p {
            margin: var(--g-chat-input-row-spacing) 0 0;
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
            margin: var(--g-chat-input-row-spacing) 1em 0 0.4em;

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
.bubble-menu {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    background-color: var(--g-surface-100);

    button {
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 0.25rem;
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

.g-chat-input-wrap--expanded {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    z-index: 1000;
    width: min(48rem, calc(100vw - 2rem));
    height: min(32rem, calc(100dvh - 2rem));
    box-sizing: border-box;
    grid-template-rows: minmax(0, 1fr) auto;
    align-items: stretch;
    padding: 0.75rem;
    box-shadow: var(--il-shadow, 0 10px 30px rgba(0, 0, 0, 0.25));

    .tiptap {
        height: 100%;
        max-height: none;
    }
}

.editor-content {
    min-width: 0;
    min-height: 0;
}

.g-chat-actions {
    display: flex;
    align-self: end;
}

.g-chat-input-wrap--actions-below {
    row-gap: 0.25rem;

    .editor-content,
    .g-chat-actions {
        grid-column: 1 / -1;
    }

    .g-chat-actions {
        justify-self: end;
    }
}

.g-chat-input-wrap--expanded .editor-content {
    align-self: stretch;
    overflow: hidden;
}

.g-chat-expand-btn,
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

@media (max-width: 640px) {
    .g-chat-input-wrap--expanded {
        inset: 0;
        width: 100vw;
        height: 100vh;
        height: 100dvh;
        border-radius: 0;
        padding: max(0.75rem, env(safe-area-inset-top))
            max(0.75rem, env(safe-area-inset-right))
            max(0.75rem, env(safe-area-inset-bottom))
            max(0.75rem, env(safe-area-inset-left));
    }
}
</style>
