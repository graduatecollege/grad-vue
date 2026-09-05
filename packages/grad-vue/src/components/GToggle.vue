<script lang="ts">
/**
 * A compact two-state toggle for boolean values.
 *
 * Arrow keys and the 'y' and 'n' keys can be used to set the value when the
 * toggle has focus. A `describedby` prop can be passed with an ID to an
 * element to be used as the `aria-describedby` for the toggle group.
 *
 * When the value changes, `v-model` is updated. A `change` event is also
 * emitted if the value changed from user interaction.
 *
 * Slots:
 * - `label`: Custom label content. Defaults to `label` prop if not provided.
 */
export default {};
</script>

<script setup lang="ts">
import { useId } from "vue";

type Props = {
    /**
     * Accessible label
     * @demo Toggle
     */
    label: string;

    /**
     * ID of an element that describes the input
     */
    describedby?: string;

    /**
     * Error message
     * @demo
     */
    error?: string;

    /**
     * Disabled
     * @demo
     */
    disabled?: boolean;
};

const props = defineProps<Props>();
const model = defineModel<boolean>({ default: false });
const emit = defineEmits(["change"]);

function change(val: boolean) {
    const prev = model.value;
    model.value = val;
    if (val !== prev) {
        emit("change", {
            was: prev,
            to: val,
        });
    }
}

function onChange(val: boolean) {
    if (props.disabled) {
        return;
    }
    change(val);
}

function onInputChange(e: Event) {
    if (e.target instanceof HTMLInputElement) {
        onChange(e.target.checked);
    }
}

function onKeydown(e: KeyboardEvent) {
    if (props.disabled) {
        return;
    }
    if (e.key === "n" || e.key === "N" || e.key === "ArrowLeft") {
        change(false);
        e.preventDefault();
    } else if (e.key === "y" || e.key === "Y" || e.key === "ArrowRight") {
        change(true);
        e.preventDefault();
    }
}

const id = useId();
const inputId = useId();
</script>

<template>
    <div class="g-toggle-wrapper">
        <div class="g-toggle-control">
            <label class="g-label" :for="inputId">
                <slot name="label">
                    {{ label }}
                </slot>
            </label>
            <div class="g-toggle" :class="{ 'g-has-error': error }">
                <div
                    class="g-toggle-track"
                    :class="[model ? 'g-right' : 'g-left', { 'g-disabled': disabled }]"
                >
                    <span
                        class="g-toggle-thumb"
                        :class="model ? 'g-right' : 'g-left'"
                        aria-hidden="true"
                    ></span>
                    <input
                        :id="inputId"
                        type="checkbox"
                        :checked="model"
                        :disabled="disabled"
                        :aria-describedby="describedby"
                        :aria-invalid="error ? 'true' : undefined"
                        :aria-errormessage="error ? id + '-error' : undefined"
                        @change="onInputChange"
                        @keydown="onKeydown"
                    />
                </div>
            </div>
        </div>
        <div
            v-if="error"
            :id="`${id}-error`"
            class="g-form-error"
            role="alert"
            aria-atomic="true"
        >
            {{ error }}
        </div>
    </div>
</template>

<style>
.g-toggle-control {
    display: flex;
    margin-bottom: 4px;
    column-gap: 8px;

    .g-label {
        flex: 1;
        font-weight: 600;
        font-size: 0.875rem;
        line-height: 1;
        align-self: center;
        display: block;
    }
}

.g-toggle {
    border: none;
    padding: 0;
    margin: 0;
    width: 40px;
    background: none;
    border-radius: 12px;

    &:focus-within {
        outline: 2px solid var(--il-blue);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--g-info-200);
    }
}

.g-toggle-track {
    display: flex;
    position: relative;
    background: var(--g-surface-700);
    border-radius: 14px;
    height: 24px;
    width: 100%;
    min-width: 40px;
    box-sizing: border-box;
    font-family: var(--il-font-sans);

    &.g-left {
        background: var(--g-surface-500);
    }
    &.g-right {
        background: var(--il-prairie);
    }
    &.g-disabled {
        pointer-events: none;
        background: var(--g-surface-400);
    }
}

.g-toggle-thumb {
    position: absolute;
    top: 2px;
    width: 20px;
    height: 20px;
    background: var(--g-surface-100);
    border-radius: 50%;
    left: 2px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
        left 0.1s ease-in-out,
        background-color 0.1s ease-in-out;
    &.g-right {
        left: calc(100% - 20px - 2px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .g-toggle-thumb {
        transition: none;
    }
}

.g-toggle input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    margin: 0;
    cursor: pointer;
    z-index: 2;
}

.g-has-error .g-toggle-track {
    background: var(--g-danger-500);
}

.g-form-error {
    color: var(--g-danger-600);
    font-size: 0.875rem;
    font-weight: bold;
}
</style>
