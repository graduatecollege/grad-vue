<script lang="ts">
/**
 * A multi-select combobox that allows selecting multiple values with
 * optional search/filter support.
 *
 * Selected values are displayed as removable chips inside the control.
 * The dropdown listbox shows all (or filtered) options with a checkmark
 * next to each selected option.
 *
 * The `options` prop accepts an array of strings or `{ label, value }`
 * objects. The `v-model` binds to an array of `string | number` values.
 *
 * In standard Vue usage, this registers with the nearest parent `GForm` via
 * injection. In custom-elements mode, use matching `form-key` values to pair
 * with a `GForm`.
 *
 * Keyboard navigation:
 * - `ArrowDown` / `ArrowUp`: move through options (opens menu if closed)
 * - `Enter`: toggle the focused option
 * - `Space`: toggle the focused option when the search field is empty
 * - `Escape`: close the dropdown
 * - `Home` / `End`: jump to first / last option
 * - `Backspace`: remove the last chip when the search field is empty
 */
export default {};
</script>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    ref,
    toRef,
    useId,
    watch,
} from "vue";
import { useOverlayStack } from "../compose/useOverlayStack.ts";
import { useFormField } from "../compose/useFormField.ts";
import GFormErrorMessages from "./form/GFormErrorMessages.vue";

export type MultiSelectOption = {
    label: string;
    value: string | number;
};

type Props = {
    /**
     * List of options to choose from
     */
    options: Array<string | MultiSelectOption>;
    /**
     * Accessible label
     * @demo Multi Select
     */
    label: string;
    /**
     * Hide the label visually
     * @demo
     */
    hiddenLabel?: boolean;
    /**
     * Placeholder text shown when no values are selected
     * @demo
     */
    placeholder?: string;
    /**
     * Disabled
     * @demo
     */
    disabled?: boolean;
    /**
     * Name for form registration
     */
    name?: string;
    /**
     * Error messages array (supports multiple validation errors)
     */
    errors?: string[];
    /**
     * Instructions shown below the label
     * @demo
     */
    instructions?: string;
    /**
     * Form channel key for custom elements mode
     */
    formKey?: string;
};

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    hiddenLabel: false,
    placeholder: undefined,
    name: undefined,
    errors: () => [],
    instructions: undefined,
    formKey: undefined,
});

const emit = defineEmits<{
    change: [value: Array<string | number>];
}>();

const model = defineModel<Array<string | number>>({ default: () => [] });

const baseId = useId();
const inputRef = ref<HTMLInputElement | null>(null);
const controlRef = ref<HTMLElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);

const open = ref(false);
const activeIndex = ref(0);
const searchQuery = ref("");
const ignoreBlur = ref(false);

const { push, pop, isTop } = useOverlayStack(baseId);

const { displayErrors, hasErrors } = useFormField({
    name: props.name,
    value: model,
    errors: toRef(props, "errors"),
    formKey: props.formKey,
});

const normalizedOptions = computed<MultiSelectOption[]>(() =>
    props.options.map((opt) =>
        typeof opt === "string" ? { label: opt, value: opt } : opt,
    ),
);

const filteredOptions = computed<MultiSelectOption[]>(() => {
    if (!searchQuery.value) return normalizedOptions.value;
    const q = searchQuery.value.toLowerCase();
    return normalizedOptions.value.filter((opt) =>
        opt.label.toLowerCase().includes(q),
    );
});

function isSelected(value: string | number): boolean {
    return model.value.includes(value);
}

function labelForValue(value: string | number): string {
    const opt = normalizedOptions.value.find((o) => o.value === value);
    return opt ? opt.label : String(value);
}

// ----- Menu placement -----

const menuPlacement = ref<"below" | "above">("below");
const menuMaxHeight = ref<number | null>(null);

const menuStyle = computed(() => {
    const style: Record<string, string> = {};
    if (menuMaxHeight.value !== null) {
        style.maxHeight = `${menuMaxHeight.value}px`;
    }
    if (menuPlacement.value === "above") {
        style.top = "auto";
        style.bottom = "100%";
    } else {
        style.top = "100%";
        style.bottom = "auto";
    }
    return style;
});

function updateMenuPlacement() {
    if (!open.value || !controlRef.value) return;
    const rect = controlRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const listboxFullHeight = listboxRef.value?.scrollHeight ?? 200;
    const minSpaceToOpenBelow = Math.min(200, listboxFullHeight);
    const gap = 8;

    if (spaceBelow >= minSpaceToOpenBelow) {
        menuPlacement.value = "below";
        menuMaxHeight.value = Math.max(0, Math.floor(spaceBelow - gap));
    } else if (spaceAbove > spaceBelow) {
        menuPlacement.value = "above";
        menuMaxHeight.value = Math.max(0, Math.floor(spaceAbove - gap));
    } else {
        menuPlacement.value = "below";
        menuMaxHeight.value = Math.max(0, Math.floor(spaceBelow - gap));
    }
}

