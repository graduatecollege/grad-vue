<script lang="ts">
export default { name: "GTreeMenuItem" };
</script>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, ref, useSlots, watch } from "vue";
import type { Ref } from "vue";
import GTreeMenuList from "./GTreeMenuList.vue";

const props = withDefaults(
    defineProps<{
        /**
         * Accessible label used for the toggle button's aria-label when the
         * item has children (e.g. "Chapter 1" → "Chapter 1 sub-menu").
         */
        label?: string;
        /**
         * Whether the item starts expanded. Only meaningful for items that
         * have a `#children` slot. When a `storageKey` is active on the parent
         * `GTreeMenu` and a stored value exists for this item's `label`, the
         * stored value takes precedence over this prop and subsequent prop
         * updates are ignored for that item.
         * @demo
         */
        expanded?: boolean;
    }>(),
    {
        expanded: false,
    },
);

const emit = defineEmits<{
    /** Fired when the item is expanded. */
    expand: [];
    /** Fired when the item is collapsed. */
    collapse: [];
}>();

const slots = useSlots();
const instance = getCurrentInstance();

// In CE mode without Shadow DOM, useSlots() doesn't detect slot="children"
// on child elements. Fall back to checking the CE host's parsed _slots.
// This accesses Vue's internal CE implementation (VueElement._slots) which
// is stable since Vue 3.2+ but is not a public API — verify compatibility
// when upgrading Vue.
const ceHost = (instance as any)?.ce as any | undefined;
const hasCeChildren = ceHost?._slots?.children?.length > 0;

const hasChildren = computed(() => !!slots.children || hasCeChildren);

const expandedStorage = inject<Ref<Record<string, boolean>> | null>(
    "g-tree-menu-expanded-storage",
    null,
);

function resolveInitialExpanded(): boolean {
    if (expandedStorage && props.label !== undefined) {
        const stored = expandedStorage.value[props.label];
        if (stored !== undefined) return stored;
    }
    return props.expanded;
}

const isExpanded = ref(resolveInitialExpanded());

watch(
    () => props.expanded,
    (val) => {
        if (expandedStorage && props.label !== undefined) return;
        isExpanded.value = val;
    },
);

watch(isExpanded, (val) => {
    if (expandedStorage && props.label !== undefined) {
        expandedStorage.value[props.label] = val;
    }
});

function toggle() {
    isExpanded.value = !isExpanded.value;
    if (isExpanded.value) {
        emit("expand");
    } else {
        emit("collapse");
    }
}

function handleContentClick(event: MouseEvent) {
    if (!(event.target as Element).closest("a")) {
        toggle();
    }
}

function handleContentKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
        toggle();
        event.preventDefault();
    }
}
</script>

<template>
    <li
        class="g-tree-menu__item"
        :data-tree-expandable="hasChildren ? 'true' : undefined"
    >
        <!-- Parent: has children → toggle button + slot content (which may contain a link) -->
        <div v-if="hasChildren" class="g-tree-menu__row">
            <button
                class="g-tree-menu__toggle-btn"
                :aria-expanded="isExpanded ? 'true' : 'false'"
                :aria-label="label ? `${label} sub-menu` : 'Sub-menu'"
                @click="toggle"
            >
                <svg
                    class="g-tree-menu__chevron"
                    :class="{ 'g-tree-menu__chevron--expanded': isExpanded }"
                    role="none presentation"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
            <span
                class="g-tree-menu__row-content"
                tabindex="-1"
                data-tree-primary
                @click="handleContentClick"
                @keydown="handleContentKeydown"
            >
                <span class="g-tree-menu__row-content-text">
                    <slot />
                </span>
            </span>
        </div>

        <!-- Leaf: no children → just render the slot content -->
        <div v-else class="g-tree-menu__row g-tree-menu__row--leaf">
            <span class="g-tree-menu__spacer"></span>
            <span
                class="g-tree-menu__row-content"
                tabindex="-1"
                data-tree-primary
            >
                <slot />
            </span>
        </div>

        <!-- Children (shown when expanded) -->
        <GTreeMenuList v-if="hasChildren && isExpanded">
            <slot name="children" />
        </GTreeMenuList>
    </li>
</template>

<style scoped>
.g-tree-menu__item {
    display: block;
}

.g-tree-menu__row {
    display: flex;
    align-items: stretch;
}

.g-tree-menu__toggle-btn {
    flex-shrink: 0;
    align-self: center;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-sizing: border-box;
    border-radius: 2px;
    margin-right: 2px;
    font-size: inherit;
    font-weight: inherit;
}

.g-tree-menu__spacer {
    display: inline-block;
    width: 2em;
    height: 2em;
    min-width: 2em;
    min-height: 2em;
    margin-right: 2px;
    align-self: center;
}

.g-tree-menu__row-content-text {
    display: flex;
    align-items: center;
}

.g-tree-menu__chevron {
    width: 2em;
    height: 2em;
    min-width: 2em;
    min-height: 2em;
    padding: 0.35em;
    box-sizing: border-box;
    flex-shrink: 0;
    transform: rotate(0deg);
    transition: transform 0.1s ease;

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
}

.g-tree-menu__chevron--expanded {
    transform: rotate(90deg);
}

.g-tree-menu__toggle-btn:focus-visible,
.g-tree-menu__row-content:focus-visible,
:deep(.g-tree-menu__row-content a:focus-visible) {
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
    outline-color: var(--g-primary-500);
}

.g-tree-menu__row button.g-tree-menu__toggle-btn {
    &:hover {
        background: var(--g-primary-500);
        color: var(--g-surface-0);
    }
}
</style>
