<script lang="ts">
/**
 * A group of checkboxes (or radio buttons) with styling for a label,
 * instructions, and error messages.
 *
 * When more than one option is provided (or `radio` mode is used), a
 * `fieldset` + `legend` provides semantic grouping. With a single checkbox
 * a plain `div` is rendered instead.
 *
 * Each option renders as a native `<input type="checkbox">` (or
 * `type="radio"` when `radio` is `true`) so that keyboard navigation and
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
     * Render as radio buttons (single-select)
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

// Use a fieldset for radio mode or multiple checkboxes; a plain div for a single checkbox
const useFieldset = computed(() => props.radio || props.options.length > 1);

// Attributes added to the outer element only in radio mode.
// role=radiogroup allows aria-invalid and aria-errormessage on the group element.
const radioGroupAttrs = computed(() => {
    if (!props.radio) return {};
    const describedParts: string[] = [];
    if (props.instructions) describedParts.push(instructionsId.value);
    return {
        role: "radiogroup",
        "aria-invalid": hasErrors.value ? "true" : undefined,
        "aria-errormessage": hasErrors.value ? errorId.value : undefined,
        "aria-describedby": describedParts.length ? describedParts.join(" ") : undefined,
    };
});

function hintId(index: number): string {
    return `${id}-hint-${index}`;
}

function inputId(index: number): string {
    return `${id}-input-${index}`;
}

// Per-input aria attributes.
// - For checkbox inputs: aria-invalid and aria-errormessage live here.
// - For radio inputs: the radiogroup fieldset carries those; inputs only reference hints.
function inputAriaAttrs(option: CheckboxOption, index: number): Record<string, string | undefined> {
    const describedParts: string[] = [];
    if (!props.radio && props.instructions) describedParts.push(instructionsId.value);
    if (option.hint) describedParts.push(hintId(index));

    if (props.radio) {
        return {
            "aria-describedby": describedParts.length ? describedParts.join(" ") : undefined,
        };
    }

    return {
        "aria-describedby": describedParts.length ? describedParts.join(" ") : undefined,
        "aria-invalid": hasErrors.value ? "true" : "false",
        "aria-errormessage": hasErrors.value ? errorId.value : undefined,
    };
}
</script>

<template>
    <component
        :is="useFieldset ? 'fieldset' : 'div'"
        class="g-checkbox-group"
        :class="{ 'g-checkbox-group--error': hasErrors }"
        v-bind="radioGroupAttrs"
    >
        <!-- fieldset uses <legend>; single-checkbox div uses a plain heading div -->
        <legend v-if="useFieldset && label" class="g-checkbox-group__legend">
            {{ label }}<span v-if="required" class="g-checkbox-group__required" aria-hidden="true">&nbsp;*</span>
        </legend>
        <div v-else-if="!useFieldset && label" class="g-checkbox-group__label">
            {{ label }}<span v-if="required" class="g-checkbox-group__required" aria-hidden="true">&nbsp;*</span>
        </div>

        <div
            v-if="instructions"
            :id="instructionsId"
            class="g-checkbox-group__instructions"
        >{{ instructions }}</div>

        <div class="g-checkbox-group__options">
            <div
                v-for="(option, index) in options"
                :key="option.value"
                class="g-checkbox-group__option-wrapper"
                :class="{ 'g-checkbox-group__option-wrapper--disabled': option.disabled }"
            >
                <label
                    class="g-checkbox-group__option"
                    :for="inputId(index)"
                    :class="{ 'g-checkbox-group__option--checked': isChecked(option.value) }"
                >
                    <input
                        :id="inputId(index)"
                        :type="inputType"
                        :name="name || id"
                        :value="option.value"
                        :checked="isChecked(option.value)"
                        :disabled="option.disabled"
                        class="g-checkbox-group__input"
                        v-bind="inputAriaAttrs(option, index)"
                        @change="handleChange(option.value, ($event.target as HTMLInputElement).checked)"
                    />
                    <span class="g-checkbox-group__label-text">{{ option.label }}</span>
                </label>
                <!-- Hint is outside the label and referenced via aria-describedby on the input -->
                <div
                    v-if="option.hint"
                    :id="hintId(index)"
                    class="g-checkbox-group__hint"
                >{{ option.hint }}</div>
            </div>
        </div>

        <GFormErrorMessages
            :errors="displayErrors"
            :id="errorId"
        />
    </component>
</template>

<style scoped>
.g-checkbox-group {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
}

.g-checkbox-group__legend,
.g-checkbox-group__label {
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

.g-checkbox-group__option-wrapper {
    display: flex;
    flex-direction: column;
}

.g-checkbox-group__option-wrapper--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.g-checkbox-group__option {
    display: flex;
    align-items: flex-start;
    gap: 0.5em;
    cursor: pointer;
    padding: 0.375em 0.5em;
    border-radius: 4px;
}

.g-checkbox-group__option-wrapper--disabled .g-checkbox-group__option {
    cursor: not-allowed;
}

.g-checkbox-group__input {
    margin-top: 0.2em;
    flex-shrink: 0;
    accent-color: var(--g-primary-500);
    width: 1.1em;
    height: 1.1em;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--g-info-200);
    }
}

.g-checkbox-group__option-wrapper--disabled .g-checkbox-group__input {
    cursor: not-allowed;
}

.g-checkbox-group__label-text {
    font-family: var(--il-font-sans);
    line-height: 1.4;
}

/* Indent hint to align with the label text, accounting for the checkbox width
   (1.1em) + flex gap (0.5em) + option left-padding (0.5em). */
.g-checkbox-group__hint {
    padding-left: calc(0.5em + 1.1em + 0.5em);
    padding-right: 0.5em;
    font-size: 0.875em;
    color: var(--g-surface-700);
    margin-top: 0.125em;
}

.g-checkbox-group--error .g-checkbox-group__options {
    border-left: 3px solid var(--g-danger-600);
    padding-left: 0.75em;
}
</style>
