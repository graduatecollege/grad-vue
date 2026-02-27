<script setup lang="ts">
/**
 * By default, this component behaves like a normal select element with
 * custom styling.
 *
 * The component can be marked `searchable` to enable search functionality.
 * This turns it into a text input that filters the options. Filtering is
 * done with a simple lower-case string search.
 *
 * The `options` prop can be an array of strings or objects with `label`
 * and `value` properties.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch, inject } from "vue";
import { useOverlayStack } from "../compose/useOverlayStack.ts";
import { UseFormReturn } from "../compose/useForm.ts";

interface OptionType {
    label: string;
    value: string | number;
}

interface Props {
    // List of options to choose from
    options: Array<string | OptionType>;
    /**
     * Accessible label
     */
    label: string; // Demo: Select Option
    /**
     * Hide the label visually
     */
    hiddenLabel?: boolean;
    /**
     * Placeholder
     *
     * Only used if the component is searchable.
     */
    placeholder?: string;
    /**
     * Disabled
     */
    disabled?: boolean;
    /**
     * Name
     */
    name?: string;
    /**
     * Searchable
     */
    searchable?: boolean;
    /**
     * Show clear button
     */
    clearButton?: boolean;
    /**
     * Compact
     */
    compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    name: undefined,
    searchable: false,
    compact: false,
});
const emit = defineEmits(["change"]);
const model = defineModel<string | number | null>();

const baseId = useId();
const comboRef = ref<HTMLElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);
const open = ref(false);
const activeIndex = ref(0);
const ignoreBlur = ref(false);
const ignoreFocus = ref(false);
const { push, pop, isTop } = useOverlayStack(baseId);

const form = inject<UseFormReturn | null>("form", null);
const errorMessage = ref("");

if (form && props.name) {
    onMounted(() => {
        form.registerField(props.name!, {
            name: props.name!,
            value: model,
            error: errorMessage,
            setValue: (value: any) => {
                model.value = value;
            },
            setError: (error: string) => {
                errorMessage.value = error;
            },
        });
    });

    onBeforeUnmount(() => {
        if (props.name) {
            form.unregisterField(props.name);
        }
    });
}

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
    if (!open.value) {
        return;
    }
    if (!comboRef.value) {
        return;
    }

    const rect = comboRef.value.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const listboxFullHeight = listboxRef.value?.scrollHeight ?? 200;
    const minSpaceToOpenBelow = Math.min(200, listboxFullHeight);
    const gap = 8;

    if (spaceBelow >= minSpaceToOpenBelow) {
        menuPlacement.value = "below";
        menuMaxHeight.value = Math.max(0, Math.floor(spaceBelow - gap));
        return;
    }

    if (spaceBelow < minSpaceToOpenBelow && spaceAbove > spaceBelow) {
        menuPlacement.value = "above";
        menuMaxHeight.value = Math.max(0, Math.floor(spaceAbove - gap));
        return;
    }

    menuPlacement.value = "below";
    menuMaxHeight.value = Math.max(0, Math.floor(spaceBelow - gap));
}

let removeWindowListeners: (() => void) | null = null;

function addWindowListeners() {
    if (removeWindowListeners) {
        return;
    }
    const onChange = () => {
        updateMenuPlacement();
    };
    window.addEventListener("resize", onChange, { passive: true });
    window.addEventListener("scroll", onChange, {
        passive: true,
        capture: true,
    });
    removeWindowListeners = () => {
        window.removeEventListener("resize", onChange);
        window.removeEventListener("scroll", onChange, true);
        removeWindowListeners = null;
    };
}

function removeListeners() {
    if (!removeWindowListeners) {
        return;
    }
    removeWindowListeners();
}

const normalizedOptions = computed(() => {
    return props.options.map((opt) => {
        if (typeof opt === "string") {
            return { label: opt, value: opt };
        } else {
            return opt;
        }
    });
});

const searchQuery = ref("");

const filteredOptions = computed(() => {
    if (!props.searchable || !open.value || !searchQuery.value) {
        return normalizedOptions.value;
    }
    const q = searchQuery.value.toLowerCase();
    return normalizedOptions.value.filter((opt) =>
        opt.label.toLowerCase().includes(q),
    );
});

const selectedIndex = computed(() => {
    return filteredOptions.value.findIndex((opt) => opt.value === model.value);
});

