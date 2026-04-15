<script lang="ts">
export default { name: "GTreeMenuItem" };
</script>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted, onUpdated, ref, useId, useSlots, watch } from "vue";
import type { Ref } from "vue";
import GTreeMenuList from "./GTreeMenuList.vue";

const props = withDefaults(
    defineProps<{
        /**
         * Label for the item. Used as a stable identifier for the item.
         * @demo
         '
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

const id = useId();

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
        if (expandedStorage.value[props.label] === true) return true;
        if (props.expanded) {
            expandedStorage.value[props.label] = true;
        }
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
        if (val) {
            expandedStorage.value[props.label] = true;
        } else {
            delete expandedStorage.value[props.label];
        }
    }
    updateSlotAria();
});

const contentRef = ref<HTMLElement | null>(null);

function updateSlotAria() {
    if (!hasChildren.value || !contentRef.value) return;
    const focusable = contentRef.value.querySelector("a, button");
    if (focusable) {
        focusable.setAttribute("aria-controls", id + "-children");
        focusable.setAttribute("aria-expanded", isExpanded.value ? "true" : "false");
    } else {
        console.warn("No focusable element found for GTreeMenuItem with label:", props.label, "Every item must at least have a plain button to properly work for accessibility.");
    }
}

onMounted(updateSlotAria);
onUpdated(updateSlotAria);

function toggle() {
    isExpanded.value = !isExpanded.value;
    if (isExpanded.value) {
        emit("expand");
    } else {
        emit("collapse");
    }
}

// --- Expand / Collapse All registration ---

const itemId = Symbol();
const expandableItems = inject<Map<symbol, boolean> | null>(
    "g-tree-menu-expandable-items",
    null,
);
const expandAllSignal = inject<Ref<{ expanded: boolean; version: number }> | null>(
    "g-tree-menu-expand-all-signal",
    null,
);
const lastProcessedVersion = ref(0);

function registerItem() {
    if (expandableItems && hasChildren.value) {
        expandableItems.set(itemId, isExpanded.value);
    }
}

function unregisterItem() {
    expandableItems?.delete(itemId);
}

watch(isExpanded, (val) => {
    if (expandableItems && hasChildren.value) {
        expandableItems.set(itemId, val);
    }
});

if (expandAllSignal) {
    watch(
        () => expandAllSignal.value.version,
        () => {
            if (!hasChildren.value) return;
            isExpanded.value = expandAllSignal.value.expanded;
            lastProcessedVersion.value = expandAllSignal.value.version;
        },
    );
}

onMounted(() => {
    registerItem();
    if (
        expandAllSignal &&
        hasChildren.value &&
        expandAllSignal.value.version > lastProcessedVersion.value &&
        expandAllSignal.value.expanded
    ) {
        isExpanded.value = true;
        lastProcessedVersion.value = expandAllSignal.value.version;
    }
});

onBeforeUnmount(() => {
    unregisterItem();
});

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
            <div
                class="g-tree-menu__toggle-btn"
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
            </div>
            <span
                ref="contentRef"
                class="g-tree-menu__row-content"
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
                data-tree-primary
            >
                <slot />
            </span>
        </div>

        <!-- Children (shown when expanded) -->
        <GTreeMenuList v-if="hasChildren && isExpanded" :id="id + '-children'">
            <slot name="children" />
        </GTreeMenuList>
    </li>
</template>

<style>
g-tree-menu-item,
.g-tree-menu__item {
    display: block;
}

g-tree-menu-item > a {
    color: inherit;
    display: flex;
    align-items: flex-start;
    text-decoration: none;
}

g-tree-menu-item > a:hover {
    text-decoration: underline;
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

.g-tree-menu__row-content {
    display: flex;
    align-items: stretch;
    flex: 1;
    padding: 0 0.5em 0 0;
    box-sizing: border-box;

    button, a {
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        padding: 2px 0;
        margin: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        flex: 1;
        text-decoration: none;
        height: 100%;

        &:hover {
            text-decoration: underline;
        }
    }
}

.g-tree-menu__row:not(.g-tree-menu__row--leaf) .g-tree-menu__row-content {
    cursor: pointer;
}

.g-tree-menu__row-content-text {
    flex: 1;
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
.g-tree-menu__row-content a:focus-visible,
.g-tree-menu__row-content button:focus-visible{
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
    outline-color: var(--g-primary-500);
}

.g-tree-menu__row .g-tree-menu__toggle-btn {
    &:hover {
        background: var(--g-primary-500);
        color: var(--g-surface-0);
    }
}

.g-tree-menu--dark {
    .g-tree-menu__toggle-btn,
    .g-tree-menu__row-content a {
        color: var(--g-surface-0);

        &:hover {
            color: var(--g-accent-500);
        }
    }
}

.g-tree-menu--light {
    .g-tree-menu__row-content,
    .g-tree-menu__row-content a {
        color: var(--g-primary-500);

        &:hover {
            color: var(--g-accent-700);
        }
        &:focus-visible {
            color: var(--ilw-color--focus--text);
        }
    }
}

</style>
