<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');

interface SearchResult {
  id: string | number;
  title: string;
}

const searchResults = ref<SearchResult[]>([
  { id: 1, title: 'Result 1' },
  { id: 2, title: 'Result 2' },
  { id: 3, title: 'Result 3' },
]);
</script>

<template>
  <div>
    <h1>GSearch Component</h1>
    
    <ComponentDemo
      name="Basic Search"
      description="A search input component with autocomplete results."
      :props-config="{
        placeholder: {
          type: 'string',
          default: 'Search...',
          label: 'Placeholder'
        }
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
        <p style="margin-top: 1rem; color: #6b7280;">Search query: {{ searchQuery }}</p>
      </template>
    </ComponentDemo>
  </div>
</template>
