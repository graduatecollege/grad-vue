<script setup lang="ts">
import { computed, ref } from "vue";
import ComponentSection from "../ComponentSection.vue";
import ComponentDemo from "../ComponentDemo.vue";
import DemoResult from "../DemoResult.vue";
import GSearch from "../../../src/components/GSearch.vue";

const searchQuery = ref("");
const select = ref("");
const searchLoading = ref(false);

interface SearchResult {
    id: string;
    title: string;
}

const searchData = ref<SearchResult[]>([
    { id: "1", title: "The Quick Fox" },
    { id: "2", title: "The Lazy Dog" },
    { id: "3", title: "The Brown Bear" },
    { id: "4", title: "The Quick Brown Fox" },
    { id: "5", title: "The Quick Brown Fox Jumps Over The Lazy Dog" },
]);
const searchResults = ref<SearchResult[]>([]);

function submit(query: string) {
    searchLoading.value = true;
    setTimeout(() => {
        searchResults.value = searchData.value.filter((result) =>
            result.title.toLowerCase().includes(query.toLowerCase()),
        );
        searchLoading.value = false;
    }, 1000);
}
function selected(item: SearchResult) {
    console.log("Selected:", item);
    select.value = item.title;
}
</script>

<template>
    <ComponentSection title="Search">
        <ComponentDemo
            name="Basic Search"
            description="A search input component with autocomplete results."
            component="GSearch"
            :props-config="{
                placeholder: {
                    type: 'string',
                    label: 'Placeholder',
                    default: 'Search...'
                },
                label: {
                    type: 'string',
                    label: 'Accessible label',
                    default: 'Search'
                },
                auto: {
                    type: 'boolean',
                    label: 'Automatic search'
                }
            }"
        >
            <template #docs></template>
            <template #default="{ props }">
                <GSearch
                    v-bind="props"
                    v-model="searchQuery"
                    @submit="submit"
                    @select="selected"
                    :results="searchResults"
                    :loading="searchLoading"
                />
                <DemoResult label="Search query">{{ searchQuery }}</DemoResult>
                <DemoResult label="Selected result">{{ select }}</DemoResult>
            </template>
        </ComponentDemo>
    </ComponentSection>
</template>
