<script lang="ts">
/**
 * A text input with styling for a label, instructions, and error messages.
 *
 * If `label` is omitted, an accessible label must be provided some other way.
 * All non-prop attributes are passed through to the input element, including
 * `id`.
 *
 * In standard Vue usage, this registers with the nearest parent `GForm` via
 * injection. In custom-elements mode, use matching `form-key` values to pair
 * with a `GForm`.
 *
 * Errors are provided as an array of strings or computed values.
 * Multiple errors will all be displayed.
 */
export default {};
</script>

<script lang="ts" setup>
import { computed, ref, useId, watch, toRef } from "vue";
import { useFormField } from "../compose/useFormField.ts";
import { useCustomElementAttrs } from "../compose/useCustomElementAttrs.ts";
import GFormErrorMessages from "./form/GFormErrorMessages.vue";
defineOptions({
    inheritAttrs: false,
});

type Props = {
    /**
     * Label
     * @demo Example Label
     */
    label?: string;
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
     * Required
     * @demo
     */
    required?: boolean;

    /**
     * Error messages array (supports multiple validation errors)
     */
    errors?: string[];
    /**
     * Instructions
     * @demo
     */
    instructions?: string;
    /**
     * Prefix text (displayed before input)
     * @demo
     */
    prefix?: string;
    /**
     * Suffix text (displayed after input)
     * @demo
     */
    suffix?: string;
    /**
     * Debounce in milliseconds
     * @demo
     */
    debounce?: number;

    /**
     * Name for form registration
     */
    name?: string;
    /**
     * Form channel key for custom elements mode
     */
    formKey?: string;
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    instructions: "",
    placeholder: "",
    disabled: false,
    required: false,
    errors: () => [],
    prefix: "",
    suffix: "",
    debounce: 100,
    name: undefined,
    formKey: undefined,
});
const model = defineModel<string | null>({ type: String });

const id = useId();
const { attrs, isCustomElement, forwardedAttrs } = useCustomElementAttrs({
    omitInCustomElement: ["id"],
});
const inputId = computed(() => {
    if (isCustomElement) {
        return id;
    }
    return (attrs.id as string) || id;
});

// Use form field composable for form registration and error handling
const { displayErrors, hasErrors } = useFormField({
    name: props.name,
    value: model,
    errors: toRef(props, 'errors'),
    formKey: props.formKey,
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
            :for="inputId"
            class="g-text-input-label"
            >{{ props.label
            }}<span v-if="props.required" class="g-text-input-required" aria-hidden="true"> *</span></label
        >
        <div
            v-if="$slots.instructions || instructions"
            :id="'instructions-' + id"
            class="g-text-input-instructions"
        >
            <slot name="instructions">{{ instructions }}</slot>
        </div>
        <div :class="[{
            'g-text-input-field-wrapper': true,
        }, `g-text-input-field-wrapper--${name || 'nameless'}`]">
            <span v-if="props.prefix" class="g-text-input-prefix">{{
                props.prefix
            }}</span>
            <input
                :value="model"
                :placeholder="props.placeholder"
                :disabled="props.disabled"
                :required="props.required"
                @input="onInput"
                @blur="onBlur"
                @paste="onPaste"
                @keydown="onKeydown"
                type="text"
                class="g-text-input"
                v-bind="{
                    ...forwardedAttrs,
                    id: inputId,
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

<style>
g-text-input {
    display: block;
}
.g-text-input-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
}
.g-text-input-label {
    margin-bottom: 0.5em;
    font-size: 1.25em;
}
.g-text-input-required {
    color: var(--g-danger-600);
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

    &:focus-within {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--g-info-200);
    }
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

