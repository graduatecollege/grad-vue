<script lang="ts">
/**
 * A multi-line plain text input with styling for a label, instructions,
 * and error messages.
 *
 * If `label` is omitted, an accessible label must be provided some other way.
 * All non-prop attributes are passed through to the textarea element, including
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
import { computed, nextTick, ref, toRef, useId, useTemplateRef, watch } from "vue";
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
     * Read-only
     * @demo
     */
    readonly?: boolean;
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
     * Number of visible text rows
     * @demo
     */
    rows?: number;
    /**
     * Maximum number of characters allowed
     * @demo
     */
    maxlength?: number;
    /**
     * Automatically grow the textarea height to fit content
     * @demo
     */
    autoGrow?: boolean;
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
    readonly: false,
    required: false,
    errors: () => [],
    rows: 4,
    maxlength: undefined,
    autoGrow: false,
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

const { displayErrors, hasErrors } = useFormField({
    name: props.name,
    value: model,
    errors: toRef(props, "errors"),
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

const textareaRef = useTemplateRef<HTMLTextAreaElement>("textareaEl");

function adjustHeight() {
    const el = textareaRef.value;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
}

watch(
    () => model.value,
    () => {
        if (props.autoGrow) {
            nextTick(adjustHeight);
        }
    },
);

function emitChangeIfNeeded(val: string | null) {
    if (val !== model.value) {
        const prev = model.value;
        model.value = val;
        emit("change", { was: prev, to: val });
    }
}

function onInput(e: Event) {
    const value = (e.target as HTMLTextAreaElement).value;
    model.value = value;
    if (props.autoGrow) {
        adjustHeight();
    }
}

function onBlur(e: FocusEvent) {
    emitChangeIfNeeded((e.target as HTMLTextAreaElement).value);
}

function onPaste(e: ClipboardEvent) {
    setTimeout(() => {
        const value = (e.target as HTMLTextAreaElement).value;
        emitChangeIfNeeded(value);
        if (props.autoGrow) {
            adjustHeight();
        }
    }, 0);
}
</script>

<template>
    <div
        class="g-textarea-wrap"
        :class="{ 'g-textarea-has-error': hasErrors }"
    >
        <label
            v-if="props.label"
            :for="inputId"
            class="g-textarea-label"
            >{{ props.label
            }}<span v-if="props.required" class="g-textarea-required" aria-hidden="true"> *</span></label
        >
        <div
            v-if="$slots.instructions || instructions"
            :id="'instructions-' + id"
            class="g-textarea-instructions"
        >
            <slot name="instructions">{{ instructions }}</slot>
        </div>
        <textarea
            ref="textareaEl"
            :value="model ?? ''"
            :placeholder="props.placeholder"
            :disabled="props.disabled"
            :readonly="props.readonly"
            :required="props.required"
            :rows="props.rows"
            :maxlength="props.maxlength ?? undefined"
            class="g-textarea"
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
            @input="onInput"
            @blur="onBlur"
            @paste="onPaste"
        />
        <div
            v-if="props.maxlength !== undefined"
            class="g-textarea-char-count"
            aria-live="polite"
        >
            {{ (model ?? '').length }} / {{ props.maxlength }}
        </div>
        <GFormErrorMessages
            :errors="displayErrors"
            :id="'error-message-' + id"
        />
    </div>
</template>

<style>
g-textarea {
    display: block;
}
.g-textarea-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
}

.g-textarea-label {
    margin-bottom: 0.5em;
    font-size: 1.25em;
}

.g-textarea-required {
    color: var(--g-danger-600);
}

.g-textarea-instructions {
    margin: 0 0 0.75em 0.5em;
    color: var(--g-surface-800);
}

.g-textarea {
    width: 100%;
    padding: 0.5em;
    font-size: 1em;
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;
    background: var(--g-surface-0);
    color: var(--g-surface-950);
    font-family: var(--il-font-sans);
    resize: vertical;
    box-sizing: border-box;
}

.g-textarea:focus {
    outline: 2px solid var(--g-primary-500);
    box-shadow: 0 0 0 2px var(--g-info-200);
    outline-offset: 2px;
}

.g-textarea-has-error .g-textarea {
    border-color: var(--g-danger-600);
    background: var(--g-danger-100);
}

.g-textarea:disabled {
    background: var(--g-surface-100);
    color: var(--g-surface-700);
    cursor: not-allowed;
}

.g-textarea[readonly] {
    background: var(--g-surface-50);
    color: var(--g-surface-800);
}

.g-textarea-char-count {
    font-size: 0.875em;
    color: var(--g-surface-700);
    text-align: right;
    margin-top: 0.25em;
}
</style>

