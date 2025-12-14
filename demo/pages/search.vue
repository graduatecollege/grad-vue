<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');
</script>

<template>
  <div>
    <h1>GSearch Component</h1>
    
    <ComponentDemo
      name="Basic Search"
      description="A search input component with search icon."
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
          v-model="searchQuery"
          :placeholder="props.placeholder"
        />
        <p style="margin-top: 1rem; color: #6b7280;">Search query: {{ searchQuery }}</p>
      </template>
    </ComponentDemo>
  </div>
</template>
