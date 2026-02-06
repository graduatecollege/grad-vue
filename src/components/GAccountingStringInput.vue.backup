<script lang="ts" setup>
/**
 * An input for CFOP (1-6-6-6) or CFOAP (1-6-6-6-6) accounting strings.
 *
 * Accepts input with or without dashes and displays formatted with gray dashes.
 * CFOP format: Chart-Fund-Org-Program (1-6-6-6 = 19 characters)
 * CFOAP format: Chart-Fund-Org-Account-Program (1-6-6-6-6 = 25 characters)
 *
 * If `label` is omitted, an accessible label must be provided some other way.
 * All non-prop attributes are passed through to the input element, including `id`.
 */

import { ref, useId, computed, watch } from "vue";

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
     * Format type: 'cfop' (4 segments), 'cfoap' (5 segments), or 'auto' (detect)
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
const inputRef = ref<HTMLInputElement | null>(null);
const displayValue = ref("");

const emit = defineEmits<{
    change: [
        {
            was: string | null | undefined;
            to: string | null;
        },
    ];
}>();

// Segment lengths for each format
const CFOP_SEGMENTS = [1, 6, 6, 6]; // Chart, Fund, Org, Program
const CFOAP_SEGMENTS = [1, 6, 6, 6, 6]; // Chart, Fund, Org, Account, Program

/**
 * Remove all dashes from the input string
 */
function stripDashes(value: string): string {
    return value.replace(/-/g, "");
}

/**
 * Remove all characters except alphanumeric and dashes
 */
function sanitizeInput(value: string): string {
    return value.replace(/[^a-zA-Z0-9-]/g, "");
}

/**
 * Detect format based on cleaned string length
 */
function detectFormat(cleaned: string): "cfop" | "cfoap" {
    if (props.format !== "auto") {
        return props.format;
    }
    // CFOP = 19 chars, CFOAP = 25 chars
    // If length is closer to 19, assume CFOP; closer to 25, assume CFOAP
    const cfopTotal = 19;
    const cfoapTotal = 25;
    
    if (cleaned.length <= 19) {
        return "cfop";
    } else {
        return "cfoap";
    }
}

/**
 * Format the string with dashes according to the format
 */
function formatWithDashes(value: string, formatType: "cfop" | "cfoap"): string {
    const cleaned = stripDashes(sanitizeInput(value));
    const segments = formatType === "cfop" ? CFOP_SEGMENTS : CFOAP_SEGMENTS;
    
    let result = "";
    let pos = 0;
    
    for (let i = 0; i < segments.length; i++) {
        const segmentLength = segments[i];
        const segment = cleaned.substring(pos, pos + segmentLength);
        
        if (segment.length > 0) {
            result += segment;
            if (i < segments.length - 1 && pos + segmentLength < cleaned.length) {
                result += "-";
            }
        }
        
        pos += segmentLength;
    }
    
    return result;
}

/**
 * Update the display value based on the current input
 */
function updateDisplay(value: string) {
    const sanitized = sanitizeInput(value);
    const cleaned = stripDashes(sanitized);
    const format = detectFormat(cleaned);
    displayValue.value = formatWithDashes(sanitized, format);
}

/**
 * Get cursor position in the cleaned string (without dashes)
 */
function getCleanedCursorPosition(input: HTMLInputElement): number {
    const cursorPos = input.selectionStart ?? 0;
    const beforeCursor = input.value.substring(0, cursorPos);
    return stripDashes(beforeCursor).length;
}

/**
 * Set cursor position accounting for dashes in the display
 */
function setCleanedCursorPosition(input: HTMLInputElement, cleanedPos: number) {
    const cleaned = stripDashes(input.value);
    const format = detectFormat(cleaned);
    const segments = format === "cfop" ? CFOP_SEGMENTS : CFOAP_SEGMENTS;
    
    let displayPos = 0;
    let cleanPos = 0;
    
    for (let i = 0; i < segments.length && cleanPos < cleanedPos; i++) {
        const segmentLength = segments[i];
        const charsToAdd = Math.min(segmentLength, cleanedPos - cleanPos);
        
        displayPos += charsToAdd;
        cleanPos += charsToAdd;
        
        // Add dash if not at the end and there are more characters
        if (i < segments.length - 1 && cleanPos < cleanedPos) {
            displayPos += 1; // Account for dash
        }
    }
    
    input.setSelectionRange(displayPos, displayPos);
}

// Initialize display from model
watch(() => model.value, (newValue) => {
    if (newValue) {
        updateDisplay(newValue);
    } else {
        displayValue.value = "";
    }
}, { immediate: true });

function emitChangeIfNeeded(val: string | null) {
    const cleaned = val ? stripDashes(val) : null;
    const currentCleaned = model.value ? stripDashes(model.value) : null;
    
    if (cleaned !== currentCleaned) {
        const prev = model.value;
        model.value = cleaned;
        emit("change", {
            was: prev,
            to: cleaned,
        });
    }
}

let inputTimer: ReturnType<typeof setTimeout> | null = null;

function onBeforeInput(e: InputEvent) {
    // Prevent input of invalid characters (anything except alphanumeric and dash)
    if (e.data && !/^[a-zA-Z0-9-]*$/.test(e.data)) {
        e.preventDefault();
    }
}

function onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const cleanedCursorPos = getCleanedCursorPosition(input);
    
    // Sanitize the input value
    const sanitized = sanitizeInput(input.value);
    
    updateDisplay(sanitized);
    input.value = displayValue.value;
    
    // Restore cursor position
    setCleanedCursorPosition(input, cleanedCursorPos);
    
    if (inputTimer) {
        clearTimeout(inputTimer);
    }
    inputTimer = setTimeout(() => {
        emitChangeIfNeeded(displayValue.value);
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
    e.preventDefault();
    
    const pastedText = e.clipboardData?.getData("text") ?? "";
    const sanitizedPaste = sanitizeInput(pastedText);
    const input = e.target as HTMLInputElement;
    const cleanedCursorPos = getCleanedCursorPosition(input);
    
    // Get current value and selection
    const currentValue = input.value;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    
    // Replace selected text with pasted text
    const newValue = currentValue.substring(0, start) + sanitizedPaste + currentValue.substring(end);
    
    // Update display
    updateDisplay(newValue);
    input.value = displayValue.value;
    
    // Set cursor after pasted content
    const pastedCleaned = stripDashes(sanitizedPaste);
    setCleanedCursorPosition(input, cleanedCursorPos + pastedCleaned.length);
    
    if (inputTimer) {
        clearTimeout(inputTimer);
        inputTimer = null;
    }
    
    emitChangeIfNeeded(displayValue.value);
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
            ref="inputRef"
            :value="displayValue"
            :placeholder="props.placeholder"
            :disabled="props.disabled"
            @beforeinput="onBeforeInput"
            @input="onInput"
            @blur="onBlur"
            @paste="onPaste"
            @keydown="onKeydown"
            type="text"
            class="g-accounting-string-input"
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
.g-accounting-string-input-has-error {
    .g-accounting-string-input {
        border-color: var(--g-danger-600);
        background: var(--g-danger-100);
    }
}
.g-accounting-string-input:disabled {
    background: var(--g-surface-100);
    color: var(--g-surface-700);
}
.error-message {
    background: var(--g-surface-0);
    color: var(--g-danger-600);
    padding: 0.25em 0.5em;
}
.g-accounting-string-input-error-icon {
    height: 1.2em;
    padding: 0.2em 0;
    display: inline;
    margin: 0 0.2em 0 0;
    vertical-align: middle;
}
</style>
