<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import { useOverlayStack } from "../compose/useOverlayStack.ts";

interface OptionType {
    label: string;
    value: string | number;
}

interface Props {
    modelValue: string | number | undefined | null;
    options: Array<string | OptionType>;
    label: string;
    hiddenLabel?: boolean;
    disabled?: boolean;
    name?: string;
    searchable?: boolean;
    clearButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    name: undefined,
    searchable: false,
});
const emit = defineEmits(["update:modelValue", "change"]);

const baseId = useId();
const comboRef = ref<HTMLElement | null>(null);
const listboxRef = ref<HTMLElement | null>(null);
const open = ref(false);
const activeIndex = ref(0);
const ignoreBlur = ref(false);
const { push, pop, isTop } = useOverlayStack();

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
    return normalizedOptions.value.filter((opt) => opt.label.toLowerCase().includes(q));
});

const selectedIndex = computed(() => {
    return filteredOptions.value.findIndex((opt) => opt.value === props.modelValue);
});

watch(
    () => props.modelValue,
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

function openMenu() {
    if (props.disabled) {
        return;
    }
    open.value = true;
    if (props.searchable) {
        searchQuery.value = "";
        // If a value is selected, highlight it in filtered list
        const idx = filteredOptions.value.findIndex((opt) => opt.value === props.modelValue);
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

const comboInputRef = ref<HTMLInputElement | null>(null);

function onComboFocus(e: FocusEvent) {
    if (props.disabled) {
        return;
    }
    if (props.searchable) {
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
    const idx = filteredOptions.value.findIndex((opt) => opt.value === props.modelValue);
    activeIndex.value = idx !== -1 ? idx : 0;
}

function onComboBlur(e: FocusEvent) {
    // Prevent closing if focus moves to the dropdown menu (e.g. scrollbar interaction)
    const relatedTarget = (e.relatedTarget as HTMLElement | null);
    if (ignoreBlur.value) {
        ignoreBlur.value = false;
        return;
    }
    if (relatedTarget && listboxRef.value && listboxRef.value.contains(relatedTarget)) {
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
    if (opt && opt.value !== props.modelValue) {
        emit("update:modelValue", opt.value);
        emit("change", opt.value);
    }
    closeMenu();
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
        const el = document.getElementById(`${baseId}-option-${activeIndex.value}`);
        if (el) {
            el.scrollIntoView({ block: "nearest" });
        }
    });
}

const  showClearButton = computed(() => {
    return props.clearButton && props.modelValue !== null && props.modelValue !== undefined && !props.disabled;
})

function clearValue() {
    if (!props.disabled) {
        emit("update:modelValue", null);
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
    <div class="g-select-root g-select-combo" :class="{ 'g-select-open': open }">
        <div v-if="!hiddenLabel" :id="baseId + '-label'" class="g-select-combo-label g-select-label">{{ props.label }}</div>
        <div
            v-if="props.searchable"
            class="g-select-combo-input g-select-control"
            :id="baseId"
            role="combobox"
            :aria-controls="baseId + '-listbox'"
            :aria-expanded="open ? 'true' : 'false'"
            aria-haspopup="listbox"
            v-bind="hiddenLabel ? { 'aria-label': props.label } : { 'aria-labelledby': baseId + '-label' }"
            :aria-activedescendant="open ? baseId + '-option-' + activeIndex : undefined"
        >
            <input
                ref="comboInputRef"
                type="text"
                name="comboInput"
                class="g-select-search-input"
                :class="{ 'g-select-clearable': showClearButton }"
                :value="open ? searchQuery : (normalizedOptions[selectedIndex] ? normalizedOptions[selectedIndex].label : '')"
                :placeholder="open ? '' : props.label"
                :disabled="props.disabled"
                @focus="onComboFocus"
                @input="onComboInput"
                @keydown="onComboKeydown"
                @blur="onComboBlur"
                :aria-autocomplete="'list'"
                :aria-controls="baseId + '-listbox'"
                :aria-expanded="open ? 'true' : 'false'"
                aria-haspopup="listbox"
                :aria-activedescendant="open ? baseId + '-option-' + activeIndex : undefined"
                v-bind="hiddenLabel ? { 'aria-label': props.label } : { 'aria-labelledby': baseId + '-label' }"
                role="combobox"
                autocomplete="off"
            />
            <button
                v-if="showClearButton"
                type="button"
                class="g-select-clear-btn"
                aria-label="Clear selection"
                @click="clearValue"
            >
                <span aria-hidden="true" class="fa fa-regular fa-close"></span>
            </button>
            <span class="fa fa-caret-down g-select-caret"></span>
        </div>
        <div
            v-else
            ref="comboRef"
            :id="baseId"
            class="g-select-combo-button g-select-control"
            role="combobox"
            :aria-controls="baseId + '-listbox'"
            :aria-expanded="open ? 'true' : 'false'"
            aria-haspopup="listbox"
            v-bind="hiddenLabel ? { 'aria-label': props.label } : { 'aria-labelledby': baseId + '-label' }"
            :aria-activedescendant="open ? baseId + '-option-' + activeIndex : undefined"
            tabindex="0"
            @click="onComboClick"
            @keydown="onComboKeydown"
            @focus="onComboFocus"
            @blur="onComboBlur"
        >
            {{ normalizedOptions[selectedIndex] ? normalizedOptions[selectedIndex].label : "" }}
            <button
                v-if="showClearButton"
                type="button"
                class="g-select-clear-btn"
                aria-label="Clear selection"
                @click.stop="clearValue"
            >
                <span aria-hidden="true" class="fa fa-regular fa-close"></span>
            </button>
            <span class="fa fa-caret-down g-select-caret"></span>
        </div>
        <div
            v-show="open"
            ref="listboxRef"
            class="g-select-combo-menu g-select-list"
            role="listbox"
            :id="baseId + '-listbox'"
            v-bind="hiddenLabel ? { 'aria-label': props.label } : { 'aria-labelledby': baseId + '-label' }"
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
                        'ilw-theme-blue': option.value === modelValue,
                    }"
                    role="option"
                    :aria-selected="option.value === modelValue ? 'true' : 'false'"
                    @mousedown="onOptionMouseDown"
                    @click="onOptionClick(idx)"
                >
                    <slot name="option" :option="option" :selected="option.value === modelValue" :index="idx">
                        {{ option.label }}
                    </slot>
                </div>
            </template>
            <template v-else>
                <div aria-live="polite" class="g-select-combo-option g-select-option g-select-no-results">No results found.</div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.g-select-root {
    position: relative;
}

.g-select-label {
    font-weight: 700;
    color: var(--g-surface-900);
    margin-bottom: 0.5rem;
}

.g-select-control {
    font-size: 1.125rem;
    cursor: pointer;
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    border: 2px solid var(--g-primary-500);
    border-radius: var(--g-border-radius-m);
    min-width: 120px;
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
    padding: 0.42rem 1.5rem 0.42rem 1rem;
}

.g-select-caret {
    position: absolute;
    right: 0.5rem;
    line-height: 1.5rem;
    top: calc(50% - 0.8rem);
    color: var(--g-primary-500);
    pointer-events: none;
}

.g-select-combo-menu {
    background-color: var(--g-surface-0);
    border: 1px solid var(--g-surface-200);
    border-radius: 0 0 var(--g-border-radius-m) var(--g-border-radius-m);
    max-height: 50vh;
    overflow-y: auto;
    left: 0;
    position: absolute;
    top: 100%;
    width: 100%;
    z-index: 1000;
    display: none;
}

.g-select-open .g-select-combo-menu {
    display: block;
}

.g-select-combo-option {
    padding: 10px 12px 12px;
    font-size: 1.125rem;
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
    border-color: var(--g-accent-700);
}

.g-select-search-input {
    width: 100%;
    height: 100%;
    padding: 0.5rem 1rem 0.5rem 0.5rem;

    &.g-select-clearable {
        padding-right: 3rem; /* Space for clear button */
    }
}

.g-select-no-results {
    padding: 10px 12px;
    text-align: center;
    color: var(--g-surface-900);
    font-style: italic;
}

.g-select-clear-btn {
    position: absolute;
    right: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--g-accent-700);
    font-size: 1.125rem;
    cursor: pointer;
    padding: 0.5rem;
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
