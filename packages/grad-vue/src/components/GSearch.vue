<script lang="ts">
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
 * - `submit` event is emitted with `string | null` when a search should be performed.
 *   The second argument is a `GSearchSubmitDetails` object whose `trigger` is
 *   `"auto"` for the debounced submit while typing, or `"enter"` / `"button"` when
 *   the user explicitly submits. Use an explicit submit to jump straight to an
 *   item when the query is an exact identifier (e.g., an ID number).
 * - `select` event is emitted when a user selects a result in the dropdown.
 * - `action` event is emitted with the chosen `GSearchAction` when a user
 *   activates an action in the dropdown, leaving the query and dropdown open.
 * - `close` event is emitted when the results dropdown closes.
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
 * - `actions` renders additional `GSearchAction` items
 *   (`{ id: string | number; label: string; icon?: string | false }`) in their own shaded
 *   group after the results with a decorative leading icon. They are reachable with the
 *   arrow keys, excluded from the result count, and announced to screen readers via a
 *   polite status region.
 * - `actionsLabel` customizes the label of the actions group (defaults to `"Actions"`).
 * - `actionIcon` sets default icon classes (e.g., `"fa-solid fa-arrow-right"`) for the
 *   decorative leading icon on actions, or `false` to hide it. Overridden per action by
 *   `action.icon` or by the `action-icon` slot.
 * - `auto` makes search submit on user input. Defaults to `true`.
 *   if `false`, submission happens on Enter or clicking the search button.
 * - `loading` shows a loading indicator. Use if the search may take longer.
 *
 * **Slot**: `option` customizes how a result option is rendered.
 * It receives the current item as `option`.
 *
 * **Slot**: `action` customizes how an action option is rendered.
 * It receives the current action as `action`.
 *
 * **Slot**: `action-icon` customizes the decorative leading icon for an action.
 * It receives the current action as `action`.
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
 * function submit(query: string | null) {
 *     const q = (query ?? "").toLowerCase();
 *     searchResults.value = searchData.value.filter((result) =>
 *         result.title.toLowerCase().includes(q),
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
export default {};
</script>

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
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import { useDebounceFn, useFocusWithin } from "@vueuse/core";
import GProgress from "./GProgress.vue";

export interface GSearchGroup<R> {
    type: string;
    label: string;
    items: R[];
}

export interface GSearchAction {
    id: string | number;
    label: string;
    /**
     * Optional icon classes to render a decorative leading icon before the label
     * (e.g., `"fa-solid fa-magnifying-glass"`), or `false` to hide the icon.
     */
    icon?: string | false;
}

/**
 * What caused a `submit` event:
 * - `"auto"`: debounced submit while typing (when `auto` is enabled)
 * - `"enter"`: Enter pressed in the input with no option highlighted
 * - `"button"`: the search form was submitted with the button
 */
export type GSearchSubmitTrigger = "auto" | "enter" | "button";

export interface GSearchSubmitDetails {
    trigger: GSearchSubmitTrigger;
}

type ResultEntry<R> = { kind: "result"; optionId: string; item: R };

type NavigableEntry<R> =
    | ResultEntry<R>
    | { kind: "action"; optionId: string; action: GSearchAction };

type Props = {
    results: GSearchGroup<T>[] | T[];
    /**
     * Actions shown in their own group after search results
     */
    actions?: GSearchAction[];
    /**
     * Group label for actions
     * @demo
     */
    actionsLabel?: string;
    /**
     * Default icon classes for a decorative leading icon on actions, or `false` to hide it.
     * Overridden per action by `action.icon` or by the `action-icon` slot.
     */
    actionIcon?: string | false;
    /**
     * Placeholder
     * @demo
     */
    placeholder?: string;
    /**
     * Accessible label
     * @demo
     */
    label?: string;
    /**
     * Automatic search
     * @demo
     */
    auto?: boolean;
    /**
     * Show search loading indicator
     * @demo
     */
    loading?: boolean;
};

const modelValue = defineModel<string | null>({ default: () => "" });

const props = withDefaults(defineProps<Props>(), {
    actions: () => [],
    actionsLabel: "Actions",
    actionIcon: undefined,
    placeholder: "Search...",
    label: "Search",
    auto: true,
});
const slots = defineSlots<{
    option?: (props: { option: T }) => any;
    action?: (props: { action: GSearchAction }) => any;
    "action-icon"?: (props: { action: GSearchAction }) => any;
    group?: (props: { group: GSearchGroup<T> }) => any;
}>();
const emit = defineEmits<{
    select: [result: T];
    submit: [query: string | null, details: GSearchSubmitDetails];
    action: [action: GSearchAction];
    close: [];
}>();

function showActionIcon(action: GSearchAction): boolean {
    if (action.icon === false) {
        return false;
    }
    if (action.icon || slots["action-icon"]) {
        return true;
    }
    return props.actionIcon !== false;
}

function resolvedActionIcon(action: GSearchAction): string | undefined {
    if (action.icon) {
        return action.icon;
    }
    if (props.actionIcon) {
        return props.actionIcon;
    }
    return undefined;
}

const id = useId();
const inputRef = ref<HTMLInputElement | null>(null);
const listboxRef = ref<HTMLDivElement | null>(null);
const closed = ref(true);
const activeIndex = ref<number>(-1);

const isGrouped = computed(
    () =>
        Array.isArray(props.results) &&
        props.results.length > 0 &&
        "items" in props.results[0],
);

const groupedResults = computed<GSearchGroup<T>[]>(() =>
    isGrouped.value ? (props.results as GSearchGroup<T>[]) : [],
);

// Option ids include the group index so the same item can appear in several groups.
const groupEntries = computed(() =>
    groupedResults.value.map((group, groupIndex) => ({
        group,
        entries: group.items.map(
            (item): ResultEntry<T> => ({
                kind: "result",
                optionId: `${id}-group-${groupIndex}-option-${item.id}`,
                item,
            }),
        ),
    })),
);

const nonEmptyGroupEntries = computed(() =>
    groupEntries.value.filter((g) => g.entries.length > 0),
);

const flatResults = computed<T[]>(() => {
    if (isGrouped.value) {
        return groupedResults.value.flatMap((g) => g.items);
    }
    return (props.results ?? []) as T[];
});

const resultEntries = computed<ResultEntry<T>[]>(() => {
    if (isGrouped.value) {
        return groupEntries.value.flatMap((g) => g.entries);
    }
    return flatResults.value.map((item) => ({
        kind: "result",
        optionId: `${id}-option-${item.id}`,
        item,
    }));
});

const resultCount = computed(() => flatResults.value.length);
const actionCount = computed(() => props.actions.length);

function actionOptionId(action: GSearchAction) {
    return `${id}-action-${action.id}`;
}

const navigableItems = computed<NavigableEntry<T>[]>(() => [
    ...resultEntries.value,
    ...props.actions.map((action) => ({
        kind: "action" as const,
        optionId: actionOptionId(action),
        action,
    })),
]);

const totalOptionCount = computed(() => navigableItems.value.length);

const activeEntry = computed<NavigableEntry<T> | undefined>(() =>
    activeIndex.value >= 0 && activeIndex.value < navigableItems.value.length
        ? navigableItems.value[activeIndex.value]
        : undefined,
);

const submit = useDebounceFn(() => {
    emit("submit", modelValue.value, { trigger: "auto" });
}, 300);

function submitImmediate(trigger: GSearchSubmitTrigger) {
    submit.cancel();
    emit("submit", modelValue.value, { trigger });
    closed.value = false;
}

function onFormSubmit() {
    inputRef.value?.focus();
    submitImmediate("button");
}

onBeforeUnmount(submit.cancel);

function onInput(ev: Event) {
    const value = (ev.target as HTMLInputElement).value;
    modelValue.value = value;
    if (props.auto) {
        closed.value = value.length <= 1;
    } else if (!value) {
        closed.value = true;
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

const isLoading = computed(() => props.loading);

const expanded = computed(() => focused.value && !closed.value);

watch(focused, (isFocused) => {
    if (!isFocused) {
        activeIndex.value = -1;
    }
});

watch(expanded, (isExpanded, wasExpanded) => {
    if (wasExpanded && !isExpanded) {
        emit("close");
    }
});

const resultCountText = computed(
    () => `${resultCount.value} result${resultCount.value === 1 ? "" : "s"}`,
);

const liveStatusText = computed(() => {
    if (!expanded.value || isLoading.value) {
        return "";
    }
    const scopedPart =
        groupedResults.value.length === 1 && groupedResults.value[0].label
            ? `${resultCountText.value} in ${groupedResults.value[0].label}`
            : resultCountText.value;
    if (actionCount.value > 0) {
        const actionsPart = `${actionCount.value} action${actionCount.value === 1 ? "" : "s"} available`;
        return `${scopedPart}, ${actionsPart}`;
    }
    return scopedPart;
});

function onKeydown(ev: KeyboardEvent) {
    const altKey = ev.altKey;
    if (ev.key === "ArrowDown") {
        if (!totalOptionCount.value) {
            return;
        }
        ev.preventDefault();
        closed.value = false;
        if (!altKey) {
            activeIndex.value =
                (activeIndex.value + 1) % totalOptionCount.value;
            scrollOptionIntoView();
        }
    } else if (ev.key === "ArrowUp") {
        if (!totalOptionCount.value) {
            return;
        }
        ev.preventDefault();
        closed.value = false;
        activeIndex.value =
            activeIndex.value < 0
                ? totalOptionCount.value - 1
                : (activeIndex.value - 1 + totalOptionCount.value) %
                  totalOptionCount.value;
        scrollOptionIntoView();
    } else if (ev.key === "Enter") {
        ev.preventDefault();
        if (expanded.value && activeEntry.value) {
            if (activeEntry.value.kind === "result") {
                selectResult(activeEntry.value.item);
            } else {
                triggerAction(activeEntry.value.action);
            }
        } else {
            submitImmediate("enter");
        }
    } else if (ev.key === "Escape") {
        if (expanded.value) {
            ev.preventDefault();
            closed.value = true;
            activeIndex.value = -1;
        } else if (modelValue.value) {
            ev.preventDefault();
            modelValue.value = "";
            closed.value = true;
            activeIndex.value = -1;
        }
    }

    if (["Backspace", "Delete", "Clear", "Undo"].includes(ev.key)) {
        if (!props.auto) {
            closed.value = true;
        }
        activeIndex.value = -1;
    }
}

function selectResult(result: T) {
    submit.cancel();
    emit("select", result);
    modelValue.value = "";
    closed.value = true;
    activeIndex.value = -1;
}

function triggerAction(action: GSearchAction) {
    submit.cancel();
    inputRef.value?.focus();
    emit("action", action);
}

const optionsSignature = computed(() => {
    const groupKey = groupedResults.value
        .map((g) => `${g.type}:${g.label}`)
        .join("|");
    const itemKey = navigableItems.value.map((e) => e.optionId).join("|");
    return `${groupKey}::${itemKey}`;
});

watch(optionsSignature, () => {
    activeIndex.value = -1;
});

watch(
    () => modelValue.value,
    (val) => {
        if (!val) {
            submit.cancel();
            activeIndex.value = -1;
        } else if (props.auto) {
            // Auto-submit on input change with debounce
            submit();
        }
    },
);
</script>

<template>
    <div class="g-search" role="search" :aria-label="props.label">
        <form class="g-search-form" @submit.prevent="onFormSubmit">
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
                :aria-label="props.label"
                :aria-expanded="expanded"
                aria-autocomplete="list"
                :aria-controls="`${id}-list`"
                :aria-activedescendant="
                    expanded && activeEntry ? activeEntry.optionId : undefined
                "
            />
            <button type="submit" class="g-search-submit">
                <template v-if="isLoading">
                    <GProgress size="tiny" />
                </template>
                <svg
                    role="img"
                    aria-label="Submit Search"
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
        <div
            class="ilw-sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            {{ liveStatusText }}
        </div>
        <div v-if="expanded" class="g-search-dropdown">
            <div class="g-search-result-count">
                <template v-if="!isLoading">
                    {{ resultCountText }}</template
                >
            </div>
            <div
                role="listbox"
                :id="`${id}-list`"
                ref="listboxRef"
                aria-label="Search results"
            >
                <template v-if="nonEmptyGroupEntries.length > 0">
                    <template
                        v-for="{ group, entries } in nonEmptyGroupEntries"
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
                                v-for="entry in entries"
                                :key="entry.item.id"
                                :id="entry.optionId"
                                class="g-search-option"
                                :class="{
                                    'g-search-option-active':
                                        activeEntry?.optionId ===
                                        entry.optionId,
                                }"
                                role="option"
                                @mousedown.prevent
                                @click="selectResult(entry.item)"
                                :aria-selected="
                                    activeEntry?.optionId === entry.optionId
                                "
                            >
                                <slot name="option" :option="entry.item">
                                    {{ entry.item.title }}
                                </slot>
                            </div>
                        </div>
                    </template>
                </template>
                <template v-else-if="resultCount > 0">
                    <div
                        v-for="entry in resultEntries"
                        :key="entry.item.id"
                        :id="entry.optionId"
                        class="g-search-option"
                        :class="{
                            'g-search-option-active':
                                activeEntry?.optionId === entry.optionId,
                        }"
                        role="option"
                        @mousedown.prevent
                        @click="selectResult(entry.item)"
                        :aria-selected="activeEntry?.optionId === entry.optionId"
                    >
                        <slot name="option" :option="entry.item">
                            {{ entry.item.title }}
                        </slot>
                    </div>
                </template>
                <div
                    v-if="actionCount > 0"
                    class="g-search-group g-search-actions-group"
                    role="group"
                    :aria-label="props.actionsLabel"
                >
                    <div class="g-search-group-label">
                        {{ props.actionsLabel }}
                    </div>
                    <div
                        v-for="action in props.actions"
                        :key="action.id"
                        :id="actionOptionId(action)"
                        class="g-search-option g-search-action"
                        :class="{
                            'g-search-option-active':
                                activeEntry?.optionId ===
                                actionOptionId(action),
                        }"
                        role="option"
                        @mousedown.prevent
                        @click="triggerAction(action)"
                        :aria-selected="
                            activeEntry?.optionId === actionOptionId(action)
                        "
                    >
                        <slot name="action" :action="action">
                            <span
                                v-if="showActionIcon(action)"
                                class="g-search-action-icon"
                                aria-hidden="true"
                            >
                                <slot name="action-icon" :action="action">
                                    <span
                                        v-if="resolvedActionIcon(action)"
                                        :class="
                                            resolvedActionIcon(action) +
                                            ' g-search-action-icon-span'
                                        "
                                    ></span>
                                    <svg
                                        v-else
                                        role="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 640"
                                    >
                                        <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
                                        <path
                                            fill="currentColor"
                                            d="M566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3C348.8 149.8 348.8 170.1 361.3 182.6L466.7 288L96 288C78.3 288 64 302.3 64 320C64 337.7 78.3 352 96 352L466.7 352L361.3 457.4C348.8 469.9 348.8 490.2 361.3 502.7C373.8 515.2 394.1 515.2 406.6 502.7L566.6 342.7z"
                                        />
                                    </svg>
                                </slot>
                            </span>
                            <span class="g-search-action-label">
                                {{ action.label }}
                            </span>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
g-search {
    display: block;
}

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
        outline-color: var(--ilw-color--focus--outline);
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
    border-top: 1px solid var(--g-surface-200);
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

.g-search-actions-group {
    background: var(--g-surface-100);
    border-top: 2px solid var(--g-surface-200);
    padding: 0.15rem 0 0.25rem;
}

.g-search-actions-group .g-search-group-label {
    border-top: none;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--g-surface-700);
    padding: 0.35rem 1rem 0.15rem 1rem;
}

.g-search-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.35rem 0.8rem;
    background: var(--g-surface-100);
    color: var(--g-primary-300);
    font-weight: 700;

    &:has(.g-search-action-icon):hover {
        text-decoration: none;

        .g-search-action-label {
            text-decoration: underline;
        }
    }

    &:hover:not(.g-search-option-active) {
        color: var(--g-accent-700);
    }
}

.g-search-action-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1em;
    height: 1em;
    flex: 0 0 auto;

    > svg,
    > img {
        width: 1em;
        height: 1em;
        display: block;
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
