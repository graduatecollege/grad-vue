<script lang="ts">
/**
 * A hierarchical sidebar menu component suitable for book-like or nested-section
 * navigation. Items with children start collapsed and can be expanded/collapsed
 * individually.
 *
 * **Props**:
 *
 * - `title` — optional heading and accessible name for the nav landmark.
 * - `items` — array of `TreeMenuItem` objects. Each item may have:
 *   - `label` — display text (required).
 *   - `href` or `to` — link destination. When `to` is provided and `vue-router`
 *     is present the link is rendered as a `<router-link>`.
 *   - `children` — nested `TreeMenuItem[]` for sub-levels (unlimited depth).
 * - `listType` — `ul` (default) or `ol`. Use `ol` for numbered
 *   hierarchies such as book chapters.
 * - `theme` — `light` (default) or `dark`.
 *
 * **Keyboard navigation** (tree-view style):
 *
 * - `↑` / `↓` — move between visible menu items.
 * - `→` — expand a collapsed item; if already expanded, move to its first child.
 * - `←` — collapse an expanded item; if already collapsed, move focus to its
 *   parent.
 * - `Home` / `End` — jump to the first or last visible item.
 */
export default {};
</script>

<script setup lang="ts">
import { nextTick, ref, useId } from "vue";
import GTreeMenuList from "./tree-menu/GTreeMenuList.vue";
import type { TreeMenuItem } from "./tree-menu/GTreeMenuList.vue";

type Props = {
    /**
     * Title and accessible name for the nav landmark
     * @demo Tree Menu
     */
    title?: string;
    /**
     * Items for the menu
     */
    items: TreeMenuItem[];
    /**
     * List element type — use `ol` for numbered hierarchies like book chapters
     * @demo
     */
    listType?: "ul" | "ol";
    /**
     * Theme
     * @demo
     */
    theme?: "light" | "dark";
};

const props = withDefaults(defineProps<Props>(), {
    listType: "ul",
    theme: "light",
});

const id = useId();
const expandedItems = ref(new Set<string>());

function toggleItem(key: string) {
    if (expandedItems.value.has(key)) {
        expandedItems.value.delete(key);
    } else {
        expandedItems.value.add(key);
    }
}

function getParentKey(key: string): string | null {
    const lastDash = key.lastIndexOf("-");
    return lastDash === -1 ? null : key.substring(0, lastDash);
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

    // Locate the <li> ancestor that owns the focused element.
    const currentLi = focused.closest<HTMLElement>("[data-tree-item-key]");
    const currentItemKey = currentLi?.dataset.treeItemKey ?? null;

    // Primary element of the current item (link, or standalone toggle button).
    const currentPrimary = currentLi?.querySelector<HTMLElement>("[data-tree-primary]") ?? null;

    const primaries = getPrimaryItems(nav);
    const primaryIdx = currentPrimary ? primaries.indexOf(currentPrimary) : -1;

    switch (event.key) {
        case "ArrowDown": {
            const next = primaries[primaryIdx + 1];
            if (next) next.focus();
            break;
        }
        case "ArrowUp": {
            const prev = primaries[primaryIdx - 1];
            if (prev) prev.focus();
            break;
        }
        case "ArrowRight": {
            if (!currentItemKey) break;
            // Only act on items that actually have children.
            const isExpandable = currentLi?.dataset.treeExpandable === "true";
            if (!isExpandable) break;
            if (!expandedItems.value.has(currentItemKey)) {
                // Expand and move focus to the first child.
                toggleItem(currentItemKey);
            } else {
                // Already expanded — move focus to first child.
                const next = primaries[primaryIdx + 1];
                if (next) next.focus();
            }
            break;
        }
        case "ArrowLeft": {
            if (!currentItemKey) break;
            if (expandedItems.value.has(currentItemKey)) {
                // Collapse and keep focus here.
                toggleItem(currentItemKey);
                currentPrimary?.focus();
            } else {
                // Move focus up to the parent item.
                const parentKey = getParentKey(currentItemKey);
                if (parentKey !== null) {
                    const parentLi = nav.querySelector<HTMLElement>(
                        `[data-tree-item-key="${parentKey}"]`,
                    );
                    const parentPrimary =
                        parentLi?.querySelector<HTMLElement>("[data-tree-primary]");
                    if (parentPrimary) parentPrimary.focus();
                }
            }
            break;
        }
        case "Home": {
            if (primaries.length > 0) primaries[0].focus();
            break;
        }
        case "End": {
            if (primaries.length > 0) primaries[primaries.length - 1].focus();
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
            'aria-labelledby': title ? id : undefined,
            'aria-label': title ? undefined : 'Tree Menu',
        }"
        @keydown="handleKeydown"
    >
        <h2 v-if="title" :id="id" class="g-tree-menu__title">{{ title }}</h2>
        <div class="g-tree-menu__divider"></div>
        <div class="g-tree-menu__content">
            <GTreeMenuList
                :items="items"
                :list-type="listType || 'ul'"
                :expanded-items="expandedItems"
                key-prefix=""
                @toggle="toggleItem"
            />
        </div>
    </nav>
</template>

<style>

@layer base {
    .g-tree-menu {
        font-size: 1.125rem;
    }
}

.g-tree-menu--dark {
    color: var(--g-surface-0);

    .g-tree-menu__title {
        color: var(--g-surface-0);
    }

    .g-tree-menu__row--toggle,
    .g-tree-menu__toggle-btn,
    .g-tree-menu__link {
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

    .g-tree-menu__row--toggle,
    .g-tree-menu__toggle-btn,
    .g-tree-menu__link {
        color: var(--g-primary-500);

        &:hover {
            color: var(--g-accent-700);
        }
        &:focus {
            color: var(--ilw-color--focus--text);
        }
    }

    .g-tree-menu__toggle-btn:hover {
        color: var(--g-surface-0);
        background: var(--g-primary-500);
    }
}
</style>

<style scoped>
.g-tree-menu {
    box-sizing: border-box;
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
    :deep(button) {
        font-size: inherit;
        font-weight: inherit;
    }
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

</style>
