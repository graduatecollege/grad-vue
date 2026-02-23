<script
    setup
    lang="ts"
    generic="
        T extends {
            id: string | number;
            title: string;
        }
    "
>
/**
 * A combobox-style search that shows a list of results as an auto
 * complete dropdown.
 *
 * The component doesn't perform any real searching. It emits events
 * that can be used to trigger searches, and then the results are
 * passed back to the component.
 *
 * **Events**:
 *
 * - `submit` event is emitted when a search should be performed.
 * - `select` event is submitted when a user makes a selection
 *   in the dropdown.
 *
 * > [!NOTE]
 * > The `v-model` value should *not* be used to trigger a search,
 * > but it can be used to get the current user input.
 *
 * **Props**:
 *
 * - `results` will be rendered in the dropdown. There are two options:
 *   - Pass an array of objects that extend `{ id: string | number; title: string; }`.
 *   - Pass an array of `GSearchGroup<T>` objects, where the `items` property extends the above type.
 *     In this case the results are grouped.
 * - `auto` makes search submit on user input. Defaults to `true`.
 *   if `false`, submission happens on Enter or clicking the search button.
 * - `loading` shows a loading indicator. Use if the search may take longer.
 *
 * **Slot**: `option` customizes how an option is rendered.
 * It receives the current item as `option`.
 *
 * **Slot**: `group` customizes the group label for each group.
 *
 * Here is a minimal implementation:
 *
 * ```vue
 * <script setup lang="ts">
 * interface SearchResult {
 *     id: string;
 *     title: string;
 * }
 *
 * const searchData = ref<SearchResult[]>([
 *     { id: "1", title: "The Quick Fox" },
 *     { id: "2", title: "The Lazy Dog" },
 *     { id: "3", title: "The Brown Bear" },
 * ]);
 * const searchResults = ref<SearchResult[]>([]);
 *
 * function submit(query: string) {
 *     searchResults.value = searchData.value.filter((result) =>
 *         result.title.toLowerCase().includes(query.toLowerCase()),
 *     );
 * }
 * function selected(item: SearchResult) {
 *     console.log("Selected:", item);
 * }
 * &lt;/script>
 * <template>
 *     <GSearch
 *         :results="searchResults"
 *         @submit="submit"
 *         @select="selected">
 *     </GSearch>
 * </template>
 * ```
 */
import { computed, nextTick, ref, useId, watch } from "vue";
import { useDebounceFn, useFocusWithin } from "@vueuse/core";
import GProgress from "./GProgress.vue";

export interface GSearchGroup<R> {
    type: string;
    label: string;
    items: R[];
}

type Props = {
    results: GSearchGroup<T>[] | T[];
    /**
     * Placeholder
     */
    placeholder?: string;
    /**
     * Accessible label
     */
    label?: string;
    /**
     * Automatic search
     */
    auto?: boolean;
    /**
     * Show search loading indicator
     */
    loading?: boolean;
};

const modelValue = defineModel<string | null>({ default: () => "" });

const props = withDefaults(defineProps<Props>(), {
    placeholder: "Search...",
    label: "Search",
    auto: true
});
const emit = defineEmits(["select", "submit"]);

const inputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLDivElement | null>(null);
const closed = ref(true);
const activeIndex = ref<number>(-1);
const flatResults = computed(() => {
    if (
        Array.isArray(props.results) &&
        props.results.length &&
        "items" in props.results[0]
    ) {
        // Grouped results
        return (props.results as GSearchGroup<T>[]).flatMap((g) => g.items);
    } else {
        return props.results as T[];
    }
});
const resultCount = computed(() => flatResults.value.length);

function onInput(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    modelValue.value = value;
    if (props.auto && value.length > 1) {
        closed.value = false;
    }
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
    const altKey = ev.altKey;
    if (ev.key === "ArrowDown") {
        if (!resultCount.value) {
            return;
        }
        ev.preventDefault();
        closed.value = false;
        if (!altKey) {
            activeIndex.value = (activeIndex.value + 1) % resultCount.value;
            scrollOptionIntoView();
        }
    } else if (ev.key === "ArrowUp") {
        if (!resultCount.value) {
            return;
        }
        ev.preventDefault();
        closed.value = false;
        activeIndex.value =
            (activeIndex.value - 1 + resultCount.value) % resultCount.value;
        scrollOptionIntoView();
    } else if (ev.key === "Enter") {
        if (closed.value) {
            // Don't debounce on enter
            emit("submit", modelValue.value);
            closed.value = false;
            ev.preventDefault();
        } else {
            selectResult(flatResults.value[activeIndex.value]);
        }
    } else if (ev.key === "Escape") {
        if (!resultCount.value) {
            return;
        }
        ev.preventDefault();
        if (!expanded.value) {
            modelValue.value = "";
        }
        closed.value = true;
        activeIndex.value = -1;
    }

    if (["Backspace", "Delete", "Clear", "Undo"].includes(ev.key)) {
        closed.value = true;
    }
}

