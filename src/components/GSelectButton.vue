<script setup lang="ts">
import { computed, useId } from "vue";

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
     * Color theme
     */
    theme?: "primary" | "secondary" | "accent" | "danger";
    /**
     * Name
     */
    name?: string;
    /**
     * Disabled
     */
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: "medium",
    theme: "primary",
    name: undefined,
    disabled: false,
});

const emit = defineEmits(["change"]);
const modelValue = defineModel<string | number>({default: () => ""});

const baseId = useId();

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
    `g-select-btn--${props.theme}`,
    selected ? "g-select-btn--selected" : "",
    { "g-select-btn--disabled": props.disabled },
];

function onChange(val: string | number) {
    if (!props.disabled && val !== modelValue.value) {
        modelValue.value = val;
        emit("change", val);
    }
}
</script>

<template>
    <fieldset :class="groupClasses" :disabled="props.disabled">
        <legend class="g-select-btn-legend">{{ props.label }}</legend>
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
                    :checked="option.value === modelValue"
                    :disabled="props.disabled"
                    @change="onChange(option.value)"
                />
                <label
                    :for="`${baseId}-${option.value}`"
                    :class="getBtnClasses(option.value === modelValue)"
                >
                    {{ option.label }}
                </label>
            </template>
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
</style>
