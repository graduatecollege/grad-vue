<script setup lang="ts" generic="T extends {
    id: string | number;
    title: string;
}">
import { computed, nextTick, ref, watch } from "vue";
import { useDebounceFn, useFocusWithin } from "@vueuse/core";

export interface GSearchGroup<R> {
    type: string;
    label: string;
    items: R[];
}

type Props = {
    modelValue: string | null | undefined;
    results: GSearchGroup<T>[] | T[];
    placeholder?: string;
    ariaLabel?: string;
    auto?: boolean;
    loading?: boolean | null | undefined;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: "Search...",
    ariaLabel: "Search",
});
const emit = defineEmits(["update:modelValue", "select", "submit"]);

const inputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLDivElement | null>(null);
const closed = ref(false);
const activeIndex = ref<number>(-1);
const flatResults = computed(() => {
    if (Array.isArray(props.results) && props.results.length && "items" in props.results[0]) {
        // Grouped results
        return (props.results as GSearchGroup<T>[]).flatMap((g) => g.items);
    } else {
        return props.results as T[];
    }
});
const resultCount = computed(() => flatResults.value.length);

function onInput(ev: Event) {
    closed.value = false;
    const value = (ev.target as HTMLInputElement).value;
    emit("update:modelValue", value);
}

function scrollOptionIntoView() {
    nextTick(() => {
        const el = listboxRef.value?.querySelector('[aria-selected="true"]');
        if (el) {
            el.scrollIntoView({ block: "nearest" });
        }
    });
}

const { focused } = useFocusWithin(inputRef);

function onKeydown(ev: KeyboardEvent) {
    if (!resultCount.value) {
        return;
    }
    const altKey = ev.altKey;
    if (ev.key === "ArrowDown") {
        ev.preventDefault();
        closed.value = false;
        if (!altKey) {
            activeIndex.value = (activeIndex.value + 1) % resultCount.value;
            scrollOptionIntoView();
        }
    } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        closed.value = false;
        activeIndex.value = (activeIndex.value - 1 + resultCount.value) % resultCount.value;
        scrollOptionIntoView();
    } else if (ev.key === "Enter") {
        selectResult(flatResults.value[activeIndex.value]);
    } else if (ev.key === "Escape") {
        ev.preventDefault();
        if (!expanded.value) {
            emit("update:modelValue", "");
        }
        closed.value = true;
        activeIndex.value = -1;
    }
}

function selectResult(result: T | null) {
    emit("select", result);
    emit("update:modelValue", "");
    closed.value = true;
    activeIndex.value = -1;
}

const isLoading = computed(() => {
    return !!props?.loading;
});

const expanded = computed(() => {
    return !!(focused.value && !closed.value && (resultCount.value > 0 || (props?.modelValue?.length && props.modelValue.length > 1)));
});

const submit = useDebounceFn(() => {
    if (props.auto) {
        emit("submit", props.modelValue);
    }
}, 300);

watch(
    () => props.modelValue,
    (val) => {
        if (!val) {
            activeIndex.value = -1;
        } else if (props.auto) {
            // Auto-submit on input change with debounce
            submit();
        }
    },
);
</script>

