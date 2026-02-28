<script lang="ts" setup>
/**
 * A text input with styling for a label, instructions, and error messages.
 *
 * If `label` is omitted, an accessible label must be provided some other way.
 * All non-prop attributes are passed through to the input element, including
 * `id`.
 * 
 * Errors are provided as an array of strings or computed values.
 * Multiple errors will all be displayed.
 */

import { ref, useAttrs, useId, watch, toRef } from "vue";
import { useFormField } from "../compose/useFormField.ts";
import GFormErrorMessages from "./form/GFormErrorMessages.vue";
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

    // Error messages array (supports multiple validation errors)
    errors?: string[];
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
    /**
     * Debounce in milliseconds
     */
    debounce?: number;

    // Name for form registration
    name?: string;
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    instructions: "",
    placeholder: "",
    disabled: false,
    errors: () => [],
    prefix: "",
    suffix: "",
    debounce: 100,
    name: undefined,
});
const model = defineModel<string | null>({ type: String });

const id = useId();

// Use form field composable for form registration and error handling
const { displayErrors, hasErrors } = useFormField({
    name: props.name,
    value: model,
    errors: toRef(props, 'errors'),
});

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
    }, props.debounce);
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
        :class="{ 'g-text-input-has-error': hasErrors }"
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
                    'aria-errormessage': hasErrors
                        ? 'error-message-' + id
                        : undefined,
                }"
                :aria-invalid="hasErrors ? 'true' : 'false'"
            />
            <span v-if="props.suffix" class="g-text-input-suffix">{{
                props.suffix
            }}</span>
        </div>
        <GFormErrorMessages
            :errors="displayErrors"
            :id="'error-message-' + id"
        />
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
</style>
