<script lang="ts" setup>
/**
 * A text input with styling for a label, instructions, and an error message.
 *
 * If `label` is omitted, an accessible label must be provided some other way.
 * All non-prop attributes are passed through to the input element, including
 * `id`.
 */

import { ref, useAttrs, useId, watch } from "vue";
defineOptions({
    inheritAttrs: false,
});

type Props = {
    /**
     * Label
     */
    label?: string; // Demo: Example Label
    /**
     * Placeholder text
     */
    placeholder?: string;
    /**
     * Disabled
     */
    disabled?: boolean;
    /**
     * Error message
     */
    error?: string;
    /**
     * Instructions
     */
    instructions?: string;
    /**
     * Prefix text (displayed before input)
     */
    prefix?: string;
    /**
     * Suffix text (displayed after input)
     */
    suffix?: string;
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    instructions: "",
    placeholder: "",
    disabled: false,
    error: "",
    prefix: "",
    suffix: "",
});
const model = defineModel<string | null>({ type: String });

const id = useId();

const emit = defineEmits<{
    change: [
        {
            was: string | null | undefined;
            to: string | null;
        },
    ];
}>();

const lastInputValue = ref<string | null>(model.value ?? "");
let inputTimer: ReturnType<typeof setTimeout> | null = null;

function emitChangeIfNeeded(val: string | null) {
    if (val !== model.value) {
        const prev = model.value;
        model.value = val;
        emit("change", {
            was: prev,
            to: val,
        });
    }
}

function onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    lastInputValue.value = value;
    if (inputTimer) {
        clearTimeout(inputTimer);
    }
    inputTimer = setTimeout(() => {
        emitChangeIfNeeded(lastInputValue.value);
        inputTimer = null;
    }, 3000);
}

function onBlur(e: FocusEvent) {
    if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
    }
    emitChangeIfNeeded((e.target as HTMLInputElement).value);
}

function onPaste(e: ClipboardEvent) {
    if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
    }
    // Wait for paste to update value
    setTimeout(() => {
        const value = (e.target as HTMLInputElement).value;
        emitChangeIfNeeded(value);
    }, 0);
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === "PageUp" || e.key === "PageDown") {
        if (inputTimer) {
            clearTimeout(inputTimer);
            inputTimer = null;
        }
        emitChangeIfNeeded((e.target as HTMLInputElement).value);
    }
    if (e.key === "Enter") {
        emitChangeIfNeeded((e.target as HTMLInputElement).value);
    }
}
</script>

<template>
    <div
        class="g-text-input-wrap"
        :class="{ 'g-text-input-has-error': props.error }"
    >
        <label
            v-if="props.label"
            :for="($attrs.id as string) || id"
            class="g-text-input-label"
            >{{ props.label }}</label
        >
        <div
            v-if="$slots.instructions || instructions"
            :id="'instructions-' + id"
            class="g-text-input-instructions"
        >
            <slot name="instructions">{{ instructions }}</slot>
        </div>
        <div class="g-text-input-field-wrapper">
            <span v-if="props.prefix" class="g-text-input-prefix">{{
                props.prefix
            }}</span>
            <input
                :value="model"
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                @input="onInput"
                @blur="onBlur"
                @paste="onPaste"
                @keydown="onKeydown"
                type="text"
                class="g-text-input"
                v-bind="{
                    ...$attrs,
                    id: ($attrs.id as string) || id,
                    'aria-describedby':
                        $slots.instructions || instructions
                            ? 'instructions-' + id
                            : undefined,
                    'aria-errormessage': props.error
                        ? 'error-message-' + id
                        : undefined,
                }"
                :aria-invalid="props.error ? 'true' : 'false'"
            />
            <span v-if="props.suffix" class="g-text-input-suffix">{{
                props.suffix
            }}</span>
        </div>
        <div
            v-if="props.error"
            class="error-message"
            :id="'error-message-' + id"
            role="alert"
        >
            <svg class="g-text-input-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                <path
                    fill="currentColor"
                    d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.8 536.6 69.6 524.5C62.4 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 416C302.3 416 288 430.3 288 448C288 465.7 302.3 480 320 480C337.7 480 352 465.7 352 448C352 430.3 337.7 416 320 416zM320 224C301.8 224 287.3 239.5 288.6 257.7L296 361.7C296.9 374.2 307.4 384 319.9 384C332.5 384 342.9 374.3 343.8 361.7L351.2 257.7C352.5 239.5 338.1 224 319.8 224z"
                />
            </svg>
            {{ props.error }}
        </div>
    </div>
</template>

<style scoped>
.g-text-input-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
}
.g-text-input-label {
    margin-bottom: 0.5em;
    font-size: 1.25em;
}
.g-text-input-instructions {
    margin: 0 0 0.75em 0.5em;
    color: var(--g-surface-800);
}
.g-text-input-field-wrapper {
    display: flex;
    align-items: center;
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;
    background: var(--g-surface-0);
    overflow: hidden;
}
.g-text-input-prefix,
.g-text-input-suffix {
    padding: 0.5em;
    background: var(--g-surface-100);
    color: var(--g-surface-700);
    white-space: nowrap;
    font-family: var(--il-font-sans);
}
.g-text-input {
    width: 100%;
    padding: 0.5em;
    font-size: 1em;
    border: none;
    border-radius: 0;
    background: transparent;
    color: var(--g-surface-950);
    font-family: var(--il-font-sans);
}
.g-text-input:focus {
    outline: none;
}
.g-text-input-has-error {
    .g-text-input-field-wrapper {
        border-color: var(--g-danger-600);
        background: var(--g-danger-100);
    }
}
.g-text-input:disabled {
    background: transparent;
    color: var(--g-surface-700);
}
.g-text-input-field-wrapper:has(.g-text-input:disabled) {
    background: var(--g-surface-100);
}
.error-message {
    background: var(--g-surface-0);
    color: var(--g-danger-600);
    padding: 0.25em 0.5em;
}
.g-text-input-error-icon {
    height: 1.2em;
    padding: 0.2em 0;
    display: inline;
    margin: 0 0.2em 0 0;
    vertical-align: middle;
}
</style>