let removeWindowListeners: (() => void) | null = null;

function addWindowListeners() {
    if (removeWindowListeners) return;
    const onChange = () => updateMenuPlacement();
    window.addEventListener("resize", onChange, { passive: true });
    window.addEventListener("scroll", onChange, { passive: true, capture: true });
    removeWindowListeners = () => {
        window.removeEventListener("resize", onChange);
        window.removeEventListener("scroll", onChange, true);
        removeWindowListeners = null;
    };
}

function removeListeners() {
    if (removeWindowListeners) removeWindowListeners();
}

watch(open, (val) => {
    if (val) {
        push();
        addWindowListeners();
        nextTick(() => updateMenuPlacement());
    } else {
        pop();
        removeListeners();
        menuPlacement.value = "below";
        menuMaxHeight.value = null;
    }
});

onBeforeUnmount(() => {
    removeListeners();
    pop();
});

// ----- Open / close -----

function openMenu() {
    if (props.disabled) return;
    open.value = true;
    activeIndex.value = 0;
    nextTick(() => updateMenuPlacement());
}

function closeMenu() {
    open.value = false;
    searchQuery.value = "";
}

// ----- Option interaction -----

function toggleOption(idx: number) {
    const opt = filteredOptions.value[idx];
    if (!opt) return;
    const current = model.value;
    const next: Array<string | number> = isSelected(opt.value)
        ? current.filter((v) => v !== opt.value)
        : [...current, opt.value];
    model.value = next;
    emit("change", next);
    nextTick(() => inputRef.value?.focus());
}

function removeValue(value: string | number) {
    if (props.disabled) return;
    const next = model.value.filter((v) => v !== value);
    model.value = next;
    emit("change", next);
}

// ----- Event handlers -----

function onControlClick() {
    if (props.disabled) return;
    inputRef.value?.focus();
    if (!open.value) openMenu();
}

function onInput(e: Event) {
    searchQuery.value = (e.target as HTMLInputElement).value;
    activeIndex.value = 0;
    if (!open.value) openMenu();
}

function onFocus() {
    if (props.disabled) return;
    if (!open.value) openMenu();
}

function onBlur(e: FocusEvent) {
    if (ignoreBlur.value) {
        ignoreBlur.value = false;
        return;
    }
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget && listboxRef.value?.contains(relatedTarget)) {
        return;
    }
    if (relatedTarget && controlRef.value?.contains(relatedTarget)) {
        return;
    }
    closeMenu();
}

function onOptionMouseDown(e: MouseEvent) {
    e.preventDefault();
    ignoreBlur.value = true;
}

function onChipMouseDown() {
    ignoreBlur.value = true;
}

function scrollOptionIntoView() {
    nextTick(() => {
        const el = document.getElementById(
            `${baseId}-option-${activeIndex.value}`,
        );
        if (el) el.scrollIntoView({ block: "nearest" });
    });
}

function onKeydown(e: KeyboardEvent) {
    if (props.disabled) return;
    const max = filteredOptions.value.length - 1;

    switch (e.key) {
        case "ArrowDown":
            e.preventDefault();
            if (!open.value) {
                openMenu();
            } else {
                activeIndex.value = Math.min(max, activeIndex.value + 1);
                scrollOptionIntoView();
            }
            break;
        case "ArrowUp":
            e.preventDefault();
            if (!open.value) {
                openMenu();
            } else {
                activeIndex.value = Math.max(0, activeIndex.value - 1);
                scrollOptionIntoView();
            }
            break;
        case "Home":
            e.preventDefault();
            activeIndex.value = 0;
            scrollOptionIntoView();
            break;
        case "End":
            e.preventDefault();
            activeIndex.value = max;
            scrollOptionIntoView();
            break;
        case "Enter":
            e.preventDefault();
            if (open.value && filteredOptions.value.length > 0) {
                toggleOption(activeIndex.value);
            } else if (!open.value) {
                openMenu();
            }
            break;
        case " ":
            if (open.value && !searchQuery.value) {
                e.preventDefault();
                if (filteredOptions.value.length > 0) {
                    toggleOption(activeIndex.value);
                }
            }
            break;
        case "Escape":
            if (isTop.value) {
                e.preventDefault();
                setTimeout(() => closeMenu(), 0);
            }
            break;
        case "Backspace":
            if (!searchQuery.value && model.value.length > 0) {
                removeValue(model.value[model.value.length - 1]);
            }
            break;
    }
}

