<script lang="ts">
/**
 * A hierarchical sidebar menu component suitable for book-like or nested-section
 * navigation. Items with children start collapsed and can be expanded/collapsed
 * individually.
 *
 * Links are authored directly in HTML for progressive enhancement — the page
 * works as a basic list of links even without JavaScript.
 *
 * Use `GTreeMenuList` and `GTreeMenuItem` sub-components to build the menu:
 *
 * ```vue-html
 * <GTreeMenu heading="Contents">
 *     <GTreeMenuList>
 *         <GTreeMenuItem label="Chapter 1">
 *             <a href="#ch1">Chapter 1</a>
 *             <template #children>
 *                 <GTreeMenuItem><a href="#s1">Section 1.1</a></GTreeMenuItem>
 *             </template>
 *         </GTreeMenuItem>
 *     </GTreeMenuList>
 * </GTreeMenu>
 * ```
 *
 * > [!IMPORTANT]
 * > Parent items with children render a disclosure toggle button. The default
 * > slot should still provide either a navigable link or meaningful label
 * > content for the item row.
 * >
 * > To support progressive enhancement, nested items remain visible until the
 * > component upgrades and enables collapsible behavior.
 *
 * **Props**:
 *
 * - `heading` - optional heading and accessible name for the nav landmark.
 * - `listType` - `ul` (default) or `ol`. Use `ol` for numbered
 *   hierarchies such as book chapters. Inherited by nested `GTreeMenuList`
 *   components via provide/inject.
 * - `theme` - `light` (default) or `dark`.
 * - `storageKey` - when provided, expanded/collapsed states are persisted to
 *   `sessionStorage` under this key and restored on page load. This is useful
 *   in Web Component / Drupal contexts where every page navigation is a full
 *   refresh. Item states are keyed by the item's `label` prop.
 */
export default {};
</script>

<script setup lang="ts">
import { computed, getCurrentInstance, provide, reactive, ref, useId } from "vue";
import { useSessionStorage } from "@vueuse/core";

type Props = {
    /**
     * Heading and accessible name for the nav landmark
     * @demo Tree Menu
     */
    heading?: string;
    /**
     * List element type
     * @demo
     */
    listType?: "ul" | "ol";
    /**
     * Theme
     * @demo
     */
    theme?: "light" | "dark";
    /**
     * When provided, expanded/collapsed states are saved to `sessionStorage`
     * under this key and restored on page load. Item states are keyed by each
     * the `label` prop.
     */
    storageKey?: string;
    /**
     * Show an expand/collapse all button
     * @demo
     */
    showExpandAll?: boolean;
    /**
     * Heading level for the heading element
     * @demo
     */
    headingLevel?: "h2" | "h3";
    /**
     * Render the heading in a compact style and omit the divider line
     * @demo
     */
    smallHeading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    listType: "ul",
    theme: "light",
    showExpandAll: false,
    headingLevel: "h2",
    smallHeading: false,
});
const slots = defineSlots<{
    default?: () => any;
    heading?: () => any;
}>();
const instance = getCurrentInstance();

const id = useId();

// In CE mode without Shadow DOM, named slots on the host are not exposed
// through defineSlots()/useSlots() until the corresponding <slot> renders.
// Read the parsed host slots to decide whether the heading wrapper must exist.
const ceHost = (instance as any)?.ce as any | undefined;
const hasCeHeading = ceHost?._slots?.heading?.length > 0;
const hasHeading = computed(() => !!props.heading || !!slots.heading || hasCeHeading);

provide("g-tree-menu-list-type", props.listType);

const expandedStorage = props.storageKey
    ? useSessionStorage<Record<string, boolean>>(props.storageKey, {})
    : null;

provide("g-tree-menu-expanded-storage", expandedStorage);

// --- Expand / Collapse All ---

const expandableItems = reactive(new Map<symbol, boolean>());
provide("g-tree-menu-expandable-items", expandableItems);

const expandAllSignal = ref<{ expanded: boolean; version: number }>({
    expanded: true,
    version: 0,
});
provide("g-tree-menu-expand-all-signal", expandAllSignal);

const allExpanded = computed(() => {
    if (expandableItems.size === 0) return false;
    for (const v of expandableItems.values()) {
        if (!v) return false;
    }
    return true;
});

function toggleExpandAll() {
    const target = !allExpanded.value;
    expandAllSignal.value = {
        expanded: target,
        version: expandAllSignal.value.version + 1,
    };
}
</script>

