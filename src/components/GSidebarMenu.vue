<script setup lang="ts">
import {
    computed,
    getCurrentInstance,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import { useActiveLinkStore } from "../stores/activeLink.store.ts";

type MenuItem = {
    label: string;
    /** Standard link. Supports in-page links like #section-id */
    href?: string;
    /** Route path for vue-router (string only). If vue-router is not present, falls back to anchor navigation. */
    to?: string;
};

interface Props {
    title?: string;
    items: MenuItem[];
    /**
     * Pixels to offset when determining which section is active.
     * Useful if there is a fixed header.
     */
    offset?: number;
    /** Enable automatic active link tracking for in-page links */
    spy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    offset: 70,
    spy: true,
});

const activeLinkStore = useActiveLinkStore();

const activeLink = computed(() => {
    if(props.spy && activeLinkStore.activeId) {
        return "#" + activeLinkStore.activeId;
    }
    return null;
})

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
    const el = document.getElementById(id)?.querySelector<HTMLElement>("h2, h3, h4, h5");
    if (!el) {
        return;
    }
    e.preventDefault();
    el.setAttribute("tabindex", "-1");
    el.focus();

    history.replaceState(null, "", item.href);
}

</script>

<template>
    <nav class="g-sidebar-menu" :aria-label="title || 'Sidebar navigation'">
        <h2 v-if="title" class="g-sidebar-menu__title">{{ title }}</h2>
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
                        'is-active': activeLink === (item.href || '')
                    }"
                    :aria-current="activeLink === (item.href || '') ? 'location' : undefined"
                    @click="(e) => onLinkClick(e, item)"
                >
                    {{ item.label }}
                </a>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
.g-sidebar-menu {
    padding: 1rem;
    color: var(--g-surface-0);
}
.g-sidebar-menu__title {
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
    color: var(--g-surface-0);
}
.g-sidebar-menu__list {
    list-style: none;
    margin: 0;
    padding: 0;
}
.g-sidebar-menu__item + .g-sidebar-menu__item {
    margin-top: 0.25rem;
}
.g-sidebar-menu__link {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: var(--g-surface-0);
    text-decoration: none;
}
.g-sidebar-menu__link:hover,
.g-sidebar-menu__link:focus {
    text-decoration: underline;
}
.g-sidebar-menu__link.is-active {
    color: var(--g-accent-500);
    background: var(--g-primary-500);
}
</style>
