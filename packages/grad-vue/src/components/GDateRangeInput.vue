<script setup lang="ts">
/**
 * A date range input component with start and end dates.
 * 
 * This component uses two GDateInput components laid out horizontally
 * to allow selecting a date range.
 */
import { ref, watch, toRef } from "vue";
import GDateInput from "./GDateInput.vue";
import { useFormField } from "../compose/useFormField.ts";

type Props = {
    /**
     * Label for the component
     */
    label?: string;
    /**
     * Label for the start date input
     */
    startLabel?: string;
    /**
     * Label for the end date input
     */
    endLabel?: string;
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
    // Name for form registration
    name?: string;
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    startLabel: "Start Date",
    endLabel: "End Date",
    instructions: "",
    disabled: false,
    errors: () => [],
    name: undefined,
});

type DateRange = {
    start: string | null;
    end: string | null;
};

const model = defineModel<DateRange>({
    default: () => ({ start: null, end: null }),
});

const startDate = ref<string | null>(model.value.start || null);
const endDate = ref<string | null>(model.value.end || null);

// Use form field composable for form registration and error handling
const { displayErrors } = useFormField({
    name: props.name,
    value: model,
    errors: toRef(props, 'errors'),
});

watch([startDate, endDate], () => {
    model.value = {
        start: startDate.value,
        end: endDate.value,
    };
});

watch(
    model,
    (newValue) => {
        if (newValue.start !== startDate.value) {
            startDate.value = newValue.start;
        }
        if (newValue.end !== endDate.value) {
            endDate.value = newValue.end;
        }
    },
    { deep: true }
);
</script>

<template>
    <div class="g-date-range-input">
        <div v-if="props.label" class="g-date-range-input__label">
            {{ props.label }}
        </div>
        <div
            v-if="props.instructions"
            class="g-date-range-input__instructions"
        >
            {{ props.instructions }}
        </div>
        <div class="g-date-range-input__fields">
            <GDateInput
                v-model="startDate"
                :label="props.startLabel"
                :disabled="props.disabled"
                class="g-date-range-input__field"
            />
            <GDateInput
                v-model="endDate"
                :label="props.endLabel"
                :disabled="props.disabled"
                class="g-date-range-input__field"
            />
        </div>
        <div v-if="displayErrors.length > 0" class="g-date-range-input__errors" role="alert">
            <div
                v-for="(errorMsg, index) in displayErrors"
                :key="index"
                class="g-date-range-input__error"
            >
                {{ errorMsg }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.g-date-range-input {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.g-date-range-input__label {
    font-size: 1.25em;
    font-weight: 600;
}

.g-date-range-input__instructions {
    margin: 0 0 0.25em 0.5em;
    color: var(--g-surface-800);
}

.g-date-range-input__fields {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    align-items: flex-start;
}

.g-date-range-input__field {
    flex: 1;
    min-width: 0;
}

.g-date-range-input__errors {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
}

.g-date-range-input__error {
    background: var(--g-surface-0);
    color: var(--g-danger-600);
    padding: 0.25em 0.5em;
}
</style>