// ----- IDs -----

const labelId = computed(() => `${baseId}-label`);
const instructionsId = computed(() => `${baseId}-instructions`);
const errorId = computed(() => `error-message-${baseId}`);

const describedBy = computed(() => {
    const parts: string[] = [];
    if (props.instructions) parts.push(instructionsId.value);
    if (hasErrors.value) parts.push(errorId.value);
    return parts.length > 0 ? parts.join(" ") : undefined;
});
</script>

<template>
    <div
        class="g-multiselect-root"
        :class="{
            'g-multiselect-open': open,
            'g-multiselect-has-error': hasErrors,
        }"
    >
        <!-- Label -->
        <div
            v-if="!hiddenLabel"
            :id="labelId"
            class="g-multiselect-label"
        >
            {{ label }}
        </div>

        <!-- Instructions -->
        <div
            v-if="instructions"
            :id="instructionsId"
            class="g-multiselect-instructions"
        >
            {{ instructions }}
        </div>

        <!-- Control: chips + search input -->
        <div
            ref="controlRef"
            class="g-multiselect-control"
            :class="{ 'g-multiselect-control--disabled': disabled }"
            @click="onControlClick"
        >
            <!-- Selected value chips -->
            <span
                v-for="val in model"
                :key="val"
                class="g-multiselect-chip"
            >
                <span class="g-multiselect-chip-label">{{ labelForValue(val) }}</span>
                <button
                    type="button"
                    class="g-multiselect-chip-remove"
                    :aria-label="`Remove ${labelForValue(val)}`"
                    :disabled="disabled"
                    @mousedown="onChipMouseDown"
                    @click.stop="removeValue(val)"
                >
                    <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 51.26 51.26"
                        width="0.75em"
                    >
                        <path
                            fill="currentColor"
                            d="m37.84 32.94-7.63-7.63 7.63-7.63a3.24 3.24 0 0 0-4.58-4.58l-7.63 7.63L18 13.1a3.24 3.24 0 0 0-4.58 4.58L21 25.31l-7.62 7.63A3.24 3.24 0 1 0 18 37.52l7.63-7.63 7.63 7.63a3.24 3.24 0 0 0 4.58-4.58Z"
                        />
                    </svg>
                </button>
            </span>

            <!-- Search / combobox input -->
            <input
                ref="inputRef"
                type="text"
                role="combobox"
                class="g-multiselect-input"
                :value="searchQuery"
                :placeholder="model.length === 0 ? placeholder : undefined"
                :disabled="disabled"
                autocomplete="off"
                aria-autocomplete="list"
                :aria-expanded="open ? 'true' : 'false'"
                aria-haspopup="listbox"
                :aria-controls="baseId + '-listbox'"
                :aria-activedescendant="
                    open && filteredOptions.length > 0
                        ? baseId + '-option-' + activeIndex
                        : undefined
                "
                v-bind="
                    hiddenLabel
                        ? { 'aria-label': label }
                        : { 'aria-labelledby': labelId }
                "
                :aria-describedby="describedBy"
                @input="onInput"
                @keydown="onKeydown"
                @focus="onFocus"
                @blur="onBlur"
            />

            <!-- Caret -->
            <svg
                class="g-multiselect-caret"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 51.26 51.26"
                aria-hidden="true"
                width="1.125em"
            >
                <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                <path
                    fill="currentColor"
                    d="M38.75 24.13a1.36 1.36 0 0 1 0 2.36l-12.44 7.18-12.43 7.18a1.36 1.36 0 0 1-2.05-1.18V11a1.36 1.36 0 0 1 2.05-1.18L26.31 17Z"
                />
            </svg>
        </div>

        <!-- Listbox dropdown -->
        <div
            v-show="open"
            ref="listboxRef"
            :id="baseId + '-listbox'"
            role="listbox"
            aria-multiselectable="true"
            v-bind="
                hiddenLabel
                    ? { 'aria-label': label }
                    : { 'aria-labelledby': labelId }
            "
            class="g-multiselect-listbox"
            :class="{
                'g-multiselect-listbox--above': menuPlacement === 'above',
            }"
            :style="menuStyle"
            tabindex="-1"
        >
            <template v-if="filteredOptions.length > 0">
                <div
                    v-for="(opt, idx) in filteredOptions"
                    :key="opt.value"
                    :id="baseId + '-option-' + idx"
                    role="option"
                    class="g-multiselect-option"
                    :class="{
                        'g-multiselect-option--active': idx === activeIndex,
                        'g-multiselect-option--selected': isSelected(opt.value),
                    }"
                    :aria-selected="isSelected(opt.value) ? 'true' : 'false'"
                    @mousedown="onOptionMouseDown"
                    @click="toggleOption(idx)"
                >
                    <span class="g-multiselect-option-check" aria-hidden="true">
                        <svg
                            v-if="isSelected(opt.value)"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            width="0.875em"
                        >
                            <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                            <path
                                fill="currentColor"
                                d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                            />
                        </svg>
                    </span>
                    {{ opt.label }}
                </div>
            </template>
            <template v-else>
                <div
                    aria-live="polite"
                    class="g-multiselect-option g-multiselect-no-results"
                >
                    No results found.
                </div>
            </template>
        </div>

        <!-- Error messages -->
        <GFormErrorMessages :errors="displayErrors" :id="errorId" />
    </div>
