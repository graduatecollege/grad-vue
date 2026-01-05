<script setup lang="ts">
/**
 * A sidebar menu component for use with `GSidebar`. Displays a title and
 * a list of links.
 *
 * This component also supports showing active links for in-page navigation.
 *
 * **Props**:
 *
 * - `items` with a list of `MenuItem` objects. The objects should have:
 *   - `label` for the link text
 *   - `href` or `to` for the destination. If `to` is used, the links will
 *     be rendered as `router-link` for vue-router.
 * - `spy` to enable tracking active links for in-page navigation
 * - `offset` to adjust the active link tracking position
 * - `theme` to set the menu theme
 *
 * For tracking the active link, the `spy` prop must be set to `true` and
 * a `v-model` must be provided that has the ID of the target element (without #).
 *
 * The composable function `useActiveLinkContent` can be used to track active links.
 * It takes the following parameters:
 *
 * - `Ref<HTMLElement>` Children of this element will be observed
 * - `number` Offset from the top of the window to consider not visible
 * - `Ref<string>` Ref to store the active element ID
 *
 * The direct children of the element must all have an ID to properly work with
 * in-page navigation, and the matching menu item's `href` should be set to
 * `#<id>`.
 *
 * Here's a minimal example of a page using `useActiveLinkContent`:
 *
 * ```vue
 * <script setup lang="ts">
 * import { computed, onMounted, ref, useTemplateRef } from "vue";
 * import { useActiveLinkContent } from "@illinois-grad/grad-vue";
 *
 * const activeId = ref<string>("");
 * const main = useTemplateRef("main");
 * // onMounted is for Nuxt compatibility
 * onMounted(() => {
 *     useActiveLinkContent(main, 70, activeId);
 * });
 * &lt;/script>
 *
 * <template>
 *   <GSidebar>
 *       <GSidebarMenu
 *           :items="[
 *               { label: 'Buttons', href: '#buttons' },
 *               { label: 'More Buttons', href: '#more-buttons' }
 *           ]"
 *           v-model="activeId"
 *       />
 *   </GSidebar>
 *   <main class="main" ref="main">
 *       <section id="buttons">
 *           <h2>Buttons</h2>
 *           <p>Some buttons</p>
 *       </section>
 *       <section id="more-buttons">
 *           <h2>More Buttons</h2>
 *           <p>Some more buttons</p>
 *       </section>
 *   </main>
 * </template>
 * ```
 */

import {
    computed,
    getCurrentInstance,
    nextTick,
    onMounted,
    useTemplateRef,
    watch,
} from "vue";

type MenuItem = {
    label: string;
    href?: string;
    to?: string;
};

interface Props {
    /**
     * Title and accessible name
     */
    title?: string; // Demo: Sidebar Menu
    items: MenuItem[];
    // Offset for tracking active position to account for toolbars
    offset?: number;
    // Track active position for in-page links
    spy?: boolean;
    /**
     * Sidebar theme
     */
    theme?: "light" | "dark";
    /**
     * Use compact layout
     */
    compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    offset: 70,
    spy: true,
    theme: "light",
    compact: false
});

const activeId = defineModel<string | null>({ default: null, type: String });

const activeLink = computed(() => {
    if (props.spy && activeId.value) {
        return "#" + activeId.value;
    }
    return null;
});

const content = useTemplateRef("content");

onMounted(() => {
    watch(
        activeId,
        () => {
            nextTick(() => {
                const activeItem = content.value?.querySelector<HTMLElement>(
                    `.g-sidebar-menu__is-active`,
                );
                if (activeItem) {
                    activeItem.scrollIntoView({ block: "nearest" });
                }
            });
        },
        { immediate: true },
    );
});

// Detect vue-router without adding it as a dependency
const instance = getCurrentInstance();
const RouterLinkComp = computed<any | null>(() => {
    const comp = instance?.appContext?.components?.RouterLink as
        | any
        | undefined;
    return comp ?? null;
});