<template>
    <nav
        class="g-tree-menu"
        :class="[
            `g-tree-menu--${props.theme}`,
            { 'g-tree-menu--small-heading': smallHeading },
        ]"
        v-bind="{
            'aria-labelledby': hasHeading ? id : undefined,
            'aria-label': hasHeading ? undefined : 'Tree Menu',
        }"
    >
        <component
            :is="headingLevel"
            v-if="hasHeading"
            :id="id"
            class="g-tree-menu__title"
        >
            <slot name="heading">{{ heading }}</slot>
        </component>
        <div class="g-tree-menu__divider">
            <div
                v-if="!smallHeading"
                class="g-tree-menu__divider-line"
            ></div>
            <div v-if="showExpandAll" class="g-tree-menu__expand-all-wrapper">
                <button
                    class="g-tree-menu__expand-all-btn"
                    @click="toggleExpandAll"
                >
                    <svg
                        class="g-tree-menu__expand-all-icon"
                        :class="{
                            'g-tree-menu__expand-all-icon--collapse':
                                allExpanded,
                        }"
                        role="none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <polyline points="7 8 12 13 17 8" />
                        <polyline points="7 13 12 18 17 13" />
                    </svg>
                    {{ allExpanded ? "Collapse all" : "Expand all" }}
                </button>
            </div>
        </div>
        <div class="g-tree-menu__content">
            <slot />
        </div>
    </nav>
</template>

<style>
.g-tree-menu {
    font-size: 1.125rem;
    line-height: 1.2;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.g-tree-menu--dark {
    color: var(--g-surface-0);

    .g-tree-menu__title {
        color: var(--g-surface-0);
    }
}

.g-tree-menu--light {
    background: var(--g-surface-50);

    .g-tree-menu__title {
        color: var(--g-primary-500);
    }
}

.g-tree-menu__title {
    margin: 2rem 2rem 0;
    font-size: 2rem;
    font-family: var(--il-font-heading);
}

.g-tree-menu--small-heading .g-tree-menu__title {
    margin: 1rem 2rem 0;
    font-size: 1.25rem;
}

.g-tree-menu--small-heading .g-tree-menu__divider {
    margin-bottom: 0.5rem;
}

.g-tree-menu__divider {
    display: flex;
    justify-content: space-between;
}
.g-tree-menu__divider-line {
    margin: 1rem 0 1rem 2rem;
    height: 4px;
    width: 60px;
    min-width: 60px;
    max-width: 60px;
    background: var(--g-accent-500);
}

.g-tree-menu__expand-all-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 2rem;
}

.g-tree-menu__expand-all-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.85em;
    font-weight: 600;
    padding: 0.35em 0.5em;
    margin: 0;
    color: inherit;
    min-width: 120px;
}

.g-tree-menu__expand-all-icon {
    width: 1.2em;
    height: 1.2em;
    flex-shrink: 0;
    transition: transform 0.15s ease;

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
}

.g-tree-menu__expand-all-icon--collapse {
    transform: rotate(180deg);
}
.g-tree-menu__expand-all-btn:focus-visible {
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
    outline-color: var(--g-primary-500);
}
g-tree-menu:not(:defined) {
    display: block;
    padding-top: 0;
    color: var(--g-surface-0);

    &[theme="light"] {
        background: var(--g-surface-50);
        color: var(--g-primary-500);
    }

    &[theme="light"] a {
        color: var(--g-primary-500);
    }

    &[theme="dark"] a {
        color: var(--g-surface-0);
    }

    g-tree-menu-item {
        margin: 0.4em 0 0.4em 1.2em;
    }

    g-tree-menu-item[slot="children"] {
        font-size: 0.95em;
        font-weight: 600;
    }

    g-tree-menu-item > a {
        color: inherit;
        text-decoration: none;
    }

    g-tree-menu-item > a:hover {
        text-decoration: underline;
    }
    g-tree-menu-list {
        display: block;
        margin-top: 1em;
        padding-left: 1em;
    }
}

g-tree-menu:not(:defined)[heading]::before {
    content: attr(heading);
    display: block;
    margin: 2rem 2rem 0.5rem;
    padding-bottom: 1rem;
    font-size: 2rem;
    line-height: 1.1;
    font-family: var(--il-font-heading);
    font-weight: 700;
    background-image: linear-gradient(var(--g-accent-500), var(--g-accent-500));
    background-repeat: no-repeat;
    background-size: 60px 4px;
    background-position: left bottom;
}
</style>
