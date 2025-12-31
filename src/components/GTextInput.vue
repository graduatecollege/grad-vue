<script lang="ts" setup>
import { ref, useAttrs, watch } from "vue";
defineOptions({
    inheritAttrs: false,
});

type Props = {
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
};

const props = withDefaults(defineProps<Props>(), {
    placeholder: "",
    disabled: false,
    error: "",
});
const model = defineModel<string | null>({ type: String });

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
    <div class="g-text-input-wrap" :class="{ 'g-text-input-has-error': props.error }">
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
            v-bind="$attrs"
            :aria-invalid="props.error ? 'true' : 'false'"
        />
    </div>
</template>

<style scoped>
.g-text-input-wrap {
    position: relative;
    display: flex;
}
.g-text-input {
    width: 100%;
    padding: 0.5em;
    font-size: 1em;
    border: 2px solid var(--g-primary-500);
    border-radius: 4px;
    background: var(--g-surface-0);
    color: var(--g-surface-950);
}
.g-text-input-has-error {
    .g-text-input {
        border-color: var(--g-danger-600);
        background: var(--g-danger-100);
    }
}
.g-text-input:disabled {
    background: #f5f5f5;
    color: #aaa;
}
.error-message {
    position: absolute;
    top: 0;
    left: 50%;
    background: var(--g-surface-0);
    color: var(--g-danger-600);
    font-size: 0.875em;
    transform: translateY(-100%) translateX(-50%);
    padding: 0.25rem;
    border-radius: 4px;
    border: 2px solid var(--g-danger-600);
    font-weight: bold;
}
</style>