watch(
    () => model.value,
    (val) => {
        const idx = filteredOptions.value.findIndex((opt) => opt.value === val);
        if (idx !== -1) {
            activeIndex.value = idx;
        }
    },
);

// Watch for open state to manage overlay stack
watch(open, (val) => {
    if (val) {
        push();
    } else {
        pop();
    }
});

watch(open, (val) => {
    if (val) {
        addWindowListeners();
        nextTick(() => {
            updateMenuPlacement();
        });
    } else {
        removeListeners();
        menuPlacement.value = "below";
        menuMaxHeight.value = null;
    }
});

function openMenu() {
    if (props.disabled) {
        return;
    }
    open.value = true;
    nextTick(() => {
        updateMenuPlacement();
    });
    if (props.searchable) {
        searchQuery.value = "";
        // If a value is selected, highlight it in filtered list
        const idx = filteredOptions.value.findIndex(
            (opt) => opt.value === model.value,
        );
        activeIndex.value = idx !== -1 ? idx : 0;
        nextTick(() => {
            if (comboInputRef.value) {
                comboInputRef.value.focus();
            }
        });
    }
}

function closeMenu() {
    open.value = false;
    if (props.searchable) {
        searchQuery.value = "";
    }
}

onBeforeUnmount(() => {
    removeListeners();
});

const comboInputRef = ref<HTMLInputElement | null>(null);

function onComboFocus(e: FocusEvent) {
    if (props.disabled) {
        return;
    }
    if (props.searchable) {
        if (ignoreFocus.value) {
            ignoreFocus.value = false;
            return;
        }
        openMenu();
    }
}

function onComboInput(e: Event) {
    if (!props.searchable) return;
    // If closed and user types, open and start search
    if (!open.value) {
        openMenu();
    }
    searchQuery.value = (e.target as HTMLInputElement).value;
    // Always highlight the first filtered option, or selected if present
    const idx = filteredOptions.value.findIndex(
        (opt) => opt.value === model.value,
    );
    activeIndex.value = idx !== -1 ? idx : 0;
}

function onComboBlur(e: FocusEvent) {
    // Prevent closing if focus moves to the dropdown menu (e.g. scrollbar interaction)
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (ignoreBlur.value) {
        ignoreBlur.value = false;
        return;
    }
    if (
        relatedTarget &&
        listboxRef.value &&
        listboxRef.value.contains(relatedTarget)
    ) {
        // Focus moved inside the dropdown, don't close
        return;
    }
    if (props.searchable) {
        searchQuery.value = "";
    }
    closeMenu();
}

function selectOption(idx: number) {
    const opt = filteredOptions.value[idx];
    if (opt && opt.value !== model.value) {
        model.value = opt.value;
        emit("change", opt.value);
    }
    ignoreFocus.value = true;
    closeMenu();
    // We want to ignore the focus just briefly so it doesn't re-open
    setTimeout(() => {
        ignoreFocus.value = false;
    }, 100);
}

function onComboClick() {
    if (props.disabled) {
        return;
    }
    if (!open.value) {
        openMenu();
    } else {
        closeMenu();
    }
}

function onComboKeydown(e: KeyboardEvent) {
    if (props.disabled) {
        return;
    }
    const max = filteredOptions.value.length - 1;
    if (!open.value && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
        return;
    }
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
        case " ":
            e.preventDefault();
            if (open.value) {
                selectOption(activeIndex.value);
            } else {
                openMenu();
            }
            break;
        case "Escape":
            if (isTop.value) {
                e.preventDefault();
                setTimeout(() => {
                    closeMenu();
                }, 0);
            }
            break;
    }
}

function onOptionClick(idx: number) {
    selectOption(idx);
}

function onOptionMouseDown() {
    ignoreBlur.value = true;
}

function scrollOptionIntoView() {
    nextTick(() => {
        const el = document.getElementById(
            `${baseId}-option-${activeIndex.value}`,
        );
        if (el) {
            el.scrollIntoView({ block: "nearest" });
        }
    });
}

const showClearButton = computed(() => {
    return (
        props.clearButton &&
        model.value !== null &&
        model.value !== undefined &&
        !props.disabled
    );
});

function clearValue() {
    if (!props.disabled) {
        model.value = null;
        emit("change", null);
        if (props.searchable) {
            searchQuery.value = "";
        }
    }
}

onBeforeUnmount(() => {
    pop();
});
</script>

