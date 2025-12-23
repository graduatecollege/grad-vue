<script setup lang="ts" >
import { computed, getCurrentInstance } from "vue";

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
    theme?: "light" | "dark";
}

const props = withDefaults(defineProps<Props>(), {
    offset: 70,
    spy: true,
    theme: "dark",
});

const activeId = defineModel<string | null>({ default: null, type: String });

const activeLink = computed(() => {
    if (props.spy && activeId.value) {
        return "#" + activeId.value;
    }
    return null;
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
        :class="`g-sidebar-menu__${props.theme}`"
        :aria-label="title || 'Sidebar navigation'"
    >
        <h2 v-if="title" class="g-sidebar-menu__title">{{ title }}</h2>
        <div class="g-sidebar-menu__divider"></div>
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
    </nav>
</template>

<style scoped>
.g-sidebar-menu {
    color: var(--g-surface-0);
}
.g-sidebar-menu__title {
    margin: 0 2rem 0.5rem;
    font-size: 2rem;
    font-family: var(--il-font-heading);
    color: var(--g-surface-0);
}
.g-sidebar-menu__divider {
    margin-left: 2rem;
    height: 4px;
    width: 60px;
    background: var(--g-accent-500);
}
.g-sidebar-menu__list {
    list-style: none;
    margin: 1rem 0;
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
