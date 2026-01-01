<script setup lang="ts">
import { computed, useId } from "vue";

interface Props {
    title: string;
}

defineOptions({
    inheritAttrs: false,
});

const props = defineProps<Props>();

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const sectionId = computed(() => slugify(props.title));
const titleId = computed(() => `${sectionId.value}-title`);
</script>

<template>
    <section
        v-bind="$attrs"
        class="demo-section"
        :id="sectionId"
        :aria-labelledby="titleId"
    >
        <h2 class="demo-section__title" :id="titleId">{{ title }}</h2>
        <slot />
    </section>
</template>
