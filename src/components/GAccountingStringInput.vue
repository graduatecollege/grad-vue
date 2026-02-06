<script lang="ts" setup>
/**
 * An input for CFOP (1-6-6-6) or CFOAP (1-6-6-6-6) accounting strings.
 *
 * Accepts input with or without dashes. The dashes are stripped from the model value.
 * Shows a status message indicating whether the input matches CFOP or CFOAP format,
 * or if more characters are needed.
 *
 * CFOP format: Chart-Fund-Org-Program (19 alphanumeric characters)
 * CFOAP format: Chart-Fund-Org-Account-Program (25 alphanumeric characters)
 *
 * If `label` is omitted, an accessible label must be provided some other way.
 * All non-prop attributes are passed through to the input element, including `id`.
 */

import { computed, useId, watch } from "vue";

defineOptions({
    inheritAttrs: false,
});

type Props = {
    /**
     * Label
     */
    label?: string;
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
     * Format type: 'cfop' (19 chars), 'cfoap' (25 chars), or 'auto' (detect)
     */
    format?: "cfop" | "cfoap" | "auto";
};

const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    instructions: "",
    placeholder: "",
    disabled: false,
    error: "",
    format: "auto",
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

/**
 * Remove all dashes and non-alphanumeric characters from the input string
 */
function cleanValue(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Get status message based on cleaned value length
 */
const statusMessage = computed(() => {
    const cleaned = model.value ? cleanValue(model.value) : "";
    const length = cleaned.length;
    
    if (length === 0) {
        return "";
    }
    
    if (props.format === "cfop" || (props.format === "auto" && length <= 19)) {
        if (length === 19) {
            return "Complete CFOP format (Chart-Fund-Org-Program)";
        } else if (length < 19) {
            return `${19 - length} more character${19 - length === 1 ? '' : 's'} needed for CFOP`;
        } else if (length > 19 && length < 25) {
            return `${25 - length} more character${25 - length === 1 ? '' : 's'} needed for CFOAP`;
        }
    }
    
    if (props.format === "cfoap" || (props.format === "auto" && length > 19)) {
        if (length === 25) {
            return "Complete CFOAP format (Chart-Fund-Org-Account-Program)";
        } else if (length < 25) {
            return `${25 - length} more character${25 - length === 1 ? '' : 's'} needed for CFOAP`;
        } else if (length > 25) {
            return `${length - 25} character${length - 25 === 1 ? '' : 's'} too many`;
        }
    }
    
    if (length > 25) {
        return `${length - 25} character${length - 25 === 1 ? '' : 's'} too many`;
    }
    
    return "";
});

/**
 * Pattern for HTML5 validation
 * Allows alphanumeric and dashes, for CFOP or CFOAP formats
 */
const inputPattern = computed(() => {
    if (props.format === "cfop") {
        // CFOP: 19 alphanumeric chars, optionally with dashes
        return "[a-zA-Z0-9-]{19,}";
    } else if (props.format === "cfoap") {
        // CFOAP: 25 alphanumeric chars, optionally with dashes
        return "[a-zA-Z0-9-]{25,}";
    } else {
        // Auto: accept either format
        return "[a-zA-Z0-9-]{19,}";
    }
});

// Watch for external model changes and update
watch(() => model.value, (newValue) => {
    // Value is already cleaned, nothing to do
}, { immediate: true });

let inputTimer: ReturnType<typeof setTimeout> | null = null;

function emitChangeIfNeeded(val: string | null) {
    const cleaned = val ? cleanValue(val) : null;
    
    if (cleaned !== model.value) {
        const prev = model.value;
        model.value = cleaned;
        emit("change", {
            was: prev,
            to: cleaned,
        });
    }
}

function onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    
    if (inputTimer) {
        clearTimeout(inputTimer);
    }
    inputTimer = setTimeout(() => {
        emitChangeIfNeeded(value);
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
        class="g-accounting-string-input-wrap"
        :class="{ 'g-accounting-string-input-has-error': props.error }"
    >
        <label
            v-if="props.label"
            :for="($attrs.id as string) || id"
            class="g-accounting-string-input-label"
            >{{ props.label }}</label
        >
        <div
            v-if="$slots.instructions || instructions"
            :id="'instructions-' + id"
            class="g-accounting-string-input-instructions"
        >
            <slot name="instructions">{{ instructions }}</slot>
        </div>
        <input
            :value="model"
            :placeholder="props.placeholder"
            :disabled="props.disabled"
            :pattern="inputPattern"
            @input="onInput"
            @blur="onBlur"
            @keydown="onKeydown"
            type="text"
            inputmode="text"
            class="g-accounting-string-input"
            v-bind="{
                ...$attrs,
                id: ($attrs.id as string) || id,
                'aria-describedby':
                    [
                        $slots.instructions || instructions ? 'instructions-' + id : null,
                        statusMessage ? 'status-' + id : null
                    ].filter(Boolean).join(' ') || undefined,
                'aria-errormessage': props.error
                    ? 'error-message-' + id
                    : undefined,
            }"
            :aria-invalid="props.error ? 'true' : 'false'"
        />
        <div
            v-if="statusMessage"
            :id="'status-' + id"
            class="status-message"
            role="status"
            aria-live="polite"
        >
            <svg class="g-accounting-string-input-status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                <path
                    fill="currentColor"
                    d="M320 64C178.6 64 64 178.6 64 320s114.6 256 256 256s256-114.6 256-256S461.4 64 320 64zM320 128c17.7 0 32 14.3 32 32s-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32zM368 448c0 8.8-7.2 16-16 16H288c-8.8 0-16-7.2-16-16V288c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16V448z"
                />
            </svg>
            {{ statusMessage }}
        </div>
        <div
            v-if="props.error"
            class="error-message"
            :id="'error-message-' + id"
            role="alert"
        >
            <svg class="g-accounting-string-input-error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
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
.g-accounting-string-input-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
}
.g-accounting-string-input-label {
    margin-bottom: 0.5em;
    font-size: 1.25em;
}
.g-accounting-string-input-instructions {
    margin: 0 0 0.75em 0.5em;
    color: var(--g-surface-800);
}
.g-accounting-string-input {
    width: 100%;
    padding: 0.5em;
    font-size: 1em;
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;
    background: var(--g-surface-0);
    color: var(--g-surface-950);
    font-family: var(--il-font-mono, monospace);
    letter-spacing: 0.05em;
}
.g-accounting-string-input-has-error .g-accounting-string-input {
    border-color: var(--g-danger-600);
    background: var(--g-danger-100);
}
.g-accounting-string-input:disabled {
    background: var(--g-surface-100);
    color: var(--g-surface-700);
}
.status-message {
    background: var(--g-surface-0);
    color: var(--g-primary-700);
    padding: 0.25em 0.5em;
    margin-top: 0.25em;
    font-size: 0.9em;
}
.error-message {
    background: var(--g-surface-0);
    color: var(--g-danger-600);
    padding: 0.25em 0.5em;
    margin-top: 0.25em;
}
.g-accounting-string-input-status-icon {
    height: 1.2em;
    padding: 0.2em 0;
    display: inline;
    margin: 0 0.2em 0 0;
    vertical-align: middle;
}
.g-accounting-string-input-error-icon {
    height: 1.2em;
    padding: 0.2em 0;
    display: inline;
    margin: 0 0.2em 0 0;
    vertical-align: middle;
}
</style>