function selectResult(result: T | null) {
    emit("select", result);
    modelValue.value = "";
    closed.value = true;
    activeIndex.value = -1;
}

const isLoading = computed(() => {
    return !!props.loading;
});

const expanded = computed(() => {
    return focused.value && !closed.value;
});

const submit = useDebounceFn(() => {
    emit("submit", modelValue.value);
}, 300);

watch(
    () => modelValue.value,
    (val) => {
        if (!val) {
            activeIndex.value = -1;
        } else if (props.auto) {
            // Auto-submit on input change with debounce
            submit();
        }
    },
);
const id = useId();
</script>

<template>
    <div class="g-search" role="search" :aria-label="props.label">
        <form class="g-search-form" @submit.prevent="selectResult(null)">
            <input
                ref="inputRef"
                class="g-search-input"
                name="search"
                type="search"
                :placeholder="props.placeholder"
                :value="modelValue"
                @input="onInput"
                @keydown="onKeydown"
                role="combobox"
                :aria-expanded="expanded"
                aria-autocomplete="list"
                :aria-controls="`${id}-list`"
                :aria-activedescendant="
                    activeIndex >= 0
                        ? 'g-search-option-' + flatResults[activeIndex].id
                        : undefined
                "
            />
            <button
                type="submit"
                class="g-search-submit"
                aria-label="Submit search"
                @keydown="onKeydown"
            >
                <template v-if="isLoading">
                    <GProgress size="tiny" />
                </template>
                <svg
                    role="img"
                    aria-label="Search"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 51.26 51.26"
                >
                    <path
                        fill="currentColor"
                        d="M30 9.76A14.05 14.05 0 1 0 28.3 31l11.3 13a3.34 3.34 0 0 0 4.72-4.72L31.44 27.86A14.05 14.05 0 0 0 30 9.76ZM27.27 27a10.26 10.26 0 1 1 0-14.5 10.25 10.25 0 0 1 0 14.5Z"
                    />
                </svg>
            </button>
        </form>
        <div v-if="expanded" class="g-search-dropdown">
            <div aria-live="polite" class="g-search-result-count">
                <template v-if="!isLoading">
                    {{ resultCount }} result{{
                        resultCount === 1 ? "" : "s"
                    }}</template
                >
            </div>
            <div
                role="listbox"
                :id="`${id}-list`"
                ref="listboxRef"
                aria-label="Search results"
            >
                <template v-if="resultCount > 0 && 'items' in props.results[0]">
                    <template
                        v-for="(
                            group, gIdx
                        ) in props.results as GSearchGroup<T>[]"
                        :key="group.type"
                    >
                        <div
                            class="g-search-group"
                            role="group"
                            :aria-label="group.label"
                        >
                            <slot name="group" :group="group">
                                <div class="g-search-group-label">
                                    {{ group.label }}
                                </div>
                            </slot>
                            <div
                                v-for="(item, idx) in group.items"
                                :key="item.id"
                                :id="'g-search-option-' + item.id"
                                class="g-search-option"
                                :class="{
                                    'g-search-option-active':
                                        flatResults[activeIndex] &&
                                        flatResults[activeIndex].id === item.id,
                                }"
                                role="option"
                                @mousedown.prevent="selectResult(item)"
                                :aria-selected="
                                    flatResults[activeIndex] &&
                                    flatResults[activeIndex].id === item.id
                                "
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
                        :class="{
                            'g-search-option-active': activeIndex === idx,
                        }"
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
    box-sizing: border-box;
    background: var(--g-surface-0);
    color: var(--g-accent-700);
    border: 2px solid var(--g-primary-500);
    border-left-width: 1px;
    border-top-right-radius: var(--g-border-radius-m);
    border-bottom-right-radius: var(--g-border-radius-m);
    padding: 0.2rem 0.5rem;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    &:focus {
        color: var(--ilw-color--focus--text);
        background: var(--ilw-color--focus--background);
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

.g-search-option.g-search-option-active {
    background: var(--g-info-200);
    color: var(--g-primary-500);
    border: 2px solid var(--g-primary-500);
}

.fa-spin {
    color: var(--g-primary-300);
}

@media (max-width: 960px) {
    .g-search {
        min-width: 150px;
    }
}
</style>