<template>
    <div
        class="g-select-root g-select-combo"
        :class="{ 'g-select-open': open, 'g-select-compact': compact }"
    >
        <div
            v-if="!hiddenLabel"
            :id="baseId + '-label'"
            class="g-select-combo-label g-select-label"
        >
            {{ props.label }}
        </div>
        <div class="g-select-input-wrap">
            <div
                v-if="props.searchable"
                class="g-select-combo-input g-select-control"
                :id="baseId"
            >
                <input
                    ref="comboRef"
                    type="text"
                    name="comboInput"
                    class="g-select-search-input"
                    :class="{ 'g-select-clearable': clearButton }"
                    :value="
                        open
                            ? searchQuery
                            : normalizedOptions[selectedIndex]
                              ? normalizedOptions[selectedIndex].label
                              : ''
                    "
                    :placeholder="open ? '' : placeholder"
                    :disabled="props.disabled"
                    @focus="onComboFocus"
                    @input="onComboInput"
                    @keydown="onComboKeydown"
                    @blur="onComboBlur"
                    :aria-autocomplete="'list'"
                    :aria-controls="baseId + '-listbox'"
                    :aria-expanded="open ? 'true' : 'false'"
                    aria-haspopup="listbox"
                    :aria-activedescendant="
                        open ? baseId + '-option-' + activeIndex : undefined
                    "
                    v-bind="
                        hiddenLabel
                            ? { 'aria-label': props.label }
                            : { 'aria-labelledby': baseId + '-label' }
                    "
                    role="combobox"
                    autocomplete="off"
                />
                <button
                    v-if="showClearButton"
                    type="button"
                    class="g-select-clear-btn"
                    @click="clearValue"
                >
                    <svg
                        role="img"
                        aria-label="Clear Selection"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 51.26 51.26"
                        width="1.125em"
                    >
                        <path
                            fill="currentColor"
                            d="m37.84 32.94-7.63-7.63 7.63-7.63a3.24 3.24 0 0 0-4.58-4.58l-7.63 7.63L18 13.1a3.24 3.24 0 0 0-4.58 4.58L21 25.31l-7.62 7.63A3.24 3.24 0 1 0 18 37.52l7.63-7.63 7.63 7.63a3.24 3.24 0 0 0 4.58-4.58Z"
                        />
                    </svg>
                </button>

                <svg
                    class="g-select-caret"
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
            <div
                v-else
                ref="comboRef"
                :id="baseId"
                class="g-select-combo-button g-select-control"
                :class="{ 'g-select-clearable': clearButton }"
                role="combobox"
                :aria-controls="baseId + '-listbox'"
                :aria-expanded="open ? 'true' : 'false'"
                aria-haspopup="listbox"
                v-bind="
                    hiddenLabel
                        ? { 'aria-label': props.label }
                        : { 'aria-labelledby': baseId + '-label' }
                "
                :aria-activedescendant="
                    open ? baseId + '-option-' + activeIndex : undefined
                "
                tabindex="0"
                @click="onComboClick"
                @keydown="onComboKeydown"
                @focus="onComboFocus"
                @blur="onComboBlur"
            >
                {{
                    normalizedOptions[selectedIndex]
                        ? normalizedOptions[selectedIndex].label
                        : ""
                }}
                <button
                    v-if="showClearButton"
                    type="button"
                    class="g-select-clear-btn"
                    @click.stop="clearValue"
                >
                    <svg
                        role="img"
                        aria-label="Clear Selection"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 51.26 51.26"
                        width="1.125em"
                    >
                        <path
                            fill="currentColor"
                            d="m37.84 32.94-7.63-7.63 7.63-7.63a3.24 3.24 0 0 0-4.58-4.58l-7.63 7.63L18 13.1a3.24 3.24 0 0 0-4.58 4.58L21 25.31l-7.62 7.63A3.24 3.24 0 1 0 18 37.52l7.63-7.63 7.63 7.63a3.24 3.24 0 0 0 4.58-4.58Z"
                        />
                    </svg>
                </button>

                <svg
                    class="g-select-caret"
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
            <div
                v-show="open"
                ref="listboxRef"
                class="g-select-combo-menu g-select-list"
                :class="{
                    'g-select-combo-menu--above': menuPlacement === 'above',
                }"
                :style="menuStyle"
                role="listbox"
                :id="baseId + '-listbox'"
                v-bind="
                    hiddenLabel
                        ? { 'aria-label': props.label }
                        : { 'aria-labelledby': baseId + '-label' }
                "
                tabindex="-1"
            >
                <template v-if="filteredOptions.length > 0">
                    <div
                        v-for="(option, idx) in filteredOptions"
                        :key="option.value"
                        :id="baseId + '-option-' + idx"
                        class="g-select-combo-option g-select-option"
                        :class="{
                            'g-select-option-current': idx === activeIndex,
                            'ilw-theme-blue': option.value === model,
                        }"
                        role="option"
                        :aria-selected="
                            option.value === model ? 'true' : 'false'
                        "
                        @mousedown="onOptionMouseDown"
                        @click="onOptionClick(idx)"
                    >
                        <slot
                            name="option"
                            :option="option"
                            :selected="option.value === model"
                            :index="idx"
                        >
                            {{ option.label }}
                        </slot>
                    </div>
                </template>
                <template v-else>
                    <div
                        aria-live="polite"
                        class="g-select-combo-option g-select-option g-select-no-results"
                    >
                        No results found.
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.g-select-root {
    position: relative;
    font-size: 1rem;
}