<template>
    <div class="g-search" role="search" :aria-label="props.ariaLabel">
        <form class="g-search-form" @submit.prevent="selectResult(null)">
            <input
                ref="inputRef"
                class="g-search-input"
                name="search"
                type="search"
                :placeholder="props.placeholder"
                :value="props.modelValue"
                @input="onInput"
                @keydown="onKeydown"
                role="combobox"
                :aria-expanded="expanded"
                aria-autocomplete="list"
                aria-controls="g-search-list"
                :aria-activedescendant="activeIndex >= 0 ? 'g-search-option-' + flatResults[activeIndex].id : undefined"
            />
            <button type="submit" class="g-search-submit" aria-label="Submit search">
                <i v-if="isLoading" class="fa fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>
                <i v-else class="fa fa-magnifying-glass" aria-hidden="true"></i>
            </button>
        </form>
        <div
            v-if="expanded"
            class="g-search-dropdown"
            role="listbox"
            id="g-search-list"
            ref="listboxRef"
            aria-label="Search results"
        >
            <div aria-live="polite" class="g-search-result-count">
                <template v-if="!isLoading"> {{ resultCount }} result{{ resultCount === 1 ? "" : "s" }}</template>
            </div>
            <template v-if="resultCount > 0 && 'items' in props.results[0]">
                <template v-for="(group, gIdx) in props.results as GSearchGroup<T>[]" :key="group.type">
                    <div class="g-search-group" role="group" :aria-label="group.label">
                        <slot name="group" :group="group">
                            <div class="g-search-group-label">{{ group.label }}</div>
                        </slot>
                        <div
                            v-for="(item, idx) in group.items"
                            :key="item.id"
                            :id="'g-search-option-' + item.id"
                            class="g-search-option"
                            :class="{ active: flatResults[activeIndex] && flatResults[activeIndex].id === item.id }"
                            role="option"
                            @mousedown.prevent="selectResult(item)"
                            :aria-selected="flatResults[activeIndex] && flatResults[activeIndex].id === item.id"
                        >
                            <slot name="option" :option="item">
                                {{ item.title }}
                            </slot>
                        </div>
                    </div>
                </template>
            </template>
            <template v-else-if="resultCount > 0">
                <div
                    v-for="(item, idx) in flatResults"
                    :key="item.id"
                    :id="'g-search-option-' + item.id"
                    class="g-search-option"
                    :class="{ active: activeIndex === idx }"
                    role="option"
                    @mousedown.prevent="selectResult(item)"
                    :aria-selected="activeIndex === idx"
                >
                    <slot name="option" :option="item">
                        {{ item.title }}
                    </slot>
                </div>
            </template>
        </div>
    </div>
</template>

<style>
.g-search {
    position: relative;
    min-width: 200px;
    width: 100%;
}

.g-search-form {
    display: flex;
    align-items: stretch;
}

.g-search-input {
    width: 100%;
    padding: 0.5rem 1rem;
    line-height: 1.33rem;
    font-size: 1rem;
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    border: 2px solid var(--g-primary-500);
    border-right-width: 1px;
    border-top-left-radius: var(--g-border-radius-m);
    border-bottom-left-radius: var(--g-border-radius-m);
    &:focus {
        outline: 2px solid var(--g-primary-500);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--g-info-200);
    }
}

.g-search-submit {
    background: var(--g-surface-0);
    color: var(--g-accent-700);
    border: 2px solid var(--g-primary-500);
    border-left-width: 1px;
    border-top-right-radius: var(--g-border-radius-m);
    border-bottom-right-radius: var(--g-border-radius-m);
    padding: 0.5rem 0.6rem;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    &:focus {
        outline: 2px solid var(--g-primary-500);
    }
}

.g-search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--g-surface-0);
    border: 2px solid var(--g-surface-200);
    z-index: 10;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.g-search-result-count {
    height: 28px;
    padding: 0.2rem 1rem;
    font-size: 0.95rem;
    color: var(--g-surface-900);
    background: var(--g-surface-100);
}

.g-search-group {
}

.g-search-group-label {
    font-weight: bold;
    padding: 0.5rem 1rem 0.25rem 1rem;
    color: var(--g-surface-900);
    background: var(--g-surface-100);
}

.g-search-option {
    padding: 0.3rem 0.8rem;
    cursor: pointer;
    background: var(--g-surface-0);
    color: var(--g-surface-900);
    border: 2px solid transparent;

    &:hover {
        text-decoration: underline;
    }
}

.g-search-option.active {
    background: var(--g-info-200);
    color: var(--g-primary-500);
    border: 2px solid var(--g-primary-500);
}

.fa-spin {
    color:var(--g-primary-300);
}

@media (max-width: 960px) {
    .g-search {
        min-width: 150px;
    }
}
</style>
