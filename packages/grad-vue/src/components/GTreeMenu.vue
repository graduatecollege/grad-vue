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
 *
 * **Keyboard navigation** (tree-view style):
 *
 * - `Up Arrow` / `Down Arrow` - move between visible menu items.
 * - `Right Arrow` - expand a collapsed item; if already expanded, move to its first child.
 * - `Left Arrow` - collapse an expanded item; if already collapsed, move focus to its
 *   parent.
 * - `Home` / `End` - jump to the first or last visible item.
 */
export default {};
</script>

<script setup lang="ts">
import { computed, nextTick, provide, reactive, ref, useId } from "vue";
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
};

const props = withDefaults(defineProps<Props>(), {
    listType: "ul",
    theme: "light",
    showExpandAll: false,
});

const id = useId();

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

/**
 * Returns the best focusable element for the given [data-tree-primary] marker.
 * If the marker contains an `<a>`, focus that. If the marker is itself a button,
 * focus that. Otherwise fall back to the marker (which should have tabindex).
 */
function getFocusTarget(primary: HTMLElement): HTMLElement {
    const anchor = primary.querySelector<HTMLElement>("a");
    if (anchor) return anchor;
    return primary;
}

/**
 * Returns all visible primary focusable items ([data-tree-primary]) inside nav.
 * Because collapsed children are removed from the DOM via v-if, only currently
 * visible items are returned.
 */
function getPrimaryItems(nav: HTMLElement): HTMLElement[] {
    return Array.from(nav.querySelectorAll<HTMLElement>("[data-tree-primary]"));
}

function handleKeydown(event: KeyboardEvent) {
    const nav = event.currentTarget as HTMLElement;
    const focused = document.activeElement as HTMLElement;
    if (!nav.contains(focused)) return;

    const handled = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (!handled.includes(event.key)) return;

    const currentLi = focused.closest<HTMLElement>(".g-tree-menu__item");
    const currentPrimary = currentLi?.querySelector<HTMLElement>("[data-tree-primary]") ?? null;

    const primaries = getPrimaryItems(nav);
    const primaryIdx = currentPrimary ? primaries.indexOf(currentPrimary) : -1;

    switch (event.key) {
        case "ArrowDown": {
            const next = primaries[primaryIdx + 1];
            if (next) getFocusTarget(next).focus();
            break;
        }
        case "ArrowUp": {
            const prev = primaries[primaryIdx - 1];
            if (prev) getFocusTarget(prev).focus();
            break;
        }
        case "ArrowRight": {
            if (!currentLi) break;
            const isExpandable = currentLi.dataset.treeExpandable === "true";
            if (!isExpandable) break;
            const isExpanded =
                currentLi.querySelector("[aria-expanded='true']") !== null;
            if (!isExpanded) {
                const toggleBtn = currentLi.querySelector<HTMLElement>(
                    ".g-tree-menu__toggle-btn",
                );
                if (toggleBtn) toggleBtn.click();
            } else {
                const next = primaries[primaryIdx + 1];
                if (next) getFocusTarget(next).focus();
            }
            break;
        }
        case "ArrowLeft": {
            if (!currentLi) break;
            const isExpanded =
                currentLi.querySelector("[aria-expanded='true']") !== null;
            if (isExpanded) {
                const toggleBtn = currentLi.querySelector<HTMLElement>(
                    ".g-tree-menu__toggle-btn",
                );
                if (toggleBtn) toggleBtn.click();
                if (currentPrimary) nextTick(() => getFocusTarget(currentPrimary).focus());
            } else {
                const parentItem =
                    currentLi.parentElement?.closest<HTMLElement>(".g-tree-menu__item");
                if (parentItem) {
                    const parentPrimary =
                        parentItem.querySelector<HTMLElement>("[data-tree-primary]");
                    if (parentPrimary) getFocusTarget(parentPrimary).focus();
                }
            }
            break;
        }
        case "Home": {
            if (primaries.length > 0) getFocusTarget(primaries[0]).focus();
            break;
        }
        case "End": {
            if (primaries.length > 0) getFocusTarget(primaries[primaries.length - 1]).focus();
            break;
        }
    }

    event.preventDefault();
}
</script>

<template>
    <nav
        class="g-tree-menu"
        :class="`g-tree-menu--${props.theme}`"
        v-bind="{
            'aria-labelledby': heading ? id : undefined,
            'aria-label': heading ? undefined : 'Tree Menu',
        }"
        @keydown="handleKeydown"
    >
        <h2 v-if="heading" :id="id" class="g-tree-menu__title">{{ heading }}</h2>
        <div class="g-tree-menu__divider"></div>
        <button
            v-if="showExpandAll"
            class="g-tree-menu__expand-all-btn"
            @click="toggleExpandAll"
        >
            <svg
                class="g-tree-menu__expand-all-icon"
                :class="{ 'g-tree-menu__expand-all-icon--collapse': allExpanded }"
                role="none presentation"
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
        <div class="g-tree-menu__content">
            <slot />
        </div>
    </nav>
</template>

<style>

@layer base {
    .g-tree-menu {
        font-size: 1.125rem;
        line-height: 1.2;
    }
}

.g-tree-menu--dark {
    color: var(--g-surface-0);

    .g-tree-menu__title {
        color: var(--g-surface-0);
    }

    .g-tree-menu__toggle-btn,
    .g-tree-menu__row-content a {
        color: var(--g-surface-0);

        &:hover {
            color: var(--g-accent-500);
        }
    }

    .g-tree-menu__expand-all-btn {
        color: var(--g-surface-0);

        &:hover {
            color: var(--g-accent-500);
        }
    }
}

.g-tree-menu--light {
    background: var(--g-surface-50);

    .g-tree-menu__title {
        color: var(--g-primary-500);
    }

    .g-tree-menu__toggle-btn,
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

    .g-tree-menu__toggle-btn:hover {
        color: var(--g-surface-0);
        background: var(--g-primary-500);
    }

    .g-tree-menu__expand-all-btn {
        color: var(--g-primary-500);

        &:hover {
            color: var(--g-accent-700);
        }
    }
}
</style>

<style scoped>
.g-tree-menu {
    box-sizing: border-box;
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
}
:deep(.g-tree-menu__row-content) {
    display: flex;
    align-items: stretch;
    flex: 1;
    padding: 0;
    margin: 4px 0;

    a {
        display: flex;
        align-items: center;
        flex: 1;
        text-decoration: none;
        color: inherit;

        &:hover {
            text-decoration: underline;
        }
    }
}

:deep(.g-tree-menu__row:not(.g-tree-menu__row--leaf) .g-tree-menu__row-content) {
    cursor: pointer;
}

.g-tree-menu__title {
    margin: 2rem 2rem 0.5rem;
    font-size: 2rem;
    font-family: var(--il-font-heading);
}

.g-tree-menu__divider {
    margin-left: 2rem;
    margin-top: 2px;
    height: 4px;
    width: 60px;
    flex: 0 0 4px;
    background: var(--g-accent-500);
}

.g-tree-menu__content {
    margin-top: 1rem;
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
    margin: 0.75rem 2rem 0;
    border-radius: 2px;
    color: inherit;
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

</style>
