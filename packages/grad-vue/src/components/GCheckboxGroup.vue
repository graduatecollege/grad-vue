<script lang="ts">
/**
 * A group of checkboxes (or radio buttons) with styling for a label,
 * instructions, and error messages.
 *
 * Renders a `fieldset` + `legend` for semantic grouping when `label` is
 * provided.  Each option is rendered as a native `<input type="checkbox">`
 * (or `type="radio"` when `radio` is `true`) so that keyboard navigation and
 * browser/assistive-technology support come for free.
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
import { computed, toRef, useId } from "vue";
import { useFormField } from "../compose/useFormField.ts";
import GFormErrorMessages from "./form/GFormErrorMessages.vue";

export interface CheckboxOption {
    label: string;
    value: string;
    disabled?: boolean;
    hint?: string;
}

type Props = {
    /**
     * Legend / accessible label for the group
     * @demo Checkbox Group
     */
    label?: string;
    /**
     * List of checkbox options
     */
    options: CheckboxOption[];
    /**
     * Instructions shown below the legend
     * @demo
     */
    instructions?: string;
    /**
     * Error messages array (supports multiple validation errors)
     */
    errors?: string[];
    /**
     * Mark the group as required
     * @demo
     */
    required?: boolean;
    /**
     * Render as radio buttons (single-select). Only one value can be selected
     * at a time; the model is still a `string[]` for API consistency.
     * @demo
     */
    radio?: boolean;
    /**
     * Name for form registration and native input `name` attribute
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
    errors: () => [],
    required: false,
    radio: false,
    name: undefined,
    formKey: undefined,
});

const model = defineModel<string[]>({ default: () => [] });

const id = useId();

const { displayErrors, hasErrors } = useFormField({
    name: props.name,
    value: model,
    errors: toRef(props, "errors"),
    formKey: props.formKey,
});

const emit = defineEmits<{
    change: [value: string[]];
}>();

function isChecked(value: string): boolean {
    return model.value.includes(value);
}

function handleChange(optionValue: string, checked: boolean) {
    let next: string[];
    if (props.radio) {
        next = checked ? [optionValue] : [];
    } else {
        if (checked) {
            next = model.value.includes(optionValue)
                ? model.value
                : [...model.value, optionValue];
        } else {
            next = model.value.filter((v) => v !== optionValue);
        }
    }
    model.value = next;
    emit("change", next);
}

const inputType = computed(() => (props.radio ? "radio" : "checkbox"));
const errorId = computed(() => `error-message-${id}`);
const instructionsId = computed(() => `instructions-${id}`);
const groupAriaDescribedBy = computed(() => {
    const parts: string[] = [];
    if (props.instructions) parts.push(instructionsId.value);
    if (hasErrors.value) parts.push(errorId.value);
    return parts.length ? parts.join(" ") : undefined;
});
</script>

<template>
    <fieldset
        class="g-checkbox-group"
        :class="{ 'g-checkbox-group--error': hasErrors }"
        :aria-describedby="groupAriaDescribedBy"
        :aria-invalid="hasErrors ? 'true' : undefined"
    >
        <legend
            v-if="label"
            class="g-checkbox-group__legend"
        >{{ label }}<span v-if="required" class="g-checkbox-group__required" aria-hidden="true">&nbsp;*</span></legend>

        <div
            v-if="instructions"
            :id="instructionsId"
            class="g-checkbox-group__instructions"
        >{{ instructions }}</div>

        <div class="g-checkbox-group__options">
            <label
                v-for="option in options"
                :key="option.value"
                class="g-checkbox-group__option"
                :class="{
                    'g-checkbox-group__option--disabled': option.disabled,
                    'g-checkbox-group__option--checked': isChecked(option.value),
                }"
            >
                <input
                    :type="inputType"
                    :name="name || id"
                    :value="option.value"
                    :checked="isChecked(option.value)"
                    :disabled="option.disabled"
                    class="g-checkbox-group__input"
                    @change="handleChange(option.value, ($event.target as HTMLInputElement).checked)"
                />
                <span class="g-checkbox-group__label-text">{{ option.label }}</span>
                <span
                    v-if="option.hint"
                    class="g-checkbox-group__hint"
                >{{ option.hint }}</span>
            </label>
        </div>

        <GFormErrorMessages
            :errors="displayErrors"
            :id="errorId"
        />
    </fieldset>
</template>

<style scoped>
.g-checkbox-group {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
}

.g-checkbox-group__legend {
    font-size: 1.25em;
    margin-bottom: 0.5em;
    padding: 0;
    float: left;
    width: 100%;
}

.g-checkbox-group__required {
    color: var(--g-danger-600);
}

.g-checkbox-group__instructions {
    margin: 0 0 0.75em 0.5em;
    color: var(--g-surface-800);
    clear: both;
}

.g-checkbox-group__options {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    clear: both;
}

.g-checkbox-group__option {
    display: flex;
    align-items: flex-start;
    gap: 0.5em;
    cursor: pointer;
    padding: 0.375em 0.5em;
    border-radius: 4px;
}

.g-checkbox-group__option--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.g-checkbox-group__input {
    margin-top: 0.2em;
    flex-shrink: 0;
    accent-color: var(--g-primary-500);
    width: 1.1em;
    height: 1.1em;
    cursor: pointer;
}

.g-checkbox-group__option--disabled .g-checkbox-group__input {
    cursor: not-allowed;
}

.g-checkbox-group__label-text {
    font-family: var(--il-font-sans);
    line-height: 1.4;
}

.g-checkbox-group__hint {
    display: block;
    font-size: 0.875em;
    color: var(--g-surface-700);
    margin-top: 0.125em;
    width: 100%;
}

.g-checkbox-group--error .g-checkbox-group__options {
    border-left: 3px solid var(--g-danger-600);
    padding-left: 0.75em;
}
</style>