function onLinkClick(e: MouseEvent, item: MenuItem) {
    // Only handle in-page hash links here
    if (!item.href || !item.href.startsWith("#")) {
        return;
    }

    const id = item.href.slice(1);
    const el = document
        .getElementById(id)
        ?.querySelector<HTMLElement>("h2, h3, h4, h5");
    if (!el) {
        return;
    }
    e.preventDefault();
    el.setAttribute("tabindex", "-1");
    el.focus();
    el.scrollIntoView({ block: "start" });

    history.replaceState(null, "", item.href);
}
</script>

<template>
    <nav
        class="g-sidebar-menu"
        :class="[`g-sidebar-menu__${props.theme}`, { 'g-sidebar-menu--compact': props.compact }]"
        :aria-label="title || 'Sidebar navigation'"
    >
        <h2 v-if="title" class="g-sidebar-menu__title">{{ title }}</h2>
        <div class="g-sidebar-menu__divider"></div>
        <div class="g-sidebar-menu__content" ref="content">
            <ul class="g-sidebar-menu__list">
                <li
                    v-for="item in items"
                    :key="item.href || item.to"
                    class="g-sidebar-menu__item"
                    ref="listItems"
                >
                    <!-- Prefer RouterLink when available and item uses 'to' -->
                    <component
                        v-if="item.to && RouterLinkComp"
                        :is="RouterLinkComp"
                        class="g-sidebar-menu__link"
                        :to="item.to"
                    >
                        {{ item.label }}
                    </component>
                    <a
                        v-else
                        class="g-sidebar-menu__link"
                        :href="item.href || item.to || '#'"
                        :class="{
                            'g-sidebar-menu__is-active':
                                activeLink === (item.href || ''),
                        }"
                        :aria-current="
                            activeLink === (item.href || '')
                                ? 'location'
                                : undefined
                        "
                        @click="(e) => onLinkClick(e, item)"
                    >
                        {{ item.label }}
                    </a>
                </li>
            </ul>
        </div>
    </nav>
</template>

<style scoped>
.g-sidebar-menu {
    box-sizing: border-box;
    padding-top: 2rem;
    color: var(--g-surface-0);
    display: flex;
    flex-direction: column;
    max-height: 100%;
}
.g-sidebar-menu__title {
    margin: 2rem 2rem 0.5rem;
    font-size: 2rem;
    font-family: var(--il-font-heading);
    color: var(--g-surface-0);
}
.g-sidebar-menu__divider {
    margin-left: 2rem;
    margin-top: 2px;
    height: 4px;
    width: 60px;
    flex: 0 0 4px;
    background: var(--g-accent-500);
}
.g-sidebar-menu__content {
    margin: 0 0 0;
    overflow-y: auto;
}
.g-sidebar-menu__list {
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
}
.g-sidebar-menu__item {
    display: block;
    margin: 0;
}
.g-sidebar-menu__link {
    display: block;
    padding: 0.5rem calc(2rem - 8px);
    border-left: 8px solid transparent;
    color: var(--g-surface-0);
    text-decoration: none;
    font-size: 1.25rem;
    font-weight: bold;

    &:hover {
        text-decoration: underline;
        color: var(--g-accent-500);
    }

    &.g-sidebar-menu__is-active {
        background: var(--g-primary-500);
        border-left: 8px solid var(--g-accent-500);
    }

    &:focus {
        background: var(--ilw-color--focus--background);
        color: var(--ilw-color--focus--text);
    }
}
.g-sidebar-menu--compact {
    .g-sidebar-menu__link {
        padding: 0.1rem calc(2rem - 8px);
        font-size: 1.125rem;
        font-weight: 700;
    }
}

.g-sidebar-menu__light {
    background: var(--g-surface-50);

    .g-sidebar-menu__title,
    .g-sidebar-menu__link {
        color: var(--g-primary-500);
    }

    .g-sidebar-menu__link {
        &:hover {
            color: var(--g-accent-700);
        }

        &.g-sidebar-menu__is-active {
            background: var(--g-accent-500);
            color: var(--g-surface-0);
            border-left: 8px solid var(--g-primary-500);
        }

        &:focus {
            background: var(--ilw-color--focus--background);
            color: var(--ilw-color--focus--text);
        }
    }
}
</style>