.g-select-label {
    font-weight: 700;
    color: var(--g-surface-900);
    margin-bottom: 0.5em;
}

.g-select-input-wrap {
    position: relative;
}

.g-select-control {
    line-height: 1.5;
    cursor: pointer;
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    border: 2px solid var(--g-primary-500);
    border-radius: var(--g-border-radius-m);
    text-align: left;
    position: relative;

    &:focus-visible {
        background: var(--g-info-200);
        color: var(--g-primary-500);
    }

    &:has(:focus-visible) {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 1px;
        box-shadow: 0 0 0 2px var(--g-info-200);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.g-select-combo-button {
}

.g-select-caret {
    position: absolute;
    right: 0.5em;
    line-height: 1.5em;
    top: calc(50% - 0.55em);
    color: var(--g-accent-700);
    pointer-events: none;

    transform: rotate(90deg);
}

.g-select-open .g-select-caret {
    transform: rotate(-90deg);
}

.g-select-combo-menu {
    background-color: var(--g-surface-0);
    border: 2px solid var(--g-surface-700);
    border-radius: 0 0 var(--g-border-radius-m) var(--g-border-radius-m);
    box-sizing: border-box;
    box-shadow:
        0 4px 4px rgba(0, 0, 0, 0.2),
        0 1px 0 1px rgba(0, 0, 0, 0.18);
    max-height: 50vh;
    overflow-y: auto;
    left: 0;
    position: absolute;
    top: 100%;
    width: 100%;
    z-index: 1000;
    display: none;
}

.g-select-combo-menu--above {
    border-radius: var(--g-border-radius-m) var(--g-border-radius-m) 0 0;
}

.g-select-open .g-select-combo-menu {
    display: block;
}

.g-select-combo-option {
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

.g-select-option-current {
    background: var(--g-primary-500);
    color: var(--g-primary-text);

    &:hover {
        color: var(--g-primary-text);
    }
}

.g-select-search-input {
    box-sizing: border-box;
    display: block;
    width: 100%;
    font-family: var(--il-font-sans);
    border: none;
    box-sizing: border-box;
    text-overflow: ellipsis;
    font-size: 1em;

    &.g-select-clearable {
        padding-right: 3.5em; /* Space for clear button */
    }
}

.g-select-search-input,
.g-select-combo-button {
    padding: 0.25em 2em 0.25em 0.75em;
    line-height: 1.875em;
    box-sizing: border-box;
}
.g-select-combo-button {
    /* Padding + line height + padding + border */
    min-height: calc(0.25em + 1.875em + 0.25em + 4px);
    min-width: 8rem;
}

.g-select-compact {
    font-size: 0.875rem;
}

.g-select-search-input,
.g-select-combo-button {
    &.g-select-clearable {
        padding-right: 3em; /* Space for clear button */
    }
}

.g-select-no-results {
    padding: 0.25em 1em;
    text-align: center;
    color: var(--g-surface-900);
    font-style: italic;
}

.g-select-clear-btn {
    position: absolute;
    right: 1.25em;
    top: calc(50% - 1.15em);
    background: none;
    border: none;
    color: var(--g-accent-700);
    font-size: 1.25em;
    cursor: pointer;
    padding: 0.6em 0.3em 0.4em;
    line-height: 1;

    &:hover {
        color: var(--g-accent-700);
    }
    &:focus {
        background: var(--g-info-200);
        color: var(--g-primary-500);
    }
}
</style>
