<script lang="ts">
export default { name: "GTreeMenuList" };
</script>

<script setup lang="ts">
import { computed, getCurrentInstance } from "vue";

export type TreeMenuItem = {
    label: string;
    href?: string;
    to?: string;
    children?: TreeMenuItem[];
};

const props = defineProps<{
    items: TreeMenuItem[];
    listType: "ul" | "ol";
    expandedItems: Set<string>;
    keyPrefix: string;
}>();

const emit = defineEmits<{
    toggle: [key: string];
}>();

const instance = getCurrentInstance();
const RouterLinkComp = computed<any | null>(() => {
    const comp = instance?.appContext?.components?.RouterLink as any | undefined;
    return comp ?? null;
});

function itemKey(i: number): string {
    return `${props.keyPrefix}${i}`;
}

function isExpanded(i: number): boolean {
    return props.expandedItems.has(itemKey(i));
}

function toggle(i: number) {
    emit("toggle", itemKey(i));
}
</script>

<template>
    <component :is="listType" class="g-tree-menu__list">
        <li
            v-for="(item, i) in items"
            :key="i"
            class="g-tree-menu__item"
            :data-tree-item-key="itemKey(i)"
            :data-tree-expandable="item.children ? 'true' : undefined"
        >
            <button
                v-if="item.children && !item.href && !item.to"
                class="g-tree-menu__row g-tree-menu__row--toggle"
                :aria-expanded="isExpanded(i) ? 'true' : 'false'"
                data-tree-primary
                @click="toggle(i)"
            >
                <svg
                    class="g-tree-menu__chevron"
                    :class="{ 'g-tree-menu__chevron--expanded': isExpanded(i) }"
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
                <span>{{ item.label }}</span>
            </button>
            <div v-else-if="item.children" class="g-tree-menu__row">
                <button
                    class="g-tree-menu__toggle-btn"
                    :aria-expanded="isExpanded(i) ? 'true' : 'false'"
                    :aria-label="`${item.label} sub-menu`"
                    @click="toggle(i)"
                    tabindex="-1"
                >
                    <svg
                        class="g-tree-menu__chevron"
                        :class="{ 'g-tree-menu__chevron--expanded': isExpanded(i) }"
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
                <component
                    v-if="item.to && RouterLinkComp"
                    :is="RouterLinkComp"
                    class="g-tree-menu__link"
                    :aria-expanded="isExpanded(i) ? 'true' : 'false'"
                    :to="item.to"
                    data-tree-primary
                >{{ item.label }}</component>
                <a
                    v-else
                    class="g-tree-menu__link"
                    :aria-expanded="isExpanded(i) ? 'true' : 'false'"
                    :href="item.href"
                    data-tree-primary
                >{{ item.label }}</a>
            </div>
            <div v-else class="g-tree-menu__row g-tree-menu__row--leaf">
                <component
                    v-if="item.to && RouterLinkComp"
                    :is="RouterLinkComp"
                    class="g-tree-menu__link"
                    :to="item.to"
                    data-tree-primary
                >
                    <span class="g-tree-menu__spacer"></span>{{ item.label }}
                </component>
                <a
                    v-else-if="item.href"
                    class="g-tree-menu__link"
                    :href="item.href"
                    data-tree-primary
                >
                    <span class="g-tree-menu__spacer"></span>{{ item.label }}
                </a>
                <span v-else class="g-tree-menu__label">{{ item.label }}</span>
            </div>
            <GTreeMenuList
                v-if="item.children && isExpanded(i)"
                :items="item.children"
                :list-type="listType"
                :expanded-items="expandedItems"
                :key-prefix="itemKey(i) + '-'"
                @toggle="emit('toggle', $event)"
            />
        </li>
    </component>
</template>

<style scoped>

.g-tree-menu__list{
    list-style: none;
    margin: 0;
    padding: 0;
    font-weight: bold;

    ul, ol {
        font-weight: 600 !important;
    }
}

.g-tree-menu__list .g-tree-menu__list{
    padding-left: 1.25em;
}

.g-tree-menu__item{
    display: block;
    margin: 0;
}

.g-tree-menu__row{
    display: flex;
    align-items: center;
}

.g-tree-menu__row--toggle{
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    text-align: left;
    font-family: inherit;

    & > .g-tree-menu__chevron {
        margin-right: 2px;
    }
}

.g-tree-menu__toggle-btn{
    flex-shrink: 0;
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

    &:hover {
        background: var(--g-primary-500);
        color: var(--g-surface-0);
    }
}

.g-tree-menu__spacer {
    display: inline-block;
    width: 2em;
    height: 2em;
    margin-right: 2px;
}

.g-tree-menu__link{
    display: flex;
    align-items: center;
    flex: 1;
    padding: 0;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
}

.g-tree-menu__label{
    display: block;
    padding: 0.5em;
}

.g-tree-menu__chevron{
    width: 2em;
    height: 2em;
    padding: 0.35em;
    box-sizing: border-box;
    flex-shrink: 0;
    transform: rotate(0deg);
    transition: transform 0.1s ease;

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
}

.g-tree-menu__chevron--expanded{
    transform: rotate(90deg);
}

.g-tree-menu__row--toggle:focus-visible,
.g-tree-menu__toggle-btn:focus-visible,
.g-tree-menu__link:focus-visible {
    background: var(--ilw-color--focus--background);
    color: var(--ilw-color--focus--text);
}
</style>