<script setup lang="ts">
/**
 * This component acts like a radio button group condensed into a compact
 * element with the goal of making it easy to go over many of them at once.
 *
 * In addition to the arrow keys changing the selected value, special key
 * bindings exist for 'y' and 'n' to set yes and no respectively.
 *
 * A `describedby` prop can be passed with an ID to an element to be used as
 * the `aria-describedby` for the group element.
 *
 * When the value changes, `v-model` is updated. A `change` event is also emitted
 * if the value changed from user interaction.
 */
import { ref, computed, watch, useId } from "vue";

interface Props {
    /**
     * Accessible label
     */
    label: string; // Demo: Three-way toggle

    // ID of an element that describes the input
    describedby?: string;

    /**
     * Error message
     */
    error?: string;

    /**
     * Disabled
     */
    disabled?: boolean;
}

const props = defineProps<Props>();
const model = defineModel<boolean | null>({default: () => null});

const emit = defineEmits(["change"]);

function change(val: boolean | null) {
    const prev = model.value;
    model.value = val;
    if (val !== prev) {
        emit("change", {
            was: prev,
            to: val,
        });
    }
}

function onChange(val: boolean | null) {
    if (props.disabled) {
        return;
    }
    if (model.value === val) {
        change(null);
    } else {
        change(val);
    }
}

function onClickLabel(val: boolean) {
    if (props.disabled) {
        return;
    }
    if (model.value === val) {
        change(null);
    }
}

const id = useId();
const radioName = computed(() => `g-three-way-toggle-${id}`);

const leftId = useId();
const centerId = useId();
const rightId = useId();

const thumbPosition = computed(() => {
    if (model.value === false) {
        return "g-left";
    } else if (model.value === true) {
        return "g-right";
    } else {
        return "g-center";
    }
});

function onLabelKeydown(e: KeyboardEvent) {
    if (props.disabled) {
        return;
    }
    if (e.key === "n" || e.key === "N") {
        change(false);
        e.preventDefault();
    } else if (e.key === "y" || e.key === "Y") {
        change(true);
        e.preventDefault();
    }
}
</script>

<template>
    <div class="g-three-way-toggle-wrapper">
        <div class="g-three-way-toggle-control">
            <span class="g-label" :id="id">{{ label }}</span>
            <fieldset
                class="g-three-way-toggle"
                :class="{ 'g-has-error': error }"
                role="radiogroup"
                :aria-labelledby="id"
                :aria-describedby="describedby"
                :disabled="disabled"
                :aria-invalid="error ? 'true' : undefined"
                :aria-errormessage="error ? id + '-error' : undefined"
            >
                <div
                    class="g-toggle-track"
                    :class="[thumbPosition, { 'g-disabled': disabled }]"
                >
                    <span
                        class="g-toggle-thumb"
                        :class="thumbPosition"
                        aria-hidden="true"
                    >
                        <span v-if="model === false">NO</span>
                        <span v-else-if="model === true">YES</span>
                        <span v-else></span>
                    </span>
                    <label
                        :for="leftId"
                        class="g-toggle-option g-left"
                        @click="onClickLabel(false)"
                        @keydown="onLabelKeydown"
                    >
                        <input
                            type="radio"
                            :id="leftId"
                            :name="radioName"
                            :checked="model === false"
                            value="false"
                            :disabled="disabled"
                            @change="onChange(false)"
                        /><span class="ilw-sr-only">No</span>
                    </label>
                    <label
                        :for="centerId"
                        class="g-toggle-option g-center"
                        @keydown="onLabelKeydown"
                    >
                        <input
                            type="radio"
                            :id="centerId"
                            :name="radioName"
                            :checked="model === null"
                            :disabled="disabled"
                            @change="onChange(null)"
                        /><span class="ilw-sr-only">Unset</span>
                    </label>
                    <label
                        :for="rightId"
                        class="g-toggle-option g-right"
                        @click="onClickLabel(true)"
                        @keydown="onLabelKeydown"
                    >
                        <input
                            type="radio"
                            :id="rightId"
                            :name="radioName"
                            value="true"
                            :checked="model === true"
                            :disabled="disabled"
                            @change="onChange(true)"
                        /><span class="ilw-sr-only">Yes</span>
                    </label>
                </div>
            </fieldset>
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

<style scoped>
.g-three-way-toggle-control {
    display: flex;
    margin-bottom: 4px;
    column-gap: 8px;

    .g-label {
        flex: 1;
        font-weight: 600;
        font-size: 0.875rem;
        line-height: 1;
        align-self: center;
    }
}

.g-three-way-toggle {
    border: none;
    padding: 0;
    margin: 0;
    width: 50px;
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
    min-width: 50px;
    box-sizing: border-box;
    font-family: var(--il-font-sans);

    &.g-left {
        background: var(--il-industrial);
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
    font-size: 12px;
    color: var(--g-surface-0);
    font-weight: 700;
    transition:
        left 0.1s ease-in-out,
        background-color 0.1s ease-in-out;
    letter-spacing: -0.5px;
    &.g-left {
        color: var(--il-industrial);
    }
    &.g-right {
        color: var(--il-prairie);
        letter-spacing: -1.5px;
    }
}
.g-toggle-track.g-left .g-toggle-thumb {
    left: 2px;
}
.g-toggle-track.g-center .g-toggle-thumb {
    left: calc(50% - 10px);
}
.g-toggle-track.g-right .g-toggle-thumb {
    left: calc(100% - 20px - 2px);
}

@media (prefers-reduced-motion: reduce) {
    .g-toggle-thumb {
        transition: none;
    }
}

.g-toggle-option {
    flex: 1 1 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    &.g-center {
        flex: 0 0 1%;
    }
}
.g-toggle-option input[type="radio"] {
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

.g-has-error {
    .g-toggle-track {
        background: var(--g-danger-500);
    }
}
.g-form-error {
    color: var(--g-danger-600);
    font-size: 0.875rem;
    font-weight: bold;
}
</style>
