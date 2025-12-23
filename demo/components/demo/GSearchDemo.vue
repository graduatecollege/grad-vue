<script setup lang="ts">
import { ref } from "vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import { GSearch } from "@illinois-grad/grad-vue";

const searchQuery = ref("");
interface SearchResult {
    id: string | number;
    title: string;
}
const searchResults = ref<SearchResult[]>([
    { id: 1, title: "Result 1" },
    { id: 2, title: "Result 2" },
    { id: 3, title: "Result 3" },
]);
</script>

<template>
    <section id="search" class="demo-section">
        <h2 class="demo-section__title">Search</h2>

        <ComponentDemo
            name="Basic Search"
            description="A search input component with autocomplete results."
            component="GSearch"
            :props-config="{
                placeholder: {
                    type: 'string',
                    default: 'Search...',
                    label: 'Placeholder',
                },
            }"
        >
            <template #default="{ props }">
                <GSearch
                    :model-value="searchQuery"
                    @update:model-value="searchQuery = $event"
                    :placeholder="props.placeholder"
                    :results="searchResults"
                    @select="(item) => console.log('Selected:', item)"
                />
                <DemoResult label="Search query">{{ searchQuery }}</DemoResult>
            </template>
        </ComponentDemo>
    </section>
</template>