</template>

<style scoped>
.g-multiselect-root {
    position: relative;
    font-size: 1rem;
}

.g-multiselect-label {
    font-weight: 700;
    color: var(--g-surface-900);
    margin-bottom: 0.5em;
}

.g-multiselect-instructions {
    margin: 0 0 0.5em 0;
    color: var(--g-surface-800);
}

.g-multiselect-control {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375em;
    min-height: calc(0.25em + 1.875em + 0.25em + 4px);
    padding: 0.3em 2.25em 0.3em 0.5em;
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    border: 2px solid var(--g-primary-500);
    border-radius: var(--g-border-radius-m);
    cursor: text;
    position: relative;
    box-sizing: border-box;

    &:focus-within {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 1px;
        box-shadow: 0 0 0 2px var(--g-info-200);
    }
}

.g-multiselect-control--disabled {
    cursor: not-allowed;
    border-color: var(--g-surface-400);
}

.g-multiselect-control--disabled .g-multiselect-input {
    opacity: 0.6;
    cursor: not-allowed;
}

.g-multiselect-control--disabled .g-multiselect-caret {
    opacity: 0.6;
}

.g-multiselect-has-error .g-multiselect-control {
    border-color: var(--g-danger-600);
    background: var(--g-danger-100);
}

.g-multiselect-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    background: var(--g-primary-500);
    color: var(--g-primary-text);
    border-radius: 1em;
    padding: 0.1em 0.4em 0.1em 0.6em;
    font-size: 0.875em;
    line-height: 1.5;
    max-width: 100%;
}

.g-multiselect-chip-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.g-multiselect-chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.15em;
    border-radius: 50%;
    flex-shrink: 0;
    line-height: 1;

    &:hover {
        background: rgba(0, 0, 0, 0.15);
    }

    &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 1px;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
}

.g-multiselect-input {
    flex: 1;
    min-width: 4em;
    border: none;
    background: transparent;
    font-family: var(--il-font-sans);
    font-size: 1em;
    line-height: 1.875em;
    padding: 0;
    outline: none;
    color: var(--g-surface-900);
    cursor: text;

    &:disabled {
        cursor: not-allowed;
    }

    &::placeholder {
        color: var(--g-surface-600);
    }
}

.g-multiselect-caret {
    position: absolute;
    right: 0.5em;
    top: calc(50% - 0.55em);
    color: var(--g-accent-700);
    pointer-events: none;
    transform: rotate(90deg);
    transition: transform 0.15s ease;
}

.g-multiselect-open .g-multiselect-caret {
    transform: rotate(-90deg);
}

.g-multiselect-listbox {
    position: absolute;
    left: 0;
    top: 100%;
    width: 100%;
    z-index: 1000;
    background-color: var(--g-surface-0);
    border: 2px solid var(--g-surface-700);
    border-radius: 0 0 var(--g-border-radius-m) var(--g-border-radius-m);
    box-shadow:
        0 4px 4px rgba(0, 0, 0, 0.2),
        0 1px 0 1px rgba(0, 0, 0, 0.18);
    max-height: 50vh;
    overflow-y: auto;
    box-sizing: border-box;
    display: none;
}

.g-multiselect-open .g-multiselect-listbox {
    display: block;
}

.g-multiselect-listbox--above {
    top: auto;
    bottom: 100%;
    border-radius: var(--g-border-radius-m) var(--g-border-radius-m) 0 0;
}

.g-multiselect-option {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em 0.5em;
    cursor: pointer;
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    border: 2px solid transparent;

    &:hover {
        text-decoration: underline;
        color: var(--g-accent-700);
        border-color: var(--g-accent-700);
    }
}

.g-multiselect-option--active {
    background: var(--g-primary-500);
    color: var(--g-primary-text);

    &:hover {
        color: var(--g-primary-text);
    }
}

.g-multiselect-option-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1em;
    flex-shrink: 0;
}

.g-multiselect-no-results {
    padding: 0.25em 1em;
    text-align: center;
    color: var(--g-surface-900);
    font-style: italic;
}
</style>
