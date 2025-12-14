<script setup lang="ts">
import { ref } from 'vue';

const selectedValue = ref<string | number | undefined>(undefined);
const selectOptions = ref([
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]);
</script>

<template>
  <section id="select" class="demo-section">
    <h2 class="demo-section__title">GSelect</h2>
    
    <ComponentDemo
      name="Basic Select"
      description="A dropdown select component with customizable options."
    >
      <GSelect
        :model-value="selectedValue"
        @update:model-value="selectedValue = $event"
        :options="selectOptions"
        label="Select an option"
      />
      <p style="margin-top: 1rem; color: #6b7280;">Selected: {{ selectedValue }}</p>
    </ComponentDemo>

    <ComponentDemo
      name="Searchable Select"
      description="Select with search functionality to filter options."
    >
      <GSelect
        :model-value="selectedValue"
        @update:model-value="selectedValue = $event"
        :options="selectOptions"
        label="Searchable select"
        searchable
      />
    </ComponentDemo>
  </section>
</template>
