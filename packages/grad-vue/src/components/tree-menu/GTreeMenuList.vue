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
                >{{ item.label }}</component>
                <a
                    v-else-if="item.href"
                    class="g-tree-menu__link"
                    :href="item.href"
                    data-tree-primary
                >{{ item.label }}</a>
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
