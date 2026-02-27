<script setup lang="ts">
/**
 * This component is just a radio button group with special styling.
 *
 * Use the `options` prop to provide a list of choices. Each option can
 * be a string or an object with `label` and `value` properties.
 *
 * In addition to `v-model`, a `change` event is emitted when the
 * option changes from user interaction.
 */
import { computed, useId } from "vue";
import { useFormField } from "../compose/useFormField.ts";

interface OptionType {
    label: string;
    value: string | number;
}

interface Props {
    options: Array<string | OptionType>;
    /**
     * Accessible label
     */
    label: string; // Demo: Select Option
    /**
     * Size
     */
    size?: "small" | "medium" | "large";
    /**
     * Name
     */
    name?: string;
    /**
     * Disabled
     */
    disabled?: boolean;
    /**
     * Error messages array (supports multiple validation errors)
     */
    errors?: string[];
}

const props = withDefaults(defineProps<Props>(), {
    size: "medium",
    name: undefined,
    disabled: false,
    errors: () => [],
});

const emit = defineEmits(["change"]);
const model = defineModel<string | number>({default: () => ""});

const baseId = useId();

// Use form field composable for form registration and error handling
const { displayErrors, hasErrors } = useFormField({
    name: props.name,
    value: model,
    errors: props.errors,
});

const normalizedOptions = computed(() => {
    return props.options.map((opt) => {
        if (typeof opt === "string") {
            return { label: opt, value: opt };
        } else {
            return opt;
        }
    });
});

const groupClasses = computed(() => [
    "g-select-btn-group",
    `g-select-btn-group--${props.size}`,
]);

const getBtnClasses = (selected: boolean) => [
    "g-select-btn",
    selected ? "g-select-btn--selected" : "",
    { "g-select-btn--disabled": props.disabled },
];

function onChange(val: string | number) {
    if (!props.disabled && val !== model.value) {
        model.value = val;
        emit("change", val);
    }
}
</script>

<template>
    <fieldset :class="groupClasses" :disabled="props.disabled">
        <legend class="g-select-btn-legend">{{ props.label }}</legend>
        <div class="g-select-btn-wrapper" :class="{ 'g-select-btn-has-error': hasErrors }">
            <div class="g-select-btn-row">
            <template
                v-for="(option, idx) in normalizedOptions"
                :key="option.value"
            >
                <input
                    class="g-select-btn-radio"
                    type="radio"
                    :id="`${baseId}-${option.value}`"
                    :name="props.name || baseId"
                    :value="option.value"
                    :checked="option.value === model"
                    :disabled="props.disabled"
                    @change="onChange(option.value)"
                />
                <label
                    :for="`${baseId}-${option.value}`"
                    :class="getBtnClasses(option.value === model)"
                >
                    {{ option.label }}
                </label>
            </template>
        </div>
        <div
            v-if="hasErrors"
            class="g-select-btn-error-messages"
            :id="'error-message-' + baseId"
            role="alert"
        >
            <div
                v-for="(errorMsg, index) in displayErrors"
                :key="index"
                class="g-select-btn-error-message"
            >
                <svg class="g-select-btn-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                    <path
                        fill="currentColor"
                        d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.8 536.6 69.6 524.5C62.4 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 416C302.3 416 288 430.3 288 448C288 465.7 302.3 480 320 480C337.7 480 352 465.7 352 448C352 430.3 337.7 416 320 416zM320 224C301.8 224 287.3 239.5 288.6 257.7L296 361.7C296.9 374.2 307.4 384 319.9 384C332.5 384 342.9 374.3 343.8 361.7L351.2 257.7C352.5 239.5 338.1 224 319.8 224z"
                    />
                </svg>
                {{ errorMsg }}
            </div>
        </div>
    </div>
    </fieldset>
</template>

<style scoped>
.g-select-btn-group {
    border: none;
    margin: 0;
    padding: 0;
    min-width: 0;
    border-radius: 4px;
}

.g-select-btn-legend {
    position: static;
    display: block;
    margin: 0 0 0.5rem 0;
    padding: 0;
    font-weight: 700;
    color: var(--g-surface-900);
}

.g-select-btn-row {
    display: flex;
    align-items: stretch;
    border-radius: var(--g-border-radius-m);
}

.g-select-btn-row:has(:focus-visible) {
    outline: 2px solid var(--g-primary-500);
    outline-offset: 2px;
    background: var(--ilw-color--focus--background);
    box-shadow: 0 0 0 2px var(--ilw-color--focus--background);
}

.g-select-btn-group--small {
    font-size: 0.875rem;
}

.g-select-btn-group--medium {
    font-size: 1rem;
}

.g-select-btn-group--large {
    font-size: 1.125rem;
}

.g-select-btn-radio {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
    margin: 0;
}

.g-select-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--g-primary-500);
    border-left-width: 1px;
    border-right-width: 1px;
    background: var(--g-surface-0);
    color: var(--g-primary-500);
    font-weight: 700;
    padding: 0.5em;
    cursor: pointer;
    outline: none;
    &:hover {
        text-decoration: underline;
    }
}
.g-select-btn--selected {
    background: var(--g-primary-500);
    color: var(--g-surface-0);
}
.g-select-btn:first-of-type {
    border-top-left-radius: var(--g-border-radius-m);
    border-bottom-left-radius: var(--g-border-radius-m);
    border-left-width: 2px;
}
.g-select-btn:last-of-type {
    border-top-right-radius: var(--g-border-radius-m);
    border-bottom-right-radius: var(--g-border-radius-m);
    border-right-width: 2px;
}

.g-select-btn-has-error .g-select-btn-row {
    border: 2px solid var(--g-danger-600);
    border-radius: var(--g-border-radius-m);
}

.g-select-btn-has-error .g-select-btn {
    background: var(--g-danger-100);
}

.g-select-btn-error-messages {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    margin-top: 0.25em;
}

.g-select-btn-error-message {
    background: var(--g-surface-0);
    color: var(--g-danger-600);
    padding: 0.25em 0.5em;
}

.g-select-btn-error-icon {
    height: 1.2em;
    padding: 0.2em 0;
    display: inline;
    margin: 0 0.2em 0 0;
    vertical-align: middle;
}
</style>
