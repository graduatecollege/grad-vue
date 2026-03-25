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
            <!--
                Parent item with no href/to:
                The entire row is a toggle button containing the chevron + label.
            -->
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
                    aria-hidden="true"
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

            <!--
                Parent item with href/to:
                A small chevron toggle button + a separate navigable link.
            -->
            <div v-else-if="item.children" class="g-tree-menu__row">
                <button
                    class="g-tree-menu__toggle-btn"
                    :aria-expanded="isExpanded(i) ? 'true' : 'false'"
                    :aria-label="`${isExpanded(i) ? 'Collapse' : 'Expand'} ${item.label}`"
                    @click="toggle(i)"
                >
                    <svg
                        class="g-tree-menu__chevron"
                        :class="{ 'g-tree-menu__chevron--expanded': isExpanded(i) }"
                        aria-hidden="true"
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
                    :to="item.to"
                    data-tree-primary
                >{{ item.label }}</component>
                <a
                    v-else
                    class="g-tree-menu__link"
                    :href="item.href"
                    data-tree-primary
                >{{ item.label }}</a>
            </div>

            <!-- Leaf item -->
            <div v-else class="g-tree-menu__row g-tree-menu__row--leaf">
                <component
                    v-if="item.to && RouterLinkComp"
                    :is="RouterLinkComp"
                    class="g-tree-menu__link"
                    :to="item.to"
                    data-tree-primary
                >
                    <span class="g-tree-menu__spacer"></span>
                    {{ item.label }}</component>
                <a
                    v-else-if="item.href"
                    class="g-tree-menu__link"
                    :href="item.href"
                    data-tree-primary
                >

                    <span class="g-tree-menu__spacer"></span>
                    {{ item.label }}</a>
                <span v-else class="g-tree-menu__label">{{ item.label }}</span>
            </div>

            <!-- Recursive children list, shown only when expanded -->
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
}

.g-tree-menu__list .g-tree-menu__list{
    padding-left: 1.25rem;
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
    gap: 0.25rem;
    padding: 0.5rem calc(2rem - 8px);
    border-left: 8px solid transparent;
    text-align: left;
    font-size: 1.125rem;
    font-weight: bold;
    font-family: inherit;
}

.g-tree-menu__toggle-btn{
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem 0.25rem 0.25rem;
    margin-left: calc(2rem - 8px);
    border-radius: 2px;
}

.g-tree-menu__spacer {
    display: inline-block;
    width: 1.125rem;
    height: 1rem;
}

.g-tree-menu__link{
    display: block;
    flex: 1;
    padding: 0.5rem 0.5rem 0.5rem 0.25rem;
    text-decoration: none;
    font-size: 1.125rem;
    font-weight: bold;

    &:hover {
        text-decoration: underline;
    }

    /* When the row has no toggle button, add the left indent */
    .g-tree-menu__row--leaf & {
        padding-left: calc(2rem - 8px);
        border-left: 8px solid transparent;
    }
}

.g-tree-menu__label{
    display: block;
    padding: 0.5rem calc(2rem - 8px);
    font-size: 1.125rem;
}

.g-tree-menu__chevron{
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    transform: rotate(0deg);
    transition: transform 0.15s ease;
}

.g-tree-menu__chevron--expanded{
    transform: rotate(90deg);
}

.g-tree-menu__row--toggle:focus,
.g-tree-menu__toggle-btn:focus,
.g-tree-menu__link:focus {
    outline: none;
    background: var(--ilw-color--focus--background, #ffd700);
    color: var(--ilw-color--focus--text, #000);
}
</style>